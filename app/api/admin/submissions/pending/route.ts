// app/api/admin/submissions/pending/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { adminMiddleware } from '@/lib/middleware';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    await adminMiddleware(req);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Fetch pending nominees and ratings in parallel
    const [
      pendingNominees,
      pendingRatings,
      totalNominees,
      totalRatings
    ] = await Promise.all([
      // Pending nominees
      prisma.nominee.findMany({
        where: {
          status: 'PENDING'
        },
        include: {
          position: true,
          institution: true,
          district: true
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),

      // Pending ratings
      prisma.nomineeRating.findMany({
        where: {
          status: 'PENDING'
        },
        include: {
          nominee: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          ratingCategory: true
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),

      // Total count of pending nominees
      prisma.nominee.count({
        where: {
          status: 'PENDING'
        }
      }),

      // Total count of pending ratings
      prisma.nomineeRating.count({
        where: {
          status: 'PENDING'
        }
      })
    ]);

    // Also fetch pending comments
    const [pendingComments, totalComments] = await Promise.all([
      prisma.comment.findMany({
        where: {
          status: 'PENDING'
        },
        include: {
          nominee: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.comment.count({
        where: {
          status: 'PENDING'
        }
      })
    ]);

    return NextResponse.json({
      nominees: {
        data: pendingNominees,
        total: totalNominees,
        page,
        pageSize: limit,
        totalPages: Math.ceil(totalNominees / limit)
      },
      ratings: {
        data: pendingRatings,
        total: totalRatings,
        page,
        pageSize: limit,
        totalPages: Math.ceil(totalRatings / limit)
      },
      comments: {
        data: pendingComments,
        total: totalComments,
        page,
        pageSize: limit,
        totalPages: Math.ceil(totalComments / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching pending submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending submissions' },
      { status: 500 }
    );
  }
}