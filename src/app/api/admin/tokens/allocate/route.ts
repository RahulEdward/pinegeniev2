import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthAndLogging, addSecurityHeaders, withRateLimit } from '@/middleware/admin';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/services/admin';
import { tokenAllocationSchema, AllocationType } from '@/types/admin-token-pricing';
import { z } from 'zod';

// POST /api/admin/tokens/allocate - Allocate tokens to users
export const POST = withRateLimit(50, 60000)(
  withAdminAuthAndLogging(async (request: NextRequest, adminId: string, adminUser: any) => {
    try {
      const body = await request.json();
      
      // Validate request body
      const validatedData = tokenAllocationSchema.parse(body);
      const { userId, tokenAmount, allocationType, expiryDate, reason, notifyUser } = validatedData;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true }
      });

      if (!user) {
        const response = NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
        return addSecurityHeaders(response);
      }

      let finalTokenAmount = tokenAmount;
      let allocationReason = reason;

      // Handle different allocation types
      if (allocationType === AllocationType.ADD) {
        // Add tokens to existing allocation
        allocationReason = `Added ${tokenAmount} tokens: ${reason}`;
      } else if (allocationType === AllocationType.SUBTRACT) {
        // Subtract tokens (negative amount)
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
      const tokenSummary = await prisma.tokenAllocation.aggregate({
        where: {
          userId: userId,
          isActive: true
        },
        _sum: { tokenAmount: true }
      });

      const currentTokens = tokenSummary._sum.tokenAmount || 0;

      // TODO: Send notification to user if notifyUser is true
      // This would integrate with your existing notification system
      if (notifyUser) {
        // Implementation would depend on your notification system
        console.log(`Should notify user ${user.email} about token allocation`);
      }

      // Log admin action
      await logAdminAction(
        adminId,
        'ALLOCATE_TOKENS',
        'TOKEN_MANAGEMENT',
        userId,
        { 
          allocationType, 
          tokenAmount, 
          finalTokenAmount,
          currentTokens,
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
            currentTokens
          }
        },
        message: `Tokens ${allocationType === AllocationType.ADD ? 'added' : 
                           allocationType === AllocationType.SUBTRACT ? 'removed' : 
                           'set'} successfully`,
      });

      return addSecurityHeaders(response);

    } catch (error) {
      console.error('Token allocation error:', error);
      
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
          message: error instanceof Error ? error.message : 'Token allocation failed' 
        },
        { status: 500 }
      );
      return addSecurityHeaders(response);
    }
  })
);