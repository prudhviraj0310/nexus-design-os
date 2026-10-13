import { NextResponse } from 'next/server';
import { getDb } from '@/db/index';
import { tokens, deliveryJobs } from '@/db/schema';
import { FlatToken } from '@/core/tokens/types';
import { exportToCss } from '@/core/exporters/css';
import { exportToTypeScript } from '@/core/exporters/typescript';
import { GitHubDeliveryEngine } from '@/core/delivery/github';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      repoOwner = 'acme-corp',
      repoName = 'web-platform-core',
      newBranchName = `novadesign/sync-${Date.now()}`,
      prTitle = 'Design Token Release & Sync',
      prBody = 'Automated pull request generated from NovaDesign Platform central source of truth.',
    } = body;

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

    const css = exportToCss(flatTokens, { prefix: 'nova' });
    const ts = exportToTypeScript(flatTokens);

    const deliveryEngine = new GitHubDeliveryEngine();
    const result = await deliveryEngine.deliver({
      projectId: 'proj-core-web',
      repoOwner,
      repoName,
      newBranchName,
      commitMessage: 'feat(tokens): automated release from NovaDesign',
      prTitle,
      prBody,
      files: [css, ts],
      dryRun: true,
    });

    // Record job in database
    await db.insert(deliveryJobs).values({
      id: `job-${Date.now()}`,
      projectId: 'proj-core-web',
      targetRepo: `${repoOwner}/${repoName}`,
      branch: newBranchName,
      pullRequestUrl: result.pullRequestUrl || null,
      status: result.success ? 'success' : 'failed',
      diffSummary: result.diffSummary || null,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
