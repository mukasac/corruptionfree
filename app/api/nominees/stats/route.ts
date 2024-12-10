import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [totalNominees, totalRatings, averageRating, topNominees, categoryStats] = await Promise.all([
      prisma.nominee.count(),
      prisma.nomineeRating.count(),
      prisma.nomineeRating.aggregate({
        _avg: {
          score: true,
        },
      }),
      prisma.nominee.findMany({
        take: 10,
        include: {
          rating: {
            include: {
              ratingCategory: true,
            },
          },
          position: true,
          institution: true,
        },
        orderBy: {
          rating: {
            _count: 'desc',
          },
        },
      }),
      prisma.ratingCategory.findMany({
        include: {
          nomineeRatings: true,
        },
      }),
    ]);

    return NextResponse.json({
      totalNominees,
      totalRatings,
      averageRating: averageRating._avg.score,
      topNominees: topNominees.map(nom => ({
        id: nom.id,
        name: nom.name,
        position: nom.position.name,
        institution: nom.institution.name,
        ratingCount: nom.rating.length,
        averageScore: nom.rating.reduce((acc, r) => acc + r.score, 0) / nom.rating.length,
      })),
      categoryBreakdown: categoryStats.map(cat => ({
        name: cat.name,
        count: cat.nomineeRatings.length,
        averageScore: cat.nomineeRatings.reduce((acc, r) => acc + r.score, 0) / cat.nomineeRatings.length,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching nominee stats' }, { status: 500 });
  }
}