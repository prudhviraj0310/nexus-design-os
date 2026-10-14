import { describe, it, expect, beforeEach } from 'vitest';
import { getDb, initializeSchema, runFoundationMigration } from '../src/db/index';
import { workspaces, projects, designSystems, designSystemVersions, brands, tokens, themes, tokenOverrides } from '../src/db/schema';
import { eq, and } from 'drizzle-orm';
import { FlatToken, Theme, TokenOverride } from '../src/core/tokens/types';
import { reconcileTokens, AmbiguousTokenMatchError } from '../src/core/tokens/reconciler';
import { resolveTokenAliases } from '../src/core/tokens/resolver';
import { resolveThemeTokens, ThemeBrandIsolationError } from '../src/core/tokens/themes';
import { exportToCss } from '../src/core/exporters/css';
import { exportToSwift } from '../src/core/exporters/swift';
import { exportToKotlin } from '../src/core/exporters/kotlin';
import { exportToJson } from '../src/core/exporters/json';

describe('Phase 2: Foundational Identity and Data Model', () => {
  let db: any;
  let client: any;

  beforeEach(async () => {
    const res = await getDb(':memory:');
    db = res.db;
    client = res.client;
  });

  it('preserves existing token records during migration and backfills persistent_id, version_id, and brand_id', async () => {
    const wsId = 'ws-found-mig';
    const projId = 'proj-found-mig';
    const dsId = 'ds-found-mig';

    await db.insert(workspaces).values({ id: wsId, name: 'Found Org', slug: 'found-org' });
    await db.insert(projects).values({ id: projId, workspaceId: wsId, name: 'Found Proj', slug: 'found-proj' });
    await db.insert(designSystems).values({ id: dsId, projectId: projId, name: 'Found DS', version: '1.0.0' });

    // Insert legacy token without persistent_id, version_id, or brand_id
    await db.insert(tokens).values({
      id: 'tok-legacy-blue',
      designSystemId: dsId,
      name: 'blue',
      path: 'color.primitive.blue',
      category: 'color',
      type: 'color',
      rawValue: '#2563eb',
      resolvedValue: '#2563eb',
      isAlias: false,
    });

    // Run migration/backfill
    await runFoundationMigration(client);

    // Verify token survived
    const retrievedTokens = await db.select().from(tokens).where(eq(tokens.id, 'tok-legacy-blue'));
    expect(retrievedTokens).toHaveLength(1);
    const tok = retrievedTokens[0];

    // Assert stable persistent identity was deterministically seeded
    expect(tok.persistentId).toBe('tok-legacy-blue');
    expect(tok.versionId).toBe(`ver-draft-${dsId}`);
    expect(tok.brandId).toBe(`brand-default-${dsId}`);

    // Verify draft container and default brand exist
    const draftVersions = await db.select().from(designSystemVersions).where(eq(designSystemVersions.designSystemId, dsId));
    expect(draftVersions).toHaveLength(1);
    expect(draftVersions[0].isDraft).toBe(true);

    const defaultBrands = await db.select().from(brands).where(eq(brands.designSystemId, dsId));
    expect(defaultBrands).toHaveLength(1);
    expect(defaultBrands[0].isDefault).toBe(true);
  });

  it('ensures repeated imports preserve persistent identity idempotently', () => {
    const existing: FlatToken[] = [
      {
        id: 'tok-1',
        persistentId: 'pid-101',
        originSourceId: 'figma-var-101',
        name: 'primary',
        path: 'color.brand.primary',
        category: 'color',
        type: 'color',
        rawValue: '#3b82f6',
        resolvedValue: '#3b82f6',
        isAlias: false,
      },
    ];

    const incoming: FlatToken[] = [
      {
        name: 'primary',
        path: 'color.brand.primary',
        category: 'color',
        type: 'color',
        rawValue: '#2563eb', // updated color value
        resolvedValue: '#2563eb',
        isAlias: false,
        originSourceId: 'figma-var-101',
      },
    ];

    const result = reconcileTokens(existing, incoming);
    expect(result.tokens).toHaveLength(1);
    expect(result.tokens[0].persistentId).toBe('pid-101'); // Preserved!
    expect(result.tokens[0].rawValue).toBe('#2563eb'); // Updated!
    expect(result.renamed).toHaveLength(0);
    expect(result.updated).toHaveLength(1);
  });

  it('reconciles renames via originSourceId without generating duplicate identities', () => {
    const existing: FlatToken[] = [
      {
        id: 'tok-blue',
        persistentId: 'pid-brand-color',
        originSourceId: 'figma-var-brand-action',
        name: 'blue',
        path: 'color.primitive.blue',
        category: 'color',
        type: 'color',
        rawValue: '#2563eb',
        resolvedValue: '#2563eb',
        isAlias: false,
      },
    ];

    // Incoming token has been renamed from 'color.primitive.blue' to 'color.brand.action'
    const incoming: FlatToken[] = [
      {
        name: 'action',
        path: 'color.brand.action',
        category: 'color',
        type: 'color',
        rawValue: '#2563eb',
        resolvedValue: '#2563eb',
        isAlias: false,
        originSourceId: 'figma-var-brand-action', // Same Figma variable ID!
      },
    ];

    const result = reconcileTokens(existing, incoming);
    expect(result.tokens).toHaveLength(1);
    expect(result.tokens[0].persistentId).toBe('pid-brand-color'); // Persistent ID retained!
    expect(result.tokens[0].path).toBe('color.brand.action'); // New path!
    expect(result.renamed).toHaveLength(1);
    expect(result.renamed[0].oldPath).toBe('color.primitive.blue');
    expect(result.renamed[0].newPath).toBe('color.brand.action');
    expect(result.renamed[0].persistentId).toBe('pid-brand-color');
  });

  it('produces explicit diagnostics when matching encounters ambiguous identities', () => {
    const existing: FlatToken[] = [
      {
        id: 'tok-1',
        persistentId: 'pid-1',
        originSourceId: 'figma-dup-1',
        name: 'a',
        path: 'color.a',
        category: 'color',
        type: 'color',
        rawValue: '#111111',
        resolvedValue: '#111111',
        isAlias: false,
      },
      {
        id: 'tok-2',
        persistentId: 'pid-2',
        originSourceId: 'figma-dup-1', // Conflicting duplicate origin ID in existing tokens!
        name: 'b',
        path: 'color.b',
        category: 'color',
        type: 'color',
        rawValue: '#222222',
        resolvedValue: '#222222',
        isAlias: false,
      },
    ];

    const incoming: FlatToken[] = [
      {
        name: 'c',
        path: 'color.c',
        category: 'color',
        type: 'color',
        rawValue: '#333333',
        resolvedValue: '#333333',
        isAlias: false,
        originSourceId: 'figma-dup-1',
      },
    ];

    expect(() => {
      reconcileTokens(existing, incoming);
    }).toThrow(AmbiguousTokenMatchError);
  });

  it('refactors alias references after token rename', () => {
    const existing: FlatToken[] = [
      {
        id: 'tok-blue',
        persistentId: 'pid-blue',
        originSourceId: 'figma-blue',
        name: 'blue',
        path: 'color.primitive.blue',
        category: 'color',
        type: 'color',
        rawValue: '#3b82f6',
        resolvedValue: '#3b82f6',
        isAlias: false,
      },
      {
        id: 'tok-button',
        persistentId: 'pid-button',
        name: 'buttonBg',
        path: 'color.button.bg',
        category: 'color',
        type: 'color',
        rawValue: '{color.primitive.blue}',
        resolvedValue: '#3b82f6',
        isAlias: true,
        aliasTarget: 'color.primitive.blue',
      },
    ];

    // Renaming 'color.primitive.blue' to 'color.primitive.sky'
    const incoming: FlatToken[] = [
      {
        name: 'sky',
        path: 'color.primitive.sky',
        category: 'color',
        type: 'color',
        rawValue: '#3b82f6',
        resolvedValue: '#3b82f6',
        isAlias: false,
        originSourceId: 'figma-blue',
      },
      {
        name: 'buttonBg',
        path: 'color.button.bg',
        category: 'color',
        type: 'color',
        rawValue: '{color.primitive.blue}',
        resolvedValue: '#3b82f6',
        isAlias: true,
        aliasTarget: 'color.primitive.blue',
      },
    ];

    const result = reconcileTokens(existing, incoming, { autoRefactorAliases: true });
    const buttonToken = result.tokens.find((t) => t.path === 'color.button.bg');
    expect(buttonToken).toBeDefined();
    expect(buttonToken?.aliasTarget).toBe('color.primitive.sky');
    expect(buttonToken?.rawValue).toBe('{color.primitive.sky}');

    // Confirm alias resolves successfully with new target path
    const resolved = resolveTokenAliases(result.tokens);
    const resolvedButton = resolved.tokens.find((t) => t.path === 'color.button.bg');
    expect(resolvedButton?.resolvedValue).toBe('#3b82f6');
  });

  it('applies theme overrides linked via tokenPersistentId even after token rename', () => {
    const dsId = 'ds-override-test';

    // Base token originally named 'color.brand.blue' with persistentId 'pid-brand-primary'
    // Now renamed to 'color.brand.primary'
    const baseTokens: FlatToken[] = [
      {
        id: 'tok-primary',
        persistentId: 'pid-brand-primary',
        name: 'primary',
        path: 'color.brand.primary', // Renamed!
        category: 'color',
        type: 'color',
        rawValue: '#3b82f6',
        resolvedValue: '#3b82f6',
        isAlias: false,
      },
    ];

    const themesList: Theme[] = [
      {
        id: 'theme-dark',
        designSystemId: dsId,
        name: 'Dark Theme',
        codeName: 'dark',
      },
    ];

    // Override was created with tokenPersistentId targeting 'pid-brand-primary',
    // but stored the old tokenPath 'color.brand.blue'
    const overrides: TokenOverride[] = [
      {
        id: 'ov-1',
        themeId: 'theme-dark',
        tokenPersistentId: 'pid-brand-primary',
        tokenPath: 'color.brand.blue', // Stale path from before rename
        rawValue: '#1e40af',
      },
    ];

    const themeRes = resolveThemeTokens(baseTokens, themesList, overrides, 'theme-dark', dsId);
    const brandToken = themeRes.tokens.find((t) => t.path === 'color.brand.primary');
    expect(brandToken).toBeDefined();
    // The override applied to the renamed token because tokenPersistentId matched!
    expect(brandToken?.resolvedValue).toBe('#1e40af');
  });

  it('enforces brand isolation between brand-scoped themes and brand-scoped tokens', () => {
    const dsId = 'ds-brand-iso';

    const baseTokens: FlatToken[] = [
      {
        name: 'accent',
        path: 'color.brand.accent',
        category: 'color',
        type: 'color',
        rawValue: '#ff0000',
        resolvedValue: '#ff0000',
        isAlias: false,
        brandId: 'brand-honda', // Scoped to Honda
      },
    ];

    const themesList: Theme[] = [
      {
        id: 'theme-acura-dark',
        designSystemId: dsId,
        name: 'Acura Dark',
        codeName: 'acura-dark',
        brandId: 'brand-acura', // Scoped to Acura!
      },
    ];

    const overrides: TokenOverride[] = [
      {
        id: 'ov-cross-brand',
        themeId: 'theme-acura-dark',
        tokenPath: 'color.brand.accent',
        rawValue: '#00ff00',
      },
    ];

    expect(() => {
      resolveThemeTokens(baseTokens, themesList, overrides, 'theme-acura-dark', dsId);
    }).toThrow(ThemeBrandIsolationError);
  });

  it('supports version ownership: maintains draft vs released version container relationships', async () => {
    const dsId = 'ds-ver-test';
    await db.insert(workspaces).values({ id: 'ws-ver', name: 'Ver Org', slug: 'ver-org' });
    await db.insert(projects).values({ id: 'proj-ver', workspaceId: 'ws-ver', name: 'Ver Proj', slug: 'ver-proj' });
    await db.insert(designSystems).values({ id: dsId, projectId: 'proj-ver', name: 'Ver DS', version: '1.0.0' });

    const draftVerId = 'ver-draft-test';
    const releaseVerId = 'ver-release-1-0-0';

    await db.insert(designSystemVersions).values({
      id: draftVerId,
      designSystemId: dsId,
      name: 'Draft',
      isDraft: true,
      isReadOnly: false,
    });

    await db.insert(designSystemVersions).values({
      id: releaseVerId,
      designSystemId: dsId,
      name: '1.0.0',
      isDraft: false,
      isReadOnly: true,
    });

    // Insert draft token and release snapshot token sharing the SAME persistentId
    const sharedPersistentId = 'pid-shared-heading';

    await db.insert(tokens).values({
      id: 'tok-draft-h1',
      persistentId: sharedPersistentId,
      designSystemId: dsId,
      versionId: draftVerId,
      name: 'h1',
      path: 'typography.heading.h1',
      category: 'typography',
      type: 'dimension',
      rawValue: '36px',
      resolvedValue: '36px',
      isAlias: false,
    });

    await db.insert(tokens).values({
      id: 'tok-rel-h1',
      persistentId: sharedPersistentId,
      designSystemId: dsId,
      versionId: releaseVerId,
      name: 'h1',
      path: 'typography.heading.h1',
      category: 'typography',
      type: 'dimension',
      rawValue: '32px', // Historical value in release 1.0.0
      resolvedValue: '32px',
      isAlias: false,
    });

    const draftTokens = await db.select().from(tokens).where(eq(tokens.versionId, draftVerId));
    const releaseTokens = await db.select().from(tokens).where(eq(tokens.versionId, releaseVerId));

    expect(draftTokens).toHaveLength(1);
    expect(draftTokens[0].rawValue).toBe('36px');
    expect(draftTokens[0].persistentId).toBe(sharedPersistentId);

    expect(releaseTokens).toHaveLength(1);
    expect(releaseTokens[0].rawValue).toBe('32px');
    expect(releaseTokens[0].persistentId).toBe(sharedPersistentId);
  });

  it('guarantees schema DDL and migration idempotency under repeated executions', async () => {
    await expect(initializeSchema(client)).resolves.not.toThrow();
    await expect(runFoundationMigration(client)).resolves.not.toThrow();
    await expect(runFoundationMigration(client)).resolves.not.toThrow();
  });

  it('preserves existing exporter compatibility across all platforms with persistent tokens', () => {
    const persistentTokens: FlatToken[] = [
      {
        id: 'tok-primary',
        persistentId: 'pid-primary',
        originSourceId: 'figma-prim',
        name: 'primary',
        path: 'color.brand.primary',
        category: 'color',
        type: 'color',
        rawValue: '#3b82f6',
        resolvedValue: '#3b82f6',
        isAlias: false,
      },
      {
        id: 'tok-sm',
        persistentId: 'pid-spacing-sm',
        name: 'sm',
        path: 'spacing.sm',
        category: 'spacing',
        type: 'dimension',
        rawValue: '8px',
        resolvedValue: '8px',
        isAlias: false,
      },
      {
        id: 'tok-typo',
        persistentId: 'pid-heading',
        name: 'h1',
        path: 'typography.heading.h1',
        category: 'typography',
        type: 'typography',
        rawValue: {
          fontFamily: 'Inter',
          fontSize: '32px',
          fontWeight: 700,
        },
        resolvedValue: {
          fontFamily: 'Inter',
          fontSize: '32px',
          fontWeight: 700,
        },
        isComposite: true,
        isAlias: false,
      },
    ];

    const css = exportToCss(persistentTokens);
    expect(css.filename).toBe('tokens.css');
    expect(css.content).toContain('--color-brand-primary: #3b82f6;');
    expect(css.content).toContain('--spacing-sm: 8px;');

    const swift = exportToSwift(persistentTokens);
    expect(swift.filename).toBe('Tokens.swift');
    expect(swift.content).toContain('brandPrimary');

    const kotlin = exportToKotlin(persistentTokens);
    expect(kotlin.filename).toBe('Tokens.kt');
    expect(kotlin.content).toContain('BrandPrimary');

    const json = exportToJson(persistentTokens);
    expect(json.filename).toBe('tokens.json');
    const parsedJson = JSON.parse(json.content);
    expect(parsedJson.color.brand.primary.$value).toBe('#3b82f6');
    expect(parsedJson.typography.heading.h1.$value.fontSize).toBe('32px');
  });
});
