import { DTCGGroup, DTCGToken, FlatToken, TokenCategory, TokenType, TokenValue } from './types';

export function isToken(obj: any): obj is DTCGToken {
  return typeof obj === 'object' && obj !== null && '$value' in obj;
}

export function isCompositeType(type?: TokenType): boolean {
  return type === 'typography' || type === 'shadow' || type === 'border' || type === 'gradient';
}

export function inferCategory(path: string, type?: TokenType): TokenCategory {
  const root = path.split('.')[0].toLowerCase();
  if (['color', 'colors', 'colour'].includes(root)) return 'color';
  if (['spacing', 'space', 'padding', 'margin', 'gap'].includes(root)) return 'spacing';
  if (['size', 'sizing', 'width', 'height'].includes(root)) return 'sizing';
  if (['typography', 'font', 'text'].includes(root)) return 'typography';
  if (['radius', 'border-radius', 'borderradius'].includes(root)) return 'borderRadius';
  if (['shadow', 'shadows', 'box-shadow'].includes(root)) return 'shadow';
  if (['border', 'borders'].includes(root)) return 'border';
  if (['opacity', 'alpha'].includes(root)) return 'opacity';
  if (['motion', 'transition', 'animation', 'duration'].includes(root)) return 'motion';
  if (['breakpoint', 'screens'].includes(root)) return 'breakpoint';

  if (type === 'color' || type === 'gradient') return 'color';
  if (type === 'typography' || ['fontSize', 'fontFamily', 'fontWeight', 'lineHeight', 'letterSpacing'].includes(type || '')) {
    return 'typography';
  }
  if (type === 'borderRadius') return 'borderRadius';
  if (type === 'shadow') return 'shadow';
  if (type === 'border') return 'border';

  return 'other';
}

export function inferType(val: any, category: TokenCategory, explicitType?: TokenType): TokenType {
  if (explicitType) return explicitType;

  if (typeof val === 'object' && val !== null) {
    if (Array.isArray(val)) {
      if (val.length > 0 && typeof val[0] === 'object' && val[0] !== null && 'blur' in val[0]) {
        return 'shadow';
      }
    } else {
      if ('fontFamily' in val && 'fontSize' in val) return 'typography';
      if ('blur' in val || ('offsetX' in val && 'offsetY' in val)) return 'shadow';
      if ('width' in val && ('color' in val || 'style' in val)) return 'border';
      if ('stops' in val) return 'gradient';
    }
  }

  if (typeof val === 'string') {
    if (val.startsWith('#') || val.startsWith('rgb') || val.startsWith('hsl')) return 'color';
    if (val.endsWith('px') || val.endsWith('rem') || val.endsWith('em') || val.endsWith('%')) return 'dimension';
    if (val.endsWith('ms') || val.endsWith('s')) return 'duration';
  }

  if (category === 'color') return 'color';
  if (category === 'spacing' || category === 'sizing') return 'dimension';
  if (category === 'borderRadius') return 'borderRadius';
  if (category === 'shadow') return 'shadow';
  if (category === 'border') return 'border';
  if (category === 'typography') return 'typography';

  return 'custom';
}

function extractNestedAliases(val: any, prefix: string = ''): Array<{ property: string; targetPath: string }> {
  const result: Array<{ property: string; targetPath: string }> = [];
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}') && !trimmed.includes(':') && !trimmed.includes('"')) {
      result.push({ property: prefix, targetPath: trimmed.slice(1, -1).trim() });
    }
  } else if (Array.isArray(val)) {
    val.forEach((item, index) => {
      result.push(...extractNestedAliases(item, `${prefix}[${index}]`));
    });
  } else if (typeof val === 'object' && val !== null) {
    for (const [k, v] of Object.entries(val)) {
      const propPath = prefix ? `${prefix}.${k}` : k;
      result.push(...extractNestedAliases(v, propPath));
    }
  }
  return result;
}

export function parseDTCGTree(tree: Record<string, any>, parentPath: string = '', inheritedType?: TokenType): FlatToken[] {
  const result: FlatToken[] = [];

  for (const [key, value] of Object.entries(tree)) {
    if (key.startsWith('$')) continue; // Skip metadata keys at group level

    const currentPath = parentPath ? `${parentPath}.${key}` : key;
    const currentGroupType = tree.$type || inheritedType;

    if (isToken(value)) {
      const inferredCat = inferCategory(currentPath, value.$type || currentGroupType);
      const type = inferType(value.$value, inferredCat, value.$type || currentGroupType);
      const category = inferCategory(currentPath, type);

      const isComposite = typeof value.$value === 'object' && value.$value !== null;

      if (isComposite) {
        // Deep clone structured object to maintain immutability
        const structuredValue = JSON.parse(JSON.stringify(value.$value));
        const nestedAliases = extractNestedAliases(structuredValue);

        result.push({
          name: key,
          path: currentPath,
          category,
          type,
          rawValue: structuredValue,
          resolvedValue: JSON.parse(JSON.stringify(structuredValue)), // will be resolved in resolver step
          isComposite: true,
          isAlias: false,
          nestedAliasTargets: nestedAliases.length > 0 ? nestedAliases : undefined,
          isDeprecated: Boolean(value.$extensions?.['deprecated'] || value.$deprecated),
          description: value.$description,
          extensions: value.$extensions,
        });
      } else {
        const rawVal = String(value.$value);
        const isAliasMatch = rawVal.startsWith('{') && rawVal.endsWith('}') && !rawVal.includes(':') && !rawVal.includes('"');
        const aliasTarget = isAliasMatch ? rawVal.slice(1, -1).trim() : undefined;

        result.push({
          name: key,
          path: currentPath,
          category,
          type,
          rawValue: rawVal,
          resolvedValue: rawVal, // will be resolved in resolver step
          isComposite: false,
          isAlias: isAliasMatch,
          aliasTarget,
          isDeprecated: Boolean(value.$extensions?.['deprecated'] || value.$deprecated),
          description: value.$description,
          extensions: value.$extensions,
        });
      }
    } else if (typeof value === 'object' && value !== null) {
      result.push(...parseDTCGTree(value, currentPath, currentGroupType));
    }
  }

  return result;
}
