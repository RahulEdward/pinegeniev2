/**
 * User Tokens API
 * 
 * GET /api/user/tokens - Get current user's token information
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
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's token allocations
    const allocations = await prisma.tokenAllocation.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    // Get user's token usage
    const usage = await prisma.tokenUsageLog.aggregate({
      where: {
        userId: session.user.id
      },
      _sum: {
        tokensUsed: true
      }
    });

    // Get last usage
    const lastUsage = await prisma.tokenUsageLog.findFirst({
      where: {
        userId: session.user.id
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    const totalAllocated = allocations.reduce((sum, allocation) => sum + allocation.tokenAmount, 0);
    const totalUsed = usage._sum.tokensUsed || 0;
    const remaining = Math.max(0, totalAllocated - totalUsed);

    const tokenInfo = {
      totalAllocated,
      totalUsed,
      remaining,
      lastUsed: lastUsage?.timestamp.toISOString()
    };

    return NextResponse.json({
      success: true,
      tokens: tokenInfo
    });

  } catch (error) {
    console.error('Error fetching user tokens:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch token information'
      },
      { status: 500 }
    );
  }
}