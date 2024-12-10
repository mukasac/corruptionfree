import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const id = parseInt(req.url.split('/').pop() || '', 10);
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json(comment);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching comment' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const id = parseInt(req.url.split('/').pop() || '', 10);
    const { content } = await req.json();

    const comment = await prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating comment' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = parseInt(req.url.split('/').pop() || '', 10);
    await prisma.comment.delete({ where: { id } });
    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting comment' }, { status: 500 });
  }
}