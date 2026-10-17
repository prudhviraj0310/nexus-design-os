import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getDb } from '../src/db/index';
import { designSystems, tokens, components, releases } from '../src/db/schema';
import { validateApiAuth } from '../src/server/auth';
import { resetEnvCache } from '../src/server/env';
import { GET as tokensGet, POST as tokensPost } from '../src/app/api/tokens/route';
import { GET as componentsGet } from '../src/app/api/components/route';
import { GET as releasesGet } from '../src/app/api/releases/route';
import { GET as authGet, POST as authPost } from '../src/app/api/auth/route';

describe('AWS Deployment & Testing Readiness Verification', () => {
  const TEST_KEY = 'aws-test-key-998877665544332211';

  beforeEach(() => {
    process.env.NOVA_API_KEY = TEST_KEY;
    resetEnvCache();
  });

  afterEach(() => {
    delete process.env.NOVA_API_KEY;
    delete process.env.NEXUS_API_KEY;
    delete process.env.NOVA_DEV_MODE;
    delete process.env.ALLOW_ANONYMOUS_DEV;
    (process.env as any).NODE_ENV = 'test';
    resetEnvCache();
  });

  it('bootstraps clean database automatically on GET /api/tokens without 500 error', async () => {
    const req = new Request('http://localhost:3000/api/tokens', {
      headers: { 'x-api-key': TEST_KEY },
    });

    const res = await tokensGet(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.tokens).toBeDefined();
    expect(data.tokens.length).toBeGreaterThan(0);
  });

  it('bootstraps clean database on GET /api/components without 500 error', async () => {
    const req = new Request('http://localhost:3000/api/components', {
      headers: { 'x-api-key': TEST_KEY },
    });

    const res = await componentsGet(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.components).toBeDefined();
    expect(data.components.length).toBeGreaterThan(0);
  });

  it('bootstraps clean database on GET /api/releases without 500 error', async () => {
    const req = new Request('http://localhost:3000/api/releases', {
      headers: { 'x-api-key': TEST_KEY },
    });

    const res = await releasesGet(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.releases).toBeDefined();
  });

  it('authorizes requests with query parameter ?apiKey=... for easy dev team sharing', async () => {
    const req = new Request(`http://localhost:3000/api/tokens?apiKey=${TEST_KEY}`);
    const auth = validateApiAuth(req);
    expect(auth.authorized).toBe(true);
    expect(auth.userId).toBe('api-client');

    const res = await tokensGet(req);
    expect(res.status).toBe(200);
  });

  it('supports NOVA_DEV_MODE bypass for AWS staging / dev-team environments', async () => {
    process.env.NOVA_DEV_MODE = 'true';
    const unauthReq = new Request('http://localhost:3000/api/tokens');
    const auth = validateApiAuth(unauthReq);
    expect(auth.authorized).toBe(true);
    expect(auth.userId).toBe('dev-user');

    const res = await tokensGet(unauthReq);
    expect(res.status).toBe(200);
  });

  it('provides dedicated /api/auth login endpoint with cookies', async () => {
    // 1. GET auth status check
    const statusReq = new Request('http://localhost:3000/api/auth');
    const statusRes = await authGet(statusReq);
    expect(statusRes.status).toBe(200);
    const statusBody = await statusRes.json();
    expect(statusBody.success).toBe(true);
    expect(statusBody.authRequired).toBe(true);

    // 2. POST invalid credentials
    const invalidReq = new Request('http://localhost:3000/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: 'wrong-key' }),
    });
    const invalidRes = await authPost(invalidReq);
    expect(invalidRes.status).toBe(401);

    // 3. POST valid credentials
    const validReq = new Request('http://localhost:3000/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: TEST_KEY }),
    });
    const validRes = await authPost(validReq);
    expect(validRes.status).toBe(200);
    const validBody = await validRes.json();
    expect(validBody.authenticated).toBe(true);
    expect(validRes.headers.get('set-cookie')).toContain('nexus_api_key');
  });
});
