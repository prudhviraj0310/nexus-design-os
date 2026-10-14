import { NextResponse } from 'next/server';
import { getDb } from '@/db/index';
import { tokens } from '@/db/schema';
import { AuditEngine } from '@/core/audit/engine';
import { FlatToken } from '@/core/tokens/types';
import { validateApiAuth } from '@/server/auth';

export async function POST(request: Request) {
  try {
    const auth = validateApiAuth(request);
    if (!auth.authorized) return auth.errorResponse!;

    const body = await request.json();
    const codeContent = body.codeContent || body.code;
    const filePath = body.filePath || body.filename || 'Component.tsx';

    if (!codeContent) {
      return NextResponse.json({ success: false, error: 'codeContent or code is required' }, { status: 400 });
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

    const score = Math.max(0, 100 - report.errorCount * 25 - report.warningCount * 10);

    return NextResponse.json({
      success: true,
      score,
      totalFindings: report.totalFindings,
      errorCount: report.errorCount,
      warningCount: report.warningCount,
      findings: report.findings,
      report,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
