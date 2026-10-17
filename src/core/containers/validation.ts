import { createHash } from 'node:crypto';

export type CodeContainerManifest = {
  name?: unknown;
  version?: unknown;
  framework?: unknown;
  entrypoint?: unknown;
  components?: unknown;
  dependencies?: unknown;
  artifact?: {
    sha256?: unknown;
    sizeBytes?: unknown;
  };
};

export class CodeContainerValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CodeContainerValidationError';
  }
}

const VERSION_PATTERN = /^[0-9]+\.[0-9]+\.[0-9]+(?:[-+][0-9A-Za-z.-]+)?$/;
const SAFE_FRAMEWORKS = new Set(['react', 'web-components']);

export function validateCodeContainerManifest(
  input: unknown,
  options: { artifactUrl?: string | null; production?: boolean } = {},
): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new CodeContainerValidationError('manifest must be a JSON object.');
  }

  const manifest = input as CodeContainerManifest;
  if (typeof manifest.name !== 'string' || manifest.name.trim().length < 1 || manifest.name.length > 120) {
    throw new CodeContainerValidationError('manifest.name must be a non-empty string of at most 120 characters.');
  }
  if (typeof manifest.version !== 'string' || !VERSION_PATTERN.test(manifest.version)) {
    throw new CodeContainerValidationError('manifest.version must be a semantic version.');
  }
  if (typeof manifest.framework !== 'string' || !SAFE_FRAMEWORKS.has(manifest.framework)) {
    throw new CodeContainerValidationError('manifest.framework is not supported.');
  }
  if (typeof manifest.entrypoint !== 'string' || !/^[A-Za-z0-9_./-]+$/.test(manifest.entrypoint) || manifest.entrypoint.includes('..')) {
    throw new CodeContainerValidationError('manifest.entrypoint must be a safe relative path.');
  }
  if (manifest.dependencies !== undefined && (!Array.isArray(manifest.dependencies) || manifest.dependencies.some((value) => typeof value !== 'string'))) {
    throw new CodeContainerValidationError('manifest.dependencies must be an array of package names.');
  }
  if (manifest.artifact !== undefined) {
    if (typeof manifest.artifact !== 'object' || manifest.artifact === null) {
      throw new CodeContainerValidationError('manifest.artifact must be an object.');
    }
    if (manifest.artifact.sha256 !== undefined && (typeof manifest.artifact.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(manifest.artifact.sha256))) {
      throw new CodeContainerValidationError('manifest.artifact.sha256 must be a lowercase SHA-256 digest.');
    }
    if (manifest.artifact.sizeBytes !== undefined && (typeof manifest.artifact.sizeBytes !== 'number' || !Number.isInteger(manifest.artifact.sizeBytes) || manifest.artifact.sizeBytes < 1 || manifest.artifact.sizeBytes > 250 * 1024 * 1024)) {
      throw new CodeContainerValidationError('manifest.artifact.sizeBytes must be an integer between 1 and 250 MB.');
    }
  }

  if (options.artifactUrl) {
    let url: URL;
    try {
      url = new URL(options.artifactUrl);
    } catch {
      throw new CodeContainerValidationError('artifactUrl must be an absolute URL.');
    }
    const localHost = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && !options.production && localHost)) {
      throw new CodeContainerValidationError('artifactUrl must use HTTPS.');
    }
    if (options.production && localHost) {
      throw new CodeContainerValidationError('local artifact URLs are not allowed in production.');
    }
  }

  return input as Record<string, unknown>;
}

export function sha256Hex(content: Uint8Array): string {
  return createHash('sha256').update(content).digest('hex');
}
