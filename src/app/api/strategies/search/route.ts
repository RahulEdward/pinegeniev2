import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

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
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const folderId = searchParams.get('folderId');
    const isPublic = searchParams.get('isPublic');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    // Build base where clause
    const where: any = {
      userId: session.user.id,
    };

    // Add search query
    if (query.trim()) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Add filters
    if (category) {
      where.category = category;
    }

    if (isPublic !== null && isPublic !== undefined) {
      where.isPublic = isPublic === 'true';
    }

    if (folderId) {
      if (folderId === 'null' || folderId === 'root') {
        where.folderId = null;
      } else {
        where.folderId = folderId;
      }
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Build orderBy clause
    let orderBy: any = {};
    
    switch (sortBy) {
      case 'name':
        orderBy = { name: sortOrder };
        break;
      case 'created':
        orderBy = { createdAt: sortOrder };
        break;
      case 'updated':
        orderBy = { updatedAt: sortOrder };
        break;
      case 'version':
        orderBy = { version: sortOrder };
        break;
      case 'relevance':
      default:
        // For relevance, we'll use updated date as a proxy
        orderBy = { updatedAt: 'desc' };
        break;
    }

    // Execute search
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

    // Parse tags and filter by tags if specified
    let filteredStrategies = strategies.map(strategy => ({
      ...strategy,
      tags: strategy.tags ? JSON.parse(strategy.tags) : [],
    }));

    // Client-side tag filtering (since SQLite JSON queries are limited)
    if (tags && tags.length > 0) {
      filteredStrategies = filteredStrategies.filter(strategy => 
        tags.some(tag => strategy.tags.includes(tag))
      );
    }

    // Get search suggestions if query is provided
    let suggestions: string[] = [];
    if (query.trim() && filteredStrategies.length < 5) {
      const suggestionStrategies = await prisma.strategy.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { name: { contains: query.substring(0, Math.max(1, query.length - 2)), mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          name: true,
          category: true,
        },
        take: 5,
      });

      suggestions = [
        ...new Set([
          ...suggestionStrategies.map(s => s.name),
          ...suggestionStrategies.map(s => s.category).filter(Boolean),
        ])
      ].slice(0, 5);
    }

    // Get popular tags for the user
    const allUserStrategies = await prisma.strategy.findMany({
      where: { userId: session.user.id },
      select: { tags: true },
    });

    const tagCounts: { [key: string]: number } = {};
    allUserStrategies.forEach(strategy => {
      if (strategy.tags) {
        const strategyTags = JSON.parse(strategy.tags);
        strategyTags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const popularTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);

    return NextResponse.json({
      success: true,
      data: {
        strategies: filteredStrategies,
        pagination: {
          page,
          limit,
          totalCount: filteredStrategies.length,
          totalPages: Math.ceil(filteredStrategies.length / limit),
        },
        suggestions,
        popularTags,
        filters: {
          categories: await getAvailableCategories(session.user.id),
          folders: await getAvailableFolders(session.user.id),
        },
      },
    });
  } catch (error) {
    console.error('Error searching strategies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getAvailableCategories(userId: string) {
  const categories = await prisma.strategy.findMany({
    where: { 
      userId,
      category: { not: null },
    },
    select: { category: true },
    distinct: ['category'],
  });

  return categories.map(c => c.category).filter(Boolean);
}

async function getAvailableFolders(userId: string) {
  const folders = await prisma.strategyFolder.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      color: true,
      parentId: true,
    },
    orderBy: { name: 'asc' },
  });

  return folders;
}