import { NextResponse } from 'next/server';
import { getDb } from '@/db/index';
import { createNovaMcpServer, NOVA_TOOLS } from '@/mcp/server';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { validateApiAuth } from '@/server/auth';

export async function GET(request: Request) {
  const auth = validateApiAuth(request);
  if (!auth.authorized) return auth.errorResponse!;

  return NextResponse.json({
    tools: NOVA_TOOLS,
  });
}

export async function POST(request: Request) {
  try {
    const auth = validateApiAuth(request);
    if (!auth.authorized) return auth.errorResponse!;

    const body = await request.json();
    
    // Support JSON-RPC 2.0 tools/list
    if (body.method === 'tools/list' || (!body.toolName && !body.params?.name && body.method !== 'tools/call')) {
      return NextResponse.json({
        jsonrpc: '2.0',
        id: body.id || 1,
        result: { tools: NOVA_TOOLS },
        tools: NOVA_TOOLS,
      });
    }

    // Support both direct { toolName, args } and standard JSON-RPC 2.0 { params: { name, arguments } }
    let rawToolName = body.toolName || body.params?.name;
    let args = { ...(body.args || body.params?.arguments || {}) };

    if (!rawToolName) {
      return NextResponse.json(
        { success: false, error: 'Missing toolName or params.name in MCP request' },
        { status: 400 }
      );
    }

    // Normalize tool aliases
    let toolName = rawToolName;
    if (toolName === 'audit_code') toolName = 'check_compliance';
    if (toolName === 'export_tokens') toolName = 'generate_code';
    if (toolName === 'get_components') toolName = 'list_components';
    if (toolName === 'resolve_alias') toolName = 'get_token';

    // Normalize parameter aliases
    if (args.code && !args.codeContent) args.codeContent = args.code;
    if (args.alias && !args.tokenPath) {
      args.tokenPath = args.alias.replace(/^\{|\}$/g, '').trim();
    }

    const dbHelper = await getDb();
    const server = createNovaMcpServer(dbHelper);

    // Map adcn / my-design-system aliases to primary database project
    const rawWorkspace = args.workspaceId || 'adcn';
    const rawProject = args.projectId || 'my-design-system';

    const workspaceId = rawWorkspace === 'adcn' || rawWorkspace === 'acme-corp' ? 'ws-acme-corp' : rawWorkspace;
    const projectId = rawProject === 'my-design-system' || rawProject === 'core-web' ? 'proj-core-web' : rawProject;

    const handler = (server as any)._requestHandlers.get(CallToolRequestSchema.shape.method.value);
    const mcpResponse = await handler({
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: {
          ...args,
          workspaceId,
          projectId,
        },
      },
    });

    return NextResponse.json({
      jsonrpc: '2.0',
      id: body.id || 1,
      success: !mcpResponse.isError,
      result: mcpResponse,
      mcpResponse,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
