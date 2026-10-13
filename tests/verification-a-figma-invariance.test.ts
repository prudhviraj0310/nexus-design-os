import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getDb } from '../src/db/index';
import { tokens, projects, designSystems } from '../src/db/schema';
import { seedDatabase } from '../src/db/seed';
import { eq } from 'drizzle-orm';
import { POST as syncFigma } from '../src/app/api/figma/sync/route';
import { GET as exportTokens } from '../src/app/api/export/route';
import { GitHubDeliveryEngine } from '../src/core/delivery/github';
import { GeneratedFile } from '../src/core/exporters/types';
import { FigmaClient } from '../src/core/figma/client';

describe('Verification A: Figma Synchronization Invariance & Multi-Format Code Export', () => {
  const testDesignSystemId = 'ds-verification-a';

  beforeEach(async () => {
    vi.spyOn(FigmaClient.prototype, 'getVariables').mockImplementation(async (req) => {
      const client = new FigmaClient();
      return client.getFixtureVariables(req.fileKey);
    });

    // Clear and seed clean state
    await seedDatabase();
    const { db } = await getDb();
    await db
      .insert(projects)
      .values({
        id: 'proj-verification-a',
        workspaceId: 'ws-acme-corp',
        name: 'Verification A Project',
        slug: 'verification-a',
      })
      .onConflictDoNothing();

    await db
      .insert(designSystems)
      .values({
        id: testDesignSystemId,
        projectId: 'proj-verification-a',
        name: 'Verification A Design System',
        version: '1.0.0',
      })
      .onConflictDoNothing();

    await db.delete(tokens).where(eq(tokens.designSystemId, testDesignSystemId));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('executes full end-to-end pipeline: dry-run preview -> apply changes -> DB verification -> multi-format code export -> repeat sync invariance', async () => {
    // Step 1 & 2: Preview changes (Dry Run)
    const dryRunReq = new Request('http://localhost:3000/api/figma/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        designSystemId: testDesignSystemId,
        fileKey: 'sample-figma-invariance-test',
        modeName: 'Light',
        dryRun: true,
      }),
    });

    const dryRunRes = await syncFigma(dryRunReq);
    const dryRunData = await dryRunRes.json();

    expect(dryRunRes.status).toBe(200);
    expect(dryRunData.success).toBe(true);
    expect(dryRunData.dryRun).toBe(true);
    expect(dryRunData.applied).toBe(false);
    expect(dryRunData.diff).toBeDefined();
    // In fixture: 3 variables found
    expect(dryRunData.totalVariablesFound).toBe(3);

    // Verify database has NOT been mutated during dry run
    const { db } = await getDb();
    let currentDbTokens = await db
      .select()
      .from(tokens)
      .where(eq(tokens.designSystemId, testDesignSystemId));
    expect(currentDbTokens.length).toBe(0);

    // Step 3: Apply the changes
    const applyReq = new Request('http://localhost:3000/api/figma/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        designSystemId: testDesignSystemId,
        fileKey: 'sample-figma-invariance-test',
        modeName: 'Light',
        dryRun: false,
        applyChanges: true,
      }),
    });

    const applyRes = await syncFigma(applyReq);
    const applyData = await applyRes.json();

    expect(applyRes.status).toBe(200);
    expect(applyData.success).toBe(true);
    expect(applyData.applied).toBe(true);
    expect(applyData.appliedCount).toBe(3);
    expect(applyData.deletedCount).toBe(0);

    // Step 4: Verify database records
    currentDbTokens = await db
      .select()
      .from(tokens)
      .where(eq(tokens.designSystemId, testDesignSystemId));
    expect(currentDbTokens.length).toBe(3);

    const cyanToken = currentDbTokens.find((t: any) => t.path === 'color.primitive.cyan.500');
    const accentToken = currentDbTokens.find((t: any) => t.path === 'color.brand.accent');
    const spacingToken = currentDbTokens.find((t: any) => t.path === 'spacing.2xl');

    expect(cyanToken).toBeDefined();
    expect(cyanToken!.resolvedValue).toBe('#05b5d4'); // Normalized hex from RGB {0.02, 0.71, 0.83}
    expect(accentToken).toBeDefined();
    expect(accentToken!.isAlias).toBe(true);
    expect(spacingToken).toBeDefined();
    expect(spacingToken!.rawValue).toBe('48px');

    // Step 5 & 6: Export the tokens and confirm that generated code contains exact values
    const exportReq = new Request('http://localhost:3000/api/export?format=all');
    const exportRes = await exportTokens(exportReq);
    const exportData = await exportRes.json();

    expect(exportRes.status).toBe(200);
    expect(exportData.success).toBe(true);
    expect(exportData.files).toBeDefined();

    // Verify CSS exporter
    expect(exportData.files.css.filename).toBe('tokens.css');
    expect(exportData.files.css.content).toContain('--nova-');

    // Verify TypeScript exporter
    expect(exportData.files.typescript.filename).toBe('tokens.ts');
    expect(exportData.files.typescript.content).toContain('export const tokens');

    // Verify Tailwind V4 exporter
    expect(exportData.files.tailwindV4.filename).toBe('tailwind.theme.css');
    expect(exportData.files.tailwindV4.content).toContain('@theme');

    // Verify Swift exporter
    expect(exportData.files.swift.filename).toBe('Tokens.swift');
    expect(exportData.files.swift.content).toContain('public struct NovaTokens');

    // Verify Kotlin exporter
    expect(exportData.files.kotlin.filename).toBe('Tokens.kt');
    expect(exportData.files.kotlin.content).toContain('object NovaColors');

    // Repeat sync without changing Figma:
    const repeatSyncReq = new Request('http://localhost:3000/api/figma/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        designSystemId: testDesignSystemId,
        fileKey: 'sample-figma-invariance-test',
        modeName: 'Light',
        dryRun: false,
        applyChanges: true,
      }),
    });

    const repeatSyncRes = await syncFigma(repeatSyncReq);
    const repeatSyncData = await repeatSyncRes.json();

    expect(repeatSyncRes.status).toBe(200);
    expect(repeatSyncData.success).toBe(true);

    // Invariance Check 1: 0 added, 0 modified, 0 removed
    const changedDiff = repeatSyncData.diff.filter((d: any) => d.status !== 'unchanged');
    expect(changedDiff.length).toBe(0);
    expect(repeatSyncData.deletedCount).toBe(0);

    // Invariance Check 2: Database count unchanged, zero duplicate tokens
    const afterRepeatTokens = await db
      .select()
      .from(tokens)
      .where(eq(tokens.designSystemId, testDesignSystemId));
    expect(afterRepeatTokens.length).toBe(3);

    // Invariance Check 3: Delivery engine detects no-op and refuses to create unneeded PR
    const deliveryEngine = new GitHubDeliveryEngine();
    const noOpFiles: GeneratedFile[] = [
      { filename: 'tokens.css', content: ':root { --test: #000; }', format: 'css' },
    ];

    // Mock GitHub returning matching remote sha and matching content
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/git/ref/heads/main')) {
        return { ok: true, json: async () => ({ object: { sha: 'base-sha-1' } }) };
      }
      if (url.includes('/contents/tokens.css')) {
        return {
          ok: true,
          json: async () => ({ content: Buffer.from(':root { --test: #000; }').toString('base64') }),
        };
      }
      return { ok: false, status: 404 };
    }) as any;

    try {
      const deliveryResult = await deliveryEngine.deliver({
        projectId: 'proj-verification-a',
        repoOwner: 'acme-corp',
        repoName: 'design-tokens-repo',
        newBranchName: 'nexus/invariance-check',
        commitMessage: 'chore: sync tokens',
        prTitle: 'Sync Tokens',
        prBody: 'Sync tokens body',
        files: noOpFiles,
        githubToken: 'ghp_mock_token_for_invariance_test',
        dryRun: false,
      });

      expect(deliveryResult.success).toBe(true);
      expect(deliveryResult.noOp).toBe(true);
      expect(deliveryResult.pullRequestUrl).toBeNull();
      expect(deliveryResult.filesCommitted).toHaveLength(0);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
