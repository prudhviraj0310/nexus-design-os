import { NextResponse } from 'next/server';
import { getDb } from '@/db/index';
import { backgroundJobs } from '@/db/schema';
import { claimNextJob, completeJob, enqueueJob, failJob } from '@/core/jobs/queue';
import { validateApiAuth } from '@/server/auth';
import { isAuthEnabled } from '@/server/env';
import { authorizeWorkspace } from '@/server/governance';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const auth = validateApiAuth(request);
  if (!auth.authorized) return auth.errorResponse!;
  try {
    const workspaceId = new URL(request.url).searchParams.get('workspaceId') || 'ws-acme-corp';
    const { db } = await getDb();
    await authorizeWorkspace(db, auth.userId, workspaceId);
    const jobs = await db.select().from(backgroundJobs)
      .where(eq(backgroundJobs.workspaceId, workspaceId))
      .orderBy(desc(backgroundJobs.createdAt)).limit(100);
    return NextResponse.json({ success: true, jobs });
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
    const workspaceId = body.workspaceId || 'ws-acme-corp';
    const workerToken = request.headers.get('x-worker-token');
    const isWorker = Boolean(process.env.NOVA_WORKER_TOKEN && workerToken === process.env.NOVA_WORKER_TOKEN);
    if ((body.action === 'claim' || body.action === 'complete' || body.action === 'fail') && !isWorker) {
      if (isAuthEnabled() || auth.userId !== 'local-operator') {
        return NextResponse.json({ success: false, error: 'Worker credentials required.' }, { status: 403 });
      }
    }
    await authorizeWorkspace(db, auth.userId, workspaceId);
    if (body.action === 'claim') {
      const job = await claimNextJob(db, workspaceId, body.type);
      return NextResponse.json({ success: true, job });
    }
    if (body.action === 'complete' && body.id) {
      await completeJob(db, body.id, workspaceId, body.result || {});
      return NextResponse.json({ success: true, id: body.id, status: 'completed' });
    }
    if (body.action === 'fail' && body.id) {
      await failJob(db, body.id, workspaceId, body.error || 'Job failed');
      return NextResponse.json({ success: true, id: body.id, status: 'failed' });
    }
    if (!body.workspaceId || !body.type) {
      return NextResponse.json({ success: false, error: 'workspaceId and type are required' }, { status: 400 });
    }
    const id = await enqueueJob(db, { workspaceId: body.workspaceId, type: body.type, payload: body.payload || {} });
    return NextResponse.json({ success: true, id, status: 'queued' }, { status: 202 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
