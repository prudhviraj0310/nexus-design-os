export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description?: string;
}

export interface ComponentVariant {
  name: string;
  values: string[];
}

export interface ComponentDefinition {
  id: string;
  name: string;
  category: string;
  framework: string;
  description?: string;
  props: ComponentProp[];
  variants?: ComponentVariant[];
  codeSnippet?: string;
  tokenDependencies?: string[]; // e.g. ["color.brand.primary", "spacing.sm"]
  isDeprecated?: boolean;
}
