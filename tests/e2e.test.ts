import { describe, it, expect, beforeAll } from 'vitest';
import { getDb } from '../src/db/index.js';
import { seedDatabase } from '../src/db/seed.js';
import { tokens } from '../src/db/schema.js';
import { createNovaMcpServer } from '../src/mcp/server.js';
import { exportToCss } from '../src/core/exporters/css.js';
import { exportToTypeScript } from '../src/core/exporters/typescript.js';
import { AuditEngine } from '../src/core/audit/engine.js';
import { GitHubDeliveryEngine } from '../src/core/delivery/github.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { FlatToken } from '../src/core/tokens/types.js';

describe('End-to-End Workflow: Tokens -> MCP Context -> Code Generation -> Audit -> GitHub PR', () => {
  let dbHelper: any;
  let server: ReturnType<typeof createNovaMcpServer>;

  beforeAll(async () => {
    dbHelper = await getDb(':memory:');
    await seedDatabase(dbHelper);
    server = createNovaMcpServer(dbHelper);
  });

  it('executes the full end-to-end continuous delivery and agent cycle', async () => {
    const workspaceId = 'ws-acme-corp';
    const projectId = 'proj-core-web';

    // Step 1: Query MCP Server as an AI coding agent to retrieve project design tokens
    const handler = (server as any)._requestHandlers.get(CallToolRequestSchema.shape.method.value);
    const mcpTokensResult = await handler({
      method: 'tools/call',
      params: {
        name: 'get_tokens',
        arguments: { workspaceId, projectId },
      },
    });

    expect(mcpTokensResult.isError).toBeUndefined();
    const tokenPayload = JSON.parse(mcpTokensResult.content[0].text);
    expect(tokenPayload.count).toBeGreaterThan(5);

    // Verify alias resolution in MCP response
    const brandPrimary = tokenPayload.tokens.find((t: any) => t.path === 'color.brand.primary');
    expect(brandPrimary).toBeDefined();
    expect(brandPrimary.isAlias).toBe(true);
    expect(brandPrimary.resolvedValue).toBe('#3b82f6');

    // Step 2: Generate deterministic code artifacts directly from the database source of truth
    const dbTokens = await dbHelper.db.select().from(tokens);
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

    const cssArtifact = exportToCss(flatTokens, { prefix: 'nova' });
    const tsArtifact = exportToTypeScript(flatTokens);

    expect(cssArtifact.content).toContain('--nova-color-brand-primary: var(--nova-color-primitive-blue-500);');
    expect(tsArtifact.content).toContain('"primary": "#3b82f6"');

    // Step 3: Run Quality Intelligence Audit on a consumer component
    const consumerComponentCode = `
      import React from 'react';

      export function HeroBanner() {
        return (
          <div style={{ backgroundColor: '#3b82f6', padding: '16px' }}>
            <h1 style={{ color: 'var(--color-unknown-invalid)' }}>Welcome to Acme</h1>
          </div>
        );
      }
    `;

    const auditEngine = new AuditEngine();
    const auditReport = auditEngine.auditFile({
      filePath: 'src/components/HeroBanner.tsx',
      content: consumerComponentCode,
      tokens: flatTokens,
    });

    expect(auditReport.totalFindings).toBeGreaterThan(0);
    const colorFinding = auditReport.findings.find((f) => f.ruleId === 'RULE-001-HARDCODED-COLOR');
    const unknownFinding = auditReport.findings.find((f) => f.ruleId === 'RULE-002-UNKNOWN-TOKEN');
    expect(colorFinding).toBeDefined();
    expect(unknownFinding).toBeDefined();

    // Step 4: Deliver generated artifacts to GitHub via Pull Request
    const deliveryEngine = new GitHubDeliveryEngine();
    const deliveryResult = await deliveryEngine.deliver({
      projectId,
      repoOwner: 'acme-corp',
      repoName: 'web-app',
      newBranchName: 'novadesign/sync-tokens-release',
      commitMessage: 'feat(design-system): sync updated tokens and types',
      prTitle: 'Design Token Release v1.2.0',
      prBody: `### Automated Design Token Sync\n- Total tokens: ${flatTokens.length}\n- Formats: CSS, TypeScript`,
      files: [cssArtifact, tsArtifact],
      dryRun: true,
    });

    expect(deliveryResult.success).toBe(true);
    expect(deliveryResult.pullRequestUrl).toBeDefined();
    expect(deliveryResult.filesCommitted).toEqual(['tokens.css', 'tokens.ts']);
    expect(deliveryResult.diffSummary).toContain('+ File: tokens.css');
    expect(deliveryResult.diffSummary).toContain('+ File: tokens.ts');
  });
});
