import { describe, it, expect, beforeAll } from 'vitest';
import { getDb } from '../src/db/index';
import { releases, designSystems } from '../src/db/schema';
import { seedDatabase } from '../src/db/seed';
import { eq } from 'drizzle-orm';

describe('Design System Releases & Version Publishing', () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  it('contains seeded release records', async () => {
    const { db } = await getDb();
    const allReleases = await db.select().from(releases);
    expect(allReleases.length).toBeGreaterThanOrEqual(2);

    const v1_0 = allReleases.find((r: any) => r.version === '1.0.0');
    expect(v1_0).toBeDefined();
    expect(v1_0?.title).toContain('Initial Token Foundation');
  });

  it('can publish a new release snapshot and update system version', async () => {
    const { db } = await getDb();
    const newVersion = `1.4.0-${Date.now()}`;
    const releaseId = `rel-${newVersion}`;

    await db.insert(releases).values({
      id: releaseId,
      designSystemId: 'ds-nova-design',
      version: newVersion,
      title: 'Test Integration Release',
      description: 'Automated release test',
      tokensCount: 20,
      componentsCount: 4,
      changelog: '• Automated test verification',
    });

    await db.update(designSystems)
      .set({ version: newVersion })
      .where(eq(designSystems.id, 'ds-nova-design'));

    const updatedDs = await db.select().from(designSystems).where(eq(designSystems.id, 'ds-nova-design'));
    expect(updatedDs[0].version).toBe(newVersion);

    const checkRelease = await db.select().from(releases).where(eq(releases.id, releaseId));
    expect(checkRelease).toHaveLength(1);
    expect(checkRelease[0].version).toBe(newVersion);
  });
});
