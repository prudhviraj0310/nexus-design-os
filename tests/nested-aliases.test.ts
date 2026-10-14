import { describe, it, expect } from 'vitest';
import { parseDTCGTree } from '../src/core/tokens/parser';
import { resolveTokenAliases } from '../src/core/tokens/resolver';
import { TypographyValue, ShadowValue, BorderValue } from '../src/core/tokens/types';

describe('Phase 1: Type-Aware Nested Alias Resolution & Diagnostics', () => {
  it('resolves nested property aliases inside composite tokens', () => {
    const rawTree = {
      font: {
        heading: { $value: 'Outfit, system-ui, sans-serif', $type: 'fontFamily' },
      },
      size: {
        xl: { $value: '24px', $type: 'dimension' },
      },
      leading: {
        normal: { $value: '1.5', $type: 'custom' },
      },
      typography: {
        header: {
          $type: 'typography',
          $value: {
            fontFamily: '{font.heading}',
            fontSize: '{size.xl}',
            lineHeight: '{leading.normal}',
            fontWeight: 600,
          },
        },
      },
    };

    const parsed = parseDTCGTree(rawTree);
    const resolved = resolveTokenAliases(parsed);

    expect(resolved.cycles).toHaveLength(0);
    expect(resolved.unresolvedAliases).toHaveLength(0);

    const header = resolved.tokens.find((t) => t.path === 'typography.header');
    expect(header).toBeDefined();
    expect(header?.isComposite).toBe(true);

    const val = header?.resolvedValue as TypographyValue;
    expect(val.fontFamily).toBe('Outfit, system-ui, sans-serif');
    expect(val.fontSize).toBe('24px');
    expect(val.lineHeight).toBe('1.5');
    expect(val.fontWeight).toBe(600);
  });

  it('detects cycles spanning nested composite sub-properties', () => {
    const rawTree = {
      dimension: {
        step1: { $value: '{typography.heading.fontSize}', $type: 'dimension' },
      },
      typography: {
        heading: {
          $type: 'typography',
          $value: {
            fontFamily: 'Inter',
            fontSize: '{dimension.step1}', // Cycle: typography.heading -> dimension.step1 -> typography.heading.fontSize
          },
        },
      },
    };

    const parsed = parseDTCGTree(rawTree);
    const resolved = resolveTokenAliases(parsed);

    expect(resolved.cycles.length).toBeGreaterThan(0);
    const heading = resolved.tokens.find((t) => t.path === 'typography.heading');
    const val = heading?.resolvedValue as any;
    expect(val.fontSize).toContain('Circular');
  });

  it('safely handles missing alias references in composite properties without throwing', () => {
    const rawTree = {
      typography: {
        orphan: {
          $type: 'typography',
          $value: {
            fontFamily: '{missing.font.family}',
            fontSize: '16px',
          },
        },
      },
    };

    const parsed = parseDTCGTree(rawTree);
    const resolved = resolveTokenAliases(parsed);

    expect(resolved.unresolvedAliases.length).toBeGreaterThan(0);
    expect(resolved.unresolvedAliases[0].target).toBe('missing.font.family');

    const orphan = resolved.tokens.find((t) => t.path === 'typography.orphan');
    const val = orphan?.resolvedValue as any;
    expect(val.fontFamily).toContain('[Unresolved: {missing.font.family}]');
    expect(val.fontSize).toBe('16px'); // Sibling property remains valid!
  });

  it('detects and reports semantic type mismatches in sub-property alias targets', () => {
    const rawTree = {
      color: {
        blue: { $value: '#3b82f6', $type: 'color' },
      },
      dimension: {
        pad: { $value: '16px', $type: 'dimension' },
      },
      typography: {
        invalidSize: {
          $type: 'typography',
          $value: {
            fontFamily: 'Inter',
            fontSize: '{color.blue}', // Type mismatch: fontSize expects dimension/fontSize, but got color!
          },
        },
      },
      shadow: {
        invalidColor: {
          $type: 'shadow',
          $value: {
            color: '{dimension.pad}', // Type mismatch: color expects color, but got dimension!
            offsetX: '0px',
            offsetY: '4px',
            blur: '8px',
          },
        },
      },
    };

    const parsed = parseDTCGTree(rawTree);
    const resolved = resolveTokenAliases(parsed);

    expect(resolved.typeErrors).toBeDefined();
    expect(resolved.typeErrors!.length).toBe(2);

    const fontSizeError = resolved.typeErrors!.find((e) => e.path === 'typography.invalidSize');
    expect(fontSizeError).toBeDefined();
    expect(fontSizeError?.property).toBe('fontSize');
    expect(fontSizeError?.received).toBe('color');

    const shadowColorError = resolved.typeErrors!.find((e) => e.path === 'shadow.invalidColor');
    expect(shadowColorError).toBeDefined();
    expect(shadowColorError?.property).toBe('color');
    expect(shadowColorError?.received).toBe('dimension');
  });
});
