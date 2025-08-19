/**
 * Current Subscription API
 * 
 * GET /api/subscription/current - Get current user's subscription information
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { subscriptionPlanManager } from '@/services/subscription';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's current subscription
    const subscription = await subscriptionPlanManager.getUserSubscription(session.user.id);
    
    if (!subscription) {
      // Return default free plan info
      return NextResponse.json({
        success: true,
        subscription: {
          planName: 'free',
          planDisplayName: 'Free Plan',
          status: 'ACTIVE',
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          monthlyCredits: 5,
          usedCredits: 0,
          remainingCredits: 5,
          isActive: true,
          limits: {
            strategiesPerMonth: 5,
            templatesAccess: 'basic',
            aiGenerations: 5,
            aiChatAccess: false,
            scriptStorage: 5,
            exportFormats: ['pine'],
            supportLevel: 'basic',
            customSignatures: false,
            apiAccess: false,
            whiteLabel: false,
            teamCollaboration: false,
            advancedIndicators: false,
            backtesting: false
          }
        }
      });
    }

    // Get usage statistics for the current period
    const usageStats = await subscriptionPlanManager.getUserUsageStats(session.user.id);
    
    // Calculate credits based on AI generations
    const monthlyCredits = subscription.limits?.aiGenerations === 'unlimited' 
      ? 500 
      : (typeof subscription.limits?.aiGenerations === 'number' ? subscription.limits.aiGenerations : 5);
    
    const usedCredits = usageStats.aiGenerations.current;
    const remainingCredits = monthlyCredits - usedCredits;

    const subscriptionInfo = {
      planName: subscription.planName,
      planDisplayName: subscription.planDisplayName,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
      monthlyCredits,
      usedCredits,
      remainingCredits: Math.max(0, remainingCredits),
      isActive: subscription.isActive,
      limits: subscription.limits || {}
    };

    return NextResponse.json({
      success: true,
      subscription: subscriptionInfo
    });

  } catch (error) {
    console.error('Error fetching current subscription:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch subscription information'
      },
      { status: 500 }
    );
  }
}