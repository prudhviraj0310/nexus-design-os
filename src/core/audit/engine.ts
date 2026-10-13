import { FlatToken } from '../tokens/types';
import { deprecatedTokensRule } from './rules/deprecated-tokens';
import { hardcodedColorsRule } from './rules/hardcoded-colors';
import { hardcodedSpacingRule } from './rules/hardcoded-spacing';
import { unknownTokensRule } from './rules/unknown-tokens';
import { AuditFinding, AuditReport, AuditRule } from './types';

import { runBabelAstAudit } from './ast';

export class AuditEngine {
  private rules: AuditRule[] = [
    hardcodedColorsRule,
    unknownTokensRule,
    deprecatedTokensRule,
    hardcodedSpacingRule,
  ];

  public registerRule(rule: AuditRule): void {
    this.rules.push(rule);
  }

  public auditFile(context: {
    filePath: string;
    content: string;
    tokens: FlatToken[];
  }): AuditReport {
    const findings: AuditFinding[] = [];

    // 1. Run real Babel AST traversal for JS/TS/JSX/TSX
    const astResult = runBabelAstAudit(context);
    if (astResult.success && astResult.findings.length > 0) {
      findings.push(...astResult.findings);
    }

    // 2. Run regex/text-based rules for remaining patterns or non-JS files
    for (const rule of this.rules) {
      const result = rule.evaluate(context);
      for (const f of result) {
        // Deduplicate against AST findings on the same line and rule
        const alreadyFlagged = findings.some(
          (existing) => existing.ruleId === f.ruleId && existing.line === f.line
        );
        if (!alreadyFlagged) {
          findings.push(f);
        }
      }
    }

    const errorCount = findings.filter((f) => f.severity === 'error').length;
    const warningCount = findings.filter((f) => f.severity === 'warning').length;
    const infoCount = findings.filter((f) => f.severity === 'info').length;

    const report: AuditReport = {
      totalFindings: findings.length,
      errorCount,
      warningCount,
      infoCount,
      findings,
      timestamp: new Date().toISOString(),
      sarif: this.generateSarif(findings),
    };

    return report;
  }

  public generateSarif(findings: AuditFinding[]): Record<string, any> {
    return {
      $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
      version: '2.1.0',
      runs: [
        {
          tool: {
            driver: {
              name: 'NovaDesign Quality Intelligence',
              version: '1.0.0',
              rules: [
                ...this.rules.map((r) => ({
                  id: r.id,
                  name: r.name,
                  shortDescription: { text: r.description },
                  defaultConfiguration: { level: r.defaultSeverity === 'error' ? 'error' : 'warning' },
                })),
                {
                  id: 'RULE-005-DYNAMIC-EXPRESSION',
                  name: 'Dynamic Styling Expression',
                  shortDescription: { text: 'Flags dynamic expressions in style properties that cannot be statically evaluated at build time.' },
                  defaultConfiguration: { level: 'note' },
                },
              ],
            },
          },
          results: findings.map((f) => ({
            ruleId: f.ruleId,
            level: f.severity === 'error' ? 'error' : f.severity === 'warning' ? 'warning' : 'note',
            message: { text: f.message },
            locations: [
              {
                physicalLocation: {
                  artifactLocation: { uri: f.filePath },
                  region: {
                    startLine: f.line,
                    startColumn: f.column ?? 1,
                  },
                },
              },
            ],
          })),
        },
      ],
    };
  }
}
