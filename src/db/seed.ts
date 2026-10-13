import { getDb } from './index';
import { workspaces, projects, designSystems, tokens, components, releases } from './schema';
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

  return {
    workspaceId,
    projectId,
    designSystemId,
    tokenCount: resolved.tokens.length,
    componentCount: 4,
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
