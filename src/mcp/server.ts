import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { eq, and } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { designSystems, tokens, components, projects, workspaces } from '../db/schema.js';
import { AuditEngine } from '../core/audit/engine.js';
import { FlatToken } from '../core/tokens/types.js';
import { exportToCss } from '../core/exporters/css.js';
import { exportToJson } from '../core/exporters/json.js';
import { exportToTypeScript } from '../core/exporters/typescript.js';
import { exportToTailwind } from '../core/exporters/tailwind.js';

const auditEngine = new AuditEngine();

export const NOVA_TOOLS: Tool[] = [
  {
    name: 'get_design_system',
    description: 'Retrieve design system information, name, and current version for a project.',
    inputSchema: {
      type: 'object',
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
    description: 'Deterministically generate production code artifacts (CSS custom properties, JSON, TypeScript, Tailwind) from design tokens.',
    inputSchema: {
      type: 'object',
      properties: {
        workspaceId: { type: 'string', description: 'The workspace ID' },
        projectId: { type: 'string', description: 'The project ID' },
        format: {
          type: 'string',
          enum: ['css', 'json', 'typescript', 'tailwind'],
          description: 'Target export format',
        },
        prefix: { type: 'string', description: 'Optional prefix for token variables' },
      },
      required: ['workspaceId', 'projectId', 'format'],
    },
  },
];

export function createNovaMcpServer(dbHelper?: any) {
  const server = new Server(
    {
      name: 'novadesign-mcp-server',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: NOVA_TOOLS };
  });

  // Call tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const { db } = dbHelper ? dbHelper : await getDb();

    // Verify workspace and project access
    const workspaceId = args?.workspaceId as string;
    const projectId = args?.projectId as string;

    if (!workspaceId || !projectId) {
      return {
        isError: true,
        content: [{ type: 'text', text: 'Missing required workspaceId or projectId.' }],
      };
    }

    // Verify project belongs to workspace
    const projectRecord = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId)))
      .limit(1);

    if (!projectRecord || projectRecord.length === 0) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Project "${projectId}" not found in workspace "${workspaceId}".` }],
      };
    }

    // Get active design system for project
    const dsRecord = await db
      .select()
      .from(designSystems)
      .where(eq(designSystems.projectId, projectId))
      .limit(1);

    if (!dsRecord || dsRecord.length === 0) {
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

// Auto-run if executed directly
if (process.argv[1]?.endsWith('server.ts') || process.argv[1]?.endsWith('server.js')) {
  runStdioServer().catch((err) => {
    console.error('Fatal MCP Server error:', err);
    process.exit(1);
  });
}
