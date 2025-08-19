import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthAndLogging, addSecurityHeaders, withRateLimit } from '@/middleware/admin';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/services/admin';
import { TokenUsageMetrics } from '@/types/admin-token-pricing';

// GET /api/admin/tokens - Token overview and analytics
export const GET = withAdminAuthAndLogging(async (request: NextRequest, adminId: string, adminUser: any) => {
  try {
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

    const metrics: TokenUsageMetrics = {
      totalTokensAllocated,
      totalTokensUsed,
      utilizationRate: totalTokensAllocated > 0 ? (totalTokensUsed / totalTokensAllocated) * 100 : 0,
      costPerToken: totalTokensUsed > 0 ? totalCost / totalTokensUsed : 0,
      revenuePerToken: 0, // This would need to be calculated based on subscription revenue
      topUsers: topUsersData,
      usageByModel: usageByModelData,
      usageByTimeframe: usageByTimeframeData
    };

    // Log admin action
    await logAdminAction(
      adminId,
      'VIEW_TOKEN_ANALYTICS',
      'TOKEN_MANAGEMENT',
      undefined,
      { dateRange, totalUsers: activeUsers, totalTokens: totalTokensAllocated },
      {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    );

    const response = NextResponse.json({
      success: true,
      data: metrics,
    });

    return addSecurityHeaders(response);

  } catch (error) {
    console.error('Token analytics fetch error:', error);
    const response = NextResponse.json(
      { success: false, message: 'Failed to fetch token analytics' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
});