import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';


// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeStrategies = searchParams.get('includeStrategies') === 'true';
    const parentId = searchParams.get('parentId');

    // Build where clause for hierarchical fetching
    const where: any = {
      userId: session.user.id,
    };

    if (parentId !== null) {
      where.parentId = parentId === 'null' ? null : parentId;
    }

    const folders = await prisma.strategyFolder.findMany({
      where,
      include: {
        children: {
          select: {
            id: true,
            name: true,
            color: true,
            _count: {
              select: {
                strategies: true,
                children: true,
              }
            }
          }
        },
        ...(includeStrategies && {
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
            },
            orderBy: {
              updatedAt: 'desc',
            }
          }
        }),
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
    });

    // Parse tags in strategies if included
    const foldersWithParsedData = folders.map(folder => ({
      ...folder,
      ...(includeStrategies && {
        strategies: folder.strategies?.map(strategy => ({
          ...strategy,
          tags: strategy.tags ? JSON.parse(strategy.tags) : [],
        }))
      })
    }));

    return NextResponse.json({
      success: true,
      data: foldersWithParsedData,
    });
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    // Validate parent folder if provided
    if (parentId) {
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
    }

    // Check for duplicate folder names in the same parent
    const existingFolder = await prisma.strategyFolder.findFirst({
      where: {
        userId: session.user.id,
        name: name.trim(),
        parentId: parentId || null,
      },
    });

    if (existingFolder) {
      return NextResponse.json(
        { error: 'A folder with this name already exists in the same location' },
        { status: 409 }
      );
    }

    // Validate color format if provided
    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      return NextResponse.json(
        { error: 'Color must be a valid hex color code (e.g., #FF0000)' },
        { status: 400 }
      );
    }

    const folder = await prisma.strategyFolder.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        description: description?.trim() || null,
        parentId: parentId || null,
        color: color || null,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
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
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}