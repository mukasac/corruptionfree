import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
   try {
       const { searchParams } = new URL(req.url);
       
       const page = parseInt(searchParams.get('page') || '1');
       const limit = parseInt(searchParams.get('limit') || '10');
       const search = searchParams.get('search') || '';
       const level = searchParams.get('level') || '';
       
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
               level ? { level: { equals: level } } : {}
           ]
       };

       // Execute query with pagination and filtering
       const [positions, total] = await Promise.all([
           prisma.position.findMany({
               where,
               skip,
               take: limit,
               orderBy: {
                   createdAt: 'desc'
               },
               select: {
                   id: true,
                   name: true,
                   description: true,
                   level: true,
                   createdAt: true,
                   updatedAt: true,
                   _count: {
                       select: {
                           nominees: true
                       }
                   }
               }
           }),
           prisma.position.count({ where })
       ]);

       return NextResponse.json({
           success: true,
           data: positions,
           pagination: {
               total,
               page,
               limit,
               totalPages: Math.ceil(total / limit)
           }
       });

   } catch (error) {
       console.error('Error fetching positions:', error);
       return NextResponse.json(
           { success: false, error: 'Failed to fetch positions' },
           { status: 500 }
       );
   }
}

export async function POST(req: NextRequest) {
   try {
       const body = await req.json();
       const { 
           name,
           description,
           level 
       } = body;

       if (!name?.trim()) {
           return NextResponse.json(
               { success: false, error: 'Position name is required' },
               { status: 400 }
           );
       }

       // Check for existing position with same name
       const existingPosition = await prisma.position.findUnique({
           where: { name: name.trim() }
       });

       if (existingPosition) {
           return NextResponse.json(
               { success: false, error: 'Position with this name already exists' },
               { status: 400 }
           );
       }

       const position = await prisma.position.create({
           data: {
               name: name.trim(),
               description: description?.trim(),
               level: level?.trim()
           }
       });

       return NextResponse.json({
           success: true,
           data: position
       });

   } catch (error) {
       console.error('Error creating position:', error);
       return NextResponse.json(
           { success: false, error: 'Failed to create position' },
           { status: 500 }
       );
   }
}