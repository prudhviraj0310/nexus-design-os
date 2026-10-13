import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from './schema';
import * as path from 'path';
import * as fs from 'fs';

let pgliteInstance: PGlite | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export async function getDb(dataDir?: string) {
  if (dbInstance && pgliteInstance) {
    return { db: dbInstance, client: pgliteInstance };
  }

  // Use persistent storage if directory is provided or default to local .data/novadesign-db
  const targetDir = dataDir || path.resolve(process.cwd(), '.data/novadesign-db');
  if (targetDir !== ':memory:') {
    fs.mkdirSync(targetDir, { recursive: true });
    pgliteInstance = new PGlite(targetDir);
  } else {
    pgliteInstance = new PGlite();
  }

  dbInstance = drizzle(pgliteInstance, { schema });

  // Ensure tables exist
  await initializeSchema(pgliteInstance);

  return { db: dbInstance, client: pgliteInstance };
}

export async function initializeSchema(client: PGlite) {
  await client.exec(`
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
  `);
}

export * from './schema';
