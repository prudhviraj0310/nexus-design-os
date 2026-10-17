import { DeliveryEngine, GitProvider } from './types';
import { GitHubDeliveryEngine } from './github';
import { GitLabDeliveryEngine } from './gitlab';
import { BitbucketDeliveryEngine } from './bitbucket';

export function getDeliveryEngine(provider: GitProvider = 'github'): DeliveryEngine {
  switch (provider) {
    case 'gitlab':
      return new GitLabDeliveryEngine();
    case 'bitbucket':
      return new BitbucketDeliveryEngine();
    case 'github':
    default:
      return new GitHubDeliveryEngine();
  }
}

export * from './types';
export * from './github';
export * from './gitlab';
export * from './bitbucket';
export * from './pipelines';
