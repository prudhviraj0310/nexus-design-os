import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { FlatToken } from '../tokens/types';
import { AuditFinding } from './types';

export function runBabelAstAudit(context: {
  filePath: string;
  content: string;
  tokens: FlatToken[];
}): { success: boolean; findings: AuditFinding[] } {
  const { filePath, content, tokens } = context;
  const findings: AuditFinding[] = [];

  // Build lookup maps
  const colorMap = new Map<string, string>();
  const validTokenVars = new Set<string>();
  const deprecatedMap = new Map<string, string | undefined>();

  for (const t of tokens) {
    if (t.category === 'color' && t.resolvedValue?.startsWith('#')) {
      colorMap.set(t.resolvedValue.toLowerCase(), t.path);
    }
    const varName = `--${t.path.replace(/\./g, '-')}`;
    validTokenVars.add(varName);

    if (t.isDeprecated) {
      deprecatedMap.set(varName, t.description || undefined);
    }
  }

  try {
    const isJsxOrTs =
      filePath.endsWith('.tsx') ||
      filePath.endsWith('.jsx') ||
      filePath.endsWith('.ts') ||
      filePath.endsWith('.js') ||
      content.includes('<') ||
      content.includes('import ') ||
      content.includes('export ');

    if (!isJsxOrTs) {
      return { success: false, findings: [] };
    }

    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
      errorRecovery: true,
    });

    const traverseFn = (traverse as any).default || traverse;

    traverseFn(ast, {
      // 1. Inspect JSX inline styles: style={{ color: '#ff0000', padding: '19px' }}
      JSXAttribute(path: any) {
        if (path.node.name?.name === 'style' && path.node.value?.type === 'JSXExpressionContainer') {
          const expression = path.node.value.expression;
          if (expression.type === 'ObjectExpression') {
            for (const prop of expression.properties) {
              if (prop.type === 'ObjectProperty') {
                const propKey = prop.key?.name || prop.key?.value;
                const propValueNode = prop.value;
                const loc = prop.loc?.start || path.node.loc?.start;
                const line = loc?.line || 1;
                const column = loc?.column || 1;

                if (propValueNode.type === 'StringLiteral') {
                  const val = propValueNode.value;

                  // Color check
                  const hexMatch = val.match(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/);
                  if (hexMatch) {
                    const hex = hexMatch[0].toLowerCase();
                    const matchingToken = colorMap.get(hex);
                    findings.push({
                      ruleId: 'RULE-001-HARDCODED-COLOR',
                      severity: 'warning',
                      message: `Hardcoded color "${hexMatch[0]}" detected in style prop "${propKey}". Use a design token instead.`,
                      filePath,
                      line,
                      column,
                      evidence: `${propKey}: '${val}'`,
                      suggestedFix: matchingToken
                        ? `Replace "${hexMatch[0]}" with token "var(--${matchingToken.replace(/\./g, '-')})"`
                        : `Replace "${hexMatch[0]}" with a semantic token from your design system palette`,
                      automatedFixAvailable: Boolean(matchingToken),
                    });
                  }

                  // Spacing check
                  const spacingProps = ['padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'gap'];
                  if (spacingProps.includes(propKey)) {
                    const pxMatch = val.match(/^(\d+)px$/);
                    if (pxMatch) {
                      const px = parseInt(pxMatch[1], 10);
                      if (px % 4 !== 0) {
                        findings.push({
                          ruleId: 'RULE-004-HARDCODED-SPACING',
                          severity: 'warning',
                          message: `Arbitrary non-standard spacing "${val}" detected on "${propKey}". Spacing should adhere to the 4px grid design tokens.`,
                          filePath,
                          line,
                          column,
                          evidence: `${propKey}: '${val}'`,
                          suggestedFix: `Round to nearest standard spacing step: ${Math.round(px / 4) * 4}px or use var(--spacing-*)`,
                          automatedFixAvailable: false,
                        });
                      }
                    }
                  }
                } else if (propValueNode.type === 'NumericLiteral') {
                  const spacingProps = ['padding', 'margin', 'gap'];
                  if (spacingProps.includes(propKey)) {
                    const num = propValueNode.value;
                    if (num % 4 !== 0) {
                      findings.push({
                        ruleId: 'RULE-004-HARDCODED-SPACING',
                        severity: 'warning',
                        message: `Arbitrary numeric spacing "${num}" detected on "${propKey}".`,
                        filePath,
                        line,
                        column,
                        evidence: `${propKey}: ${num}`,
                        suggestedFix: `Use standard token var(--spacing-*)`,
                        automatedFixAvailable: false,
                      });
                    }
                  }
                }
              }
            }
          }
        }
      },

      // 2. Inspect String Literals for var(--...) tokens
      StringLiteral(path: any) {
        const val = path.node.value;
        const loc = path.node.loc?.start;
        const line = loc?.line || 1;
        const column = loc?.column || 1;

        // Unknown token check
        const varMatches = val.matchAll(/var\((--[a-zA-Z0-9_-]+)\)/g);
        for (const match of varMatches) {
          const varName = match[1];
          if (!validTokenVars.has(varName)) {
            findings.push({
              ruleId: 'RULE-002-UNKNOWN-TOKEN',
              severity: 'error',
              message: `Unknown design token "${varName}" referenced. Not found in active design system registry.`,
              filePath,
              line,
              column,
              evidence: val,
              suggestedFix: `Check spelling or register "${varName}" in the Nexus Design OS token catalog`,
              automatedFixAvailable: false,
            });
          }

          if (deprecatedMap.has(varName)) {
            findings.push({
              ruleId: 'RULE-003-DEPRECATED-TOKEN',
              severity: 'warning',
              message: `Deprecated design token "${varName}" referenced.`,
              filePath,
              line,
              column,
              evidence: val,
              suggestedFix: deprecatedMap.get(varName)
                ? `Migrate: ${deprecatedMap.get(varName)}`
                : `Replace "${varName}" with active semantic replacement token`,
              automatedFixAvailable: false,
            });
          }
        }
      },
    });

    return { success: true, findings };
  } catch (err) {
    // AST parse failed on non-standard syntax; fall back to regex
    return { success: false, findings: [] };
  }
}
