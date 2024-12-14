// app/api/admin/audit/route.ts
export async function GET(req: NextRequest) {
    try {
      await adminMiddleware(req);
  
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');
      const action = searchParams.get('action');
      const adminId = searchParams.get('adminId');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
  
      const where = {
        AND: [
          action ? { action } : {},
          adminId ? { adminId: parseInt(adminId) } : {},
          startDate && endDate ? {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          } : {}
        ]
      };
  
      const [logs, total] = await Promise.all([
        prisma.adminLog.findMany({
          where,
          include: {
            admin: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.adminLog.count({ where })
      ]);
  
      return NextResponse.json({
        data: logs,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch audit logs' },
        { status: 500 }
      );
    }
  }