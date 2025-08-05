/**
 * Current Subscription API
 * 
 * GET /api/subscription/current - Get user's current subscription
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
        {
          success: false,
          error: 'Unauthorized'
        },
        { status: 401 }
      );
    }

    const subscription = await subscriptionPlanManager.getUserSubscription(session.user.id);
    
    return NextResponse.json({
      success: true,
      subscription: subscription
    });

  } catch (error) {
    console.error('Error fetching current subscription:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch subscription'
      },
      { status: 500 }
    );
  }
}