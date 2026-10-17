import { pgTable, text, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core';

export const workspaces = pgTable('workspaces', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  displayName: text('display_name').notNull(),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const workspaceMembers = pgTable('workspace_members', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('member'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const planSubscriptions = pgTable('plan_subscriptions', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  plan: text('plan').notNull().default('free'),
  status: text('status').notNull().default('active'),
  seatsLimit: integer('seats_limit').notNull().default(5),
  systemsLimit: integer('systems_limit').notNull().default(1),
  contextsLimit: integer('contexts_limit').notNull().default(1),
  monthlyAiCredits: integer('monthly_ai_credits').notNull().default(100),
  periodStartedAt: timestamp('period_started_at').defaultNow().notNull(),
  periodEndsAt: timestamp('period_ends_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usageCounters = pgTable('usage_counters', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  metric: text('metric').notNull(),
  periodKey: text('period_key').notNull(),
  value: integer('value').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const auditEvents = pgTable('audit_events', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }),
  actorUserId: text('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  resourceType: text('resource_type').notNull(),
  resourceId: text('resource_id'),
  metadata: jsonb('metadata'),
  ipAddress: text('ip_address'),
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

export const tokenGroups = pgTable('token_groups', {
  id: text('id').primaryKey(),
  designSystemId: text('design_system_id').notNull().references(() => designSystems.id, { onDelete: 'cascade' }),
  versionId: text('version_id').references(() => designSystemVersions.id, { onDelete: 'cascade' }),
  parentId: text('parent_id'),
  name: text('name').notNull(),
  description: text('description'),
  tokenType: text('token_type'),
  path: text('path').notNull(), // e.g. "color/brand"
  order: integer('order').notNull().default(0),
  isRoot: boolean('is_root').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tokens = pgTable('tokens', {
  id: text('id').primaryKey(),
  persistentId: text('persistent_id'),
  designSystemId: text('design_system_id').notNull().references(() => designSystems.id, { onDelete: 'cascade' }),
  versionId: text('version_id').references(() => designSystemVersions.id, { onDelete: 'cascade' }),
  brandId: text('brand_id').references(() => brands.id, { onDelete: 'set null' }),
  groupId: text('group_id').references(() => tokenGroups.id, { onDelete: 'set null' }),
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
  packageName: text('package_name'), // e.g. "@nexus/ui"
  repositoryName: text('repository_name'), // e.g. "acme-corp/web-ui"
  filePath: text('file_path'), // e.g. "src/components/Button/Button.tsx"
  exportName: text('export_name'), // e.g. "Button"
  status: text('status').notNull().default('ready'), // "ready" | "in-progress" | "deprecated" | "planned"
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
  blocks: jsonb('blocks'), // Structured JSON AST of DocBlock[]
  order: integer('order').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const deliveryPipelines = pgTable('delivery_pipelines', {
  id: text('id').primaryKey(),
  designSystemId: text('design_system_id').notNull().references(() => designSystems.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  provider: text('provider').notNull().default('github'), // 'github' | 'gitlab' | 'bitbucket'
  trigger: text('trigger').notNull().default('OnVersionReleased'), // 'OnVersionReleased' | 'OnHeadChanged' | 'OnSourceUpdated' | 'Manual'
  repoOwner: text('repo_owner').notNull(),
  repoName: text('repo_name').notNull(),
  targetBranch: text('target_branch').notNull().default('main'),
  createPullRequest: boolean('create_pull_request').notNull().default(true),
  exporters: jsonb('exporters').notNull(), // string[]: ['css', 'typescript', 'tailwind']
  directoryPurge: boolean('directory_purge').notNull().default(false),
  commitMessageTemplate: text('commit_message_template'),
  prTitleTemplate: text('pr_title_template'),
  prBodyTemplate: text('pr_body_template'),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const dataSources = pgTable('data_sources', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(), // figma | storybook | tokens-studio | github | gitlab | bitbucket
  name: text('name').notNull(),
  config: jsonb('config').notNull(),
  status: text('status').notNull().default('active'),
  lastSyncedAt: timestamp('last_synced_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const syncJobs = pgTable('sync_jobs', {
  id: text('id').primaryKey(),
  dataSourceId: text('data_source_id').notNull().references(() => dataSources.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  status: text('status').notNull().default('queued'),
  input: jsonb('input'),
  output: jsonb('output'),
  error: text('error'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const dataContexts = pgTable('data_contexts', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  parentContextId: text('parent_context_id'),
  name: text('name').notNull(),
  description: text('description'),
  rules: jsonb('rules').notNull(),
  includedResources: jsonb('included_resources'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const agentSkills = pgTable('agent_skills', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  contextId: text('context_id').references(() => dataContexts.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  instructions: text('instructions').notNull(),
  tools: jsonb('tools').notNull(),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const agentFeedback = pgTable('agent_feedback', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  contextId: text('context_id').references(() => dataContexts.id, { onDelete: 'set null' }),
  actorUserId: text('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
  category: text('category').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull().default('open'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const backgroundJobs = pgTable('background_jobs', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  status: text('status').notNull().default('queued'),
  payload: jsonb('payload').notNull(),
  result: jsonb('result'),
  error: text('error'),
  attempts: integer('attempts').notNull().default(0),
  maxAttempts: integer('max_attempts').notNull().default(3),
  leaseUntil: timestamp('lease_until'),
  runAfter: timestamp('run_after').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const webhookEvents = pgTable('webhook_events', {
  id: text('id').primaryKey(),
  provider: text('provider').notNull(),
  sourceId: text('source_id').notNull().references(() => dataSources.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(),
  payload: jsonb('payload').notNull(),
  status: text('status').notNull().default('accepted'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const deadLetterJobs = pgTable('dead_letter_jobs', {
  id: text('id').primaryKey(),
  originalJobId: text('original_job_id').notNull(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  payload: jsonb('payload').notNull(),
  attempts: integer('attempts').notNull(),
  error: text('error').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const docRevisions = pgTable('doc_revisions', {
  id: text('id').primaryKey(),
  pageId: text('page_id').notNull().references(() => docPages.id, { onDelete: 'cascade' }),
  authorUserId: text('author_user_id').references(() => users.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  blocks: jsonb('blocks'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const docComments = pgTable('doc_comments', {
  id: text('id').primaryKey(),
  pageId: text('page_id').notNull().references(() => docPages.id, { onDelete: 'cascade' }),
  authorUserId: text('author_user_id').references(() => users.id, { onDelete: 'set null' }),
  body: text('body').notNull(),
  status: text('status').notNull().default('open'),
  anchor: jsonb('anchor'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const docApprovals = pgTable('doc_approvals', {
  id: text('id').primaryKey(),
  pageId: text('page_id').notNull().references(() => docPages.id, { onDelete: 'cascade' }),
  requestedByUserId: text('requested_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  reviewerUserId: text('reviewer_user_id').references(() => users.id, { onDelete: 'set null' }),
  status: text('status').notNull().default('pending'),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const docRedirects = pgTable('doc_redirects', {
  id: text('id').primaryKey(),
  designSystemId: text('design_system_id').notNull().references(() => designSystems.id, { onDelete: 'cascade' }),
  fromPath: text('from_path').notNull(),
  toPath: text('to_path').notNull(),
  statusCode: integer('status_code').notNull().default(301),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const codeContainers = pgTable('code_containers', {
  id: text('id').primaryKey(),
  designSystemId: text('design_system_id').notNull().references(() => designSystems.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  version: text('version').notNull(),
  framework: text('framework').notNull().default('react'),
  manifest: jsonb('manifest').notNull(),
  artifactUrl: text('artifact_url'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
