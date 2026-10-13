// Live Real-World Endpoint Integration Verifier
const BASE = 'http://localhost:3000';

const endpoints = [
  { method: 'GET', path: '/api/health', expected: 200, label: 'System Health & Diagnostics' },
  { method: 'GET', path: '/api/tokens', expected: 200, label: 'Token Repository Full Retrieval' },
  { method: 'GET', path: '/api/tokens?category=color', expected: 200, label: 'Token Category Filtering (Color)' },
  { method: 'GET', path: '/api/tokens?category=spacing', expected: 200, label: 'Token Category Filtering (Spacing)' },
  { method: 'GET', path: '/api/tokens?category=borderRadius', expected: 200, label: 'Token Category Filtering (BorderRadius)' },
  { method: 'GET', path: '/api/components', expected: 200, label: 'Component Library & Specs' },
  { method: 'GET', path: '/api/releases', expected: 200, label: 'Release Changelog & History' },
  { method: 'GET', path: '/api/export?format=css', expected: 200, label: 'W3C DTCG CSS Custom Properties Exporter' },
  { method: 'GET', path: '/api/export?format=json', expected: 200, label: 'Design Tokens DTCG JSON Exporter' },
  { method: 'GET', path: '/api/export?format=typescript', expected: 200, label: 'Type-Safe TypeScript Exporter' },
  { method: 'GET', path: '/api/export?format=tailwind-v3', expected: 200, label: 'Tailwind v3 Config Exporter' },
  { method: 'GET', path: '/api/export?format=tailwind-v4', expected: 200, label: 'Tailwind v4 @theme CSS Exporter' },
  { method: 'GET', path: '/api/export?format=swift', expected: 200, label: 'Swift / SwiftUI Mobile Exporter' },
  { method: 'GET', path: '/api/export?format=kotlin', expected: 200, label: 'Android Jetpack Compose Exporter' },
  {
    method: 'POST',
    path: '/api/audit',
    body: { code: 'export function Clean() { return <div className="p-4 text-blue-500">Clean</div>; }' },
    expected: 200,
    label: 'AST Compliance Linter (Compliant)',
  },
  {
    method: 'POST',
    path: '/api/audit',
    body: { code: 'export function Bad() { return <div className="p-[17px] text-[#ff0000]">Bad</div>; }' },
    expected: 200,
    label: 'AST Compliance Linter (Violations)',
  },
  {
    method: 'POST',
    path: '/api/figma/sync',
    body: { dryRun: true, fileKey: 'test-key', modeName: 'Light' },
    expected: 200,
    label: 'Figma Variable Sync (Safe Dry-Run)',
  },
  {
    method: 'POST',
    path: '/api/deliver',
    body: { targetRepo: 'acme-corp/web-platform-core', dryRun: true },
    expected: 200,
    label: 'GitHub Delivery (Authorized Repo Simulation)',
  },
  {
    method: 'POST',
    path: '/api/deliver',
    body: { targetRepo: 'unauthorized/target', dryRun: true },
    expected: 403,
    label: 'GitHub Delivery (Allowlist 403 Forbidden)',
  },
  { method: 'GET', path: '/api/mcp', expected: 200, label: 'MCP Tool Catalog Discovery' },
  {
    method: 'POST',
    path: '/api/mcp',
    body: { toolName: 'get_tokens', args: { workspaceId: 'ws-acme-corp', projectId: 'proj-core-web' } },
    expected: 200,
    label: 'MCP Tool Call (get_tokens)',
  },
  {
    method: 'POST',
    path: '/api/mcp',
    body: {
      toolName: 'check_compliance',
      args: {
        workspaceId: 'ws-acme-corp',
        projectId: 'proj-core-web',
        codeContent: 'const x = <div className="p-[15px]">test</div>;',
      },
    },
    expected: 200,
    label: 'MCP Tool Call (check_compliance)',
  },
  { method: 'GET', path: '/', expected: 200, label: 'Supernova Main Dashboard Page HTML' },
  { method: 'GET', path: '/docs', expected: 200, label: 'Supernova Documentation Portal HTML' },
];

console.log('=== REAL-WORLD LIVE SYSTEM VERIFICATION ===\n');

let passed = 0;
let failed = 0;

for (const ep of endpoints) {
  const url = `${BASE}${ep.path}`;
  const t0 = performance.now();
  try {
    const opts = {
      method: ep.method,
      headers: ep.body ? { 'Content-Type': 'application/json' } : {},
      body: ep.body ? JSON.stringify(ep.body) : undefined,
    };
    const res = await fetch(url, opts);
    const ms = Math.round(performance.now() - t0);

    if (res.status === ep.expected) {
      console.log(`✓ [PASS] (${res.status}) ${ep.label.padEnd(45)} [${ep.method} ${ep.path}] in ${ms}ms`);
      passed++;
    } else {
      console.error(`✗ [FAIL] Expected ${ep.expected}, got ${res.status}: ${ep.label} [${ep.method} ${ep.path}] in ${ms}ms`);
      failed++;
    }
  } catch (err) {
    console.error(`✗ [ERR] ${ep.label}: ${err.message}`);
    failed++;
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed out of ${endpoints.length} checks.`);
if (failed > 0) process.exit(1);
