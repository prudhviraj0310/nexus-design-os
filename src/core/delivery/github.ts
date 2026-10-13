import { DeliveryRequest, DeliveryResult } from './types';

export class GitHubDeliveryEngine {
  public async deliver(request: DeliveryRequest): Promise<DeliveryResult> {
    const {
      repoOwner,
      repoName,
      baseBranch = 'main',
      newBranchName,
      commitMessage,
      prTitle,
      prBody,
      files,
      githubToken,
      dryRun,
    } = request;

    // Build diff summary
    const diffLines: string[] = [];
    diffLines.push(`--- Diff Summary for ${repoOwner}/${repoName} [Branch: ${newBranchName}] ---`);
    for (const f of files) {
      diffLines.push(`+ File: ${f.filename} (${f.content.length} bytes, format: ${f.format})`);
    }
    const diffSummary = diffLines.join('\n');

    // 1. Handle Dry Run explicitly: never fabricate fake remote URLs or commit SHAs
    if (dryRun) {
      return {
        success: true,
        dryRun: true,
        pullRequestUrl: null,
        branchCreated: null,
        commitSha: null,
        filesCommitted: files.map((f) => f.filename),
        diffSummary,
      };
    }

    // 2. Reject missing credentials for live operations
    if (!githubToken) {
      return {
        success: false,
        dryRun: false,
        filesCommitted: [],
        diffSummary,
        error: 'Missing GITHUB_TOKEN: Live delivery requires valid GitHub credentials.',
      };
    }

    const committedFiles: string[] = [];

    try {
      const headers = {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'NovaDesign-Platform/0.1.0',
        'Content-Type': 'application/json',
      };

      // 1. Get base branch SHA
      const refRes = await fetch(
        `https://api.github.com/repos/${repoOwner}/${repoName}/git/ref/heads/${baseBranch}`,
        { headers }
      );

      if (!refRes.ok) {
        throw new Error(`Failed to get base branch "${baseBranch}": ${refRes.status} ${refRes.statusText}`);
      }

      const refData = (await refRes.json()) as { object: { sha: string } };
      const baseSha = refData.object.sha;

      // 2. Create new branch
      const createBranchRes = await fetch(
        `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ref: `refs/heads/${newBranchName}`,
            sha: baseSha,
          }),
        }
      );

      if (!createBranchRes.ok && createBranchRes.status !== 422) {
        // 422 may mean branch already exists, which we can tolerate if updating
        throw new Error(`Failed to create branch "${newBranchName}": ${createBranchRes.status}`);
      }

      // 3. Commit files sequentially with partial-failure tracking
      let latestCommitSha = baseSha;
      for (const file of files) {
        // Check if file exists to get its SHA for update
        let fileSha: string | undefined;
        const fileCheck = await fetch(
          `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${file.filename}?ref=${newBranchName}`,
          { headers }
        );
        if (fileCheck.ok) {
          const fileInfo = (await fileCheck.json()) as { sha: string };
          fileSha = fileInfo.sha;
        }

        const putRes = await fetch(
          `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${file.filename}`,
          {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              message: `${commitMessage}: ${file.filename}`,
              content: Buffer.from(file.content).toString('base64'),
              branch: newBranchName,
              ...(fileSha ? { sha: fileSha } : {}),
            }),
          }
        );

        if (!putRes.ok) {
          return {
            success: false,
            dryRun: false,
            partialFailure: committedFiles.length > 0,
            filesCommitted: committedFiles,
            diffSummary,
            error: `Failed to commit file "${file.filename}" (${putRes.status} ${putRes.statusText}). Remote branch "${newBranchName}" has ${committedFiles.length} of ${files.length} files committed.`,
          };
        }

        committedFiles.push(file.filename);
        const putData = (await putRes.json()) as { commit: { sha: string } };
        latestCommitSha = putData.commit.sha;
      }

      // 4. Create Pull Request
      const prRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/pulls`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: prTitle,
          body: prBody,
          head: newBranchName,
          base: baseBranch,
        }),
      });

      if (!prRes.ok) {
        return {
          success: false,
          dryRun: false,
          partialFailure: true,
          filesCommitted: committedFiles,
          diffSummary,
          error: `Files committed to branch "${newBranchName}" successfully, but PR creation failed (${prRes.status} ${prRes.statusText}).`,
        };
      }

      const prData = (await prRes.json()) as { html_url: string };

      return {
        success: true,
        dryRun: false,
        pullRequestUrl: prData.html_url,
        branchCreated: newBranchName,
        commitSha: latestCommitSha,
        filesCommitted: committedFiles,
        diffSummary,
      };
    } catch (err: any) {
      return {
        success: false,
        dryRun: false,
        partialFailure: committedFiles.length > 0,
        filesCommitted: committedFiles,
        diffSummary,
        error: err.message || String(err),
      };
    }
  }
}
