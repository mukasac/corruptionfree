// lib/audit.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuditLogEntry {
  action: string;
  resourceType: string;
  resourceIds: number[];
  adminId: number;
  details?: string;
  metadata?: Record<string, any>;
}

export async function logAdminAction({
  action,
  resourceType,
  resourceIds,
  adminId,
  details,
  metadata
}: AuditLogEntry) {
  try {
    await prisma.adminLog.create({
      data: {
        action,
        resourceType,
        resourceIds,
        adminId,
        details,
        metadata
      }
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}