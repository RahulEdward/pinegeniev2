
// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthAndLogging, addSecurityHeaders, withRateLimit } from '@/middleware/admin';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/services/admin';
import { tokenAllocationSchema, AllocationType } from '@/types/admin-token-pricing';
import { z } from 'zod';

// PUT /api/admin/tokens/users/[userId] - Update user token allocation
export const PUT = withRateLimit(30, 60000)(
  withAdminAuthAndLogging(async (request: NextRequest, adminId: string, adminUser: any, { params }: { params: { userId: string } }) => {
    try {
      const { userId } = params;
      const body = await request.json();
      
      // Validate request body
      const validatedData = tokenAllocationSchema.parse({
        ...body,
        userId // Ensure userId matches the URL parameter
      });
      const { tokenAmount, allocationType, expiryDate, reason, notifyUser } = validatedData;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          id: true, 
          name: true, 
          email: true,
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
            select: { tokensUsed: true }
          }
        }
      });

      if (!user) {
        const response = NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
        return addSecurityHeaders(response);
      }

      // Calculate current token status
      const currentAllocated = user.tokenAllocations.reduce((sum, allocation) => sum + allocation.tokenAmount, 0);
      const currentUsed = user.tokenUsageLogs.reduce((sum, log) => sum + log.tokensUsed, 0);
      const currentAvailable = Math.max(0, currentAllocated - currentUsed);

      let finalTokenAmount = tokenAmount;
      let allocationReason = reason;

      // Handle different allocation types
      if (allocationType === AllocationType.ADD) {
        allocationReason = `Added ${tokenAmount} tokens: ${reason}`;
      } else if (allocationType === AllocationType.SUBTRACT) {
        // Check if user has enough tokens to subtract
        if (currentAvailable < tokenAmount) {
          const response = NextResponse.json(
            { 
              success: false, 
              message: `Cannot subtract ${tokenAmount} tokens. User only has ${currentAvailable} available tokens.` 
            },
            { status: 400 }
          );
          return addSecurityHeaders(response);
        }
        finalTokenAmount = -tokenAmount;
        allocationReason = `Removed ${tokenAmount} tokens: ${reason}`;
      } else if (allocationType === AllocationType.SET) {
        // Set absolute token amount - first deactivate existing allocations
        await prisma.tokenAllocation.updateMany({
          where: { 
            userId: userId,
            isActive: true 
          },
          data: { isActive: false }
        });
        allocationReason = `Set tokens to ${tokenAmount}: ${reason}`;
      }

      // Create new token allocation
      const allocation = await prisma.tokenAllocation.create({
        data: {
          userId: userId,
          tokenAmount: finalTokenAmount,
          allocatedBy: adminId,
          reason: allocationReason,
          expiresAt: expiryDate,
          isActive: true
        }
      });

      // Get updated user token summary
      const updatedTokenSummary = await prisma.tokenAllocation.aggregate({
        where: {
          userId: userId,
          isActive: true
        },
        _sum: { tokenAmount: true }
      });

      const newCurrentTokens = Math.max(0, (updatedTokenSummary._sum.tokenAmount || 0) - currentUsed);

      // Get user's subscription info
      const subscription = await prisma.subscription.findFirst({
        where: { 
          userId: userId,
          status: 'ACTIVE'
        },
        include: { plan: true }
      });

      // TODO: Send notification to user if notifyUser is true
      if (notifyUser) {
        console.log(`Should notify user ${user.email} about token allocation update`);
      }

      // Log admin action
      await logAdminAction(
        adminId,
        'UPDATE_USER_TOKENS',
        'TOKEN_MANAGEMENT',
        userId,
        { 
          allocationType, 
          tokenAmount, 
          finalTokenAmount,
          previousTokens: currentAvailable,
          newTokens: newCurrentTokens,
          reason: allocationReason,
          expiryDate,
          notifyUser 
        },
        {
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      );

      const response = NextResponse.json({
        success: true,
        data: {
          allocation,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            previousTokens: currentAvailable,
            currentTokens: newCurrentTokens,
            subscriptionPlan: subscription?.plan.displayName || 'Free'
          }
        },
        message: `User tokens ${allocationType === AllocationType.ADD ? 'increased' : 
                                allocationType === AllocationType.SUBTRACT ? 'decreased' : 
                                'updated'} successfully`,
      });

      return addSecurityHeaders(response);

    } catch (error) {
      console.error('User token update error:', error);
      
      if (error instanceof z.ZodError) {
        const response = NextResponse.json(
          { 
            success: false, 
            message: 'Validation error',
            errors: error.errors
          },
          { status: 400 }
        );
        return addSecurityHeaders(response);
      }

      const response = NextResponse.json(
        { 
          success: false, 
          message: error instanceof Error ? error.message : 'User token update failed' 
        },
        { status: 500 }
      );
      return addSecurityHeaders(response);
    }
  })
);

// GET /api/admin/tokens/users/[userId] - Get specific user's token data
export const GET = withAdminAuthAndLogging(async (request: NextRequest, adminId: string, adminUser: any, { params }: { params: { userId: string } }) => {
  try {
    const { userId } = params;

    // Get user with detailed token information
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        },
        tokenUsageLogs: {
          orderBy: { timestamp: 'desc' },
          take: 50, // Last 50 usage logs
          select: {
            id: true,
            tokensUsed: true,
            cost: true,
            requestType: true,
            modelId: true,
            timestamp: true,
            metadata: true
          }
        }
      }
    });

    if (!user) {
      const response = NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
      return addSecurityHeaders(response);
    }

    // Calculate token summary
    const totalAllocated = user.tokenAllocations.reduce((sum, allocation) => sum + allocation.tokenAmount, 0);
    const totalUsed = user.tokenUsageLogs.reduce((sum, log) => sum + log.tokensUsed, 0);
    const totalCost = user.tokenUsageLogs.reduce((sum, log) => sum + parseFloat(log.cost.toString()), 0);
    const currentTokens = Math.max(0, totalAllocated - totalUsed);

    // Get usage by request type
    const usageByType = user.tokenUsageLogs.reduce((acc, log) => {
      acc[log.requestType] = (acc[log.requestType] || 0) + log.tokensUsed;
      return acc;
    }, {} as Record<string, number>);

    // Get usage by model
    const usageByModel = user.tokenUsageLogs.reduce((acc, log) => {
      if (log.modelId) {
        acc[log.modelId] = (acc[log.modelId] || 0) + log.tokensUsed;
      }
      return acc;
    }, {} as Record<string, number>);

    const subscription = user.subscriptions[0];
    const lastAllocation = user.tokenAllocations[0];
    const lastUsage = user.tokenUsageLogs[0];

    const userData = {
      userId: user.id,
      userName: user.name || 'Unknown User',
      email: user.email || '',
      currentTokens,
      totalAllocated,
      totalUsed,
      totalCost,
      subscriptionPlan: subscription?.plan.displayName || 'Free',
      lastRefresh: lastAllocation?.createdAt || user.createdAt,
      lastActivity: lastUsage?.timestamp || user.createdAt,
      expiresAt: lastAllocation?.expiresAt || undefined,
      allocations: user.tokenAllocations,
      recentUsage: user.tokenUsageLogs,
      usageByType,
      usageByModel
    };

    // Log admin action
    await logAdminAction(
      adminId,
      'VIEW_USER_TOKEN_DETAILS',
      'TOKEN_MANAGEMENT',
      userId,
      { totalTokens: currentTokens, totalUsed, totalCost },
      {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    );

    const response = NextResponse.json({
      success: true,
      data: userData,
    });

    return addSecurityHeaders(response);

  } catch (error) {
    console.error('User token details fetch error:', error);
    const response = NextResponse.json(
      { success: false, message: 'Failed to fetch user token details' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
});