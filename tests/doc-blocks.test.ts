import { describe, it, expect } from 'vitest';
import {
  markdownToBlocks,
  blocksToMarkdown,
  validateDocBlocks,
  renderDocBlocksToHtml,
} from '../src/core/docs/blocks';
import { DocBlock } from '../src/core/docs/types';

describe('Tier 2: Structured Documentation Blocks & JSON AST', () => {
  it('parses complex markdown into structured block AST', () => {
    const markdown = `# Design Foundations
This is an introductory guide to the design system.

> [!NOTE] Design System Sync
> All tokens are synchronized automatically via CI/CD.

\`\`\`css:tokens.css
:root {
  --nexus-color-primary: #3b82f6;
}
\`\`\`

| Token | Value | Type |
| --- | --- | --- |
| color.primary | #3b82f6 | color |
| spacing.sm | 8px | dimension |

---

::token-list{category="color"}
`;

    const blocks = markdownToBlocks(markdown);

    expect(blocks.length).toBeGreaterThanOrEqual(6);

    const heading = blocks.find((b) => b.type === 'heading');
    expect(heading).toBeDefined();
    expect((heading as any).text).toBe('Design Foundations');
    expect((heading as any).level).toBe(1);

    const callout = blocks.find((b) => b.type === 'callout');
    expect(callout).toBeDefined();
    expect((callout as any).calloutType).toBe('info');
    expect((callout as any).title).toBe('Design System Sync');
    expect((callout as any).text).toContain('synchronized automatically');

    const code = blocks.find((b) => b.type === 'code');
    expect(code).toBeDefined();
    expect((code as any).language).toBe('css');
    expect((code as any).title).toBe('tokens.css');
    expect((code as any).code).toContain('--nexus-color-primary');

    const table = blocks.find((b) => b.type === 'table');
    expect(table).toBeDefined();
    expect((table as any).headers).toEqual(['Token', 'Value', 'Type']);
    expect((table as any).rows).toHaveLength(2);

    const divider = blocks.find((b) => b.type === 'divider');
    expect(divider).toBeDefined();

    const tokenList = blocks.find((b) => b.type === 'token_list');
    expect(tokenList).toBeDefined();
    expect((tokenList as any).category).toBe('color');
  });

  it('validates block AST structure and identifies violations', () => {
    const validBlocks: DocBlock[] = [
      { id: 'h1', type: 'heading', level: 2, text: 'Typography' },
      { id: 'p1', type: 'paragraph', text: 'Font families and scale.' },
    ];
    const validRes = validateDocBlocks(validBlocks);
    expect(validRes.valid).toBe(true);

    const invalidBlocks: any[] = [
      { type: 'heading', level: 9, text: '' }, // missing id, invalid level, empty text
      { id: 'c1', type: 'callout', calloutType: 'unknown_type' },
    ];
    const invalidRes = validateDocBlocks(invalidBlocks);
    expect(invalidRes.valid).toBe(false);
    expect(invalidRes.errors.length).toBeGreaterThanOrEqual(3);
  });

  it('serializes block AST back into clean readable Markdown', () => {
    const blocks: DocBlock[] = [
      { id: '1', type: 'heading', level: 2, text: 'Colors & Gradients' },
      { id: '2', type: 'paragraph', text: 'Primary semantic color tokens.' },
      { id: '3', type: 'callout', calloutType: 'warning', title: 'Deprecated', text: 'Use color.brand.primary instead.' },
      { id: '4', type: 'token_chip', tokenPath: 'color.brand.primary' },
    ];

    const md = blocksToMarkdown(blocks);
    expect(md).toContain('## Colors & Gradients');
    expect(md).toContain('Primary semantic color tokens.');
    expect(md).toContain('> [!WARNING] Deprecated');
    expect(md).toContain('`$color.brand.primary`');
  });

  it('renders rich HTML with live token swatches and callouts', () => {
    const blocks: DocBlock[] = [
      { id: '1', type: 'heading', level: 1, text: 'Token Showcase' },
      { id: '2', type: 'token_chip', tokenPath: 'color.primary' },
      { id: '3', type: 'token_list', category: 'color' },
    ];

    const context = {
      tokens: [
        { path: 'color.primary', resolvedValue: '#3b82f6', type: 'color' },
        { path: 'color.secondary', resolvedValue: '#10b981', type: 'color' },
      ],
    };

    const html = renderDocBlocksToHtml(blocks, context);

    expect(html).toContain('<h1 class="doc-heading doc-h1">Token Showcase</h1>');
    expect(html).toContain('class="doc-token-chip"');
    expect(html).toContain('background:#3b82f6;');
    expect(html).toContain('class="doc-token-list"');
  });
});
