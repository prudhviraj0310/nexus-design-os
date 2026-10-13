import { z } from 'zod';

/**
 * Centralised, validated runtime configuration.
 *
 * Every server module reads configuration from here instead of `process.env`
 * so that misconfiguration fails loudly and is reported by `/api/health`.
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  /** Managed Postgres connection string. When unset, embedded PGlite is used. */
  DATABASE_URL: z.string().url().optional(),
  /** Directory for the embedded PGlite database (ignored when DATABASE_URL is set). */
  DATA_DIR: z.string().default('.data/novadesign-db'),

  /** Password for the single admin account. Required in production. */
  NOVA_ADMIN_PASSWORD: z.string().min(12).optional(),
  /** HMAC secret used to sign session cookies. Required in production. */
  NOVA_SESSION_SECRET: z.string().min(32).optional(),
  /** Bearer key for machine clients (MCP agents, CLI, CI). */
  NOVA_API_KEY: z.string().min(24).optional(),
  /** When "true", the /docs portal is readable without signing in. */
  NOVA_PUBLIC_DOCS: z.enum(['true', 'false']).default('false'),

  /** Server-side GitHub token used for live pull-request delivery. */
  GITHUB_TOKEN: z.string().optional(),
  /** Server-side Figma personal access token used for live variable import. */
  FIGMA_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

let cached: { env: Env; issues: string[] } | null = null;

function emptyToUndefined(source: NodeJS.ProcessEnv): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(source)) out[k] = v === '' ? undefined : v;
  return out;
}

export function loadEnv(): { env: Env; issues: string[] } {
  if (cached) return cached;

  const parsed = EnvSchema.safeParse(emptyToUndefined(process.env));
  const issues: string[] = [];
  let env: Env;

  if (parsed.success) {
    env = parsed.data;
  } else {
    for (const issue of parsed.error.issues) {
      issues.push(`${issue.path.join('.')}: ${issue.message}`);
    }
    // Fall back to defaults for invalid keys so the app can still report health.
    env = EnvSchema.parse({ NODE_ENV: process.env.NODE_ENV === 'production' ? 'production' : 'development' });
  }

  if (env.NODE_ENV === 'production') {
    if (!env.NOVA_ADMIN_PASSWORD) issues.push('NOVA_ADMIN_PASSWORD is required in production');
    if (!env.NOVA_SESSION_SECRET) issues.push('NOVA_SESSION_SECRET is required in production');
  }

  cached = { env, issues };
  return cached;
}

export const env = (): Env => loadEnv().env;

/** Authentication is enforced whenever an admin password or API key is configured, or in production. */
export function isAuthEnabled(): boolean {
  const e = env();
  return (
    e.NODE_ENV === 'production' ||
    Boolean(e.NOVA_ADMIN_PASSWORD) ||
    Boolean(e.NOVA_API_KEY) ||
    Boolean(process.env.NEXUS_API_KEY) ||
    Boolean(process.env.NOVA_API_KEY) ||
    process.env.AUTH_REQUIRED === 'true'
  );
}

/** Test helper: forget cached configuration. */
export function resetEnvCache() {
  cached = null;
}
