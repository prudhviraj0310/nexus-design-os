import { describe, it, expect } from 'vitest';
import { parseDTCGTree } from '../src/core/tokens/parser';
import {
  resolveThemeTokens,
  ThemeCycleError,
  InvalidThemeParentError,
  DuplicateOverrideError,
  UnknownTokenPathError,
  ThemeIsolationError,
} from '../src/core/tokens/themes';
import { Theme, TokenOverride } from '../src/core/tokens/types';

describe('Phase 1: Deterministic Multi-Brand Theme Inheritance & Sparse Overrides', () => {
  const baseTokens = parseDTCGTree({
    color: {
      primitive: {
        blue: { $value: '#2563eb', $type: 'color' },
        purple: { $value: '#9333ea', $type: 'color' },
        slate100: { $value: '#f1f5f9', $type: 'color' },
        slate900: { $value: '#0f172a', $type: 'color' },
      },
      semantic: {
        brand: { $value: '{color.primitive.blue}', $type: 'color' },
        surface: { $value: '{color.primitive.slate100}', $type: 'color' },
        text: { $value: '{color.primitive.slate900}', $type: 'color' },
      },
    },
    spacing: {
      md: { $value: '16px', $type: 'dimension' },
    },
  });

  const dsId = 'ds-main';

  it('cascades sparse overrides through a 3-tier theme hierarchy and re-resolves aliases', () => {
    const themes: Theme[] = [
      { id: 'theme-base', designSystemId: dsId, name: 'Base', codeName: 'base', parentThemeId: null },
      { id: 'theme-brand-b', designSystemId: dsId, name: 'Brand B', codeName: 'brand-b', parentThemeId: 'theme-base' },
      { id: 'theme-brand-b-dark', designSystemId: dsId, name: 'Brand B Dark', codeName: 'brand-b-dark', parentThemeId: 'theme-brand-b' },
    ];

    const overrides: TokenOverride[] = [
      // In Brand B, change brand color alias from blue to purple
      {
        id: 'ov-1',
        themeId: 'theme-brand-b',
        tokenPath: 'color.semantic.brand',
        rawValue: '{color.primitive.purple}',
      },
      // In Brand B Dark, swap surface and text colors
      {
        id: 'ov-2',
        themeId: 'theme-brand-b-dark',
        tokenPath: 'color.semantic.surface',
        rawValue: '{color.primitive.slate900}',
      },
      {
        id: 'ov-3',
        themeId: 'theme-brand-b-dark',
        tokenPath: 'color.semantic.text',
        rawValue: '{color.primitive.slate100}',
      },
    ];

    // 1. Resolve Brand B (Tier 2)
    const brandBResult = resolveThemeTokens(baseTokens, themes, overrides, 'theme-brand-b', dsId);
    const brandBBrandToken = brandBResult.tokens.find((t) => t.path === 'color.semantic.brand');
    expect(brandBBrandToken?.resolvedValue).toBe('#9333ea'); // Overridden to purple
    const brandBSurfaceToken = brandBResult.tokens.find((t) => t.path === 'color.semantic.surface');
    expect(brandBSurfaceToken?.resolvedValue).toBe('#f1f5f9'); // Inherited untouched from base
    const brandBSpacing = brandBResult.tokens.find((t) => t.path === 'spacing.md');
    expect(brandBSpacing?.resolvedValue).toBe('16px'); // Inherited untouched

    // 2. Resolve Brand B Dark (Tier 3)
    const darkResult = resolveThemeTokens(baseTokens, themes, overrides, 'theme-brand-b-dark', dsId);
    const darkBrandToken = darkResult.tokens.find((t) => t.path === 'color.semantic.brand');
    expect(darkBrandToken?.resolvedValue).toBe('#9333ea'); // Inherited from Brand B!
    const darkSurfaceToken = darkResult.tokens.find((t) => t.path === 'color.semantic.surface');
    expect(darkSurfaceToken?.resolvedValue).toBe('#0f172a'); // Overridden to dark surface
    const darkTextToken = darkResult.tokens.find((t) => t.path === 'color.semantic.text');
    expect(darkTextToken?.resolvedValue).toBe('#f1f5f9'); // Overridden to light text
  });

  it('strictly rejects circular parent relationships in theme hierarchy', () => {
    const cyclicThemes: Theme[] = [
      { id: 'theme-a', designSystemId: dsId, name: 'A', codeName: 'a', parentThemeId: 'theme-b' },
      { id: 'theme-b', designSystemId: dsId, name: 'B', codeName: 'b', parentThemeId: 'theme-c' },
      { id: 'theme-c', designSystemId: dsId, name: 'C', codeName: 'c', parentThemeId: 'theme-a' }, // Cycle!
    ];

    expect(() => {
      resolveThemeTokens(baseTokens, cyclicThemes, [], 'theme-a', dsId);
    }).toThrow(ThemeCycleError);
  });

  it('rejects invalid or missing parentThemeId references', () => {
    const invalidThemes: Theme[] = [
      { id: 'theme-child', designSystemId: dsId, name: 'Child', codeName: 'child', parentThemeId: 'non-existent-parent' },
    ];

    expect(() => {
      resolveThemeTokens(baseTokens, invalidThemes, [], 'theme-child', dsId);
    }).toThrow(InvalidThemeParentError);
  });

  it('rejects duplicate overrides targeting the same token in one theme', () => {
    const themes: Theme[] = [
      { id: 'theme-base', designSystemId: dsId, name: 'Base', codeName: 'base', parentThemeId: null },
    ];
    const duplicateOverrides: TokenOverride[] = [
      { id: 'ov-1', themeId: 'theme-base', tokenPath: 'color.semantic.brand', rawValue: '#ff0000' },
      { id: 'ov-2', themeId: 'theme-base', tokenPath: 'color.semantic.brand', rawValue: '#00ff00' }, // Duplicate!
    ];

    expect(() => {
      resolveThemeTokens(baseTokens, themes, duplicateOverrides, 'theme-base', dsId);
    }).toThrow(DuplicateOverrideError);
  });

  it('rejects overrides targeting unknown token paths', () => {
    const themes: Theme[] = [
      { id: 'theme-base', designSystemId: dsId, name: 'Base', codeName: 'base', parentThemeId: null },
    ];
    const unknownOverrides: TokenOverride[] = [
      { id: 'ov-1', themeId: 'theme-base', tokenPath: 'color.unknown.phantom', rawValue: '#ff0000' },
    ];

    expect(() => {
      resolveThemeTokens(baseTokens, themes, unknownOverrides, 'theme-base', dsId);
    }).toThrow(UnknownTokenPathError);
  });

  it('enforces design system tenant isolation across themes', () => {
    const crossTenantThemes: Theme[] = [
      { id: 'theme-1', designSystemId: 'ds-alpha', name: 'Alpha', codeName: 'alpha', parentThemeId: null },
    ];

    expect(() => {
      resolveThemeTokens(baseTokens, crossTenantThemes, [], 'theme-1', 'ds-beta'); // Expected beta but theme is alpha!
    }).toThrow(ThemeIsolationError);
  });
});
