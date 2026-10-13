import { describe, it, expect, beforeEach } from 'vitest';
import { getDb } from '../src/db/index';
import { seedDatabase } from '../src/db/seed';
import { assets } from '../src/db/schema';
import { GET as getAssets, POST as postAsset } from '../src/app/api/assets/route';

describe('Vector Asset Management & Icon Pipeline', () => {
  beforeEach(async () => {
    await seedDatabase();
  });

  it('retrieves all seeded vector SVG icons through /api/assets', async () => {
    const req = new Request('http://localhost:3000/api/assets');
    const res = await getAssets(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.count).toBeGreaterThan(0);
    expect(data.assets).toBeDefined();

    const arrowRight = data.assets.find((a: any) => a.name === 'ArrowRight');
    expect(arrowRight).toBeDefined();
    expect(arrowRight.svgContent).toContain('<svg');
    expect(arrowRight.category).toBe('icons');
  });

  it('filters assets by search keyword', async () => {
    const req = new Request('http://localhost:3000/api/assets?q=sparkles');
    const res = await getAssets(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.assets.length).toBeGreaterThanOrEqual(1);
    expect(data.assets[0].name).toBe('Sparkles');
  });

  it('allows registering a new vector SVG asset', async () => {
    const newSvg = '<svg viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/></svg>';
    const req = new Request('http://localhost:3000/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'CustomTriangle',
        category: 'icons',
        svgContent: newSvg,
        tags: ['geometry', 'shape'],
      }),
    });

    const res = await postAsset(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.id).toContain('ast-customtriangle');
  });
});
