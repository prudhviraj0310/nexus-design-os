import { NextResponse } from 'next/server';
import { getDb } from '@/db/index';
import { dataSources, syncJobs, webhookEvents } from '@/db/schema';
import { enqueueJob } from '@/core/jobs/queue';
import { eq } from 'drizzle-orm';
import { createHmac, timingSafeEqual } from 'node:crypto';

function verifyWebhook(provider: string, rawBody: string, request: Request): boolean {
  const secret = process.env[`${provider.toUpperCase()}_WEBHOOK_SECRET`] || process.env.NOVA_WEBHOOK_SECRET;
  if (!secret) return process.env.NODE_ENV !== 'production';
  const supplied = request.headers.get('x-webhook-signature') ||
    request.headers.get('x-hub-signature-256') ||
    request.headers.get('x-gitlab-token');
  if (!supplied) return false;
  if (provider === 'gitlab') return supplied === secret;
  const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;
  const left = Buffer.from(supplied);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: Request, context: { params: Promise<{ provider: string }> }) {
  try {
    const { provider } = await context.params;
    const rawBody = await request.text();
    if (!verifyWebhook(provider, rawBody, request)) {
      return NextResponse.json({ success: false, error: 'Invalid webhook signature.' }, { status: 401 });
    }
    const body = rawBody ? JSON.parse(rawBody) : {};
    const dataSourceId = body.dataSourceId || body.sourceId || request.headers.get('x-data-source-id');
    if (!dataSourceId || typeof dataSourceId !== 'string') {
      return NextResponse.json({ success: false, error: 'dataSourceId is required.' }, { status: 400 });
    }
    const { db } = await getDb();
    const sources = await db.select().from(dataSources).where(eq(dataSources.id, dataSourceId));
    const source = sources.find((item: any) => item.provider === provider && item.status === 'active');
    if (!source) return NextResponse.json({ success: false, error: `No active ${provider} data source found.` }, { status: 404 });
    const workspaceId = source.workspaceId;
    const eventId = request.headers.get('x-github-delivery') ||
      request.headers.get('x-gitlab-event-uuid') ||
      body.eventId ||
      body.deliveryId;
    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json({ success: false, error: 'A provider delivery/event ID is required.' }, { status: 400 });
    }
    const stableEventId = `${provider}:${source.id}:${eventId}`;
    const existingEvent = await db.select().from(webhookEvents).where(eq(webhookEvents.id, stableEventId)).limit(1);
    if (existingEvent[0]) {
      return NextResponse.json({ success: true, duplicate: true, provider, status: 'accepted' }, { status: 202 });
    }
    await db.insert(webhookEvents).values({
      id: stableEventId,
      provider,
      sourceId: source.id,
      eventType: body.type || request.headers.get('x-github-event') || 'webhook',
      payload: body,
    });
    const syncJobId = `sync-${Date.now().toString(36)}`;
    await db.insert(syncJobs).values({
      id: syncJobId,
      dataSourceId: source.id,
      type: body.type || 'webhook',
      status: 'queued',
      input: body,
    });
    const jobId = await enqueueJob(db, {
      workspaceId,
      type: 'source.sync',
      payload: { syncJobId, dataSourceId: source.id, provider, body },
    });
    return NextResponse.json({ success: true, syncJobId, jobId, provider, status: 'queued' }, { status: 202 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
