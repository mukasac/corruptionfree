// app/api/institutions/rate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, InstitutionType, InstitutionStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface Rating {
    userId: number;
    ratingCategoryId: number;
    score: number;
    severity: number;
}

interface InstitutionData {
    name: string;
    description?: string;
    type?: InstitutionType;
    website?: string;
    evidence: string;
}

export async function POST(req: NextRequest) {
    try {
        const { institutionData, ratings } = await req.json();

        // Type check and validate institutionData
        if (!institutionData || typeof institutionData !== 'object') {
            return NextResponse.json({ 
                success: false,
                error: 'Invalid institution data format' 
            }, { status: 400 });
        }

        const { name, description, type = InstitutionType.GOVERNMENT, website, evidence } = institutionData as InstitutionData;
        
        // Required field validation
        if (!name?.trim()) {
            return NextResponse.json({ 
                success: false,
                error: 'Institution name is required' 
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
            if (!rating.userId || typeof rating.userId !== 'number') {
                return NextResponse.json({ 
                    success: false,
                    error: 'Valid user ID is required for ratings' 
                }, { status: 400 });
            }

            if (!rating.ratingCategoryId || typeof rating.ratingCategoryId !== 'number') {
                return NextResponse.json({ 
                    success: false,
                    error: 'Valid rating category ID is required' 
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

        // Check if institution name already exists
        const existingInstitution = await prisma.institution.findUnique({
            where: { name: name.trim() }
        });

        if (existingInstitution) {
            return NextResponse.json({ 
                success: false,
                error: 'An institution with this name already exists' 
            }, { status: 400 });
        }

        // Start a Prisma transaction
        const result = await prisma.$transaction(async (tx) => {
            // Calculate average rating
            const averageRating = ratings.reduce((acc, curr) => acc + curr.score, 0) / ratings.length;

            // Create the institution
            const institution = await tx.institution.create({
                data: {
                    name: name.trim(),
                    description: description?.trim(),
                    type,
                    website: website?.trim(),
                    status: InstitutionStatus.ACTIVE,
                    totalRatings: ratings.length,
                    averageRating
                },
            });

            // Create ratings
            const ratingsData = ratings.map(rating => ({
                userId: rating.userId,
                institutionId: institution.id,
                ratingCategoryId: rating.ratingCategoryId,
                score: rating.score,
                severity: rating.severity,
                evidence: evidence.trim(),
                status: 'PENDING',
                documents: []
            }));

            await tx.institutionRating.createMany({
                data: ratingsData
            });

            // Return complete institution data with relationships
            return await tx.institution.findUnique({
                where: { id: institution.id },
                include: {
                    rating: {
                        include: {
                            ratingCategory: {
                                include: {
                                    departments: true,
                                    impactAreas: true
                                }
                            },
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    avatar: true,
                                    role: true
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
        console.error('Error creating institution and ratings:', error);
        
        if (error.code === 'P2002') {
            return NextResponse.json({ 
                success: false,
                error: 'An institution with this name already exists' 
            }, { status: 400 });
        }

        if (error.code === 'P2003') {
            return NextResponse.json({ 
                success: false,
                error: 'Referenced user or rating category does not exist' 
            }, { status: 400 });
        }

        return NextResponse.json({ 
            success: false,
            error: 'Failed to create institution and ratings' 
        }, { status: 500 });
    }
}