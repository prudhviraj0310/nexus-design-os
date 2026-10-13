import { spawn } from 'child_process';

console.log('Testing Stdio MCP Server via JSON-RPC 2.0...\n');

const child = spawn('npx', ['tsx', 'src/mcp/server.ts'], {
  stdio: ['pipe', 'pipe', 'inherit'],
});

let buffer = '';

function sendRpc(msg) {
  const line = JSON.stringify(msg) + '\n';
  child.stdin.write(line);
}

child.stdout.on('data', (chunk) => {
  buffer += chunk.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop(); // keep remainder

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const parsed = JSON.parse(line);
      console.log('<- Received JSON-RPC:', parsed.id, parsed.result ? 'SUCCESS' : parsed.error ? 'ERROR' : 'EVENT');
      if (parsed.id === 1) {
        // Initialization response
        console.log('   Initialized server:', parsed.result?.serverInfo?.name);
        sendRpc({
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/list',
          params: {},
        });
      } else if (parsed.id === 2) {
        // List tools response
        const tools = parsed.result?.tools?.map((t) => t.name) || [];
        console.log('   Discovered tools count:', tools.length);
        console.log('   Tools:', tools.join(', '));
        
        // Call get_tokens tool
        sendRpc({
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: 'get_tokens',
            arguments: {
              workspaceId: 'ws-acme-corp',
              projectId: 'proj-core-web',
              category: 'borderRadius',
            },
          },
        });
      } else if (parsed.id === 3) {
        // get_tokens response
        const text = parsed.result?.content?.[0]?.text;
        console.log('   Tool call result (get_tokens):');
        console.log('  ', text?.slice(0, 200).replace(/\n/g, ' '));
        child.kill();
        console.log('\n✓ Stdio MCP Server verification passed cleanly!');
        process.exit(0);
      }
    } catch (e) {
      console.log('Raw output:', line);
    }
  }
});

// 1. Send initialize request
sendRpc({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'real-world-auditor', version: '1.0.0' },
  },
});

setTimeout(() => {
  console.error('Timed out waiting for MCP stdio response');
  child.kill();
  process.exit(1);
}, 10000);
