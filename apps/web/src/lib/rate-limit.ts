/**
 * Rate Limiting for Next.js API Routes
 * In-memory implementation with configurable limits
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  limit: number; // Max requests per interval
  keyGenerator?: (identifier: string) => string;
}

// In-memory store (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Create a rate limiter instance
 */
export function createRateLimiter(config: RateLimitConfig) {
  const { interval, limit, keyGenerator } = config;

  return {
    /**
     * Check if request is rate limited
     * Returns { success: boolean, remaining: number, resetTime: number, limit: number }
     */
    check(identifier: string): { 
      success: boolean; 
      remaining: number; 
      resetTime: number; 
      limit: number;
      retryAfter?: number;
    } {
      const key = keyGenerator ? keyGenerator(identifier) : identifier;
      const now = Date.now();

      let entry = rateLimitStore.get(key);

      // Reset if window has passed
      if (!entry || entry.resetTime < now) {
        entry = { count: 0, resetTime: now + interval };
      }

      entry.count++;
      rateLimitStore.set(key, entry);

      const remaining = Math.max(0, limit - entry.count);
      const success = entry.count <= limit;
      const retryAfter = success ? 0 : Math.ceil((entry.resetTime - now) / 1000);

      return {
        success,
        remaining: success ? remaining : 0,
        resetTime: entry.resetTime,
        limit,
        retryAfter: success ? undefined : retryAfter,
      };
    },

    /**
     * Reset rate limit for an identifier
     */
    reset(identifier: string): void {
      const key = keyGenerator ? keyGenerator(identifier) : identifier;
      rateLimitStore.delete(key);
    },
  };
}

// Default rate limiters
const DEFAULT_INTERVAL = 60 * 1000; // 1 minute
const DEFAULT_LIMIT = 10; // 10 requests per minute

/**
 * Auth rate limiter - More restrictive (5 requests per minute)
 * Prevents brute force attacks on login/register
 */
export const authRateLimiter = createRateLimiter({
  interval: 60 * 1000, // 1 minute
  limit: 5, // 5 requests per minute
  keyGenerator: (ip) => `auth:${ip}`,
});

/**
 * API rate limiter - Standard (10 requests per minute)
 * General API protection
 */
export const apiRateLimiter = createRateLimiter({
  interval: 60 * 1000, // 1 minute
  limit: 10, // 10 requests per minute
  keyGenerator: (ip) => `api:${ip}`,
});

/**
 * Projects rate limiter (10 requests per minute)
 */
export const projectsRateLimiter = createRateLimiter({
  interval: 60 * 1000, // 1 minute
  limit: 10, // 10 requests per minute
  keyGenerator: (ip) => `projects:${ip}`,
});

/**
 * Get client IP from Next.js request
 */
export function getClientIp(req: Request): string {
  // Try various headers that might contain the real IP
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // Fallback for development
  return '127.0.0.1';
}

/**
 * Create rate limit response with proper headers
 */
export function rateLimitResponse(retryAfter: number): Response {
  return new Response(
    JSON.stringify({ 
      error: 'Çok fazla istek. Lütfen bir süre bekleyip tekrar deneyin.',
      retryAfter 
    }),
    { 
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(DEFAULT_LIMIT),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + retryAfter),
      }
    }
  );
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: Response, 
  limit: number, 
  remaining: number, 
  resetTime: number
): void {
  response.headers.set('X-RateLimit-Limit', String(limit));
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetTime / 1000)));
}

/**
 * Higher-order function to wrap API route handlers with rate limiting
 */
export function withRateLimit(
  limiter: ReturnType<typeof createRateLimiter>,
  handler: (req: Request) => Promise<Response>
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    const ip = getClientIp(req);
    const result = limiter.check(ip);

    if (!result.success) {
      return rateLimitResponse(result.retryAfter || 60);
    }

    const response = await handler(req);
    addRateLimitHeaders(response, result.limit, result.remaining, result.resetTime);
    
    return response;
  };
}

/**
 * Type for Next.js API route handler
 */
export type NextApiHandler = (req: NextRequest) => Promise<NextResponse>;

import { NextRequest, NextResponse } from 'next/server';

/**
 * Higher-order function specifically for Next.js API routes
 */
export function withNextRateLimit(
  limiter: ReturnType<typeof createRateLimiter>
): <T extends NextApiHandler>(handler: T) => T {
  return <T extends NextApiHandler>(handler: T): T => {
    return (async (req: NextRequest) => {
      const ip = getClientIp(req);
      const result = limiter.check(ip);

      if (!result.success) {
        return NextResponse.json(
          { 
            error: 'Çok fazla istek. Lütfen bir süre bekleyip tekrar deneyin.',
            retryAfter: result.retryAfter 
          },
          { 
            status: 429,
            headers: {
              'Retry-After': String(result.retryAfter || 60),
              'X-RateLimit-Limit': String(result.limit),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
            }
          }
        ) as NextResponse;
      }

      const response = await handler(req);
      
      // Add rate limit headers to response
      response.headers.set('X-RateLimit-Limit', String(result.limit));
      response.headers.set('X-RateLimit-Remaining', String(result.remaining));
      response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetTime / 1000)));
      
      return response;
    }) as T;
  };
}

// Export types
export type { RateLimitConfig, RateLimitEntry };
