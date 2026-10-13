import { GeneratedFile } from '../exporters/types.js';

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
  pullRequestUrl?: string;
  branchCreated?: string;
  commitSha?: string;
  filesCommitted: string[];
  diffSummary: string;
  error?: string;
}
