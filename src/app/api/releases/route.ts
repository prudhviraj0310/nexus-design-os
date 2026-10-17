import { NextResponse } from 'next/server';
import { getDb } from '@/db/index';
import { docApprovals, docPages, releases } from '@/db/schema';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { seedDatabase } from '@/db/seed';
import { validateApiAuth } from '@/server/auth';
import { VersionManager } from '@/core/versions/version-manager';
import { authorizeDesignSystem } from '@/server/governance';

export async function GET(request: Request) {
  const auth = validateApiAuth(request);
  if (!auth.authorized) return auth.errorResponse!;
  try {
    const { searchParams } = new URL(request.url);
    const designSystemId = searchParams.get('designSystemId') || 'ds-nova-design';

    const { db } = await getDb();
    await authorizeDesignSystem(db, auth.userId, designSystemId);
    let allReleases = await db.select().from(releases)
      .where(eq(releases.designSystemId, designSystemId))
      .orderBy(desc(releases.createdAt));

    if (allReleases.length === 0) {
      await seedDatabase();
      allReleases = await db.select().from(releases)
        .where(eq(releases.designSystemId, designSystemId))
        .orderBy(desc(releases.createdAt));
    }

    const versionManager = new VersionManager(db);
    const versions = await versionManager.listVersions(designSystemId);

    return NextResponse.json({
      success: true,
      totalCount: allReleases.length,
      releases: allReleases,
      versions,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = validateApiAuth(request);
    if (!auth.authorized) return auth.errorResponse!;

    const body = await request.json();
    const {
      version,
      title,
      description = '',
      changelog = '',
      designSystemId = 'ds-nova-design',
      triggerPipelines = true,
    } = body;

    if (!version || !title) {
      return NextResponse.json(
        { success: false, error: 'version and title are required' },
        { status: 400 }
      );
    }

    const { db } = await getDb();
    await authorizeDesignSystem(db, auth.userId, designSystemId);
    const pages = await db.select({ id: docPages.id }).from(docPages)
      .where(eq(docPages.designSystemId, designSystemId));
    if (pages.length > 0) {
      const pendingApprovals = await db.select({ id: docApprovals.id }).from(docApprovals)
        .where(and(inArray(docApprovals.pageId, pages.map((page: { id: string }) => page.id)), eq(docApprovals.status, 'pending')));
      if (pendingApprovals.length > 0) {
        return NextResponse.json({
          success: false,
          error: 'Release blocked: documentation approval requests are still pending.',
          code: 'PENDING_DOCUMENTATION_APPROVALS',
          pendingApprovalCount: pendingApprovals.length,
        }, { status: 409 });
      }
    }
    const versionManager = new VersionManager(db);

    const result = await versionManager.releaseVersion({
      designSystemId,
      version,
      title,
      description,
      changelog,
      triggerPipelines,
    });

    return NextResponse.json({
      success: true,
      release: result.release,
      version: result.version,
      tokensCopied: result.tokensCopied,
      themesCopied: result.themesCopied,
      groupsCopied: result.groupsCopied,
      pipelineResults: result.pipelineResults,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
