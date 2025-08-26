/**
 * Payment Verification API
 * 
 * POST /api/payment/verify - Verify payment status and activate subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    const { paymentId, status } = body;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Find the payment record
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId: session.user.id
      }
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (status === 'success') {
      // Update payment status to completed
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });

      // Check if user already has an active subscription
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          userId: session.user.id,
          status: 'ACTIVE'
        }
      });

      if (!existingSubscription) {
        // Get the plan details from payment description
        let planName = 'pro'; // Default to pro plan
        if (payment.description?.includes('Premium')) {
          planName = 'premium';
        } else if (payment.description?.includes('Free')) {
          planName = 'free';
        }

        // Find the plan
        const plan = await prisma.subscriptionPlan.findFirst({
          where: { name: planName }
        });

        if (plan) {
          // Create new subscription
          const subscription = await prisma.subscription.create({
            data: {
              userId: session.user.id,
              planId: plan.id,
              status: 'ACTIVE',
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              cancelAtPeriodEnd: false
            }
          });

          return NextResponse.json({
            success: true,
            message: 'Payment verified and subscription activated',
            subscription: subscription
          });
        }
      } else {
        // Extend existing subscription
        const newEndDate = new Date(existingSubscription.currentPeriodEnd);
        newEndDate.setMonth(newEndDate.getMonth() + 1); // Add 1 month

        await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            currentPeriodEnd: newEndDate
          }
        });

        return NextResponse.json({
          success: true,
          message: 'Payment verified and subscription extended',
          subscription: existingSubscription
        });
      }
    } else {
      // Update payment status to failed
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'FAILED'
        }
      });

      return NextResponse.json({
        success: false,
        error: 'Payment failed'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment status updated'
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to verify payment'
      },
      { status: 500 }
    );
  }
}