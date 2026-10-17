import { describe, expect, it, vi } from 'vitest';
import { DesignSystemClient } from '../packages/mobile-sdk/src/index';

describe('mobile SDK artifact consumption', () => {
  it('fetches and caches a complete generated bundle', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      designSystemId: 'ds-test',
      generatedAt: new Date().toISOString(),
      sourceTokenCount: 1,
      files: { json: { filename: 'tokens.json', content: '{}' }, swift: { filename: 'Tokens.swift', content: '' }, kotlin: { filename: 'Tokens.kt', content: '' } },
      manifest: [{ filename: 'tokens.json', sha256: 'a'.repeat(64), bytes: 2 }],
    }), { status: 200 }));
    const client = new DesignSystemClient({ baseUrl: 'https://design.example.test', designSystemId: 'ds-test', fetch });
    const bundle = await client.refresh();
    expect(bundle.designSystemId).toBe('ds-test');
    expect(client.cached).toBe(bundle);
    expect(String(fetch.mock.calls[0][0])).toContain('format=all');
  });
});
