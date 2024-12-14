// middleware.ts
import { type NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/auth';

// Define protected routes patterns
const protectedRoutes = ['/admin'];
const protectedApiRoutes = ['/api/admin'];

// Define public routes that don't need authentication
const publicRoutes = [
  '/login',
  '/api/auth/login',
  '/',
  '/nominees',
  '/institutions',
  '/leaderboard',
  '/api/nominees',
  '/api/institutions'
];

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;

// In-memory store for rate limiting
const rateLimitStore = new Map<string, { count: number; timestamp: number }>();

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if route should be protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route));

  if (!isProtectedRoute && !isProtectedApiRoute) {
    return NextResponse.next();
  }

  try {
    // Rate limiting check
    const clientIp = request.ip ?? 
      request.headers.get('x-forwarded-for') ?? 
      'unknown';
    
    const now = Date.now();
    const windowData = rateLimitStore.get(clientIp) ?? { 
      count: 0, 
      timestamp: now 
    };

    if (now - windowData.timestamp > RATE_LIMIT_WINDOW) {
      windowData.count = 0;
      windowData.timestamp = now;
    }

    windowData.count++;
    rateLimitStore.set(clientIp, windowData);

    if (windowData.count > MAX_REQUESTS) {
      if (isProtectedApiRoute) {
        return NextResponse.json(
          { error: 'Too many requests' },
          { status: 429 }
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Get token from either cookie or Authorization header
    let token = request.cookies.get('auth_token')?.value;
    
    // For API routes, check Authorization header if no cookie token
    if (!token && isProtectedApiRoute) {
      token = request.headers.get('authorization')?.split(' ')[1];
    }
    
    if (!token) {
      if (isProtectedApiRoute) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const verifiedToken = await verifyJwtToken(token);
    
    if (!verifiedToken) {
      if (isProtectedApiRoute) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check admin role for protected routes
    if (isProtectedRoute && (!verifiedToken.role || !['ADMIN', 'MODERATOR'].includes(verifiedToken.role))) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Add user info to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', verifiedToken.sub as string);
    requestHeaders.set('x-user-role', verifiedToken.role);

    // Content-Type validation for API routes
    if (isProtectedApiRoute && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentType = request.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        return NextResponse.json(
          { error: 'Content-Type must be application/json' },
          { status: 415 }
        );
      }
    }

    // Security headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Permissions-Policy', 
      'camera=(), microphone=(), geolocation=()'
    );
    response.headers.set(
      'Content-Security-Policy', 
      "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    );

    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    if (isProtectedApiRoute) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};