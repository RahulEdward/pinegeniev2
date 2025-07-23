import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has write access to the strategy
    const strategy = await prisma.strategy.findFirst({
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

    if (!strategy) {
      return NextResponse.json(
        { error: 'Strategy not found or access denied' },
        { status: 404 }
      );
    }

    // Get the version to restore
    const versionToRestore = await prisma.strategyVersion.findFirst({
      where: {
        id: params.versionId,
        strategyId: params.id,
      },
    });

    if (!versionToRestore) {
      return NextResponse.json(
        { error: 'Version not found' },
        { status: 404 }
      );
    }

    // Create a new version from current state before restoring
    const currentMaxVersion = await prisma.strategyVersion.findFirst({
      where: {
        strategyId: params.id,
      },
      orderBy: {
        version: 'desc',
      },
    });

    const newVersionNumber = (currentMaxVersion?.version || 0) + 1;

    // Save current state as new version
    await prisma.strategyVersion.create({
      data: {
        strategyId: params.id,
        version: newVersionNumber,
        name: strategy.name,
        description: strategy.description,
        nodes: strategy.nodes,
        connections: strategy.connections,
        pineScriptCode: strategy.pineScriptCode,
        changeLog: `Backup before restoring to version ${versionToRestore.version}`,
      },
    });

    // Restore the strategy to the selected version
    const restoredStrategy = await prisma.strategy.update({
      where: { id: params.id },
      data: {
        name: versionToRestore.name,
        description: versionToRestore.description,
        nodes: versionToRestore.nodes,
        connections: versionToRestore.connections,
        pineScriptCode: versionToRestore.pineScriptCode,
        version: newVersionNumber + 1,
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

    // Create version entry for the restored state
    await prisma.strategyVersion.create({
      data: {
        strategyId: params.id,
        version: newVersionNumber + 1,
        name: versionToRestore.name,
        description: versionToRestore.description,
        nodes: versionToRestore.nodes,
        connections: versionToRestore.connections,
        pineScriptCode: versionToRestore.pineScriptCode,
        changeLog: `Restored from version ${versionToRestore.version}`,
      },
    });

    // Parse the response data
    const responseStrategy = {
      ...restoredStrategy,
      nodes: JSON.parse(restoredStrategy.nodes as string),
      connections: JSON.parse(restoredStrategy.connections as string),
      tags: restoredStrategy.tags ? JSON.parse(restoredStrategy.tags) : [],
    };

    return NextResponse.json({
      success: true,
      data: responseStrategy,
      message: `Strategy restored to version ${versionToRestore.version}`,
    });
  } catch (error) {
    console.error('Error restoring strategy version:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}