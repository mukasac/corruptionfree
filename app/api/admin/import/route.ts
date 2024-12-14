// app/api/admin/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { adminMiddleware } from '../middleware';
import { z } from 'zod';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    await adminMiddleware(req);
    const { type, data } = await req.json();

    if (type === 'nominees') {
      // First validate and get references
      const positions = await prisma.position.findMany();
      const institutions = await prisma.institution.findMany();
      const districts = await prisma.district.findMany();

      // Process each nominee
      const results = await Promise.allSettled(
        data.map(async (nominee: any) => {
          // Find or create position
          const position = positions.find(p => p.name === nominee.position) ||
            await prisma.position.create({
              data: { name: nominee.position }
            });

          // Find or create institution
          const institution = institutions.find(i => i.name === nominee.institution) ||
            await prisma.institution.create({
              data: { 
                name: nominee.institution,
                type: 'GOVERNMENT' // Default type
              }
            });

          // Find or create district
          const district = districts.find(d => d.name === nominee.district) ||
            await prisma.district.create({
              data: { 
                name: nominee.district,
                region: 'Unknown' // Default region
              }
            });

          // Create nominee
          return await prisma.nominee.create({
            data: {
              name: nominee.name,
              title: nominee.title,
              evidence: nominee.evidence,
              positionId: position.id,
              institutionId: institution.id,
              districtId: district.id,
              status: 'PENDING'
            }
          });
        })
      );

      return NextResponse.json({
        success: true,
        results: results.map(r => r.status === 'fulfilled' ? r.value : r.reason)
      });

    } else if (type === 'institutions') {
      const results = await Promise.allSettled(
        data.map(async (institution: any) => {
          return await prisma.institution.create({
            data: {
              name: institution.name,
              type: institution.type,
              description: institution.description,
              website: institution.website,
              status: 'ACTIVE'
            }
          });
        })
      );

      return NextResponse.json({
        success: true,
        results: results.map(r => r.status === 'fulfilled' ? r.value : r.reason)
      });
    }

    return NextResponse.json(
      { error: 'Invalid import type' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import data' },
      { status: 500 }
    );
  }
}