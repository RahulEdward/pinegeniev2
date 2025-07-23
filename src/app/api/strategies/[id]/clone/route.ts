import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

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
    const { name, description, folderId, includeVersions = false } = body;

    // Get the strategy to clone with access check
    const originalStrategy = await prisma.strategy.findFirst({
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
        ...(includeVersions && {
          strategyVersions: {
            orderBy: {
              version: 'asc',
            },
          },
        }),
      },
    });

    if (!originalStrategy) {
      return NextResponse.json(
        { error: 'Strategy not found or access denied' },
        { status: 404 }
      );
    }

    // Validate folder ownership if folderId is provided
    if (folderId) {
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

    // Generate unique name if not provided
    let cloneName = name;
    if (!cloneName) {
      cloneName = `${originalStrategy.name} (Copy)`;
      
      // Ensure uniqueness
      let counter = 1;
      while (await prisma.strategy.findFirst({
        where: {
          userId: session.user.id,
          name: cloneName,
        },
      })) {
        cloneName = `${originalStrategy.name} (Copy ${counter})`;
        counter++;
      }
    } else {
      // Check if provided name already exists
      const existingStrategy = await prisma.strategy.findFirst({
        where: {
          userId: session.user.id,
          name: cloneName,
        },
      });

      if (existingStrategy) {
        return NextResponse.json(
          { error: 'Strategy with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Clone the strategy
    const clonedStrategy = await prisma.strategy.create({
      data: {
        userId: session.user.id,
        name: cloneName,
        description: description || `Cloned from: ${originalStrategy.name}`,
        category: originalStrategy.category,
        nodes: originalStrategy.nodes,
        connections: originalStrategy.connections,
        pineScriptCode: originalStrategy.pineScriptCode,
        isPublic: false, // Always clone as private
        tags: originalStrategy.tags,
        folderId,
        version: 1,
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          }
        },
      },
    });

    // Create initial version for cloned strategy
    await prisma.strategyVersion.create({
      data: {
        strategyId: clonedStrategy.id,
        version: 1,
        name: clonedStrategy.name,
        description: clonedStrategy.description,
        nodes: clonedStrategy.nodes,
        connections: clonedStrategy.connections,
        pineScriptCode: clonedStrategy.pineScriptCode,
        changeLog: `Cloned from strategy: ${originalStrategy.name}`,
      },
    });

    // Clone versions if requested and available
    if (includeVersions && originalStrategy.strategyVersions && originalStrategy.strategyVersions.length > 0) {
      for (const version of originalStrategy.strategyVersions) {
        if (version.version > 1) { // Skip version 1 as it's already created
          await prisma.strategyVersion.create({
            data: {
              strategyId: clonedStrategy.id,
              version: version.version,
              name: version.name,
              description: version.description,
              nodes: version.nodes,
              connections: version.connections,
              pineScriptCode: version.pineScriptCode,
              changeLog: `${version.changeLog} (Cloned)`,
            },
          });
        }
      }

      // Update strategy to latest version if versions were cloned
      const latestVersion = Math.max(...originalStrategy.strategyVersions.map(v => v.version));
      if (latestVersion > 1) {
        const latestVersionData = originalStrategy.strategyVersions.find(v => v.version === latestVersion);
        if (latestVersionData) {
          await prisma.strategy.update({
            where: { id: clonedStrategy.id },
            data: {
              version: latestVersion,
              nodes: latestVersionData.nodes,
              connections: latestVersionData.connections,
              pineScriptCode: latestVersionData.pineScriptCode,
            },
          });
        }
      }
    }

    // Parse the response data
    const responseStrategy = {
      ...clonedStrategy,
      nodes: JSON.parse(clonedStrategy.nodes as string),
      connections: JSON.parse(clonedStrategy.connections as string),
      tags: clonedStrategy.tags ? JSON.parse(clonedStrategy.tags) : [],
    };

    return NextResponse.json({
      success: true,
      data: responseStrategy,
      message: `Strategy cloned successfully as "${cloneName}"`,
      versionsCloned: includeVersions && originalStrategy.strategyVersions ? originalStrategy.strategyVersions.length : 1,
    });
  } catch (error) {
    console.error('Error cloning strategy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}