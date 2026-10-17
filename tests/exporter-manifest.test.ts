import { describe, it, expect } from 'vitest';
import {
  BUILTIN_EXPORTER_MANIFESTS,
  resolveExporterConfig,
  executeExporterWithManifest,
  ExporterConfigValidationError,
} from '../src/core/exporters/manifest';
import { FlatToken } from '../src/core/tokens/types';

describe('Tier 2: Declarative Exporter Manifest & Config Engine', () => {
  const mockTokens: FlatToken[] = [
    {
      id: 'tok-1',
      name: 'primary',
      path: 'color.brand.primary',
      category: 'color',
      type: 'color',
      rawValue: '#3b82f6',
      resolvedValue: '#3b82f6',
      isAlias: false,
    },
    {
      id: 'tok-2',
      name: 'md',
      path: 'spacing.layout.md',
      category: 'spacing',
      type: 'dimension',
      rawValue: '16px',
      resolvedValue: '16px',
      isAlias: false,
    },
  ];

  it('provides comprehensive declarative manifests for all 6 core exporters', () => {
    const requiredExporters = ['css', 'typescript', 'tailwind', 'swift', 'kotlin', 'json'];
    for (const exp of requiredExporters) {
      const manifest = BUILTIN_EXPORTER_MANIFESTS[exp];
      expect(manifest).toBeDefined();
      expect(manifest.id).toContain('@nexus/exporter-');
      expect(manifest.version).toBe('1.0.0');
      expect(manifest.author).toBe('Nexus Design OS');
      expect(manifest.supportedTokenTypes.length).toBeGreaterThanOrEqual(2);
      expect(Array.isArray(manifest.settings)).toBe(true);
    }
  });

  it('validates configuration values against manifest types and enforces select options', () => {
    const tailwindManifest = BUILTIN_EXPORTER_MANIFESTS.tailwind;

    // Valid options
    const resolved = resolveExporterConfig(tailwindManifest, {
      prefix: 'custom-ds',
      version: 'v4',
    });
    expect(resolved.prefix).toBe('custom-ds');
    expect(resolved.version).toBe('v4');

    // Invalid select option must throw validation error
    expect(() =>
      resolveExporterConfig(tailwindManifest, {
        version: 'v99_non_existent',
      })
    ).toThrow(ExporterConfigValidationError);

    // Invalid type (expected string, got number)
    expect(() =>
      resolveExporterConfig(tailwindManifest, {
        prefix: 12345,
      })
    ).toThrow(ExporterConfigValidationError);
  });

  it('applies manifest default settings when user options are omitted', () => {
    const cssManifest = BUILTIN_EXPORTER_MANIFESTS.css;
    const resolved = resolveExporterConfig(cssManifest, {});

    expect(resolved.prefix).toBe('nexus');
    expect(resolved.selector).toBe(':root');
    expect(resolved.indent).toBe(2);
  });

  it('executes exporter via manifest with verified custom settings', () => {
    const result = executeExporterWithManifest('css', mockTokens, {
      prefix: 'acme',
    });

    expect(result.filename).toBe('tokens.css');
    expect(result.format).toBe('css');
    expect(result.content).toContain('--acme-color-brand-primary');
    expect(result.content).toContain('#3b82f6');
  });
});
