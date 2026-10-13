import { NextResponse } from 'next/server';
import { getDb } from '@/db/index';
import { components } from '@/db/schema';
import { seedDatabase } from '@/db/seed';

export async function GET() {
  try {
    const { db } = await getDb();
    let allComponents = await db.select().from(components);

    if (allComponents.length === 0) {
      await seedDatabase();
      allComponents = await db.select().from(components);
    }

    return NextResponse.json({
      success: true,
      count: allComponents.length,
      components: allComponents,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
