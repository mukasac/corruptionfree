import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        
        // Calculate pagination
        const skip = (page - 1) * limit;

        // Build where clause for filtering
        const where = {
            ...(search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                ]
            } : {})
        };

        // Execute query with pagination and filtering
        const [districts, total] = await Promise.all([
            prisma.district.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                },
                select: {
                    id: true,
                    name: true,
                    region: true,
                    description: true,
                    population: true,
                    createdAt: true,
                    updatedAt: true,
                }
            }),
            prisma.district.count({ where })
        ]);

        return NextResponse.json({
            success: true,
            data: districts,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching districts:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch districts' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, region = 'Default Region', description, population } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, error: 'Name is required' },
                { status: 400 }
            );
        }

        // Check if district with same name already exists
        const existingDistrict = await prisma.district.findUnique({
            where: { name }
        });

        if (existingDistrict) {
            return NextResponse.json(
                { success: false, error: 'District with this name already exists' },
                { status: 400 }
            );
        }

        const district = await prisma.district.create({
            data: {
                name,
                region,
                description,
                population: population ? parseInt(population) : null
            }
        });

        return NextResponse.json({
            success: true,
            data: district
        });

    } catch (error) {
        console.error('Error creating district:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create district' },
            { status: 500 }
        );
    }
}