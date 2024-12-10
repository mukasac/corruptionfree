import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [totalInstitutions, totalRatings, averageRating, topInstitutions] = await Promise.all([
      prisma.institution.count(),
      prisma.institutionRating.count(),
      prisma.institutionRating.aggregate({
        _avg: {
          score: true,
        },
      }),
      prisma.institution.findMany({
        take: 10,
        include: {
          rating: {
            include: {
              ratingCategory: true,
            },
          },
        },
        orderBy: {
          rating: {
            _count: 'desc',
          },
        },
      }),
    ]);

    return NextResponse.json({
      totalInstitutions,
      totalRatings,
      averageRating: averageRating._avg.score,
      topInstitutions: topInstitutions.map(inst => ({
        id: inst.id,
        name: inst.name,
        ratingCount: inst.rating.length,
        averageScore: inst.rating.reduce((acc, r) => acc + r.score, 0) / inst.rating.length,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching institution stats' }, { status: 500 });
  }
}