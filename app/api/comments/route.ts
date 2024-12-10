// app/api/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { buildFilters } from '@/utils/filters';
import { paginate } from '@/utils/pagination';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nomineeId = searchParams.get('nomineeId');
  const institutionId = searchParams.get('institutionId');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  const include = {
    user: {
      select: {
        name: true,
        avatar: true
      }
    }
  };

  try {
    if (nomineeId) {
      const result = await paginate(
        prisma.comment,
        { page, limit },
        { nomineeId: parseInt(nomineeId) },
        include
      );
      return NextResponse.json(result);
    } else if (institutionId) {
      const result = await paginate(
        prisma.institutionComment,
        { page, limit },
        { institutionId: parseInt(institutionId) },
        include
      );
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Missing nomineeId or institutionId' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching comments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { content, userId, nomineeId, institutionId } = await req.json();

    if (nomineeId) {
      const comment = await prisma.comment.create({
        data: { content, userId, nomineeId },
        include: {
          user: {
            select: {
              name: true,
              avatar: true
            }
          }
        }
      });
      return NextResponse.json(comment, { status: 201 });
    } else if (institutionId) {
      const comment = await prisma.institutionComment.create({
        data: { content, userId, institutionId },
        include: {
          user: {
            select: {
              name: true,
              avatar: true
            }
          }
        }
      });
      return NextResponse.json(comment, { status: 201 });
    }

    return NextResponse.json({ error: 'Missing nomineeId or institutionId' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating comment' }, { status: 500 });
  }
}