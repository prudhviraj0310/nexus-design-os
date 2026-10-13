import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getDb } from '../src/db/index';
import { seedDatabase } from '../src/db/seed';
import { tokens, projects, designSystems } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { POST as figmaSyncPost } from '../src/app/api/figma/sync/route';
import { FigmaClient } from '../src/core/figma/client';
import { resetEnvCache } from '../src/server/env';

describe('Phase 3 Correctness: Figma Synchronization & Deletion Isolation', () => {
  let dbHelper: any;
  const TEST_KEY = 'test-secret-key-12345678901234';

  beforeEach(async () => {
    process.env.NOVA_API_KEY = TEST_KEY;
    resetEnvCache();
    dbHelper = await getDb(':memory:');
    await seedDatabase(dbHelper);
    const { db } = dbHelper;

    // Create separate design system for cross-tenant / cross-project isolation tests
    await db.insert(projects).values({
      id: 'proj-other-tenant',
      workspaceId: 'ws-acme-corp',
      name: 'Other Tenant Project',
      slug: 'other-tenant',
    }).onConflictDoNothing();

    await db.insert(designSystems).values({
      id: 'ds-other-tenant',
      projectId: 'proj-other-tenant',
      name: 'Other Tenant System',
      version: '1.0.0',
    }).onConflictDoNothing();

    // Clean tokens table
    await db.delete(tokens);

    // Seed target design system tokens
    await db.insert(tokens).values([
      {
        id: 'tok-color-brand-primary',
        designSystemId: 'ds-nova-design',
        name: 'primary',
        path: 'color.brand.primary',
        category: 'color',
        type: 'color',
        rawValue: '#3b82f6',
        resolvedValue: '#3b82f6',
      },
      {
        id: 'tok-color-brand-deleted',
        designSystemId: 'ds-nova-design',
        name: 'deletedToken',
        path: 'color.brand.deleted',
        category: 'color',
        type: 'color',
        rawValue: '#ff0000',
        resolvedValue: '#ff0000',
      },
      // Seed token in a separate design system (multi-tenant boundary)
      {
        id: 'tok-other-tenant-token',
        designSystemId: 'ds-other-tenant',
        name: 'otherToken',
        path: 'color.other.tenant',
        category: 'color',
        type: 'color',
        rawValue: '#00ff00',
        resolvedValue: '#00ff00',
      },
    ]);
  });

  afterEach(() => {
    delete process.env.NOVA_API_KEY;
    resetEnvCache();
    vi.restoreAllMocks();
  });

  it('dry-run reports removed token in diff without deleting it from the database', async () => {
    const { db } = dbHelper;

    // Mock FigmaClient to return variables without color.brand.deleted
    vi.spyOn(FigmaClient.prototype, 'getVariables').mockResolvedValueOnce({
      status: 200,
      meta: {
        variableCollections: {
          'col:1': { id: 'col:1', name: 'Colors', modes: [{ modeId: 'm:1', name: 'Light' }], defaultModeId: 'm:1' },
        },
        variables: {
          'var:1': {
            id: 'var:1',
            name: 'color/brand/primary',
            key: 'key-1',
            variableCollectionId: 'col:1',
            resolvedType: 'COLOR',
            valuesByMode: { 'm:1': { r: 0.23, g: 0.51, b: 0.96, a: 1 } },
          },
        },
      },
    });

    const req = new Request('http://localhost:3000/api/figma/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_KEY}`,
      },
      body: JSON.stringify({
        fileKey: 'sample-file',
        dryRun: true,
        applyChanges: true, // dryRun should override this!
      }),
    });

    const res = await figmaSyncPost(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.applied).toBe(false);
    expect(data.deletedCount).toBe(0);

    const removedItem = data.diff.find((d: any) => d.status === 'removed');
    expect(removedItem).toBeDefined();
    expect(removedItem.path).toBe('color.brand.deleted');

    // Verify token still exists in database because it was a dry-run
    const dbTokens = await db.select().from(tokens).where(eq(tokens.designSystemId, 'ds-nova-design'));
    expect(dbTokens.some((t: any) => t.path === 'color.brand.deleted')).toBe(true);
  });

  it('persists deletion when live sync applies changes, while preserving other design systems', async () => {
    const { db } = dbHelper;

    // Mock FigmaClient returning snapshot where color.brand.deleted is absent
    vi.spyOn(FigmaClient.prototype, 'getVariables').mockResolvedValueOnce({
      status: 200,
      meta: {
        variableCollections: {
          'col:1': { id: 'col:1', name: 'Colors', modes: [{ modeId: 'm:1', name: 'Light' }], defaultModeId: 'm:1' },
        },
        variables: {
          'var:1': {
            id: 'var:1',
            name: 'color/brand/primary',
            key: 'key-1',
            variableCollectionId: 'col:1',
            resolvedType: 'COLOR',
            valuesByMode: { 'm:1': { r: 0.23, g: 0.51, b: 0.96, a: 1 } },
          },
        },
      },
    });

    const req = new Request('http://localhost:3000/api/figma/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_KEY}`,
      },
      body: JSON.stringify({
        fileKey: 'sample-file',
        figmaToken: 'figma-mock-pat',
        dryRun: false,
        applyChanges: true,
        designSystemId: 'ds-nova-design',
      }),
    });

    const res = await figmaSyncPost(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.applied).toBe(true);
    expect(data.deletedCount).toBe(1);

    // Target design system: deleted token must be GONE
    const currentTokens = await db.select().from(tokens).where(eq(tokens.designSystemId, 'ds-nova-design'));
    expect(currentTokens.some((t: any) => t.path === 'color.brand.deleted')).toBe(false);
    expect(currentTokens.some((t: any) => t.path === 'color.brand.primary')).toBe(true);

    // Cross-project isolation: other tenant tokens MUST remain untouched!
    const otherTenantTokens = await db.select().from(tokens).where(eq(tokens.designSystemId, 'ds-other-tenant'));
    expect(otherTenantTokens.length).toBe(1);
    expect(otherTenantTokens[0].path).toBe('color.other.tenant');
  });

  it('aborts synchronization and prevents deletions on empty or incomplete snapshots', async () => {
    const { db } = dbHelper;

    // Mock FigmaClient returning an empty collection
    vi.spyOn(FigmaClient.prototype, 'getVariables').mockResolvedValueOnce({
      status: 200,
      meta: {
        variableCollections: {},
        variables: {},
      },
    });

    const req = new Request('http://localhost:3000/api/figma/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_KEY}`,
      },
      body: JSON.stringify({
        fileKey: 'sample-file',
        figmaToken: 'figma-mock-pat',
        dryRun: false,
        applyChanges: true,
      }),
    });

    const res = await figmaSyncPost(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('Sync aborted to prevent accidental data loss');

    // Existing tokens must NOT have been wiped
    const currentTokens = await db.select().from(tokens).where(eq(tokens.designSystemId, 'ds-nova-design'));
    expect(currentTokens.length).toBe(2);
  });
});
