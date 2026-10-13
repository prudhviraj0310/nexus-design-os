import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GitHubDeliveryEngine } from '../src/core/delivery/github';
import { GeneratedFile } from '../src/core/exporters/types';

describe('Continuous Delivery: GitHub Engine', () => {
  const engine = new GitHubDeliveryEngine();

  const mockFiles: GeneratedFile[] = [
    {
      filename: 'tokens.css',
      content: ':root { --color-brand-primary: #3b82f6; }',
      format: 'css',
    },
    {
      filename: 'tokens.ts',
      content: 'export const tokens = { primary: "#3b82f6" };',
      format: 'typescript',
    },
  ];

  it('generates reproducible diff summary and dry-run delivery result without fake URLs or commit SHAs', async () => {
    const result = await engine.deliver({
      projectId: 'proj-core-web',
      repoOwner: 'acme-corp',
      repoName: 'design-tokens-repo',
      newBranchName: 'novadesign/update-tokens-v1',
      commitMessage: 'chore(tokens): sync tokens from NovaDesign',
      prTitle: 'Sync Design Tokens v1.2.0',
      prBody: 'Automated PR by NovaDesign Platform.',
      files: mockFiles,
      dryRun: true,
    });

    expect(result.success).toBe(true);
    expect(result.dryRun).toBe(true);
    // Real external identifiers MUST be null/omitted for dry-run simulation
    expect(result.pullRequestUrl).toBeNull();
    expect(result.commitSha).toBeNull();
    expect(result.branchCreated).toBeNull();
    expect(result.filesCommitted).toEqual(['tokens.css', 'tokens.ts']);
    expect(result.diffSummary).toContain('+ File: tokens.css');
    expect(result.diffSummary).toContain('+ File: tokens.ts');
  });

  it('rejects live delivery when credentials are absent without silent write or simulation', async () => {
    const result = await engine.deliver({
      projectId: 'proj-core-web',
      repoOwner: 'acme-corp',
      repoName: 'design-tokens-repo',
      newBranchName: 'novadesign/branch',
      commitMessage: 'commit message',
      prTitle: 'PR Title',
      prBody: 'PR Body',
      files: mockFiles,
      dryRun: false,
      githubToken: undefined,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Missing GITHUB_TOKEN');
  });

  it('accurately reports partial failures and dirty remote state for multi-file commits', async () => {
    const originalFetch = global.fetch;
    let putCount = 0;

    global.fetch = vi.fn().mockImplementation(async (url: string, init?: any) => {
      // 1. Base branch ref
      if (url.includes('/git/ref/heads/')) {
        return {
          ok: true,
          json: async () => ({ object: { sha: 'base-commit-sha-123' } }),
        };
      }
      // 2. Create branch ref
      if (url.includes('/git/refs')) {
        return {
          ok: true,
          json: async () => ({ ref: 'refs/heads/new-branch' }),
        };
      }
      // 3. File existence check
      if (init?.method === undefined || init?.method === 'GET') {
        return { ok: false, status: 404 };
      }
      // 4. File commit PUT
      if (init?.method === 'PUT') {
        putCount++;
        if (putCount === 1) {
          // File 1 succeeds
          return {
            ok: true,
            json: async () => ({ commit: { sha: 'commit-sha-file-1' } }),
          };
        }
        // File 2 fails!
        return {
          ok: false,
          status: 403,
          statusText: 'Forbidden - Rate Limited or Permission Denied',
        };
      }
      return { ok: true, json: async () => ({}) };
    }) as any;

    try {
      const result = await engine.deliver({
        projectId: 'proj-core-web',
        repoOwner: 'acme-corp',
        repoName: 'design-tokens-repo',
        newBranchName: 'novadesign/partial-branch',
        commitMessage: 'chore: multi-file update',
        prTitle: 'PR',
        prBody: 'Body',
        files: mockFiles,
        githubToken: 'ghp_valid_mock_token_123',
        dryRun: false,
      });

      expect(result.success).toBe(false);
      expect(result.partialFailure).toBe(true);
      expect(result.filesCommitted).toEqual(['tokens.css']);
      expect(result.error).toContain('Remote branch "novadesign/partial-branch" has 1 of 2 files committed');
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('fails safely and reports detailed error if unauthorized remote API call fails', async () => {
    const result = await engine.deliver({
      projectId: 'proj-core-web',
      repoOwner: 'acme-corp',
      repoName: 'non-existent-repo-12345',
      newBranchName: 'novadesign/branch',
      commitMessage: 'commit message',
      prTitle: 'PR Title',
      prBody: 'PR Body',
      files: mockFiles,
      githubToken: 'ghp_invalid_token_for_test',
      dryRun: false, // Attempt actual network request
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
