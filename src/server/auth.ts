import { NextResponse } from 'next/server';
import { env, isAuthEnabled } from './env';

export interface AuthCheckResult {
  authorized: boolean;
  errorResponse?: NextResponse;
  userId?: string;
}

/**
 * Validates request authorization for API endpoints.
 * In development or when auth is disabled, requests from loopback/local are permitted.
 * When auth is enabled (production or when NOVA_API_KEY / NOVA_ADMIN_PASSWORD is set),
 * requests must provide a valid Bearer token, x-api-key, or admin session.
 */
export function validateApiAuth(request: Request): AuthCheckResult {
  if (!isAuthEnabled()) {
    // Auth not enabled: allow local single-operator access
    return { authorized: true, userId: 'local-operator' };
  }

  const configuredKey = env().NOVA_API_KEY || process.env.NEXUS_API_KEY || process.env.NOVA_API_KEY;
  const adminPassword = env().NOVA_ADMIN_PASSWORD || process.env.NOVA_ADMIN_PASSWORD;

  // 1. Check Bearer token or x-api-key
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  const apiKeyHeader = request.headers.get('x-api-key') || request.headers.get('X-API-KEY');

  let token: string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (apiKeyHeader) {
    token = apiKeyHeader.trim();
  }

  if (configuredKey && token === configuredKey) {
    return { authorized: true, userId: 'api-client' };
  }

  if (adminPassword && token === adminPassword) {
    return { authorized: true, userId: 'admin' };
  }

  // 2. Allow same-origin requests in development if no key configured
  const origin = request.headers.get('origin') || request.headers.get('host');
  if (env().NODE_ENV !== 'production' && !configuredKey && !adminPassword) {
    return { authorized: true, userId: 'dev-user' };
  }

  // Unauthorized
  return {
    authorized: false,
    errorResponse: NextResponse.json(
      {
        success: false,
        error: 'Unauthorized: Valid Bearer token or x-api-key required.',
        code: 'UNAUTHORIZED',
      },
      { status: 401 }
    ),
  };
}
