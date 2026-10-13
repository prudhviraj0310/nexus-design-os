import { FlatToken, TokenValidationResult } from './types';

export function validateTokens(tokens: FlatToken[]): TokenValidationResult {
  const errors: Array<{ path: string; message: string }> = [];

  const seenPaths = new Set<string>();

  for (const token of tokens) {
    if (!token.path || token.path.trim() === '') {
      errors.push({ path: 'unknown', message: 'Token path cannot be empty' });
      continue;
    }

    if (seenPaths.has(token.path)) {
      errors.push({ path: token.path, message: `Duplicate token path detected: ${token.path}` });
    }
    seenPaths.add(token.path);

    // If it's a resolved color token, check hex/rgb/hsl syntax if not an unresolved alias
    if (token.category === 'color' && !token.resolvedValue.startsWith('[') && !token.isAlias) {
      const isColor =
        /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(token.resolvedValue) ||
        /^rgba?\(.+\)$/.test(token.resolvedValue) ||
        /^hsla?\(.+\)$/.test(token.resolvedValue);
      if (!isColor) {
        errors.push({
          path: token.path,
          message: `Invalid color format: "${token.resolvedValue}". Expected valid hex, rgb(a), or hsl(a).`,
        });
      }
    }

    // Check dimension tokens
    if (token.category === 'spacing' && !token.resolvedValue.startsWith('[') && !token.isAlias) {
      const isDimension = /^([0-9]+(\.[0-9]+)?)(px|rem|em|%)?$/.test(token.resolvedValue);
      if (!isDimension) {
        errors.push({
          path: token.path,
          message: `Invalid dimension/spacing format: "${token.resolvedValue}". Expected numeric value with unit (px, rem, em, %).`,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
