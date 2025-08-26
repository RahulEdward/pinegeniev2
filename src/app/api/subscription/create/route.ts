/**
 * Subscription Creation API
 * 
 * POST /api/subscription/create - Create new subscription and initiate PayU payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// PayU configuration
const PAYU_CONFIG = {
  merchantKey: process.env.PAYU_MERCHANT_KEY || 'gtKFFx',
  salt: process.env.PAYU_MERCHANT_SALT || 'eCwWELxi',
  baseUrl: process.env.PAYU_BASE_URL || 'https://test.payu.in', // Use https://secure.payu.in for production
  successUrl: process.env.NEXT_PUBLIC_BASE_URL + '/payment/success',
  failureUrl: process.env.NEXT_PUBLIC_BASE_URL + '/payment/failure',
  cancelUrl: process.env.NEXT_PUBLIC_BASE_URL + '/payment/failure'
};


// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { planId, billingCycle, customerInfo } = body;

    // Validate input
    if (!planId || !customerInfo?.email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Handle extra credits purchase
    if (planId === 'extra-credits') {
      return await handleExtraCreditsPayment(session.user.id, customerInfo);
    }

    // Get subscription plan details
    const plan = await prisma.subscriptionPlan.findFirst({
      where: { name: planId }
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Calculate amount based on billing cycle
    const amount = billingCycle === 'yearly' 
      ? Number(plan.annualPrice) 
      : Number(plan.monthlyPrice);

    if (amount === 0) {
      // Free plan - activate directly
      return await activateFreePlan(session.user.id, plan.id);
    }

    // Create payment record
    const txnid = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        referenceCode: txnid,
        amount: amount,
        currency: plan.currency,
        status: 'PENDING',
        description: `${plan.displayName} - ${billingCycle} subscription`,
        customerInfo: customerInfo
      }
    });

    // Use direct PayU payment link
    const paymentUrl = 'https://pmny.in/aIiKqENQTP4m';

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        txnid: txnid,
        amount: amount,
        currency: plan.currency,
        status: 'PENDING'
      },
      paymentUrl: paymentUrl
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

async function handleExtraCreditsPayment(userId: string, customerInfo: any) {
  const amount = 1499; // ₹1,499 for 500 credits
  const txnid = `CREDITS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const payment = await prisma.payment.create({
    data: {
      userId: userId,
      referenceCode: txnid,
      amount: amount,
      currency: 'INR',
      status: 'PENDING',
      description: '500 Extra AI Credits',
      customerInfo: customerInfo
    }
  });

  // Use direct PayU payment link for credits too
  const paymentUrl = 'https://pmny.in/aIiKqENQTP4m';

  return NextResponse.json({
    success: true,
    payment: {
      id: payment.id,
      txnid: txnid,
      amount: amount,
      currency: 'INR',
      status: 'PENDING'
    },
    paymentUrl: paymentUrl
  });
}

async function activateFreePlan(userId: string, planId: string) {
  // Check if user already has an active subscription
  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      userId: userId,
      status: 'ACTIVE'
    }
  });

  if (existingSubscription) {
    return NextResponse.json({
      success: false,
      error: 'User already has an active subscription'
    }, { status: 400 });
  }

  // Create free subscription
  const subscription = await prisma.subscription.create({
    data: {
      userId: userId,
      planId: planId,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      cancelAtPeriodEnd: false
    }
  });

  return NextResponse.json({
    success: true,
    subscription: subscription,
    message: 'Free plan activated successfully'
  });
}

function generatePayUUrl(payuData: any): string {
  const params = new URLSearchParams();
  
  Object.keys(payuData).forEach(key => {
    if (payuData[key]) {
      params.append(key, payuData[key]);
    }
  });

  return `${PAYU_CONFIG.baseUrl}/_payment?${params.toString()}`;
}