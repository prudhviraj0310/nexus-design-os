import { describe, it, expect } from 'vitest';
import { runBabelAstAudit } from '../src/core/audit/ast';
import { exportToTailwindV4 } from '../src/core/exporters/tailwind';
import { computeTokenDiff } from '../src/core/figma/diff';
import { validateApiAuth } from '../src/server/auth';
import { resetEnvCache } from '../src/server/env';
import { FlatToken } from '../src/core/tokens/types';

describe('System Hardening & Audit Remediation Verification', () => {
  const sampleTokens: FlatToken[] = [
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
      name: 'spacing-md',
      path: 'spacing.md',
      category: 'spacing',
      type: 'dimension',
      rawValue: '16px',
      resolvedValue: '16px',
      isAlias: false,
    },
    {
      name: 'retired-color',
      path: 'color.retired.old',
      category: 'color',
      type: 'color',
      rawValue: '#999999',
      resolvedValue: '#999999',
      isAlias: false,
    },
  ];

  it('Babel AST parser traverses JSX AST and catches inline style violations', () => {
    const jsxCode = `
      import React from 'react';
      export const Card = () => (
        <div style={{ color: '#ff0000', padding: '19px', backgroundColor: '#3b82f6' }}>
          <span>Real AST Test</span>
        </div>
      );
    `;

    const result = runBabelAstAudit({
      filePath: 'src/components/Card.tsx',
      content: jsxCode,
      tokens: sampleTokens,
    });

    expect(result.success).toBe(true);
    expect(result.findings.length).toBeGreaterThanOrEqual(2);

    const colorFinding = result.findings.find((f) => f.ruleId === 'RULE-001-HARDCODED-COLOR' && f.evidence.includes('#3b82f6'));
    expect(colorFinding).toBeDefined();
    expect(colorFinding?.suggestedFix).toContain('var(--color-brand-primary)');

    const spacingFinding = result.findings.find((f) => f.ruleId === 'RULE-004-HARDCODED-SPACING');
    expect(spacingFinding).toBeDefined();
    expect(spacingFinding?.evidence).toContain("padding: '19px'");
  });

  it('Tailwind v4 exporter produces genuine @theme CSS directive syntax', () => {
    const tw4 = exportToTailwindV4(sampleTokens, { prefix: 'nexus' });
    expect(tw4.filename).toBe('tailwind.theme.css');
    expect(tw4.format).toBe('css');
    expect(tw4.content).toContain('@theme {');
    expect(tw4.content).toContain('--color-brand-primary: var(--nexus-color-brand-primary);');
    expect(tw4.content).toContain('--spacing-md: var(--nexus-spacing-md);');
  });

  it('Figma Diff engine correctly detects removed tokens upon sync', () => {
    const existingTokens: FlatToken[] = [
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
        name: 'deleted-token',
        path: 'color.brand.deleted',
        category: 'color',
        type: 'color',
        rawValue: '#ff0000',
        resolvedValue: '#ff0000',
        isAlias: false,
      },
    ];

    const incomingTokens: FlatToken[] = [
      {
        name: 'primary',
        path: 'color.brand.primary',
        category: 'color',
        type: 'color',
        rawValue: '#3b82f6',
        resolvedValue: '#3b82f6',
        isAlias: false,
      },
    ];

    const diff = computeTokenDiff(existingTokens, incomingTokens);
    const removedItem = diff.find((d) => d.status === 'removed');
    expect(removedItem).toBeDefined();
    expect(removedItem?.path).toBe('color.brand.deleted');
  });

  it('Authentication validator permits authorized keys and rejects unauthorized access', () => {
    // Local / development mode without key
    const openReq = new Request('http://localhost:3000/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const localCheck = validateApiAuth(openReq);
    expect(localCheck.authorized).toBe(true);

    // Test with explicit token header
    const tokenReq = new Request('http://localhost:3000/api/tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-valid-key-123456789012',
      },
    });
    // When process.env.NEXUS_API_KEY is set:
    process.env.NEXUS_API_KEY = 'test-valid-key-123456789012';
    resetEnvCache();
    const authCheck = validateApiAuth(tokenReq);
    expect(authCheck.authorized).toBe(true);

    const badTokenReq = new Request('http://localhost:3000/api/tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer wrong-key',
      },
    });
    const badAuthCheck = validateApiAuth(badTokenReq);
    expect(badAuthCheck.authorized).toBe(false);
    expect(badAuthCheck.errorResponse?.status).toBe(401);

    delete process.env.NEXUS_API_KEY;
    resetEnvCache();
  });
});
