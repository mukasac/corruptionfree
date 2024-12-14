// app/api/admin/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { adminMiddleware } from '@/lib/middleware';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    await adminMiddleware(req);
    
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || 'week';
    const category = searchParams.get('category') || 'all';

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Fetch analytics data
    const [
      ratingTrends,
      categoryDistribution,
      userActivity,
      geographicalData
    ] = await Promise.all([
      // Rating trends over time
      prisma.nomineeRating.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: {
            gte: startDate
          }
        },
        _count: true,
        orderBy: {
          createdAt: 'asc'
        }
      }),

      // Distribution by rating category
      prisma.ratingCategory.findMany({
        include: {
          _count: {
            select: {
              nomineeRatings: true
            }
          }
        }
      }),

      // User activity
      prisma.user.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        include: {
          _count: {
            select: {
              nomineeRatings: true,
              comments: true
            }
          }
        }
      }),

      // Geographical distribution
      prisma.district.findMany({
        include: {
          _count: {
            select: {
              nominees: true
            }
          },
          nominees: {
            include: {
              _count: {
                select: {
                  rating: true
                }
              }
            }
          }
        }
      })
    ]);

    return NextResponse.json({
      ratingTrends: ratingTrends.map(day => ({
        date: day.createdAt.toISOString().split('T')[0],
        count: day._count
      })),
      categoryDistribution: categoryDistribution.map(cat => ({
        name: cat.name,
        count: cat._count.nomineeRatings,
        percentage: (cat._count.nomineeRatings / categoryDistribution.reduce((acc, curr) => acc + curr._count.nomineeRatings, 0)) * 100
      })),
      userActivity: userActivity.map(user => ({
        id: user.id,
        ratings: user._count.nomineeRatings,
        comments: user._count.comments
      })),
      geographicalData: geographicalData.map(district => ({
        region: district.name,
        nominees: district._count.nominees,
        ratings: district.nominees.reduce((acc, nom) => acc + nom._count.rating, 0)
      }))
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}