import { NextResponse } from 'next/server';
import { getDb } from '@/db/index';
import { tokens, deliveryJobs } from '@/db/schema';
import { FlatToken } from '@/core/tokens/types';
import { exportToCss } from '@/core/exporters/css';
import { exportToTypeScript } from '@/core/exporters/typescript';
import { GitHubDeliveryEngine } from '@/core/delivery/github';
import { validateApiAuth } from '@/server/auth';

export async function POST(request: Request) {
  try {
    const auth = validateApiAuth(request);
    if (!auth.authorized) return auth.errorResponse!;

    const body = await request.json();
    
    // Parse repository from either "owner/repo" string or separate fields
    let repoOwner = body.repoOwner || 'acme-corp';
    let repoName = body.repoName || 'web-platform-core';

    const rawRepo = body.repository || body.repo;
    if (rawRepo && rawRepo.includes('/')) {
      const parts = rawRepo.split('/');
      repoOwner = parts[0].trim();
      repoName = parts[1].trim();
    }

    // Security validation: ensure repoOwner and repoName are safe identifiers
    const repoIdentifierRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!repoIdentifierRegex.test(repoOwner) || !repoIdentifierRegex.test(repoName)) {
      return NextResponse.json(
        { success: false, error: 'Invalid repository name format. Expected "owner/repo" with alphanumeric characters.' },
        { status: 400 }
      );
    }

    const newBranchName = body.newBranchName || body.branch || `nexus/sync-${Date.now()}`;
    const prTitle = body.prTitle || body.title || 'Design Token Release & Sync';
    const prBody = body.prBody || 'Automated pull request generated from Nexus Design OS central source of truth.';
    const githubToken = body.githubToken || process.env.GITHUB_TOKEN;
    
    // Default dryRun to true only if no token is available or dryRun is explicitly requested
    const dryRun = body.dryRun !== undefined ? Boolean(body.dryRun) : !githubToken;

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

    const css = exportToCss(flatTokens, { prefix: 'nexus' });
    const ts = exportToTypeScript(flatTokens);

    const deliveryEngine = new GitHubDeliveryEngine();
    const result = await deliveryEngine.deliver({
      projectId: 'proj-core-web',
      repoOwner,
      repoName,
      newBranchName,
      commitMessage: 'feat(tokens): automated release from Nexus Design OS',
      prTitle,
      prBody,
      files: [css, ts],
      githubToken,
      dryRun,
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
