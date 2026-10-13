import { getDb } from './index';
import { workspaces, projects, designSystems, tokens, components, releases, assets, docPages } from './schema';
import { parseDTCGTree } from '../core/tokens/parser';
import { resolveTokenAliases } from '../core/tokens/resolver';

export async function seedDatabase(customDb?: any) {
  const { db } = customDb ? customDb : await getDb();

  const workspaceId = 'ws-acme-corp';
  const projectId = 'proj-core-web';
  const designSystemId = 'ds-nova-design';

  // 1. Create Workspace
  await db.insert(workspaces).values({
    id: workspaceId,
    name: 'Acme Corporation',
    slug: 'acme-corp',
  }).onConflictDoNothing();

  // 2. Create Project
  await db.insert(projects).values({
    id: projectId,
    workspaceId,
    name: 'Core Web Platform',
    slug: 'core-web',
  }).onConflictDoNothing();

  // 3. Create Design System
  await db.insert(designSystems).values({
    id: designSystemId,
    projectId,
    name: 'Nova Design System',
    version: '1.2.0',
    description: 'Production design system for Acme web and mobile applications',
  }).onConflictDoNothing();

  // 4. Sample W3C DTCG Token Tree
  const tokenTree = {
    color: {
      primitive: {
        blue: {
          500: { $value: '#3b82f6', $type: 'color', $description: 'Base blue 500' },
          600: { $value: '#2563eb', $type: 'color', $description: 'Hover blue 600' },
        },
        slate: {
          900: { $value: '#0f172a', $type: 'color', $description: 'Deep text slate' },
          100: { $value: '#f1f5f9', $type: 'color', $description: 'Light gray background' },
        },
      },
      brand: {
        primary: {
          $value: '{color.primitive.blue.500}',
          $type: 'color',
          $description: 'Brand primary action color',
        },
        primaryHover: {
          $value: '{color.primitive.blue.600}',
          $type: 'color',
          $description: 'Brand primary hover state',
        },
      },
      text: {
        primary: {
          $value: '{color.primitive.slate.900}',
          $type: 'color',
          $description: 'Main body copy color',
        },
      },
      legacy: {
        accent: {
          $value: '#ff007f',
          $type: 'color',
          $description: 'Legacy magenta accent (deprecated)',
          $extensions: {
            deprecated: true,
            replacement: 'color.brand.primary',
          },
        },
      },
    },
    spacing: {
      xs: { $value: '4px', $type: 'dimension', $description: 'Extra small spacing' },
      sm: { $value: '8px', $type: 'dimension', $description: 'Small spacing' },
      md: { $value: '16px', $type: 'dimension', $description: 'Medium default spacing' },
      lg: { $value: '24px', $type: 'dimension', $description: 'Large spacing' },
      xl: { $value: '32px', $type: 'dimension', $description: 'Extra large spacing' },
    },
    borderRadius: {
      sm: { $value: '4px', $type: 'borderRadius', $description: 'Small rounded corners' },
      md: { $value: '8px', $type: 'borderRadius', $description: 'Medium rounded corners' },
      full: { $value: '9999px', $type: 'borderRadius', $description: 'Pill / full rounded radius' },
    },
    typography: {
      fontFamily: {
        sans: { $value: 'Inter, system-ui, sans-serif', $type: 'fontFamily' },
      },
      fontSize: {
        base: { $value: '16px', $type: 'fontSize' },
        lg: { $value: '18px', $type: 'fontSize' },
      },
    },
  };

  const parsed = parseDTCGTree(tokenTree);
  const resolved = resolveTokenAliases(parsed);

  for (const token of resolved.tokens) {
    const tokenId = `tok-${token.path.replace(/\./g, '-')}`;
    await db.insert(tokens).values({
      id: tokenId,
      designSystemId,
      name: token.name,
      path: token.path,
      category: token.category,
      type: token.type,
      rawValue: token.rawValue,
      resolvedValue: token.resolvedValue,
      isAlias: token.isAlias,
      aliasTarget: token.aliasTarget || null,
      isDeprecated: Boolean(token.isDeprecated),
      description: token.description || null,
      extensions: token.extensions || null,
    }).onConflictDoNothing();
  }

  // 5. Register Sample Components
  await db.insert(components).values({
    id: 'comp-button',
    designSystemId,
    name: 'Button',
    category: 'inputs',
    framework: 'react',
    description: 'Interactive button component supporting primary, secondary, and ghost variants.',
    props: [
      { name: 'variant', type: "'primary' | 'secondary' | 'ghost'", required: false, defaultValue: 'primary' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", required: false, defaultValue: 'md' },
      { name: 'children', type: 'ReactNode', required: true },
    ],
    variants: [
      { name: 'variant', values: ['primary', 'secondary', 'ghost'] },
      { name: 'size', values: ['sm', 'md', 'lg'] },
    ],
    codeSnippet: '<Button variant="primary" size="md">Click Me</Button>',
    tokenDependencies: ['color.brand.primary', 'spacing.md', 'borderRadius.md'],
    isDeprecated: false,
  }).onConflictDoNothing();

  await db.insert(components).values({
    id: 'comp-badge',
    designSystemId,
    name: 'Badge',
    category: 'feedback',
    framework: 'react',
    description: 'Compact status badge indicator.',
    props: [
      { name: 'children', type: 'ReactNode', required: true },
      { name: 'tone', type: "'neutral' | 'success' | 'critical'", required: false },
    ],
    tokenDependencies: ['spacing.xs', 'borderRadius.full'],
    isDeprecated: false,
  }).onConflictDoNothing();

  await db.insert(components).values({
    id: 'comp-input',
    designSystemId,
    name: 'TextInput',
    category: 'inputs',
    framework: 'react',
    description: 'Accessible form input field with error and focus states.',
    props: [
      { name: 'placeholder', type: 'string', required: false },
      { name: 'disabled', type: 'boolean', required: false },
      { name: 'error', type: 'string', required: false },
    ],
    variants: [
      { name: 'state', values: ['default', 'focus', 'error', 'disabled'] },
    ],
    codeSnippet: '<TextInput placeholder="Enter email address..." />',
    tokenDependencies: ['color.primitive.slate.900', 'spacing.sm', 'borderRadius.md'],
    isDeprecated: false,
  }).onConflictDoNothing();

  await db.insert(components).values({
    id: 'comp-card',
    designSystemId,
    name: 'Card',
    category: 'layout',
    framework: 'react',
    description: 'Structured container card supporting elevated and outlined styles.',
    props: [
      { name: 'variant', type: "'elevated' | 'outlined' | 'ghost'", required: false },
      { name: 'padding', type: "'sm' | 'md' | 'lg'", required: false },
      { name: 'children', type: 'ReactNode', required: true },
    ],
    variants: [
      { name: 'variant', values: ['elevated', 'outlined', 'ghost'] },
      { name: 'padding', values: ['sm', 'md', 'lg'] },
    ],
    codeSnippet: '<Card variant="elevated" padding="md"><h3>Title</h3></Card>',
    tokenDependencies: ['color.primitive.slate.100', 'spacing.md', 'borderRadius.md'],
    isDeprecated: false,
  }).onConflictDoNothing();

  // 6. Register Design System Releases
  await db.insert(releases).values({
    id: 'rel-1-0-0',
    designSystemId,
    version: '1.0.0',
    title: 'Initial Token Foundation Release',
    description: 'W3C DTCG core token specification, primitives, and base web CSS exporter.',
    tokensCount: 16,
    componentsCount: 1,
    changelog: '• Initial release of primitive and semantic blue palettes\n• W3C DTCG JSON format export\n• Button component specs',
  }).onConflictDoNothing();

  await db.insert(releases).values({
    id: 'rel-1-2-0',
    designSystemId,
    version: '1.2.0',
    title: 'Mobile Exporters & Dark Mode Support',
    description: 'Added Swift/SwiftUI and Kotlin/Jetpack Compose code exporters, plus dark theme overrides.',
    tokensCount: 20,
    componentsCount: 4,
    changelog: '• Added iOS Swift Color and CGFloat exporters\n• Added Android Jetpack Compose Color and Dp exporters\n• Added dark theme mode overrides\n• Added TextInput, Badge, and Card components',
  }).onConflictDoNothing();

  await db.insert(releases).values({
    id: 'rel-1-3-0',
    designSystemId,
    version: '1.3.0',
    title: 'Supernova Parity: Idempotent Delivery, Living Docs & Asset Pipelines',
    description: 'Zero-diff PR reuse, searchable living docs portal, vector icon assets, and live MCP grounding.',
    tokensCount: 24,
    componentsCount: 6,
    changelog: '• Idempotent GitHub PR delivery engine with PR reuse\n• Model Context Protocol (MCP) server for Cursor & Claude Code\n• Vector Asset Icon Library & SVG export pipeline\n• Living Documentation Portal with multi-framework code snippets',
  }).onConflictDoNothing();

  // Additional Components
  await db.insert(components).values({
    id: 'comp-modal',
    designSystemId,
    name: 'Modal',
    category: 'overlay',
    framework: 'react',
    description: 'Accessible overlay dialog with focus lock, backdrop blur, and escape key handling.',
    props: [
      { name: 'isOpen', type: 'boolean', required: true },
      { name: 'onClose', type: '() => void', required: true },
      { name: 'title', type: 'string', required: false, defaultValue: 'Dialog' },
      { name: 'children', type: 'ReactNode', required: true },
    ],
    variants: [
      { name: 'size', values: ['sm', 'md', 'lg'] },
    ],
    codeSnippet: '<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Confirm Release">Modal Body</Modal>',
    tokenDependencies: ['color.primitive.slate.900', 'spacing.lg', 'borderRadius.lg'],
    isDeprecated: false,
  }).onConflictDoNothing();

  await db.insert(components).values({
    id: 'comp-switch',
    designSystemId,
    name: 'Switch',
    category: 'inputs',
    framework: 'react',
    description: 'Interactive toggle switch with accessible checked state and micro-animation.',
    props: [
      { name: 'checked', type: 'boolean', required: true },
      { name: 'onChange', type: '(checked: boolean) => void', required: true },
      { name: 'disabled', type: 'boolean', required: false },
    ],
    codeSnippet: '<Switch checked={enabled} onChange={setEnabled} />',
    tokenDependencies: ['color.brand.primary', 'spacing.xs', 'borderRadius.full'],
    isDeprecated: false,
  }).onConflictDoNothing();

  // 7. Register Vector Assets (SVG Icons)
  const iconsData = [
    { id: 'ast-arrow-right', name: 'ArrowRight', tags: ['navigation', 'arrow', 'next'], svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>' },
    { id: 'ast-arrow-left', name: 'ArrowLeft', tags: ['navigation', 'arrow', 'back'], svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>' },
    { id: 'ast-check', name: 'Check', tags: ['action', 'confirm', 'success'], svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' },
    { id: 'ast-copy', name: 'Copy', tags: ['clipboard', 'action'], svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>' },
    { id: 'ast-search', name: 'Search', tags: ['find', 'filter'], svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>' },
    { id: 'ast-sparkles', name: 'Sparkles', tags: ['ai', 'magic', 'feature'], svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>' },
    { id: 'ast-shield-check', name: 'ShieldCheck', tags: ['security', 'verified', 'auth'], svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>' },
    { id: 'ast-terminal', name: 'Terminal', tags: ['developer', 'code', 'cli'], svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>' },
    { id: 'ast-layers', name: 'Layers', tags: ['tokens', 'design-system', 'stack'], svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 12.5-9.17 4.16a2 2 0 0 1-1.66 0L2 12.5"/><path d="m22 17.5-9.17 4.16a2 2 0 0 1-1.66 0L2 17.5"/></svg>' },
    { id: 'ast-git-pr', name: 'GitPullRequest', tags: ['git', 'delivery', 'vcs'], svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" x2="6" y1="9" y2="21"/></svg>' },
    { id: 'ast-refresh-cw', name: 'RefreshCw', tags: ['sync', 'reload', 'automation'], svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>' },
    { id: 'ast-external-link', name: 'ExternalLink', tags: ['navigation', 'link', 'out'], svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="m10 14 11-11"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>' },
  ];

  for (const item of iconsData) {
    await db.insert(assets).values({
      id: item.id,
      designSystemId,
      name: item.name,
      category: 'icons',
      svgContent: item.svg,
      tags: item.tags,
      width: 24,
      height: 24,
    }).onConflictDoNothing();
  }

  // 8. Register Documentation Pages
  const pagesData = [
    {
      id: 'doc-welcome',
      slug: 'welcome',
      title: 'Welcome to Nexus Design OS',
      category: 'welcome',
      order: 1,
      content: '# Welcome to Nexus Design OS\nNexus Design OS connects your Figma designs, code repositories, and AI coding agents through one automated source of truth.',
    },
    {
      id: 'doc-foundations',
      slug: 'foundations',
      title: 'Design Foundations',
      category: 'foundations',
      order: 2,
      content: '# Foundations\nOur design foundation utilizes strict DTCG token modeling for colors, dimensions, typography, and elevations.',
    },
    {
      id: 'doc-components',
      slug: 'components',
      title: 'Component Guidelines',
      category: 'components',
      order: 3,
      content: '# Components\nLiving components built with token primitives and accessible keyboard navigation.',
    },
    {
      id: 'doc-ai-mcp',
      slug: 'ai-mcp',
      title: 'AI Contexts & Model Context Protocol',
      category: 'ai',
      order: 4,
      content: '# Model Context Protocol (MCP)\nGround your AI coding agents in authentic design tokens without manual prompt copying.',
    },
  ];

  for (const page of pagesData) {
    await db.insert(docPages).values({
      id: page.id,
      designSystemId,
      slug: page.slug,
      title: page.title,
      category: page.category,
      content: page.content,
      order: page.order,
      isPublished: true,
    }).onConflictDoNothing();
  }

  return {
    workspaceId,
    projectId,
    designSystemId,
    tokenCount: resolved.tokens.length,
    componentCount: 6,
    assetCount: iconsData.length,
    docPageCount: pagesData.length,
  };
}

// Auto-run if executed directly
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().then((res) => {
    console.log('Database seeded successfully:', res);
  }).catch((err) => {
    console.error('Failed to seed database:', err);
  });
}
