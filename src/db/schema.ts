import { pgTable, text, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core';

export const workspaces = pgTable('workspaces', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const designSystems = pgTable('design_systems', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  version: text('version').notNull().default('1.0.0'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const designSystemVersions = pgTable('design_system_versions', {
  id: text('id').primaryKey(),
  designSystemId: text('design_system_id').notNull().references(() => designSystems.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  isDraft: boolean('is_draft').default(false).notNull(),
  isReadOnly: boolean('is_read_only').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const brands = pgTable('brands', {
  id: text('id').primaryKey(),
  designSystemId: text('design_system_id').notNull().references(() => designSystems.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  codeName: text('code_name').notNull(),
  description: text('description'),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tokens = pgTable('tokens', {
  id: text('id').primaryKey(),
  persistentId: text('persistent_id'),
  designSystemId: text('design_system_id').notNull().references(() => designSystems.id, { onDelete: 'cascade' }),
  versionId: text('version_id').references(() => designSystemVersions.id, { onDelete: 'cascade' }),
  brandId: text('brand_id').references(() => brands.id, { onDelete: 'set null' }),
  originSourceId: text('origin_source_id'),
  name: text('name').notNull(),
  path: text('path').notNull(), // e.g. "color.brand.primary"
  category: text('category').notNull(), // color, spacing, typography, shadow, borderRadius, etc.
  type: text('type').notNull(), // DTCG $type: color, dimension, etc.
  rawValue: text('raw_value').notNull(), // can be "{color.primitive.blue.500}" or "#3b82f6"
  resolvedValue: text('resolved_value').notNull(), // resolved hex/px/etc.
  isComposite: boolean('is_composite').default(false).notNull(),
  rawValueJson: jsonb('raw_value_json'),
  resolvedValueJson: jsonb('resolved_value_json'),
  isAlias: boolean('is_alias').default(false).notNull(),
  aliasTarget: text('alias_target'),
  isDeprecated: boolean('is_deprecated').default(false).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  deletedAt: timestamp('deleted_at'),
  description: text('description'),
  extensions: jsonb('extensions'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const themes = pgTable('themes', {
  id: text('id').primaryKey(),
  persistentId: text('persistent_id'),
  designSystemId: text('design_system_id').notNull().references(() => designSystems.id, { onDelete: 'cascade' }),
  versionId: text('version_id').references(() => designSystemVersions.id, { onDelete: 'cascade' }),
  brandId: text('brand_id').references(() => brands.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  codeName: text('code_name').notNull(),
  description: text('description'),
  parentThemeId: text('parent_theme_id'),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tokenOverrides = pgTable('token_overrides', {
  id: text('id').primaryKey(),
  themeId: text('theme_id').notNull().references(() => themes.id, { onDelete: 'cascade' }),
  tokenPersistentId: text('token_persistent_id'),
  tokenPath: text('token_path').notNull(),
  rawValue: text('raw_value').notNull(),
  resolvedValue: text('resolved_value').notNull(),
  rawValueJson: jsonb('raw_value_json'),
  resolvedValueJson: jsonb('resolved_value_json'),
  isComposite: boolean('is_composite').default(false).notNull(),
  isAlias: boolean('is_alias').default(false).notNull(),
  aliasTarget: text('alias_target'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const components = pgTable('components', {
  id: text('id').primaryKey(),
  designSystemId: text('design_system_id').notNull().references(() => designSystems.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category').notNull(), // e.g. "inputs", "layout", "feedback"
  framework: text('framework').notNull().default('react'),
  description: text('description'),
  props: jsonb('props').notNull(), // Prop definitions and TypeScript types
  variants: jsonb('variants'),
  codeSnippet: text('code_snippet'),
  tokenDependencies: jsonb('token_dependencies'), // List of token paths it relies on
  isDeprecated: boolean('is_deprecated').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const auditReports = pgTable('audit_reports', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  ruleId: text('rule_id').notNull(),
  severity: text('severity').notNull(), // "error" | "warning" | "info"
  message: text('message').notNull(),
  filePath: text('file_path').notNull(),
  line: integer('line').notNull(),
  evidence: text('evidence'),
  suggestedFix: text('suggested_fix'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const deliveryJobs = pgTable('delivery_jobs', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  targetRepo: text('target_repo').notNull(),
  branch: text('branch').notNull(),
  pullRequestUrl: text('pull_request_url'),
  status: text('status').notNull(), // "pending" | "success" | "failed"
  diffSummary: text('diff_summary'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const releases = pgTable('releases', {
  id: text('id').primaryKey(),
  designSystemId: text('design_system_id').notNull().references(() => designSystems.id, { onDelete: 'cascade' }),
  version: text('version').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  tokensCount: integer('tokens_count').notNull().default(0),
  componentsCount: integer('components_count').notNull().default(0),
  changelog: text('changelog'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const assets = pgTable('assets', {
  id: text('id').primaryKey(),
  designSystemId: text('design_system_id').notNull().references(() => designSystems.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category').notNull().default('icons'), // "icons" | "logos" | "illustrations"
  svgContent: text('svg_content').notNull(),
  tags: jsonb('tags'),
  width: integer('width').notNull().default(24),
  height: integer('height').notNull().default(24),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const docPages = pgTable('doc_pages', {
  id: text('id').primaryKey(),
  designSystemId: text('design_system_id').notNull().references(() => designSystems.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(), // "welcome" | "foundations" | "components" | "ai" | "automation"
  content: text('content').notNull(), // Markdown or structured blocks
  order: integer('order').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
