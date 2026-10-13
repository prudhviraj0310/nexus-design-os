import { NextResponse } from 'next/server';
import { getDb } from '@/db/index';
import { designSystems, tokens } from '@/db/schema';
import { loadEnv } from '@/server/env';

export async function GET() {
  const startTime = Date.now();
  const { env, issues } = loadEnv();

  try {
    const { db } = await getDb();
    const [ds] = await db.select().from(designSystems).limit(1);
    const tokenCount = (await db.select().from(tokens)).length;

    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      status: issues.length === 0 ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
      latencyMs,
      database: {
        driver: process.env.DATABASE_URL ? 'postgresql-pool' : 'pglite-embedded',
        connected: true,
        activeDesignSystem: ds?.name || 'none',
        tokensCount: tokenCount,
      },
      environment: {
        nodeEnv: env.NODE_ENV,
        issues: issues.length > 0 ? issues : undefined,
      },
      version: '0.2.0',
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: err.message,
        database: { connected: false },
      },
      { status: 503 }
    );
  }
}
