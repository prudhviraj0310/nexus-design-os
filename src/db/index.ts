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
    is_alias BOOLEAN NOT NULL DEFAULT FALSE,
    alias_target TEXT,
    is_deprecated BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    extensions JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

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

export * from './schema';
