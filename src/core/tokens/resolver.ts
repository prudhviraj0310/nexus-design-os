import { AliasResolutionResult, FlatToken } from './types.js';

export function resolveTokenAliases(tokens: FlatToken[]): AliasResolutionResult {
  const tokenMap = new Map<string, FlatToken>();
  for (const token of tokens) {
    tokenMap.set(token.path, { ...token });
  }

  const cycles: Array<{ path: string; cycle: string[] }> = [];
  const unresolvedAliases: Array<{ path: string; target: string }> = [];

  function resolvePath(
    path: string,
    visited: Set<string> = new Set()
  ): { value: string; cycleDetected?: boolean } {
    const token = tokenMap.get(path);
    if (!token) {
      return { value: path };
    }

    if (!token.isAlias || !token.aliasTarget) {
      return { value: token.rawValue };
    }

    const targetPath = token.aliasTarget;

    if (visited.has(targetPath)) {
      const cycleArray = [...visited, targetPath];
      cycles.push({ path, cycle: cycleArray });
      return { value: `[Circular: ${cycleArray.join(' -> ')}]`, cycleDetected: true };
    }

    if (!tokenMap.has(targetPath)) {
      unresolvedAliases.push({ path, target: targetPath });
      return { value: `[Unresolved: {${targetPath}}]` };
    }

    visited.add(path);
    const nextResult = resolvePath(targetPath, new Set(visited));
    return nextResult;
  }

  const resolvedTokens: FlatToken[] = [];

  for (const token of tokenMap.values()) {
    if (token.isAlias && token.aliasTarget) {
      const res = resolvePath(token.path);
      resolvedTokens.push({
        ...token,
        resolvedValue: res.value,
      });
    } else {
      resolvedTokens.push(token);
    }
  }

  return {
    tokens: resolvedTokens,
    cycles,
    unresolvedAliases,
  };
}
