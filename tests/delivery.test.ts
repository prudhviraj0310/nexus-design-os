import { describe, it, expect } from 'vitest';
import { GitHubDeliveryEngine } from '../src/core/delivery/github.js';
import { GeneratedFile } from '../src/core/exporters/types.js';

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

  it('generates reproducible diff summary and dry-run delivery result', async () => {
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
    expect(result.pullRequestUrl).toContain('https://github.com/acme-corp/design-tokens-repo/pull/');
    expect(result.branchCreated).toBe('novadesign/update-tokens-v1');
    expect(result.filesCommitted).toEqual(['tokens.css', 'tokens.ts']);
    expect(result.diffSummary).toContain('+ File: tokens.css');
    expect(result.diffSummary).toContain('+ File: tokens.ts');
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
