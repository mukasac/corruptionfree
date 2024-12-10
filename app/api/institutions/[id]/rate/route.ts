// app/api/institutions/[id]/rate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const institutionId = parseInt(params.id);
        const { ratings, evidence } = await req.json();

        if (!evidence?.trim()) {
            return NextResponse.json({ 
                success: false,
                error: 'Evidence is required' 
            }, { status: 400 });
        }

        // Validate ratings array
        if (!Array.isArray(ratings) || ratings.length === 0) {
            return NextResponse.json({ 
                success: false,
                error: 'At least one rating is required' 
            }, { status: 400 });
        }

        // Validate rating values
        for (const rating of ratings) {
            if (!rating.ratingCategoryId) {
                return NextResponse.json({ 
                    success: false,
                    error: 'Rating category is required' 
                }, { status: 400 });
            }

            if (typeof rating.score !== 'number' || rating.score < 1 || rating.score > 5) {
                return NextResponse.json({ 
                    success: false,
                    error: 'Rating score must be between 1 and 5' 
                }, { status: 400 });
            }

            if (typeof rating.severity !== 'number' || rating.severity < 1 || rating.severity > 5) {
                return NextResponse.json({ 
                    success: false,
                    error: 'Severity must be between 1 and 5' 
                }, { status: 400 });
            }
        }

        // Start a Prisma transaction
        const result = await prisma.$transaction(async (tx) => {
            // Verify institution exists
            const institution = await tx.institution.findUnique({
                where: { id: institutionId }
            });

            if (!institution) {
                throw new Error('Institution not found');
            }

            // Create ratings
            const ratingsData = ratings.map(rating => ({
                userId: rating.userId,
                institutionId,
                ratingCategoryId: rating.ratingCategoryId,
                score: rating.score,
                severity: rating.severity,
                evidence: evidence.trim(),
                status: 'PENDING'
            }));

            await tx.institutionRating.createMany({
                data: ratingsData
            });

            // Update institution average rating
            const allRatings = await tx.institutionRating.findMany({
                where: { institutionId }
            });

            const averageRating = allRatings.reduce((acc, curr) => acc + curr.score, 0) / allRatings.length;

            await tx.institution.update({
                where: { id: institutionId },
                data: {
                    totalRatings: allRatings.length,
                    averageRating
                }
            });

            // Return updated institution data
            return await tx.institution.findUnique({
                where: { id: institutionId },
                include: {
                    rating: {
                        include: {
                            ratingCategory: true,
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    avatar: true
                                }
                            }
                        }
                    }
                }
            });
        });

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error adding institution ratings:', error);

        if (error.message === 'Institution not found') {
            return NextResponse.json({ 
                success: false,
                error: 'Institution not found' 
            }, { status: 404 });
        }

        return NextResponse.json({ 
            success: false,
            error: 'Failed to add institution ratings' 
        }, { status: 500 });
    }
}