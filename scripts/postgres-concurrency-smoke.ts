import { getDb } from '../src/db/index';
import { enqueueJob, claimNextJob, completeJob } from '../src/core/jobs/queue';
import { backgroundJobs } from '../src/db/schema';

const workspaceId = process.env.NOVA_DEFAULT_WORKSPACE_ID || 'ws-acme-corp';
const totalJobs = Number(process.env.CONCURRENCY_SMOKE_JOBS || 50);
const workers = Number(process.env.CONCURRENCY_SMOKE_WORKERS || 4);

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Start docker-compose.postgres.yml and provide the PostgreSQL URL.');
}

const { db } = await getDb();
const jobIds: string[] = [];
for (let index = 0; index < totalJobs; index += 1) {
  jobIds.push(await enqueueJob(db, { workspaceId, type: 'concurrency.smoke', payload: { index } }));
}

const claimed = new Set<string>();
await Promise.all(Array.from({ length: workers }, async (_, workerIndex) => {
  while (claimed.size < totalJobs) {
    const job = await claimNextJob(db, workspaceId, 'concurrency.smoke');
    if (!job) break;
    if (claimed.has(job.id)) throw new Error(`Duplicate claim detected for ${job.id}.`);
    claimed.add(job.id);
    await completeJob(db, job.id, workspaceId, { workerIndex });
  }
}));

const unfinished = await db.select().from(backgroundJobs);
const remaining = unfinished.filter((job: any) => jobIds.includes(job.id) && job.status !== 'completed');
if (claimed.size !== totalJobs || remaining.length > 0) {
  throw new Error(`Concurrency smoke failed: claimed ${claimed.size}/${totalJobs}, unfinished ${remaining.length}.`);
}
console.log(`PostgreSQL concurrency smoke passed: ${totalJobs} jobs, ${workers} workers.`);
