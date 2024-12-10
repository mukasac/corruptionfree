// app/api/institutions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);

    const institution = await prisma.institution.findUnique({
      where: { id },
      include: {
        rating: {
          include: {
            ratingCategory: {
              select: {
                id: true,
                keyword: true,
                name: true,
                icon: true,
                description: true,
                weight: true,
              },
            },
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          where: {
            status: 'APPROVED',
          },
        },
      },
    });

    if (!institution) {
      return NextResponse.json(
        { success: false, error: 'Institution not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: institution });
  } catch (error) {
    console.error('Error fetching institution:', error);
    return NextResponse.json(
      { success: false, error: 'Error fetching institution data' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const dataToUpdate = await req.json();

    const updatedInstitution = await prisma.institution.update({
      where: { id },
      data: dataToUpdate,
      include: {
        rating: {
          include: {
            ratingCategory: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: updatedInstitution });
  } catch (error) {
    console.error('Error updating institution:', error);
    return NextResponse.json(
      { success: false, error: 'Error updating institution' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);

    await prisma.institution.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Institution deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting institution:', error);
    return NextResponse.json(
      { success: false, error: 'Error deleting institution' },
      { status: 500 }
    );
  }
}