/**
 * Create Subscription API
 * 
 * POST /api/subscription/create - Create a new subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { subscriptionPlanManager } from '@/services/subscription';
import { paymentService } from '@/services/payment';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { planId, billingCycle = 'monthly' } = body;

    if (!planId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Plan ID is required'
        },
        { status: 400 }
      );
    }

    // Get plan details
    const plan = await subscriptionPlanManager.getPlanById(planId);
    
    if (!plan) {
      return NextResponse.json(
        {
          success: false,
          error: 'Plan not found'
        },
        { status: 404 }
      );
    }

    // If it's a free plan, create subscription directly
    if (plan.monthlyPrice === 0 && plan.annualPrice === 0) {
      const subscription = await subscriptionPlanManager.createSubscription(
        session.user.id,
        planId,
        billingCycle
      );

      return NextResponse.json({
        success: true,
        subscription: subscription,
        message: 'Free subscription activated successfully'
      });
    }

    // For paid plans, create payment request
    const amount = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
    
    const paymentRequest = {
      userId: session.user.id,
      amount: amount,
      currency: plan.currency,
      planId: planId,
      description: `${plan.displayName} - ${billingCycle} subscription`,
      customerInfo: {
        email: session.user.email || '',
        firstName: session.user.name?.split(' ')[0] || 'User',
        lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
        phone: ''
      },
      metadata: {
        planId: planId,
        billingCycle: billingCycle,
        planName: plan.name
      }
    };

    const paymentResult = await paymentService.createPayment(paymentRequest);

    if (!paymentResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: paymentResult.error?.message || 'Failed to create payment'
        },
        { status: 500 }
      );
    }

    // Create pending subscription
    const subscription = await subscriptionPlanManager.createSubscription(
      session.user.id,
      planId,
      billingCycle
    );

    return NextResponse.json({
      success: true,
      subscription: subscription,
      payment: paymentResult.data,
      paymentUrl: paymentResult.data?.redirectUrl,
      message: 'Subscription created, redirecting to payment'
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create subscription'
      },
      { status: 500 }
    );
  }
}