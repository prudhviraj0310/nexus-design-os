import { FlatToken } from '../tokens/types';
import { TokenDiffItem } from './types';

const serializeVal = (v: any): string => (typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v ?? ''));

export function computeTokenDiff(existingTokens: FlatToken[], incomingTokens: FlatToken[]): TokenDiffItem[] {
  const existingMap = new Map<string, FlatToken>();
  for (const t of existingTokens) {
    existingMap.set(t.path, t);
  }

  const diffItems: TokenDiffItem[] = [];

  for (const incoming of incomingTokens) {
    const existing = existingMap.get(incoming.path);

    if (!existing) {
      diffItems.push({
        path: incoming.path,
        status: 'added',
        newValue: serializeVal(incoming.resolvedValue || incoming.rawValue),
        category: incoming.category,
      });
    } else if (serializeVal(existing.rawValue) !== serializeVal(incoming.rawValue)) {
      diffItems.push({
        path: incoming.path,
        status: 'modified',
        oldValue: serializeVal(existing.rawValue),
        newValue: serializeVal(incoming.rawValue),
        category: incoming.category,
      });
    } else {
      diffItems.push({
        path: incoming.path,
        status: 'unchanged',
        oldValue: serializeVal(existing.rawValue),
        newValue: serializeVal(incoming.rawValue),
        category: incoming.category,
      });
    }
  }

  // Detect removed tokens (tokens existing in categories represented by incoming tokens, but missing from incoming)
  const incomingCategories = new Set(incomingTokens.map((t) => t.category));
  const incomingPaths = new Set(incomingTokens.map((t) => t.path));

  for (const [path, existing] of existingMap.entries()) {
    if (!incomingPaths.has(path) && incomingCategories.has(existing.category)) {
      diffItems.push({
        path,
        status: 'removed',
        oldValue: serializeVal(existing.rawValue),
        newValue: undefined,
        category: existing.category,
      });
    }
  }

  return diffItems;
}
