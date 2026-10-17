import { NextResponse } from 'next/server';
import { getDb } from '@/db/index';
import { auditEvents, planSubscriptions, usageCounters, workspaceMembers } from '@/db/schema';
import { validateApiAuth } from '@/server/auth';
import { authorizeWorkspace, ensureWorkspaceGovernance, recordAuditEvent } from '@/server/governance';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const auth = validateApiAuth(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const workspaceId = new URL(request.url).searchParams.get('workspaceId') || 'ws-acme-corp';
    const { db } = await getDb();
    await authorizeWorkspace(db, auth.userId, workspaceId);
    await ensureWorkspaceGovernance(db, workspaceId);
    const [plan] = await db.select().from(planSubscriptions).where(eq(planSubscriptions.workspaceId, workspaceId)).limit(1);
    const members = await db.select().from(workspaceMembers).where(eq(workspaceMembers.workspaceId, workspaceId));
    const usage = await db.select().from(usageCounters).where(eq(usageCounters.workspaceId, workspaceId));
    const events = await db.select().from(auditEvents)
      .where(eq(auditEvents.workspaceId, workspaceId))
      .orderBy(desc(auditEvents.createdAt))
      .limit(50);
    return NextResponse.json({ success: true, workspaceId, plan, members, usage, auditEvents: events });
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
    const { db } = await getDb();
    await authorizeWorkspace(db, auth.userId, workspaceId);
    await ensureWorkspaceGovernance(db, workspaceId);
    await recordAuditEvent(db, {
      workspaceId,
      actorUserId: auth.userId,
      action: body.action || 'governance.updated',
      resourceType: body.resourceType || 'workspace',
      resourceId: body.resourceId,
      metadata: body.metadata,
    });
    return NextResponse.json({ success: true, workspaceId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
