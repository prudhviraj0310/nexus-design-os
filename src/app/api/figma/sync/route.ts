import { NextResponse } from 'next/server';
import { getDb } from '@/db/index';
import { tokens } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { FigmaClient } from '@/core/figma/client';
import { mapFigmaVariablesToDTCG } from '@/core/figma/mapper';
import { computeTokenDiff } from '@/core/figma/diff';
import { resolveTokenAliases } from '@/core/tokens/resolver';
import { FlatToken } from '@/core/tokens/types';
import { validateApiAuth } from '@/server/auth';

export async function POST(request: Request) {
  try {
    const auth = validateApiAuth(request);
    if (!auth.authorized) return auth.errorResponse!;

    const body = await request.json();
    const fileKey = body.fileKey || 'figma-sample-file-key';
    const figmaToken = body.figmaToken || body.personalAccessToken || process.env.FIGMA_TOKEN;
    const modeName = body.modeName || body.mode || 'Light';
    const dryRun = Boolean(body.dryRun);
    // Dry-run guarantees no persistence occurs
    const applyChanges = dryRun ? false : (body.applyChanges !== undefined ? Boolean(body.applyChanges) : true);
    const designSystemId = body.designSystemId || 'ds-nova-design';

    const client = new FigmaClient();
    const rawFigmaPayload = await client.getVariables({
      fileKey,
      figmaToken,
      modeName,
      dryRun,
    });

    const mappedTokens = mapFigmaVariablesToDTCG(rawFigmaPayload, modeName);
    if (!mappedTokens || mappedTokens.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No variables found in Figma payload for mode "${modeName}". Sync aborted to prevent accidental data loss.`,
        },
        { status: 400 }
      );
    }

    const { tokens: resolvedIncoming, cycles, unresolvedAliases } = resolveTokenAliases(mappedTokens);

    const { db } = await getDb();
    // Strictly scope selection to current design system / project
    const existingDbTokens = await db
      .select()
      .from(tokens)
      .where(eq(tokens.designSystemId, designSystemId));

    const flatExisting: FlatToken[] = existingDbTokens.map((t: any) => ({
      name: t.name,
      path: t.path,
      category: t.category,
      type: t.type,
      rawValue: t.rawValue,
      resolvedValue: t.resolvedValue,
      isAlias: t.isAlias,
      aliasTarget: t.aliasTarget || undefined,
      isDeprecated: t.isDeprecated,
    }));

    const diff = computeTokenDiff(flatExisting, resolvedIncoming);

    let appliedCount = 0;
    let deletedCount = 0;

    if (applyChanges) {
      await db.transaction(async (tx: any) => {
        // 1. Delete tokens that were removed in the incoming snapshot
        const removedDiff = diff.filter((d) => d.status === 'removed');
        for (const item of removedDiff) {
          await tx
            .delete(tokens)
            .where(and(eq(tokens.designSystemId, designSystemId), eq(tokens.path, item.path)));
          deletedCount++;
        }

        // 2. Upsert resolved incoming tokens
        for (const token of resolvedIncoming) {
          const tokenId = `tok-${token.path.replace(/\./g, '-')}`;
          await tx
            .insert(tokens)
            .values({
              id: tokenId,
              designSystemId,
              name: token.name,
              path: token.path,
              category: token.category,
              type: token.type,
              rawValue: token.rawValue,
              resolvedValue: token.resolvedValue,
              isAlias: token.isAlias,
              aliasTarget: token.aliasTarget || null,
              description: token.description || null,
            })
            .onConflictDoUpdate({
              target: tokens.id,
              set: {
                rawValue: token.rawValue,
                resolvedValue: token.resolvedValue,
                isAlias: token.isAlias,
                aliasTarget: token.aliasTarget || null,
                description: token.description || null,
              },
            });
          appliedCount++;
        }
      });
    }

    return NextResponse.json({
      success: true,
      fileKey,
      modeName,
      designSystemId,
      totalVariablesFound: mappedTokens.length,
      diff,
      applied: applyChanges,
      dryRun,
      appliedCount,
      deletedCount,
      cycles: cycles || [],
      unresolvedAliases: unresolvedAliases || [],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
