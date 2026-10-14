import { AliasResolutionResult, FlatToken, TokenType } from './types';

// Semantic sub-property type compatibility matrix
const PROPERTY_TYPE_RULES: Record<string, { expected: string[]; validCategories?: string[] }> = {
  fontFamily: {
    expected: ['fontFamily', 'custom'],
    validCategories: ['typography'],
  },
  fontSize: {
    expected: ['fontSize', 'dimension', 'custom'],
    validCategories: ['typography', 'spacing', 'sizing'],
  },
  fontWeight: {
    expected: ['fontWeight', 'custom'],
    validCategories: ['typography'],
  },
  lineHeight: {
    expected: ['lineHeight', 'dimension', 'custom'],
    validCategories: ['typography', 'spacing'],
  },
  letterSpacing: {
    expected: ['letterSpacing', 'dimension', 'custom'],
    validCategories: ['typography', 'spacing'],
  },
  color: {
    expected: ['color', 'custom'],
    validCategories: ['color'],
  },
  offsetX: {
    expected: ['dimension', 'custom'],
    validCategories: ['spacing', 'sizing'],
  },
  offsetY: {
    expected: ['dimension', 'custom'],
    validCategories: ['spacing', 'sizing'],
  },
  blur: {
    expected: ['dimension', 'custom'],
    validCategories: ['spacing', 'sizing'],
  },
  spread: {
    expected: ['dimension', 'custom'],
    validCategories: ['spacing', 'sizing'],
  },
  width: {
    expected: ['dimension', 'custom'],
    validCategories: ['spacing', 'sizing'],
  },
};

function getPropertyRuleKey(propPath: string): string | undefined {
  const parts = propPath.split('.');
  const lastPart = parts[parts.length - 1].replace(/\[\d+\]$/, '');
  return PROPERTY_TYPE_RULES[lastPart] ? lastPart : undefined;
}

function findTokenAndSubProperty(
  path: string,
  tokenMap: Map<string, FlatToken>
): { token: FlatToken; subProp?: string } | undefined {
  if (tokenMap.has(path)) {
    return { token: tokenMap.get(path)! };
  }
  let current = path;
  while (current.includes('.')) {
    const lastDot = current.lastIndexOf('.');
    const parentPath = current.slice(0, lastDot);
    if (tokenMap.has(parentPath)) {
      return { token: tokenMap.get(parentPath)!, subProp: path.slice(parentPath.length + 1) };
    }
    current = parentPath;
  }
  return undefined;
}

function getSubPropertyValue(obj: any, subProp: string): any {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = subProp.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

export function resolveTokenAliases(tokens: FlatToken[]): AliasResolutionResult {
  // 1. Deep clone token map for immutability
  const tokenMap = new Map<string, FlatToken>();
  for (const token of tokens) {
    tokenMap.set(token.path, {
      ...token,
      rawValue: typeof token.rawValue === 'object' ? JSON.parse(JSON.stringify(token.rawValue)) : token.rawValue,
      resolvedValue: typeof token.resolvedValue === 'object' ? JSON.parse(JSON.stringify(token.resolvedValue)) : token.resolvedValue,
      nestedAliasTargets: token.nestedAliasTargets ? [...token.nestedAliasTargets] : undefined,
    });
  }

  const cycles: Array<{ path: string; cycle: string[] }> = [];
  const unresolvedAliases: Array<{ path: string; target: string; property?: string }> = [];
  const typeErrors: Array<{ path: string; property: string; expected: string; received: string; message: string }> = [];

  // Helper to resolve a scalar path or composite sub-property path
  function resolveScalarPath(
    sourcePath: string,
    targetPath: string,
    visited: Set<string> = new Set()
  ): { value: string; cycleDetected?: boolean } {
    if (visited.has(targetPath)) {
      const cycleArray = [...visited, targetPath];
      cycles.push({ path: sourcePath, cycle: cycleArray });
      return { value: `[Circular: ${cycleArray.join(' -> ')}]`, cycleDetected: true };
    }

    const found = findTokenAndSubProperty(targetPath, tokenMap);
    if (!found) {
      unresolvedAliases.push({ path: sourcePath, target: targetPath });
      return { value: `[Unresolved: {${targetPath}}]` };
    }

    const { token: targetToken, subProp } = found;

    if (visited.has(targetToken.path) || (subProp && visited.has(`${targetToken.path}.${subProp}`))) {
      const cycleArray = [...visited, targetPath];
      cycles.push({ path: sourcePath, cycle: cycleArray });
      return { value: `[Circular: ${cycleArray.join(' -> ')}]`, cycleDetected: true };
    }

    const nextVisited = new Set(visited);
    nextVisited.add(sourcePath);
    nextVisited.add(targetToken.path);
    if (subProp) nextVisited.add(`${targetToken.path}.${subProp}`);

    if (subProp) {
      const subVal = getSubPropertyValue(targetToken.rawValue, subProp);
      if (typeof subVal === 'string' && subVal.startsWith('{') && subVal.endsWith('}') && !subVal.includes(':') && !subVal.includes('"')) {
        const nestedTarget = subVal.slice(1, -1).trim();
        return resolveScalarPath(targetToken.path, nestedTarget, nextVisited);
      }
      return { value: subVal !== undefined ? String(subVal) : `[Unresolved: {${targetPath}}]` };
    }

    if (!targetToken.isAlias || !targetToken.aliasTarget) {
      return { value: typeof targetToken.rawValue === 'string' ? targetToken.rawValue : JSON.stringify(targetToken.rawValue) };
    }

    return resolveScalarPath(sourcePath, targetToken.aliasTarget, nextVisited);
  }

  // Helper to recursively resolve nested properties in a composite object
  function resolveNestedValue(
    sourcePath: string,
    val: any,
    propPath: string = '',
    visited: Set<string> = new Set()
  ): any {
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}') && !trimmed.includes(':') && !trimmed.includes('"')) {
        const targetPath = trimmed.slice(1, -1).trim();

        if (visited.has(targetPath)) {
          const cycleArray = [...visited, targetPath];
          cycles.push({ path: `${sourcePath}.${propPath}`, cycle: cycleArray });
          return `[Circular: ${cycleArray.join(' -> ')}]`;
        }

        const found = findTokenAndSubProperty(targetPath, tokenMap);
        if (!found) {
          unresolvedAliases.push({ path: sourcePath, target: targetPath, property: propPath });
          return `[Unresolved: {${targetPath}}]`;
        }

        const { token: targetToken, subProp } = found;

        if (visited.has(targetToken.path) || (subProp && visited.has(`${targetToken.path}.${subProp}`))) {
          const cycleArray = [...visited, targetPath];
          cycles.push({ path: `${sourcePath}.${propPath}`, cycle: cycleArray });
          return `[Circular: ${cycleArray.join(' -> ')}]`;
        }

        // Semantic Type Compatibility Validation
        const ruleKey = getPropertyRuleKey(propPath);
        if (ruleKey && PROPERTY_TYPE_RULES[ruleKey]) {
          const rule = PROPERTY_TYPE_RULES[ruleKey];
          const typeMatches = rule.expected.includes(targetToken.type);
          const catMatches = rule.validCategories ? rule.validCategories.includes(targetToken.category) : false;

          if (!typeMatches && !catMatches) {
            typeErrors.push({
              path: sourcePath,
              property: propPath,
              expected: rule.expected.join(' | '),
              received: targetToken.type,
              message: `Type mismatch in ${sourcePath}.${propPath}: expected '${rule.expected.join(' | ')}' but target token '${targetPath}' is '${targetToken.type}'.`,
            });
          }
        }

        const nextVisited = new Set(visited);
        nextVisited.add(sourcePath);
        nextVisited.add(targetToken.path);
        if (subProp) nextVisited.add(`${targetToken.path}.${subProp}`);

        if (subProp) {
          const subVal = getSubPropertyValue(targetToken.rawValue, subProp);
          if (typeof subVal === 'string' && subVal.startsWith('{') && subVal.endsWith('}') && !subVal.includes(':') && !subVal.includes('"')) {
            const nestedTarget = subVal.slice(1, -1).trim();
            const res = resolveScalarPath(targetToken.path, nestedTarget, nextVisited);
            return res.value;
          }
          return subVal;
        }

        // If target token is itself an alias, resolve it through the chain
        if (targetToken.isAlias && targetToken.aliasTarget) {
          const res = resolveScalarPath(sourcePath, targetToken.aliasTarget, nextVisited);
          return res.value;
        }

        // If target is composite, return cloned structured object; otherwise return string/scalar
        return typeof targetToken.resolvedValue === 'object'
          ? JSON.parse(JSON.stringify(targetToken.resolvedValue))
          : targetToken.resolvedValue;
      }
      return val;
    }

    if (Array.isArray(val)) {
      return val.map((item, index) => resolveNestedValue(sourcePath, item, `${propPath}[${index}]`, visited));
    }

    if (typeof val === 'object' && val !== null) {
      const result: Record<string, any> = {};
      for (const [k, v] of Object.entries(val)) {
        const currentProp = propPath ? `${propPath}.${k}` : k;
        result[k] = resolveNestedValue(sourcePath, v, currentProp, visited);
      }
      return result;
    }

    return val;
  }

  const resolvedTokens: FlatToken[] = [];

  for (const token of tokenMap.values()) {
    if (token.isComposite && typeof token.rawValue === 'object' && token.rawValue !== null) {
      // Composite token: resolve all internal properties
      const resolvedComposite = resolveNestedValue(token.path, token.rawValue);
      resolvedTokens.push({
        ...token,
        resolvedValue: resolvedComposite,
      });
    } else if (token.isAlias && token.aliasTarget) {
      // Scalar alias
      const res = resolveScalarPath(token.path, token.aliasTarget);
      resolvedTokens.push({
        ...token,
        resolvedValue: res.value,
      });
    } else {
      // Direct scalar token
      resolvedTokens.push(token);
    }
  }

  return {
    tokens: resolvedTokens,
    cycles,
    unresolvedAliases,
    typeErrors: typeErrors.length > 0 ? typeErrors : undefined,
  };
}
