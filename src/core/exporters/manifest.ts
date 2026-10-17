import { TokenType, FlatToken } from '../tokens/types';
import { GeneratedFile } from './types';
import { exportToCss } from './css';
import { exportToTypeScript } from './typescript';
import { exportToTailwind } from './tailwind';
import { exportToSwift } from './swift';
import { exportToKotlin } from './kotlin';
import { exportToJson } from './json';

export type SettingType = 'boolean' | 'string' | 'number' | 'select';

export interface ExporterSettingOption {
  label: string;
  value: string | number;
}

export interface ExporterSetting {
  key: string;
  label: string;
  type: SettingType;
  default: any;
  options?: ExporterSettingOption[];
  description: string;
  required?: boolean;
}

export interface ExporterManifest {
  id: string; // e.g. "@nexus/exporter-css"
  name: string;
  title: string;
  version: string;
  description: string;
  author: string;
  supportedTokenTypes: TokenType[];
  settings: ExporterSetting[];
}

export class ExporterConfigValidationError extends Error {
  public errors: string[];
  constructor(errors: string[]) {
    super(`Exporter configuration invalid: ${errors.join('; ')}`);
    this.name = 'ExporterConfigValidationError';
    this.errors = errors;
  }
}

/**
 * Built-in Exporter Manifests
 */
export const BUILTIN_EXPORTER_MANIFESTS: Record<string, ExporterManifest> = {
  css: {
    id: '@nexus/exporter-css',
    name: 'css',
    title: 'CSS Custom Properties',
    version: '1.0.0',
    description: 'Generates standard W3C CSS variables (:root { --prefix-token: value; })',
    author: 'Nexus Design OS',
    supportedTokenTypes: ['color', 'dimension', 'typography', 'shadow', 'border', 'gradient', 'duration'],
    settings: [
      {
        key: 'prefix',
        label: 'CSS Variable Prefix',
        type: 'string',
        default: 'nexus',
        description: 'Namespace prefix for CSS custom properties (e.g. --nexus-color-primary)',
      },
      {
        key: 'selector',
        label: 'Root CSS Selector',
        type: 'string',
        default: ':root',
        description: 'CSS selector wrapping token properties',
      },
      {
        key: 'indent',
        label: 'Indentation Spaces',
        type: 'number',
        default: 2,
        description: 'Number of spaces for code indentation',
      },
    ],
  },

  typescript: {
    id: '@nexus/exporter-typescript',
    name: 'typescript',
    title: 'TypeScript Dictionary',
    version: '1.0.0',
    description: 'Exports strongly typed nested TypeScript constants and type declarations',
    author: 'Nexus Design OS',
    supportedTokenTypes: ['color', 'dimension', 'typography', 'shadow', 'border', 'gradient', 'duration'],
    settings: [
      {
        key: 'constName',
        label: 'Exported Constant Name',
        type: 'string',
        default: 'tokens',
        description: 'Identifier name for the exported dictionary constant',
      },
      {
        key: 'typeOnly',
        label: 'Emit Types Only',
        type: 'boolean',
        default: false,
        description: 'Only generate TypeScript type definitions without runtime object',
      },
    ],
  },

  tailwind: {
    id: '@nexus/exporter-tailwind',
    name: 'tailwind',
    title: 'Tailwind Theme Configuration',
    version: '1.0.0',
    description: 'Generates Tailwind CSS theme tokens and @theme declarations',
    author: 'Nexus Design OS',
    supportedTokenTypes: ['color', 'dimension', 'typography', 'shadow', 'border', 'borderRadius'],
    settings: [
      {
        key: 'prefix',
        label: 'Tailwind Prefix',
        type: 'string',
        default: 'nexus',
        description: 'Variable namespace prefix for Tailwind @theme rules',
      },
      {
        key: 'version',
        label: 'Tailwind Version',
        type: 'select',
        default: 'v4',
        options: [
          { label: 'Tailwind CSS v4 (@theme CSS rules)', value: 'v4' },
          { label: 'Tailwind CSS v3 (tailwind.config.js)', value: 'v3' },
        ],
        description: 'Target Tailwind CSS framework architecture',
      },
    ],
  },

  swift: {
    id: '@nexus/exporter-swift',
    name: 'swift',
    title: 'iOS Swift / SwiftUI',
    version: '1.0.0',
    description: 'Generates native Swift struct with SwiftUI Color and CGFloat constants',
    author: 'Nexus Design OS',
    supportedTokenTypes: ['color', 'dimension'],
    settings: [
      {
        key: 'structName',
        label: 'Swift Struct Name',
        type: 'string',
        default: 'DesignTokens',
        description: 'Name of the generated Swift struct container',
      },
    ],
  },

  kotlin: {
    id: '@nexus/exporter-kotlin',
    name: 'kotlin',
    title: 'Android Kotlin / Jetpack Compose',
    version: '1.0.0',
    description: 'Generates Kotlin object with Compose Color and Dp values',
    author: 'Nexus Design OS',
    supportedTokenTypes: ['color', 'dimension'],
    settings: [
      {
        key: 'objectName',
        label: 'Kotlin Object Name',
        type: 'string',
        default: 'Tokens',
        description: 'Name of the generated Kotlin object container',
      },
    ],
  },

  json: {
    id: '@nexus/exporter-json',
    name: 'json',
    title: 'W3C DTCG Token JSON',
    version: '1.0.0',
    description: 'Standard W3C Design Tokens Community Group JSON format ($value, $type)',
    author: 'Nexus Design OS',
    supportedTokenTypes: ['color', 'dimension', 'typography', 'shadow', 'border', 'gradient'],
    settings: [
      {
        key: 'indent',
        label: 'JSON Indent Spaces',
        type: 'number',
        default: 2,
        description: 'Pretty print whitespace indentation',
      },
    ],
  },
};

/**
 * Validates user-provided options against an ExporterManifest and applies defaults.
 */
export function resolveExporterConfig(
  manifest: ExporterManifest,
  userOptions: Record<string, any> = {}
): Record<string, any> {
  const resolved: Record<string, any> = {};
  const errors: string[] = [];

  for (const setting of manifest.settings) {
    const val = userOptions[setting.key] !== undefined ? userOptions[setting.key] : setting.default;

    if (val === undefined || val === null) {
      if (setting.required) {
        errors.push(`Setting "${setting.key}" is required.`);
      }
      continue;
    }

    switch (setting.type) {
      case 'boolean':
        if (typeof val !== 'boolean') {
          errors.push(`Setting "${setting.key}" expected boolean, got ${typeof val}.`);
        }
        break;
      case 'string':
        if (typeof val !== 'string') {
          errors.push(`Setting "${setting.key}" expected string, got ${typeof val}.`);
        }
        break;
      case 'number':
        if (typeof val !== 'number' || isNaN(val)) {
          errors.push(`Setting "${setting.key}" expected valid number, got ${typeof val}.`);
        }
        break;
      case 'select':
        if (setting.options && !setting.options.some((o) => o.value === val)) {
          const allowed = setting.options.map((o) => `"${o.value}"`).join(', ');
          errors.push(`Setting "${setting.key}" value "${val}" not in allowed options: [${allowed}].`);
        }
        break;
    }

    resolved[setting.key] = val;
  }

  if (errors.length > 0) {
    throw new ExporterConfigValidationError(errors);
  }

  return resolved;
}

/**
 * Manifest-driven exporter execution engine.
 */
export function executeExporterWithManifest(
  exporterName: string,
  tokens: FlatToken[],
  userOptions: Record<string, any> = {}
): GeneratedFile {
  const manifest = BUILTIN_EXPORTER_MANIFESTS[exporterName.toLowerCase()];
  if (!manifest) {
    throw new Error(`Unknown exporter "${exporterName}". Available: ${Object.keys(BUILTIN_EXPORTER_MANIFESTS).join(', ')}`);
  }

  const config = resolveExporterConfig(manifest, userOptions);

  switch (manifest.name) {
    case 'css':
      return exportToCss(tokens, { prefix: config.prefix });
    case 'typescript':
      return exportToTypeScript(tokens);
    case 'tailwind':
      return exportToTailwind(tokens, { prefix: config.prefix });
    case 'swift':
      return exportToSwift(tokens);
    case 'kotlin':
      return exportToKotlin(tokens);
    case 'json':
      return exportToJson(tokens);
    default:
      throw new Error(`Execution handler missing for exporter "${manifest.name}"`);
  }
}
