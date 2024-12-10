import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface StatsResponse {
    stats: {
        nomineeCount: number;
        institutionCount: number;
        totalRatings: number | BigInt;
        activeNominees: number;
        activeInstitutions: number;
    };
    topNominees: any[]; // Replace 'any' with a proper Nominee type
    topInstitutions: any[]; // Replace 'any' with a proper Institution type
}

export async function GET(): Promise<NextResponse<StatsResponse | { error: string }>> {
    try {
        const [
            nomineeCount,
            institutionCount,
            totalRatingsResult,
            activeNominees,
            activeInstitutions,
            recentNominees,
            recentInstitutions
        ] = await Promise.all([
            // Basic counts
            prisma.nominee.count(),
            prisma.institution.count(),
            
            // Total ratings across both tables
            prisma.$queryRaw`
                SELECT COUNT(*)::integer as count 
                FROM (
                    SELECT id FROM "NomineeRating" 
                    UNION ALL 
                    SELECT id FROM "InstitutionRating"
                ) as total
            `,
            
            // Active counts
            prisma.nominee.count({
                where: { status: 'VERIFIED' }
            }),
            prisma.institution.count({
                where: { status: 'ACTIVE' }
            }),
            
            // Recent nominees with high ratings
            prisma.nominee.findMany({
                take: 4,
                where: {
                    status: 'VERIFIED'
                },
                select: {
                    id: true,
                    name: true,
                    title: true,
                    avatar: true,
                    totalRatings: true,
                    averageRating: true,
                    createdAt: true,
                    position: {
                        select: {
                            id: true,
                            name: true,
                            level: true
                        }
                    },
                    institution: {
                        select: {
                            id: true,
                            name: true,
                            type: true
                        }
                    },
                    rating: {
                        take: 3,
                        select: {
                            score: true,
                            severity: true,
                            ratingCategory: {
                                select: {
                                    id: true,
                                    name: true,
                                    weight: true
                                }
                            }
                        },
                        orderBy: {
                            score: 'desc'
                        }
                    }
                },
                orderBy: [
                    { averageRating: 'desc' },
                    { totalRatings: 'desc' },
                    { createdAt: 'desc' }
                ]
            }),
            
            // Recent institutions with high ratings
            prisma.institution.findMany({
                take: 4,
                where: {
                    status: 'ACTIVE'
                },
                select: {
                    id: true,
                    name: true,
                    type: true,
                    avatar: true,
                    totalRatings: true,
                    averageRating: true,
                    createdAt: true,
                    rating: {
                        take: 3,
                        select: {
                            score: true,
                            severity: true,
                            ratingCategory: {
                                select: {
                                    id: true,
                                    name: true,
                                    weight: true
                                }
                            }
                        },
                        orderBy: {
                            score: 'desc'
                        }
                    }
                },
                orderBy: [
                    { averageRating: 'desc' },
                    { totalRatings: 'desc' },
                    { createdAt: 'desc' }
                ]
            })
        ]);

        return NextResponse.json({
            stats: {
                nomineeCount,
                institutionCount,
                totalRatings: Number(totalRatingsResult[0].count),
                activeNominees,
                activeInstitutions
            },
            topNominees: recentNominees.map(nominee => ({
                ...nominee,
                averageRating: nominee.averageRating ? Number(nominee.averageRating) : null
            })),
            topInstitutions: recentInstitutions.map(institution => ({
                ...institution,
                averageRating: institution.averageRating ? Number(institution.averageRating) : null
            }))
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}