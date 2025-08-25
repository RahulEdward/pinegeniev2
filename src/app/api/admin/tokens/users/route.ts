/**
 * Admin Token Users API
 * 
 * GET /api/admin/tokens/users - Get all users with their token information
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


// Force dynamic rendering
export const dynamic = 'force-dynamic';

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

    // Get all users with their token allocations and usage
    const users = await prisma.user.findMany({
      include: {
        tokenAllocations: {
          where: {
            isActive: true
          }
        },
        tokenUsageLogs: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 1
        },
        subscriptions: {
          where: {
            status: 'ACTIVE'
          },
          include: {
            plan: true
          },
          take: 1
        }
      }
    });

    // Calculate token data for each user
    const usersWithTokenData = await Promise.all(
      users.map(async (user) => {
        // Get total allocated tokens
        const totalAllocated = user.tokenAllocations.reduce(
          (sum, allocation) => sum + allocation.tokenAmount, 
          0
        );

        // Get total used tokens
        const usageResult = await prisma.tokenUsageLog.aggregate({
          where: {
            userId: user.id
          },
          _sum: {
            tokensUsed: true
          }
        });

        const totalUsed = usageResult._sum.tokensUsed || 0;
        const remaining = Math.max(0, totalAllocated - totalUsed);
        
        // Determine status
        let status: 'active' | 'low' | 'expired' = 'active';
        if (remaining === 0) {
          status = 'expired';
        } else if (remaining < 100) {
          status = 'low';
        }

        // Get subscription info
        const subscription = user.subscriptions[0];
        const subscriptionName = subscription?.plan?.displayName || 'Free';

        // Get last usage
        const lastUsed = user.tokenUsageLogs[0]?.timestamp 
          ? new Date(user.tokenUsageLogs[0].timestamp).toLocaleDateString()
          : 'Never';

        return {
          id: user.id,
          name: user.name || 'Unknown',
          email: user.email || '',
          totalTokens: totalAllocated,
          usedTokens: totalUsed,
          remainingTokens: remaining,
          lastUsed,
          status,
          subscription: subscriptionName
        };
      })
    );

    return NextResponse.json({
      success: true,
      users: usersWithTokenData
    });

  } catch (error) {
    console.error('Error fetching user token data:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user token data'
      },
      { status: 500 }
    );
  }
}