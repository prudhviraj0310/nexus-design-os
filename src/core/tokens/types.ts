export type TokenType =
  | 'color'
  | 'dimension'
  | 'fontFamily'
  | 'fontWeight'
  | 'fontSize'
  | 'lineHeight'
  | 'letterSpacing'
  | 'shadow'
  | 'border'
  | 'borderRadius'
  | 'opacity'
  | 'duration'
  | 'cubicBezier'
  | 'custom';

export type TokenCategory =
  | 'color'
  | 'typography'
  | 'spacing'
  | 'sizing'
  | 'borderRadius'
  | 'shadow'
  | 'opacity'
  | 'motion'
  | 'breakpoint'
  | 'other';

export interface DTCGToken {
  $value: any;
  $type?: TokenType;
  $description?: string;
  $extensions?: Record<string, any>;
  [key: string]: any;
}

export type DTCGGroup = {
  $type?: TokenType;
  $description?: string;
  [key: string]: DTCGToken | DTCGGroup | any;
};

export interface FlatToken {
  name: string;
  path: string; // e.g. "color.brand.primary"
  category: TokenCategory;
  type: TokenType;
  rawValue: string;
  resolvedValue: string;
  isAlias: boolean;
  aliasTarget?: string;
  isDeprecated?: boolean;
  description?: string;
  extensions?: Record<string, any>;
}

export interface TokenValidationResult {
  valid: boolean;
  errors: Array<{
    path: string;
    message: string;
  }>;
}

export interface AliasResolutionResult {
  tokens: FlatToken[];
  cycles: Array<{
    path: string;
    cycle: string[];
  }>;
  unresolvedAliases: Array<{
    path: string;
    target: string;
  }>;
}
