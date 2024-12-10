// app/api/nominees/rate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const { nomineeData, ratings } = await req.json();

        // Validate nomineeData
        const { name, institutionId, positionId, districtId, evidence } = nomineeData;
        
        // Required field validation
        if (!name?.trim()) {
            return NextResponse.json({ 
                success: false,
                error: 'Nominee name is required' 
            }, { status: 400 });
        }

        if (!institutionId) {
            return NextResponse.json({ 
                success: false,
                error: 'Institution is required' 
            }, { status: 400 });
        }

        if (!positionId) {
            return NextResponse.json({ 
                success: false,
                error: 'Position is required' 
            }, { status: 400 });
        }

        if (!districtId) {
            return NextResponse.json({ 
                success: false,
                error: 'District is required' 
            }, { status: 400 });
        }

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
            // Create the nominee
            const nominee = await tx.nominee.create({
                data: {
                    name: name.trim(),
                    institutionId,
                    positionId,
                    districtId,
                    evidence: evidence.trim(),
                    status: false,
                    totalRatings: ratings.length,
                    averageRating: ratings.reduce((acc, curr) => acc + curr.score, 0) / ratings.length
                },
            });

            // Create ratings
            const ratingsData = ratings.map(rating => ({
                userId: rating.userId,
                nomineeId: nominee.id,
                ratingCategoryId: rating.ratingCategoryId,
                score: rating.score,
                severity: rating.severity,
                evidence: evidence.trim(),
                status: 'PENDING'
            }));

            await tx.nomineeRating.createMany({
                data: ratingsData
            });

            // Return complete nominee data
            return await tx.nominee.findUnique({
                where: { id: nominee.id },
                include: {
                    position: true,
                    institution: true,
                    district: true,
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
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating nominee and ratings:', error);
        
        if (error.code === 'P2002') {
            return NextResponse.json({ 
                success: false,
                error: 'A nominee with these details already exists' 
            }, { status: 400 });
        }
        
        if (error.code === 'P2003') {
            return NextResponse.json({ 
                success: false,
                error: 'Referenced institution, position, or district does not exist' 
            }, { status: 400 });
        }

        return NextResponse.json({ 
            success: false,
            error: 'Failed to create nominee and ratings' 
        }, { status: 500 });
    }
}