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
    const permission = searchParams.get('permission');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    // Build where clause for shared strategies
    const where: any = {
      sharedWith: session.user.id,
    };

    if (permission) {
      where.permission = permission;
    }

    // Check for expired shares
    where.OR = [
      { expiresAt: null }, // No expiration
      { expiresAt: { gt: new Date() } }, // Not expired
    ];

    // Build orderBy clause
    const orderBy: any = {};
    if (sortBy === 'strategyName') {
      orderBy.strategy = { name: sortOrder };
    } else if (sortBy === 'sharedBy') {
      orderBy.sharedByUser = { name: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Get shared strategies
    const [sharedStrategies, totalCount] = await Promise.all([
      prisma.sharedStrategy.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          strategy: {
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
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
      }),
      prisma.sharedStrategy.count({ where }),
    ]);

    // Filter by strategy properties if needed
    let filteredStrategies = sharedStrategies;

    if (category) {
      filteredStrategies = filteredStrategies.filter(share => 
        share.strategy.category === category
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredStrategies = filteredStrategies.filter(share => 
        share.strategy.name.toLowerCase().includes(searchLower) ||
        share.strategy.description?.toLowerCase().includes(searchLower) ||
        share.sharedByUser.name?.toLowerCase().includes(searchLower)
      );
    }

    // Parse tags and format response
    const formattedStrategies = filteredStrategies.map(share => ({
      shareId: share.id,
      permission: share.permission,
      expiresAt: share.expiresAt,
      sharedAt: share.createdAt,
      sharedBy: share.sharedByUser,
      strategy: {
        ...share.strategy,
        tags: share.strategy.tags ? JSON.parse(share.strategy.tags) : [],
      }
    }));

    // Get summary statistics
    const stats = {
      totalShared: totalCount,
      byPermission: {
        READ: sharedStrategies.filter(s => s.permission === 'READ').length,
        WRITE: sharedStrategies.filter(s => s.permission === 'WRITE').length,
        ADMIN: sharedStrategies.filter(s => s.permission === 'ADMIN').length,
      },
      expiringSoon: sharedStrategies.filter(s => 
        s.expiresAt && 
        s.expiresAt > new Date() && 
        s.expiresAt <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      ).length,
    };

    return NextResponse.json({
      success: true,
      data: {
        sharedStrategies: formattedStrategies,
        pagination: {
          page,
          limit,
          totalCount: filteredStrategies.length,
          totalPages: Math.ceil(filteredStrategies.length / limit),
        },
        stats,
      },
    });
  } catch (error) {
    console.error('Error fetching shared strategies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}