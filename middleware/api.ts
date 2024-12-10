import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

// Rate limiter using in-memory Map
const rateLimiter = new Map<string, { count: number; timestamp: number }>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;

export function middleware(request: NextRequest) {
  // Rate limiting check
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
  const now = Date.now();
  const currentWindow = rateLimiter.get(ip) ?? { count: 0, timestamp: now };

  if (now - currentWindow.timestamp > WINDOW_MS) {
    currentWindow.count = 0;
    currentWindow.timestamp = now;
  }

  currentWindow.count++;
  rateLimiter.set(ip, currentWindow);

  if (currentWindow.count > MAX_REQUESTS) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // Content-Type validation for POST requests
  if (request.method === 'POST' && 
      !request.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json(
      { error: 'Content-Type must be application/json' },
      { status: 415 }
    );
  }

  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/nominees/:path*',
    '/institutions/:path*'
  ]
};