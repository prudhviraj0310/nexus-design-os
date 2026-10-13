import { FlatToken } from '../tokens/types';
import { TokenDiffItem } from './types';

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
        newValue: incoming.resolvedValue || incoming.rawValue,
        category: incoming.category,
      });
    } else if (existing.rawValue !== incoming.rawValue) {
      diffItems.push({
        path: incoming.path,
        status: 'modified',
        oldValue: existing.rawValue,
        newValue: incoming.rawValue,
        category: incoming.category,
      });
    } else {
      diffItems.push({
        path: incoming.path,
        status: 'unchanged',
        oldValue: existing.rawValue,
        newValue: incoming.rawValue,
        category: incoming.category,
      });
    }
  }

  return diffItems;
}
