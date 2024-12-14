// app/api/admin/moderation/comments/route.ts
export async function GET(req: NextRequest) {
    try {
      await adminMiddleware(req);
      
      const { searchParams } = new URL(req.url);
      const status = searchParams.get('status') || 'PENDING';
      const type = searchParams.get('type');
      const search = searchParams.get('search') || '';
  
      const where = {
        AND: [
          { status },
          type !== 'ALL' ? {
            OR: [
              { nomineeId: type === 'NOMINEE' ? { not: null } : undefined },
              { institutionId: type === 'INSTITUTION' ? { not: null } : undefined }
            ].filter(Boolean)
          } : {},
          search ? {
            OR: [
              { content: { contains: search, mode: 'insensitive' } },
              { user: { name: { contains: search, mode: 'insensitive' } } }
            ]
          } : {}
        ]
      };
  
      const comments = await prisma.comment.findMany({
        where,
        include: {
          nominee: {
            select: {
              id: true,
              name: true
            }
          },
          institution: {
            select: {
              id: true,
              name: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
  
      return NextResponse.json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }
  }