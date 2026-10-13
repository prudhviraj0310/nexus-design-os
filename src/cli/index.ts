import { getDb } from '../db/index';
import { seedDatabase } from '../db/seed';
import { tokens, projects } from '../db/schema';
import { eq } from 'drizzle-orm';
import { FlatToken } from '../core/tokens/types';
import { exportToCss } from '../core/exporters/css';
import { exportToJson } from '../core/exporters/json';
import { exportToTypeScript } from '../core/exporters/typescript';
import { exportToTailwind } from '../core/exporters/tailwind';
import { AuditEngine } from '../core/audit/engine';
import { GitHubDeliveryEngine } from '../core/delivery/github';
import { runStdioServer } from '../mcp/server';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  switch (command) {
    case 'seed': {
      console.log('Seeding NovaDesign database...');
      const res = await seedDatabase();
      console.log('Seeded successfully:', res);
      break;
    }

    case 'export': {
      const outDir = args[1] || './dist/exported-tokens';
      console.log(`Exporting design tokens to ${outDir}...`);
      const { db } = await getDb();
      const allTokens = await db.select().from(tokens);

      if (allTokens.length === 0) {
        console.log('No tokens found. Seeding first...');
        await seedDatabase();
      }

      const refreshedTokens = await db.select().from(tokens);
      const flatTokens: FlatToken[] = refreshedTokens.map((t: any) => ({
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

      const css = exportToCss(flatTokens);
      const json = exportToJson(flatTokens);
      const ts = exportToTypeScript(flatTokens);
      const tw = exportToTailwind(flatTokens);

      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, css.filename), css.content);
      fs.writeFileSync(path.join(outDir, json.filename), json.content);
      fs.writeFileSync(path.join(outDir, ts.filename), ts.content);
      fs.writeFileSync(path.join(outDir, tw.filename), tw.content);

      console.log(`Generated:
  - ${css.filename}
  - ${json.filename}
  - ${ts.filename}
  - ${tw.filename}`);
      break;
    }

    case 'audit': {
      const targetFile = args[1];
      if (!targetFile) {
        console.error('Error: Please specify a file path to audit. Example: npm run cli audit src/App.tsx');
        process.exit(1);
      }

      if (!fs.existsSync(targetFile)) {
        console.error(`Error: File "${targetFile}" not found.`);
        process.exit(1);
      }

      const content = fs.readFileSync(targetFile, 'utf-8');
      const { db } = await getDb();
      const dbTokens = await db.select().from(tokens);

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

      const auditEngine = new AuditEngine();
      const report = auditEngine.auditFile({
        filePath: targetFile,
        content,
        tokens: flatTokens,
      });

      console.log('--- NovaDesign Quality Audit Report ---');
      console.log(`Total Findings: ${report.totalFindings} (Errors: ${report.errorCount}, Warnings: ${report.warningCount}, Info: ${report.infoCount})`);
      for (const finding of report.findings) {
        console.log(`[${finding.severity.toUpperCase()}] Line ${finding.line} (${finding.ruleId}): ${finding.message}`);
        console.log(`  Evidence: ${finding.evidence}`);
        if (finding.suggestedFix) {
          console.log(`  Fix: ${finding.suggestedFix}`);
        }
      }
      break;
    }

    case 'mcp': {
      await runStdioServer();
      break;
    }

    case 'deliver': {
      console.log('Running automated continuous delivery pipeline to GitHub...');
      const { db } = await getDb();
      const dbTokens = await db.select().from(tokens);
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

      const css = exportToCss(flatTokens);
      const ts = exportToTypeScript(flatTokens);

      const delivery = new GitHubDeliveryEngine();
      const result = await delivery.deliver({
        projectId: 'proj-core-web',
        repoOwner: 'acme-corp',
        repoName: 'design-system-core',
        newBranchName: `novadesign/tokens-update-${Date.now()}`,
        commitMessage: 'chore(tokens): sync design tokens from NovaDesign source of truth',
        prTitle: 'Design Token Update: Nova Design System v1.2.0',
        prBody: 'Automated pull request generated by NovaDesign continuous delivery engine.',
        files: [css, ts],
        dryRun: true, // test fixture / dry run mode
      });

      console.log('Delivery Result:', result);
      break;
    }

    default:
      console.log(`NovaDesign Platform CLI
Usage:
  npm run cli seed              # Seed database with workspace, project, tokens
  npm run cli export [dir]      # Deterministically export CSS, JSON, TS, Tailwind tokens
  npm run cli audit <file>      # Run design system compliance audit on a code file
  npm run cli deliver           # Run continuous delivery GitHub PR pipeline
  npm run cli mcp               # Start Model Context Protocol Stdio server
`);
      break;
  }
}

main().catch((err) => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
