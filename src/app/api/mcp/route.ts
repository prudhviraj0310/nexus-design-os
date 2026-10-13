import { NextResponse } from 'next/server';
import { getDb } from '@/db/index';
import { createNovaMcpServer, NOVA_TOOLS } from '@/mcp/server';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

export async function GET() {
  return NextResponse.json({
    tools: NOVA_TOOLS,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { toolName, args = {} } = body;

    const dbHelper = await getDb();
    const server = createNovaMcpServer(dbHelper);

    const handler = (server as any)._requestHandlers.get(CallToolRequestSchema.shape.method.value);
    const mcpResponse = await handler({
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: {
          workspaceId: 'ws-acme-corp',
          projectId: 'proj-core-web',
          ...args,
        },
      },
    });

    return NextResponse.json({
      success: true,
      mcpResponse,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
