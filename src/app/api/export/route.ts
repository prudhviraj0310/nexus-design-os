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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'all';
    const prefix = searchParams.get('prefix') || 'nova';
    const themeMode = (searchParams.get('themeMode') as any) || 'both';

    const { db } = await getDb();
    const dbTokens = await db.select().from(tokens);

    const flatTokens: FlatToken[] = dbTokens.map((t: any) => ({
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
      files: {
        css,
        json,
        typescript: ts,
        tailwind: tw,
        tailwindV4: tw4,
        swift,
        kotlin,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
