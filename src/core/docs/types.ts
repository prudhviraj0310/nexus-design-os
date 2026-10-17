export type DocBlockType =
  | 'heading'
  | 'paragraph'
  | 'code'
  | 'callout'
  | 'token_list'
  | 'token_chip'
  | 'figma_embed'
  | 'component_preview'
  | 'component_health_matrix'
  | 'asset_grid'
  | 'table'
  | 'divider'
  | 'tabs';

export interface BaseDocBlock {
  id: string;
  type: DocBlockType;
}

export interface HeadingDocBlock extends BaseDocBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

export interface ParagraphDocBlock extends BaseDocBlock {
  type: 'paragraph';
  text: string;
}

export interface CodeDocBlock extends BaseDocBlock {
  type: 'code';
  language: string;
  code: string;
  title?: string;
  showLineNumbers?: boolean;
}

export interface CalloutDocBlock extends BaseDocBlock {
  type: 'callout';
  calloutType: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  text: string;
}

export interface TokenListDocBlock extends BaseDocBlock {
  type: 'token_list';
  category?: string;
  groupPath?: string;
  tokenPersistentIds?: string[];
  showValues?: boolean;
}

export interface TokenChipDocBlock extends BaseDocBlock {
  type: 'token_chip';
  tokenPath: string;
  tokenPersistentId?: string;
  label?: string;
}

export interface FigmaEmbedDocBlock extends BaseDocBlock {
  type: 'figma_embed';
  url: string;
  title?: string;
  height?: number;
}

export interface ComponentPreviewDocBlock extends BaseDocBlock {
  type: 'component_preview';
  componentId: string;
  framework?: 'react' | 'vue' | 'html';
  variant?: string;
  interactive?: boolean;
}

export interface ComponentHealthMatrixDocBlock extends BaseDocBlock {
  type: 'component_health_matrix';
  title?: string;
  componentIds?: string[];
}

export interface AssetGridDocBlock extends BaseDocBlock {
  type: 'asset_grid';
  category?: 'icons' | 'logos' | 'illustrations';
  filterTag?: string;
  iconSize?: number;
}

export interface TableDocBlock extends BaseDocBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
}

export interface DividerDocBlock extends BaseDocBlock {
  type: 'divider';
}

export interface TabsDocBlock extends BaseDocBlock {
  type: 'tabs';
  tabs: Array<{
    title: string;
    blocks: DocBlock[];
  }>;
}

export type DocBlock =
  | HeadingDocBlock
  | ParagraphDocBlock
  | CodeDocBlock
  | CalloutDocBlock
  | TokenListDocBlock
  | TokenChipDocBlock
  | FigmaEmbedDocBlock
  | ComponentPreviewDocBlock
  | ComponentHealthMatrixDocBlock
  | AssetGridDocBlock
  | TableDocBlock
  | DividerDocBlock
  | TabsDocBlock;

export interface DocRenderContext {
  tokens?: Array<{ path: string; resolvedValue: string; type: string }>;
  components?: Array<{ id: string; name: string; category: string }>;
  assets?: Array<{ id: string; name: string; svgContent: string }>;
}
