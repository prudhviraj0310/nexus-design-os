import { NextResponse } from 'next/server';
import { validateApiAuth } from '@/server/auth';
import { env, isAuthEnabled } from '@/server/env';

export async function GET(request: Request) {
  const auth = validateApiAuth(request);
  const authEnabled = isAuthEnabled();
  const configuredKey = env().NOVA_API_KEY || process.env.NEXUS_API_KEY || process.env.NOVA_API_KEY;
  const adminPassword = env().NOVA_ADMIN_PASSWORD || process.env.NOVA_ADMIN_PASSWORD;

  return NextResponse.json({
    success: true,
    authenticated: auth.authorized,
    authRequired: authEnabled && Boolean(configuredKey || adminPassword),
    userId: auth.userId || null,
    devMode: process.env.NOVA_DEV_MODE === 'true' || process.env.ALLOW_ANONYMOUS_DEV === 'true',
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = (body.apiKey || body.token || body.password || '').trim();
    const configuredKey = env().NOVA_API_KEY || process.env.NEXUS_API_KEY || process.env.NOVA_API_KEY;
    const adminPassword = env().NOVA_ADMIN_PASSWORD || process.env.NOVA_ADMIN_PASSWORD;

    const isDevBypass =
      process.env.NOVA_DEV_MODE === 'true' ||
      process.env.ALLOW_ANONYMOUS_DEV === 'true' ||
      (!configuredKey && !adminPassword && env().NODE_ENV !== 'production');

    let valid = false;
    let userId = 'api-client';

    if (configuredKey && token === configuredKey) {
      valid = true;
      userId = 'api-client';
    } else if (adminPassword && token === adminPassword) {
      valid = true;
      userId = 'admin';
    } else if (isDevBypass) {
      valid = true;
      userId = 'dev-user';
    }

    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key or admin password.', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      authenticated: true,
      userId,
    });

    response.cookies.set('nexus_api_key', token, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      httpOnly: false,
    });
    response.cookies.set('nexus_admin_token', token, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      httpOnly: true,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, authenticated: false });
  response.cookies.set('nexus_api_key', '', { path: '/', maxAge: 0 });
  response.cookies.set('nexus_admin_token', '', { path: '/', maxAge: 0 });
  return response;
}
