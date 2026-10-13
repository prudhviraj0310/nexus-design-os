import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getDb } from '../src/db/index';
import { seedDatabase } from '../src/db/seed';
import { releases, designSystems, tokens } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { POST as releasesPost } from '../src/app/api/releases/route';
import { resetEnvCache } from '../src/server/env';

describe('Phase 7 Database Consistency: Transactions & Atomic Multi-Record Mutations', () => {
  let dbHelper: any;
  const TEST_KEY = 'test-secret-key-12345678901234';

  beforeEach(async () => {
    process.env.NOVA_API_KEY = TEST_KEY;
    resetEnvCache();
    dbHelper = await getDb(':memory:');
    await seedDatabase(dbHelper);
    const { db } = dbHelper;

    // Reset releases table
    await db.delete(releases);
    await db.update(designSystems).set({ version: '1.0.0' }).where(eq(designSystems.id, 'ds-nova-design'));
  });

  afterEach(() => {
    delete process.env.NOVA_API_KEY;
    resetEnvCache();
    vi.restoreAllMocks();
  });

  it('atomically creates release and updates active design system version', async () => {
    const { db } = dbHelper;

    const req = new Request('http://localhost:3000/api/releases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_KEY}`,
      },
      body: JSON.stringify({
        version: '1.2.0',
        title: 'Spring Token Refresh',
        description: 'New tokens',
      }),
    });

    const res = await releasesPost(req);
    expect(res.status).toBe(200);

    // Verify release was recorded
    const allReleases = await db.select().from(releases);
    expect(allReleases.length).toBe(1);
    expect(allReleases[0].version).toBe('1.2.0');

    // Verify design system version was updated
    const [ds] = await db.select().from(designSystems).where(eq(designSystems.id, 'ds-nova-design'));
    expect(ds.version).toBe('1.2.0');
  });

  it('rolls back completely if a failure occurs during multi-record transaction', async () => {
    const { db } = dbHelper;

    // Direct transaction test proving atomic rollback in PGlite
    let caughtError = false;
    try {
      await db.transaction(async (tx: any) => {
        await tx.insert(releases).values({
          id: 'rel-should-rollback',
          designSystemId: 'ds-nova-design',
          version: '9.9.9',
          title: 'Doomed Release',
        });

        // Simulate unexpected failure before transaction commit
        throw new Error('Simulated database write failure midway through transaction');
      });
    } catch (err: any) {
      caughtError = true;
      expect(err.message).toContain('Simulated database write failure');
    }

    expect(caughtError).toBe(true);

    // Verify that NO partial release record was persisted
    const allReleases = await db.select().from(releases);
    expect(allReleases.some((r: any) => r.id === 'rel-should-rollback')).toBe(false);

    // Verify design system version is unchanged
    const [ds] = await db.select().from(designSystems).where(eq(designSystems.id, 'ds-nova-design'));
    expect(ds.version).toBe('1.0.0');
  });
});
