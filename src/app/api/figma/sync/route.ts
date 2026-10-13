import { NextResponse } from 'next/server';
import { getDb } from '@/db/index';
import { tokens } from '@/db/schema';
import { FigmaClient } from '@/core/figma/client';
import { mapFigmaVariablesToDTCG } from '@/core/figma/mapper';
import { computeTokenDiff } from '@/core/figma/diff';
import { resolveTokenAliases } from '@/core/tokens/resolver';
import { FlatToken } from '@/core/tokens/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fileKey = 'figma-sample-file-key',
      figmaToken,
      modeName = 'Light',
      applyChanges = false,
      dryRun = false,
    } = body;

    const client = new FigmaClient();
    const rawFigmaPayload = await client.getVariables({
      fileKey,
      figmaToken,
      modeName,
      dryRun,
    });

    const mappedTokens = mapFigmaVariablesToDTCG(rawFigmaPayload, modeName);
    const { tokens: resolvedIncoming } = resolveTokenAliases(mappedTokens);

    const { db } = await getDb();
    const existingDbTokens = await db.select().from(tokens);
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
    if (applyChanges) {
      for (const token of resolvedIncoming) {
        const tokenId = `tok-${token.path.replace(/\./g, '-')}`;
        await db
          .insert(tokens)
          .values({
            id: tokenId,
            designSystemId: 'ds-nova-design',
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
    }

    return NextResponse.json({
      success: true,
      fileKey,
      modeName,
      totalVariablesFound: mappedTokens.length,
      diff,
      applied: applyChanges,
      appliedCount,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
