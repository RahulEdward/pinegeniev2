/**
 * Grant Premium Access API
 * 
 * POST /api/admin/grant-premium - Grant premium subscription to a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { email, planName = 'pro', durationMonths = 12 } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Granting premium access to: ${email}`);
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Find or create the subscription plan
    let plan = await prisma.subscriptionPlan.findFirst({
      where: { name: planName }
    });

    if (!plan) {
      // Create the plan if it doesn't exist
      plan = await prisma.subscriptionPlan.create({
        data: {
          name: planName,
          displayName: planName === 'pro' ? 'Pro Plan' : 'Premium Plan',
          description: 'Premium plan with all features',
          monthlyPrice: planName === 'pro' ? 29.99 : 49.99,
          annualPrice: planName === 'pro' ? 299.99 : 499.99,
          currency: 'USD',
          features: [
            'Unlimited AI conversations',
            'Advanced strategy builder',
            'Premium templates access',
            'Priority support',
            'Export capabilities',
            'Advanced indicators',
            'Backtesting features'
          ],
          limits: {
            aiChatAccess: true,
            templatesAccess: 'all',
            scriptStorage: 'unlimited',
            aiGenerations: 'unlimited',
            advancedIndicators: true,
            backtesting: true,
            customSignatures: true,
            apiAccess: true
          },
          isActive: true
        }
      });
      
      console.log('✅ Plan created:', plan.displayName);
    }

    // Cancel existing active subscriptions
    if (user.subscriptions.length > 0) {
      await prisma.subscription.updateMany({
        where: {
          userId: user.id,
          status: 'ACTIVE'
        },
        data: {
          status: 'CANCELLED',
          cancelAtPeriodEnd: true
        }
      });
      console.log('✅ Cancelled existing subscriptions');
    }

    // Create new premium subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationMonths);

    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: 'ACTIVE',
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
        cancelAtPeriodEnd: false
      }
    });

    console.log('✅ Premium subscription created:', subscription.id);
    console.log('📅 Valid until:', endDate.toISOString());

    // Allocate premium tokens
    await allocatePremiumTokens(user.id);

    return NextResponse.json({
      success: true,
      message: 'Premium access granted successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      subscription: {
        id: subscription.id,
        planName: plan.displayName,
        expiresAt: subscription.currentPeriodEnd
      }
    });

  } catch (error) {
    console.error('❌ Error granting premium access:', error);
    
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    
    if (error instanceof Error && error.message.includes('authentication')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to grant premium access',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function allocatePremiumTokens(userId: string) {
  try {
    // Find admin user for allocation
    const adminUser = await prisma.adminUser.findFirst({
      where: { isActive: true }
    });

    if (!adminUser) {
      console.log('⚠️ No admin user found for token allocation');
      return;
    }

    // Allocate 500,000 tokens for premium users
    const tokenAllocation = await prisma.tokenAllocation.create({
      data: {
        userId: userId,
        tokenAmount: 500000,
        allocatedBy: adminUser.id,
        reason: 'Premium subscription token allocation',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true
      }
    });

    console.log('✅ Premium tokens allocated:', tokenAllocation.tokenAmount);
    
  } catch (error) {
    console.error('❌ Error allocating premium tokens:', error);
  }
}