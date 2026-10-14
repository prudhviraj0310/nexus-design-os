import { describe, it, expect, beforeEach } from 'vitest';
import { getDb, initializeSchema } from '../src/db';
import { workspaces, projects, designSystems, tokens, themes, tokenOverrides } from '../src/db/schema';
import { eq } from 'drizzle-orm';

describe('Phase 1: Additive Database Migrations, Relational Integrity & Persistence', () => {
  let db: any;
  let client: any;

  beforeEach(async () => {
    // Isolated in-memory instance
    const res = await getDb(':memory:');
    db = res.db;
    client = res.client;
  });

  it('executes additive schema DDL idempotently without throwing', async () => {
    // Calling initializeSchema again simulates repeated migrations
    await expect(initializeSchema(client)).resolves.not.toThrow();
    await expect(initializeSchema(client)).resolves.not.toThrow();
  });

  it('persists and retrieves multi-brand themes and token overrides', async () => {
    const wsId = 'ws-test-mig';
    const projId = 'proj-test-mig';
    const dsId = 'ds-test-mig';

    await db.insert(workspaces).values({ id: wsId, name: 'Test Org', slug: 'test-org-mig' });
    await db.insert(projects).values({ id: projId, workspaceId: wsId, name: 'Core Project', slug: 'core-mig' });
    await db.insert(designSystems).values({ id: dsId, projectId: projId, name: 'Aurora DS', version: '1.0.0' });

    // 1. Insert Base Theme
    await db.insert(themes).values({
      id: 'theme-root',
      designSystemId: dsId,
      name: 'Default Light',
      codeName: 'light',
      isDefault: true,
    });

    // 2. Insert Child Theme
    await db.insert(themes).values({
      id: 'theme-dark',
      designSystemId: dsId,
      name: 'Midnight Dark',
      codeName: 'dark',
      parentThemeId: 'theme-root',
    });

    const retrievedThemes = await db.select().from(themes).where(eq(themes.designSystemId, dsId));
    expect(retrievedThemes).toHaveLength(2);

    const darkTheme = retrievedThemes.find((t: any) => t.id === 'theme-dark');
    expect(darkTheme.parentThemeId).toBe('theme-root');
    expect(darkTheme.codeName).toBe('dark');

    // 3. Insert Token Override
    await db.insert(tokenOverrides).values({
      id: 'ov-1',
      themeId: 'theme-dark',
      tokenPath: 'color.bg.surface',
      rawValue: '#0f172a',
      resolvedValue: '#0f172a',
      rawValueJson: '#0f172a',
      resolvedValueJson: '#0f172a',
      isComposite: false,
    });

    const retrievedOverrides = await db.select().from(tokenOverrides).where(eq(tokenOverrides.themeId, 'theme-dark'));
    expect(retrievedOverrides).toHaveLength(1);
    expect(retrievedOverrides[0].tokenPath).toBe('color.bg.surface');
    expect(retrievedOverrides[0].resolvedValue).toBe('#0f172a');
  });

  it('persists structured composite tokens with is_composite and JSON columns', async () => {
    const wsId = 'ws-comp-test';
    const projId = 'proj-comp-test';
    const dsId = 'ds-comp-test';

    await db.insert(workspaces).values({ id: wsId, name: 'Comp Org', slug: 'comp-org' });
    await db.insert(projects).values({ id: projId, workspaceId: wsId, name: 'Comp Project', slug: 'comp-proj' });
    await db.insert(designSystems).values({ id: dsId, projectId: projId, name: 'Comp DS', version: '1.0.0' });

    const typographyData = {
      fontFamily: 'Inter, sans-serif',
      fontSize: '24px',
      fontWeight: 600,
      lineHeight: '1.3',
    };

    await db.insert(tokens).values({
      id: 'tok-heading-h2',
      designSystemId: dsId,
      name: 'h2',
      path: 'typography.heading.h2',
      category: 'typography',
      type: 'typography',
      rawValue: JSON.stringify(typographyData),
      resolvedValue: JSON.stringify(typographyData),
      isComposite: true,
      rawValueJson: typographyData,
      resolvedValueJson: typographyData,
    });

    const retrieved = await db.select().from(tokens).where(eq(tokens.id, 'tok-heading-h2'));
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].isComposite).toBe(true);
    expect(retrieved[0].resolvedValueJson).toEqual(typographyData);
  });

  it('enforces relational integrity: cascades delete when design system is removed', async () => {
    const wsId = 'ws-casc-test';
    const projId = 'proj-casc-test';
    const dsId = 'ds-casc-test';

    await db.insert(workspaces).values({ id: wsId, name: 'Casc Org', slug: 'casc-org' });
    await db.insert(projects).values({ id: projId, workspaceId: wsId, name: 'Casc Project', slug: 'casc-proj' });
    await db.insert(designSystems).values({ id: dsId, projectId: projId, name: 'Casc DS', version: '1.0.0' });

    await db.insert(themes).values({
      id: 'theme-casc',
      designSystemId: dsId,
      name: 'Casc Theme',
      codeName: 'casc-theme',
    });

    await db.insert(tokenOverrides).values({
      id: 'ov-casc',
      themeId: 'theme-casc',
      tokenPath: 'color.brand',
      rawValue: '#123456',
      resolvedValue: '#123456',
    });

    // Delete the design system
    await db.delete(designSystems).where(eq(designSystems.id, dsId));

    // Confirm themes and token_overrides are cascade deleted
    const themesLeft = await db.select().from(themes).where(eq(themes.id, 'theme-casc'));
    expect(themesLeft).toHaveLength(0);

    const overridesLeft = await db.select().from(tokenOverrides).where(eq(tokenOverrides.id, 'ov-casc'));
    expect(overridesLeft).toHaveLength(0);
  });

  it('enforces database-level compound uniqueness on duplicate overrides', async () => {
    const wsId = 'ws-uniq-test';
    const projId = 'proj-uniq-test';
    const dsId = 'ds-uniq-test';

    await db.insert(workspaces).values({ id: wsId, name: 'Uniq Org', slug: 'uniq-org' });
    await db.insert(projects).values({ id: projId, workspaceId: wsId, name: 'Uniq Project', slug: 'uniq-proj' });
    await db.insert(designSystems).values({ id: dsId, projectId: projId, name: 'Uniq DS', version: '1.0.0' });

    await db.insert(themes).values({
      id: 'theme-uniq',
      designSystemId: dsId,
      name: 'Uniq Theme',
      codeName: 'uniq-theme',
    });

    await db.insert(tokenOverrides).values({
      id: 'ov-uniq-1',
      themeId: 'theme-uniq',
      tokenPath: 'color.brand',
      rawValue: '#111111',
      resolvedValue: '#111111',
    });

    // Attempting to insert a duplicate override for the same (themeId, tokenPath) must reject at DB level!
    await expect(
      db.insert(tokenOverrides).values({
        id: 'ov-uniq-2',
        themeId: 'theme-uniq',
        tokenPath: 'color.brand',
        rawValue: '#222222',
        resolvedValue: '#222222',
      })
    ).rejects.toThrow();
  });
});
