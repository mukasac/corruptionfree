// app/api/admin/moderation/ratings/[id]/route.ts
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      await adminMiddleware(req);
      
      const id = parseInt(params.id);
      const { action } = await req.json();
  
      const rating = await prisma.nomineeRating.update({
        where: { id },
        data: {
          status: action,
          verifiedAt: new Date(),
          verifiedBy: 1 // Replace with actual admin ID
        },
        include: {
          nominee: true,
          institution: true,
          user: {
            select: {
              email: true
            }
          }
        }
      });
  
      // Send notification email
      await sendModerationEmail({
        to: rating.user.email,
        type: 'RATING',
        action,
        targetName: rating.nominee?.name || rating.institution?.name
      });
  
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error updating rating:', error);
      return NextResponse.json(
        { error: 'Failed to update rating' },
        { status: 500 }
      );
    }
  }