// app/api/admin/[type]/[id]/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { adminMiddleware } from '@/lib/middleware';

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: { type: string; id: string } }
) {
  try {
    await adminMiddleware(req);
    const { type, id } = params;

    switch (type) {
      case 'nominees':
        await prisma.nominee.update({
          where: { id: parseInt(id) },
          data: { status: 'VERIFIED' }
        });
        break;

      case 'ratings':
        await prisma.nomineeRating.update({
          where: { id: parseInt(id) },
          data: { status: 'VERIFIED' }
        });
        break;

      case 'comments':
        await prisma.comment.update({
          where: { id: parseInt(id) },
          data: { status: 'APPROVED' }
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid submission type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Approval error:', error);
    return NextResponse.json(
      { error: 'Failed to approve submission' },
      { status: 500 }
    );
  }
}

// app/api/admin/[type]/[id]/reject/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { adminMiddleware } from '@/lib/middleware';

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: { type: string; id: string } }
) {
  try {
    await adminMiddleware(req);
    const { type, id } = params;

    switch (type) {
      case 'nominees':
        await prisma.nominee.update({
          where: { id: parseInt(id) },
          data: { status: 'REJECTED' }
        });
        break;

      case 'ratings':
        await prisma.nomineeRating.update({
          where: { id: parseInt(id) },
          data: { status: 'REJECTED' }
        });
        break;

      case 'comments':
        await prisma.comment.update({
          where: { id: parseInt(id) },
          data: { status: 'REJECTED' }
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid submission type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Rejection error:', error);
    return NextResponse.json(
      { error: 'Failed to reject submission' },
      { status: 500 }
    );
  }
}