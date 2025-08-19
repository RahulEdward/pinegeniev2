import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/admin/tokens - Token overview and analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin (you might want to add proper admin check here)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));

    // Get token allocation overview
    const [
      totalAllocations,
      totalUsage,
      activeUsers,
      topUsers,
      usageByModel,
      usageByTimeframe
    ] = await Promise.all([
      // Total tokens allocated
      prisma.tokenAllocation.aggregate({
        where: { isActive: true },
        _sum: { tokenAmount: true },
        _count: true
      }),

      // Total tokens used
      prisma.tokenUsageLog.aggregate({
        where: {
          timestamp: { gte: startDate }
        },
        _sum: { tokensUsed: true, cost: true },
        _count: true
      }),

      // Active users with tokens
      prisma.user.count({
        where: {
          tokenAllocations: {
            some: { isActive: true }
          }
        }
      }),

      // Top token users
      prisma.tokenUsageLog.groupBy({
        by: ['userId'],
        where: {
          timestamp: { gte: startDate }
        },
        _sum: {
          tokensUsed: true,
          cost: true
        },
        orderBy: {
          _sum: {
            tokensUsed: 'desc'
          }
        },
        take: 10
      }),

      // Usage by model
      prisma.tokenUsageLog.groupBy({
        by: ['modelId'],
        where: {
          timestamp: { gte: startDate },
          modelId: { not: null }
        },
        _sum: {
          tokensUsed: true,
          cost: true
        },
        orderBy: {
          _sum: {
            tokensUsed: 'desc'
          }
        }
      }),

      // Usage by timeframe (daily for last 30 days)
      prisma.$queryRaw`
        SELECT 
          DATE(timestamp) as date,
          SUM(tokens_used) as tokens,
          SUM(cost) as cost
        FROM token_usage_logs 
        WHERE timestamp >= ${startDate}
        GROUP BY DATE(timestamp)
        ORDER BY date ASC
      `
    ]);

    // Get user details for top users
    const topUserIds = topUsers.map(u => u.userId);
    const userDetails = await prisma.user.findMany({
      where: { id: { in: topUserIds } },
      select: {
        id: true,
        name: true,
        email: true,
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
          take: 1
        }
      }
    });

    // Get current token allocations for top users
    const currentAllocations = await prisma.tokenAllocation.groupBy({
      by: ['userId'],
      where: {
        userId: { in: topUserIds },
        isActive: true
      },
      _sum: { tokenAmount: true }
    });

    // Build top users data
    const topUsersData = topUsers.map(usage => {
      const user = userDetails.find(u => u.id === usage.userId);
      const allocation = currentAllocations.find(a => a.userId === usage.userId);
      const subscription = user?.subscriptions[0];

      return {
        userId: usage.userId,
        userName: user?.name || 'Unknown User',
        email: user?.email || '',
        currentTokens: allocation?._sum.tokenAmount || 0,
        monthlyAllocation: allocation?._sum.tokenAmount || 0,
        tokensUsed: usage._sum.tokensUsed || 0,
        subscriptionPlan: subscription?.plan.displayName || 'Free',
        lastRefresh: new Date(),
        expiresAt: undefined
      };
    });

    // Build usage by model data
    const usageByModelData: Record<string, number> = {};
    usageByModel.forEach(model => {
      if (model.modelId) {
        usageByModelData[model.modelId] = model._sum.tokensUsed || 0;
      }
    });

    // Build usage by timeframe data
    const usageByTimeframeData = (usageByTimeframe as any[]).map(item => ({
      date: item.date.toISOString().split('T')[0],
      tokens: parseInt(item.tokens) || 0,
      cost: parseFloat(item.cost) || 0
    }));

    const totalTokensAllocated = totalAllocations._sum.tokenAmount || 0;
    const totalTokensUsed = totalUsage._sum.tokensUsed || 0;
    const totalCost = parseFloat(totalUsage._sum.cost?.toString() || '0');

    return NextResponse.json({
      success: true,
      metrics: {
        totalAllocated: totalTokensAllocated,
        totalUsed: totalTokensUsed,
        totalRemaining: totalTokensAllocated - totalTokensUsed,
        activeUsers: activeUsers,
        lowTokenUsers: topUsersData.filter(u => u.currentTokens < 100).length,
        averageUsage: totalTokensUsed / (activeUsers || 1)
      }
    });

  } catch (error) {
    console.error('Token analytics fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch token analytics' },
      { status: 500 }
    );
  }
}