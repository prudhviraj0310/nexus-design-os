import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GitLabDeliveryEngine } from '../src/core/delivery/gitlab';
import { BitbucketDeliveryEngine } from '../src/core/delivery/bitbucket';
import { getDeliveryEngine } from '../src/core/delivery/index';
import { GeneratedFile } from '../src/core/exporters/types';

describe('Tier 1: Multi-Git Continuous Delivery (GitLab & Bitbucket)', () => {
  const mockFiles: GeneratedFile[] = [
    {
      filename: 'tokens.css',
      content: ':root { --color-primary: #3b82f6; }',
      format: 'css',
    },
    {
      filename: 'tokens.json',
      content: '{"color": {"primary": {"$value": "#3b82f6"}}}',
      format: 'json',
    },
  ];

  describe('Unified getDeliveryEngine factory', () => {
    it('returns appropriate engine instances for all supported providers', () => {
      const gh = getDeliveryEngine('github');
      expect(gh.constructor.name).toBe('GitHubDeliveryEngine');

      const gl = getDeliveryEngine('gitlab');
      expect(gl.constructor.name).toBe('GitLabDeliveryEngine');

      const bb = getDeliveryEngine('bitbucket');
      expect(bb.constructor.name).toBe('BitbucketDeliveryEngine');
    });
  });

  describe('GitLabDeliveryEngine', () => {
    const engine = new GitLabDeliveryEngine();

    it('generates reproducible diff summary and dry-run delivery result without remote calls', async () => {
      const result = await engine.deliver({
        projectId: 'proj-1',
        provider: 'gitlab',
        repoOwner: 'acme-corp',
        repoName: 'design-tokens',
        newBranchName: 'nexus/sync-tokens',
        commitMessage: 'chore(tokens): sync tokens',
        prTitle: 'Sync Design Tokens',
        prBody: 'Automated MR from Nexus',
        files: mockFiles,
        dryRun: true,
      });

      expect(result.success).toBe(true);
      expect(result.dryRun).toBe(true);
      expect(result.provider).toBe('gitlab');
      expect(result.pullRequestUrl).toBeNull();
      expect(result.commitSha).toBeNull();
      expect(result.filesCommitted).toEqual(['tokens.css', 'tokens.json']);
      expect(result.diffSummary).toContain('GitLab Diff Summary for acme-corp/design-tokens');
    });

    it('rejects live delivery when GITLAB_TOKEN is missing', async () => {
      const originalToken = process.env.GITLAB_TOKEN;
      delete process.env.GITLAB_TOKEN;

      const result = await engine.deliver({
        projectId: 'proj-1',
        provider: 'gitlab',
        repoOwner: 'acme-corp',
        repoName: 'design-tokens',
        newBranchName: 'nexus/sync-tokens',
        commitMessage: 'chore: sync',
        prTitle: 'MR Title',
        prBody: 'MR Body',
        files: mockFiles,
        dryRun: false,
        gitlabToken: undefined,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing GITLAB_TOKEN');

      if (originalToken) process.env.GITLAB_TOKEN = originalToken;
    });

    it('executes live delivery, handling atomic commits, directory purge, and MR creation', async () => {
      const originalFetch = global.fetch;

      const mockFetch = vi.fn().mockImplementation((url: string, init?: any) => {
        const u = url.toString();

        // 1. Base branch check
        if (u.includes('/repository/branches/main')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ name: 'main' }),
          });
        }

        // 2. File checks (tokens.css exists, tokens.json is new)
        if (u.includes('/repository/files/tokens.css')) {
          return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
        }
        if (u.includes('/repository/files/tokens.json')) {
          return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) });
        }

        // 3. Tree check for directory purge
        if (u.includes('/repository/tree')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () =>
              Promise.resolve([
                { path: 'tokens/tokens.css', type: 'blob' },
                { path: 'tokens/stale-old-token.js', type: 'blob' }, // orphaned file to purge
              ]),
          });
        }

        // 4. Commit creation
        if (u.includes('/repository/commits') && init?.method === 'POST') {
          const body = JSON.parse(init.body);
          expect(body.branch).toBe('nexus/tokens-v1');
          expect(body.start_branch).toBe('main');

          // Must have actions
          const actions = body.actions;
          expect(actions.length).toBeGreaterThanOrEqual(2);

          return Promise.resolve({
            ok: true,
            status: 201,
            json: () => Promise.resolve({ id: 'gl-commit-sha-789' }),
          });
        }

        // 5. Existing MR check (none open)
        if (u.includes('/merge_requests?') && (!init || init.method === 'GET')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve([]),
          });
        }

        // 6. MR creation
        if (u.includes('/merge_requests') && init?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            status: 201,
            json: () => Promise.resolve({ web_url: 'https://gitlab.com/acme-corp/design-tokens/-/merge_requests/42' }),
          });
        }

        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
      });

      global.fetch = mockFetch;

      try {
        const result = await engine.deliver({
          projectId: 'proj-1',
          provider: 'gitlab',
          repoOwner: 'acme-corp',
          repoName: 'design-tokens',
          baseBranch: 'main',
          newBranchName: 'nexus/tokens-v1',
          commitMessage: 'chore(tokens): sync tokens',
          prTitle: 'Sync Design Tokens MR',
          prBody: 'Automated MR generated by Nexus',
          files: mockFiles,
          gitlabToken: 'glpat-test-secret-token',
          dryRun: false,
        });

        expect(result.success).toBe(true);
        expect(result.commitSha).toBe('gl-commit-sha-789');
        expect(result.pullRequestUrl).toBe('https://gitlab.com/acme-corp/design-tokens/-/merge_requests/42');
        expect(result.prCreated).toBe(true);
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe('BitbucketDeliveryEngine', () => {
    const engine = new BitbucketDeliveryEngine();

    it('generates reproducible diff summary and dry-run delivery result without remote calls', async () => {
      const result = await engine.deliver({
        projectId: 'proj-1',
        provider: 'bitbucket',
        repoOwner: 'acme-corp',
        repoName: 'design-tokens',
        newBranchName: 'nexus/sync-tokens',
        commitMessage: 'chore(tokens): sync tokens',
        prTitle: 'Sync Design Tokens PR',
        prBody: 'Automated Bitbucket PR',
        files: mockFiles,
        dryRun: true,
      });

      expect(result.success).toBe(true);
      expect(result.dryRun).toBe(true);
      expect(result.provider).toBe('bitbucket');
      expect(result.pullRequestUrl).toBeNull();
      expect(result.filesCommitted).toEqual(['tokens.css', 'tokens.json']);
      expect(result.diffSummary).toContain('Bitbucket Diff Summary for acme-corp/design-tokens');
    });

    it('rejects live delivery when Bitbucket credentials are missing', async () => {
      const originalToken = process.env.BITBUCKET_TOKEN;
      delete process.env.BITBUCKET_TOKEN;
      delete process.env.BITBUCKET_USERNAME;
      delete process.env.BITBUCKET_APP_PASSWORD;

      const result = await engine.deliver({
        projectId: 'proj-1',
        provider: 'bitbucket',
        repoOwner: 'acme-corp',
        repoName: 'design-tokens',
        newBranchName: 'nexus/sync-tokens',
        commitMessage: 'chore: sync',
        prTitle: 'PR Title',
        prBody: 'PR Body',
        files: mockFiles,
        dryRun: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing Bitbucket credentials');

      if (originalToken) process.env.BITBUCKET_TOKEN = originalToken;
    });

    it('executes live delivery, committing via /src and opening pull request', async () => {
      const originalFetch = global.fetch;

      const mockFetch = vi.fn().mockImplementation((url: string, init?: any) => {
        const u = url.toString();

        // 1. Base branch check
        if (u.includes('/refs/branches/main')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ target: { hash: 'bb-base-commit-hash-123' } }),
          });
        }

        // 2. Commit files to /src
        if (u.endsWith('/src') && init?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            status: 201,
            json: () => Promise.resolve({}),
          });
        }

        // 3. Existing PR check (none)
        if (u.includes('/pullrequests?q=') && (!init || init.method === 'GET')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ values: [] }),
          });
        }

        // 4. Create PR
        if (u.endsWith('/pullrequests') && init?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            status: 201,
            json: () =>
              Promise.resolve({
                links: { html: { href: 'https://bitbucket.org/acme-corp/design-tokens/pull-requests/15' } },
              }),
          });
        }

        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
      });

      global.fetch = mockFetch;

      try {
        const result = await engine.deliver({
          projectId: 'proj-1',
          provider: 'bitbucket',
          repoOwner: 'acme-corp',
          repoName: 'design-tokens',
          baseBranch: 'main',
          newBranchName: 'nexus/bb-tokens-v1',
          commitMessage: 'feat(tokens): automated release',
          prTitle: 'Sync Design Tokens',
          prBody: 'Automated Bitbucket PR',
          files: mockFiles,
          bitbucketToken: 'bb-access-token-xyz',
          dryRun: false,
        });

        expect(result.success).toBe(true);
        expect(result.pullRequestUrl).toBe('https://bitbucket.org/acme-corp/design-tokens/pull-requests/15');
        expect(result.prCreated).toBe(true);
      } finally {
        global.fetch = originalFetch;
      }
    });
  });
});
