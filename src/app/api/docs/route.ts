import { NextResponse } from 'next/server';
import { getDb } from '@/db/index';
import { docPages } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { seedDatabase } from '@/db/seed';
import { validateApiAuth } from '@/server/auth';
import { authorizeDesignSystem, hasWorkspacePermission } from '@/server/governance';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const slug = searchParams.get('slug');

    const { db } = await getDb();
    const designSystemId = searchParams.get('designSystemId') || 'ds-nova-design';
    const auth = validateApiAuth(request);
    if (!auth.authorized) return auth.errorResponse!;
    const authorization = await authorizeDesignSystem(db, auth.userId, designSystemId);
    let pages = await db.select().from(docPages).orderBy(asc(docPages.order));
    const canEditDocs = hasWorkspacePermission(authorization.principal.role, 'docs:edit');
    pages = pages.filter((page: any) => page.designSystemId === designSystemId && (page.isPublished || canEditDocs));

    if (pages.length === 0) {
      await seedDatabase({ db });
      pages = await db.select().from(docPages).orderBy(asc(docPages.order));
      pages = pages.filter((page: any) => page.designSystemId === designSystemId && (page.isPublished || canEditDocs));
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
    const auth = validateApiAuth(request);
    if (!auth.authorized) return auth.errorResponse!;

    const body = await request.json();
    const { slug, title, category = 'foundations', order = 0, isPublished = true } = body;
    let content = body.content;
    let blocks = body.blocks;

    if (!blocks && content) {
      const { markdownToBlocks } = await import('@/core/docs/blocks');
      blocks = markdownToBlocks(content);
    } else if (blocks && !content) {
      const { blocksToMarkdown } = await import('@/core/docs/blocks');
      content = blocksToMarkdown(blocks);
    }

    if (!slug || !title || (!content && !blocks)) {
      return NextResponse.json(
        { success: false, error: 'slug, title, and content or blocks are required.' },
        { status: 400 }
      );
    }

    const { db } = await getDb();
    const designSystemId = body.designSystemId || 'ds-nova-design';
    await authorizeDesignSystem(db, auth.userId, designSystemId);
    const id = body.id || `doc-${slug.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}`;

    await db
      .insert(docPages)
      .values({
        id,
        designSystemId,
        slug,
        title,
        category,
        content: content || '',
        blocks: blocks || null,
        order,
        isPublished,
      })
      .onConflictDoUpdate({
        target: docPages.id,
        set: {
          title,
          category,
          content: content || '',
          blocks: blocks || null,
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
    const auth = validateApiAuth(request);
    if (!auth.authorized) return auth.errorResponse!;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'id parameter is required' }, { status: 400 });
    }

    const { db } = await getDb();
    const page = await db.select().from(docPages).where(eq(docPages.id, id)).limit(1);
    if (!page[0]) return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    await authorizeDesignSystem(db, auth.userId, page[0].designSystemId);
    await db.delete(docPages).where(eq(docPages.id, id));

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
