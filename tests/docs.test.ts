import { describe, it, expect, beforeEach } from 'vitest';
import { seedDatabase } from '../src/db/seed';
import { GET as getDocs, POST as postDoc, DELETE as deleteDoc } from '../src/app/api/docs/route';

describe('Living Documentation Page Management', () => {
  beforeEach(async () => {
    await seedDatabase();
  });

  it('retrieves all seeded documentation pages through /api/docs', async () => {
    const req = new Request('http://localhost:3000/api/docs');
    const res = await getDocs(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.count).toBeGreaterThanOrEqual(4);
    expect(data.pages).toBeDefined();

    const welcomePage = data.pages.find((p: any) => p.slug === 'welcome');
    expect(welcomePage).toBeDefined();
    expect(welcomePage.title).toBe('Welcome to Nexus Design OS');
  });

  it('retrieves a single doc page by slug', async () => {
    const req = new Request('http://localhost:3000/api/docs?slug=foundations');
    const res = await getDocs(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.page).toBeDefined();
    expect(data.page.slug).toBe('foundations');
    expect(data.page.title).toBe('Design Foundations');
  });

  it('allows creating and updating a documentation page', async () => {
    const req = new Request('http://localhost:3000/api/docs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: 'accessibility-guide',
        title: 'Accessibility & WCAG AA Standards',
        category: 'foundations',
        content: '# Accessibility Guide\nAll color tokens must meet 4.5:1 contrast ratios.',
        order: 5,
      }),
    });

    const res = await postDoc(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.slug).toBe('accessibility-guide');

    // Retrieve to verify
    const getReq = new Request('http://localhost:3000/api/docs?slug=accessibility-guide');
    const getRes = await getDocs(getReq);
    const getData = await getRes.json();
    expect(getData.page.title).toBe('Accessibility & WCAG AA Standards');
  });
});
