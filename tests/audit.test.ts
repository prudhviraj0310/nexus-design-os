import { describe, it, expect } from 'vitest';
import { AuditEngine } from '../src/core/audit/engine';
import { FlatToken } from '../src/core/tokens/types';

describe('Quality Intelligence: Design System Compliance & Linter', () => {
  const mockTokens: FlatToken[] = [
    {
      name: 'primary',
      path: 'color.brand.primary',
      category: 'color',
      type: 'color',
      rawValue: '#3b82f6',
      resolvedValue: '#3b82f6',
      isAlias: false,
    },
    {
      name: 'legacy',
      path: 'color.legacy.accent',
      category: 'color',
      type: 'color',
      rawValue: '#ff007f',
      resolvedValue: '#ff007f',
      isAlias: false,
      isDeprecated: true,
      extensions: { replacement: 'color.brand.primary' },
    },
  ];

  const engine = new AuditEngine();

  it('detects hardcoded hex colors and suggests matching token', () => {
    const code = `
      export function Card() {
        return <div style={{ backgroundColor: '#3b82f6', color: '#ff1122' }}>Card</div>;
      }
    `;

    const report = engine.auditFile({
      filePath: 'src/Card.tsx',
      content: code,
      tokens: mockTokens,
    });

    expect(report.totalFindings).toBeGreaterThanOrEqual(2);
    const primaryFinding = report.findings.find((f) => f.evidence.includes('#3b82f6'));
    expect(primaryFinding).toBeDefined();
    expect(primaryFinding?.ruleId).toBe('RULE-001-HARDCODED-COLOR');
    expect(primaryFinding?.suggestedFix).toContain('var(--color-brand-primary)');
  });

  it('detects unrecognized design tokens', () => {
    const code = `
      .card {
        color: var(--color-brand-primary);
        background: var(--color-unknown-fake);
      }
    `;

    const report = engine.auditFile({
      filePath: 'src/Card.css',
      content: code,
      tokens: mockTokens,
    });

    const unknownFinding = report.findings.find((f) => f.ruleId === 'RULE-002-UNKNOWN-TOKEN');
    expect(unknownFinding).toBeDefined();
    expect(unknownFinding?.message).toContain('--color-unknown-fake');
  });

  it('detects deprecated tokens and provides replacement advice', () => {
    const code = `
      .badge {
        color: var(--color-legacy-accent);
      }
    `;

    const report = engine.auditFile({
      filePath: 'src/Badge.css',
      content: code,
      tokens: mockTokens,
    });

    const depFinding = report.findings.find((f) => f.ruleId === 'RULE-003-DEPRECATED-TOKEN');
    expect(depFinding).toBeDefined();
    expect(depFinding?.suggestedFix).toContain('color.brand.primary');
  });

  it('generates standard SARIF report output', () => {
    const code = `const color = '#3b82f6';`;
    const report = engine.auditFile({
      filePath: 'src/test.ts',
      content: code,
      tokens: mockTokens,
    });

    expect(report.sarif).toBeDefined();
    expect(report.sarif?.$schema).toContain('sarif');
    expect(report.sarif?.runs[0].results.length).toBeGreaterThan(0);
  });
});
