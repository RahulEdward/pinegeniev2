import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { StrategySearchFilters } from '@/types/strategy';
import { subscriptionPlanManager } from '@/services/subscription';


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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const isPublic = searchParams.get('isPublic');
    const folderId = searchParams.get('folderId');
    const search = searchParams.get('search');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: session.user.id,
    };

    if (category) {
      where.category = category;
    }

    if (isPublic !== null && isPublic !== undefined) {
      where.isPublic = isPublic === 'true';
    }

    if (folderId) {
      where.folderId = folderId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Handle tags filtering (stored as JSON string)
    if (tags && tags.length > 0) {
      // For SQLite, we need to use a different approach for JSON queries
      // This is a simplified version - in production, consider using a proper JSON query
      where.tags = {
        not: null
      };
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Get strategies with pagination
    const [strategies, totalCount] = await Promise.all([
      prisma.strategy.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          isPublic: true,
          tags: true,
          version: true,
          folderId: true,
          templateId: true,
          createdAt: true,
          updatedAt: true,
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
          _count: {
            select: {
              backtestResults: true,
              strategyVersions: true,
            }
          }
        },
      }),
      prisma.strategy.count({ where }),
    ]);

    // Parse tags from JSON strings
    const strategiesWithParsedTags = strategies.map(strategy => ({
      ...strategy,
      tags: strategy.tags ? JSON.parse(strategy.tags) : [],
    }));

    return NextResponse.json({
      success: true,
      data: {
        strategies: strategiesWithParsedTags,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching strategies:', error);
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

    // Check script storage limit before creating strategy
    const storageCheck = await subscriptionPlanManager.checkScriptStorageLimit(session.user.id);
    
    if (!storageCheck.hasAccess) {
      return NextResponse.json({
        error: 'Strategy storage limit reached',
        upgradeRequired: true,
        message: `You have reached your strategy storage limit (${storageCheck.currentCount}/${storageCheck.limit}). Upgrade to Pro or Premium for unlimited strategy storage.`,
        currentCount: storageCheck.currentCount,
        limit: storageCheck.limit,
        remaining: storageCheck.remaining
      }, { status: 403 });
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
      templateId 
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Strategy name is required' },
        { status: 400 }
      );
    }

    if (!nodes || !Array.isArray(nodes)) {
      return NextResponse.json(
        { error: 'Strategy nodes are required' },
        { status: 400 }
      );
    }

    if (!connections || !Array.isArray(connections)) {
      return NextResponse.json(
        { error: 'Strategy connections are required' },
        { status: 400 }
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

    // Create the strategy
    const strategy = await prisma.strategy.create({
      data: {
        userId: session.user.id,
        name,
        description,
        category,
        nodes: JSON.stringify(nodes),
        connections: JSON.stringify(connections),
        pineScriptCode,
        isPublic: isPublic || false,
        tags: tags ? JSON.stringify(tags) : null,
        folderId,
        templateId,
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

    // Create initial version
    await prisma.strategyVersion.create({
      data: {
        strategyId: strategy.id,
        version: 1,
        name: strategy.name,
        description: strategy.description,
        nodes: strategy.nodes,
        connections: strategy.connections,
        pineScriptCode: strategy.pineScriptCode,
        changeLog: 'Initial version',
      },
    });

    // Record usage for strategy creation
    try {
      await subscriptionPlanManager.recordUsage(session.user.id, 'strategies_generated', 1);
    } catch (usageError) {
      console.error('Failed to record strategy usage:', usageError);
      // Don't fail the request if usage recording fails
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
    console.error('Error creating strategy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}