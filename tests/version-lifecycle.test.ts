import { describe, it, expect, beforeEach } from 'vitest';
import { getDb } from '../src/db/index';
import {
  workspaces,
  projects,
  designSystems,
  tokens,
  tokenGroups,
  themes,
  tokenOverrides,
  releases,
  designSystemVersions,
} from '../src/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  VersionManager,
  ReadOnlyVersionError,
  VersionConflictError,
  InvalidVersionError,
} from '../src/core/versions/version-manager';

describe('Tier 1: Version Container Lifecycle & Sealed Release Snapshots', () => {
  let db: any;
  let versionManager: VersionManager;
  const wsId = 'ws-ver-test';
  const projId = 'proj-ver-test';
  const dsId = 'ds-ver-test';

  beforeEach(async () => {
    const res = await getDb(':memory:');
    db = res.db;
    versionManager = new VersionManager(db);

    await db.delete(tokenOverrides);
    await db.delete(themes);
    await db.delete(tokens);
    await db.delete(tokenGroups);
    await db.delete(releases);
    await db.delete(designSystemVersions);
    await db.delete(designSystems);
    await db.delete(projects);
    await db.delete(workspaces);

    await db.insert(workspaces).values({ id: wsId, name: 'Version Org', slug: 'version-org' });
    await db.insert(projects).values({ id: projId, workspaceId: wsId, name: 'Version Proj', slug: 'version-proj' });
    await db.insert(designSystems).values({ id: dsId, projectId: projId, name: 'Version DS', version: '1.0.0' });
  });

  it('automatically ensures and returns active draft container', async () => {
    const draft = await versionManager.getOrCreateDraftVersion(dsId);
    expect(draft).toBeDefined();
    expect(draft.isDraft).toBe(true);
    expect(draft.isReadOnly).toBe(false);
    expect(draft.name).toBe('Draft');

    // Calling again returns existing draft
    const draft2 = await versionManager.getOrCreateDraftVersion(dsId);
    expect(draft2.id).toBe(draft.id);
  });

  it('rejects release with invalid or duplicate version tags', async () => {
    await expect(
      versionManager.releaseVersion({
        designSystemId: dsId,
        version: '',
        title: 'Empty version',
      })
    ).rejects.toThrow(InvalidVersionError);

    await expect(
      versionManager.releaseVersion({
        designSystemId: dsId,
        version: 'Draft',
        title: 'Draft version',
      })
    ).rejects.toThrow(InvalidVersionError);

    // Initial valid release
    await versionManager.releaseVersion({
      designSystemId: dsId,
      version: '1.0.0',
      title: 'Release 1.0.0',
      triggerPipelines: false,
    });

    // Duplicate release must be rejected
    await expect(
      versionManager.releaseVersion({
        designSystemId: dsId,
        version: '1.0.0',
        title: 'Duplicate Release',
        triggerPipelines: false,
      })
    ).rejects.toThrow(VersionConflictError);
  });

  it('seals draft into immutable snapshot, deep-copying tokens and preserving persistentId', async () => {
    const draft = await versionManager.getOrCreateDraftVersion(dsId);

    // Create token in draft
    await db.insert(tokens).values({
      id: 'tok-draft-primary',
      persistentId: 'pid-primary-color',
      designSystemId: dsId,
      versionId: draft.id,
      name: 'primary',
      path: 'color.brand.primary',
      category: 'color',
      type: 'color',
      rawValue: '#3b82f6',
      resolvedValue: '#3b82f6',
      isAlias: false,
    });

    // Create theme in draft
    await db.insert(themes).values({
      id: 'th-draft-dark',
      persistentId: 'pid-theme-dark',
      designSystemId: dsId,
      versionId: draft.id,
      name: 'Dark Theme',
      codeName: 'dark',
      isDefault: false,
    });

    // Create theme override
    await db.insert(tokenOverrides).values({
      id: 'ov-draft-1',
      themeId: 'th-draft-dark',
      tokenPersistentId: 'pid-primary-color',
      tokenPath: 'color.brand.primary',
      rawValue: '#60a5fa',
      resolvedValue: '#60a5fa',
    });

    // Release version 1.1.0
    const releaseResult = await versionManager.releaseVersion({
      designSystemId: dsId,
      version: '1.1.0',
      title: 'Major Brand Expansion',
      description: 'Release v1.1.0 with dark theme overrides',
      changelog: '• Added brand tokens\n• Configured dark theme',
      triggerPipelines: false,
    });

    expect(releaseResult.tokensCopied).toBe(1);
    expect(releaseResult.themesCopied).toBe(1);
    expect(releaseResult.version.name).toBe('1.1.0');
    expect(releaseResult.version.isReadOnly).toBe(true);
    expect(releaseResult.version.isDraft).toBe(false);

    // Verify snapshot tokens
    const snapshotTokens = await db
      .select()
      .from(tokens)
      .where(eq(tokens.versionId, releaseResult.version.id));

    expect(snapshotTokens).toHaveLength(1);
    expect(snapshotTokens[0].id).not.toBe('tok-draft-primary'); // New ID
    expect(snapshotTokens[0].persistentId).toBe('pid-primary-color'); // Stable persistent ID preserved!
    expect(snapshotTokens[0].resolvedValue).toBe('#3b82f6');

    // Verify snapshot themes and overrides
    const snapshotThemes = await db
      .select()
      .from(themes)
      .where(eq(themes.versionId, releaseResult.version.id));

    expect(snapshotThemes).toHaveLength(1);
    expect(snapshotThemes[0].persistentId).toBe('pid-theme-dark');

    const snapshotOverrides = await db
      .select()
      .from(tokenOverrides)
      .where(eq(tokenOverrides.themeId, snapshotThemes[0].id));

    expect(snapshotOverrides).toHaveLength(1);
    expect(snapshotOverrides[0].tokenPersistentId).toBe('pid-primary-color');
    expect(snapshotOverrides[0].resolvedValue).toBe('#60a5fa');

    // Verify release table record
    const releaseRecords = await db
      .select()
      .from(releases)
      .where(eq(releases.id, releaseResult.release.id));

    expect(releaseRecords).toHaveLength(1);
    expect(releaseRecords[0].version).toBe('1.1.0');
    expect(releaseRecords[0].tokensCount).toBe(1);

    // Verify design system active version pointer updated
    const dsRecords = await db.select().from(designSystems).where(eq(designSystems.id, dsId));
    expect(dsRecords[0].version).toBe('1.1.0');
  });

  it('guarantees snapshot immutability when draft tokens are later modified or deleted', async () => {
    const draft = await versionManager.getOrCreateDraftVersion(dsId);

    // Insert token into draft
    await db.insert(tokens).values({
      id: 'tok-draft-surface',
      persistentId: 'pid-surface-color',
      designSystemId: dsId,
      versionId: draft.id,
      name: 'surface',
      path: 'color.surface',
      category: 'color',
      type: 'color',
      rawValue: '#ffffff',
      resolvedValue: '#ffffff',
      isAlias: false,
    });

    // Release v1.0.0
    const rel1 = await versionManager.releaseVersion({
      designSystemId: dsId,
      version: '1.0.0',
      title: 'Initial v1.0.0',
      triggerPipelines: false,
    });

    // Now mutate draft token: change value to #000000 and rename path
    await db
      .update(tokens)
      .set({ rawValue: '#000000', resolvedValue: '#000000', path: 'color.surface.darkened' })
      .where(eq(tokens.id, 'tok-draft-surface'));

    // Verify draft has changed
    const draftTokens = await versionManager.getTokensForVersion(dsId, draft.id);
    expect(draftTokens[0].resolvedValue).toBe('#000000');
    expect(draftTokens[0].path).toBe('color.surface.darkened');

    // CRITICAL: Verify release snapshot remains 100% immutable
    const snapshotTokens = await versionManager.getTokensForVersion(dsId, rel1.version.id);
    expect(snapshotTokens).toHaveLength(1);
    expect(snapshotTokens[0].resolvedValue).toBe('#ffffff'); // Unchanged!
    expect(snapshotTokens[0].path).toBe('color.surface'); // Original path preserved!
  });

  it('enforces read-only protection check', async () => {
    const rel = await versionManager.releaseVersion({
      designSystemId: dsId,
      version: '1.0.0',
      title: 'Initial Release',
      triggerPipelines: false,
    });

    await expect(versionManager.assertVersionEditable(rel.version.id)).rejects.toThrow(
      ReadOnlyVersionError
    );

    const draft = await versionManager.getOrCreateDraftVersion(dsId);
    await expect(versionManager.assertVersionEditable(draft.id)).resolves.not.toThrow();
  });

  it('lists versions with aggregated entity counts', async () => {
    const draft = await versionManager.getOrCreateDraftVersion(dsId);
    await db.insert(tokens).values({
      id: 'tok-count-1',
      persistentId: 'pid-count-1',
      designSystemId: dsId,
      versionId: draft.id,
      name: 'accent',
      path: 'color.accent',
      category: 'color',
      type: 'color',
      rawValue: '#f59e0b',
      resolvedValue: '#f59e0b',
      isAlias: false,
    });

    await versionManager.releaseVersion({
      designSystemId: dsId,
      version: '2.0.0',
      title: 'V2',
      triggerPipelines: false,
    });

    const summaries = await versionManager.listVersions(dsId);
    expect(summaries.length).toBeGreaterThanOrEqual(2);

    const draftSummary = summaries.find((s) => s.isDraft);
    expect(draftSummary).toBeDefined();
    expect(draftSummary?.tokensCount).toBe(1);

    const v2Summary = summaries.find((s) => s.name === '2.0.0');
    expect(v2Summary).toBeDefined();
    expect(v2Summary?.tokensCount).toBe(1);
    expect(v2Summary?.isReadOnly).toBe(true);
  });
});
