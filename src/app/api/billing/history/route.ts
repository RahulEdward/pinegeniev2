/**
 * Billing History API
 * 
 * GET /api/billing/history - Get user's billing history
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

    // Get user's payment history
    const payments = await prisma.payment.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        subscription: {
          include: {
            plan: true
          }
        },
        invoices: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const billingHistory = payments.map(payment => ({
      id: payment.id,
      date: payment.createdAt.toISOString(),
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      description: payment.description || `${payment.subscription?.plan?.displayName || 'Unknown'} Plan`,
      paymentMethod: payment.paymentMethod,
      invoiceId: payment.invoices[0]?.id || null,
      invoiceNumber: payment.invoices[0]?.invoiceNumber || null
    }));

    return NextResponse.json({
      success: true,
      history: billingHistory
    });

  } catch (error) {
    console.error('Error fetching billing history:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch billing history'
      },
      { status: 500 }
    );
  }
}