import { FlatToken, TokenValidationResult, TypographyValue, ShadowValue, ShadowLayer, BorderValue } from './types';

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

    // 1. Validation for Composite Tokens
    if (token.isComposite && typeof token.resolvedValue === 'object' && token.resolvedValue !== null) {
      if (token.type === 'typography') {
        const val = token.resolvedValue as Partial<TypographyValue>;
        if (!val.fontFamily || typeof val.fontFamily !== 'string') {
          errors.push({ path: token.path, message: 'Typography token must specify a valid "fontFamily".' });
        }
        if (!val.fontSize || typeof val.fontSize !== 'string') {
          errors.push({ path: token.path, message: 'Typography token must specify a valid "fontSize".' });
        }
      } else if (token.type === 'shadow') {
        const rawLayers = Array.isArray(token.resolvedValue) ? token.resolvedValue : [token.resolvedValue];
        const layers = rawLayers as Array<Partial<ShadowLayer>>;
        layers.forEach((layer, idx) => {
          if (!layer || typeof layer !== 'object') {
            errors.push({ path: token.path, message: `Shadow layer [${idx}] is not a valid object.` });
            return;
          }
          if (!layer.color) {
            errors.push({ path: token.path, message: `Shadow layer [${idx}] is missing required "color".` });
          }
          if (layer.offsetX === undefined || layer.offsetY === undefined || layer.blur === undefined) {
            errors.push({ path: token.path, message: `Shadow layer [${idx}] must specify offsetX, offsetY, and blur.` });
          }
        });
      } else if (token.type === 'border') {
        const val = token.resolvedValue as Partial<BorderValue>;
        if (!val.color) {
          errors.push({ path: token.path, message: 'Border token must specify a valid "color".' });
        }
        if (!val.width) {
          errors.push({ path: token.path, message: 'Border token must specify a valid "width".' });
        }
      }
      continue;
    }

    // 2. Validation for Scalar Tokens
    if (typeof token.resolvedValue === 'string') {
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
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
