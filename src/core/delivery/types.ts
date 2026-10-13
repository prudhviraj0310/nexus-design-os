import { GeneratedFile } from '../exporters/types';

export interface DeliveryRequest {
  projectId: string;
  repoOwner: string;
  repoName: string;
  baseBranch?: string; // default "main"
  newBranchName: string;
  commitMessage: string;
  prTitle: string;
  prBody: string;
  files: GeneratedFile[];
  githubToken?: string;
  dryRun?: boolean;
}

export interface DeliveryResult {
  success: boolean;
  dryRun?: boolean;
  noOp?: boolean;
  prUpdated?: boolean;
  prCreated?: boolean;
  existingPrFound?: boolean;
  pullRequestUrl?: string | null;
  branchCreated?: string | null;
  commitSha?: string | null;
  filesCommitted: string[];
  diffSummary: string;
  partialFailure?: boolean;
  error?: string;
}
