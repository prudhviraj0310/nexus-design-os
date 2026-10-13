import { AuditFinding, AuditRule } from '../types.js';

export const deprecatedTokensRule: AuditRule = {
  id: 'RULE-003-DEPRECATED-TOKEN',
  name: 'Disallow Deprecated Tokens',
  description: 'Flags usage of deprecated design tokens and suggests modern alternatives.',
  defaultSeverity: 'warning',
  evaluate({ filePath, content, tokens }) {
    const findings: AuditFinding[] = [];
    const lines = content.split('\n');

    const deprecatedTokens = new Map<string, string | undefined>();
    for (const t of tokens) {
      if (t.isDeprecated) {
        const replacement = t.extensions?.['replacement'] || t.extensions?.['replacedBy'];
        deprecatedTokens.set(`--${t.path.replace(/\./g, '-')}`, replacement);
      }
    }

    const varRegex = /var\(\s*(--[a-zA-Z0-9_-]+)\s*\)/g;

    lines.forEach((lineText, index) => {
      let match: RegExpExecArray | null;
      while ((match = varRegex.exec(lineText)) !== null) {
        const varName = match[1];
        if (deprecatedTokens.has(varName)) {
          const replacement = deprecatedTokens.get(varName);
          const suggestedFix = replacement
            ? `Migrate to replacement token "${replacement}"`
            : `Token is deprecated; consult design system team for latest equivalent.`;

          findings.push({
            ruleId: 'RULE-003-DEPRECATED-TOKEN',
            severity: 'warning',
            message: `Design token "${varName}" is deprecated.`,
            filePath,
            line: index + 1,
            column: match.index + 1,
            evidence: lineText.trim(),
            suggestedFix,
            automatedFixAvailable: Boolean(replacement),
          });
        }
      }
    });

    return findings;
  },
};
