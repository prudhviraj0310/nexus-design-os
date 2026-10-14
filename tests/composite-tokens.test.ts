import { describe, it, expect } from 'vitest';
import { parseDTCGTree } from '../src/core/tokens/parser';
import { resolveTokenAliases } from '../src/core/tokens/resolver';
import { validateTokens } from '../src/core/tokens/validator';
import { formatCssValue } from '../src/core/exporters/css-utils';
import { exportToCss } from '../src/core/exporters/css';
import { exportToTypeScript } from '../src/core/exporters/typescript';
import { exportToJson, exportToFlatJson } from '../src/core/exporters/json';
import { exportToTailwind } from '../src/core/exporters/tailwind';
import { TypographyValue, ShadowValue, BorderValue } from '../src/core/tokens/types';

describe('Phase 1: DTCG Composite Tokens (Typography, Shadow, Border)', () => {
  it('parses composite typography, shadow, and border tokens into structured objects', () => {
    const rawTree = {
      typography: {
        heading: {
          h1: {
            $type: 'typography',
            $value: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '32px',
              fontWeight: 700,
              lineHeight: '1.25',
              letterSpacing: '-0.02em',
            },
            $description: 'Main page heading',
          },
        },
      },
      shadow: {
        card: {
          $type: 'shadow',
          $value: {
            color: 'rgba(0, 0, 0, 0.1)',
            offsetX: '0px',
            offsetY: '4px',
            blur: '6px',
            spread: '-1px',
            inset: false,
          },
        },
      },
      border: {
        subtle: {
          $type: 'border',
          $value: {
            color: '#e2e8f0',
            width: '1px',
            style: 'solid',
          },
        },
      },
    };

    const tokens = parseDTCGTree(rawTree);
    expect(tokens).toHaveLength(3);

    const h1 = tokens.find((t) => t.path === 'typography.heading.h1');
    expect(h1).toBeDefined();
    expect(h1?.isComposite).toBe(true);
    expect(typeof h1?.resolvedValue).toBe('object');
    expect((h1?.resolvedValue as TypographyValue).fontFamily).toBe('Inter, sans-serif');
    expect((h1?.resolvedValue as TypographyValue).fontSize).toBe('32px');
    expect((h1?.resolvedValue as TypographyValue).fontWeight).toBe(700);

    const shadow = tokens.find((t) => t.path === 'shadow.card');
    expect(shadow).toBeDefined();
    expect(shadow?.isComposite).toBe(true);
    expect((shadow?.resolvedValue as any).blur).toBe('6px');

    const border = tokens.find((t) => t.path === 'border.subtle');
    expect(border).toBeDefined();
    expect(border?.isComposite).toBe(true);
    expect((border?.resolvedValue as BorderValue).color).toBe('#e2e8f0');
  });

  it('validates required fields on composite tokens and catches malformed structures', () => {
    const parsed = parseDTCGTree({
      typography: {
        valid: {
          $type: 'typography',
          $value: { fontFamily: 'Roboto', fontSize: '14px' },
        },
        missingFamily: {
          $type: 'typography',
          $value: { fontSize: '14px' },
        },
        missingSize: {
          $type: 'typography',
          $value: { fontFamily: 'Roboto' },
        },
      },
      shadow: {
        missingColor: {
          $type: 'shadow',
          $value: { offsetX: '0px', offsetY: '2px', blur: '4px' },
        },
      },
      border: {
        missingWidth: {
          $type: 'border',
          $value: { color: '#000' },
        },
      },
    });

    const validation = validateTokens(parsed);
    expect(validation.valid).toBe(false);
    expect(validation.errors.some((e) => e.path === 'typography.missingFamily')).toBe(true);
    expect(validation.errors.some((e) => e.path === 'typography.missingSize')).toBe(true);
    expect(validation.errors.some((e) => e.path === 'shadow.missingColor')).toBe(true);
    expect(validation.errors.some((e) => e.path === 'border.missingWidth')).toBe(true);
  });

  it('formats valid CSS shorthands for composite tokens via formatCssValue helper', () => {
    const parsed = parseDTCGTree({
      typography: {
        display: {
          $type: 'typography',
          $value: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '48px',
            fontWeight: 800,
            lineHeight: '1.1',
          },
        },
      },
      shadow: {
        elevation: {
          $type: 'shadow',
          $value: {
            color: 'rgba(0, 0, 0, 0.25)',
            offsetX: '0px',
            offsetY: '10px',
            blur: '15px',
            spread: '-3px',
          },
        },
      },
      border: {
        primary: {
          $type: 'border',
          $value: {
            color: '#3b82f6',
            width: '2px',
            style: 'dashed',
          },
        },
      },
    });

    const display = parsed.find((t) => t.path === 'typography.display')!;
    const elevation = parsed.find((t) => t.path === 'shadow.elevation')!;
    const border = parsed.find((t) => t.path === 'border.primary')!;

    expect(formatCssValue(display)).toBe('800 48px/1.1 Inter, sans-serif');
    expect(formatCssValue(elevation)).toBe('0px 10px 15px -3px rgba(0, 0, 0, 0.25)');
    expect(formatCssValue(border)).toBe('2px dashed #3b82f6');
  });

  it('exports composite tokens cleanly across CSS, TypeScript, and JSON exporters', () => {
    const parsed = parseDTCGTree({
      color: {
        brand: { primary: { $value: '#2563eb', $type: 'color' } },
      },
      typography: {
        body: {
          $type: 'typography',
          $value: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            fontWeight: 400,
            lineHeight: '1.5',
          },
        },
      },
      shadow: {
        sm: {
          $type: 'shadow',
          $value: {
            color: 'rgba(0, 0, 0, 0.05)',
            offsetX: '0px',
            offsetY: '1px',
            blur: '2px',
          },
        },
      },
    });

    // 1. CSS Exporter: Must not produce [object Object]
    const css = exportToCss(parsed, { prefix: 'nova' });
    expect(css.content).not.toContain('[object Object]');
    expect(css.content).toContain('--nova-typography-body: 400 16px/1.5 Inter, sans-serif;');
    expect(css.content).toContain('--nova-shadow-sm: 0px 1px 2px rgba(0, 0, 0, 0.05);');

    // 2. TypeScript Exporter: Must serialize the structured composite object
    const ts = exportToTypeScript(parsed);
    expect(ts.content).toContain('"fontFamily": "Inter, sans-serif"');
    expect(ts.content).toContain('"fontSize": "16px"');

    // 3. JSON Exporter: Must preserve structured DTCG object in $value
    const dtcg = exportToJson(parsed);
    const parsedDtcg = JSON.parse(dtcg.content);
    expect(parsedDtcg.typography.body.$value.fontFamily).toBe('Inter, sans-serif');
    expect(parsedDtcg.typography.body.$value.fontSize).toBe('16px');

    // 4. Tailwind Exporter: Includes boxShadow
    const tw = exportToTailwind(parsed, { prefix: 'nova' });
    expect(tw.content).toContain('boxShadow: {');
    expect(tw.content).toContain('"sm": "var(--nova-shadow-sm)"');
  });
});
