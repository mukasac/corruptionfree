// lib/auth.ts
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

interface JWTPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

// Token verification with enhanced security
export async function verifyJwtToken(token: string): Promise<JWTPayload | null> {
  try {
    // Verify token with JWT_SECRET
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
      {
        algorithms: ['HS256'], // Explicitly specify allowed algorithms
        maxAge: '7d' // Maximum age of token
      }
    ) as JWTPayload;

    // Check token expiration
    if (Date.now() >= decoded.exp * 1000) {
      return null;
    }

    // Verify user exists, is active, and role matches
    const user = await prisma.user.findFirst({
      where: {
        id: parseInt(decoded.sub),
        isActive: true,
        role: decoded.role
      },
      select: {
        id: true,
        role: true,
        isActive: true
      }
    });

    if (!user) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Helper functions for token management
export const createToken = (userId: number, role: string): string => {
  return jwt.sign(
    {
      sub: userId.toString(),
      role
    },
    process.env.JWT_SECRET!,
    {
      algorithm: 'HS256',
      expiresIn: '7d'
    }
  );
};

// Cookie management utilities
export const setAuthCookie = (token: string) => {
  return {
    'auth_token': token,
    'Path': '/',
    'HttpOnly': true,
    'Secure': process.env.NODE_ENV === 'production',
    'SameSite': 'Lax',
    'Max-Age': 7 * 24 * 60 * 60 // 7 days
  };
};

export const removeAuthCookie = () => {
  return {
    'auth_token': '',
    'Path': '/',
    'HttpOnly': true,
    'Secure': process.env.NODE_ENV === 'production',
    'SameSite': 'Lax',
    'Max-Age': 0
  };
};

// Rate limiter interface
interface RateLimiter {
  checkLimit(ip: string): boolean;
  resetLimit(ip: string): void;
}

// Memory-based rate limiter implementation with improved cleanup
class MemoryRateLimiter implements RateLimiter {
  private store: Map<string, { count: number; timestamp: number }>;
  private readonly window: number;
  private readonly limit: number;
  private cleanupInterval: NodeJS.Timer;

  constructor(windowMs: number, limit: number) {
    this.store = new Map();
    this.window = windowMs;
    this.limit = limit;

    // Cleanup old entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  checkLimit(ip: string): boolean {
    const now = Date.now();
    const record = this.store.get(ip) ?? { count: 0, timestamp: now };

    if (now - record.timestamp > this.window) {
      record.count = 1;
      record.timestamp = now;
    } else {
      record.count++;
    }

    this.store.set(ip, record);
    return record.count <= this.limit;
  }

  resetLimit(ip: string): void {
    this.store.delete(ip);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [ip, record] of this.store.entries()) {
      if (now - record.timestamp > this.window) {
        this.store.delete(ip);
      }
    }
  }

  // Cleanup method for server shutdown
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Create rate limiter instance
export const rateLimiter = new MemoryRateLimiter(60 * 1000, 100); // 100 requests per minute

// Enhanced error handler for middleware
export function handleMiddlewareError(error: unknown) {
  console.error('Middleware error:', error);

  if (error instanceof jwt.JsonWebTokenError) {
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { error: 'Token expired', code: 'TOKEN_EXPIRED' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Invalid token', code: 'INVALID_TOKEN' },
      { status: 401 }
    );
  }

  if (error instanceof jwt.NotBeforeError) {
    return NextResponse.json(
      { error: 'Token not active', code: 'TOKEN_NOT_ACTIVE' },
      { status: 401 }
    );
  }

  return NextResponse.json(
    { 
      error: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'development' 
        ? (error as Error).message 
        : undefined
    },
    { status: 500 }
  );
}

// Validation helpers
export const isValidToken = (token: string): boolean => {
  return token.length > 0 && token.length < 1000;
};

export const sanitizeUser = (user: any) => {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};