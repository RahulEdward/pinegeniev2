/**
 * Subscription Usage API
 * 
 * GET /api/subscription/usage - Get current user's usage statistics
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

    // Get user's usage statistics
    const usageStats = await subscriptionPlanManager.getUserUsageStats(session.user.id);

    return NextResponse.json({
      success: true,
      usage: usageStats
    });

  } catch (error) {
    console.error('Error fetching usage statistics:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch usage statistics'
      },
      { status: 500 }
    );
  }
}