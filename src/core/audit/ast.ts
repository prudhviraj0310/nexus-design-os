import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { FlatToken } from '../tokens/types';
import { AuditFinding } from './types';

const SPACING_PROPS = new Set([
  'padding',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingInline',
  'paddingBlock',
  'margin',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginInline',
  'marginBlock',
  'gap',
  'rowGap',
  'columnGap',
]);

const COLOR_PROPS = new Set([
  'color',
  'backgroundColor',
  'borderColor',
  'borderTopColor',
  'borderBottomColor',
  'borderLeftColor',
  'borderRightColor',
  'outlineColor',
  'fill',
  'stroke',
]);

const ALL_STYLE_PROPS = new Set([
  ...SPACING_PROPS,
  ...COLOR_PROPS,
  'borderRadius',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'boxShadow',
  'zIndex',
  'opacity',
  'width',
  'height',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'display',
  'flexDirection',
]);

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
    if (t.category === 'color' && typeof t.resolvedValue === 'string' && t.resolvedValue.startsWith('#')) {
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
      content.includes('export ') ||
      content.includes('const ') ||
      content.includes('let ') ||
      content.includes('var ');

    if (!isJsxOrTs) {
      return { success: false, findings: [] };
    }

    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
      errorRecovery: true,
    });

    const traverseFn = (traverse as any).default || traverse;
    const inspectedObjectNodes = new Set<any>();

    function inspectObjectProperty(prop: any, contextLabel: string) {
      if (prop.type !== 'ObjectProperty') return;

      const propKey = prop.key?.name || prop.key?.value;
      const propValueNode = prop.value;
      const loc = prop.loc?.start;
      const line = loc?.line || 1;
      const column = (loc?.column !== undefined ? loc.column + 1 : 1);

      // 1. Literal values (StringLiteral / NumericLiteral)
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
            message: `Hardcoded color "${hexMatch[0]}" detected in ${contextLabel} prop "${propKey}". Use a design token instead.`,
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
        if (SPACING_PROPS.has(propKey)) {
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
        if (SPACING_PROPS.has(propKey)) {
          const num = propValueNode.value;
          if (num % 4 !== 0) {
            findings.push({
              ruleId: 'RULE-004-HARDCODED-SPACING',
              severity: 'warning',
              message: `Arbitrary numeric spacing "${num}" detected on "${propKey}". Spacing should adhere to the 4px grid design tokens.`,
              filePath,
              line,
              column,
              evidence: `${propKey}: ${num}`,
              suggestedFix: `Round to nearest standard spacing step: ${Math.round(num / 4) * 4}px or use var(--spacing-*)`,
              automatedFixAvailable: false,
            });
          }
        }
      } else if (
        propValueNode.type === 'BinaryExpression' ||
        propValueNode.type === 'Identifier' ||
        propValueNode.type === 'CallExpression' ||
        propValueNode.type === 'MemberExpression'
      ) {
        // Dynamic expression in style property that cannot be statically evaluated
        if (SPACING_PROPS.has(propKey) || COLOR_PROPS.has(propKey)) {
          findings.push({
            ruleId: 'RULE-005-DYNAMIC-EXPRESSION',
            severity: 'info',
            message: `Dynamic expression detected in ${contextLabel} prop "${propKey}". Value cannot be statically evaluated against design tokens at build time.`,
            filePath,
            line,
            column,
            evidence: `${propKey}: <dynamic expression>`,
            suggestedFix: `Extract dynamic styling to theme variant classes or standard design token utilities`,
            automatedFixAvailable: false,
          });
        }
      }
    }

    traverseFn(ast, {
      // 1. Inspect JSX inline styles: style={{ color: '#ff0000', padding: '19px' }}
      JSXAttribute(path: any) {
        const attrName = path.node.name?.name;

        if (attrName === 'style' && path.node.value?.type === 'JSXExpressionContainer') {
          const expression = path.node.value.expression;
          if (expression.type === 'ObjectExpression') {
            inspectedObjectNodes.add(expression);
            for (const prop of expression.properties) {
              inspectObjectProperty(prop, 'style prop');
            }
          }
        }

        // 2. Inspect JSX className strings: className="p-[19px] m-[17px] text-[#ff0000]"
        if (attrName === 'className') {
          let classString = '';
          const loc = path.node.loc?.start;
          const line = loc?.line || 1;
          const column = (loc?.column !== undefined ? loc.column + 1 : 1);

          if (path.node.value?.type === 'StringLiteral') {
            classString = path.node.value.value;
          } else if (
            path.node.value?.type === 'JSXExpressionContainer' &&
            path.node.value.expression.type === 'StringLiteral'
          ) {
            classString = path.node.value.expression.value;
          } else if (
            path.node.value?.type === 'JSXExpressionContainer' &&
            path.node.value.expression.type === 'TemplateLiteral'
          ) {
            classString = path.node.value.expression.quasis.map((q: any) => q.value.raw).join(' ');
          }

          if (classString) {
            // Check arbitrary Tailwind spacing: p-[19px], m-[17px], gap-[21px], etc.
            const twSpacingRegex = /\b(?:p|m|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr|gap|w|h)-\[(\d+)px\]/g;
            let spMatch: RegExpExecArray | null;
            while ((spMatch = twSpacingRegex.exec(classString)) !== null) {
              const px = parseInt(spMatch[1], 10);
              if (px % 4 !== 0) {
                findings.push({
                  ruleId: 'RULE-004-HARDCODED-SPACING',
                  severity: 'warning',
                  message: `Arbitrary Tailwind spacing "${spMatch[0]}" detected in className. Spacing should adhere to the 4px grid design tokens.`,
                  filePath,
                  line,
                  column: column + spMatch.index,
                  evidence: spMatch[0],
                  suggestedFix: `Round to nearest standard spacing: ${Math.round(px / 4) * 4}px or use standard Tailwind class`,
                  automatedFixAvailable: false,
                });
              }
            }

            // Check arbitrary Tailwind colors: text-[#ff0000], bg-[#3b82f6], border-[#abc], etc.
            const twColorRegex = /\b(?:text|bg|border|fill|stroke|ring|accent)-\[(#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8}))\]/g;
            let colMatch: RegExpExecArray | null;
            while ((colMatch = twColorRegex.exec(classString)) !== null) {
              const hex = colMatch[1].toLowerCase();
              const matchingToken = colorMap.get(hex);
              findings.push({
                ruleId: 'RULE-001-HARDCODED-COLOR',
                severity: 'warning',
                message: `Arbitrary hardcoded color "${colMatch[0]}" detected in className. Use a design token instead.`,
                filePath,
                line,
                column: column + colMatch.index,
                evidence: colMatch[0],
                suggestedFix: matchingToken
                  ? `Replace "${colMatch[0]}" with design token "var(--${matchingToken.replace(/\./g, '-')})"`
                  : `Use a semantic token class from your Tailwind design system configuration`,
                automatedFixAvailable: Boolean(matchingToken),
              });
            }
          }
        }
      },

      // 3. Inspect standalone style objects outside JSX: const styles = { padding: "19px", color: "#ff0000" }
      ObjectExpression(path: any) {
        if (inspectedObjectNodes.has(path.node)) return;

        // Determine if this object represents styles
        let isStyleObject = false;

        // Check if assigned to variable containing 'style', 'styles', or 'theme'
        if (path.parent?.type === 'VariableDeclarator') {
          const idName = path.parent.id?.name?.toLowerCase() || '';
          if (idName.includes('style') || idName.includes('theme')) {
            isStyleObject = true;
          }
        }

        // Or check if any of the properties match known CSS style properties
        if (!isStyleObject && Array.isArray(path.node.properties)) {
          for (const prop of path.node.properties) {
            if (prop.type === 'ObjectProperty') {
              const key = prop.key?.name || prop.key?.value;
              if (ALL_STYLE_PROPS.has(key)) {
                isStyleObject = true;
                break;
              }
            }
          }
        }

        if (isStyleObject) {
          inspectedObjectNodes.add(path.node);
          for (const prop of path.node.properties) {
            inspectObjectProperty(prop, 'style object');
          }
        }
      },

      // 4. Inspect String Literals and Template Elements for var(--...) tokens
      StringLiteral(path: any) {
        const val = path.node.value;
        const loc = path.node.loc?.start;
        const line = loc?.line || 1;
        const column = (loc?.column !== undefined ? loc.column + 1 : 1);

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
    // Malformed input or unrecoverable syntax: return gracefully without crashing
    return { success: false, findings: [] };
  }
}
