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
      name: 'danger',
      path: 'color.feedback.danger',
      category: 'color',
      type: 'color',
      rawValue: '#ff0000',
      resolvedValue: '#ff0000',
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

  it('detects arbitrary Tailwind classes in JSX className (p-[19px], m-[17px], text-[#ff0000])', () => {
    const code = `<div className="p-[19px] m-[17px] text-[#ff0000]" />`;

    const report = engine.auditFile({
      filePath: 'src/Hero.tsx',
      content: code,
      tokens: mockTokens,
    });

    const spacingFindings = report.findings.filter((f) => f.ruleId === 'RULE-004-HARDCODED-SPACING');
    const colorFindings = report.findings.filter((f) => f.ruleId === 'RULE-001-HARDCODED-COLOR');

    expect(spacingFindings.length).toBe(2);
    expect(spacingFindings.some((f) => f.evidence.includes('p-[19px]'))).toBe(true);
    expect(spacingFindings.some((f) => f.evidence.includes('m-[17px]'))).toBe(true);

    expect(colorFindings.length).toBe(1);
    expect(colorFindings[0].evidence).toContain('text-[#ff0000]');
    expect(colorFindings[0].suggestedFix).toContain('var(--color-feedback-danger)');
  });

  it('detects hardcoded values in standalone JavaScript/TypeScript style objects', () => {
    const code = `const styles = { padding: "19px", color: "#ff0000" };`;

    const report = engine.auditFile({
      filePath: 'src/styles.ts',
      content: code,
      tokens: mockTokens,
    });

    const spacing = report.findings.find((f) => f.ruleId === 'RULE-004-HARDCODED-SPACING');
    const color = report.findings.find((f) => f.ruleId === 'RULE-001-HARDCODED-COLOR');

    expect(spacing).toBeDefined();
    expect(spacing?.evidence).toContain("padding: '19px'");

    expect(color).toBeDefined();
    expect(color?.evidence).toContain("color: '#ff0000'");
  });

  it('detects inline JSX style objects with arbitrary spacing and colors', () => {
    const code = `<div style={{ padding: "19px", color: "#ff0000" }} />`;

    const report = engine.auditFile({
      filePath: 'src/Button.tsx',
      content: code,
      tokens: mockTokens,
    });

    const spacing = report.findings.find((f) => f.ruleId === 'RULE-004-HARDCODED-SPACING');
    const color = report.findings.find((f) => f.ruleId === 'RULE-001-HARDCODED-COLOR');

    expect(spacing).toBeDefined();
    expect(color).toBeDefined();
  });

  it('detects dynamic styling expressions that cannot be statically evaluated', () => {
    const code = `<div style={{ padding: baseSpacing + 3 }} />`;

    const report = engine.auditFile({
      filePath: 'src/Dynamic.tsx',
      content: code,
      tokens: mockTokens,
    });

    const dynFinding = report.findings.find((f) => f.ruleId === 'RULE-005-DYNAMIC-EXPRESSION');
    expect(dynFinding).toBeDefined();
    expect(dynFinding?.severity).toBe('info');
    expect(dynFinding?.message).toContain('Dynamic expression detected');
  });

  it('does NOT emit false positives on valid standard Tailwind classes or registered tokens', () => {
    const code = `
      export function Valid() {
        return (
          <div className="p-4 m-8 text-blue-500" style={{ color: 'var(--color-brand-primary)' }}>
            Compliant
          </div>
        );
      }
    `;

    const report = engine.auditFile({
      filePath: 'src/Valid.tsx',
      content: code,
      tokens: mockTokens,
    });

    expect(report.errorCount).toBe(0);
    expect(report.warningCount).toBe(0);
  });

  it('handles malformed source code gracefully without crashing', () => {
    const code = `export function Broken() { return <div style={{ broken syntax ;;;`;

    const report = engine.auditFile({
      filePath: 'src/Broken.tsx',
      content: code,
      tokens: mockTokens,
    });

    expect(report).toBeDefined();
    expect(Array.isArray(report.findings)).toBe(true);
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
