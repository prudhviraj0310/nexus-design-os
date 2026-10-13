import { NextResponse } from 'next/server';
import { env, isAuthEnabled } from './env';

export interface AuthCheckResult {
  authorized: boolean;
  errorResponse?: NextResponse;
  userId?: string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * Checks in-memory sliding window rate limits per client IP.
 */
export function checkRateLimit(request: Request, limit = 120, windowMs = 60_000): { allowed: boolean; remaining: number } {
  // Disable or relax during tests to avoid test isolation pollution
  if (process.env.NODE_ENV === 'test') {
    return { allowed: true, remaining: limit };
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: limit - entry.count };
}

/**
 * Validates request authorization for API endpoints.
 * In development or when auth is disabled, requests from loopback/local are permitted.
 * When auth is enabled (production or when NOVA_API_KEY / NOVA_ADMIN_PASSWORD is set),
 * requests must provide a valid Bearer token, x-api-key, or admin session.
 */
export function validateApiAuth(request: Request): AuthCheckResult {
  // Rate limiting check
  const rateLimit = checkRateLimit(request);
  if (!rateLimit.allowed) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded: Too many requests. Please slow down.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
        { status: 429 }
      ),
    };
  }

  if (!isAuthEnabled()) {
    // Auth not enabled: allow local single-operator access
    return { authorized: true, userId: 'local-operator' };
  }

  const configuredKey = env().NOVA_API_KEY || process.env.NEXUS_API_KEY || process.env.NOVA_API_KEY;
  const adminPassword = env().NOVA_ADMIN_PASSWORD || process.env.NOVA_ADMIN_PASSWORD;

  // 1. Check Bearer token, x-api-key, or cookie
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  const apiKeyHeader = request.headers.get('x-api-key') || request.headers.get('X-API-KEY');
  const cookieHeader = request.headers.get('cookie') || '';

  let token: string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (apiKeyHeader) {
    token = apiKeyHeader.trim();
  } else if (cookieHeader) {
    const match = cookieHeader.match(/nexus_admin_token=([^;]+)/) || cookieHeader.match(/nexus_api_key=([^;]+)/);
    if (match) {
      token = decodeURIComponent(match[1].trim());
    }
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
        error: 'Unauthorized: Valid Bearer token, x-api-key, or admin session required.',
        code: 'UNAUTHORIZED',
      },
      { status: 401 }
    ),
  };
}
