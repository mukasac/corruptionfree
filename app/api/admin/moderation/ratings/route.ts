import { NextRequest, NextResponse } from 'next/server';
import { Prisma, PrismaClient } from "@prisma/client";
import { middleware } from '@/middleware';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    await middleware(req);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'PENDING';
    const type = searchParams.get('type');
    const search = searchParams.get('search') || '';

    const where: Prisma.NomineeRatingWhereInput = {
  AND: [
    { status: status as Prisma.EnumRatingStatusFilter<"NomineeRating"> },
    type !== 'ALL' ? {
      OR: [
        { nominee: type === 'NOMINEE' ? {} : undefined },
        { institution: type === 'INSTITUTION' ? {} : undefined }
      ].filter(Boolean)
    } : {},
    search ? {
      OR: [
        { nominee: { name: { contains: search, mode: 'insensitive' } } },
        // { institution: { name: { contains: search, mode: 'insensitive' } } }
      ]
    } : {}
  ]
};

    const ratings = await prisma.nomineeRating.findMany({
      where,
      include: {
        nominee: {
          select: {
            id: true,
            name: true
          }
        },

        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        ratingCategory: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ data: ratings });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    );
  }
}