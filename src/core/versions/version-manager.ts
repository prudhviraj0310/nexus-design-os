import { eq, and, sql, desc } from 'drizzle-orm';
import {
  designSystems,
  designSystemVersions,
  tokens,
  tokenGroups,
  themes,
  tokenOverrides,
  releases,
  components,
} from '../../db/schema';
import { FlatToken } from '../tokens/types';
import { PipelineManager } from '../delivery/pipelines';

export class ReadOnlyVersionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReadOnlyVersionError';
  }
}

export class VersionConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VersionConflictError';
  }
}

export class DraftVersionNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DraftVersionNotFoundError';
  }
}

export class InvalidVersionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidVersionError';
  }
}

export interface ReleaseVersionInput {
  designSystemId: string;
  version: string;
  title: string;
  description?: string;
  changelog?: string;
  triggerPipelines?: boolean;
}

export interface VersionSummary {
  id: string;
  designSystemId: string;
  name: string;
  description?: string | null;
  isDraft: boolean;
  isReadOnly: boolean;
  tokensCount: number;
  themesCount: number;
  createdAt: Date | string;
}

export interface ReleaseVersionResult {
  version: {
    id: string;
    designSystemId: string;
    name: string;
    description: string | null;
    isDraft: boolean;
    isReadOnly: boolean;
  };
  release: {
    id: string;
    designSystemId: string;
    version: string;
    title: string;
    description: string | null;
    tokensCount: number;
    componentsCount: number;
    changelog: string | null;
  };
  tokensCopied: number;
  themesCopied: number;
  groupsCopied: number;
  pipelineResults?: any[];
}

export class VersionManager {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  /**
   * Ensures that the design system has an active draft version container.
   */
  public async getOrCreateDraftVersion(designSystemId: string): Promise<any> {
    const existing = await this.db
      .select()
      .from(designSystemVersions)
      .where(
        and(
          eq(designSystemVersions.designSystemId, designSystemId),
          eq(designSystemVersions.isDraft, true)
        )
      );

    if (existing.length > 0) {
      return existing[0];
    }

    const draftId = `ver-draft-${designSystemId}`;
    const newDraft = {
      id: draftId,
      designSystemId,
      name: 'Draft',
      description: 'Active working draft container',
      isDraft: true,
      isReadOnly: false,
      createdAt: new Date(),
    };

    await this.db.insert(designSystemVersions).values(newDraft);
    return newDraft;
  }

  /**
   * Asserts that a target version container is editable.
   * Throws ReadOnlyVersionError if the version is sealed / read-only.
   */
  public async assertVersionEditable(versionId: string): Promise<void> {
    const records = await this.db
      .select()
      .from(designSystemVersions)
      .where(eq(designSystemVersions.id, versionId));

    if (records.length === 0) {
      return; // If version container doesn't exist, allow fallback or let FK fail
    }

    if (records[0].isReadOnly) {
      throw new ReadOnlyVersionError(
        `Cannot modify tokens or entities in sealed read-only version container "${records[0].name}" (${versionId})`
      );
    }
  }

  /**
   * Lists all version containers for a design system, with aggregated entity counts.
   */
  public async listVersions(designSystemId: string): Promise<VersionSummary[]> {
    const versions = await this.db
      .select()
      .from(designSystemVersions)
      .where(eq(designSystemVersions.designSystemId, designSystemId))
      .orderBy(desc(designSystemVersions.isDraft), desc(designSystemVersions.createdAt));

    const summaries: VersionSummary[] = [];

    for (const v of versions) {
      const tokenRows = await this.db
        .select({ id: tokens.id })
        .from(tokens)
        .where(
          and(
            eq(tokens.versionId, v.id),
            eq(tokens.isDeleted, false)
          )
        );

      const themeRows = await this.db
        .select({ id: themes.id })
        .from(themes)
        .where(eq(themes.versionId, v.id));

      summaries.push({
        id: v.id,
        designSystemId: v.designSystemId,
        name: v.name,
        description: v.description,
        isDraft: v.isDraft,
        isReadOnly: v.isReadOnly,
        tokensCount: tokenRows.length,
        themesCount: themeRows.length,
        createdAt: v.createdAt,
      });
    }

    return summaries;
  }

  /**
   * Retrieves a specific version container by ID.
   */
  public async getVersion(versionId: string): Promise<any | null> {
    const records = await this.db
      .select()
      .from(designSystemVersions)
      .where(eq(designSystemVersions.id, versionId));

    return records[0] || null;
  }

  /**
   * Fetches active tokens for a specific version. Defaults to draft if omitted.
   */
  public async getTokensForVersion(
    designSystemId: string,
    versionId?: string
  ): Promise<any[]> {
    const effectiveVersionId: string =
      versionId || (await this.getOrCreateDraftVersion(designSystemId)).id;

    return this.db
      .select()
      .from(tokens)
      .where(
        and(
          eq(tokens.designSystemId, designSystemId),
          eq(tokens.versionId, effectiveVersionId),
          eq(tokens.isDeleted, false)
        )
      );
  }

  /**
   * Seals the current draft container into an immutable release snapshot container.
   * Performs a deep-copy of all tokens, token groups, themes, and theme overrides.
   * Preserves persistent IDs across versions so tokens can be tracked over releases.
   */
  public async releaseVersion(input: ReleaseVersionInput): Promise<ReleaseVersionResult> {
    const { designSystemId, version, title, description = '', changelog = '', triggerPipelines = true } = input;

    // 1. Validation
    const trimmedVersion = version?.trim();
    if (!trimmedVersion) {
      throw new InvalidVersionError('Release version tag cannot be empty.');
    }
    if (trimmedVersion.toLowerCase() === 'draft') {
      throw new InvalidVersionError('Release version cannot be named "Draft".');
    }

    // 2. Uniqueness check
    const existingVer = await this.db
      .select()
      .from(designSystemVersions)
      .where(
        and(
          eq(designSystemVersions.designSystemId, designSystemId),
          eq(designSystemVersions.name, trimmedVersion)
        )
      );

    if (existingVer.length > 0) {
      throw new VersionConflictError(
        `Version "${trimmedVersion}" already exists for design system "${designSystemId}".`
      );
    }

    // 3. Find active draft version
    const draft = await this.getOrCreateDraftVersion(designSystemId);

    // 4. Fetch draft entities to snapshot
    const draftTokens = await this.db
      .select()
      .from(tokens)
      .where(
        and(
          eq(tokens.designSystemId, designSystemId),
          eq(tokens.versionId, draft.id),
          eq(tokens.isDeleted, false)
        )
      );

    const draftGroups = await this.db
      .select()
      .from(tokenGroups)
      .where(
        and(
          eq(tokenGroups.designSystemId, designSystemId),
          eq(tokenGroups.versionId, draft.id)
        )
      );

    const draftThemes = await this.db
      .select()
      .from(themes)
      .where(
        and(
          eq(themes.designSystemId, designSystemId),
          eq(themes.versionId, draft.id)
        )
      );

    // 5. Build sealed version record
    const sanitizedTag = trimmedVersion.replace(/[^a-zA-Z0-9._-]/g, '-');
    const sealedVersionId = `ver-${designSystemId}-${sanitizedTag}-${Date.now().toString(36)}`;

    const sealedVersionRecord = {
      id: sealedVersionId,
      designSystemId,
      name: trimmedVersion,
      description: description || `Sealed release snapshot ${trimmedVersion}`,
      isDraft: false,
      isReadOnly: true,
      createdAt: new Date(),
    };

    // 6. Deep copy groups with ID mapping
    const groupIdMap = new Map<string, string>();
    const newGroupRecords: any[] = [];

    for (const g of draftGroups) {
      const newGroupId = `grp-${sealedVersionId}-${g.id}`;
      groupIdMap.set(g.id, newGroupId);
    }

    for (const g of draftGroups) {
      newGroupRecords.push({
        id: groupIdMap.get(g.id)!,
        designSystemId,
        versionId: sealedVersionId,
        parentId: g.parentId ? groupIdMap.get(g.parentId) || null : null,
        name: g.name,
        description: g.description,
        tokenType: g.tokenType,
        path: g.path,
        order: g.order,
        isRoot: g.isRoot,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // 7. Deep copy tokens, preserving persistentId
    const newTokenRecords: any[] = [];
    for (const t of draftTokens) {
      const newTokenId = `tok-${sealedVersionId}-${t.persistentId || t.id}`;
      newTokenRecords.push({
        id: newTokenId,
        persistentId: t.persistentId || t.id, // Stable persistent identity preserved!
        designSystemId,
        versionId: sealedVersionId,
        brandId: t.brandId,
        groupId: t.groupId ? groupIdMap.get(t.groupId) || null : null,
        originSourceId: t.originSourceId,
        name: t.name,
        path: t.path,
        category: t.category,
        type: t.type,
        rawValue: t.rawValue,
        resolvedValue: t.resolvedValue,
        isComposite: t.isComposite,
        rawValueJson: t.rawValueJson,
        resolvedValueJson: t.resolvedValueJson,
        isAlias: t.isAlias,
        aliasTarget: t.aliasTarget,
        isDeprecated: t.isDeprecated,
        isDeleted: false,
        deletedAt: null,
        description: t.description,
        extensions: t.extensions,
        createdAt: new Date(),
      });
    }

    // 8. Deep copy themes and overrides
    const themeIdMap = new Map<string, string>();
    const newThemeRecords: any[] = [];
    const newOverrideRecords: any[] = [];

    for (const th of draftThemes) {
      const newThemeId = `th-${sealedVersionId}-${th.persistentId || th.id}`;
      themeIdMap.set(th.id, newThemeId);
      newThemeRecords.push({
        id: newThemeId,
        persistentId: th.persistentId || th.id,
        designSystemId,
        versionId: sealedVersionId,
        brandId: th.brandId,
        name: th.name,
        codeName: th.codeName,
        description: th.description,
        parentThemeId: th.parentThemeId ? themeIdMap.get(th.parentThemeId) || th.parentThemeId : null,
        isDefault: th.isDefault,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Fetch overrides for this theme
      const overrides = await this.db
        .select()
        .from(tokenOverrides)
        .where(eq(tokenOverrides.themeId, th.id));

      for (const ov of overrides) {
        newOverrideRecords.push({
          id: `ov-${sealedVersionId}-${ov.id}`,
          themeId: newThemeId,
          tokenPersistentId: ov.tokenPersistentId,
          tokenPath: ov.tokenPath,
          rawValue: ov.rawValue,
          resolvedValue: ov.resolvedValue,
          rawValueJson: ov.rawValueJson,
          resolvedValueJson: ov.resolvedValueJson,
          isComposite: ov.isComposite,
          isAlias: ov.isAlias,
          aliasTarget: ov.aliasTarget,
          description: ov.description,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // 9. Count components
    const componentRows = await this.db
      .select({ id: components.id })
      .from(components)
      .where(eq(components.designSystemId, designSystemId));

    // 10. Release record
    const releaseId = `rel-${sanitizedTag}-${Date.now().toString(36)}`;
    const releaseRecord = {
      id: releaseId,
      designSystemId,
      version: trimmedVersion,
      title,
      description: description || `Release ${trimmedVersion}`,
      tokensCount: newTokenRecords.length,
      componentsCount: componentRows.length,
      changelog: changelog || `Release ${trimmedVersion} with ${newTokenRecords.length} design tokens.`,
      createdAt: new Date(),
    };

    // 11. Atomic persistence
    await this.db.transaction(async (tx: any) => {
      await tx.insert(designSystemVersions).values(sealedVersionRecord);

      if (newGroupRecords.length > 0) {
        for (const grp of newGroupRecords) {
          await tx.insert(tokenGroups).values(grp);
        }
      }

      if (newTokenRecords.length > 0) {
        for (const tok of newTokenRecords) {
          await tx.insert(tokens).values(tok);
        }
      }

      if (newThemeRecords.length > 0) {
        for (const th of newThemeRecords) {
          await tx.insert(themes).values(th);
        }
      }

      if (newOverrideRecords.length > 0) {
        for (const ov of newOverrideRecords) {
          await tx.insert(tokenOverrides).values(ov);
        }
      }

      await tx.insert(releases).values(releaseRecord);

      // Update active design system version pointer
      await tx
        .update(designSystems)
        .set({ version: trimmedVersion })
        .where(eq(designSystems.id, designSystemId));
    });

    // 12. Trigger automated delivery pipelines if requested
    let pipelineResults: any[] = [];
    if (triggerPipelines) {
      try {
        const pipelineMgr = new PipelineManager(this.db);
        pipelineResults = await pipelineMgr.onVersionReleased(designSystemId, releaseRecord);
      } catch (pipelineErr) {
        // Do not crash the release snapshot if delivery encounters transient external errors
        console.warn(`[VersionManager] Warning: automated delivery pipeline failed:`, pipelineErr);
      }
    }

    return {
      version: sealedVersionRecord,
      release: releaseRecord,
      tokensCopied: newTokenRecords.length,
      themesCopied: newThemeRecords.length,
      groupsCopied: newGroupRecords.length,
      pipelineResults,
    };
  }
}
