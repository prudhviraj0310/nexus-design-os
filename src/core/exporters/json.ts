import { FlatToken } from '../tokens/types.js';
import { ExporterOptions, GeneratedFile } from './types.js';

export function exportToJson(tokens: FlatToken[], options: ExporterOptions = {}): GeneratedFile {
  const dtcgTree: Record<string, any> = {};

  for (const token of tokens) {
    const parts = token.path.split('.');
    let current = dtcgTree;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = {
          $value: token.rawValue,
          $type: token.type,
          ...(token.description ? { $description: token.description } : {}),
          ...(token.extensions ? { $extensions: token.extensions } : {}),
        };
      } else {
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
    }
  }

  const indent = options.indent ?? 2;

  return {
    filename: 'tokens.json',
    content: JSON.stringify(dtcgTree, null, indent) + '\n',
    format: 'json',
  };
}

export function exportToFlatJson(tokens: FlatToken[], options: ExporterOptions = {}): GeneratedFile {
  const map: Record<string, string> = {};
  for (const token of tokens) {
    map[token.path] = token.resolvedValue;
  }
  const indent = options.indent ?? 2;
  return {
    filename: 'tokens.flat.json',
    content: JSON.stringify(map, null, indent) + '\n',
    format: 'json',
  };
}
