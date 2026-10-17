import { NextResponse } from 'next/server';
import { and, asc, eq } from 'drizzle-orm';
import { getDb } from '@/db/index';
import { agentFeedback, dataContexts } from '@/db/schema';
import { validateApiAuth } from '@/server/auth';
import { authorizeWorkspace, ensureWorkspaceGovernance, recordAuditEvent } from '@/server/governance';

export async function GET(request: Request) {
  const auth = validateApiAuth(request);
  if (!auth.authorized) return auth.errorResponse!;
  try {
    const params = new URL(request.url).searchParams;
    const workspaceId = params.get('workspaceId') || 'ws-acme-corp';
    const contextId = params.get('id');
    const { db } = await getDb();
    await authorizeWorkspace(db, auth.userId, workspaceId);
    await ensureWorkspaceGovernance(db, workspaceId);
    const filter = contextId
      ? and(eq(dataContexts.workspaceId, workspaceId), eq(dataContexts.id, contextId))
      : eq(dataContexts.workspaceId, workspaceId);
    const contexts = await db.select().from(dataContexts).where(filter).orderBy(asc(dataContexts.name));
    return NextResponse.json({ success: true, contexts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = validateApiAuth(request);
  if (!auth.authorized) return auth.errorResponse!;
  try {
    const body = await request.json();
    const workspaceId = body.workspaceId || 'ws-acme-corp';
    if (!body.name || !body.rules) {
      return NextResponse.json({ success: false, error: 'name and rules are required' }, { status: 400 });
    }
    const { db } = await getDb();
    await authorizeWorkspace(db, auth.userId, workspaceId);
    await ensureWorkspaceGovernance(db, workspaceId);
    const id = body.id || `ctx-${workspaceId}-${Date.now().toString(36)}`;
    await db.insert(dataContexts).values({
      id,
      workspaceId,
      projectId: body.projectId || null,
      parentContextId: body.parentContextId || null,
      name: body.name,
      description: body.description || null,
      rules: body.rules,
      includedResources: body.includedResources || null,
    }).onConflictDoUpdate({
      target: dataContexts.id,
      set: {
        name: body.name,
        description: body.description || null,
        rules: body.rules,
        includedResources: body.includedResources || null,
        updatedAt: new Date(),
      },
    });
    await recordAuditEvent(db, {
      workspaceId,
      actorUserId: auth.userId,
      action: 'context.upserted',
      resourceType: 'context',
      resourceId: id,
    });
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = validateApiAuth(request);
  if (!auth.authorized) return auth.errorResponse!;
  try {
    const body = await request.json();
    if (!body.id || !body.status) {
      return NextResponse.json({ success: false, error: 'id and status are required' }, { status: 400 });
    }
    const { db } = await getDb();
    const context = await db.select().from(dataContexts).where(eq(dataContexts.id, body.id)).limit(1);
    if (!context[0]) return NextResponse.json({ success: false, error: 'Context not found' }, { status: 404 });
    await authorizeWorkspace(db, auth.userId, context[0].workspaceId);
    await db.update(dataContexts).set({ status: body.status, updatedAt: new Date() })
      .where(and(eq(dataContexts.id, body.id), eq(dataContexts.workspaceId, context[0].workspaceId)));
    return NextResponse.json({ success: true, id: body.id, status: body.status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = validateApiAuth(request);
  if (!auth.authorized) return auth.errorResponse!;
  try {
    const body = await request.json();
    const workspaceId = body.workspaceId || 'ws-acme-corp';
    if (!body.message || !body.category) {
      return NextResponse.json({ success: false, error: 'message and category are required' }, { status: 400 });
    }
    const { db } = await getDb();
    await authorizeWorkspace(db, auth.userId, workspaceId);
    const id = `feedback-${Date.now().toString(36)}`;
    await db.insert(agentFeedback).values({
      id,
      workspaceId,
      contextId: body.contextId || null,
      category: body.category,
      message: body.message,
      metadata: body.metadata || null,
    });
    return NextResponse.json({ success: true, id, status: 'open' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
