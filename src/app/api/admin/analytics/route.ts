
// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthAndLogging, addSecurityHeaders } from '@/middleware/admin';
import { prisma } from '@/lib/prisma';

export const GET = withAdminAuthAndLogging(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week';
    
    // Get date range based on period
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7); // Default to week
    }

    // Get analytics data
    const [
      userCount,
      newUsers,
      conversationCount,
      messageCount,
      activeUsers,
      // Get daily user registrations for the period
      userRegistrations
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      prisma.conversation.count(),
      prisma.message.count(),
      prisma.user.count({
        where: {
          conversations: {
            some: {
              createdAt: {
                gte: startDate
              }
            }
          }
        }
      }),
      // Get daily user registrations
      prisma.$queryRaw`
        SELECT 
          date(created_at) as date, 
          count(*) as count 
        FROM users 
        WHERE created_at >= ${startDate.toISOString()} 
        GROUP BY date(created_at) 
        ORDER BY date(created_at)
      `
    ]);

    // Get model usage data
    const modelUsage = await prisma.conversation.groupBy({
      by: ['modelId'],
      _count: true,
      orderBy: {
        _count: {
          modelId: 'desc'
        }
      }
    });

    // Get model names
    const models = await prisma.lLMModel.findMany({
      where: {
        id: {
          in: modelUsage.map(item => item.modelId).filter(Boolean)
        }
      },
      select: {
        id: true,
        name: true,
        displayName: true
      }
    });

    // Combine model usage with model names
    const modelUsageWithNames = modelUsage.map(usage => {
      const model = models.find(m => m.id === usage.modelId);
      return {
        modelId: usage.modelId,
        modelName: model?.displayName || model?.name || 'Unknown',
        count: typeof usage._count === 'number' ? usage._count : usage._count?.modelId || 0
      };
    });

    const response = NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers: userCount,
          newUsers,
          totalConversations: conversationCount,
          totalMessages: messageCount,
          activeUsers
        },
        userRegistrations,
        modelUsage: modelUsageWithNames
      }
    });

    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Analytics error:', error);
    const response = NextResponse.json(
      { success: false, message: 'Failed to fetch analytics data' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
});