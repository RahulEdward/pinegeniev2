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

    const folder = await prisma.strategyFolder.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            color: true,
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            color: true,
            description: true,
            createdAt: true,
            _count: {
              select: {
                strategies: true,
                children: true,
              }
            }
          },
          orderBy: {
            name: 'asc',
          }
        },
        strategies: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            isPublic: true,
            tags: true,
            version: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                backtestResults: true,
                strategyVersions: true,
              }
            }
          },
          orderBy: {
            updatedAt: 'desc',
          }
        },
        _count: {
          select: {
            strategies: true,
            children: true,
          }
        }
      },
    });

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

    // Parse tags in strategies
    const folderWithParsedData = {
      ...folder,
      strategies: folder.strategies.map(strategy => ({
        ...strategy,
        tags: strategy.tags ? JSON.parse(strategy.tags) : [],
      }))
    };

    return NextResponse.json({
      success: true,
      data: folderWithParsedData,
    });
  } catch (error) {
    console.error('Error fetching folder:', error);
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
    const { name, description, parentId, color } = body;

    // Check if folder exists and user owns it
    const existingFolder = await prisma.strategyFolder.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingFolder) {
      return NextResponse.json(
        { error: 'Folder not found or access denied' },
        { status: 404 }
      );
    }

    // Validate name if provided
    if (name !== undefined) {
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Folder name is required' },
          { status: 400 }
        );
      }

      // Check for duplicate folder names in the same parent (excluding current folder)
      const duplicateFolder = await prisma.strategyFolder.findFirst({
        where: {
          userId: session.user.id,
          name: name.trim(),
          parentId: parentId !== undefined ? (parentId || null) : existingFolder.parentId,
          id: { not: params.id },
        },
      });

      if (duplicateFolder) {
        return NextResponse.json(
          { error: 'A folder with this name already exists in the same location' },
          { status: 409 }
        );
      }
    }

    // Validate parent folder if provided
    if (parentId !== undefined && parentId !== null) {
      // Prevent moving folder into itself or its descendants
      if (parentId === params.id) {
        return NextResponse.json(
          { error: 'Cannot move folder into itself' },
          { status: 400 }
        );
      }

      // Check if parent folder exists and user owns it
      const parentFolder = await prisma.strategyFolder.findFirst({
        where: {
          id: parentId,
          userId: session.user.id,
        },
      });

      if (!parentFolder) {
        return NextResponse.json(
          { error: 'Parent folder not found or access denied' },
          { status: 404 }
        );
      }

      // Check for circular reference (prevent moving folder into its own descendant)
      const isDescendant = await checkIfDescendant(parentId, params.id);
      if (isDescendant) {
        return NextResponse.json(
          { error: 'Cannot move folder into its own descendant' },
          { status: 400 }
        );
      }
    }

    // Validate color format if provided
    if (color !== undefined && color !== null && !/^#[0-9A-F]{6}$/i.test(color)) {
      return NextResponse.json(
        { error: 'Color must be a valid hex color code (e.g., #FF0000)' },
        { status: 400 }
      );
    }

    const folder = await prisma.strategyFolder.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(parentId !== undefined && { parentId: parentId || null }),
        ...(color !== undefined && { color: color || null }),
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            color: true,
          }
        },
        _count: {
          select: {
            strategies: true,
            children: true,
          }
        }
      },
    });

    return NextResponse.json({
      success: true,
      data: folder,
    });
  } catch (error) {
    console.error('Error updating folder:', error);
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
    const force = searchParams.get('force') === 'true';

    // Check if folder exists and user owns it
    const existingFolder = await prisma.strategyFolder.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            strategies: true,
            children: true,
          }
        }
      },
    });

    if (!existingFolder) {
      return NextResponse.json(
        { error: 'Folder not found or access denied' },
        { status: 404 }
      );
    }

    // Check if folder has content and force flag is not set
    if (!force && (existingFolder._count.strategies > 0 || existingFolder._count.children > 0)) {
      return NextResponse.json(
        { 
          error: 'Folder is not empty. Use force=true to delete folder and move contents to parent folder.',
          details: {
            strategiesCount: existingFolder._count.strategies,
            childrenCount: existingFolder._count.children,
          }
        },
        { status: 409 }
      );
    }

    // If force delete, move strategies and child folders to parent
    if (force) {
      await prisma.$transaction(async (tx) => {
        // Move strategies to parent folder
        await tx.strategy.updateMany({
          where: { folderId: params.id },
          data: { folderId: existingFolder.parentId },
        });

        // Move child folders to parent folder
        await tx.strategyFolder.updateMany({
          where: { parentId: params.id },
          data: { parentId: existingFolder.parentId },
        });

        // Delete the folder
        await tx.strategyFolder.delete({
          where: { id: params.id },
        });
      });
    } else {
      // Simple delete (folder should be empty)
      await prisma.strategyFolder.delete({
        where: { id: params.id },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Folder deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to check if a folder is a descendant of another folder
async function checkIfDescendant(potentialAncestorId: string, folderId: string): Promise<boolean> {
  const folder = await prisma.strategyFolder.findUnique({
    where: { id: potentialAncestorId },
    select: { parentId: true },
  });

  if (!folder || !folder.parentId) {
    return false;
  }

  if (folder.parentId === folderId) {
    return true;
  }

  return checkIfDescendant(folder.parentId, folderId);
}