import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ nominees: [], institutions: [] });
  }

  try {
    const [nominees, institutions] = await Promise.all([
      prisma.nominee.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { position: { name: { contains: query, mode: 'insensitive' } } },
            { institution: { name: { contains: query, mode: 'insensitive' } } }
          ]
        },
        include: {
          position: true,
          institution: true,
          rating: { include: { ratingCategory: true } }
        },
        take: 5
      }),
      prisma.institution.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        include: { rating: { include: { ratingCategory: true } } },
        take: 5
      })
    ]);

    return NextResponse.json({ nominees, institutions });
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}