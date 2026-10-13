import { NextResponse } from 'next/server';
import { getDb } from '@/db/index';
import { releases, designSystems, tokens, components } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { seedDatabase } from '@/db/seed';
import { validateApiAuth } from '@/server/auth';

export async function GET() {
  try {
    const { db } = await getDb();
    let allReleases = await db.select().from(releases).orderBy(desc(releases.createdAt));

    if (allReleases.length === 0) {
      await seedDatabase();
      allReleases = await db.select().from(releases).orderBy(desc(releases.createdAt));
    }

    return NextResponse.json({
      success: true,
      totalCount: allReleases.length,
      releases: allReleases,
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
      version,
      title,
      description = '',
      changelog = '',
    } = body;

    if (!version || !title) {
      return NextResponse.json(
        { success: false, error: 'version and title are required' },
        { status: 400 }
      );
    }

    const { db } = await getDb();
    const allTokens = await db.select().from(tokens);
    const allComponents = await db.select().from(components);

    const releaseId = `rel-${version.replace(/\./g, '-')}-${Date.now().toString(36)}`;
    const designSystemId = body.designSystemId || 'ds-nova-design';

    const newRelease = {
      id: releaseId,
      designSystemId,
      version,
      title,
      description,
      tokensCount: allTokens.length,
      componentsCount: allComponents.length,
      changelog: changelog || `Automated release v${version} with ${allTokens.length} design tokens.`,
      createdAt: new Date(),
    };

    await db.transaction(async (tx: any) => {
      await tx.insert(releases).values(newRelease);

      // Update active design system version atomically
      await tx
        .update(designSystems)
        .set({ version })
        .where(eq(designSystems.id, designSystemId));
    });

    return NextResponse.json({
      success: true,
      release: newRelease,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
