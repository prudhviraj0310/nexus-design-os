export type ScalarTokenType =
  | 'color'
  | 'dimension'
  | 'fontFamily'
  | 'fontWeight'
  | 'fontSize'
  | 'lineHeight'
  | 'letterSpacing'
  | 'borderRadius'
  | 'opacity'
  | 'duration'
  | 'cubicBezier'
  | 'custom';

export type CompositeTokenType =
  | 'typography'
  | 'shadow'
  | 'border'
  | 'gradient';

export type TokenType = ScalarTokenType | CompositeTokenType;

export type TokenCategory =
  | 'color'
  | 'typography'
  | 'spacing'
  | 'sizing'
  | 'borderRadius'
  | 'shadow'
  | 'border'
  | 'opacity'
  | 'motion'
  | 'breakpoint'
  | 'other';

export interface TypographyValue {
  fontFamily: string;
  fontSize: string;
  fontWeight?: string | number;
  lineHeight?: string;
  letterSpacing?: string;
  textCase?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'line-through';
}

export interface ShadowLayer {
  color: string;
  offsetX: string;
  offsetY: string;
  blur: string;
  spread?: string;
  inset?: boolean;
}

export type ShadowValue = ShadowLayer | ShadowLayer[];

export interface BorderValue {
  color: string;
  width: string;
  style?: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
}

export interface GradientStop {
  color: string;
  position: number; // 0.0 to 1.0
}

export interface GradientValue {
  type: 'linear' | 'radial';
  angle?: string;
  stops: GradientStop[];
}

export type CompositeTokenValue =
  | TypographyValue
  | ShadowValue
  | BorderValue
  | GradientValue;

export type TokenValue = string | CompositeTokenValue;

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
  id?: string;
  persistentId?: string; // Stable UUID surviving across renames and releases
  originSourceId?: string; // Provider ID (e.g. Figma variable ID)
  designSystemId?: string;
  versionId?: string;
  brandId?: string;
  groupId?: string | null;
  name: string;
  path: string; // e.g. "color.brand.primary" or "typography.heading.h1"
  category: TokenCategory;
  type: TokenType;
  rawValue: TokenValue;
  resolvedValue: TokenValue;
  isComposite?: boolean;
  isAlias: boolean;
  aliasTarget?: string;
  nestedAliasTargets?: Array<{
    property: string;
    targetPath: string;
  }>;
  isDeprecated?: boolean;
  isDeleted?: boolean;
  deletedAt?: Date | string;
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
    property?: string;
  }>;
  typeErrors?: Array<{
    path: string;
    property: string;
    expected: string;
    received: string;
    message: string;
  }>;
}

export interface Brand {
  id: string;
  designSystemId: string;
  name: string;
  codeName: string;
  description?: string | null;
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DesignSystemVersion {
  id: string;
  designSystemId: string;
  name: string;
  description?: string | null;
  isDraft: boolean;
  isReadOnly: boolean;
  createdAt?: Date;
}

export interface Theme {
  id: string;
  persistentId?: string;
  designSystemId: string;
  versionId?: string;
  brandId?: string | null;
  name: string;
  codeName: string;
  description?: string;
  parentThemeId?: string | null;
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TokenOverride {
  id: string;
  themeId: string;
  tokenPersistentId?: string; // Stable reference to tokens.persistent_id
  tokenPath: string; // Denormalized path preserved for fallback and audit
  rawValue: TokenValue;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

