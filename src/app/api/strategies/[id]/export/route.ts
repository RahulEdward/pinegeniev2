import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

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

    const { searchParams } = new URL(request.url);
    const includeVersions = searchParams.get('includeVersions') === 'true';
    const includeBacktests = searchParams.get('includeBacktests') === 'true';

    // Get the strategy with access check
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
        ...(includeVersions && {
          strategyVersions: {
            orderBy: {
              version: 'desc',
            },
          },
        }),
        ...(includeBacktests && {
          backtestResults: {
            where: {
              status: 'completed',
            },
            orderBy: {
              startedAt: 'desc',
            },
            take: 10, // Latest 10 completed backtests
          },
        }),
      },
    });

    if (!strategy) {
      return NextResponse.json(
        { error: 'Strategy not found or access denied' },
        { status: 404 }
      );
    }

    // Parse JSON fields and prepare export data
    const exportData = {
      strategy: {
        ...strategy,
        nodes: JSON.parse(strategy.nodes as string),
        connections: JSON.parse(strategy.connections as string),
        tags: strategy.tags ? JSON.parse(strategy.tags) : [],
      },
      ...(includeVersions && strategy.strategyVersions && {
        versions: strategy.strategyVersions.map(version => ({
          ...version,
          nodes: JSON.parse(version.nodes as string),
          connections: JSON.parse(version.connections as string),
        })),
      }),
      ...(includeBacktests && strategy.backtestResults && {
        backtestResults: strategy.backtestResults.map(result => ({
          ...result,
          config: JSON.parse(result.config as string),
          results: JSON.parse(result.results as string),
          performanceMetrics: JSON.parse(result.performanceMetrics as string),
        })),
      }),
      exportedAt: new Date().toISOString(),
      exportedBy: session.user.id,
      version: '1.0',
    };

    // Set appropriate headers for file download
    const filename = `${strategy.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.json`;
    
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting strategy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}