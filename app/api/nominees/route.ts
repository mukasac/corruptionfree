import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, NomineeStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
   try {
       const { searchParams } = new URL(req.url);
       
       const page = parseInt(searchParams.get('page') || '1');
       const limit = parseInt(searchParams.get('limit') || '10');
       const search = searchParams.get('search') || '';
       const status = searchParams.get('status') as NomineeStatus | null;
       const institutionId = searchParams.get('institutionId');
       const positionId = searchParams.get('positionId');
       const districtId = searchParams.get('districtId');
       
       // Calculate pagination
       const skip = (page - 1) * limit;

       // Build where clause for filtering
       const where = {
           AND: [
               search ? {
                   OR: [
                       { name: { contains: search, mode: 'insensitive' } },
                       { biography: { contains: search, mode: 'insensitive' } }
                   ]
               } : {},
               status ? { status } : {},
               institutionId ? { institutionId: parseInt(institutionId) } : {},
               positionId ? { positionId: parseInt(positionId) } : {},
               districtId ? { districtId: parseInt(districtId) } : {}
           ]
       };

       // Execute query with pagination and filtering
       const [nominees, total] = await Promise.all([
           prisma.nominee.findMany({
               where,
               skip,
               take: limit,
               orderBy: {
                   createdAt: 'desc'
               },
               include: {
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
                   district: {
                       select: {
                           id: true,
                           name: true,
                           region: true
                       }
                   },
                   rating: {
                       select: {
                           evidence: true,
                           severity: true,
                           score: true,
                           ratingCategory: {
                               select: {
                                   id: true,
                                   name: true,
                                   weight: true
                               }
                           }
                       }
                   }
               }
           }),
           prisma.nominee.count({ where })
       ]);

       return NextResponse.json({
           success: true,
           data: nominees,
           pagination: {
               total,
               page,
               limit,
               totalPages: Math.ceil(total / limit)
           }
       });

   } catch (error) {
       console.error('Error fetching nominees:', error);
       return NextResponse.json(
           { success: false, error: 'Failed to fetch nominees' },
           { status: 500 }
       );
   }
}

export async function POST(req: NextRequest) {
   try {
       const { 
           name,
           title,
           biography,
           avatar,
           positionId,
           institutionId,
           districtId,
           status = 'PENDING',
           evidence
       } = await req.json();

       // Validate required fields
       if (!name?.trim()) {
           return NextResponse.json(
               { success: false, error: 'Nominee name is required' },
               { status: 400 }
           );
       }

       if (!positionId) {
           return NextResponse.json(
               { success: false, error: 'Position is required' },
               { status: 400 }
           );
       }

       if (!institutionId) {
           return NextResponse.json(
               { success: false, error: 'Institution is required' },
               { status: 400 }
           );
       }

       if (!districtId) {
           return NextResponse.json(
               { success: false, error: 'District is required' },
               { status: 400 }
           );
       }

       // Validate status
       if (status && !Object.values(NomineeStatus).includes(status as NomineeStatus)) {
           return NextResponse.json(
               { success: false, error: 'Invalid nominee status' },
               { status: 400 }
           );
       }

       // Verify related records exist
       const [position, institution, district] = await Promise.all([
           prisma.position.findUnique({ where: { id: positionId } }),
           prisma.institution.findUnique({ where: { id: institutionId } }),
           prisma.district.findUnique({ where: { id: districtId } })
       ]);

       if (!position || !institution || !district) {
           return NextResponse.json(
               { success: false, error: 'Invalid position, institution, or district ID' },
               { status: 400 }
           );
       }

       const nominee = await prisma.nominee.create({
           data: {
               name: name.trim(),
               title: title?.trim(),
               biography: biography?.trim(),
               avatar: avatar?.trim(),
               positionId,
               institutionId,
               districtId,
               status: status as NomineeStatus,
               evidence: evidence?.trim(),
               totalRatings: 0
           },
           include: {
               position: true,
               institution: true,
               district: true
           }
       });

       return NextResponse.json({
           success: true,
           data: nominee
       });

   } catch (error) {
       console.error('Error creating nominee:', error);
       return NextResponse.json(
           { success: false, error: 'Failed to create nominee' },
           { status: 500 }
       );
   }
}