import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const id = parseInt(req.url.split('/').pop() || '', 10);
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        nomineeRatings: { include: { ratingCategory: true } },
        institutionRatings: { include: { ratingCategory: true } },
        comments: true,
        institutionComments: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching user' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const id = parseInt(req.url.split('/').pop() || '', 10);
    const data = await req.json();

    const user = await prisma.user.update({
      where: { id },
      data,
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating user' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = parseInt(req.url.split('/').pop() || '', 10);
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting user' }, { status: 500 });
  }
}