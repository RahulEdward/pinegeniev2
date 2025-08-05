/**
 * Subscription Plans API
 * 
 * GET /api/subscription/plans - Get all available subscription plans
 */

import { NextRequest, NextResponse } from 'next/server';
import { subscriptionPlanManager } from '@/services/subscription';

export async function GET(request: NextRequest) {
  try {
    const plans = await subscriptionPlanManager.getAvailablePlans();
    
    return NextResponse.json({
      success: true,
      plans: plans
    });

  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch subscription plans'
      },
      { status: 500 }
    );
  }
}