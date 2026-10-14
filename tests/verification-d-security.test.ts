import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { POST as postAsset } from '../src/app/api/assets/route';
import { POST as postDoc, DELETE as deleteDoc } from '../src/app/api/docs/route';
import { POST as postComponent } from '../src/app/api/components/route';
import { GET as getHealth } from '../src/app/api/health/route';
import { GET as getExport } from '../src/app/api/export/route';
import { DELETE as deleteGithubConnect } from '../src/app/api/github/connect/route';
import { POST as postAudit } from '../src/app/api/audit/route';
import { GET as getGithubRepos } from '../src/app/api/github/repos/route';
import { resetEnvCache } from '../src/server/env';

describe('Verification D: Security Hardening, Endpoint Protection & SVG Sanitization', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    resetEnvCache();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    resetEnvCache();
  });

  describe('Mutating Endpoint Protection', () => {
    beforeEach(() => {
      // Configure auth enforcement
      process.env.NOVA_API_KEY = 'secret-api-key-test-long-enough-32-chars';
      process.env.NOVA_ADMIN_PASSWORD = 'super-secret-admin-pass-123';
      resetEnvCache();
    });

    it('rejects unauthenticated POST /api/assets with 401', async () => {
      const req = new Request('http://localhost:3000/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'ShieldIcon', svgContent: '<svg></svg>' }),
      });

      const res = await postAsset(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.code).toBe('UNAUTHORIZED');
    });

    it('rejects unauthenticated POST /api/docs with 401', async () => {
      const req = new Request('http://localhost:3000/api/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: 'test', title: 'Test', content: 'Body' }),
      });

      const res = await postDoc(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.code).toBe('UNAUTHORIZED');
    });

    it('rejects unauthenticated DELETE /api/docs with 401', async () => {
      const req = new Request('http://localhost:3000/api/docs?id=doc-123', {
        method: 'DELETE',
      });

      const res = await deleteDoc(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.code).toBe('UNAUTHORIZED');
    });

    it('rejects unauthenticated POST /api/components with 401', async () => {
      const req = new Request('http://localhost:3000/api/components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Banner' }),
      });

      const res = await postComponent(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.code).toBe('UNAUTHORIZED');
    });

    it('rejects unauthenticated DELETE /api/github/connect with 401', async () => {
      const req = new Request('http://localhost:3000/api/github/connect', {
        method: 'DELETE',
      });

      const res = await deleteGithubConnect(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.code).toBe('UNAUTHORIZED');
    });

    it('rejects unauthenticated POST /api/audit with 401', async () => {
      const req = new Request('http://localhost:3000/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'const a = 1;' }),
      });

      const res = await postAudit(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.code).toBe('UNAUTHORIZED');
    });

    it('rejects unauthenticated GET /api/github/repos with 401', async () => {
      const req = new Request('http://localhost:3000/api/github/repos');

      const res = await getGithubRepos(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.code).toBe('UNAUTHORIZED');
    });

    it('authorizes requests with valid x-api-key', async () => {
      const req = new Request('http://localhost:3000/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'secret-api-key-test-long-enough-32-chars',
        },
        body: JSON.stringify({
          name: 'SecureIcon',
          svgContent: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>',
        }),
      });

      const res = await postAsset(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('authorizes requests with valid admin cookie', async () => {
      const req = new Request('http://localhost:3000/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: 'nexus_admin_token=super-secret-admin-pass-123',
        },
        body: JSON.stringify({
          name: 'CookieIcon',
          svgContent: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>',
        }),
      });

      const res = await postAsset(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('authorizes DELETE /api/github/connect with valid x-api-key', async () => {
      const req = new Request('http://localhost:3000/api/github/connect', {
        method: 'DELETE',
        headers: {
          'x-api-key': 'secret-api-key-test-long-enough-32-chars',
        },
      });

      const res = await deleteGithubConnect(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.connected).toBe(false);
    });

    it('authorizes POST /api/audit with valid x-api-key', async () => {
      const req = new Request('http://localhost:3000/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'secret-api-key-test-long-enough-32-chars',
        },
        body: JSON.stringify({ code: 'const primaryColor = "#3b82f6";' }),
      });

      const res = await postAudit(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.score).toBeDefined();
    });
  });

  describe('Vector SVG Sanitization & Malicious Markup Rejection', () => {
    it('rejects SVGs containing <script> tags', async () => {
      const maliciousSvg = '<svg viewBox="0 0 24 24"><script>alert(document.cookie)</script><rect/></svg>';
      const req = new Request('http://localhost:3000/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Malicious1', svgContent: maliciousSvg }),
      });

      const res = await postAsset(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Unsafe markup');
    });

    it('rejects SVGs containing <foreignObject> wrappers', async () => {
      const maliciousSvg = '<svg viewBox="0 0 24 24"><foreignObject><body><script>bad()</script></body></foreignObject></svg>';
      const req = new Request('http://localhost:3000/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Malicious2', svgContent: maliciousSvg }),
      });

      const res = await postAsset(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Unsafe markup');
    });

    it('rejects SVGs containing inline event handlers like onload or onerror', async () => {
      const maliciousSvg = '<svg viewBox="0 0 24 24" onload="alert(1)"><circle cx="12" cy="12" r="10"/></svg>';
      const req = new Request('http://localhost:3000/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Malicious3', svgContent: maliciousSvg }),
      });

      const res = await postAsset(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Unsafe markup');
    });

    it('rejects SVGs containing javascript: URI attributes', async () => {
      const maliciousSvg = '<svg viewBox="0 0 24 24"><a href="javascript:alert(1)"><circle cx="12" cy="12" r="10"/></a></svg>';
      const req = new Request('http://localhost:3000/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Malicious4', svgContent: maliciousSvg }),
      });

      const res = await postAsset(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Unsafe markup');
    });
  });

  describe('Zero Credential Leakage in Public APIs', () => {
    it('verifies /api/health and /api/export never expose secrets or keys', async () => {
      process.env.NOVA_ADMIN_PASSWORD = 'super-secret-admin-pass-123';
      process.env.NOVA_SESSION_SECRET = 'super-secret-session-key-32-bytes-long';
      process.env.GITHUB_TOKEN = 'ghp_super_secret_github_personal_token';
      process.env.FIGMA_TOKEN = 'figd_super_secret_figma_token';
      resetEnvCache();

      const healthRes = await getHealth();
      const healthText = await healthRes.text();

      expect(healthText).not.toContain('super-secret-admin-pass');
      expect(healthText).not.toContain('super-secret-session-key');
      expect(healthText).not.toContain('ghp_super_secret');
      expect(healthText).not.toContain('figd_super_secret');

      const exportReq = new Request('http://localhost:3000/api/export?format=json');
      const exportRes = await getExport(exportReq);
      const exportText = await exportRes.text();

      expect(exportText).not.toContain('super-secret-admin-pass');
      expect(exportText).not.toContain('ghp_super_secret');
      expect(exportText).not.toContain('figd_super_secret');
    });
  });
});
