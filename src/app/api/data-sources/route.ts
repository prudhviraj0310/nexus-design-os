import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db/index';
import { dataSources, syncJobs } from '@/db/schema';
import { validateApiAuth } from '@/server/auth';
import { authorizeWorkspace, ensureWorkspaceGovernance } from '@/server/governance';
import { enqueueJob } from '@/core/jobs/queue';

export async function GET(request: Request) {
  const auth = validateApiAuth(request);
  if (!auth.authorized) return auth.errorResponse!;
  try {
    const workspaceId = new URL(request.url).searchParams.get('workspaceId') || 'ws-acme-corp';
    const { db } = await getDb();
    await authorizeWorkspace(db, auth.userId, workspaceId);
    const sources = await db.select().from(dataSources).where(eq(dataSources.workspaceId, workspaceId));
    return NextResponse.json({ success: true, sources });
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
    if (!body.provider || !body.name) {
      return NextResponse.json({ success: false, error: 'provider and name are required' }, { status: 400 });
    }
    const { db } = await getDb();
    await authorizeWorkspace(db, auth.userId, workspaceId);
    await ensureWorkspaceGovernance(db, workspaceId);
    const id = body.id || `source-${Date.now().toString(36)}`;
    await db.insert(dataSources).values({
      id,
      workspaceId,
      projectId: body.projectId || null,
      provider: body.provider,
      name: body.name,
      config: body.config || {},
    }).onConflictDoUpdate({
      target: dataSources.id,
      set: { name: body.name, config: body.config || {}, status: body.status || 'active', updatedAt: new Date() },
    });
    const jobId = `sync-${Date.now().toString(36)}`;
    await db.insert(syncJobs).values({
      id: jobId,
      dataSourceId: id,
      type: body.syncType || 'manual',
      input: body.input || {},
    });
    const backgroundJobId = await enqueueJob(db, {
      workspaceId,
      type: 'source.sync',
      payload: { dataSourceId: id, syncJobId: jobId, provider: body.provider },
    });
    return NextResponse.json({ success: true, sourceId: id, syncJobId: jobId, backgroundJobId, status: 'queued' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
