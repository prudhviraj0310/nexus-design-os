export interface FigmaVariable {
  id: string;
  name: string; // e.g. "color/brand/primary" or "spacing/md"
  key: string;
  variableCollectionId: string;
  resolvedType: 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN';
  valuesByMode: Record<string, any>; // modeId -> RGBA object or { type: 'VARIABLE_ALIAS', id: '...' }
  description?: string;
  hiddenFromPublishing?: boolean;
}

export interface FigmaVariableCollection {
  id: string;
  name: string; // e.g. "Color Palette", "Spacing Scale"
  modes: Array<{
    modeId: string;
    name: string; // e.g. "Light", "Dark", "Default"
  }>;
  defaultModeId: string;
}

export interface FigmaVariablesResponse {
  status?: number;
  error?: boolean;
  message?: string;
  meta?: {
    variableCollections: Record<string, FigmaVariableCollection>;
    variables: Record<string, FigmaVariable>;
  };
}

export interface FigmaSyncRequest {
  fileKey: string;
  figmaToken?: string;
  selectedCollectionIds?: string[];
  modeName?: string; // e.g. "Light" or "Default"
  dryRun?: boolean;
}

export interface TokenDiffItem {
  path: string;
  status: 'added' | 'modified' | 'unchanged' | 'conflict';
  oldValue?: string;
  newValue: string;
  category: string;
}

export interface FigmaSyncResult {
  success: boolean;
  totalVariablesFound: number;
  tokensImported: number;
  diff: TokenDiffItem[];
  error?: string;
}
