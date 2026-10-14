import { DeliveryRequest, DeliveryResult } from './types';

export class GitHubDeliveryEngine {
  public async deliver(request: DeliveryRequest): Promise<DeliveryResult> {
    const {
      repoOwner,
      repoName,
      baseBranch = 'main',
      newBranchName: rawBranchName,
      commitMessage,
      prTitle,
      prBody,
      files,
      githubToken,
      dryRun,
    } = request;

    // Safety: ensure head branch is never identical to base branch
    const newBranchName =
      !rawBranchName || rawBranchName.trim() === '' || rawBranchName === baseBranch
        ? 'nexus/tokens-sync'
        : rawBranchName;

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
      const headers: Record<string, string> = {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Nexus-Design-OS/1.0.0',
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

      // 2. Pre-flight Check: Check if all files are already identical on baseBranch
      let allFilesMatchBase = true;
      for (const file of files) {
        try {
          const baseFileCheck = await fetch(
            `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${file.filename}?ref=${baseBranch}`,
            { headers }
          );
          if (baseFileCheck.ok) {
            const baseFileInfo = (await baseFileCheck.json()) as { content?: string; encoding?: string };
            if (baseFileInfo.content) {
              const remoteClean = Buffer.from(baseFileInfo.content, 'base64').toString('utf8').trim();
              const localClean = file.content.trim();
              if (remoteClean !== localClean) {
                allFilesMatchBase = false;
                break;
              }
            } else {
              allFilesMatchBase = false;
              break;
            }
          } else {
            allFilesMatchBase = false;
            break;
          }
        } catch {
          allFilesMatchBase = false;
          break;
        }
      }

      // If everything is already identical on base branch, avoid unnecessary PR spam
      if (allFilesMatchBase && files.length > 0) {
        return {
          success: true,
          dryRun: false,
          noOp: true,
          pullRequestUrl: null,
          branchCreated: null,
          commitSha: null,
          filesCommitted: [],
          diffSummary: `All ${files.length} design token files are already up-to-date with branch "${baseBranch}". No changes detected.`,
        };
      }

      // 3. Create or verify new branch
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
        // 422 means branch already exists, which is expected for idempotent updates
        throw new Error(`Failed to create branch "${newBranchName}": ${createBranchRes.status}`);
      }

      // 4. Commit files sequentially with change detection
      let latestCommitSha = baseSha;
      for (const file of files) {
        // Check if file exists on target branch to get its SHA and check content
        let fileSha: string | undefined;
        let isAlreadyCurrent = false;

        const fileCheck = await fetch(
          `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${file.filename}?ref=${newBranchName}`,
          { headers }
        );
        if (fileCheck.ok) {
          const fileInfo = (await fileCheck.json()) as { sha: string; content?: string };
          fileSha = fileInfo.sha;
          if (fileInfo.content) {
            const remoteContent = Buffer.from(fileInfo.content, 'base64').toString('utf8').trim();
            if (remoteContent === file.content.trim()) {
              isAlreadyCurrent = true;
            }
          }
        }

        if (isAlreadyCurrent) {
          // File is already identical on branch; skip redundant commit
          committedFiles.push(file.filename);
          continue;
        }

        let putRes: Response | null = null;
        let commitError: string | null = null;
        const maxPutRetries = 2; // up to 3 attempts total

        for (let attempt = 0; attempt <= maxPutRetries; attempt++) {
          try {
            putRes = await fetch(
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

            if (putRes.ok) {
              commitError = null;
              break;
            }

            // Retry on transient rate limiting (429) or server errors (5xx)
            if ((putRes.status === 429 || putRes.status >= 500) && attempt < maxPutRetries) {
              const retryAfter = putRes.headers.get('Retry-After');
              const delayMs = retryAfter ? Math.min(parseInt(retryAfter, 10) * 1000, 5000) : (attempt + 1) * 200;
              await new Promise((resolve) => setTimeout(resolve, delayMs));
              continue;
            }

            commitError = `${putRes.status} ${putRes.statusText}`;
            break;
          } catch (err: any) {
            commitError = err.message || String(err);
            if (attempt < maxPutRetries) {
              await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 200));
              continue;
            }
          }
        }

        if (!putRes || !putRes.ok) {
          return {
            success: false,
            dryRun: false,
            partialFailure: committedFiles.length > 0,
            pullRequestUrl: null,
            branchCreated: newBranchName,
            commitSha: null,
            filesCommitted: committedFiles,
            diffSummary,
            error: `Failed to commit file "${file.filename}" (${commitError || 'Unknown Error'}). Remote branch "${newBranchName}" has ${committedFiles.length} of ${files.length} files committed.`,
          };
        }

        committedFiles.push(file.filename);
        const putData = (await putRes.json()) as { commit: { sha: string } };
        latestCommitSha = putData.commit.sha;
      }

      // 5. Pull Request Creation or Reuse (Zero PR duplication)
      // Check if an open PR already exists for this branch
      let openPrUrl: string | null = null;
      try {
        const existingPullsRes = await fetch(
          `https://api.github.com/repos/${repoOwner}/${repoName}/pulls?head=${repoOwner}:${newBranchName}&state=open&base=${baseBranch}`,
          { headers }
        );
        if (existingPullsRes.ok) {
          const existingPulls = (await existingPullsRes.json()) as Array<{ html_url: string }>;
          if (Array.isArray(existingPulls) && existingPulls.length > 0) {
            openPrUrl = existingPulls[0].html_url;
          }
        }
      } catch {
        // Continue to create PR if check fails
      }

      if (openPrUrl) {
        return {
          success: true,
          dryRun: false,
          prUpdated: true,
          existingPrFound: true,
          pullRequestUrl: openPrUrl,
          branchCreated: newBranchName,
          commitSha: latestCommitSha,
          filesCommitted: committedFiles,
          diffSummary: `${diffSummary}\n\nReused existing open pull request: ${openPrUrl}`,
        };
      }

      // Create new Pull Request if none exists
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
        // If 422 indicates PR already exists, attempt to retrieve the existing PR
        if (prRes.status === 422) {
          const retryExisting = await fetch(
            `https://api.github.com/repos/${repoOwner}/${repoName}/pulls?head=${repoOwner}:${newBranchName}&state=open`,
            { headers }
          );
          if (retryExisting.ok) {
            const pulls = (await retryExisting.json()) as Array<{ html_url: string }>;
            if (pulls.length > 0) {
              return {
                success: true,
                dryRun: false,
                prUpdated: true,
                existingPrFound: true,
                pullRequestUrl: pulls[0].html_url,
                branchCreated: newBranchName,
                commitSha: latestCommitSha,
                filesCommitted: committedFiles,
                diffSummary: `${diffSummary}\n\nReused existing open pull request: ${pulls[0].html_url}`,
              };
            }
          }
        }

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
        prCreated: true,
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
