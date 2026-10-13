import { describe, it, expect, beforeAll } from 'vitest';
import { getDb } from '../src/db/index';
import { seedDatabase } from '../src/db/seed';
import { createNovaMcpServer, NOVA_TOOLS } from '../src/mcp/server';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

describe('MCP Server: Project-Scoped Tools & Context Delivery', () => {
  let dbHelper: any;
  let server: ReturnType<typeof createNovaMcpServer>;

  beforeAll(async () => {
    dbHelper = await getDb(':memory:');
    await seedDatabase(dbHelper);
    server = createNovaMcpServer(dbHelper);
  });

  it('exposes all declared MCP tools', async () => {
    expect(NOVA_TOOLS.map((t) => t.name)).toEqual([
      'get_design_system',
      'get_tokens',
      'get_token',
      'list_components',
      'check_compliance',
      'generate_code',
      'import_figma_variables',
      'propose_token_changes',
    ]);
  });

  it('enforces multi-tenant authorization when credentials are missing or invalid', async () => {
    // Calling tool with invalid workspace/project should return error
    const handler = (server as any)._requestHandlers.get(CallToolRequestSchema.shape.method.value);
    const result = await handler({
      method: 'tools/call',
      params: {
        name: 'get_tokens',
        arguments: {
          workspaceId: 'invalid-workspace',
          projectId: 'invalid-project',
        },
      },
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('not found in workspace');
  });

  it('retrieves design system metadata via get_design_system', async () => {
    const handler = (server as any)._requestHandlers.get(CallToolRequestSchema.shape.method.value);
    const result = await handler({
      method: 'tools/call',
      params: {
        name: 'get_design_system',
        arguments: {
          workspaceId: 'ws-acme-corp',
          projectId: 'proj-core-web',
        },
      },
    });

    expect(result.isError).toBeUndefined();
    const data = JSON.parse(result.content[0].text);
    expect(data.name).toBe('Nova Design System');
    expect(data.version).toBe('1.2.0');
  });

  it('retrieves tokens filtered by category via get_tokens', async () => {
    const handler = (server as any)._requestHandlers.get(CallToolRequestSchema.shape.method.value);
    const result = await handler({
      method: 'tools/call',
      params: {
        name: 'get_tokens',
        arguments: {
          workspaceId: 'ws-acme-corp',
          projectId: 'proj-core-web',
          category: 'color',
        },
      },
    });

    expect(result.isError).toBeUndefined();
    const data = JSON.parse(result.content[0].text);
    expect(data.count).toBeGreaterThan(0);
    expect(data.tokens.every((t: any) => t.category === 'color')).toBe(true);
  });

  it('inspects a specific token via get_token', async () => {
    const handler = (server as any)._requestHandlers.get(CallToolRequestSchema.shape.method.value);
    const result = await handler({
      method: 'tools/call',
      params: {
        name: 'get_token',
        arguments: {
          workspaceId: 'ws-acme-corp',
          projectId: 'proj-core-web',
          tokenPath: 'color.brand.primary',
        },
      },
    });

    expect(result.isError).toBeUndefined();
    const data = JSON.parse(result.content[0].text);
    expect(data.path).toBe('color.brand.primary');
    expect(data.isAlias).toBe(true);
    expect(data.resolvedValue).toBe('#3b82f6');
  });

  it('lists registered UI components with props and token dependencies', async () => {
    const handler = (server as any)._requestHandlers.get(CallToolRequestSchema.shape.method.value);
    const result = await handler({
      method: 'tools/call',
      params: {
        name: 'list_components',
        arguments: {
          workspaceId: 'ws-acme-corp',
          projectId: 'proj-core-web',
        },
      },
    });

    expect(result.isError).toBeUndefined();
    const data = JSON.parse(result.content[0].text);
    expect(data.count).toBeGreaterThanOrEqual(2);
    const button = data.components.find((c: any) => c.name === 'Button');
    expect(button).toBeDefined();
    expect(button.props.length).toBeGreaterThan(0);
  });

  it('evaluates compliance via check_compliance', async () => {
    const handler = (server as any)._requestHandlers.get(CallToolRequestSchema.shape.method.value);
    const result = await handler({
      method: 'tools/call',
      params: {
        name: 'check_compliance',
        arguments: {
          workspaceId: 'ws-acme-corp',
          projectId: 'proj-core-web',
          codeContent: 'const bad = { background: "#3b82f6" };',
          filePath: 'Button.tsx',
        },
      },
    });

    expect(result.isError).toBeUndefined();
    const report = JSON.parse(result.content[0].text);
    expect(report.totalFindings).toBeGreaterThan(0);
    expect(report.findings[0].ruleId).toBe('RULE-001-HARDCODED-COLOR');
  });

  it('generates code deterministically via generate_code', async () => {
    const handler = (server as any)._requestHandlers.get(CallToolRequestSchema.shape.method.value);
    const result = await handler({
      method: 'tools/call',
      params: {
        name: 'generate_code',
        arguments: {
          workspaceId: 'ws-acme-corp',
          projectId: 'proj-core-web',
          format: 'css',
        },
      },
    });

    expect(result.isError).toBeUndefined();
    const generated = JSON.parse(result.content[0].text);
    expect(generated.filename).toBe('tokens.css');
    expect(generated.content).toContain('--color-brand-primary');
  });
});
