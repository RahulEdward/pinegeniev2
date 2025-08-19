/**
 * Subscription Plans API
 * 
 * GET /api/subscription/plans - Get available subscription plans
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get all active subscription plans
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        monthlyPrice: 'asc'
      }
    });

    // Format plans for frontend
    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      displayName: plan.displayName,
      description: plan.description,
      monthlyPrice: Number(plan.monthlyPrice),
      annualPrice: Number(plan.annualPrice),
      currency: plan.currency,
      features: plan.features,
      limits: plan.limits,
      isPopular: plan.isPopular,
      trialDays: plan.trialDays
    }));

    return NextResponse.json({
      success: true,
      plans: formattedPlans
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