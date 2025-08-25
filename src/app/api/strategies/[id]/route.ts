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

    const strategy = await prisma.strategy.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: session.user.id }, // User's own strategy
          { isPublic: true }, // Public strategy
          {
            sharedStrategies: {
              some: {
                sharedWith: session.user.id,
              }
            }
          }, // Shared with user
        ],
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            category: true,
            difficulty: true,
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        backtestResults: {
          select: {
            id: true,
            status: true,
            performanceMetrics: true,
            startedAt: true,
            completedAt: true,
          },
          orderBy: {
            startedAt: 'desc',
          },
          take: 5, // Latest 5 backtest results
        },
        strategyVersions: {
          select: {
            id: true,
            version: true,
            name: true,
            changeLog: true,
            createdAt: true,
          },
          orderBy: {
            version: 'desc',
          },
        },
        sharedStrategies: {
          where: {
            sharedWith: session.user.id,
          },
          select: {
            permission: true,
            expiresAt: true,
          }
        },
        _count: {
          select: {
            backtestResults: true,
            strategyVersions: true,
            sharedStrategies: true,
          }
        }
      },
    });

    if (!strategy) {
      return NextResponse.json(
        { error: 'Strategy not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const responseStrategy = {
      ...strategy,
      nodes: JSON.parse(strategy.nodes as string),
      connections: JSON.parse(strategy.connections as string),
      tags: strategy.tags ? JSON.parse(strategy.tags) : [],
      backtestResults: strategy.backtestResults.map(result => ({
        ...result,
        performanceMetrics: result.performanceMetrics ? JSON.parse(result.performanceMetrics as string) : null,
      })),
    };

    return NextResponse.json({
      success: true,
      data: responseStrategy,
    });
  } catch (error) {
    console.error('Error fetching strategy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
      name, 
      description, 
      category, 
      nodes, 
      connections, 
      pineScriptCode, 
      isPublic, 
      tags, 
      folderId,
      changeLog
    } = body;

    // Check if strategy exists and user has permission to edit
    const existingStrategy = await prisma.strategy.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: session.user.id }, // User's own strategy
          {
            sharedStrategies: {
              some: {
                sharedWith: session.user.id,
                permission: { in: ['WRITE', 'ADMIN'] },
              }
            }
          }, // Shared with write permission
        ],
      },
    });

    if (!existingStrategy) {
      return NextResponse.json(
        { error: 'Strategy not found or access denied' },
        { status: 404 }
      );
    }

    // Validate folder ownership if folderId is provided
    if (folderId && folderId !== existingStrategy.folderId) {
      const folder = await prisma.strategyFolder.findFirst({
        where: {
          id: folderId,
          userId: session.user.id,
        },
      });

      if (!folder) {
        return NextResponse.json(
          { error: 'Folder not found or access denied' },
          { status: 404 }
        );
      }
    }

    // Check if this is a significant change that warrants a new version
    const shouldCreateVersion = 
      (nodes && JSON.stringify(nodes) !== existingStrategy.nodes) ||
      (connections && JSON.stringify(connections) !== existingStrategy.connections) ||
      (pineScriptCode && pineScriptCode !== existingStrategy.pineScriptCode);

    let newVersion = existingStrategy.version;
    
    if (shouldCreateVersion) {
      newVersion = existingStrategy.version + 1;
    }

    // Update the strategy
    const strategy = await prisma.strategy.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(nodes && { nodes: JSON.stringify(nodes) }),
        ...(connections && { connections: JSON.stringify(connections) }),
        ...(pineScriptCode !== undefined && { pineScriptCode }),
        ...(isPublic !== undefined && { isPublic }),
        ...(tags && { tags: JSON.stringify(tags) }),
        ...(folderId !== undefined && { folderId }),
        ...(shouldCreateVersion && { version: newVersion }),
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            category: true,
          }
        },
      },
    });

    // Create new version if significant changes were made
    if (shouldCreateVersion) {
      await prisma.strategyVersion.create({
        data: {
          strategyId: strategy.id,
          version: newVersion,
          name: name || strategy.name,
          description: description !== undefined ? description : strategy.description,
          nodes: nodes ? JSON.stringify(nodes) : strategy.nodes,
          connections: connections ? JSON.stringify(connections) : strategy.connections,
          pineScriptCode: pineScriptCode !== undefined ? pineScriptCode : strategy.pineScriptCode,
          changeLog: changeLog || `Version ${newVersion} - Updated strategy`,
        },
      });
    }

    // Parse the response data
    const responseStrategy = {
      ...strategy,
      nodes: JSON.parse(strategy.nodes as string),
      connections: JSON.parse(strategy.connections as string),
      tags: strategy.tags ? JSON.parse(strategy.tags) : [],
    };

    return NextResponse.json({
      success: true,
      data: responseStrategy,
    });
  } catch (error) {
    console.error('Error updating strategy:', error);
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

    // Check if strategy exists and user has permission to delete
    const existingStrategy = await prisma.strategy.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: session.user.id }, // User's own strategy
          {
            sharedStrategies: {
              some: {
                sharedWith: session.user.id,
                permission: 'ADMIN',
              }
            }
          }, // Shared with admin permission
        ],
      },
    });

    if (!existingStrategy) {
      return NextResponse.json(
        { error: 'Strategy not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the strategy (cascade will handle related records)
    await prisma.strategy.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Strategy deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting strategy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}