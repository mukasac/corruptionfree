// app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { adminMiddleware } from '@/lib/middleware';
import { logAdminAction } from '@/lib/audit';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const admin = await adminMiddleware(req);

    const settings = await prisma.systemSettings.findMany({
      orderBy: {
        key: 'asc'
      }
    });

    // Convert array of settings to structured object
    const structuredSettings = settings.reduce((acc, setting) => {
      const [section, key] = setting.key.split('.');
      if (!acc[section]) acc[section] = {};
      acc[section][key] = setting.value;
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json(structuredSettings);

  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await adminMiddleware(req);
    const updates = await req.json();

    // Process each setting update
    const updatePromises = Object.entries(updates).flatMap(([section, settings]) =>
      Object.entries(settings as Record<string, any>).map(([key, value]) =>
        prisma.systemSettings.upsert({
          where: {
            key: `${section}.${key}`
          },
          update: {
            value: value as any,
            updatedBy: admin.sub
          },
          create: {
            key: `${section}.${key}`,
            value: value as any,
            updatedBy: admin.sub
          }
        })
      )
    );

    await Promise.all(updatePromises);

    // Log the settings update
    await logAdminAction({
      action: 'UPDATE_SETTINGS',
      resourceType: 'SETTINGS',
      resourceIds: [],
      adminId: parseInt(admin.sub),
      details: 'Updated system settings'
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}