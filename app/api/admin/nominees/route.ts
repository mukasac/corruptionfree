// app/api/admin/nominees/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { adminMiddleware } from '@/lib/middleware';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    await adminMiddleware(req);

    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const institutionId = searchParams.get('institutionId');
    const districtId = searchParams.get('districtId');

    // Build the where clause
    const where = {
      AND: [
        // Search filter
        search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { title: { contains: search, mode: 'insensitive' } }
          ]
        } : {},
        // Status filter
        status ? { status } : {},
        // Institution filter
        institutionId ? { institutionId: parseInt(institutionId) } : {},
        // District filter
        districtId ? { districtId: parseInt(districtId) } : {}
      ]
    };

    // Execute query with pagination
    const [nominees, total] = await Promise.all([
      prisma.nominee.findMany({
        where,
        include: {
          position: true,
          institution: true,
          district: true,
          rating: {
            include: {
              ratingCategory: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.nominee.count({ where })
    ]);

    return NextResponse.json({
      data: nominees,
      pagination: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching nominees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nominees' },
      { status: 500 }
    );
  }
}