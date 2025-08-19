/**
 * Subscription Plans Management API
 * 
 * GET /api/admin/subscriptions/plans - Get all subscription plans with subscriber counts
 * POST /api/admin/subscriptions/plans - Create a new subscription plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all subscription plans with subscriber counts
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { monthlyPrice: 'asc' },
      include: {
        _count: {
          select: {
            subscriptions: {
              where: {
                status: { in: ['ACTIVE', 'TRIALING'] }
              }
            }
          }
        }
      }
    });

    const plansWithCounts = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      displayName: plan.displayName,
      description: plan.description,
      monthlyPrice: Number(plan.monthlyPrice),
      annualPrice: Number(plan.annualPrice),
      currency: plan.currency,
      isPopular: plan.isPopular,
      isActive: plan.isActive,
      subscriberCount: plan._count.subscriptions,
      features: plan.features,
      limits: plan.limits
    }));

    return NextResponse.json({
      success: true,
      plans: plansWithCounts
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      displayName,
      description,
      monthlyPrice,
      annualPrice,
      currency = 'INR',
      features,
      limits,
      isPopular = false,
      trialDays = 0
    } = body;

    // Validate required fields
    if (!name || !displayName || !description || monthlyPrice === undefined || annualPrice === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields'
        },
        { status: 400 }
      );
    }

    // Check if plan name already exists
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { name }
    });

    if (existingPlan) {
      return NextResponse.json(
        {
          success: false,
          error: 'Plan with this name already exists'
        },
        { status: 400 }
      );
    }

    // Create new subscription plan
    const newPlan = await prisma.subscriptionPlan.create({
      data: {
        name,
        displayName,
        description,
        monthlyPrice,
        annualPrice,
        currency,
        features: features || [],
        limits: limits || {},
        isPopular,
        trialDays,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      plan: {
        id: newPlan.id,
        name: newPlan.name,
        displayName: newPlan.displayName,
        description: newPlan.description,
        monthlyPrice: Number(newPlan.monthlyPrice),
        annualPrice: Number(newPlan.annualPrice),
        currency: newPlan.currency,
        isPopular: newPlan.isPopular,
        isActive: newPlan.isActive,
        subscriberCount: 0,
        features: newPlan.features,
        limits: newPlan.limits
      }
    });

  } catch (error) {
    console.error('Error creating subscription plan:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create subscription plan'
      },
      { status: 500 }
    );
  }
}