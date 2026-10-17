import { markdownToBlocks } from '@/core/docs/blocks';

export interface ImportedDocument {
  path: string;
  title: string;
  content: string;
  blocks: unknown[];
}

export function parseTokensStudioDocument(input: unknown): Array<Record<string, unknown>> {
  if (!input || typeof input !== 'object') throw new Error('Tokens Studio payload must be an object.');
  const output: Array<Record<string, unknown>> = [];
  const walk = (node: Record<string, unknown>, prefix = '') => {
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('$')) continue;
      const path = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const record = value as Record<string, unknown>;
        if ('$value' in record || 'value' in record) {
          const rawValue = record.$value ?? record.value;
          output.push({
            path,
            name: key,
            category: record.$type || record.type || 'custom',
            type: record.$type || record.type || 'string',
            rawValue: typeof rawValue === 'string' ? rawValue : JSON.stringify(rawValue),
            description: record.$description || record.description || null,
          });
        } else {
          walk(record, path);
        }
      }
    }
  };
  walk(input as Record<string, unknown>);
  return output;
}

export function parseStorybookIndex(input: unknown): Array<Record<string, unknown>> {
  if (!input || typeof input !== 'object') throw new Error('Storybook index must be an object.');
  const entries = (input as { entries?: Record<string, any> }).entries || {};
  return Object.values(entries).map((entry: any) => ({
    id: entry.id,
    title: entry.title || entry.name || entry.id,
    name: entry.name || entry.title || entry.id,
    kind: entry.type || 'story',
    importPath: entry.importPath || null,
    componentPath: entry.componentPath || null,
    args: entry.args || {},
    parameters: entry.parameters || {},
  }));
}

export function importMarkdownFiles(files: Array<{ path: string; content: string }>): ImportedDocument[] {
  return files.map((file) => ({
    path: file.path,
    title: file.path.split('/').pop()?.replace(/\.md$/i, '') || file.path,
    content: file.content,
    blocks: markdownToBlocks(file.content),
  }));
}
