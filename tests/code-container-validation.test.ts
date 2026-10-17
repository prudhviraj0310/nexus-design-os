import { describe, expect, it } from 'vitest';
import { CodeContainerValidationError, validateCodeContainerManifest } from '../src/core/containers/validation';

const manifest = {
  name: 'Nova Components',
  version: '1.2.3',
  framework: 'react',
  entrypoint: 'dist/index.js',
  dependencies: ['react'],
};

describe('code container manifest validation', () => {
  it('accepts a safe manifest and HTTPS artifact', () => {
    expect(validateCodeContainerManifest(manifest, { artifactUrl: 'https://cdn.example.test/container.tgz' })).toEqual(manifest);
  });

  it('rejects traversal entrypoints and unsupported frameworks', () => {
    expect(() => validateCodeContainerManifest({ ...manifest, entrypoint: '../index.js' })).toThrow(CodeContainerValidationError);
    expect(() => validateCodeContainerManifest({ ...manifest, framework: 'node' })).toThrow(CodeContainerValidationError);
  });

  it('rejects unsafe production artifact URLs', () => {
    expect(() => validateCodeContainerManifest(manifest, { artifactUrl: 'http://localhost:3000/container.tgz', production: true })).toThrow(CodeContainerValidationError);
    expect(() => validateCodeContainerManifest(manifest, { artifactUrl: 'http://cdn.example.test/container.tgz' })).toThrow(CodeContainerValidationError);
  });
});
