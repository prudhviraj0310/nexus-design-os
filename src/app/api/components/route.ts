import { NextResponse } from 'next/server';
import { getDb } from '@/db/index';
import { components } from '@/db/schema';
import { seedDatabase } from '@/db/seed';
import { validateApiAuth } from '@/server/auth';
import { authorizeDesignSystem } from '@/server/governance';

export async function GET(request: Request) {
  try {
    const auth = validateApiAuth(request);
    if (!auth.authorized) return auth.errorResponse!;
    const designSystemId = new URL(request.url).searchParams.get('designSystemId') || 'ds-nova-design';
    const { db } = await getDb();
    await authorizeDesignSystem(db, auth.userId, designSystemId);
    let allComponents = await db.select().from(components);

    if (allComponents.length === 0) {
      await seedDatabase();
      allComponents = await db.select().from(components);
    }

    allComponents = allComponents.filter((component: any) => component.designSystemId === designSystemId);
    return NextResponse.json({
      success: true,
      count: allComponents.length,
      components: allComponents,
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
      name,
      category = 'general',
      framework = 'react',
      description,
      props = [],
      variants = [],
      codeSnippet = '',
      tokenDependencies = [],
      designSystemId = 'ds-nova-design',
    } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Component name is required' }, { status: 400 });
    }

    const { db } = await getDb();
    await authorizeDesignSystem(db, auth.userId, designSystemId);
    const id = `comp-${name.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}`;

    await db
      .insert(components)
      .values({
        id,
        designSystemId,
        name,
        category,
        framework,
        description,
        props,
        variants,
        codeSnippet,
        tokenDependencies,
        isDeprecated: false,
      })
      .onConflictDoUpdate({
        target: components.id,
        set: {
          category,
          framework,
          description,
          props,
          variants,
          codeSnippet,
          tokenDependencies,
        },
      });

    return NextResponse.json({
      success: true,
      id,
      message: `Component "${name}" saved successfully.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
