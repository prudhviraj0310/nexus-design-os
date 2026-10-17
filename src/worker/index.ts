import { getDb } from '@/db/index';
import { claimNextJob, completeJob, failJob } from '@/core/jobs/queue';
import { components, dataSources, designSystems, syncJobs, tokens } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { parseStorybookIndex, parseTokensStudioDocument } from '@/core/integrations/adapters';

function validateSourceUrl(rawUrl: unknown): string {
  if (typeof rawUrl !== 'string') throw new Error('Data source URL is required.');
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Data source URL is invalid.');
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Data source URL must use HTTP or HTTPS.');
  }
  if (process.env.NODE_ENV === 'production' &&
      ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(parsed.hostname)) {
    throw new Error('Local data source URLs are not allowed in production.');
  }
  return parsed.toString();
}

async function runOnce() {
  if (!process.env.DATABASE_URL && process.env.NOVA_ALLOW_EMBEDDED_WORKER !== 'true') {
    throw new Error(
      'A separate worker requires DATABASE_URL for PostgreSQL. Set NOVA_ALLOW_EMBEDDED_WORKER=true only for isolated local runs.',
    );
  }
  const workspaceId = process.env.NOVA_WORKER_WORKSPACE_ID || process.env.NOVA_DEFAULT_WORKSPACE_ID || 'ws-acme-corp';
  const { db } = await getDb();
  const job = await claimNextJob(db, workspaceId);
  if (!job) return false;
  try {
    switch (job.type) {
      case 'source.sync': {
        const sourceRows = await db.select().from(dataSources)
          .where(eq(dataSources.id, (job.payload as any).dataSourceId)).limit(1);
        if (!sourceRows[0]) throw new Error('Data source no longer exists.');
        const source = sourceRows[0];
        const config = source.config as Record<string, any>;
        const response = await fetch(validateSourceUrl(config.url));
        if (!response.ok) throw new Error(`Source returned HTTP ${response.status}.`);
        const payload = await response.json();
        const normalized = source.provider === 'storybook'
          ? parseStorybookIndex(payload)
          : source.provider === 'tokens-studio'
            ? parseTokensStudioDocument(payload)
            : payload;
        let persistedCount = Array.isArray(normalized) ? normalized.length : 1;
        if (source.projectId) {
          const systems = await db.select().from(designSystems)
            .where(eq(designSystems.projectId, source.projectId)).limit(1);
          const designSystem = systems[0];
          if (designSystem && source.provider === 'storybook' && Array.isArray(normalized)) {
            for (const story of normalized as Array<Record<string, any>>) {
              if (!story.id) continue;
              await db.insert(components).values({
                id: `storybook-${source.id}-${story.id}`.slice(0, 255),
                designSystemId: designSystem.id,
                name: String(story.title || story.name || story.id),
                category: 'storybook',
                framework: String(config.framework || 'react'),
                description: story.parameters?.docs?.description?.component || null,
                props: story.args || {},
                variants: story.parameters || null,
                codeSnippet: null,
                tokenDependencies: null,
                repositoryName: config.repository || null,
                status: 'ready',
                isDeprecated: false,
              }).onConflictDoUpdate({
                target: components.id,
                set: {
                  name: String(story.title || story.name || story.id),
                  props: story.args || {},
                  variants: story.parameters || null,
                  status: 'ready',
                },
              });
            }
          }
          if (designSystem && source.provider === 'tokens-studio' && Array.isArray(normalized)) {
            const versionId = `ver-draft-${designSystem.id}`;
            const brandId = `brand-default-${designSystem.id}`;
            for (const token of normalized as Array<Record<string, any>>) {
              const path = String(token.path);
              const rawValue = String(token.rawValue);
              const isAlias = rawValue.startsWith('{') && rawValue.endsWith('}');
              await db.insert(tokens).values({
                id: `token-${designSystem.id}-${path.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
                persistentId: `pid-${designSystem.id}-${path.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
                designSystemId: designSystem.id,
                versionId,
                brandId,
                originSourceId: source.id,
                name: String(token.name || path.split('.').pop() || path),
                path,
                category: String(token.category || 'custom'),
                type: String(token.type || 'string'),
                rawValue,
                resolvedValue: rawValue,
                isAlias,
                aliasTarget: isAlias ? rawValue.slice(1, -1).trim() : null,
                description: token.description || null,
              }).onConflictDoUpdate({
                target: tokens.id,
                set: {
                  rawValue,
                  resolvedValue: rawValue,
                  category: String(token.category || 'custom'),
                  type: String(token.type || 'string'),
                  isAlias,
                  aliasTarget: isAlias ? rawValue.slice(1, -1).trim() : null,
                  description: token.description || null,
                  originSourceId: source.id,
                },
              });
            }
          }
        }
        const syncJobId = (job.payload as any).syncJobId;
        if (syncJobId) {
          await db.update(syncJobs).set({ status: 'completed', output: { count: persistedCount, normalized }, completedAt: new Date() })
            .where(eq(syncJobs.id, syncJobId));
        }
        await db.update(dataSources).set({ lastSyncedAt: new Date(), updatedAt: new Date() })
          .where(and(eq(dataSources.id, source.id), eq(dataSources.workspaceId, workspaceId)));
        await completeJob(db, job.id, workspaceId, { provider: source.provider, count: persistedCount });
        break;
      }
      case 'feedback.remediation':
        await completeJob(db, job.id, workspaceId, { accepted: true, payload: job.payload });
        break;
      default:
        throw new Error(`No worker handler registered for job type "${job.type}".`);
    }
  } catch (error) {
    await failJob(db, job.id, workspaceId, error);
  }
  return true;
}

const continuous = process.argv.includes('--continuous');
do {
  const processed = await runOnce();
  if (!continuous || !processed) break;
} while (true);
