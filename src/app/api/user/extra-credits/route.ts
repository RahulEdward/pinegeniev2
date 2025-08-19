/**
 * User Extra Credits API
 * 
 * GET /api/user/extra-credits - Get current user's extra credits (purchased credits)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // First check if user has a paid subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE'
      },
      include: {
        plan: true
      }
    });

    // If user is on free plan, they should have 0 extra credits
    if (!subscription || subscription.plan.name === 'free') {
      return NextResponse.json({
        success: true,
        extraCredits: {
          total: 0,
          used: 0,
          remaining: 0
        }
      });
    }

    // Get user's extra credit allocations (purchased credits, not monthly subscription credits)
    const extraCredits = await prisma.tokenAllocation.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
        reason: 'extra_credits_purchase', // Only purchased extra credits
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    // Get user's extra credit usage (separate from monthly credits)
    const extraCreditUsage = await prisma.tokenUsageLog.aggregate({
      where: {
        userId: session.user.id,
        requestType: 'extra_credits' // Only usage from extra credits
      },
      _sum: {
        tokensUsed: true
      }
    });

    const totalExtraCredits = extraCredits.reduce((sum, allocation) => sum + allocation.tokenAmount, 0);
    const usedExtraCredits = extraCreditUsage._sum.tokensUsed || 0;
    const remainingExtraCredits = Math.max(0, totalExtraCredits - usedExtraCredits);

    return NextResponse.json({
      success: true,
      extraCredits: {
        total: totalExtraCredits,
        used: usedExtraCredits,
        remaining: remainingExtraCredits
      }
    });

  } catch (error) {
    console.error('Error fetching user extra credits:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch extra credits information'
      },
      { status: 500 }
    );
  }
}