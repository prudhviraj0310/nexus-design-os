import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GitHubDeliveryEngine } from '../src/core/delivery/github';
import { GeneratedFile } from '../src/core/exporters/types';

describe('Verification B: GitHub Delivery Genuine Idempotency & Failure Scenarios', () => {
  const engine = new GitHubDeliveryEngine();
  const originalFetch = global.fetch;

  const sampleFiles: GeneratedFile[] = [
    {
      filename: 'tokens.css',
      content: ':root { --color-primary: #2563eb; }',
      format: 'css',
    },
    {
      filename: 'tokens.ts',
      content: 'export const tokens = { colorPrimary: "#2563eb" };',
      format: 'typescript',
    },
  ];

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  // Scenario 1: No token changes -> Expected: No new branch, commit, or PR
  it('Scenario 1: No token changes -> detect no-op and do not create new branch, commit, or PR', async () => {
    let branchCreationCalled = false;
    let commitCalled = false;
    let prCreationCalled = false;

    global.fetch = vi.fn().mockImplementation(async (url: string, init?: any) => {
      // 1. Get base branch ref
      if (url.includes('/git/ref/heads/main')) {
        return {
          ok: true,
          json: async () => ({ object: { sha: 'base-main-sha-001' } }),
        };
      }
      // 2. Fetch remote file contents on base branch (returns identical content)
      if (url.includes('/contents/tokens.css?ref=main')) {
        return {
          ok: true,
          json: async () => ({
            content: Buffer.from(sampleFiles[0].content).toString('base64'),
          }),
        };
      }
      if (url.includes('/contents/tokens.ts?ref=main')) {
        return {
          ok: true,
          json: async () => ({
            content: Buffer.from(sampleFiles[1].content).toString('base64'),
          }),
        };
      }
      // Should NOT be called
      if (url.includes('/git/refs') && init?.method === 'POST') {
        branchCreationCalled = true;
      }
      if (init?.method === 'PUT') {
        commitCalled = true;
      }
      if (url.endsWith('/pulls') && init?.method === 'POST') {
        prCreationCalled = true;
      }
      return { ok: true, json: async () => ({}) };
    }) as any;

    const result = await engine.deliver({
      projectId: 'proj-scenario-1',
      repoOwner: 'acme-corp',
      repoName: 'design-tokens-repo',
      newBranchName: 'nexus/tokens-v1',
      commitMessage: 'chore(tokens): sync tokens',
      prTitle: 'Sync Tokens v1',
      prBody: 'Automated PR by Nexus',
      files: sampleFiles,
      githubToken: 'ghp_valid_test_token',
      dryRun: false,
    });

    expect(result.success).toBe(true);
    expect(result.noOp).toBe(true);
    expect(result.branchCreated).toBeNull();
    expect(result.commitSha).toBeNull();
    expect(result.pullRequestUrl).toBeNull();
    expect(result.filesCommitted).toHaveLength(0);
    expect(branchCreationCalled).toBe(false);
    expect(commitCalled).toBe(false);
    expect(prCreationCalled).toBe(false);
  });

  // Scenario 2: New token changes, no existing PR -> Expected: Create a branch and PR
  it('Scenario 2: New token changes, no existing PR -> create branch and create new PR', async () => {
    let branchCreated = false;
    let committedFiles: string[] = [];
    let prCreated = false;

    global.fetch = vi.fn().mockImplementation(async (url: string, init?: any) => {
      // Base branch ref
      if (url.includes('/git/ref/heads/main')) {
        return {
          ok: true,
          json: async () => ({ object: { sha: 'base-main-sha-001' } }),
        };
      }
      // Remote file comparison: tokens differ or do not exist
      if (url.includes('/contents/')) {
        if (!init || init.method === 'GET') {
          return { ok: false, status: 404 }; // File is new
        }
        if (init?.method === 'PUT') {
          const body = JSON.parse(init.body);
          committedFiles.push(body.message);
          return {
            ok: true,
            json: async () => ({ commit: { sha: `sha-commit-${committedFiles.length}` } }),
          };
        }
      }
      // Create branch
      if (url.includes('/git/refs') && init?.method === 'POST') {
        branchCreated = true;
        return {
          ok: true,
          json: async () => ({ ref: 'refs/heads/nexus/tokens-v1.3.0' }),
        };
      }
      // Query existing open PRs -> none found
      if (url.includes('/pulls?') && (!init || init.method === 'GET')) {
        return {
          ok: true,
          json: async () => [], // Empty array = no existing PR
        };
      }
      // Create new PR
      if (url.endsWith('/pulls') && init?.method === 'POST') {
        prCreated = true;
        return {
          ok: true,
          json: async () => ({
            html_url: 'https://github.com/acme-corp/design-tokens-repo/pull/101',
            number: 101,
          }),
        };
      }
      return { ok: true, json: async () => ({}) };
    }) as any;

    const result = await engine.deliver({
      projectId: 'proj-scenario-2',
      repoOwner: 'acme-corp',
      repoName: 'design-tokens-repo',
      newBranchName: 'nexus/tokens-v1.3.0',
      commitMessage: 'chore(tokens): release v1.3.0 tokens',
      prTitle: 'Release v1.3.0 Design Tokens',
      prBody: 'Automated release by Nexus Design OS',
      files: sampleFiles,
      githubToken: 'ghp_valid_test_token',
      dryRun: false,
    });

    expect(result.success).toBe(true);
    expect(result.noOp).toBeFalsy();
    expect(branchCreated).toBe(true);
    expect(committedFiles.length).toBe(2);
    expect(prCreated).toBe(true);
    expect(result.pullRequestUrl).toBe('https://github.com/acme-corp/design-tokens-repo/pull/101');
    expect(result.filesCommitted).toEqual(['tokens.css', 'tokens.ts']);
  });

  // Scenario 3: New token changes, existing Nexus PR -> Expected: Update existing PR
  it('Scenario 3: New token changes, existing Nexus PR -> update existing PR without duplicating', async () => {
    let duplicatePrCreated = false;
    let existingPrReused = false;

    global.fetch = vi.fn().mockImplementation(async (url: string, init?: any) => {
      // Base branch ref
      if (url.includes('/git/ref/heads/main')) {
        return {
          ok: true,
          json: async () => ({ object: { sha: 'base-main-sha-001' } }),
        };
      }
      // Target branch already exists
      if (url.includes('/git/refs') && init?.method === 'POST') {
        return {
          ok: false,
          status: 422, // Reference already exists
        };
      }
      // File commit PUT
      if (init?.method === 'PUT') {
        return {
          ok: true,
          json: async () => ({ commit: { sha: 'updated-commit-sha-456' } }),
        };
      }
      // Existing PR query returns open PR #42
      if (url.includes('/pulls?') && (!init || !init.method || init.method === 'GET')) {
        existingPrReused = true;
        return {
          ok: true,
          json: async () => [
            {
              html_url: 'https://github.com/acme-corp/design-tokens-repo/pull/42',
              number: 42,
              head: { ref: 'nexus/tokens-v1.3.0' },
            },
          ],
        };
      }
      // Creating a new PR POST should NOT be called
      if (url.endsWith('/pulls') && init?.method === 'POST') {
        duplicatePrCreated = true;
        return {
          ok: true,
          json: async () => ({ html_url: 'https://github.com/acme-corp/design-tokens-repo/pull/999' }),
        };
      }
      return { ok: true, json: async () => ({}) };
    }) as any;

    const result = await engine.deliver({
      projectId: 'proj-scenario-3',
      repoOwner: 'acme-corp',
      repoName: 'design-tokens-repo',
      newBranchName: 'nexus/tokens-v1.3.0',
      commitMessage: 'fix(tokens): amend primary hex code',
      prTitle: 'Release v1.3.0 Design Tokens',
      prBody: 'Updated design tokens body',
      files: sampleFiles,
      githubToken: 'ghp_valid_test_token',
      dryRun: false,
    });

    expect(result.success).toBe(true);
    expect(result.prUpdated).toBe(true);
    expect(result.existingPrFound).toBe(true);
    expect(existingPrReused).toBe(true);
    expect(duplicatePrCreated).toBe(false);
    expect(result.pullRequestUrl).toBe('https://github.com/acme-corp/design-tokens-repo/pull/42');
  });

  // Scenario 4: Delivery fails halfway through -> Expected: Recover without duplicating resources or losing track
  it('Scenario 4: Delivery fails halfway through -> report partial failure cleanly without silent corruption', async () => {
    let putAttempts = 0;

    global.fetch = vi.fn().mockImplementation(async (url: string, init?: any) => {
      // Base branch ref
      if (url.includes('/git/ref/heads/main')) {
        return {
          ok: true,
          json: async () => ({ object: { sha: 'base-main-sha-001' } }),
        };
      }
      // Create branch succeeds
      if (url.includes('/git/refs') && init?.method === 'POST') {
        return {
          ok: true,
          json: async () => ({ ref: 'refs/heads/nexus/failing-branch' }),
        };
      }
      // File commits: 1st file succeeds, 2nd file fails with 500 Network Drop
      if (init?.method === 'PUT') {
        putAttempts++;
        if (putAttempts === 1) {
          return {
            ok: true,
            json: async () => ({ commit: { sha: 'commit-file-1' } }),
          };
        }
        // Failure halfway
        return {
          ok: false,
          status: 500,
          statusText: 'Internal Server Error: Connection reset by peer',
        };
      }
      return { ok: true, json: async () => ({}) };
    }) as any;

    const result = await engine.deliver({
      projectId: 'proj-scenario-4',
      repoOwner: 'acme-corp',
      repoName: 'design-tokens-repo',
      newBranchName: 'nexus/failing-branch',
      commitMessage: 'chore: multi-file delivery',
      prTitle: 'PR with Halfway Failure',
      prBody: 'PR Body',
      files: sampleFiles,
      githubToken: 'ghp_valid_test_token',
      dryRun: false,
    });

    // Expect graceful failure detection
    expect(result.success).toBe(false);
    expect(result.partialFailure).toBe(true);
    expect(result.filesCommitted).toEqual(['tokens.css']);
    expect(result.pullRequestUrl).toBeNull();
    expect(result.error).toContain('Remote branch "nexus/failing-branch" has 1 of 2 files committed');
  });
});
