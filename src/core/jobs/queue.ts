import { and, asc, eq, lte } from 'drizzle-orm';
import { backgroundJobs, deadLetterJobs } from '@/db/schema';

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed';

export async function enqueueJob(
  db: any,
  input: { workspaceId: string; type: string; payload: Record<string, unknown>; runAfter?: Date }
) {
  const id = `job-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  await db.insert(backgroundJobs).values({
    id,
    workspaceId: input.workspaceId,
    type: input.type,
    payload: input.payload,
    runAfter: input.runAfter || new Date(),
  });
  return id;
}

export async function claimNextJob(db: any, workspaceId: string, type?: string) {
  await db.execute(`UPDATE background_jobs SET status = 'queued', lease_until = NULL WHERE status = 'running' AND lease_until IS NOT NULL AND lease_until < NOW()`);
  const conditions = [
    eq(backgroundJobs.status, 'queued'),
    lte(backgroundJobs.runAfter, new Date()),
    eq(backgroundJobs.workspaceId, workspaceId),
    ...(type ? [eq(backgroundJobs.type, type)] : []),
  ];
  const candidates = await db.select().from(backgroundJobs)
    .where(and(...conditions))
    .orderBy(asc(backgroundJobs.createdAt))
    .limit(1);
  const job = candidates[0];
  if (!job) return null;
  await db.update(backgroundJobs)
    .set({ status: job.attempts + 1 >= job.maxAttempts ? 'failed' : 'running', attempts: job.attempts + 1, leaseUntil: new Date(Date.now() + 15 * 60 * 1000) })
    .where(and(eq(backgroundJobs.id, job.id), eq(backgroundJobs.status, 'queued')));
  const [claimed] = await db.select().from(backgroundJobs).where(eq(backgroundJobs.id, job.id)).limit(1);
  return claimed?.status === 'running' ? claimed : null;
}

export async function completeJob(db: any, id: string, workspaceId: string, result: Record<string, unknown>) {
  await db.update(backgroundJobs)
    .set({ status: 'completed', result, leaseUntil: null, completedAt: new Date() })
    .where(and(eq(backgroundJobs.id, id), eq(backgroundJobs.workspaceId, workspaceId), eq(backgroundJobs.status, 'running')));
}

export async function failJob(db: any, id: string, workspaceId: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const [job] = await db.select().from(backgroundJobs).where(and(eq(backgroundJobs.id, id), eq(backgroundJobs.workspaceId, workspaceId))).limit(1);
  if (!job) return;
  const retryable = job.attempts < job.maxAttempts;
  if (!retryable) {
    await db.insert(deadLetterJobs).values({
      id: `dlq-${job.id}`,
      originalJobId: job.id,
      workspaceId,
      type: job.type,
      payload: job.payload,
      attempts: job.attempts,
      error: message,
    }).onConflictDoNothing();
  }
  await db.update(backgroundJobs)
    .set({
      status: retryable ? 'queued' : 'failed',
      error: message,
      leaseUntil: null,
      runAfter: retryable ? new Date(Date.now() + Math.min(60_000, 1000 * 2 ** Math.max(0, job.attempts - 1))) : job.runAfter,
      completedAt: retryable ? null : new Date(),
    })
    .where(and(eq(backgroundJobs.id, id), eq(backgroundJobs.workspaceId, workspaceId), eq(backgroundJobs.status, 'running')));
}
