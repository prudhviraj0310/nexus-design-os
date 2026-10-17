import { Server } from '@modelcontextprotocol/sdk/server/index';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { eq, and } from 'drizzle-orm';
import { getDb } from '../db/index';
import {
  designSystems, tokens, components, projects, workspaces, dataContexts, agentFeedback,
  docPages, assets, releases, deliveryPipelines, dataSources, backgroundJobs,
} from '../db/schema';
import { AuditEngine } from '../core/audit/engine';
import { FlatToken, TokenCategory } from '../core/tokens/types';
import { exportToCss } from '../core/exporters/css';
import { exportToJson } from '../core/exporters/json';
import { exportToTypeScript } from '../core/exporters/typescript';
import { exportToTailwind, exportToTailwindV4 } from '../core/exporters/tailwind';
import { exportToSwift } from '../core/exporters/swift';
import { exportToKotlin } from '../core/exporters/kotlin';
import { FigmaClient } from '../core/figma/client';
import { mapFigmaVariablesToDTCG } from '../core/figma/mapper';
import { computeTokenDiff } from '../core/figma/diff';
import { resolveTokenAliases } from '../core/tokens/resolver';
import { validateTokens } from '../core/tokens/validator';

const auditEngine = new AuditEngine();

export const NOVA_TOOLS: Tool[] = [
  {
    name: 'get_design_system',
    description: 'Retrieve design system information, name, and current version for a project.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspaceId: { type: 'string', description: 'The workspace ID for tenant scoping' },
        projectId: { type: 'string', description: 'The project ID' },
      },
      required: ['workspaceId', 'projectId'],
    },
  },
  {
    name: 'get_tokens',
    description: 'Retrieve design tokens for a project, optionally filtered by category (color, spacing, typography, etc.).',
    inputSchema: {
      type: 'object',
      properties: {
        workspaceId: { type: 'string', description: 'The workspace ID' },
        projectId: { type: 'string', description: 'The project ID' },
        category: { type: 'string', description: 'Optional category filter (e.g. "color", "spacing")' },
      },
      required: ['workspaceId', 'projectId'],
    },
  },
  {
    name: 'get_token',
    description: 'Inspect a specific design token by path (e.g. "color.brand.primary"), including its alias chain and resolved value.',
    inputSchema: {
      type: 'object',
      properties: {
        workspaceId: { type: 'string', description: 'The workspace ID' },
        projectId: { type: 'string', description: 'The project ID' },
        tokenPath: { type: 'string', description: 'The token path (e.g. "color.brand.primary")' },
      },
      required: ['workspaceId', 'projectId', 'tokenPath'],
    },
  },
  {
    name: 'list_components',
    description: 'List reusable UI components, their React TypeScript props, variants, and design token dependencies.',
    inputSchema: {
      type: 'object',
      properties: {
        workspaceId: { type: 'string', description: 'The workspace ID' },
        projectId: { type: 'string', description: 'The project ID' },
        category: { type: 'string', description: 'Optional component category filter' },
      },
      required: ['workspaceId', 'projectId'],
    },
  },
  {
    name: 'check_compliance',
    description: 'Audit code snippet or file against design system rules (detects hardcoded colors, unregistered tokens, deprecated tokens).',
    inputSchema: {
      type: 'object',
      properties: {
        workspaceId: { type: 'string', description: 'The workspace ID' },
        projectId: { type: 'string', description: 'The project ID' },
        codeContent: { type: 'string', description: 'Source code content to analyze' },
        filePath: { type: 'string', description: 'File path for reporting location' },
      },
      required: ['workspaceId', 'projectId', 'codeContent'],
    },
  },
  {
    name: 'generate_code',
    description: 'Deterministically generate production code artifacts (CSS, JSON, TypeScript, Tailwind, Swift, Kotlin) from design tokens.',
    inputSchema: {
      type: 'object',
      properties: {
        workspaceId: { type: 'string', description: 'The workspace ID' },
        projectId: { type: 'string', description: 'The project ID' },
        format: {
          type: 'string',
          enum: ['css', 'json', 'typescript', 'tailwind', 'tailwind4', 'tailwind-v4', 'swift', 'kotlin'],
          description: 'Target export format',
        },
        prefix: { type: 'string', description: 'Optional prefix for token variables' },
      },
      required: ['workspaceId', 'projectId', 'format'],
    },
  },
  {
    name: 'import_figma_variables',
    description: 'Import or preview Figma design variables into the design system and compute the conflict diff.',
    inputSchema: {
      type: 'object',
      properties: {
        workspaceId: { type: 'string', description: 'The workspace ID' },
        projectId: { type: 'string', description: 'The project ID' },
        fileKey: { type: 'string', description: 'Figma file key' },
        modeName: { type: 'string', description: 'Mode name (e.g. "Light")' },
        dryRun: { type: 'boolean', description: 'If true, returns preview diff without saving' },
      },
      required: ['workspaceId', 'projectId', 'fileKey'],
    },
  },
  {
    name: 'propose_token_changes',
    description: 'Propose adding or updating a design token in the system with path, value, and category.',
    inputSchema: {
      type: 'object',
      properties: {
        workspaceId: { type: 'string', description: 'The workspace ID' },
        projectId: { type: 'string', description: 'The project ID' },
        tokenPath: { type: 'string', description: 'Token path (e.g. "color.feedback.warning")' },
        rawValue: { type: 'string', description: 'Raw value (e.g. "#f59e0b" or alias "{color.brand.accent}")' },
        category: { type: 'string', description: 'Token category' },
        description: { type: 'string', description: 'Token description' },
      },
      required: ['workspaceId', 'projectId', 'tokenPath', 'rawValue', 'category'],
    },
  },
  {
    name: 'list_contexts',
    description: 'List persisted AI data contexts available to a workspace and project.',
    inputSchema: {
      type: 'object',
      properties: {
        workspaceId: { type: 'string' },
        projectId: { type: 'string' },
      },
      required: ['workspaceId'],
    },
  },
  {
    name: 'get_context',
    description: 'Retrieve a scoped AI data context including rules and included resources.',
    inputSchema: {
      type: 'object',
      properties: {
        workspaceId: { type: 'string' },
        projectId: { type: 'string' },
        contextId: { type: 'string' },
      },
      required: ['workspaceId', 'contextId'],
    },
  },
  {
    name: 'submit_agent_feedback',
    description: 'Record a missing guideline, token, component, or other agent-context gap for remediation.',
    inputSchema: {
      type: 'object',
      properties: {
        workspaceId: { type: 'string' },
        projectId: { type: 'string' },
        contextId: { type: 'string' },
        category: { type: 'string' },
        message: { type: 'string' },
      },
      required: ['workspaceId', 'category', 'message'],
    },
  },
  ...([
    ['list_documentation', 'List published documentation pages for a design system.'],
    ['get_documentation_page', 'Retrieve one documentation page by slug.'],
    ['list_assets', 'List registered design-system assets.'],
    ['list_releases', 'List immutable design-system releases.'],
    ['list_pipelines', 'List configured delivery pipelines.'],
    ['list_data_sources', 'List connected source integrations.'],
    ['list_background_jobs', 'List background jobs for a workspace.'],
    ['create_feedback_job', 'Create a background remediation job from agent feedback.'],
    ['resolve_context_resources', 'Resolve context rules into available tokens, components, docs, and assets.'],
    ['get_design_tokens_by_type', 'List tokens filtered by DTCG type.'],
  ] as Array<[string, string]>).map(([name, description]) => ({
    name,
    description,
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspaceId: { type: 'string' },
        projectId: { type: 'string' },
        designSystemId: { type: 'string' },
        contextId: { type: 'string' },
        slug: { type: 'string' },
        type: { type: 'string' },
      },
      required: ['workspaceId', ...([
        'list_documentation',
        'get_documentation_page',
        'list_assets',
        'list_releases',
        'list_pipelines',
        'resolve_context_resources',
        'get_design_tokens_by_type',
      ].includes(name) ? ['projectId'] : [])],
    },
  })),
];

export function createNovaMcpServer(dbHelper?: any) {
  const server = new Server(
    {
      name: 'novadesign-mcp-server',
      version: '0.2.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: NOVA_TOOLS };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const { db } = dbHelper ? dbHelper : await getDb();

    const workspaceId = args?.workspaceId as string;
    const projectId = args?.projectId as string;
    const workspaceScopedTools = new Set([
      'list_contexts',
      'get_context',
      'submit_agent_feedback',
      'list_data_sources',
      'list_background_jobs',
      'create_feedback_job',
    ]);

    if (!workspaceId || (!workspaceScopedTools.has(name) && !projectId)) {
      return {
        isError: true,
        content: [{ type: 'text', text: workspaceScopedTools.has(name)
          ? 'Missing required workspaceId.'
          : 'Missing required workspaceId or projectId.' }],
      };
    }

    const projectRecord = projectId ? await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId)))
      .limit(1) : [];

    if (!workspaceScopedTools.has(name) && (!projectRecord || projectRecord.length === 0)) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Project "${projectId}" not found in workspace "${workspaceId}".` }],
      };
    }

    const dsRecord = projectId ? await db
      .select()
      .from(designSystems)
      .where(eq(designSystems.projectId, projectId))
      .limit(1) : [];

    if (!workspaceScopedTools.has(name) && (!dsRecord || dsRecord.length === 0)) {
      return {
        isError: true,
        content: [{ type: 'text', text: `No design system found for project "${projectId}".` }],
      };
    }

    const ds = dsRecord[0];

    switch (name) {
      case 'get_design_system': {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  id: ds.id,
                  name: ds.name,
                  version: ds.version,
                  description: ds.description,
                  projectId,
                  workspaceId,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_tokens': {
        const categoryFilter = args?.category as string | undefined;
        let query = db.select().from(tokens).where(eq(tokens.designSystemId, ds.id));
        const allTokens = await query;
        const filtered = categoryFilter
          ? allTokens.filter((t: any) => t.category === categoryFilter)
          : allTokens;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  count: filtered.length,
                  tokens: filtered.map((t: any) => ({
                    path: t.path,
                    name: t.name,
                    category: t.category,
                    type: t.type,
                    rawValue: t.rawValue,
                    resolvedValue: t.resolvedValue,
                    isAlias: t.isAlias,
                    aliasTarget: t.aliasTarget,
                    isDeprecated: t.isDeprecated,
                  })),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_token': {
        const tokenPath = args?.tokenPath as string;
        const result = await db
          .select()
          .from(tokens)
          .where(and(eq(tokens.designSystemId, ds.id), eq(tokens.path, tokenPath)))
          .limit(1);

        if (!result || result.length === 0) {
          return {
            isError: true,
            content: [{ type: 'text', text: `Token "${tokenPath}" not found in design system.` }],
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(result[0], null, 2) }],
        };
      }

      case 'list_components': {
        const categoryFilter = args?.category as string | undefined;
        const allComponents = await db
          .select()
          .from(components)
          .where(eq(components.designSystemId, ds.id));

        const filtered = categoryFilter
          ? allComponents.filter((c: any) => c.category === categoryFilter)
          : allComponents;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  count: filtered.length,
                  components: filtered,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'check_compliance': {
        const codeContent = args?.codeContent as string;
        const filePath = (args?.filePath as string) || 'snippet.tsx';

        const dbTokens = await db
          .select()
          .from(tokens)
          .where(eq(tokens.designSystemId, ds.id));

        const flatTokens: FlatToken[] = dbTokens.map((t: any) => ({
          name: t.name,
          path: t.path,
          category: t.category,
          type: t.type,
          rawValue: t.rawValue,
          resolvedValue: t.resolvedValue,
          isAlias: t.isAlias,
          aliasTarget: t.aliasTarget || undefined,
          isDeprecated: t.isDeprecated,
          description: t.description || undefined,
        }));

        const report = auditEngine.auditFile({
          filePath,
          content: codeContent,
          tokens: flatTokens,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(report, null, 2),
            },
          ],
        };
      }

      case 'generate_code': {
        const format = args?.format as string;
        const prefix = args?.prefix as string | undefined;

        const dbTokens = await db
          .select()
          .from(tokens)
          .where(eq(tokens.designSystemId, ds.id));

        const flatTokens: FlatToken[] = dbTokens.map((t: any) => ({
          name: t.name,
          path: t.path,
          category: t.category,
          type: t.type,
          rawValue: t.rawValue,
          resolvedValue: t.resolvedValue,
          isAlias: t.isAlias,
          aliasTarget: t.aliasTarget || undefined,
          isDeprecated: t.isDeprecated,
        }));

        let generated;
        switch (format) {
          case 'css':
            generated = exportToCss(flatTokens, { prefix });
            break;
          case 'json':
            generated = exportToJson(flatTokens);
            break;
          case 'typescript':
            generated = exportToTypeScript(flatTokens);
            break;
          case 'tailwind':
            generated = exportToTailwind(flatTokens, { prefix });
            break;
          case 'tailwind4':
          case 'tailwind-v4':
            generated = exportToTailwindV4(flatTokens, { prefix });
            break;
          case 'swift':
            generated = exportToSwift(flatTokens, { prefix });
            break;
          case 'kotlin':
            generated = exportToKotlin(flatTokens, { prefix });
            break;
          default:
            return {
              isError: true,
              content: [{ type: 'text', text: `Unsupported format: "${format}"` }],
            };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(generated, null, 2),
            },
          ],
        };
      }

      case 'import_figma_variables': {
        const fileKey = args?.fileKey as string;
        const modeName = (args?.modeName as string) || 'Light';
        const dryRun = Boolean(args?.dryRun);

        const client = new FigmaClient();
        const rawPayload = await client.getVariables({ fileKey, modeName, dryRun });
        const mapped = mapFigmaVariablesToDTCG(rawPayload, modeName);
        const { tokens: resolvedIncoming } = resolveTokenAliases(mapped);

        const dbTokens = await db.select().from(tokens).where(eq(tokens.designSystemId, ds.id));
        const flatExisting: FlatToken[] = dbTokens.map((t: any) => ({
          name: t.name,
          path: t.path,
          category: t.category,
          type: t.type,
          rawValue: t.rawValue,
          resolvedValue: t.resolvedValue,
          isAlias: t.isAlias,
          aliasTarget: t.aliasTarget || undefined,
          isDeprecated: t.isDeprecated,
        }));

        const diff = computeTokenDiff(flatExisting, resolvedIncoming);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                fileKey,
                modeName,
                totalVariablesFound: mapped.length,
                diff,
              }, null, 2),
            },
          ],
        };
      }

      case 'propose_token_changes': {
        const tokenPath = args?.tokenPath as string;
        const rawValue = args?.rawValue as string;
        const category = args?.category as string;
        const description = args?.description as string | undefined;

        if (!tokenPath || !rawValue || !category) {
          return {
            isError: true,
            content: [{ type: 'text', text: 'Missing required parameters: tokenPath, rawValue, and category are required.' }],
          };
        }

        const isAlias = rawValue.startsWith('{') && rawValue.endsWith('}');
        const aliasTarget = isAlias ? rawValue.slice(1, -1).trim() : null;

        // Validate token format before mutating database
        const validation = validateTokens([
          {
            name: tokenPath.split('.').pop() || tokenPath,
            path: tokenPath,
            category: category as TokenCategory,
            type: category === 'color' ? 'color' : 'dimension',
            rawValue,
            resolvedValue: rawValue,
            isAlias,
            aliasTarget: aliasTarget || undefined,
            isDeprecated: false,
          },
        ]);

        if (!validation.valid) {
          return {
            isError: true,
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: false,
                    error: 'Token validation failed',
                    errors: validation.errors,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        const tokenId = `tok-${tokenPath.replace(/\./g, '-')}`;
        await db
          .insert(tokens)
          .values({
            id: tokenId,
            designSystemId: ds.id,
            name: tokenPath.split('.').pop() || tokenPath,
            path: tokenPath,
            category,
            type: category === 'color' ? 'color' : 'dimension',
            rawValue,
            resolvedValue: rawValue,
            isAlias,
            aliasTarget,
            description: description || null,
          })
          .onConflictDoUpdate({
            target: tokens.id,
            set: {
              rawValue,
              resolvedValue: rawValue,
              isAlias,
              aliasTarget,
              category,
              description: description || null,
            },
          });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Token "${tokenPath}" updated in design system.`,
                path: tokenPath,
                rawValue,
              }, null, 2),
            },
          ],
        };
      }

      case 'list_contexts': {
        const contextRows = await db.select().from(dataContexts).where(eq(dataContexts.workspaceId, workspaceId));
        return {
          content: [{ type: 'text', text: JSON.stringify({
            count: contextRows.length,
            contexts: contextRows.filter((context: any) => !args?.projectId || context.projectId === args.projectId || context.projectId === null),
          }, null, 2) }],
        };
      }

      case 'get_context': {
        const contextId = args?.contextId as string;
        const contextRows = await db.select().from(dataContexts).where(
          and(eq(dataContexts.id, contextId), eq(dataContexts.workspaceId, workspaceId))
        ).limit(1);
        if (!contextRows[0]) {
          return { isError: true, content: [{ type: 'text', text: `Context "${contextId}" not found.` }] };
        }
        return { content: [{ type: 'text', text: JSON.stringify(contextRows[0], null, 2) }] };
      }

      case 'submit_agent_feedback': {
        const category = args?.category as string;
        const message = args?.message as string;
        if (!category || !message) {
          return { isError: true, content: [{ type: 'text', text: 'category and message are required.' }] };
        }
        const id = `feedback-${Date.now().toString(36)}`;
        await db.insert(agentFeedback).values({
          id,
          workspaceId,
          contextId: (args?.contextId as string) || null,
          category,
          message,
          metadata: { projectId },
        });
        return { content: [{ type: 'text', text: JSON.stringify({ success: true, id, status: 'open' }) }] };
      }

      case 'list_documentation': {
        const pages = await db.select().from(docPages).where(eq(docPages.designSystemId, ds.id));
        return { content: [{ type: 'text', text: JSON.stringify({ count: pages.length, pages }, null, 2) }] };
      }
      case 'get_documentation_page': {
        const slug = args?.slug as string;
        const pages = await db.select().from(docPages).where(and(eq(docPages.designSystemId, ds.id), eq(docPages.slug, slug))).limit(1);
        if (!pages[0]) return { isError: true, content: [{ type: 'text', text: `Documentation page "${slug}" not found.` }] };
        return { content: [{ type: 'text', text: JSON.stringify(pages[0], null, 2) }] };
      }
      case 'list_assets': {
        const rows = await db.select().from(assets).where(eq(assets.designSystemId, ds.id));
        return { content: [{ type: 'text', text: JSON.stringify({ count: rows.length, assets: rows }, null, 2) }] };
      }
      case 'list_releases': {
        const rows = await db.select().from(releases).where(eq(releases.designSystemId, ds.id));
        return { content: [{ type: 'text', text: JSON.stringify({ count: rows.length, releases: rows }, null, 2) }] };
      }
      case 'list_pipelines': {
        const rows = await db.select().from(deliveryPipelines).where(eq(deliveryPipelines.designSystemId, ds.id));
        return { content: [{ type: 'text', text: JSON.stringify({ count: rows.length, pipelines: rows }, null, 2) }] };
      }
      case 'list_data_sources': {
        const rows = await db.select().from(dataSources).where(eq(dataSources.workspaceId, workspaceId));
        return { content: [{ type: 'text', text: JSON.stringify({ count: rows.length, dataSources: rows }, null, 2) }] };
      }
      case 'list_background_jobs': {
        const rows = await db.select().from(backgroundJobs).where(eq(backgroundJobs.workspaceId, workspaceId));
        return { content: [{ type: 'text', text: JSON.stringify({ count: rows.length, jobs: rows }, null, 2) }] };
      }
      case 'create_feedback_job': {
        const id = `agent-job-${Date.now().toString(36)}`;
        await db.insert(backgroundJobs).values({
          id,
          workspaceId,
          type: 'feedback.remediation',
          payload: { contextId: args?.contextId || null, projectId, requestedBy: 'mcp' },
        });
        return { content: [{ type: 'text', text: JSON.stringify({ success: true, id, status: 'queued' }) }] };
      }
      case 'resolve_context_resources': {
        const contextId = args?.contextId as string;
        const contextRows = await db.select().from(dataContexts).where(and(eq(dataContexts.id, contextId), eq(dataContexts.workspaceId, workspaceId))).limit(1);
        if (!contextRows[0]) return { isError: true, content: [{ type: 'text', text: `Context "${contextId}" not found.` }] };
        const [contextTokens, contextComponents, contextDocs, contextAssets] = await Promise.all([
          db.select().from(tokens).where(eq(tokens.designSystemId, ds.id)),
          db.select().from(components).where(eq(components.designSystemId, ds.id)),
          db.select().from(docPages).where(eq(docPages.designSystemId, ds.id)),
          db.select().from(assets).where(eq(assets.designSystemId, ds.id)),
        ]);
        const mergeRules = (base: Record<string, any>, overlay: Record<string, any>) => {
          const merged = { ...base, ...overlay };
          for (const key of ['tokenPaths', 'tokenTypes', 'tokenCategories', 'componentNames', 'componentStatuses', 'documentationSlugs', 'assetNames']) {
            const values = [...(Array.isArray(base[key]) ? base[key] : []), ...(Array.isArray(overlay[key]) ? overlay[key] : [])];
            if (values.length > 0) merged[key] = [...new Set(values)];
          }
          return merged;
        };
        const contextChain: any[] = [];
        const seenContextIds = new Set<string>();
        let currentContext: any = contextRows[0];
        while (currentContext && !seenContextIds.has(currentContext.id)) {
          seenContextIds.add(currentContext.id);
          contextChain.unshift(currentContext);
          if (!currentContext.parentContextId) break;
          const parentRows = await db.select().from(dataContexts)
            .where(and(eq(dataContexts.id, currentContext.parentContextId), eq(dataContexts.workspaceId, workspaceId))).limit(1);
          currentContext = parentRows[0];
        }
        const rules = contextChain.reduce(
          (merged, context) => mergeRules(merged, (context.rules || {}) as Record<string, any>),
          {} as Record<string, any>,
        );
        const pathMatches = (value: string, patterns?: unknown) => {
          if (!Array.isArray(patterns) || patterns.length === 0) return true;
          return patterns.some((pattern) => {
            if (typeof pattern !== 'string') return false;
            const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*');
            return new RegExp(`^${escaped}$`, 'i').test(value);
          });
        };
        const filteredTokens = contextTokens.filter((token: any) =>
          pathMatches(token.path, rules.tokenPaths) &&
          (!Array.isArray(rules.tokenTypes) || rules.tokenTypes.length === 0 || rules.tokenTypes.includes(token.type)) &&
          (!Array.isArray(rules.tokenCategories) || rules.tokenCategories.length === 0 || rules.tokenCategories.includes(token.category))
        );
        const filteredComponents = contextComponents.filter((component: any) =>
          pathMatches(component.name, rules.componentNames) &&
          (!Array.isArray(rules.componentStatuses) || rules.componentStatuses.length === 0 || rules.componentStatuses.includes(component.status))
        );
        const filteredDocs = contextDocs.filter((page: any) =>
          pathMatches(page.slug, rules.documentationSlugs) &&
          (rules.includeDrafts === true || page.isPublished)
        );
        const filteredAssets = contextAssets.filter((asset: any) => pathMatches(asset.name, rules.assetNames));
        return { content: [{ type: 'text', text: JSON.stringify({
          context: contextRows[0],
          rulesApplied: rules,
          resources: { tokens: filteredTokens, components: filteredComponents, documentation: filteredDocs, assets: filteredAssets },
        }, null, 2) }] };
      }
      case 'get_design_tokens_by_type': {
        const type = args?.type as string;
        const rows = await db.select().from(tokens).where(and(eq(tokens.designSystemId, ds.id), eq(tokens.type, type)));
        return { content: [{ type: 'text', text: JSON.stringify({ count: rows.length, tokens: rows }, null, 2) }] };
      }

      default:
        return {
          isError: true,
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
        };
    }
  });

  return server;
}

export async function runStdioServer() {
  const server = createNovaMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('NovaDesign MCP Server running on Stdio');
}

if (process.argv[1]?.endsWith('server.ts') || process.argv[1]?.endsWith('server.js')) {
  runStdioServer().catch((err) => {
    console.error('Fatal MCP Server error:', err);
    process.exit(1);
  });
}
