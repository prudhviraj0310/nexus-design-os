import {
  DocBlock,
  DocRenderContext,
  HeadingDocBlock,
  ParagraphDocBlock,
  CodeDocBlock,
  CalloutDocBlock,
  TokenListDocBlock,
  TokenChipDocBlock,
  FigmaEmbedDocBlock,
  ComponentPreviewDocBlock,
  ComponentHealthMatrixDocBlock,
  AssetGridDocBlock,
  TableDocBlock,
  DividerDocBlock,
  TabsDocBlock,
} from './types';

/**
 * Validates a list of documentation blocks.
 */
export function validateDocBlocks(blocks: DocBlock[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(blocks)) {
    return { valid: false, errors: ['Blocks must be an array.'] };
  }

  blocks.forEach((block, idx) => {
    if (!block.id) {
      errors.push(`Block at index ${idx} is missing a unique 'id'.`);
    }

    switch (block.type) {
      case 'heading':
        if (!block.text || typeof block.text !== 'string') {
          errors.push(`Heading block ${block.id || idx} requires non-empty 'text'.`);
        }
        if (![1, 2, 3, 4, 5, 6].includes(block.level)) {
          errors.push(`Heading block ${block.id || idx} level must be between 1 and 6.`);
        }
        break;

      case 'paragraph':
        if (typeof block.text !== 'string') {
          errors.push(`Paragraph block ${block.id || idx} requires a 'text' string.`);
        }
        break;

      case 'code':
        if (typeof block.code !== 'string') {
          errors.push(`Code block ${block.id || idx} requires a 'code' string.`);
        }
        break;

      case 'callout':
        if (!['info', 'warning', 'success', 'error'].includes(block.calloutType)) {
          errors.push(`Callout block ${block.id || idx} has invalid calloutType "${block.calloutType}".`);
        }
        break;

      case 'token_chip':
        if (!block.tokenPath) {
          errors.push(`TokenChip block ${block.id || idx} requires 'tokenPath'.`);
        }
        break;

      case 'figma_embed':
        if (!block.url) {
          errors.push(`FigmaEmbed block ${block.id || idx} requires a valid 'url'.`);
        }
        break;

      case 'table':
        if (!Array.isArray(block.headers) || !Array.isArray(block.rows)) {
          errors.push(`Table block ${block.id || idx} requires 'headers' and 'rows' arrays.`);
        }
        break;

      case 'tabs':
        if (!Array.isArray(block.tabs) || block.tabs.length === 0) {
          errors.push(`Tabs block ${block.id || idx} requires a non-empty 'tabs' array.`);
        } else {
          for (const tab of block.tabs) {
            if (!tab.title) errors.push(`Tabs block ${block.id || idx} has a tab without a title.`);
            const childValidation = validateDocBlocks(tab.blocks || []);
            if (!childValidation.valid) {
              errors.push(...childValidation.errors);
            }
          }
        }
        break;
    }
  });

  return { valid: errors.length === 0, errors };
}

/**
 * Converts markdown text into structured documentation blocks AST.
 */
export function markdownToBlocks(markdown: string): DocBlock[] {
  if (!markdown || markdown.trim() === '') return [];

  const lines = markdown.split(/\r?\n/);
  const blocks: DocBlock[] = [];
  let currentParagraphLines: string[] = [];
  let inCodeBlock = false;
  let codeLang = '';
  let codeLines: string[] = [];
  let codeTitle = '';
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      const text = currentParagraphLines.join('\n').trim();
      if (text) {
        // Check for special embedded directives like ::token[path] or ::token-list
        if (text.startsWith('::token-list')) {
          const catMatch = text.match(/category=["']?([a-zA-Z0-9_.-]+)["']?/);
          const groupMatch = text.match(/group=["']?([a-zA-Z0-9_./-]+)["']?/);
          blocks.push({
            id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            type: 'token_list',
            category: catMatch ? catMatch[1] : undefined,
            groupPath: groupMatch ? groupMatch[1] : undefined,
            showValues: true,
          });
        } else if (text.startsWith('::figma')) {
          const urlMatch = text.match(/url=["']?([^"'\s]+)["']?/);
          blocks.push({
            id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            type: 'figma_embed',
            url: urlMatch ? urlMatch[1] : '',
          });
        } else {
          blocks.push({
            id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            type: 'paragraph',
            text,
          });
        }
      }
      currentParagraphLines = [];
    }
  };

  const flushTable = () => {
    if (inTable && tableHeaders.length > 0) {
      blocks.push({
        id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type: 'table',
        headers: tableHeaders,
        rows: tableRows,
      });
      inTable = false;
      tableHeaders = [];
      tableRows = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Code blocks fence
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        flushParagraph();
        flushTable();
        inCodeBlock = true;
        const tag = line.trim().slice(3).trim();
        const parts = tag.split(':');
        codeLang = parts[0] || 'text';
        codeTitle = parts[1] || '';
        codeLines = [];
      } else {
        inCodeBlock = false;
        blocks.push({
          id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          type: 'code',
          language: codeLang,
          code: codeLines.join('\n'),
          title: codeTitle || undefined,
        });
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // 2. Horizontal divider
    if (/^(---|___|\*\*\*)$/.test(line.trim())) {
      flushParagraph();
      flushTable();
      blocks.push({
        id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type: 'divider',
      });
      continue;
    }

    // 3. Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushTable();
      blocks.push({
        id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type: 'heading',
        level: headingMatch[1].length as any,
        text: headingMatch[2].trim(),
      });
      continue;
    }

    // 4. Callout / Alert (> [!NOTE] or > [!WARNING])
    const calloutMatch = line.match(/^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)$/i);
    if (calloutMatch) {
      flushParagraph();
      flushTable();
      const rawType = calloutMatch[1].toUpperCase();
      let calloutType: 'info' | 'warning' | 'success' | 'error' = 'info';
      if (rawType === 'WARNING' || rawType === 'CAUTION') calloutType = 'warning';
      else if (rawType === 'TIP') calloutType = 'success';

      const title = calloutMatch[2].trim() || rawType;
      // Slurp remaining lines in blockquote
      const contentLines: string[] = [];
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith('>')) {
        i++;
        contentLines.push(lines[i].replace(/^>\s?/, ''));
      }

      blocks.push({
        id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type: 'callout',
        calloutType,
        title,
        text: contentLines.join('\n').trim(),
      });
      continue;
    }

    // 5. Tables
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      flushParagraph();
      const cells = line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());

      // If next line is separator, this is header
      if (!inTable) {
        if (i + 1 < lines.length && /^\|\s*[-:]+/.test(lines[i + 1].trim())) {
          inTable = true;
          tableHeaders = cells;
          i++; // skip separator
          tableRows = [];
          continue;
        }
      } else {
        tableRows.push(cells);
        continue;
      }
    } else if (inTable) {
      flushTable();
    }

    // 6. Blank line flushes paragraph
    if (line.trim() === '') {
      flushParagraph();
      flushTable();
      continue;
    }

    // 7. Regular paragraph line
    currentParagraphLines.push(line);
  }

  flushParagraph();
  flushTable();

  return blocks;
}

/**
 * Converts structured documentation blocks back to markdown.
 */
export function blocksToMarkdown(blocks: DocBlock[]): string {
  if (!Array.isArray(blocks) || blocks.length === 0) return '';

  const chunks: string[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case 'heading': {
        const hashes = '#'.repeat(block.level);
        chunks.push(`${hashes} ${block.text}`);
        break;
      }

      case 'paragraph': {
        chunks.push(block.text);
        break;
      }

      case 'code': {
        const header = block.title ? `${block.language}:${block.title}` : block.language;
        chunks.push(`\`\`\`${header}\n${block.code}\n\`\`\``);
        break;
      }

      case 'callout': {
        const tag = block.calloutType === 'warning' ? 'WARNING' : block.calloutType === 'success' ? 'TIP' : 'NOTE';
        const titlePart = block.title ? ` ${block.title}` : '';
        const bodyLines = block.text.split('\n').map((l) => `> ${l}`).join('\n');
        chunks.push(`> [!${tag}]${titlePart}\n${bodyLines}`);
        break;
      }

      case 'token_list': {
        const cat = block.category ? ` category="${block.category}"` : '';
        const grp = block.groupPath ? ` group="${block.groupPath}"` : '';
        chunks.push(`::token-list{${cat}${grp}}`);
        break;
      }

      case 'token_chip': {
        chunks.push(`\`$${block.tokenPath}\``);
        break;
      }

      case 'figma_embed': {
        chunks.push(`::figma{url="${block.url}"}`);
        break;
      }

      case 'table': {
        const headerLine = `| ${block.headers.join(' | ')} |`;
        const sepLine = `| ${block.headers.map(() => '---').join(' | ')} |`;
        const rowLines = block.rows.map((r) => `| ${r.join(' | ')} |`);
        chunks.push([headerLine, sepLine, ...rowLines].join('\n'));
        break;
      }

      case 'divider': {
        chunks.push('---');
        break;
      }

      case 'tabs': {
        const tabTexts: string[] = [];
        for (const tab of block.tabs) {
          tabTexts.push(`### Tab: ${tab.title}\n\n${blocksToMarkdown(tab.blocks)}`);
        }
        chunks.push(tabTexts.join('\n\n'));
        break;
      }

      default:
        break;
    }
  }

  return chunks.join('\n\n');
}

/**
 * Renders structured documentation blocks to HTML for living documentation portals.
 */
export function renderDocBlocksToHtml(blocks: DocBlock[], context?: DocRenderContext): string {
  if (!Array.isArray(blocks) || blocks.length === 0) return '';

  const tokenMap = new Map<string, any>(
    (context?.tokens || []).map((t) => [t.path, t])
  );

  const htmlParts: string[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case 'heading': {
        htmlParts.push(`<h${block.level} class="doc-heading doc-h${block.level}">${escapeHtml(block.text)}</h${block.level}>`);
        break;
      }

      case 'paragraph': {
        htmlParts.push(`<p class="doc-paragraph">${escapeHtml(block.text)}</p>`);
        break;
      }

      case 'code': {
        const titleHtml = block.title ? `<div class="doc-code-title">${escapeHtml(block.title)}</div>` : '';
        htmlParts.push(
          `<div class="doc-code-block">${titleHtml}<pre><code class="language-${block.language}">${escapeHtml(block.code)}</code></pre></div>`
        );
        break;
      }

      case 'callout': {
        const titleHtml = block.title ? `<strong class="doc-callout-title">${escapeHtml(block.title)}</strong>` : '';
        htmlParts.push(
          `<div class="doc-callout doc-callout-${block.calloutType}">${titleHtml}<p>${escapeHtml(block.text)}</p></div>`
        );
        break;
      }

      case 'token_chip': {
        const tok = tokenMap.get(block.tokenPath);
        const swatch = tok ? `<span class="doc-token-swatch" style="background:${tok.resolvedValue};"></span>` : '';
        const val = tok ? `<span class="doc-token-val">${escapeHtml(tok.resolvedValue)}</span>` : '';
        htmlParts.push(
          `<span class="doc-token-chip">${swatch}<code class="doc-token-name">${escapeHtml(block.tokenPath)}</code>${val}</span>`
        );
        break;
      }

      case 'token_list': {
        const matchingTokens = (context?.tokens || []).filter(
          (t) => (!block.category || t.type === block.category)
        );
        const listItems = matchingTokens
          .map(
            (t) =>
              `<div class="doc-token-list-item"><span class="doc-token-swatch" style="background:${t.resolvedValue};"></span><code>${escapeHtml(t.path)}</code><span>${escapeHtml(t.resolvedValue)}</span></div>`
          )
          .join('');
        htmlParts.push(`<div class="doc-token-list">${listItems}</div>`);
        break;
      }

      case 'figma_embed': {
        htmlParts.push(
          `<div class="doc-figma-embed"><iframe src="${escapeHtml(block.url)}" width="100%" height="${block.height || 450}" allowfullscreen></iframe></div>`
        );
        break;
      }

      case 'table': {
        const ths = block.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('');
        const trs = block.rows
          .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`)
          .join('');
        htmlParts.push(`<table class="doc-table"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`);
        break;
      }

      case 'divider': {
        htmlParts.push('<hr class="doc-divider" />');
        break;
      }

      case 'tabs': {
        const tabButtons = block.tabs.map((t, idx) => `<button class="doc-tab-btn ${idx === 0 ? 'active' : ''}">${escapeHtml(t.title)}</button>`).join('');
        const tabPanels = block.tabs.map((t, idx) => `<div class="doc-tab-panel ${idx === 0 ? 'active' : ''}">${renderDocBlocksToHtml(t.blocks, context)}</div>`).join('');
        htmlParts.push(`<div class="doc-tabs"><div class="doc-tab-bar">${tabButtons}</div><div class="doc-tab-content">${tabPanels}</div></div>`);
        break;
      }

      default:
        break;
    }
  }

  return htmlParts.join('\n');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
