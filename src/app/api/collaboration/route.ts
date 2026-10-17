import { NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { getDb } from '@/db/index';
import { codeContainers, docApprovals, docComments, docPages, docRedirects, docRevisions } from '@/db/schema';
import { validateApiAuth } from '@/server/auth';
import { authorizeDesignSystem, assertWorkspacePermission, hasWorkspacePermission } from '@/server/governance';
import { validateCodeContainerManifest } from '@/core/containers/validation';

async function authorizePage(db: any, userId: string | undefined, pageId: string) {
  const pages = await db.select().from(docPages).where(eq(docPages.id, pageId)).limit(1);
  if (!pages[0]) throw new Error('Documentation page not found.');
  await authorizeDesignSystem(db, userId, pages[0].designSystemId);
  return pages[0];
}

function actorId(userId: string | undefined): string | null {
  return userId && !['local-operator', 'dev-user', 'admin', 'api-client'].includes(userId) ? userId : null;
}

function conflictResponse(message: string, currentUpdatedAt?: Date) {
  return NextResponse.json({ success: false, error: message, code: 'REVISION_CONFLICT', currentUpdatedAt }, { status: 409 });
}

export async function GET(request: Request) {
  const auth = validateApiAuth(request);
  if (!auth.authorized) return auth.errorResponse!;
  try {
    const params = new URL(request.url).searchParams;
    const pageId = params.get('pageId');
    const designSystemId = params.get('designSystemId') || 'ds-nova-design';
    const { db } = await getDb();
    if (pageId) await authorizePage(db, auth.userId, pageId);
    else await authorizeDesignSystem(db, auth.userId, designSystemId);
    const [revisions, comments, approvals, redirects, containers] = await Promise.all([
      pageId ? db.select().from(docRevisions).where(eq(docRevisions.pageId, pageId)).orderBy(desc(docRevisions.createdAt)) : Promise.resolve([]),
      pageId ? db.select().from(docComments).where(eq(docComments.pageId, pageId)).orderBy(desc(docComments.createdAt)) : Promise.resolve([]),
      pageId ? db.select().from(docApprovals).where(eq(docApprovals.pageId, pageId)).orderBy(desc(docApprovals.createdAt)) : Promise.resolve([]),
      db.select().from(docRedirects).where(eq(docRedirects.designSystemId, designSystemId)),
      db.select().from(codeContainers).where(eq(codeContainers.designSystemId, designSystemId)).orderBy(desc(codeContainers.createdAt)),
    ]);
    return NextResponse.json({ success: true, revisions, comments, approvals, redirects, containers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = validateApiAuth(request);
  if (!auth.authorized) return auth.errorResponse!;
  try {
    const body = await request.json();
    const { db } = await getDb();
    switch (body.type) {
      case 'revision': {
        if (!body.pageId || typeof body.content !== 'string') throw new Error('pageId and content are required.');
        const page = await authorizePage(db, auth.userId, body.pageId);
        const authorization = await authorizeDesignSystem(db, auth.userId, page.designSystemId);
        await assertWorkspacePermission(db, authorization.principal, 'docs:edit');
        if (body.expectedUpdatedAt && new Date(body.expectedUpdatedAt).getTime() !== new Date(page.updatedAt).getTime()) {
          return conflictResponse('The page changed since it was loaded. Refresh before saving.', page.updatedAt);
        }
        const id = `revision-${crypto.randomUUID()}`;
        await db.insert(docRevisions).values({ id, pageId: body.pageId, authorUserId: actorId(auth.userId), content: body.content, blocks: body.blocks || null });
        const updatedAt = new Date();
        await db.update(docPages).set({ content: body.content, blocks: body.blocks || null, updatedAt }).where(and(eq(docPages.id, body.pageId), body.expectedUpdatedAt ? eq(docPages.updatedAt, page.updatedAt) : eq(docPages.id, body.pageId)));
        return NextResponse.json({ success: true, id, type: body.type });
      }
      case 'comment': {
        if (!body.pageId || !body.body) throw new Error('pageId and body are required.');
        const page = await authorizePage(db, auth.userId, body.pageId);
        const authorization = await authorizeDesignSystem(db, auth.userId, page.designSystemId);
        await assertWorkspacePermission(db, authorization.principal, 'docs:edit');
        const id = `comment-${crypto.randomUUID()}`;
        await db.insert(docComments).values({ id, pageId: body.pageId, authorUserId: actorId(auth.userId), body: body.body, anchor: body.anchor || null });
        return NextResponse.json({ success: true, id, type: body.type });
      }
      case 'approval': {
        if (!body.pageId) throw new Error('pageId is required.');
        const page = await authorizePage(db, auth.userId, body.pageId);
        const authorization = await authorizeDesignSystem(db, auth.userId, page.designSystemId);
        await assertWorkspacePermission(db, authorization.principal, 'docs:edit');
        const id = `approval-${crypto.randomUUID()}`;
        await db.insert(docApprovals).values({ id, pageId: body.pageId, requestedByUserId: actorId(auth.userId), note: body.note || null });
        return NextResponse.json({ success: true, id, status: 'pending', type: body.type });
      }
      case 'redirect': {
        if (!body.designSystemId || !body.fromPath || !body.toPath) throw new Error('designSystemId, fromPath, and toPath are required.');
        await authorizeDesignSystem(db, auth.userId, body.designSystemId);
        const id = `redirect-${crypto.randomUUID()}`;
        await db.insert(docRedirects).values({ id, designSystemId: body.designSystemId, fromPath: body.fromPath, toPath: body.toPath, statusCode: body.statusCode || 301 });
        return NextResponse.json({ success: true, id, type: body.type });
      }
      case 'container': {
        if (!body.designSystemId || !body.name || !body.version || !body.manifest) throw new Error('designSystemId, name, version, and manifest are required.');
        await authorizeDesignSystem(db, auth.userId, body.designSystemId);
        const manifest = validateCodeContainerManifest(body.manifest, {
          artifactUrl: body.artifactUrl || null,
          production: process.env.NODE_ENV === 'production',
        });
        const id = body.id || `container-${Date.now().toString(36)}`;
        await db.insert(codeContainers).values({ id, designSystemId: body.designSystemId, name: body.name, version: body.version, framework: body.framework || 'react', manifest, artifactUrl: body.artifactUrl || null }).onConflictDoUpdate({
          target: codeContainers.id,
          set: { name: body.name, version: body.version, manifest, artifactUrl: body.artifactUrl || null, status: body.status || 'active' },
        });
        return NextResponse.json({ success: true, id, type: body.type });
      }
      default:
        return NextResponse.json({ success: false, error: 'type must be revision, comment, approval, redirect, or container' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const auth = validateApiAuth(request);
  if (!auth.authorized) return auth.errorResponse!;
  try {
    const body = await request.json();
    const { db } = await getDb();
    if (body.type === 'comment' && body.id) {
      const rows = await db.select().from(docComments).where(eq(docComments.id, body.id)).limit(1);
      if (!rows[0]) return NextResponse.json({ success: false, error: 'Comment not found.' }, { status: 404 });
      const page = await authorizePage(db, auth.userId, rows[0].pageId);
      const authorization = await authorizeDesignSystem(db, auth.userId, page.designSystemId);
      await assertWorkspacePermission(db, authorization.principal, 'docs:edit');
      await db.update(docComments).set({ status: body.status || 'resolved', updatedAt: new Date() }).where(eq(docComments.id, body.id));
    } else if (body.type === 'approval' && body.id) {
      const rows = await db.select().from(docApprovals).where(eq(docApprovals.id, body.id)).limit(1);
      if (!rows[0]) return NextResponse.json({ success: false, error: 'Approval not found.' }, { status: 404 });
      const page = await authorizePage(db, auth.userId, rows[0].pageId);
      const authorization = await authorizeDesignSystem(db, auth.userId, page.designSystemId);
      if (!hasWorkspacePermission(authorization.principal.role, 'tokens:release')) {
        throw new Error('Access denied: approval review requires release permission.');
      }
      await db.update(docApprovals).set({ status: body.status || 'approved', reviewerUserId: actorId(auth.userId), updatedAt: new Date() }).where(eq(docApprovals.id, body.id));
    } else {
      return NextResponse.json({ success: false, error: 'A valid comment or approval id is required.' }, { status: 400 });
    }
    return NextResponse.json({ success: true, id: body.id, status: body.status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
