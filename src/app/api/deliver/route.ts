import { NextResponse } from 'next/server';
import { getDb } from '@/db/index';
import { tokens, deliveryJobs } from '@/db/schema';
import { FlatToken } from '@/core/tokens/types';
import { exportToCss } from '@/core/exporters/css';
import { exportToTypeScript } from '@/core/exporters/typescript';
import { GitHubDeliveryEngine } from '@/core/delivery/github';
import { validateApiAuth } from '@/server/auth';
import { env } from '@/server/env';

export async function POST(request: Request) {
  try {
    const auth = validateApiAuth(request);
    if (!auth.authorized) return auth.errorResponse!;

    const body = await request.json();
    
    // Parse repository from either "owner/repo" string or separate fields
    let repoOwner = body.repoOwner || 'acme-corp';
    let repoName = body.repoName || 'web-platform-core';

    const rawRepo = body.repository || body.repo || body.targetRepo;
    if (rawRepo && rawRepo.includes('/')) {
      const parts = rawRepo.split('/');
      repoOwner = parts[0].trim();
      repoName = parts[1].trim();
    }

    // Security validation: validate owner and name separately as alphanumeric identifiers
    const repoIdentifierRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!repoIdentifierRegex.test(repoOwner) || !repoIdentifierRegex.test(repoName)) {
      return NextResponse.json(
        { success: false, error: 'Invalid repository name format. Expected "owner/repo" with alphanumeric characters.' },
        { status: 400 }
      );
    }

    // Server-side repository allowlist authorization check
    const targetRepo = `${repoOwner}/${repoName}`.toLowerCase();
    const rawAllowlist = env().GITHUB_ALLOWED_REPOSITORIES || process.env.GITHUB_ALLOWED_REPOSITORIES || 'acme-corp/web-platform-core,acme-corp/design-tokens-repo,acme-corp/design-system';
    const allowedList = rawAllowlist.split(',').map((s) => s.trim().toLowerCase());

    const isAuthorized = allowedList.some((pattern) => {
      if (pattern === '*' || pattern === '*/*') return true;
      if (pattern.endsWith('/*')) {
        const allowedOwner = pattern.slice(0, -2);
        return repoOwner.toLowerCase() === allowedOwner;
      }
      return targetRepo === pattern;
    });

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error: `Repository "${repoOwner}/${repoName}" is not in the authorized delivery allowlist.`,
          code: 'UNAUTHORIZED_TARGET_REPOSITORY',
        },
        { status: 403 }
      );
    }

    const newBranchName = body.newBranchName || body.branch || `nexus/sync-${Date.now()}`;
    const prTitle = body.prTitle || body.title || 'Design Token Release & Sync';
    const prBody = body.prBody || 'Automated pull request generated from Nexus Design OS central source of truth.';
    const githubToken = body.githubToken || process.env.GITHUB_TOKEN;
    
    // Default dryRun to true: safe by default unless explicitly set to false
    const dryRun = body.dryRun !== undefined ? Boolean(body.dryRun) : true;

    // Fail immediately if live delivery is requested but credentials are absent
    if (!dryRun && !githubToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Live delivery requested but no GitHub token was provided or configured on the server.',
        },
        { status: 400 }
      );
    }

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

    // Record job in database (distinguishing simulated dry-runs from actual live deliveries)
    const jobStatus = result.success ? (dryRun ? 'simulated' : 'success') : 'failed';
    await db.insert(deliveryJobs).values({
      id: `job-${Date.now()}`,
      projectId: 'proj-core-web',
      targetRepo: `${repoOwner}/${repoName}`,
      branch: newBranchName,
      pullRequestUrl: dryRun ? null : (result.pullRequestUrl || null),
      status: jobStatus,
      diffSummary: result.diffSummary || null,
    });

    return NextResponse.json({
      success: result.success,
      dryRun,
      simulated: dryRun,
      result,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
