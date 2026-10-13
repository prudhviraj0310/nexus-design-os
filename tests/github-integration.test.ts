import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET as getConnect, POST as postConnect, DELETE as deleteConnect } from '../src/app/api/github/connect/route';
import { GET as getRepos } from '../src/app/api/github/repos/route';
import { GET as getOauth } from '../src/app/api/github/oauth/route';

describe('GitHub Web Integration API Routes', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_CLIENT_ID;
    delete process.env.GITHUB_CLIENT_SECRET;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('GET /api/github/connect', () => {
    it('returns connected: false when no token is present', async () => {
      const req = new Request('http://localhost:3000/api/github/connect');
      const res = await getConnect(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.connected).toBe(false);
      expect(data.message).toContain('No GitHub token configured');
    });

    it('returns connected: true with user metadata when valid token header is present', async () => {
      const mockUser = {
        login: 'octocat',
        name: 'The Octocat',
        avatar_url: 'https://github.com/images/error/octocat_happy.gif',
        html_url: 'https://github.com/octocat',
        public_repos: 8,
        total_private_repos: 4,
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockUser), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const req = new Request('http://localhost:3000/api/github/connect', {
        headers: {
          'x-github-token': 'ghp_test_valid_token_123',
        },
      });

      const res = await getConnect(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.connected).toBe(true);
      expect(data.user.login).toBe('octocat');
      expect(data.user.publicRepos).toBe(8);
      expect(data.user.totalPrivateRepos).toBe(4);
    });
  });

  describe('POST /api/github/connect', () => {
    it('rejects empty or missing token with 400', async () => {
      const req = new Request('http://localhost:3000/api/github/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: '' }),
      });

      const res = await postConnect(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Token is required');
    });

    it('validates token against GitHub and returns user profile upon success', async () => {
      const mockUser = {
        login: 'nexus-designer',
        name: 'Nexus Designer',
        avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
        html_url: 'https://github.com/nexus-designer',
        public_repos: 15,
        total_private_repos: 2,
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockUser), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const req = new Request('http://localhost:3000/api/github/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'ghp_valid_mock_token' }),
      });

      const res = await postConnect(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.connected).toBe(true);
      expect(data.user.login).toBe('nexus-designer');
    });

    it('rejects invalid GitHub token with 401', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Bad credentials' }), {
          status: 401,
          statusText: 'Unauthorized',
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const req = new Request('http://localhost:3000/api/github/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'ghp_invalid_mock_token' }),
      });

      const res = await postConnect(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid GitHub token');
    });
  });

  describe('DELETE /api/github/connect', () => {
    it('returns disconnected state and removes auth session', async () => {
      const res = await deleteConnect();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.connected).toBe(false);
    });
  });

  describe('GET /api/github/repos', () => {
    it('returns 401 when account is not connected', async () => {
      const req = new Request('http://localhost:3000/api/github/repos');
      const res = await getRepos(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('not connected');
    });

    it('returns formatted repositories list when connected', async () => {
      const mockRepos = [
        {
          id: 101,
          name: 'design-tokens',
          full_name: 'octocat/design-tokens',
          owner: { login: 'octocat', avatar_url: 'https://github.com/avatar.png' },
          default_branch: 'main',
          private: false,
          description: 'Official Design Tokens Repository',
          html_url: 'https://github.com/octocat/design-tokens',
          pushed_at: '2026-10-13T12:00:00Z',
        },
        {
          id: 102,
          name: 'web-platform-core',
          full_name: 'octocat/web-platform-core',
          owner: { login: 'octocat', avatar_url: 'https://github.com/avatar.png' },
          default_branch: 'develop',
          private: true,
          description: 'Core web UI library',
          html_url: 'https://github.com/octocat/web-platform-core',
          pushed_at: '2026-10-12T15:30:00Z',
        },
      ];

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockRepos), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const req = new Request('http://localhost:3000/api/github/repos', {
        headers: {
          'x-github-token': 'ghp_test_token',
        },
      });

      const res = await getRepos(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.totalCount).toBe(2);
      expect(data.repos[0].name).toBe('design-tokens');
      expect(data.repos[0].fullName).toBe('octocat/design-tokens');
      expect(data.repos[1].defaultBranch).toBe('develop');
      expect(data.repos[1].isPrivate).toBe(true);
    });
  });

  describe('GET /api/github/oauth', () => {
    it('redirects back to origin with error parameter when GITHUB_CLIENT_ID is not configured', async () => {
      const req = new Request('http://localhost:3000/api/github/oauth');
      const res = await getOauth(req);
      expect(res.status).toBe(307);
      const location = res.headers.get('location');
      expect(location).toContain('github_error=missing_oauth_credentials');
    });

    it('redirects to GitHub OAuth authorize when GITHUB_CLIENT_ID is configured', async () => {
      process.env.GITHUB_CLIENT_ID = 'test_github_client_id_123';
      const req = new Request('http://localhost:3000/api/github/oauth');
      const res = await getOauth(req);
      expect(res.status).toBe(307); // Next.js redirect status
      const location = res.headers.get('location');
      expect(location).toContain('https://github.com/login/oauth/authorize');
      expect(location).toContain('client_id=test_github_client_id_123');
      expect(location).toContain('scope=repo%2Cread%3Auser');
    });
  });
});
