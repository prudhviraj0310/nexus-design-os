import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as path from 'path';
import * as fs from 'fs';

let pgliteInstance: PGlite | null = null;
let pgPoolInstance: Pool | null = null;
let dbInstance: any = null;
let initializationPromise: Promise<void> | null = null;

const SCHEMA_DDL = `
  CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS workspace_members (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS plan_subscriptions (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'free',
    status TEXT NOT NULL DEFAULT 'active',
    seats_limit INTEGER NOT NULL DEFAULT 5,
    systems_limit INTEGER NOT NULL DEFAULT 1,
    contexts_limit INTEGER NOT NULL DEFAULT 1,
    monthly_ai_credits INTEGER NOT NULL DEFAULT 100,
    period_started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    period_ends_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id)
  );

  CREATE TABLE IF NOT EXISTS usage_counters (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    metric TEXT NOT NULL,
    period_key TEXT NOT NULL,
    value INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, metric, period_key)
  );

  CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY,
    workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
    actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    metadata JSONB,
    ip_address TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON workspace_members(workspace_id);
  CREATE INDEX IF NOT EXISTS idx_audit_events_workspace_created ON audit_events(workspace_id, created_at);

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS design_systems (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0.0',
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS tokens (
    id TEXT PRIMARY KEY,
    design_system_id TEXT NOT NULL REFERENCES design_systems(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL,
    raw_value TEXT NOT NULL,
    resolved_value TEXT NOT NULL,
    is_composite BOOLEAN NOT NULL DEFAULT FALSE,
    raw_value_json JSONB,
    resolved_value_json JSONB,
    is_alias BOOLEAN NOT NULL DEFAULT FALSE,
    alias_target TEXT,
    is_deprecated BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    extensions JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  ALTER TABLE tokens ADD COLUMN IF NOT EXISTS is_composite BOOLEAN NOT NULL DEFAULT FALSE;
  ALTER TABLE tokens ADD COLUMN IF NOT EXISTS raw_value_json JSONB;
  ALTER TABLE tokens ADD COLUMN IF NOT EXISTS resolved_value_json JSONB;

  CREATE TABLE IF NOT EXISTS design_system_versions (
    id TEXT PRIMARY KEY,
    design_system_id TEXT NOT NULL REFERENCES design_systems(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_draft BOOLEAN NOT NULL DEFAULT FALSE,
    is_read_only BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_ds_versions_ds_name ON design_system_versions(design_system_id, name);
  CREATE INDEX IF NOT EXISTS idx_ds_versions_ds_draft ON design_system_versions(design_system_id, is_draft);

  CREATE TABLE IF NOT EXISTS brands (
    id TEXT PRIMARY KEY,
    design_system_id TEXT NOT NULL REFERENCES design_systems(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code_name TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_brands_ds_codename ON brands(design_system_id, code_name);
  CREATE INDEX IF NOT EXISTS idx_brands_design_system_id ON brands(design_system_id);

  CREATE TABLE IF NOT EXISTS token_groups (
    id TEXT PRIMARY KEY,
    design_system_id TEXT NOT NULL REFERENCES design_systems(id) ON DELETE CASCADE,
    version_id TEXT REFERENCES design_system_versions(id) ON DELETE CASCADE,
    parent_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    token_type TEXT,
    path TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    is_root BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_token_groups_ds_ver ON token_groups(design_system_id, version_id);
  CREATE INDEX IF NOT EXISTS idx_token_groups_parent_id ON token_groups(parent_id);
  CREATE INDEX IF NOT EXISTS idx_token_groups_ds_path ON token_groups(design_system_id, path);

  ALTER TABLE tokens ADD COLUMN IF NOT EXISTS persistent_id TEXT;
  ALTER TABLE tokens ADD COLUMN IF NOT EXISTS version_id TEXT REFERENCES design_system_versions(id) ON DELETE CASCADE;
  ALTER TABLE tokens ADD COLUMN IF NOT EXISTS brand_id TEXT REFERENCES brands(id) ON DELETE SET NULL;
  ALTER TABLE tokens ADD COLUMN IF NOT EXISTS group_id TEXT REFERENCES token_groups(id) ON DELETE SET NULL;
  ALTER TABLE tokens ADD COLUMN IF NOT EXISTS origin_source_id TEXT;
  ALTER TABLE tokens ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
  ALTER TABLE tokens ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

  CREATE INDEX IF NOT EXISTS idx_tokens_persistent_id ON tokens(persistent_id);
  CREATE INDEX IF NOT EXISTS idx_tokens_version_id ON tokens(version_id);
  CREATE INDEX IF NOT EXISTS idx_tokens_group_id ON tokens(group_id);
  CREATE INDEX IF NOT EXISTS idx_tokens_origin_source_id ON tokens(origin_source_id);

  CREATE TABLE IF NOT EXISTS themes (
    id TEXT PRIMARY KEY,
    design_system_id TEXT NOT NULL REFERENCES design_systems(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code_name TEXT NOT NULL,
    description TEXT,
    parent_theme_id TEXT REFERENCES themes(id) ON DELETE SET NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  ALTER TABLE themes ADD COLUMN IF NOT EXISTS persistent_id TEXT;
  ALTER TABLE themes ADD COLUMN IF NOT EXISTS version_id TEXT REFERENCES design_system_versions(id) ON DELETE CASCADE;
  ALTER TABLE themes ADD COLUMN IF NOT EXISTS brand_id TEXT REFERENCES brands(id) ON DELETE SET NULL;
  DROP INDEX IF EXISTS idx_themes_ds_codename;
  CREATE UNIQUE INDEX IF NOT EXISTS idx_themes_ds_ver_codename ON themes(design_system_id, version_id, code_name);
  CREATE INDEX IF NOT EXISTS idx_themes_design_system_id ON themes(design_system_id);
  CREATE INDEX IF NOT EXISTS idx_themes_parent_theme_id ON themes(parent_theme_id);
  CREATE INDEX IF NOT EXISTS idx_themes_persistent_id ON themes(persistent_id);
  CREATE INDEX IF NOT EXISTS idx_themes_version_id ON themes(version_id);

  CREATE TABLE IF NOT EXISTS token_overrides (
    id TEXT PRIMARY KEY,
    theme_id TEXT NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
    token_path TEXT NOT NULL,
    raw_value TEXT NOT NULL,
    resolved_value TEXT NOT NULL,
    raw_value_json JSONB,
    resolved_value_json JSONB,
    is_composite BOOLEAN NOT NULL DEFAULT FALSE,
    is_alias BOOLEAN NOT NULL DEFAULT FALSE,
    alias_target TEXT,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  ALTER TABLE token_overrides ADD COLUMN IF NOT EXISTS token_persistent_id TEXT;

  CREATE UNIQUE INDEX IF NOT EXISTS idx_token_overrides_theme_path ON token_overrides(theme_id, token_path);
  CREATE INDEX IF NOT EXISTS idx_token_overrides_theme_id ON token_overrides(theme_id);
  CREATE INDEX IF NOT EXISTS idx_token_overrides_token_path ON token_overrides(token_path);
  CREATE INDEX IF NOT EXISTS idx_token_overrides_token_pid ON token_overrides(token_persistent_id);

  -- Deterministic Backfills for Existing Data
  INSERT INTO brands (id, design_system_id, name, code_name, is_default, created_at, updated_at)
  SELECT 
    'brand-default-' || id,
    id,
    name || ' Default Brand',
    'default',
    true,
    NOW(),
    NOW()
  FROM design_systems ds
  WHERE NOT EXISTS (
    SELECT 1 FROM brands b WHERE b.design_system_id = ds.id AND b.is_default = true
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO design_system_versions (id, design_system_id, name, description, is_draft, is_read_only, created_at)
  SELECT 
    'ver-draft-' || id,
    id,
    'Draft',
    'Active working draft container',
    true,
    false,
    NOW()
  FROM design_systems ds
  WHERE NOT EXISTS (
    SELECT 1 FROM design_system_versions v WHERE v.design_system_id = ds.id AND v.is_draft = true
  )
  ON CONFLICT (id) DO NOTHING;

  UPDATE tokens SET persistent_id = id WHERE persistent_id IS NULL;

  UPDATE tokens
  SET version_id = v.id
  FROM design_system_versions v
  WHERE tokens.design_system_id = v.design_system_id
    AND v.is_draft = true
    AND tokens.version_id IS NULL;

  UPDATE tokens
  SET brand_id = b.id
  FROM brands b
  WHERE tokens.design_system_id = b.design_system_id
    AND b.is_default = true
    AND tokens.brand_id IS NULL;

  UPDATE themes SET persistent_id = id WHERE persistent_id IS NULL;

  UPDATE themes
  SET version_id = v.id
  FROM design_system_versions v
  WHERE themes.design_system_id = v.design_system_id
    AND v.is_draft = true
    AND themes.version_id IS NULL;

  UPDATE themes
  SET brand_id = b.id
  FROM brands b
  WHERE themes.design_system_id = b.design_system_id
    AND b.is_default = true
    AND themes.brand_id IS NULL;

  UPDATE token_overrides
  SET token_persistent_id = t.persistent_id
  FROM tokens t, themes th
  WHERE token_overrides.theme_id = th.id
    AND token_overrides.token_path = t.path
    AND t.design_system_id = th.design_system_id
    AND token_overrides.token_persistent_id IS NULL;

  CREATE TABLE IF NOT EXISTS components (
    id TEXT PRIMARY KEY,
    design_system_id TEXT NOT NULL REFERENCES design_systems(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    framework TEXT NOT NULL DEFAULT 'react',
    description TEXT,
    props JSONB NOT NULL,
    variants JSONB,
    code_snippet TEXT,
    token_dependencies JSONB,
    is_deprecated BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  ALTER TABLE components ADD COLUMN IF NOT EXISTS package_name TEXT;
  ALTER TABLE components ADD COLUMN IF NOT EXISTS repository_name TEXT;
  ALTER TABLE components ADD COLUMN IF NOT EXISTS file_path TEXT;
  ALTER TABLE components ADD COLUMN IF NOT EXISTS export_name TEXT;
  ALTER TABLE components ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ready';

  CREATE TABLE IF NOT EXISTS audit_reports (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    rule_id TEXT NOT NULL,
    severity TEXT NOT NULL,
    message TEXT NOT NULL,
    file_path TEXT NOT NULL,
    line INTEGER NOT NULL,
    evidence TEXT,
    suggested_fix TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS delivery_jobs (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    target_repo TEXT NOT NULL,
    branch TEXT NOT NULL,
    pull_request_url TEXT,
    status TEXT NOT NULL,
    diff_summary TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS releases (
    id TEXT PRIMARY KEY,
    design_system_id TEXT NOT NULL REFERENCES design_systems(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    tokens_count INTEGER NOT NULL DEFAULT 0,
    components_count INTEGER NOT NULL DEFAULT 0,
    changelog TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    design_system_id TEXT NOT NULL REFERENCES design_systems(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'icons',
    svg_content TEXT NOT NULL,
    tags JSONB,
    width INTEGER NOT NULL DEFAULT 24,
    height INTEGER NOT NULL DEFAULT 24,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS doc_pages (
    id TEXT PRIMARY KEY,
    design_system_id TEXT NOT NULL REFERENCES design_systems(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  ALTER TABLE doc_pages ADD COLUMN IF NOT EXISTS blocks JSONB;

  CREATE TABLE IF NOT EXISTS delivery_pipelines (
    id TEXT PRIMARY KEY,
    design_system_id TEXT NOT NULL REFERENCES design_systems(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    provider TEXT NOT NULL DEFAULT 'github',
    trigger TEXT NOT NULL DEFAULT 'OnVersionReleased',
    repo_owner TEXT NOT NULL,
    repo_name TEXT NOT NULL,
    target_branch TEXT NOT NULL DEFAULT 'main',
    create_pull_request BOOLEAN NOT NULL DEFAULT TRUE,
    exporters JSONB NOT NULL,
    directory_purge BOOLEAN NOT NULL DEFAULT FALSE,
    commit_message_template TEXT,
    pr_title_template TEXT,
    pr_body_template TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_delivery_pipelines_ds ON delivery_pipelines(design_system_id);
  CREATE INDEX IF NOT EXISTS idx_delivery_pipelines_trigger ON delivery_pipelines(trigger);

  CREATE TABLE IF NOT EXISTS data_sources (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    name TEXT NOT NULL,
    config JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    last_synced_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS sync_jobs (
    id TEXT PRIMARY KEY,
    data_source_id TEXT NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    input JSONB,
    output JSONB,
    error TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS data_contexts (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    parent_context_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    rules JSONB NOT NULL,
    included_resources JSONB,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS agent_skills (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    context_id TEXT REFERENCES data_contexts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    instructions TEXT NOT NULL,
    tools JSONB NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS agent_feedback (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    context_id TEXT REFERENCES data_contexts(id) ON DELETE SET NULL,
    actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS background_jobs (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    payload JSONB NOT NULL,
    result JSONB,
    error TEXT,
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    lease_until TIMESTAMP,
    run_after TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
  ALTER TABLE background_jobs ADD COLUMN IF NOT EXISTS max_attempts INTEGER NOT NULL DEFAULT 3;
  ALTER TABLE background_jobs ADD COLUMN IF NOT EXISTS lease_until TIMESTAMP;

  CREATE TABLE IF NOT EXISTS webhook_events (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    source_id TEXT NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'accepted',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS dead_letter_jobs (
    id TEXT PRIMARY KEY,
    original_job_id TEXT NOT NULL,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    payload JSONB NOT NULL,
    attempts INTEGER NOT NULL,
    error TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS doc_revisions (
    id TEXT PRIMARY KEY,
    page_id TEXT NOT NULL REFERENCES doc_pages(id) ON DELETE CASCADE,
    author_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    blocks JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS doc_comments (
    id TEXT PRIMARY KEY,
    page_id TEXT NOT NULL REFERENCES doc_pages(id) ON DELETE CASCADE,
    author_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    anchor JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS doc_approvals (
    id TEXT PRIMARY KEY,
    page_id TEXT NOT NULL REFERENCES doc_pages(id) ON DELETE CASCADE,
    requested_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    reviewer_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS doc_redirects (
    id TEXT PRIMARY KEY,
    design_system_id TEXT NOT NULL REFERENCES design_systems(id) ON DELETE CASCADE,
    from_path TEXT NOT NULL,
    to_path TEXT NOT NULL,
    status_code INTEGER NOT NULL DEFAULT 301,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS code_containers (
    id TEXT PRIMARY KEY,
    design_system_id TEXT NOT NULL REFERENCES design_systems(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    framework TEXT NOT NULL DEFAULT 'react',
    manifest JSONB NOT NULL,
    artifact_url TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
`;

export async function getDb(dataDir?: string) {
  const isolatedMemoryDatabase = dataDir === ':memory:';
  if (isolatedMemoryDatabase) {
    const client = new PGlite();
    const db = drizzlePglite(client, { schema });
    await client.exec(SCHEMA_DDL);
    pgliteInstance = client;
    pgPoolInstance = null;
    dbInstance = db;
    initializationPromise = Promise.resolve();
    return { db, client };
  }

  if (dbInstance && (pgliteInstance || pgPoolInstance)) {
    return { db: dbInstance, client: pgliteInstance || pgPoolInstance };
  }

  // 1. Production Mode: Remote Postgres via DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl && dataDir !== ':memory:') {
    pgPoolInstance = new Pool({
      connectionString: databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    dbInstance = drizzlePg(pgPoolInstance, { schema });
    initializationPromise ??= pgPoolInstance.query(SCHEMA_DDL).then(() => undefined);
    await initializationPromise;
    return { db: dbInstance, client: pgPoolInstance };
  }

  // 2. Local / Development / In-Memory Mode: Embedded PGlite
  const configuredDataDir = process.env.DATA_DIR;
  const targetDir = dataDir || (process.env.NODE_ENV === 'test'
    ? ':memory:'
    : path.resolve(/*turbopackIgnore: true*/ process.cwd(), configuredDataDir || '.data/novadesign-db'));
  if (targetDir !== ':memory:') {
    fs.mkdirSync(targetDir, { recursive: true });
    pgliteInstance = new PGlite(targetDir);
  } else {
    pgliteInstance = new PGlite();
  }

  dbInstance = drizzlePglite(pgliteInstance, { schema });
  initializationPromise ??= pgliteInstance.exec(SCHEMA_DDL).then(() => undefined);
  await initializationPromise;

  return { db: dbInstance, client: pgliteInstance };
}

export async function initializeSchema(client: any) {
  if (client && typeof client.exec === 'function') {
    await client.exec(SCHEMA_DDL);
  } else if (client && typeof client.query === 'function') {
    await client.query(SCHEMA_DDL);
  }
}

export async function runFoundationMigration(client: any) {
  await initializeSchema(client);
}

export * from './schema';
