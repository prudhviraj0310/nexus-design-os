import { NextResponse } from 'next/server';
import { getDb } from '@/db/index';
import { docPages } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { seedDatabase } from '@/db/seed';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const slug = searchParams.get('slug');

    const { db } = await getDb();
    let pages = await db.select().from(docPages).orderBy(asc(docPages.order));

    if (pages.length === 0) {
      await seedDatabase();
      pages = await db.select().from(docPages).orderBy(asc(docPages.order));
    }

    if (slug) {
      const page = pages.find((p: any) => p.slug === slug);
      if (!page) {
        return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, page });
    }

    let filtered = pages;
    if (category && category !== 'all') {
      filtered = filtered.filter((p: any) => p.category === category);
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      pages: filtered,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, title, category = 'foundations', content, order = 0, isPublished = true } = body;

    if (!slug || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'slug, title, and content are required.' },
        { status: 400 }
      );
    }

    const { db } = await getDb();
    const designSystemId = body.designSystemId || 'ds-nova-design';
    const id = body.id || `doc-${slug.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}`;

    await db
      .insert(docPages)
      .values({
        id,
        designSystemId,
        slug,
        title,
        category,
        content,
        order,
        isPublished,
      })
      .onConflictDoUpdate({
        target: docPages.id,
        set: {
          title,
          category,
          content,
          order,
          isPublished,
          updatedAt: new Date(),
        },
      });

    return NextResponse.json({
      success: true,
      id,
      slug,
      title,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'id parameter is required' }, { status: 400 });
    }

    const { db } = await getDb();
    await db.delete(docPages).where(eq(docPages.id, id));

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
