import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, InstitutionType, InstitutionStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const type = searchParams.get('type') as InstitutionType | null;
        const status = searchParams.get('status') as InstitutionStatus | null;
        
        // Calculate pagination
        const skip = (page - 1) * limit;

        // Build where clause for filtering
        const where = {
            AND: [
                search ? {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } }
                    ]
                } : {},
                type ? { type } : {},
                status ? { status } : {}
            ]
        };

        // Execute query with pagination and filtering
        const [institutions, total] = await Promise.all([
            prisma.institution.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                },
                select: {
                    id: true,
                    name: true,
                    type: true,
                    avatar: true,
                    description: true,
                    website: true,
                    status: true,
                    totalRatings: true,
                    averageRating: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            nominees: true,
                            rating: true,
                            comments: true
                        }
                    }
                }
            }),
            prisma.institution.count({ where })
        ]);

        return NextResponse.json({
            success: true,
            data: institutions,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching institutions:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch institutions' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { 
            name, 
            type = 'GOVERNMENT', 
            description, 
            website,
            avatar,
            status = 'ACTIVE'
        } = body;

        if (!name?.trim()) {
            return NextResponse.json(
                { success: false, error: 'Institution name is required' },
                { status: 400 }
            );
        }

        // Check for existing institution with same name
        const existingInstitution = await prisma.institution.findUnique({
            where: { name: name.trim() }
        });

        if (existingInstitution) {
            return NextResponse.json(
                { success: false, error: 'Institution with this name already exists' },
                { status: 400 }
            );
        }

        // Validate institution type
        if (type && !Object.values(InstitutionType).includes(type as InstitutionType)) {
            return NextResponse.json(
                { success: false, error: 'Invalid institution type' },
                { status: 400 }
            );
        }

        // Validate institution status
        if (status && !Object.values(InstitutionStatus).includes(status as InstitutionStatus)) {
            return NextResponse.json(
                { success: false, error: 'Invalid institution status' },
                { status: 400 }
            );
        }

        const institution = await prisma.institution.create({
            data: {
                name: name.trim(),
                type: type as InstitutionType,
                description: description?.trim(),
                website: website?.trim(),
                avatar: avatar?.trim(),
                status: status as InstitutionStatus,
                totalRatings: 0,
                averageRating: null
            }
        });

        return NextResponse.json({
            success: true,
            data: institution
        });

    } catch (error) {
        console.error('Error creating institution:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create institution' },
            { status: 500 }
        );
    }
}