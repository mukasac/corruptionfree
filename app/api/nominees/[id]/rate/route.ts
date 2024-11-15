import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// POST - Submit a rating for the nominee
export async function POST(req: NextRequest) {
  try {
    // Extract the nominee ID from the URL parameter
    const nomineeId = parseInt(req.nextUrl.pathname.split('/')[3], 10); // Fetch the id from URL (e.g., api/nominees/1/rate)

    // Check if the nominee exists
    const nominee = await prisma.nominee.findUnique({
      where: { id: nomineeId },
    });

    if (!nominee) {
      return NextResponse.json({ error: 'Nominee not found' }, { status: 404 });
    }

    // Extract rating details from the request body
    const { userId, ratingCategoryId, score, severity, evidence } = await req.json();

    // Validate rating fields
    if (typeof score !== 'number' || typeof severity !== 'number') {
      return NextResponse.json({ error: 'Invalid score or severity' }, { status: 400 });
    }

    // Create the rating for the nominee
    const newRating = await prisma.nomineeRating.create({
      data: {
        userId,
        nomineeId,
        ratingCategoryId,
        score,
        severity,
        evidence,
      },
    });

    // Return the newly created rating
    return NextResponse.json(newRating, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error submitting rating' }, { status: 500 });
  }
}
