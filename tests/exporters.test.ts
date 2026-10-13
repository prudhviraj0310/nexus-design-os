import { describe, it, expect } from 'vitest';
import { parseDTCGTree } from '../src/core/tokens/parser';
import { resolveTokenAliases } from '../src/core/tokens/resolver';
import { exportToCss } from '../src/core/exporters/css';
import { exportToJson, exportToFlatJson } from '../src/core/exporters/json';
import { exportToTypeScript } from '../src/core/exporters/typescript';
import { exportToTailwind } from '../src/core/exporters/tailwind';

describe('Deterministic Exporters: CSS, JSON, TypeScript, Tailwind', () => {
  const sampleTree = {
    color: {
      brand: {
        primary: { $value: '#3b82f6', $type: 'color', $description: 'Primary blue' },
      },
    },
    spacing: {
      md: { $value: '16px', $type: 'dimension' },
    },
    borderRadius: {
      lg: { $value: '12px', $type: 'borderRadius' },
    },
  };

  const parsed = parseDTCGTree(sampleTree);
  const { tokens } = resolveTokenAliases(parsed);

  it('exports valid CSS custom properties with prefix support', () => {
    const css = exportToCss(tokens, { prefix: 'nova' });
    expect(css.filename).toBe('tokens.css');
    expect(css.content).toContain(':root {');
    expect(css.content).toContain('--nova-color-brand-primary: #3b82f6;');
    expect(css.content).toContain('--nova-spacing-md: 16px;');
    expect(css.content).toContain('--nova-borderRadius-lg: 12px;');
  });

  it('exports valid W3C DTCG and flat JSON', () => {
    const dtcgJson = exportToJson(tokens);
    const parsedDtcg = JSON.parse(dtcgJson.content);
    expect(parsedDtcg.color.brand.primary.$value).toBe('#3b82f6');

    const flatJson = exportToFlatJson(tokens);
    const parsedFlat = JSON.parse(flatJson.content);
    expect(parsedFlat['color.brand.primary']).toBe('#3b82f6');
    expect(parsedFlat['spacing.md']).toBe('16px');
  });

  it('exports valid TypeScript definitions with const assertions', () => {
    const ts = exportToTypeScript(tokens);
    expect(ts.filename).toBe('tokens.ts');
    expect(ts.content).toContain('export const tokens =');
    expect(ts.content).toContain('"primary": "#3b82f6"');
    expect(ts.content).toContain('export type DesignTokens = typeof tokens;');
    expect(ts.content).toContain("'color.brand.primary'");
  });

  it('exports valid Tailwind theme configuration extension', () => {
    const tw = exportToTailwind(tokens, { prefix: 'nova' });
    expect(tw.filename).toBe('tailwind.tokens.js');
    expect(tw.content).toContain('module.exports = {');
    expect(tw.content).toContain('"brand-primary": "var(--nova-color-brand-primary)"');
    expect(tw.content).toContain('"md": "var(--nova-spacing-md)"');
  });
});
