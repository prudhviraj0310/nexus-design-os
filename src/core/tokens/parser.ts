import { DTCGGroup, DTCGToken, FlatToken, TokenCategory, TokenType } from './types.js';

export function isToken(obj: any): obj is DTCGToken {
  return typeof obj === 'object' && obj !== null && '$value' in obj;
}

export function inferCategory(path: string, type?: TokenType): TokenCategory {
  const root = path.split('.')[0].toLowerCase();
  if (['color', 'colors', 'colour'].includes(root)) return 'color';
  if (['spacing', 'space', 'padding', 'margin', 'gap'].includes(root)) return 'spacing';
  if (['size', 'sizing', 'width', 'height'].includes(root)) return 'sizing';
  if (['typography', 'font', 'text'].includes(root)) return 'typography';
  if (['radius', 'border-radius', 'borderradius'].includes(root)) return 'borderRadius';
  if (['shadow', 'shadows', 'box-shadow'].includes(root)) return 'shadow';
  if (['opacity', 'alpha'].includes(root)) return 'opacity';
  if (['motion', 'transition', 'animation', 'duration'].includes(root)) return 'motion';
  if (['breakpoint', 'screens'].includes(root)) return 'breakpoint';

  if (type === 'color') return 'color';
  if (['fontSize', 'fontFamily', 'fontWeight', 'lineHeight'].includes(type || '')) return 'typography';
  if (type === 'borderRadius') return 'borderRadius';
  if (type === 'shadow') return 'shadow';

  return 'other';
}

export function inferType(val: any, category: TokenCategory, explicitType?: TokenType): TokenType {
  if (explicitType) return explicitType;
  if (typeof val === 'string') {
    if (val.startsWith('#') || val.startsWith('rgb') || val.startsWith('hsl')) return 'color';
    if (val.endsWith('px') || val.endsWith('rem') || val.endsWith('em') || val.endsWith('%')) return 'dimension';
    if (val.endsWith('ms') || val.endsWith('s')) return 'duration';
  }
  if (category === 'color') return 'color';
  if (category === 'spacing' || category === 'sizing') return 'dimension';
  if (category === 'borderRadius') return 'borderRadius';
  if (category === 'shadow') return 'shadow';
  return 'custom';
}

export function parseDTCGTree(tree: Record<string, any>, parentPath: string = '', inheritedType?: TokenType): FlatToken[] {
  const result: FlatToken[] = [];

  for (const [key, value] of Object.entries(tree)) {
    if (key.startsWith('$')) continue; // Skip metadata keys at group level

    const currentPath = parentPath ? `${parentPath}.${key}` : key;
    const currentGroupType = tree.$type || inheritedType;

    if (isToken(value)) {
      const type = inferType(value.$value, inferCategory(currentPath, value.$type || currentGroupType), value.$type || currentGroupType);
      const category = inferCategory(currentPath, type);
      const rawVal = typeof value.$value === 'object' ? JSON.stringify(value.$value) : String(value.$value);
      
      const isAliasMatch = typeof rawVal === 'string' && rawVal.startsWith('{') && rawVal.endsWith('}');
      const aliasTarget = isAliasMatch ? rawVal.slice(1, -1).trim() : undefined;

      result.push({
        name: key,
        path: currentPath,
        category,
        type,
        rawValue: rawVal,
        resolvedValue: rawVal, // will be resolved in resolver step
        isAlias: isAliasMatch,
        aliasTarget,
        isDeprecated: Boolean(value.$extensions?.['deprecated'] || value.$deprecated),
        description: value.$description,
        extensions: value.$extensions,
      });
    } else if (typeof value === 'object' && value !== null) {
      result.push(...parseDTCGTree(value, currentPath, currentGroupType));
    }
  }

  return result;
}
