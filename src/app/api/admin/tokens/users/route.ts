import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthAndLogging, addSecurityHeaders } from '@/middleware/admin';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/services/admin';
import { UserTokenData } from '@/types/admin-token-pricing';

// GET /api/admin/tokens/users - Get paginated user token data
export const GET = withAdminAuthAndLogging(async (request: NextRequest, adminId: string, adminUser: any) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const subscriptionPlan = searchParams.get('subscriptionPlan') || '';
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    const skip = (page - 1) * limit;

    // Build where clause for users
    const userWhere: any = {};
    
    if (search) {
      userWhere.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get users with their token data
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: userWhere,
        skip,
        take: limit,
        orderBy: sortBy === 'name' ? { name: sortOrder } : 
                 sortBy === 'email' ? { email: sortOrder } :
                 { createdAt: sortOrder },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          subscriptions: {
            where: { status: 'ACTIVE' },
            include: { plan: true },
            take: 1
          },
          tokenAllocations: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
          },
          tokenUsageLogs: {
            where: {
              timestamp: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) // Current month
              }
            },
            select: {
              tokensUsed: true,
              timestamp: true
            }
          }
        },
      }),
      prisma.user.count({ where: userWhere }),
    ]);

    // Transform users data to include token information
    const usersWithTokenData: UserTokenData[] = users.map(user => {
      const subscription = user.subscriptions[0];
      const totalAllocated = user.tokenAllocations.reduce((sum, allocation) => sum + allocation.tokenAmount, 0);
      const totalUsed = user.tokenUsageLogs.reduce((sum, log) => sum + log.tokensUsed, 0);
      const lastAllocation = user.tokenAllocations[0];
      const lastUsage = user.tokenUsageLogs.length > 0 ? 
        new Date(Math.max(...user.tokenUsageLogs.map(log => log.timestamp.getTime()))) : 
        new Date(0);

      return {
        userId: user.id,
        userName: user.name || 'Unknown User',
        email: user.email || '',
        currentTokens: Math.max(0, totalAllocated - totalUsed),
        monthlyAllocation: totalAllocated,
        tokensUsed: totalUsed,
        subscriptionPlan: subscription?.plan.displayName || 'Free',
        lastRefresh: lastAllocation?.createdAt || user.createdAt,
        expiresAt: lastAllocation?.expiresAt || undefined
      };
    });

    // Filter by subscription plan if specified
    let filteredUsers = usersWithTokenData;
    if (subscriptionPlan) {
      filteredUsers = usersWithTokenData.filter(user => 
        user.subscriptionPlan.toLowerCase().includes(subscriptionPlan.toLowerCase())
      );
    }

    // Sort by token-related fields if needed
    if (sortBy === 'tokens') {
      filteredUsers.sort((a, b) => {
        const aVal = a.currentTokens;
        const bVal = b.currentTokens;
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
    } else if (sortBy === 'usage') {
      filteredUsers.sort((a, b) => {
        const aVal = a.tokensUsed;
        const bVal = b.tokensUsed;
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
    } else if (sortBy === 'lastActivity') {
      filteredUsers.sort((a, b) => {
        const aVal = a.lastRefresh.getTime();
        const bVal = b.lastRefresh.getTime();
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }

    // Log admin action
    await logAdminAction(
      adminId,
      'VIEW_USER_TOKENS',
      'TOKEN_MANAGEMENT',
      undefined,
      { page, limit, search, subscriptionPlan, totalCount },
      {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    );

    const response = NextResponse.json({
      success: true,
      data: {
        users: filteredUsers,
        pagination: {
          page,
          limit,
          totalCount: filteredUsers.length,
          totalPages: Math.ceil(filteredUsers.length / limit),
        },
      },
    });

    return addSecurityHeaders(response);

  } catch (error) {
    console.error('User tokens fetch error:', error);
    const response = NextResponse.json(
      { success: false, message: 'Failed to fetch user token data' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
});