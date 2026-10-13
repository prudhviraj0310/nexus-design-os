import { FlatToken } from '../tokens/types';
import { deprecatedTokensRule } from './rules/deprecated-tokens';
import { hardcodedColorsRule } from './rules/hardcoded-colors';
import { hardcodedSpacingRule } from './rules/hardcoded-spacing';
import { unknownTokensRule } from './rules/unknown-tokens';
import { AuditFinding, AuditReport, AuditRule } from './types';

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

    for (const rule of this.rules) {
      const result = rule.evaluate(context);
      findings.push(...result);
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
              rules: this.rules.map((r) => ({
                id: r.id,
                name: r.name,
                shortDescription: { text: r.description },
                defaultConfiguration: { level: r.defaultSeverity === 'error' ? 'error' : 'warning' },
              })),
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
