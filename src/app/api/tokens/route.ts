import { NextResponse } from 'next/server';
import { getDb } from '@/db/index';
import { tokens } from '@/db/schema';
import { seedDatabase } from '@/db/seed';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const { db } = await getDb();
    let allTokens = await db.select().from(tokens);

    if (allTokens.length === 0) {
      await seedDatabase();
      allTokens = await db.select().from(tokens);
    }

    const filtered = category && category !== 'all'
      ? allTokens.filter((t: any) => t.category === category)
      : allTokens;

    return NextResponse.json({
      success: true,
      totalCount: allTokens.length,
      filteredCount: filtered.length,
      tokens: filtered,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
