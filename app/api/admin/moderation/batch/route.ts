// app/api/admin/moderation/batch/route.ts
export async function POST(req: NextRequest) {
  try {
    const { ids, type, action, moderatorId } = await req.json();

    // Start transaction
    const results = await prisma.$transaction(async (tx) => {
      const updates = [];

      for (const id of ids) {
        let update;
        switch (type) {
          case 'NOMINEE':
            update = await tx.nominee.update({
              where: { id },
              data: { 
                status: action,
                updatedAt: new Date()
              }
            });
            break;

          case 'RATING':
            update = await tx.nomineeRating.update({
              where: { id },
              data: {
                status: action,
                verifiedAt: new Date(),
                verifiedBy: moderatorId
              }
            });
            break;

          case 'COMMENT':
            update = await tx.comment.update({
              where: { id },
              data: { 
                status: action,
                updatedAt: new Date()
              }
            });
            break;
        }
        updates.push(update);
      }

      // Create audit log
      await tx.adminLog.create({
        data: {
          action: `BATCH_${action}`,
          resourceType: type,
          resourceIds: ids,
          adminId: moderatorId,
          details: `Batch ${action.toLowerCase()} ${ids.length} ${type.toLowerCase()}s`
        }
      });

      return updates;
    });

    return NextResponse.json({ 
      success: true, 
      data: results 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process batch action' },
      { status: 500 }
    );
  }
}