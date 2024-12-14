// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { adminMiddleware } from '@/lib/middleware';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Verify admin access
    await adminMiddleware(req);

    // Fetch all required statistics in parallel
    const [
      nomineeCounts,
      institutionCounts,
      ratingStats,
      trendingNominees,
      trendingInstitutions,
      categoryStats,
      userStats
    ] = await Promise.all([
      // Nominee statistics
      prisma.nominee.groupBy({
        by: ['status'],
        _count: true
      }),

      // Institution statistics
      prisma.institution.groupBy({
        by: ['status'],
        _count: true
      }),

      // Rating statistics
      prisma.$transaction([
        prisma.nomineeRating.count(),
        prisma.nomineeRating.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]),

      // Trending nominees (highest rated this week)
      prisma.nominee.findMany({
        take: 5,
        where: {
          rating: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              }
            }
          }
        },
        select: {
          name: true,
          averageRating: true,
          totalRatings: true
        },
        orderBy: [
          { averageRating: 'desc' },
          { totalRatings: 'desc' }
        ]
      }),

      // Trending institutions
      prisma.institution.findMany({
        take: 5,
        where: {
          rating: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              }
            }
          }
        },
        select: {
          name: true,
          averageRating: true,
          totalRatings: true
        },
        orderBy: [
          { averageRating: 'desc' },
          { totalRatings: 'desc' }
        ]
      }),

      // Category statistics
      prisma.ratingCategory.findMany({
        select: {
          name: true,
          _count: {
            select: {
              nomineeRatings: true
            }
          }
        },
        orderBy: {
          nomineeRatings: {
            _count: 'desc'
          }
        }
      }),

      // User statistics
      prisma.user.aggregate({
        _count: {
          _all: true
        },
        where: {
          isActive: true
        }
      })
    ]);

    // Process and format the statistics
    const stats = {
      nominees: {
        total: nomineeCounts.reduce((acc, curr) => acc + curr._count, 0),
        pending: nomineeCounts.find(c => c.status === 'PENDING')?._count || 0,
        verified: nomineeCounts.find(c => c.status === 'VERIFIED')?._count || 0,
        trending: trendingNominees.map(n => ({
          name: n.name,
          score: Number(n.averageRating) || 0
        }))
      },
      institutions: {
        total: institutionCounts.reduce((acc, curr) => acc + curr._count, 0),
        active: institutionCounts.find(c => c.status === 'ACTIVE')?._count || 0,
        underInvestigation: institutionCounts.find(c => c.status === 'UNDER_INVESTIGATION')?._count || 0,
        trending: trendingInstitutions.map(i => ({
          name: i.name,
          score: Number(i.averageRating) || 0
        }))
      },
      ratings: {
        total: ratingStats[0],
        lastWeek: ratingStats[1],
        categories: categoryStats.map(cat => ({
          name: cat.name,
          count: cat._count.nomineeRatings
        }))
      },
      users: {
        total: userStats._count._all,
        active: userStats._count._all // Filtered by isActive in the query
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}