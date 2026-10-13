import { describe, it, expect, beforeEach } from 'vitest';
import { getDb } from '../src/db/index';
import { workspaces, projects, designSystems, tokens, deliveryJobs, releases } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { FigmaClient } from '../src/core/figma/client';
import { mapFigmaVariablesToDTCG } from '../src/core/figma/mapper';
import { computeTokenDiff } from '../src/core/figma/diff';
import { resolveTokenAliases } from '../src/core/tokens/resolver';
import { FlatToken } from '../src/core/tokens/types';
import { exportToSwift } from '../src/core/exporters/swift';
import { exportToKotlin } from '../src/core/exporters/kotlin';
import { exportToTailwindV4 } from '../src/core/exporters/tailwind';
import { AuditEngine } from '../src/core/audit/engine';
import { GitHubDeliveryEngine } from '../src/core/delivery/github';
import { createNovaMcpServer } from '../src/mcp/server';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

describe('Real-World Scenarios End-to-End Suite', () => {
  let db: any;

  beforeEach(async () => {
    const memory = await getDb(':memory:');
    db = memory.db;

    await db.delete(tokens);
    await db.delete(designSystems);
    await db.delete(projects);
    await db.delete(workspaces);
    await db.delete(deliveryJobs);
    await db.delete(releases);

    // Seed two workspaces and design systems to test multi-tenant isolation
    await db.insert(workspaces).values([
      { id: 'ws-primary', name: 'Primary Corp', slug: 'primary' },
      { id: 'ws-secondary', name: 'Secondary Corp', slug: 'secondary' },
    ]);

    await db.insert(projects).values([
      { id: 'proj-primary', workspaceId: 'ws-primary', name: 'Primary App', slug: 'primary-app' },
      { id: 'proj-secondary', workspaceId: 'ws-secondary', name: 'Secondary App', slug: 'secondary-app' },
    ]);

    await db.insert(designSystems).values([
      { id: 'ds-primary', projectId: 'proj-primary', name: 'Primary DS', version: '1.0.0' },
      { id: 'ds-secondary', projectId: 'proj-secondary', name: 'Secondary DS', version: '1.0.0' },
    ]);

    // Seed initial tokens for primary design system
    await db.insert(tokens).values([
      {
        id: 'tok-primary-color-blue',
        designSystemId: 'ds-primary',
        name: 'blue',
        path: 'color.brand.blue',
        category: 'color',
        type: 'color',
        rawValue: '#3b82f6',
        resolvedValue: '#3b82f6',
        isAlias: false,
        isDeprecated: false,
      },
      {
        id: 'tok-primary-color-old',
        designSystemId: 'ds-primary',
        name: 'old',
        path: 'color.brand.old',
        category: 'color',
        type: 'color',
        rawValue: '#ff007f',
        resolvedValue: '#ff007f',
        isAlias: false,
        isDeprecated: true,
      },
      {
        id: 'tok-primary-space-md',
        designSystemId: 'ds-primary',
        name: 'md',
        path: 'spacing.md',
        category: 'spacing',
        type: 'dimension',
        rawValue: '16px',
        resolvedValue: '16px',
        isAlias: false,
        isDeprecated: false,
      },
      {
        id: 'tok-primary-radius-sm',
        designSystemId: 'ds-primary',
        name: 'sm',
        path: 'borderRadius.sm',
        category: 'borderRadius',
        type: 'borderRadius',
        rawValue: '4px',
        resolvedValue: '4px',
        isAlias: false,
        isDeprecated: false,
      },
    ]);

    // Seed token for secondary design system (tenant isolation check)
    await db.insert(tokens).values([
      {
        id: 'tok-secondary-color-green',
        designSystemId: 'ds-secondary',
        name: 'green',
        path: 'color.brand.green',
        category: 'color',
        type: 'color',
        rawValue: '#10b981',
        resolvedValue: '#10b981',
        isAlias: false,
        isDeprecated: false,
      },
    ]);
  });

  describe('Scenario 1: Real-World Figma Variable Sync & Deletion Pruning with Multi-Tenant Isolation', () => {
    it('accurately syncs incoming variables, deletes pruned tokens in primary DS, and preserves secondary DS', async () => {
      // Incoming Figma payload has an updated 'color.brand.blue', a new 'color.brand.purple',
      // but 'color.brand.old' and 'spacing.md' have been deleted in Figma.
      const incomingRawFigma = {
        status: 200,
        error: false,
        meta: {
          variableCollections: {
            'col-1': { id: 'col-1', name: 'Tokens', defaultModeId: 'm-1', modes: [{ modeId: 'm-1', name: 'Light' }] },
          },
          variables: {
            'var-blue': {
              id: 'var-blue',
              name: 'color/brand/blue',
              variableCollectionId: 'col-1',
              resolvedType: 'COLOR',
              valuesByMode: { 'm-1': { r: 0.145, g: 0.388, b: 0.922, a: 1 } }, // Updated blue (#2563eb)
            },
            'var-purple': {
              id: 'var-purple',
              name: 'color/brand/purple',
              variableCollectionId: 'col-1',
              resolvedType: 'COLOR',
              valuesByMode: { 'm-1': { r: 0.545, g: 0.361, b: 0.965, a: 1 } }, // New purple (#8b5cf7)
            },
            'var-radius-sm': {
              id: 'var-radius-sm',
              name: 'borderRadius/sm',
              variableCollectionId: 'col-1',
              resolvedType: 'FLOAT',
              valuesByMode: { 'm-1': 4 },
            },
            'var-spacing-sm': {
              id: 'var-spacing-sm',
              name: 'spacing/sm',
              variableCollectionId: 'col-1',
              resolvedType: 'FLOAT',
              valuesByMode: { 'm-1': 8 },
            },
          },
        },
      };

      const mappedTokens = mapFigmaVariablesToDTCG(incomingRawFigma as any, 'Light');
      expect(mappedTokens.length).toBe(4);

      const existingPrimaryTokens = await db.select().from(tokens).where(eq(tokens.designSystemId, 'ds-primary'));
      expect(existingPrimaryTokens.length).toBe(4);

      const flatExisting: FlatToken[] = existingPrimaryTokens.map((t: any) => ({
        name: t.name,
        path: t.path,
        category: t.category,
        type: t.type,
        rawValue: t.rawValue,
        resolvedValue: t.resolvedValue,
        isAlias: t.isAlias,
      }));

      const diff = computeTokenDiff(flatExisting, mappedTokens);
      const added = diff.filter((d: any) => d.status === 'added');
      const updated = diff.filter((d: any) => d.status === 'modified');
      const removed = diff.filter((d: any) => d.status === 'removed');

      expect(added.map((a: any) => a.path)).toContain('color.brand.purple');
      expect(updated.map((u: any) => u.path)).toContain('color.brand.blue');
      expect(removed.map((r: any) => r.path)).toEqual(expect.arrayContaining(['color.brand.old', 'spacing.md']));

      // Execute transaction synchronization strictly scoped to ds-primary
      await db.transaction(async (tx: any) => {
        // Upsert additions/updates
        for (const token of mappedTokens) {
          const tokenId = `tok-ds-primary-${token.path.replace(/\./g, '-')}`;
          await tx
            .insert(tokens)
            .values({
              id: tokenId,
              designSystemId: 'ds-primary',
              name: token.name,
              path: token.path,
              category: token.category,
              type: token.type,
              rawValue: token.rawValue,
              resolvedValue: token.resolvedValue,
              isAlias: token.isAlias,
              isDeprecated: false,
            })
            .onConflictDoUpdate({
              target: tokens.id,
              set: {
                rawValue: token.rawValue,
                resolvedValue: token.resolvedValue,
                isAlias: token.isAlias,
                category: token.category,
                type: token.type,
              },
            });
        }

        // Delete removed tokens scoped strictly to ds-primary
        for (const rem of removed) {
          const toDelete = existingPrimaryTokens.find((t: any) => t.path === rem.path);
          if (toDelete) {
            await tx.delete(tokens).where(eq(tokens.id, toDelete.id));
          }
        }
      });

      // Verify ds-primary state
      const postSyncPrimary = await db.select().from(tokens).where(eq(tokens.designSystemId, 'ds-primary'));
      const paths = postSyncPrimary.map((t: any) => t.path);
      expect(paths).toContain('color.brand.purple');
      expect(paths).toContain('color.brand.blue');
      expect(paths).not.toContain('color.brand.old');
      expect(paths).not.toContain('spacing.md');

      // Verify ds-secondary state (multi-tenant boundary preserved)
      const postSyncSecondary = await db.select().from(tokens).where(eq(tokens.designSystemId, 'ds-secondary'));
      expect(postSyncSecondary.length).toBe(1);
      expect(postSyncSecondary[0].path).toBe('color.brand.green');
    });
  });

  describe('Scenario 2: Real-World Multi-Platform Code Generation Correctness', () => {
    it('produces correct Swift iOS code with 8-digit RGBA hex bit shifts, radii, and omitted category warning', () => {
      const sampleTokens: FlatToken[] = [
        {
          name: 'primary',
          path: 'color.brand.primary',
          category: 'color',
          type: 'color',
          rawValue: '#3b82f6cc', // 8-digit hex with 80% opacity
          resolvedValue: '#3b82f6cc',
          isAlias: false,
          isDeprecated: false,
        },
        {
          name: 'md',
          path: 'spacing.md',
          category: 'spacing',
          type: 'dimension',
          rawValue: '16px',
          resolvedValue: '16px',
          isAlias: false,
          isDeprecated: false,
        },
        {
          name: 'lg',
          path: 'borderRadius.lg',
          category: 'borderRadius',
          type: 'borderRadius',
          rawValue: '12px',
          resolvedValue: '12px',
          isAlias: false,
          isDeprecated: false,
        },
        {
          name: 'heading',
          path: 'typography.fontFamily.heading',
          category: 'typography',
          type: 'fontFamily',
          rawValue: 'Outfit, sans-serif',
          resolvedValue: 'Outfit, sans-serif',
          isAlias: false,
          isDeprecated: false,
        },
      ];

      const swift = exportToSwift(sampleTokens);
      // Warning banner present for omitted typography
      expect(swift.content).toContain('WARNING: 1 token(s) across 1 category/categories omitted from Swift export:');
      expect(swift.content).toContain('- typography');

      // 8-digit RGBA hex helper used
      expect(swift.content).toContain('Color(hexRGBA: 0x3b82f6cc)');
      expect(swift.content).toContain('init(hexRGBA: UInt32)');
      expect(swift.content).toContain('red: Double((hexRGBA >> 24) & 0xff) / 255.0');
      expect(swift.content).toContain('opacity: Double(hexRGBA & 0xff) / 255.0');

      // Border radius struct present
      expect(swift.content).toContain('public struct Radii');
      expect(swift.content).toContain('public static let lg: CGFloat = 12');
    });

    it('produces correct Kotlin Jetpack Compose code with ARGB hexes, radii, and omitted category warning', () => {
      const sampleTokens: FlatToken[] = [
        {
          name: 'primary',
          path: 'color.brand.primary',
          category: 'color',
          type: 'color',
          rawValue: '#3b82f6', // 6-digit hex
          resolvedValue: '#3b82f6',
          isAlias: false,
          isDeprecated: false,
        },
        {
          name: 'overlay',
          path: 'color.brand.overlay',
          category: 'color',
          type: 'color',
          rawValue: '#12345680', // 8-digit RGBA (alpha is 80)
          resolvedValue: '#12345680',
          isAlias: false,
          isDeprecated: false,
        },
        {
          name: 'pill',
          path: 'borderRadius.pill',
          category: 'borderRadius',
          type: 'borderRadius',
          rawValue: '9999px',
          resolvedValue: '9999px',
          isAlias: false,
          isDeprecated: false,
        },
        {
          name: 'body',
          path: 'typography.fontSize.body',
          category: 'typography',
          type: 'fontSize',
          rawValue: '16px',
          resolvedValue: '16px',
          isAlias: false,
          isDeprecated: false,
        },
      ];

      const kotlin = exportToKotlin(sampleTokens);
      // Warning banner for typography
      expect(kotlin.content).toContain('WARNING: 1 token(s) across 1 category/categories omitted from Kotlin Compose export:');

      // 6-digit hex mapped with 0xFF prefix in ARGB
      expect(kotlin.content).toContain('val BrandPrimary = Color(0xFF3B82F6L)');

      // 8-digit RGBA hex mapped with alpha byte leading in ARGB
      expect(kotlin.content).toContain('val BrandOverlay = Color(0x80123456L)');

      // Border radius object present
      expect(kotlin.content).toContain('object NovaRadii');
      expect(kotlin.content).toContain('val Pill: Dp = 9999.dp');
    });

    it('produces valid Tailwind v4 @theme directive with modern CSS custom property references', () => {
      const sampleTokens: FlatToken[] = [
        {
          name: 'brandPrimary',
          path: 'color.brand.primary',
          category: 'color',
          type: 'color',
          rawValue: '#3b82f6',
          resolvedValue: '#3b82f6',
          isAlias: false,
          isDeprecated: false,
        },
        {
          name: 'md',
          path: 'spacing.md',
          category: 'spacing',
          type: 'dimension',
          rawValue: '16px',
          resolvedValue: '16px',
          isAlias: false,
          isDeprecated: false,
        },
      ];

      const tw4 = exportToTailwindV4(sampleTokens, { prefix: 'nova' });
      expect(tw4.content).toContain('@theme {');
      expect(tw4.content).toContain('--color-brand-primary: var(--nova-color-brand-primary);');
      expect(tw4.content).toContain('--spacing-md: var(--nova-spacing-md);');
    });
  });

  describe('Scenario 3: Real-World AST Code Compliance Linter & SARIF Schema', () => {
    const engine = new AuditEngine();
    const systemTokens: FlatToken[] = [
      {
        name: 'primary',
        path: 'color.brand.primary',
        category: 'color',
        type: 'color',
        rawValue: '#3b82f6',
        resolvedValue: '#3b82f6',
        isAlias: false,
        isDeprecated: false,
      },
      {
        name: 'accent',
        path: 'color.legacy.accent',
        category: 'color',
        type: 'color',
        rawValue: '#ff007f',
        resolvedValue: '#ff007f',
        isAlias: false,
        isDeprecated: true,
      },
      {
        name: 'md',
        path: 'spacing.md',
        category: 'spacing',
        type: 'dimension',
        rawValue: '16px',
        resolvedValue: '16px',
        isAlias: false,
        isDeprecated: false,
      },
    ];

    it('detects arbitrary Tailwind bracket spacing, arbitrary color hex, style prop color, and deprecated token in realistic TSX', () => {
      const realisticComponent = `
import React from 'react';

export interface AlertCardProps {
  title: string;
  count: number;
}

export const AlertCard: React.FC<AlertCardProps> = ({ title, count }) => {
  return (
    <div className="flex flex-col p-[21px] rounded-lg shadow-sm border border-[#e2e8f0]">
      <h2 style={{ color: '#ff007f' }}>{title}</h2>
      <span className="text-[15px]" style={{ backgroundColor: 'var(--color-legacy-accent)' }}>
        Count: {count}
      </span>
    </div>
  );
};
`;

      const report = engine.auditFile({
        filePath: 'src/components/AlertCard.tsx',
        content: realisticComponent,
        tokens: systemTokens,
      });

      expect(report.totalFindings).toBeGreaterThanOrEqual(4);

      const ruleIds = report.findings.map((f: any) => f.ruleId);
      expect(ruleIds).toContain('RULE-004-HARDCODED-SPACING'); // p-[21px]
      expect(ruleIds).toContain('RULE-001-HARDCODED-COLOR');   // border-[#e2e8f0] and #ff007f
      expect(ruleIds).toContain('RULE-003-DEPRECATED-TOKEN');  // --color-legacy-accent

      // Verify SARIF output structure
      expect(report.sarif).toBeDefined();
      expect(report.sarif!.version).toBe('2.1.0');
      expect(report.sarif!.runs[0].tool.driver.name).toBe('NovaDesign Quality Intelligence');
      expect(report.sarif!.runs[0].results.length).toBe(report.findings.length);
    });

    it('gracefully handles non-JSX TypeScript files with standalone style objects and flags hardcoded hex', () => {
      const styleTsFile = `
export const buttonStyles = {
  backgroundColor: '#3b82f6',
  padding: '12px 24px',
  color: '#ffffff',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
};
`;

      const report = engine.auditFile({
        filePath: 'src/styles/button.ts',
        content: styleTsFile,
        tokens: systemTokens,
      });

      expect(report.totalFindings).toBeGreaterThan(0);
      const hexFinding = report.findings.find((f: any) => f.ruleId === 'RULE-001-HARDCODED-COLOR');
      expect(hexFinding).toBeDefined();
    });

    it('gives 100 score and 0 findings for clean, design-system-conforming component', () => {
      const cleanComponent = `
export function ConformingButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-blue-600 text-white rounded-md font-sans hover:bg-blue-700 transition-colors"
    >
      {label}
    </button>
  );
}
`;

      const report = engine.auditFile({
        filePath: 'src/components/ConformingButton.tsx',
        content: cleanComponent,
        tokens: systemTokens,
      });

      expect(report.totalFindings).toBe(0);
      expect(report.errorCount).toBe(0);
      expect(report.warningCount).toBe(0);
    });
  });

  describe('Scenario 4: Real-World GitHub Delivery & Allowlist Boundary Simulation', () => {
    it('records simulated delivery jobs in database with pullRequestUrl null and safe branch name', async () => {
      const deliveryEngine = new GitHubDeliveryEngine();

      const deliveryResult = await deliveryEngine.deliver({
        projectId: 'proj-primary',
        repoOwner: 'acme-corp',
        repoName: 'web-platform-core',
        newBranchName: 'nexus/release-v1.1.0',
        commitMessage: 'feat(tokens): automated release',
        prTitle: 'Design Token Release v1.1.0',
        prBody: 'Automated PR from Nexus Design OS',
        files: [
          { filename: 'tokens.css', content: ':root { --color: blue; }', format: 'css' },
        ],
        dryRun: true,
      });

      expect(deliveryResult.success).toBe(true);
      expect(deliveryResult.dryRun).toBe(true);
      expect(deliveryResult.pullRequestUrl).toBeNull();
      expect(deliveryResult.diffSummary).toContain('tokens.css');

      // Record in database
      await db.insert(deliveryJobs).values({
        id: 'job-realworld-1',
        projectId: 'proj-primary',
        targetRepo: 'acme-corp/web-platform-core',
        branch: 'nexus/release-v1.1.0',
        pullRequestUrl: null,
        status: 'simulated',
        diffSummary: deliveryResult.diffSummary,
      });

      const recordedJob = await db.select().from(deliveryJobs).where(eq(deliveryJobs.id, 'job-realworld-1'));
      expect(recordedJob.length).toBe(1);
      expect(recordedJob[0].status).toBe('simulated');
      expect(recordedJob[0].pullRequestUrl).toBeNull();
      expect(recordedJob[0].targetRepo).toBe('acme-corp/web-platform-core');
    });
  });

  describe('Scenario 5: Atomicity of Design System Releases', () => {
    it('creates release snapshot and updates design system version within a single transaction', async () => {
      const newVersion = '1.1.0';
      const releaseId = 'rel-1-1-0-prod';

      await db.transaction(async (tx: any) => {
        await tx.insert(releases).values({
          id: releaseId,
          designSystemId: 'ds-primary',
          version: newVersion,
          title: 'Version 1.1.0 Real-World Release',
          description: 'Production token release',
          tokensCount: 4,
          componentsCount: 0,
          changelog: 'Added mobile platform token exports',
          createdAt: new Date(),
        });

        await tx
          .update(designSystems)
          .set({ version: newVersion })
          .where(eq(designSystems.id, 'ds-primary'));
      });

      // Verify release entry
      const createdRelease = await db.select().from(releases).where(eq(releases.id, releaseId));
      expect(createdRelease.length).toBe(1);
      expect(createdRelease[0].version).toBe('1.1.0');

      // Verify design system version was updated
      const updatedDs = await db.select().from(designSystems).where(eq(designSystems.id, 'ds-primary'));
      expect(updatedDs[0].version).toBe('1.1.0');
    });
  });
});
