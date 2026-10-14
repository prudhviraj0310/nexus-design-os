import { FlatToken, TokenCategory, TokenType } from '../tokens/types';
import { FigmaVariable, FigmaVariableCollection, FigmaVariablesResponse } from './types';

export function rgbaToHex(r: number, g: number, b: number, a: number = 1): string {
  const toHex = (val: number) => {
    const int = Math.round(val * 255);
    return int.toString(16).padStart(2, '0');
  };

  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  if (a < 1) {
    return `${hex}${toHex(a)}`;
  }
  return hex;
}

export function figmaNameToTokenPath(name: string): string {
  return name.replace(/\//g, '.').replace(/\s+/g, '-').toLowerCase();
}

export function mapFigmaVariablesToDTCG(
  payload: FigmaVariablesResponse,
  targetModeName?: string
): FlatToken[] {
  if (!payload.meta?.variables) return [];

  const { variables, variableCollections } = payload.meta;
  const result: FlatToken[] = [];

  // Build a lookup map of variable ID -> token path for resolving aliases
  const idToPathMap = new Map<string, string>();
  for (const [id, variable] of Object.entries(variables)) {
    idToPathMap.set(id, figmaNameToTokenPath(variable.name));
  }

  for (const [id, variable] of Object.entries(variables)) {
    const path = figmaNameToTokenPath(variable.name);
    const collection = variableCollections?.[variable.variableCollectionId];

    // Determine target mode ID (default mode or mode matching targetModeName)
    let selectedModeId = collection?.defaultModeId;
    if (targetModeName && collection?.modes) {
      const matchingMode = collection.modes.find(
        (m) => m.name.toLowerCase() === targetModeName.toLowerCase()
      );
      if (matchingMode) selectedModeId = matchingMode.modeId;
    }

    const rawModeValue = selectedModeId ? variable.valuesByMode[selectedModeId] : Object.values(variable.valuesByMode)[0];

    let category: TokenCategory = 'other';
    let type: TokenType = 'custom';
    let rawValue = '';
    let resolvedValue = '';
    let isAlias = false;
    let aliasTarget: string | undefined;

    // Handle variable aliases in Figma
    if (rawModeValue && typeof rawModeValue === 'object' && rawModeValue.type === 'VARIABLE_ALIAS') {
      isAlias = true;
      const targetPath = idToPathMap.get(rawModeValue.id) || 'unknown';
      aliasTarget = targetPath;
      rawValue = `{${targetPath}}`;
      resolvedValue = `{${targetPath}}`;
    }

    if (variable.resolvedType === 'COLOR') {
      category = 'color';
      type = 'color';
      if (!isAlias && rawModeValue && typeof rawModeValue === 'object') {
        const hex = rgbaToHex(rawModeValue.r, rawModeValue.g, rawModeValue.b, rawModeValue.a ?? 1);
        rawValue = hex;
        resolvedValue = hex;
      }
    } else if (variable.resolvedType === 'FLOAT') {
      type = 'dimension';
      if (path.startsWith('spacing') || path.startsWith('space') || path.startsWith('padding') || path.startsWith('margin')) {
        category = 'spacing';
      } else if (path.startsWith('radius') || path.startsWith('border-radius')) {
        category = 'borderRadius';
      } else {
        category = 'sizing';
      }

      if (!isAlias && typeof rawModeValue === 'number') {
        rawValue = `${rawModeValue}px`;
        resolvedValue = `${rawModeValue}px`;
      }
    } else if (variable.resolvedType === 'STRING') {
      category = 'typography';
      type = 'fontFamily';
      if (!isAlias) {
        rawValue = String(rawModeValue);
        resolvedValue = String(rawModeValue);
      }
    }

    result.push({
      name: variable.name.split('/').pop() || variable.name,
      path,
      category,
      type,
      rawValue,
      resolvedValue,
      isAlias,
      aliasTarget,
      originSourceId: variable.id || id,
      description: variable.description || undefined,
    });
  }

  return result;
}
