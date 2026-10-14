import { AliasResolutionResult, FlatToken, Theme, TokenOverride, TokenValue } from './types';
import { resolveTokenAliases } from './resolver';

export class ThemeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ThemeError';
  }
}

export class ThemeCycleError extends ThemeError {
  constructor(public readonly cyclePath: string[]) {
    super(`Circular parent relationship detected in theme hierarchy: ${cyclePath.join(' -> ')}`);
    this.name = 'ThemeCycleError';
  }
}

export class InvalidThemeParentError extends ThemeError {
  constructor(public readonly themeId: string, public readonly parentThemeId: string) {
    super(`Parent theme '${parentThemeId}' not found for theme '${themeId}'.`);
    this.name = 'InvalidThemeParentError';
  }
}

export class DuplicateOverrideError extends ThemeError {
  constructor(public readonly themeId: string, public readonly tokenPath: string) {
    super(`Duplicate override detected for token path '${tokenPath}' in theme '${themeId}'.`);
    this.name = 'DuplicateOverrideError';
  }
}

export class UnknownTokenPathError extends ThemeError {
  constructor(public readonly themeId: string, public readonly tokenPath: string) {
    super(`Unknown token path '${tokenPath}' specified in theme override for theme '${themeId}'. Token does not exist in base design system.`);
    this.name = 'UnknownTokenPathError';
  }
}

export class ThemeIsolationError extends ThemeError {
  constructor(public readonly themeId: string, public readonly expectedDsId: string, public readonly actualDsId: string) {
    super(`Theme '${themeId}' belongs to design system '${actualDsId}', but expected '${expectedDsId}'. Cross-tenant isolation violation.`);
    this.name = 'ThemeIsolationError';
  }
}

export class ThemeBrandIsolationError extends ThemeError {
  constructor(public readonly themeId: string, public readonly themeBrandId: string, public readonly tokenPath: string, public readonly tokenBrandId: string) {
    super(`Theme '${themeId}' (brand '${themeBrandId}') cannot override token '${tokenPath}' belonging to brand '${tokenBrandId}'.`);
    this.name = 'ThemeBrandIsolationError';
  }
}

export function validateThemeHierarchy(
  themes: Theme[],
  overrides: TokenOverride[],
  baseTokens: FlatToken[],
  expectedDesignSystemId?: string
): void {
  const themeMap = new Map<string, Theme>();
  for (const theme of themes) {
    if (expectedDesignSystemId && theme.designSystemId !== expectedDesignSystemId) {
      throw new ThemeIsolationError(theme.id, expectedDesignSystemId, theme.designSystemId);
    }
    themeMap.set(theme.id, theme);
  }

  // 1. Validate Parent Relationships and Detect Cycles
  for (const theme of themes) {
    const visited = new Set<string>();
    let current: Theme | undefined = theme;
    const chain: string[] = [];

    while (current) {
      if (visited.has(current.id)) {
        chain.push(current.id);
        throw new ThemeCycleError(chain);
      }
      visited.add(current.id);
      chain.push(current.id);

      if (current.parentThemeId) {
        const parent = themeMap.get(current.parentThemeId);
        if (!parent) {
          throw new InvalidThemeParentError(current.id, current.parentThemeId);
        }
        if (expectedDesignSystemId && parent.designSystemId !== expectedDesignSystemId) {
          throw new ThemeIsolationError(parent.id, expectedDesignSystemId, parent.designSystemId);
        }
        current = parent;
      } else {
        current = undefined;
      }
    }
  }

  // 2. Index Base Tokens by persistentId and path
  const baseTokensByPid = new Map<string, FlatToken>();
  const baseTokensByPath = new Map<string, FlatToken>();
  for (const t of baseTokens) {
    if (t.persistentId) baseTokensByPid.set(t.persistentId, t);
    baseTokensByPath.set(t.path, t);
  }

  // 3. Validate Overrides: Reject Duplicate Overrides per Theme & Unknown Tokens
  const seenOverrideKeys = new Set<string>();

  for (const override of overrides) {
    const theme = themeMap.get(override.themeId);

    // Find target base token: by persistentId first, then by path
    let targetToken: FlatToken | undefined;
    if (override.tokenPersistentId && baseTokensByPid.has(override.tokenPersistentId)) {
      targetToken = baseTokensByPid.get(override.tokenPersistentId);
    } else if (override.tokenPath && baseTokensByPath.has(override.tokenPath)) {
      targetToken = baseTokensByPath.get(override.tokenPath);
    }

    if (baseTokens.length > 0 && !targetToken) {
      throw new UnknownTokenPathError(override.themeId, override.tokenPath || override.tokenPersistentId || 'unknown');
    }

    // Duplicate check keyed by themeId + target token identifier
    const targetKey = targetToken?.persistentId || targetToken?.path || override.tokenPersistentId || override.tokenPath;
    const key = `${override.themeId}::${targetKey}`;
    if (seenOverrideKeys.has(key)) {
      throw new DuplicateOverrideError(override.themeId, override.tokenPath);
    }
    seenOverrideKeys.add(key);

    // Brand isolation check: if theme has brandId and token has brandId, must match
    if (theme?.brandId && targetToken?.brandId && theme.brandId !== targetToken.brandId) {
      throw new ThemeBrandIsolationError(theme.id, theme.brandId, targetToken.path, targetToken.brandId);
    }
  }
}

export function getAncestorChain(themes: Theme[], targetThemeId: string): Theme[] {
  const themeMap = new Map<string, Theme>();
  for (const t of themes) {
    themeMap.set(t.id, t);
  }

  const target = themeMap.get(targetThemeId);
  if (!target) {
    throw new ThemeError(`Target theme '${targetThemeId}' not found.`);
  }

  const chain: Theme[] = [];
  let current: Theme | undefined = target;
  const visited = new Set<string>();

  while (current) {
    if (visited.has(current.id)) {
      throw new ThemeCycleError([...visited, current.id]);
    }
    visited.add(current.id);
    chain.unshift(current); // Prepend so root comes first

    if (current.parentThemeId) {
      current = themeMap.get(current.parentThemeId);
    } else {
      current = undefined;
    }
  }

  return chain;
}

export function resolveThemeTokens(
  baseTokens: FlatToken[],
  themeHierarchy: Theme[],
  allOverrides: TokenOverride[],
  targetThemeId: string,
  designSystemId?: string
): AliasResolutionResult {
  // 1. Strict invariant validation
  validateThemeHierarchy(themeHierarchy, allOverrides, baseTokens, designSystemId);

  // 2. Deterministic root-to-leaf ancestor chain
  const chain = getAncestorChain(themeHierarchy, targetThemeId);

  // 3. Clone working map (keyed by token.path)
  const workingMap = new Map<string, FlatToken>();
  for (const token of baseTokens) {
    workingMap.set(token.path, {
      ...token,
      rawValue: typeof token.rawValue === 'object' ? JSON.parse(JSON.stringify(token.rawValue)) : token.rawValue,
      resolvedValue: typeof token.resolvedValue === 'object' ? JSON.parse(JSON.stringify(token.resolvedValue)) : token.resolvedValue,
      nestedAliasTargets: token.nestedAliasTargets ? [...token.nestedAliasTargets] : undefined,
    });
  }

  // 4. Cascade overrides through the ancestor chain
  for (const theme of chain) {
    const themeOverrides = allOverrides.filter((o) => o.themeId === theme.id);
    for (const override of themeOverrides) {
      // Locate target token in workingMap: first by tokenPersistentId, fallback by tokenPath
      let existing: FlatToken | undefined;
      let targetPathKey: string | undefined;

      if (override.tokenPersistentId) {
        for (const [key, t] of workingMap.entries()) {
          if (t.persistentId === override.tokenPersistentId) {
            existing = t;
            targetPathKey = key;
            break;
          }
        }
      }

      if (!existing && override.tokenPath) {
        existing = workingMap.get(override.tokenPath);
        targetPathKey = override.tokenPath;
      }

      if (existing && targetPathKey) {
        const isComposite = typeof override.rawValue === 'object' && override.rawValue !== null;
        const rawVal = isComposite ? JSON.parse(JSON.stringify(override.rawValue)) : override.rawValue;
        const isAlias = typeof rawVal === 'string' && rawVal.startsWith('{') && rawVal.endsWith('}') && !rawVal.includes(':') && !rawVal.includes('"');
        const aliasTarget = isAlias ? (rawVal as string).slice(1, -1).trim() : undefined;

        workingMap.set(targetPathKey, {
          ...existing,
          rawValue: rawVal,
          resolvedValue: rawVal,
          isComposite,
          isAlias,
          aliasTarget,
        });
      }
    }
  }

  // 5. Re-resolve all aliases in the context of the active theme
  return resolveTokenAliases(Array.from(workingMap.values()));
}

