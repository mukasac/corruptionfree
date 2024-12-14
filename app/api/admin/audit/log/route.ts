// app/api/admin/audit/log/route.ts
export async function POST(req: NextRequest) {
    try {
      const { action, resourceType, resourceIds, adminId, details } = await req.json();
  
      const log = await prisma.adminLog.create({
        data: {
          action,
          resourceType,
          resourceIds,
          adminId,
          details,
          metadata: {
            userAgent: req.headers.get('user-agent'),
            ip: req.ip || req.headers.get('x-forwarded-for')
          }
        }
      });
  
      return NextResponse.json({ success: true, data: log });
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to create audit log' },
        { status: 500 }
      );
    }
  }
  