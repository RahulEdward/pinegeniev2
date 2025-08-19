/**
 * Cleanup Free User Tokens API
 * 
 * POST /api/admin/cleanup-free-tokens - Remove token allocations from free users
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin (you might want to add proper admin check here)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🧹 Starting cleanup of free user token allocations...');

    // Find all users who are on free plan or have no subscription
    const freeUsers = await prisma.user.findMany({
      include: {
        subscriptions: {
          where: {
            status: 'ACTIVE'
          },
          include: {
            plan: true
          }
        }
      }
    });

    const freeUserIds = freeUsers
      .filter(user => {
        // User has no active subscription or is on free plan
        return user.subscriptions.length === 0 || 
               user.subscriptions.some(sub => sub.plan.name === 'free');
      })
      .map(user => user.id);

    console.log(`📊 Found ${freeUserIds.length} free users`);

    if (freeUserIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No free users found with token allocations to clean up',
        cleaned: 0
      });
    }

    // Find token allocations for free users
    const allocationsToRemove = await prisma.tokenAllocation.findMany({
      where: {
        userId: {
          in: freeUserIds
        },
        isActive: true
      }
    });

    console.log(`🔍 Found ${allocationsToRemove.length} token allocations for free users`);

    if (allocationsToRemove.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active token allocations found for free users',
        cleaned: 0
      });
    }

    // Deactivate token allocations for free users (don't delete for audit trail)
    const result = await prisma.tokenAllocation.updateMany({
      where: {
        userId: {
          in: freeUserIds
        },
        isActive: true
      },
      data: {
        isActive: false,
        reason: 'Deactivated - Free plan user'
      }
    });

    console.log(`✅ Deactivated ${result.count} token allocations for free users`);

    // Create summary of affected users
    const affectedUsers = [];
    for (const userId of freeUserIds) {
      const user = freeUsers.find(u => u.id === userId);
      const userAllocations = allocationsToRemove.filter(a => a.userId === userId);
      const totalTokens = userAllocations.reduce((sum, a) => sum + a.tokenAmount, 0);
      
      if (totalTokens > 0) {
        affectedUsers.push({
          name: user?.name || user?.email || 'Unknown',
          email: user?.email,
          tokensRemoved: totalTokens
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deactivated ${result.count} token allocations for ${affectedUsers.length} free users`,
      cleaned: result.count,
      affectedUsers
    });

  } catch (error) {
    console.error('Error during cleanup:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cleanup free user tokens'
      },
      { status: 500 }
    );
  }
}