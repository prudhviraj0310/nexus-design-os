import { NextResponse } from 'next/server';
import { getDb } from '@/db/index';
import { tokens } from '@/db/schema';
import { seedDatabase } from '@/db/seed';
import { eq } from 'drizzle-orm';
import { validateTokens } from '@/core/tokens/validator';
import { FlatToken } from '@/core/tokens/types';
import { validateApiAuth } from '@/server/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const dsId = searchParams.get('designSystemId') || searchParams.get('ds');

    const { db } = await getDb();
    let allTokens = await db.select().from(tokens);

    if (allTokens.length === 0) {
      await seedDatabase();
      allTokens = await db.select().from(tokens);
    }

    let filtered = allTokens;
    if (dsId) {
      filtered = filtered.filter((t: any) => t.designSystemId === dsId);
    }
    if (category && category !== 'all') {
      filtered = filtered.filter((t: any) => t.category === category);
    }

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

export async function POST(request: Request) {
  try {
    const auth = validateApiAuth(request);
    if (!auth.authorized) return auth.errorResponse!;

    const body = await request.json();
    const {
      path,
      name,
      category,
      type = 'color',
      rawValue,
      description,
      isDeprecated = false,
      designSystemId = 'ds-nova-design',
    } = body;

    if (!path || !rawValue || !category) {
      return NextResponse.json(
        { success: false, error: 'path, rawValue, and category are required' },
        { status: 400 }
      );
    }

    const isAlias = rawValue.startsWith('{') && rawValue.endsWith('}');
    const aliasTarget = isAlias ? rawValue.slice(1, -1).trim() : null;

    const { db } = await getDb();
    const tokenId = `tok-${path.replace(/\./g, '-')}`;

    // Validate token format
    const tempToken: FlatToken = {
      name: name || path.split('.').pop() || path,
      path,
      category,
      type,
      rawValue,
      resolvedValue: rawValue,
      isAlias,
      aliasTarget: aliasTarget || undefined,
    };

    const validation = validateTokens([tempToken]);
    if (!validation.valid && !isAlias) {
      return NextResponse.json(
        { success: false, error: validation.errors[0].message },
        { status: 400 }
      );
    }

    const persistentId = body.persistentId || `pid-${path.replace(/\./g, '-')}`;
    const versionId = body.versionId || `ver-draft-${designSystemId}`;
    const brandId = body.brandId || `brand-default-${designSystemId}`;
    const originSourceId = body.originSourceId || null;

    await db
      .insert(tokens)
      .values({
        id: tokenId,
        persistentId,
        designSystemId,
        versionId,
        brandId,
        originSourceId,
        name: tempToken.name,
        path,
        category,
        type,
        rawValue,
        resolvedValue: rawValue,
        isAlias,
        aliasTarget,
        isDeprecated,
        description: description || null,
      })
      .onConflictDoUpdate({
        target: tokens.id,
        set: {
          rawValue,
          resolvedValue: rawValue,
          isAlias,
          aliasTarget,
          category,
          type,
          isDeprecated,
          description: description || null,
        },
      });

    return NextResponse.json({
      success: true,
      token: tempToken,
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
    const tokenId = searchParams.get('id');

    if (!tokenId) {
      return NextResponse.json({ success: false, error: 'Token ID required' }, { status: 400 });
    }

    const { db } = await getDb();
    await db.delete(tokens).where(eq(tokens.id, tokenId));

    return NextResponse.json({ success: true, deletedId: tokenId });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
