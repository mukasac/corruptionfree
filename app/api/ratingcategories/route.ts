import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define types for better type safety
type CategoryType = 'nominee' | 'institution';
type SortField = 'weight' | 'createdAt' | 'name';
type SortOrder = 'asc' | 'desc';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        
        // Parse and validate query parameters
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('page') || '20')));
        const search = searchParams.get('search')?.trim() || '';
        const type = (searchParams.get('type') || 'nominee') as CategoryType;
        const sort = (searchParams.get('sort') || 'weight') as SortField;
        const order = (searchParams.get('order') || 'desc') as SortOrder;
        const departmentId = searchParams.get('departmentId');
        const impactAreaId = searchParams.get('impactAreaId');

        // Validate sort field
        if (!['weight', 'createdAt', 'name'].includes(sort)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid sort field'
            }, { status: 400 });
        }

        // Validate type
        if (!['nominee', 'institution'].includes(type)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid category type'
            }, { status: 400 });
        }

        const skip = (page - 1) * limit;

        // Build where clause with type safety
        const where = {
            AND: [
                search ? {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                        { keyword: { contains: search, mode: 'insensitive' } }
                    ]
                } : {},
                { isActive: true },
                departmentId ? {
                    departments: {
                        some: {
                            id: parseInt(departmentId)
                        }
                    }
                } : {},
                impactAreaId ? {
                    impactAreas: {
                        some: {
                            id: parseInt(impactAreaId)
                        }
                    }
                } : {}
            ]
        };

        const model = type === 'institution' ? prisma.institutionRatingCategory : prisma.ratingCategory;

        // Execute query with optimized includes
        const [categories, total] = await Promise.all([
            model.findMany({
                where,
                select: {
                    id: true,
                    keyword: true,
                    name: true,
                    icon: true,
                    description: true,
                    weight: true,
                    examples: true,
                    isActive: true,
                    minimumEvidence: true,
                    createdAt: true,
                    updatedAt: true,
                    departments: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    impactAreas: {
                        select: {
                            id: true,
                            name: true,
                            severity: true
                        }
                    }
                },
                orderBy: {
                    [sort]: order
                },
                skip,
                take: limit
            }),
            model.count({ where })
        ]);

        return NextResponse.json({
            success: true,
            data: categories,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + limit < total
            },
            meta: {
                type,
                search: search || null,
                departmentId: departmentId ? parseInt(departmentId) : null,
                impactAreaId: impactAreaId ? parseInt(impactAreaId) : null,
                sort,
                order
            }
        });

    } catch (error) {
        console.error('Error fetching rating categories:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to fetch rating categories' 
            }, 
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        const {
            type = 'nominee',
            keyword,
            name,
            icon = '⚠️',
            description,
            weight,
            examples = [],
            departmentIds = [],
            impactAreaIds = []
        } = body;

        // Validate type
        if (!['nominee', 'institution'].includes(type)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid category type'
            }, { status: 400 });
        }

        // Validate required fields
        if (!keyword?.trim() || !name?.trim() || !description?.trim() || typeof weight !== 'number') {
            return NextResponse.json({
                success: false,
                error: 'Missing or invalid required fields'
            }, { status: 400 });
        }

        // Validate weight range
        if (weight < 1 || weight > 5 || !Number.isInteger(weight)) {
            return NextResponse.json({
                success: false,
                error: 'Weight must be an integer between 1 and 5'
            }, { status: 400 });
        }

        // Validate arrays
        if (!Array.isArray(examples) || !Array.isArray(departmentIds) || !Array.isArray(impactAreaIds)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid array fields'
            }, { status: 400 });
        }

        // Verify departments exist
        if (departmentIds.length > 0) {
            const departments = await prisma.department.findMany({
                where: { id: { in: departmentIds } },
                select: { id: true }
            });
            if (departments.length !== departmentIds.length) {
                return NextResponse.json({
                    success: false,
                    error: 'One or more department IDs are invalid'
                }, { status: 400 });
            }
        }

        // Verify impact areas exist
        if (impactAreaIds.length > 0) {
            const impactAreas = await prisma.impactArea.findMany({
                where: { id: { in: impactAreaIds } },
                select: { id: true }
            });
            if (impactAreas.length !== impactAreaIds.length) {
                return NextResponse.json({
                    success: false,
                    error: 'One or more impact area IDs are invalid'
                }, { status: 400 });
            }
        }

        const model = type === 'institution' ? prisma.institutionRatingCategory : prisma.ratingCategory;

        const category = await model.create({
            data: {
                keyword: keyword.trim(),
                name: name.trim(),
                icon,
                description: description.trim(),
                weight,
                examples,
                departments: {
                    connect: departmentIds.map(id => ({ id }))
                },
                impactAreas: {
                    connect: impactAreaIds.map(id => ({ id }))
                },
                isActive: true,
                minimumEvidence: true
            },
            include: {
                departments: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                impactAreas: {
                    select: {
                        id: true,
                        name: true,
                        severity: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: category
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating rating category:', error);

        if (error.code === 'P2002') {
            return NextResponse.json({
                success: false,
                error: 'A category with this keyword already exists'
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: 'Failed to create rating category'
        }, { status: 500 });
    }
}