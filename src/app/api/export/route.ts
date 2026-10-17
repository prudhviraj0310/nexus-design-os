import { NextResponse } from 'next/server';
import { getDb } from '@/db/index';
import { tokens } from '@/db/schema';
import { FlatToken } from '@/core/tokens/types';
import { exportToCss } from '@/core/exporters/css';
import { exportToJson } from '@/core/exporters/json';
import { exportToTypeScript } from '@/core/exporters/typescript';
import { exportToTailwind, exportToTailwindV4 } from '@/core/exporters/tailwind';
import { exportToSwift } from '@/core/exporters/swift';
import { exportToKotlin } from '@/core/exporters/kotlin';
import { validateApiAuth } from '@/server/auth';
import { authorizeDesignSystem } from '@/server/governance';
import { createHash } from 'node:crypto';

function fileManifest(file: { filename: string; content: string; format: string; warnings?: string[] }) {
  return {
    filename: file.filename,
    format: file.format,
    sha256: createHash('sha256').update(file.content).digest('hex'),
    bytes: Buffer.byteLength(file.content, 'utf8'),
    warnings: file.warnings || [],
  };
}

export async function GET(request: Request) {
  try {
    const auth = validateApiAuth(request);
    if (!auth.authorized) return auth.errorResponse!;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'all';
    const prefix = searchParams.get('prefix') || 'nova';
    const themeMode = (searchParams.get('themeMode') as any) || 'both';

    const { db } = await getDb();
    const designSystemId = searchParams.get('designSystemId') || 'ds-nova-design';
    await authorizeDesignSystem(db, auth.userId, designSystemId);
    const dbTokens = await db.select().from(tokens);
    const scopedTokens = dbTokens.filter((token: any) => token.designSystemId === designSystemId);

    const flatTokens: FlatToken[] = scopedTokens.map((t: any) => ({
      name: t.name,
      path: t.path,
      category: t.category,
      type: t.type,
      rawValue: t.rawValue,
      resolvedValue: t.resolvedValue,
      isAlias: t.isAlias,
      aliasTarget: t.aliasTarget || undefined,
      isDeprecated: t.isDeprecated,
      description: t.description || undefined,
    }));

    const css = exportToCss(flatTokens, { prefix, themeMode });
    const json = exportToJson(flatTokens);
    const ts = exportToTypeScript(flatTokens);
    const tw = exportToTailwind(flatTokens, { prefix });
    const tw4 = exportToTailwindV4(flatTokens, { prefix });
    const swift = exportToSwift(flatTokens);
    const kotlin = exportToKotlin(flatTokens);

    if (format === 'css') return NextResponse.json(css);
    if (format === 'json') return NextResponse.json(json);
    if (format === 'typescript') return NextResponse.json(ts);
    if (format === 'tailwind' || format === 'tailwind-v3') return NextResponse.json(tw);
    if (format === 'tailwind4' || format === 'tailwind-v4') return NextResponse.json(tw4);
    if (format === 'swift') return NextResponse.json(swift);
    if (format === 'kotlin') return NextResponse.json(kotlin);

    return NextResponse.json({
      success: true,
      designSystemId,
      generatedAt: new Date().toISOString(),
      sourceTokenCount: flatTokens.length,
      mobile: {
        status: 'generated',
        warnings: [],
      },
      files: {
        css,
        json,
        typescript: ts,
        tailwind: tw,
        tailwindV4: tw4,
        swift,
        kotlin,
      },
      manifest: [
        fileManifest(css),
        fileManifest(json),
        fileManifest(ts),
        fileManifest(tw),
        fileManifest(tw4),
        fileManifest(swift),
        fileManifest(kotlin),
      ],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
