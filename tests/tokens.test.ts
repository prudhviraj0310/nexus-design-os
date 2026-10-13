import { describe, it, expect } from 'vitest';
import { parseDTCGTree } from '../src/core/tokens/parser.js';
import { resolveTokenAliases } from '../src/core/tokens/resolver.js';
import { validateTokens } from '../src/core/tokens/validator.js';

describe('Token Engine: W3C DTCG Parsing, Resolution & Validation', () => {
  it('parses nested DTCG token trees correctly', () => {
    const rawTree = {
      color: {
        brand: {
          primary: { $value: '#2563eb', $type: 'color', $description: 'Primary brand color' },
        },
      },
      spacing: {
        sm: { $value: '8px', $type: 'dimension' },
      },
    };

    const tokens = parseDTCGTree(rawTree);
    expect(tokens).toHaveLength(2);
    expect(tokens[0].path).toBe('color.brand.primary');
    expect(tokens[0].category).toBe('color');
    expect(tokens[0].rawValue).toBe('#2563eb');
    expect(tokens[1].path).toBe('spacing.sm');
    expect(tokens[1].category).toBe('spacing');
  });

  it('resolves aliases accurately', () => {
    const rawTree = {
      color: {
        primitive: {
          blue: { $value: '#3b82f6', $type: 'color' },
        },
        semantic: {
          primary: { $value: '{color.primitive.blue}', $type: 'color' },
          action: { $value: '{color.semantic.primary}', $type: 'color' }, // chained alias
        },
      },
    };

    const parsed = parseDTCGTree(rawTree);
    const resolved = resolveTokenAliases(parsed);

    expect(resolved.cycles).toHaveLength(0);
    expect(resolved.unresolvedAliases).toHaveLength(0);

    const actionToken = resolved.tokens.find((t) => t.path === 'color.semantic.action');
    expect(actionToken).toBeDefined();
    expect(actionToken?.resolvedValue).toBe('#3b82f6');
  });

  it('detects circular dependencies and flags them', () => {
    const rawTree = {
      color: {
        a: { $value: '{color.b}', $type: 'color' },
        b: { $value: '{color.c}', $type: 'color' },
        c: { $value: '{color.a}', $type: 'color' }, // cycle!
      },
    };

    const parsed = parseDTCGTree(rawTree);
    const resolved = resolveTokenAliases(parsed);

    expect(resolved.cycles.length).toBeGreaterThan(0);
    const cycleToken = resolved.tokens.find((t) => t.path === 'color.a');
    expect(cycleToken?.resolvedValue).toContain('Circular');
  });

  it('validates tokens and reports malformed color and dimension values', () => {
    const parsed = parseDTCGTree({
      color: {
        valid: { $value: '#10b981', $type: 'color' },
        invalid: { $value: 'not-a-color-value', $type: 'color' },
      },
      spacing: {
        invalid: { $value: 'abc', $type: 'dimension' },
      },
    });

    const validation = validateTokens(parsed);
    expect(validation.valid).toBe(false);
    expect(validation.errors).toHaveLength(2);
    expect(validation.errors[0].path).toBe('color.invalid');
    expect(validation.errors[1].path).toBe('spacing.invalid');
  });
});
