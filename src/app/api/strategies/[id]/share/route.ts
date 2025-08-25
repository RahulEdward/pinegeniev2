import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';


// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user owns the strategy or has admin permission
    const strategy = await prisma.strategy.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: session.user.id },
          {
            sharedStrategies: {
              some: {
                sharedWith: session.user.id,
                permission: 'ADMIN',
              }
            }
          },
        ],
      },
    });

    if (!strategy) {
      return NextResponse.json(
        { error: 'Strategy not found or access denied' },
        { status: 404 }
      );
    }

    // Get all shares for this strategy
    const shares = await prisma.sharedStrategy.findMany({
      where: { strategyId: params.id },
      include: {
        sharedWithUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        sharedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        strategyId: params.id,
        isPublic: strategy.isPublic,
        shares: shares.map(share => ({
          id: share.id,
          sharedWith: share.sharedWithUser,
          sharedBy: share.sharedByUser,
          permission: share.permission,
          expiresAt: share.expiresAt,
          createdAt: share.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching strategy shares:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      shareWithEmail, 
      shareWithUserId, 
      permission = 'READ', 
      expiresAt,
      makePublic 
    } = body;

    // Check if user owns the strategy or has admin permission
    const strategy = await prisma.strategy.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: session.user.id },
          {
            sharedStrategies: {
              some: {
                sharedWith: session.user.id,
                permission: 'ADMIN',
              }
            }
          },
        ],
      },
    });

    if (!strategy) {
      return NextResponse.json(
        { error: 'Strategy not found or access denied' },
        { status: 404 }
      );
    }

    // Validate permission
    if (!['READ', 'WRITE', 'ADMIN'].includes(permission)) {
      return NextResponse.json(
        { error: 'Permission must be one of: READ, WRITE, ADMIN' },
        { status: 400 }
      );
    }

    // Handle making strategy public
    if (makePublic === true) {
      await prisma.strategy.update({
        where: { id: params.id },
        data: { isPublic: true },
      });

      return NextResponse.json({
        success: true,
        message: 'Strategy made public successfully',
        data: { isPublic: true },
      });
    }

    // Handle making strategy private
    if (makePublic === false) {
      await prisma.strategy.update({
        where: { id: params.id },
        data: { isPublic: false },
      });

      return NextResponse.json({
        success: true,
        message: 'Strategy made private successfully',
        data: { isPublic: false },
      });
    }

    // Handle sharing with specific user
    let targetUserId = shareWithUserId;

    // If email is provided, find the user
    if (shareWithEmail && !shareWithUserId) {
      const targetUser = await prisma.user.findUnique({
        where: { email: shareWithEmail },
        select: { id: true, name: true, email: true },
      });

      if (!targetUser) {
        return NextResponse.json(
          { error: 'User with this email not found' },
          { status: 404 }
        );
      }

      targetUserId = targetUser.id;
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Either shareWithEmail or shareWithUserId is required' },
        { status: 400 }
      );
    }

    // Prevent sharing with self
    if (targetUserId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot share strategy with yourself' },
        { status: 400 }
      );
    }

    // Validate expiration date
    if (expiresAt) {
      const expirationDate = new Date(expiresAt);
      if (expirationDate <= new Date()) {
        return NextResponse.json(
          { error: 'Expiration date must be in the future' },
          { status: 400 }
        );
      }
    }

    // Check if already shared with this user
    const existingShare = await prisma.sharedStrategy.findUnique({
      where: {
        strategyId_sharedWith: {
          strategyId: params.id,
          sharedWith: targetUserId,
        }
      },
    });

    if (existingShare) {
      // Update existing share
      const updatedShare = await prisma.sharedStrategy.update({
        where: { id: existingShare.id },
        data: {
          permission,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        },
        include: {
          sharedWithUser: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Strategy sharing updated successfully',
        data: updatedShare,
      });
    } else {
      // Create new share
      const newShare = await prisma.sharedStrategy.create({
        data: {
          strategyId: params.id,
          sharedBy: session.user.id,
          sharedWith: targetUserId,
          permission,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        },
        include: {
          sharedWithUser: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Strategy shared successfully',
        data: newShare,
      });
    }
  } catch (error) {
    console.error('Error sharing strategy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');
    const userId = searchParams.get('userId');

    if (!shareId && !userId) {
      return NextResponse.json(
        { error: 'Either shareId or userId is required' },
        { status: 400 }
      );
    }

    // Check if user owns the strategy or has admin permission
    const strategy = await prisma.strategy.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: session.user.id },
          {
            sharedStrategies: {
              some: {
                sharedWith: session.user.id,
                permission: 'ADMIN',
              }
            }
          },
        ],
      },
    });

    if (!strategy) {
      return NextResponse.json(
        { error: 'Strategy not found or access denied' },
        { status: 404 }
      );
    }

    // Build where clause for deletion
    const where: any = { strategyId: params.id };
    
    if (shareId) {
      where.id = shareId;
    } else if (userId) {
      where.sharedWith = userId;
    }

    // Delete the share
    const deletedShare = await prisma.sharedStrategy.deleteMany({ where });

    if (deletedShare.count === 0) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Strategy sharing removed successfully',
    });
  } catch (error) {
    console.error('Error removing strategy share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}