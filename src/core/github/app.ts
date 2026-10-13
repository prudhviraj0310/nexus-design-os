import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface GitHubAppConfig {
  appId?: string;
  slug?: string;
  clientId?: string;
  clientSecret?: string;
  privateKey?: string;
  webhookSecret?: string;
}

export interface GitHubInstallationInfo {
  installationId: string;
  accountLogin?: string;
  accountAvatar?: string;
  accountType?: string;
  installedAt?: string;
  repositorySelection?: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const APP_CONFIG_FILE = path.join(DATA_DIR, 'github-app.json');
const INSTALLATION_FILE = path.join(DATA_DIR, 'github-installation.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getGitHubAppConfig(): GitHubAppConfig | null {
  // 1. Check environment variables first
  if (process.env.GITHUB_APP_ID && process.env.GITHUB_APP_PRIVATE_KEY) {
    return {
      appId: process.env.GITHUB_APP_ID,
      slug: process.env.GITHUB_APP_SLUG || 'nexus-design-os',
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  // 2. Check local data file
  try {
    if (fs.existsSync(APP_CONFIG_FILE)) {
      const data = fs.readFileSync(APP_CONFIG_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading GitHub App config:', err);
  }

  return null;
}

export function saveGitHubAppConfig(config: GitHubAppConfig) {
  ensureDataDir();
  fs.writeFileSync(APP_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
}

export function getGitHubInstallation(): GitHubInstallationInfo | null {
  try {
    if (fs.existsSync(INSTALLATION_FILE)) {
      const data = fs.readFileSync(INSTALLATION_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading GitHub installation:', err);
  }
  return null;
}

export function saveGitHubInstallation(info: GitHubInstallationInfo) {
  ensureDataDir();
  fs.writeFileSync(INSTALLATION_FILE, JSON.stringify(info, null, 2), 'utf8');
}

export function clearGitHubInstallation() {
  try {
    if (fs.existsSync(INSTALLATION_FILE)) {
      fs.unlinkSync(INSTALLATION_FILE);
    }
  } catch (err) {
    console.error('Error clearing GitHub installation:', err);
  }
}

/**
 * Creates an RS256 signed JWT for authenticating as the GitHub App.
 * Valid for up to 10 minutes.
 */
export function createAppJwt(appId: string, privateKey: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iat: now - 60, // 60s in the past to prevent clock skew
    exp: now + 600, // 10 minutes expiry
    iss: appId,
  };

  const encode = (obj: any) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const data = `${encode(header)}.${encode(payload)}`;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(data);
  const signature = sign.sign(privateKey, 'base64url');

  return `${data}.${signature}`;
}

/**
 * Exchanges installationId for a temporary installation access token.
 */
export async function getInstallationAccessToken(
  installationId: string | number
): Promise<{ token: string; expiresAt: string } | null> {
  const config = getGitHubAppConfig();
  if (!config || !config.appId || !config.privateKey) {
    return null;
  }

  const jwt = createAppJwt(config.appId, config.privateKey);

  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Nexus-Design-OS/1.0.0',
      },
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`Failed to get installation access token (${res.status}):`, errorText);
    return null;
  }

  const data = await res.json();
  return {
    token: data.token,
    expiresAt: data.expires_at,
  };
}

/**
 * Fetches the repositories accessible to an installed GitHub App.
 */
export async function getInstallationRepositories(token: string) {
  const res = await fetch('https://api.github.com/installation/repositories?per_page=100', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Nexus-Design-OS/1.0.0',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch installation repositories: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return (data.repositories || []).map((r: any) => ({
    id: r.id,
    name: r.name,
    fullName: r.full_name,
    owner: r.owner.login,
    ownerAvatar: r.owner.avatar_url,
    defaultBranch: r.default_branch || 'main',
    isPrivate: r.private,
    description: r.description || '',
    htmlUrl: r.html_url,
    pushedAt: r.pushed_at,
  }));
}

export function generateAppManifest(origin: string) {
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return {
    name: `nexus-design-os-${randomSuffix}`,
    url: origin,
    redirect_url: `${origin}/api/github/app/setup`,
    callback_urls: [`${origin}/api/github/app/callback`],
    setup_url: `${origin}/api/github/app/callback`,
    public: false,
    default_permissions: {
      contents: 'write',
      pull_requests: 'write',
      metadata: 'read',
    },
    default_events: [],
  };
}
