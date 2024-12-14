// lib/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from './auth';

export async function adminMiddleware(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1] || 
                     req.cookies.get('auth_token')?.value;

        if (!token) {
            throw new Error('No token provided');
        }

        const verified = await verifyJwtToken(token);
        
        if (!verified || (verified.role !== 'ADMIN' && verified.role !== 'MODERATOR')) {
            throw new Error('Insufficient permissions');
        }

        return verified;
    } catch (error) {
        throw new Error('Authentication failed');
    }
}