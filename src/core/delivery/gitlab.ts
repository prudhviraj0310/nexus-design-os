import { DeliveryEngine, DeliveryRequest, DeliveryResult } from './types';

export class GitLabDeliveryEngine implements DeliveryEngine {
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
      gitlabToken = process.env.GITLAB_TOKEN,
      gitlabBaseUrl = process.env.GITLAB_BASE_URL || 'https://gitlab.com/api/v4',
      dryRun,
      directoryPurge = false,
      targetDirectory = '',
    } = request;

    // Safety: ensure head branch is never identical to base branch
    const newBranchName =
      !rawBranchName || rawBranchName.trim() === '' || rawBranchName === baseBranch
        ? 'nexus/tokens-sync'
        : rawBranchName.trim();

    // Adjust filenames with targetDirectory prefix if supplied
    const preparedFiles = files.map((f) => ({
      ...f,
      filename: targetDirectory
        ? `${targetDirectory.replace(/\/+$/, '')}/${f.filename.replace(/^\/+/, '')}`
        : f.filename,
    }));

    // Build diff summary
    const diffLines: string[] = [];
    diffLines.push(`--- GitLab Diff Summary for ${repoOwner}/${repoName} [Branch: ${newBranchName}] ---`);
    for (const f of preparedFiles) {
      diffLines.push(`+ File: ${f.filename} (${f.content.length} bytes, format: ${f.format})`);
    }
    const diffSummary = diffLines.join('\n');

    // 1. Dry run handling
    if (dryRun) {
      return {
        success: true,
        provider: 'gitlab',
        dryRun: true,
        pullRequestUrl: null,
        branchCreated: null,
        commitSha: null,
        filesCommitted: preparedFiles.map((f) => f.filename),
        diffSummary,
      };
    }

    // 2. Reject missing credentials for live operations
    if (!gitlabToken) {
      return {
        success: false,
        provider: 'gitlab',
        dryRun: false,
        filesCommitted: [],
        diffSummary,
        error: 'Missing GITLAB_TOKEN: Live delivery requires valid GitLab access credentials.',
      };
    }

    const projectId = encodeURIComponent(`${repoOwner}/${repoName}`);
    const apiBase = gitlabBaseUrl.replace(/\/+$/, '');

    const headers: Record<string, string> = {
      'PRIVATE-TOKEN': gitlabToken,
      'Content-Type': 'application/json',
      'User-Agent': 'Nexus-Design-OS/1.0.0',
    };

    try {
      // Step A: Verify base branch exists
      const baseBranchRes = await fetch(
        `${apiBase}/projects/${projectId}/repository/branches/${encodeURIComponent(baseBranch)}`,
        { headers }
      );

      if (!baseBranchRes.ok) {
        throw new Error(
          `Failed to find base branch "${baseBranch}": ${baseBranchRes.status} ${baseBranchRes.statusText}`
        );
      }

      // Step B: Check existing files in project on base branch to determine action (create vs update)
      const actions: Array<{
        action: 'create' | 'update' | 'delete';
        file_path: string;
        content?: string;
      }> = [];

      for (const file of preparedFiles) {
        const fileCheckUrl = `${apiBase}/projects/${projectId}/repository/files/${encodeURIComponent(
          file.filename
        )}?ref=${encodeURIComponent(baseBranch)}`;

        const checkRes = await fetch(fileCheckUrl, { headers });
        if (checkRes.ok) {
          actions.push({
            action: 'update',
            file_path: file.filename,
            content: file.content,
          });
        } else {
          actions.push({
            action: 'create',
            file_path: file.filename,
            content: file.content,
          });
        }
      }

      // Step C: Optional directory purge: check target directory for stale files to delete
      const purgedFiles: string[] = [];
      if (directoryPurge && targetDirectory) {
        try {
          const treeUrl = `${apiBase}/projects/${projectId}/repository/tree?path=${encodeURIComponent(
            targetDirectory
          )}&ref=${encodeURIComponent(baseBranch)}&recursive=true`;
          const treeRes = await fetch(treeUrl, { headers });
          if (treeRes.ok) {
            const treeItems = (await treeRes.json()) as Array<{ path: string; type: string }>;
            const incomingPaths = new Set(preparedFiles.map((f) => f.filename));

            for (const item of treeItems) {
              if (item.type === 'blob' && !incomingPaths.has(item.path)) {
                actions.push({
                  action: 'delete',
                  file_path: item.path,
                });
                purgedFiles.push(item.path);
              }
            }
          }
        } catch {
          // Graceful fallback if tree lookup is not accessible
        }
      }

      // Step D: Create atomic commit with branch creation via Commits API
      const commitRes = await fetch(`${apiBase}/projects/${projectId}/repository/commits`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          branch: newBranchName,
          start_branch: baseBranch,
          commit_message: commitMessage,
          actions,
        }),
      });

      if (!commitRes.ok) {
        const errJson = await commitRes.json().catch(() => ({}));
        throw new Error(
          `GitLab commit failed (${commitRes.status}): ${errJson.message || commitRes.statusText}`
        );
      }

      const commitData = (await commitRes.json()) as { id: string };
      const commitSha = commitData.id;

      // Step E: Create or update Merge Request
      let pullRequestUrl: string | null = null;
      let mrCreated = false;
      let mrUpdated = false;

      // Check for existing open MR
      const existingMrUrl = `${apiBase}/projects/${projectId}/merge_requests?source_branch=${encodeURIComponent(
        newBranchName
      )}&target_branch=${encodeURIComponent(baseBranch)}&state=opened`;

      const existingMrRes = await fetch(existingMrUrl, { headers });
      if (existingMrRes.ok) {
        const existingMrs = (await existingMrRes.json()) as Array<{ iid: number; web_url: string }>;
        if (existingMrs.length > 0) {
          const mr = existingMrs[0];
          pullRequestUrl = mr.web_url;
          mrUpdated = true;

          // Update MR description/title
          await fetch(`${apiBase}/projects/${projectId}/merge_requests/${mr.iid}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              title: prTitle,
              description: prBody,
            }),
          });
        }
      }

      if (!pullRequestUrl) {
        // Create new MR
        const newMrRes = await fetch(`${apiBase}/projects/${projectId}/merge_requests`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            source_branch: newBranchName,
            target_branch: baseBranch,
            title: prTitle,
            description: prBody,
            remove_source_branch: true,
          }),
        });

        if (newMrRes.ok) {
          const newMrData = (await newMrRes.json()) as { web_url: string };
          pullRequestUrl = newMrData.web_url;
          mrCreated = true;
        } else {
          const mrErr = await newMrRes.json().catch(() => ({}));
          console.warn(`[GitLabDeliveryEngine] Warning: MR creation failed:`, mrErr);
        }
      }

      return {
        success: true,
        provider: 'gitlab',
        dryRun: false,
        prCreated: mrCreated,
        prUpdated: mrUpdated,
        pullRequestUrl,
        branchCreated: newBranchName,
        commitSha,
        filesCommitted: preparedFiles.map((f) => f.filename),
        filesPurged: purgedFiles,
        diffSummary,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'gitlab',
        dryRun: false,
        filesCommitted: [],
        diffSummary,
        error: err.message || 'GitLab delivery encountered an unexpected error.',
      };
    }
  }
}
