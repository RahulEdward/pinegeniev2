/**
 * Payment Verification API
 * 
 * GET /api/payment/verify - Verify payment status after PayU redirect
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const txnid = searchParams.get('txnid');
    const mihpayid = searchParams.get('mihpayid');

    if (!txnid) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Find payment by reference code (txnid) or PayU transaction ID
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { referenceCode: txnid },
          { payuTransactionId: mihpayid || '' }
        ],
        userId: session.user.id
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        subscription: {
          include: {
            plan: {
              select: {
                name: true,
                displayName: true
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Format payment details for response
    const paymentDetails = {
      transactionId: payment.payuTransactionId || payment.referenceCode,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      planName: payment.subscription?.plan?.name || 'Unknown',
      planDisplayName: payment.subscription?.plan?.displayName || 'Unknown Plan',
      billingCycle: 'monthly', // You might want to store this in payment metadata
      paymentMethod: payment.paymentMethod || 'PayU',
      customerName: payment.user.name || 'Unknown',
      customerEmail: payment.user.email || '',
      activatedAt: payment.updatedAt.toISOString(),
      description: payment.description
    };

    return NextResponse.json({
      success: true,
      payment: paymentDetails
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