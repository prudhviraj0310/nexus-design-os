import * as crypto from 'crypto';
import { FlatToken } from './types';

export class AmbiguousTokenMatchError extends Error {
  constructor(
    public readonly incomingToken: FlatToken,
    public readonly matchingCandidates: FlatToken[],
    message: string
  ) {
    super(message);
    this.name = 'AmbiguousTokenMatchError';
  }
}

export interface ReconcileOptions {
  markDeleted?: boolean; // If true, unmatched existing tokens are tombstoned (isDeleted = true)
  autoRefactorAliases?: boolean; // If true, automatically updates alias references targeting renamed tokens
  defaultBrandId?: string;
  defaultVersionId?: string;
}

export interface TokenRenameRecord {
  persistentId: string;
  oldPath: string;
  newPath: string;
  originSourceId?: string;
}

export interface TokenReconciliationResult {
  tokens: FlatToken[];
  renamed: TokenRenameRecord[];
  added: FlatToken[];
  updated: FlatToken[];
  deleted: FlatToken[];
  diagnostics: Array<{
    code: string;
    message: string;
    path?: string;
    persistentId?: string;
  }>;
}

/**
 * Reconciles incoming tokens against an existing token set using 3-tier triangulation:
 * 1. Tier 1: originSourceId (e.g. Figma variable ID / Token Studio GUID)
 * 2. Tier 2: persistentId (explicit or via extensions.nexus.persistentId)
 * 3. Tier 3: (brandId, path) exact match
 *
 * Guarantees:
 * - Stable persistent IDs across renames and moves.
 * - Explicit diagnostics on ambiguous matches.
 * - Idempotency on repeated imports.
 * - Defined deletion & tombstoning semantics.
 */
export function reconcileTokens(
  existingTokens: FlatToken[],
  incomingTokens: FlatToken[],
  options: ReconcileOptions = {}
): TokenReconciliationResult {
  const diagnostics: Array<{ code: string; message: string; path?: string; persistentId?: string }> = [];
  const renamed: TokenRenameRecord[] = [];
  const added: FlatToken[] = [];
  const updated: FlatToken[] = [];
  const deleted: FlatToken[] = [];

  // 1. Build lookup structures for existing tokens
  const byOriginId = new Map<string, FlatToken[]>();
  const byPersistentId = new Map<string, FlatToken>();
  const byBrandAndPath = new Map<string, FlatToken>();
  const byPath = new Map<string, FlatToken>();

  for (const existing of existingTokens) {
    if (existing.originSourceId) {
      const list = byOriginId.get(existing.originSourceId) || [];
      list.push(existing);
      byOriginId.set(existing.originSourceId, list);
    }
    if (existing.persistentId) {
      byPersistentId.set(existing.persistentId, existing);
    }
    if (existing.brandId && existing.path) {
      byBrandAndPath.set(`${existing.brandId}::${existing.path}`, existing);
    }
    if (existing.path) {
      byPath.set(existing.path, existing);
    }
  }

  const matchedExistingPersistentIds = new Set<string>();
  const matchedExistingPaths = new Set<string>();
  const reconciledTokens: FlatToken[] = [];

  // 2. Reconcile each incoming token
  for (const incoming of incomingTokens) {
    let matchedExisting: FlatToken | undefined;
    let matchTier: 1 | 2 | 3 | undefined;

    // --- Tier 1: Match by originSourceId ---
    if (incoming.originSourceId) {
      const candidates = byOriginId.get(incoming.originSourceId);
      if (candidates && candidates.length > 1) {
        throw new AmbiguousTokenMatchError(
          incoming,
          candidates,
          `Ambiguous token match: multiple existing tokens share originSourceId '${incoming.originSourceId}' (${candidates.map((c) => c.path).join(', ')}).`
        );
      }
      if (candidates && candidates.length === 1) {
        matchedExisting = candidates[0];
        matchTier = 1;
      }
    }

    // --- Tier 2: Match by persistentId ---
    if (!matchedExisting) {
      const explicitPersistentId =
        incoming.persistentId ||
        incoming.extensions?.nexus?.persistentId ||
        incoming.extensions?.persistentId;

      if (explicitPersistentId && byPersistentId.has(explicitPersistentId)) {
        matchedExisting = byPersistentId.get(explicitPersistentId);
        matchTier = 2;
      }
    }

    // --- Tier 3: Match by (brandId, path) or exact path ---
    if (!matchedExisting) {
      if (incoming.brandId && byBrandAndPath.has(`${incoming.brandId}::${incoming.path}`)) {
        matchedExisting = byBrandAndPath.get(`${incoming.brandId}::${incoming.path}`);
        matchTier = 3;
      } else if (byPath.has(incoming.path)) {
        matchedExisting = byPath.get(incoming.path);
        matchTier = 3;
      }
    }

    // --- Process Match or Creation ---
    if (matchedExisting) {
      const persistentId = matchedExisting.persistentId || matchedExisting.id || crypto.randomUUID();
      matchedExistingPersistentIds.add(persistentId);
      matchedExistingPaths.add(matchedExisting.path);

      const isRenamed = matchedExisting.path !== incoming.path;
      if (isRenamed) {
        renamed.push({
          persistentId,
          oldPath: matchedExisting.path,
          newPath: incoming.path,
          originSourceId: incoming.originSourceId || matchedExisting.originSourceId,
        });
        diagnostics.push({
          code: 'TOKEN_RENAMED',
          message: `Token '${matchedExisting.path}' renamed to '${incoming.path}' via Tier ${matchTier} match. Persistent ID '${persistentId}' preserved.`,
          path: incoming.path,
          persistentId,
        });
      }

      const reconciled: FlatToken = {
        ...incoming,
        id: incoming.id || matchedExisting.id,
        persistentId,
        originSourceId: incoming.originSourceId || matchedExisting.originSourceId,
        brandId: incoming.brandId || matchedExisting.brandId || options.defaultBrandId,
        versionId: incoming.versionId || matchedExisting.versionId || options.defaultVersionId,
        isDeleted: false,
        deletedAt: undefined,
      };

      reconciledTokens.push(reconciled);
      updated.push(reconciled);
    } else {
      // New Token Creation
      const persistentId = incoming.persistentId || crypto.randomUUID();
      const id = incoming.id || `tok-${incoming.path.replace(/\./g, '-')}`;

      const newToken: FlatToken = {
        ...incoming,
        id,
        persistentId,
        brandId: incoming.brandId || options.defaultBrandId,
        versionId: incoming.versionId || options.defaultVersionId,
        isDeleted: false,
      };

      reconciledTokens.push(newToken);
      added.push(newToken);
    }
  }

  // 3. Process existing tokens that were not present in incoming payload
  for (const existing of existingTokens) {
    const pId = existing.persistentId || existing.id;
    if (pId && !matchedExistingPersistentIds.has(pId) && !matchedExistingPaths.has(existing.path)) {
      if (options.markDeleted) {
        const tombstoned: FlatToken = {
          ...existing,
          isDeleted: true,
          deletedAt: new Date(),
        };
        reconciledTokens.push(tombstoned);
        deleted.push(tombstoned);
        diagnostics.push({
          code: 'TOKEN_TOMBSTONED',
          message: `Token '${existing.path}' was removed from source and tombstoned (persistentId: ${pId}).`,
          path: existing.path,
          persistentId: pId,
        });
      } else {
        deleted.push(existing);
      }
    }
  }

  // 4. Optionally refactor aliases if any renames occurred
  if (options.autoRefactorAliases && renamed.length > 0) {
    refactorAliasReferences(reconciledTokens, renamed);
  }

  return {
    tokens: reconciledTokens,
    renamed,
    added,
    updated,
    deleted,
    diagnostics,
  };
}

/**
 * Automatically rewrites alias targets in referencing tokens when a dependency has been renamed.
 */
export function refactorAliasReferences(tokens: FlatToken[], renames: TokenRenameRecord[]): void {
  const renameMap = new Map<string, string>();
  for (const r of renames) {
    renameMap.set(r.oldPath, r.newPath);
  }

  for (const token of tokens) {
    // Check scalar alias target
    if (token.isAlias && token.aliasTarget && renameMap.has(token.aliasTarget)) {
      const newTarget = renameMap.get(token.aliasTarget)!;
      token.aliasTarget = newTarget;
      token.rawValue = `{${newTarget}}`;
      if (typeof token.resolvedValue === 'string' && token.resolvedValue.startsWith('{')) {
        token.resolvedValue = `{${newTarget}}`;
      }
    }

    // Check composite nested aliases
    if (token.isComposite && typeof token.rawValue === 'object' && token.rawValue !== null) {
      rewriteObjectAliases(token.rawValue, renameMap);
    }
  }
}

function rewriteObjectAliases(obj: any, renameMap: Map<string, string>): void {
  if (typeof obj !== 'object' || obj === null) return;

  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}') && !trimmed.includes(':') && !trimmed.includes('"')) {
        const target = trimmed.slice(1, -1).trim();
        if (renameMap.has(target)) {
          obj[key] = `{${renameMap.get(target)!}}`;
        }
      }
    } else if (typeof val === 'object') {
      rewriteObjectAliases(val, renameMap);
    }
  }
}
