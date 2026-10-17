import { DeliveryEngine, DeliveryRequest, DeliveryResult } from './types';

export class BitbucketDeliveryEngine implements DeliveryEngine {
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
      bitbucketToken = process.env.BITBUCKET_TOKEN,
      bitbucketUsername = process.env.BITBUCKET_USERNAME,
      bitbucketAppPassword = process.env.BITBUCKET_APP_PASSWORD,
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
    diffLines.push(`--- Bitbucket Diff Summary for ${repoOwner}/${repoName} [Branch: ${newBranchName}] ---`);
    for (const f of preparedFiles) {
      diffLines.push(`+ File: ${f.filename} (${f.content.length} bytes, format: ${f.format})`);
    }
    const diffSummary = diffLines.join('\n');

    // 1. Dry run handling
    if (dryRun) {
      return {
        success: true,
        provider: 'bitbucket',
        dryRun: true,
        pullRequestUrl: null,
        branchCreated: null,
        commitSha: null,
        filesCommitted: preparedFiles.map((f) => f.filename),
        diffSummary,
      };
    }

    // 2. Reject missing credentials for live operations
    const hasAuth = bitbucketToken || (bitbucketUsername && bitbucketAppPassword);
    if (!hasAuth) {
      return {
        success: false,
        provider: 'bitbucket',
        dryRun: false,
        filesCommitted: [],
        diffSummary,
        error:
          'Missing Bitbucket credentials: Live delivery requires BITBUCKET_TOKEN or BITBUCKET_USERNAME and BITBUCKET_APP_PASSWORD.',
      };
    }

    const authHeader = bitbucketToken
      ? `Bearer ${bitbucketToken}`
      : `Basic ${Buffer.from(`${bitbucketUsername}:${bitbucketAppPassword}`).toString('base64')}`;

    const headers: Record<string, string> = {
      Authorization: authHeader,
      'User-Agent': 'Nexus-Design-OS/1.0.0',
    };

    const apiBase = 'https://api.bitbucket.org/2.0';
    const repoPath = `${encodeURIComponent(repoOwner)}/${encodeURIComponent(repoName)}`;

    try {
      // Step A: Verify base branch and get target commit hash
      const branchRes = await fetch(
        `${apiBase}/repositories/${repoPath}/refs/branches/${encodeURIComponent(baseBranch)}`,
        { headers }
      );

      if (!branchRes.ok) {
        throw new Error(
          `Failed to find base branch "${baseBranch}": ${branchRes.status} ${branchRes.statusText}`
        );
      }

      const branchData = (await branchRes.json()) as { target?: { hash?: string } };
      const baseCommitHash = branchData.target?.hash;

      // Step B: Submit commit using multipart form data to /src endpoint
      const formData = new FormData();
      formData.append('branch', newBranchName);
      if (baseCommitHash) {
        formData.append('parents', baseCommitHash);
      }
      formData.append('message', commitMessage);

      for (const file of preparedFiles) {
        formData.append(file.filename, new Blob([file.content]), file.filename);
      }

      const commitRes = await fetch(`${apiBase}/repositories/${repoPath}/src`, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'User-Agent': 'Nexus-Design-OS/1.0.0',
        },
        body: formData,
      });

      if (!commitRes.ok && commitRes.status !== 201 && commitRes.status !== 200) {
        const errText = await commitRes.text().catch(() => '');
        throw new Error(`Bitbucket commit failed (${commitRes.status}): ${errText || commitRes.statusText}`);
      }

      // Step C: Check for existing open pull request
      let pullRequestUrl: string | null = null;
      let prCreated = false;
      let prUpdated = false;

      const prQueryUrl = `${apiBase}/repositories/${repoPath}/pullrequests?q=source.branch.name="${encodeURIComponent(
        newBranchName
      )}"+AND+state="OPEN"`;

      const prCheckRes = await fetch(prQueryUrl, { headers });
      if (prCheckRes.ok) {
        const prListData = (await prCheckRes.json()) as { values?: Array<{ links?: { html?: { href?: string } } }> };
        if (prListData.values && prListData.values.length > 0) {
          pullRequestUrl = prListData.values[0].links?.html?.href || null;
          prUpdated = true;
        }
      }

      if (!pullRequestUrl) {
        // Create new Pull Request
        const prPayload = {
          title: prTitle,
          description: prBody,
          source: {
            branch: {
              name: newBranchName,
            },
          },
          destination: {
            branch: {
              name: baseBranch,
            },
          },
          close_source_branch: true,
        };

        const createPrRes = await fetch(`${apiBase}/repositories/${repoPath}/pullrequests`, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(prPayload),
        });

        if (createPrRes.ok || createPrRes.status === 201) {
          const prData = (await createPrRes.json()) as { links?: { html?: { href?: string } } };
          pullRequestUrl = prData.links?.html?.href || null;
          prCreated = true;
        } else {
          const prErr = await createPrRes.text().catch(() => '');
          console.warn(`[BitbucketDeliveryEngine] Warning: PR creation returned status ${createPrRes.status}:`, prErr);
        }
      }

      return {
        success: true,
        provider: 'bitbucket',
        dryRun: false,
        prCreated,
        prUpdated,
        pullRequestUrl,
        branchCreated: newBranchName,
        commitSha: null,
        filesCommitted: preparedFiles.map((f) => f.filename),
        diffSummary,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'bitbucket',
        dryRun: false,
        filesCommitted: [],
        diffSummary,
        error: err.message || 'Bitbucket delivery encountered an unexpected error.',
      };
    }
  }
}
