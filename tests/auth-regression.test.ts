import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateApiAuth } from '../src/server/auth';
import { resetEnvCache } from '../src/server/env';
import { POST as figmaSyncPost } from '../src/app/api/figma/sync/route';
import { GET as mcpGet, POST as mcpPost } from '../src/app/api/mcp/route';
import { POST as deliverPost } from '../src/app/api/deliver/route';
import { POST as releasesPost } from '../src/app/api/releases/route';
import { POST as tokensPost, DELETE as tokensDelete } from '../src/app/api/tokens/route';

describe('Phase 1 Security: Server-Side Authentication & Authorization Regression', () => {
  const TEST_VALID_KEY = 'test-secret-key-12345678901234';

  beforeEach(() => {
    process.env.NOVA_API_KEY = TEST_VALID_KEY;
    resetEnvCache();
  });

  afterEach(() => {
    delete process.env.NOVA_API_KEY;
    delete process.env.NEXUS_API_KEY;
    (process.env as any).NODE_ENV = 'test';
    resetEnvCache();
  });

  it('enforces authentication on POST /api/figma/sync', async () => {
    // Missing credentials
    const reqMissing = new Request('http://localhost:3000/api/figma/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileKey: 'test' }),
    });
    const resMissing = await figmaSyncPost(reqMissing);
    expect(resMissing.status).toBe(401);
    const bodyMissing = await resMissing.json();
    expect(bodyMissing.code).toBe('UNAUTHORIZED');

    // Invalid credentials
    const reqInvalid = new Request('http://localhost:3000/api/figma/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer wrong-api-key',
      },
      body: JSON.stringify({ fileKey: 'test' }),
    });
    const resInvalid = await figmaSyncPost(reqInvalid);
    expect(resInvalid.status).toBe(401);

    // Valid credentials (dry-run to avoid live Figma call)
    const reqValid = new Request('http://localhost:3000/api/figma/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_VALID_KEY}`,
      },
      body: JSON.stringify({ fileKey: 'test', dryRun: true }),
    });
    const resValid = await figmaSyncPost(reqValid);
    expect(resValid.status).toBe(200);
    const bodyValid = await resValid.json();
    expect(bodyValid.success).toBe(true);
  });

  it('enforces authentication on GET and POST /api/mcp', async () => {
    // GET missing
    const getMissing = new Request('http://localhost:3000/api/mcp', { method: 'GET' });
    const resGetMissing = await mcpGet(getMissing);
    expect(resGetMissing.status).toBe(401);

    // GET valid
    const getValid = new Request('http://localhost:3000/api/mcp', {
      method: 'GET',
      headers: { Authorization: `Bearer ${TEST_VALID_KEY}` },
    });
    const resGetValid = await mcpGet(getValid);
    expect(resGetValid.status).toBe(200);

    // POST missing: JSON-RPC tools/list
    const postMissing = new Request('http://localhost:3000/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'tools/list' }),
    });
    const resPostMissing = await mcpPost(postMissing);
    expect(resPostMissing.status).toBe(401);

    // POST missing: direct tool mutation propose_token_changes
    const postToolMissing = new Request('http://localhost:3000/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toolName: 'propose_token_changes',
        args: { tokenPath: 'color.test', rawValue: '#000000' },
      }),
    });
    const resPostToolMissing = await mcpPost(postToolMissing);
    expect(resPostToolMissing.status).toBe(401);

    // POST valid: JSON-RPC tools/list
    const postValid = new Request('http://localhost:3000/api/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_VALID_KEY}`,
      },
      body: JSON.stringify({ method: 'tools/list' }),
    });
    const resPostValid = await mcpPost(postValid);
    expect(resPostValid.status).toBe(200);
  });

  it('enforces authentication on POST /api/deliver, POST /api/releases, and /api/tokens', async () => {
    // Deliver
    const deliverReq = new Request('http://localhost:3000/api/deliver', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect((await deliverPost(deliverReq)).status).toBe(401);

    // Releases
    const releasesReq = new Request('http://localhost:3000/api/releases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: '1.0.0', title: 'Test' }),
    });
    expect((await releasesPost(releasesReq)).status).toBe(401);

    // Tokens POST
    const tokensReq = new Request('http://localhost:3000/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'test', rawValue: '#fff', category: 'color' }),
    });
    expect((await tokensPost(tokensReq)).status).toBe(401);

    // Tokens DELETE
    const tokensDelReq = new Request('http://localhost:3000/api/tokens?id=tok-1', {
      method: 'DELETE',
    });
    expect((await tokensDelete(tokensDelReq)).status).toBe(401);
  });

  it('fails closed in production mode when authentication configuration is absent', () => {
    delete process.env.NOVA_API_KEY;
    delete process.env.NEXUS_API_KEY;
    delete process.env.NOVA_ADMIN_PASSWORD;
    (process.env as any).NODE_ENV = 'production';
    resetEnvCache();

    const openReq = new Request('http://localhost:3000/api/figma/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const check = validateApiAuth(openReq);
    expect(check.authorized).toBe(false);
    expect(check.errorResponse?.status).toBe(401);
  });

  it('rejects unauthorized repository targets in /api/deliver via server-side allowlist', async () => {
    const unauthReq = new Request('http://localhost:3000/api/deliver', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_VALID_KEY}`,
      },
      body: JSON.stringify({
        repoOwner: 'malicious-org',
        repoName: 'exfiltrate-tokens',
        dryRun: true,
      }),
    });

    const res = await deliverPost(unauthReq);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.code).toBe('UNAUTHORIZED_TARGET_REPOSITORY');
    expect(body.error).toContain('not in the authorized delivery allowlist');
  });
});
