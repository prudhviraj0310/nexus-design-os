import { GeneratedFile } from '../exporters/types';

export type GitProvider = 'github' | 'gitlab' | 'bitbucket';

export interface DeliveryRequest {
  projectId: string;
  provider?: GitProvider; // default "github"
  repoOwner: string;
  repoName: string;
  baseBranch?: string; // default "main"
  newBranchName: string;
  commitMessage: string;
  prTitle: string;
  prBody: string;
  files: GeneratedFile[];

  // Provider-specific credentials
  githubToken?: string;
  gitlabToken?: string;
  gitlabBaseUrl?: string; // default "https://gitlab.com/api/v4"
  bitbucketToken?: string;
  bitbucketUsername?: string;
  bitbucketAppPassword?: string;

  // Options
  dryRun?: boolean;
  directoryPurge?: boolean; // When true, purge stale generated files in target folder
  targetDirectory?: string; // Optional subpath prefix e.g. "tokens/"
}

export interface DeliveryResult {
  success: boolean;
  provider?: GitProvider;
  dryRun?: boolean;
  noOp?: boolean;
  prUpdated?: boolean;
  prCreated?: boolean;
  existingPrFound?: boolean;
  pullRequestUrl?: string | null;
  branchCreated?: string | null;
  commitSha?: string | null;
  filesCommitted: string[];
  filesPurged?: string[];
  diffSummary: string;
  partialFailure?: boolean;
  error?: string;
}

export interface DeliveryEngine {
  deliver(request: DeliveryRequest): Promise<DeliveryResult>;
}
