import { NextResponse } from 'next/server';
import { getDb } from '@/db/index';
import { tokens } from '@/db/schema';
import { AuditEngine } from '@/core/audit/engine';
import { FlatToken } from '@/core/tokens/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { codeContent, filePath = 'Component.tsx' } = body;

    if (!codeContent) {
      return NextResponse.json({ success: false, error: 'codeContent is required' }, { status: 400 });
    }

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
      extensions: t.extensions || undefined,
    }));

    const auditEngine = new AuditEngine();
    const report = auditEngine.auditFile({
      filePath,
      content: codeContent,
      tokens: flatTokens,
    });

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
