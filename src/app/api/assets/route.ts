import { NextResponse } from 'next/server';
import { getDb } from '@/db/index';
import { assets } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { seedDatabase } from '@/db/seed';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('q')?.toLowerCase();

    const { db } = await getDb();
    let allAssets = await db.select().from(assets);

    if (allAssets.length === 0) {
      await seedDatabase();
      allAssets = await db.select().from(assets);
    }

    let filtered = allAssets;
    if (category && category !== 'all') {
      filtered = filtered.filter((a: any) => a.category === category);
    }
    if (query) {
      filtered = filtered.filter(
        (a: any) =>
          a.name.toLowerCase().includes(query) ||
          (Array.isArray(a.tags) && a.tags.some((t: string) => t.toLowerCase().includes(query)))
      );
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      assets: filtered,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, svgContent, category = 'icons', tags = [], width = 24, height = 24 } = body;

    if (!name || !svgContent) {
      return NextResponse.json(
        { success: false, error: 'Name and svgContent are required.' },
        { status: 400 }
      );
    }

    const { db } = await getDb();
    const id = `ast-${name.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}-${Date.now()}`;
    const designSystemId = body.designSystemId || 'ds-nova-design';

    await db.insert(assets).values({
      id,
      designSystemId,
      name,
      category,
      svgContent,
      tags,
      width,
      height,
    });

    return NextResponse.json({
      success: true,
      id,
      message: `Asset "${name}" registered successfully.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
