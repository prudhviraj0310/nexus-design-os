import { describe, it, expect } from 'vitest';
import { FigmaClient } from '../src/core/figma/client';
import { mapFigmaVariablesToDTCG, rgbaToHex } from '../src/core/figma/mapper';
import { computeTokenDiff } from '../src/core/figma/diff';

describe('Figma Variables Integration Engine', () => {
  it('converts RGBA float values to correct hex color', () => {
    expect(rgbaToHex(0.23, 0.51, 0.96, 1)).toBe('#3b82f5');
    expect(rgbaToHex(1, 1, 1, 1)).toBe('#ffffff');
    expect(rgbaToHex(0, 0, 0, 1)).toBe('#000000');
  });

  it('maps Figma Variables response to W3C DTCG tokens and resolves aliases', () => {
    const client = new FigmaClient();
    const payload = client.getFixtureVariables('sample-file-key');

    const mapped = mapFigmaVariablesToDTCG(payload, 'Light');
    expect(mapped.length).toBeGreaterThan(0);

    const cyanToken = mapped.find((t) => t.path === 'color.primitive.cyan.500');
    expect(cyanToken).toBeDefined();
    expect(cyanToken?.category).toBe('color');
    expect(cyanToken?.resolvedValue.startsWith('#')).toBe(true);

    const aliasToken = mapped.find((t) => t.path === 'color.brand.accent');
    expect(aliasToken).toBeDefined();
    expect(aliasToken?.isAlias).toBe(true);
    expect(aliasToken?.aliasTarget).toBe('color.primitive.cyan.500');

    const spacingToken = mapped.find((t) => t.path === 'spacing.2xl');
    expect(spacingToken).toBeDefined();
    expect(spacingToken?.resolvedValue).toBe('48px');
  });

  it('computes accurate diff comparing incoming tokens against existing database tokens', () => {
    const client = new FigmaClient();
    const payload = client.getFixtureVariables('sample-file-key');
    const incoming = mapFigmaVariablesToDTCG(payload, 'Light');

    const existing: any[] = [
      {
        path: 'color.primitive.cyan.500',
        rawValue: '#000000', // Modified!
        resolvedValue: '#000000',
        category: 'color',
      },
    ];

    const diff = computeTokenDiff(existing, incoming);
    const cyanDiff = diff.find((d) => d.path === 'color.primitive.cyan.500');
    const accentDiff = diff.find((d) => d.path === 'color.brand.accent');

    expect(cyanDiff?.status).toBe('modified');
    expect(accentDiff?.status).toBe('added');
  });

  it('rejects live synchronization if figmaToken is omitted', async () => {
    const client = new FigmaClient();
    await expect(
      client.getVariables({
        fileKey: 'sample-file',
        dryRun: false,
      })
    ).rejects.toThrow('Figma API token is required for live variable synchronization');
  });

  it('returns fixture variables safely when dryRun is true', async () => {
    const client = new FigmaClient();
    const result = await client.getVariables({
      fileKey: 'sample-file',
      dryRun: true,
    });
    expect(result.status).toBe(200);
    expect(result.meta?.variables).toBeDefined();
  });
});
