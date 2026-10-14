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

const SCHEMA_DDL = `
  CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

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

  ALTER TABLE tokens ADD COLUMN IF NOT EXISTS persistent_id TEXT;
  ALTER TABLE tokens ADD COLUMN IF NOT EXISTS version_id TEXT REFERENCES design_system_versions(id) ON DELETE CASCADE;
  ALTER TABLE tokens ADD COLUMN IF NOT EXISTS brand_id TEXT REFERENCES brands(id) ON DELETE SET NULL;
  ALTER TABLE tokens ADD COLUMN IF NOT EXISTS origin_source_id TEXT;
  ALTER TABLE tokens ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
  ALTER TABLE tokens ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

  CREATE INDEX IF NOT EXISTS idx_tokens_persistent_id ON tokens(persistent_id);
  CREATE INDEX IF NOT EXISTS idx_tokens_version_id ON tokens(version_id);
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

  CREATE UNIQUE INDEX IF NOT EXISTS idx_themes_ds_codename ON themes(design_system_id, code_name);
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
`;

export async function getDb(dataDir?: string) {
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
    await pgPoolInstance.query(SCHEMA_DDL);
    return { db: dbInstance, client: pgPoolInstance };
  }

  // 2. Local / Development / In-Memory Mode: Embedded PGlite
  const targetDir = dataDir || path.resolve(process.cwd(), '.data/novadesign-db');
  if (targetDir !== ':memory:') {
    fs.mkdirSync(targetDir, { recursive: true });
    pgliteInstance = new PGlite(targetDir);
  } else {
    pgliteInstance = new PGlite();
  }

  dbInstance = drizzlePglite(pgliteInstance, { schema });
  await pgliteInstance.exec(SCHEMA_DDL);

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

