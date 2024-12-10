import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const id = parseInt(req.url.split('/').pop() || '', 10);
    const district = await prisma.district.findUnique({
      where: { id },
      include: {
        nominees: {
          include: {
            rating: true,
            position: true,
            institution: true,
          },
        },
      },
    });

    if (!district) {
      return NextResponse.json({ error: 'District not found' }, { status: 404 });
    }

    return NextResponse.json(district);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching district' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const id = parseInt(req.url.split('/').pop() || '', 10);
    const data = await req.json();

    const district = await prisma.district.update({
      where: { id },
      data,
    });

    return NextResponse.json(district);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating district' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = parseInt(req.url.split('/').pop() || '', 10);
    await prisma.district.delete({ where: { id } });
    return NextResponse.json({ message: 'District deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting district' }, { status: 500 });
  }
}