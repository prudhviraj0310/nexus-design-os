import { FlatToken } from '../tokens/types';

export interface ExporterOptions {
  prefix?: string; // e.g. "nova" -> "--nova-color-brand-primary"
  selector?: string; // e.g. ":root"
  includeComments?: boolean;
  indent?: number;
}

export interface GeneratedFile {
  filename: string;
  content: string;
  format: 'css' | 'json' | 'typescript' | 'javascript';
}
