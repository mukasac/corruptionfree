// app/api/admin/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { adminMiddleware } from '@/lib/middleware';
import { logAdminAction } from '@/lib/audit';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Verify admin access
    await adminMiddleware(req);
    
    // Get time range from query params
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || 'week';
    
    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    switch (timeRange) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Fetch all required statistics in parallel
    const [
      nomineeStats,
      institutionStats,
      ratingStats,
      userStats,
      recentActivity,
      topNominees,
      topInstitutions,
      moderationQueue
    ] = await Promise.all([
      // Nominee statistics
      prisma.nominee.groupBy({
        by: ['status'],
        _count: true,
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),

      // Institution statistics
      prisma.institution.groupBy({
        by: ['status'],
        _count: true,
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),

      // Rating statistics
      prisma.$transaction([
        prisma.nomineeRating.count(),
        prisma.nomineeRating.count({
          where: {
            createdAt: {
              gte: startDate
            }
          }
        }),
        prisma.nomineeRating.count({
          where: {
            status: 'PENDING'
          }
        })
      ]),

      // User statistics
      prisma.user.aggregate({
        _count: {
          _all: true
        },
        where: {
          isActive: true
        }
      }),

      // Recent activity from admin logs
      prisma.adminLog.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          admin: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),

      // Top nominees by rating
      prisma.nominee.findMany({
        take: 5,
        where: {
          status: 'VERIFIED'
        },
        include: {
          position: true,
          institution: true,
          rating: {
            include: {
              ratingCategory: true
            }
          }
        },
        orderBy: [
          { averageRating: 'desc' },
          { totalRatings: 'desc' }
        ]
      }),

      // Top institutions by rating
      prisma.institution.findMany({
        take: 5,
        where: {
          status: 'ACTIVE'
        },
        include: {
          rating: {
            include: {
              ratingCategory: true
            }
          }
        },
        orderBy: [
          { averageRating: 'desc' },
          { totalRatings: 'desc' }
        ]
      }),

      // Moderation queue counts
      prisma.$transaction([
        prisma.nominee.count({ where: { status: 'PENDING' } }),
        prisma.nomineeRating.count({ where: { status: 'PENDING' } }),
        prisma.comment.count({ where: { status: 'PENDING' } })
      ])
    ]);

    return NextResponse.json({
      overview: {
        nominees: {
          total: nomineeStats.reduce((acc, curr) => acc + curr._count, 0),
          pending: nomineeStats.find(s => s.status === 'PENDING')?._count || 0,
          verified: nomineeStats.find(s => s.status === 'VERIFIED')?._count || 0
        },
        institutions: {
          total: institutionStats.reduce((acc, curr) => acc + curr._count, 0),
          active: institutionStats.find(s => s.status === 'ACTIVE')?._count || 0,
          underInvestigation: institutionStats.find(s => s.status === 'UNDER_INVESTIGATION')?._count || 0
        },
        ratings: {
          total: ratingStats[0],
          lastWeek: ratingStats[1],
          pending: ratingStats[2]
        },
        users: {
          total: userStats._count._all,
          active: userStats._count._all // Active users only due to where clause
        }
      },
      recentActivity,
      topNominees,
      topInstitutions,
      moderationQueue: {
        nominees: moderationQueue[0],
        ratings: moderationQueue[1],
        comments: moderationQueue[2]
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}