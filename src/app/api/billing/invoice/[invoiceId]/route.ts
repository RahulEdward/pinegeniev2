/**
 * Invoice Download API
 * 
 * GET /api/billing/invoice/[invoiceId] - Download specific invoice
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { invoiceId } = params;

    // Get invoice for the user
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: session.user.id
      },
      include: {
        payment: true,
        user: true
      }
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Generate invoice data (in a real app, you'd generate a PDF)
    const invoiceData = {
      invoiceNumber: invoice.invoiceNumber,
      date: invoice.createdAt.toISOString(),
      dueDate: invoice.dueDate?.toISOString(),
      amount: Number(invoice.amount),
      tax: Number(invoice.tax),
      total: Number(invoice.total),
      currency: invoice.currency,
      status: invoice.status,
      items: invoice.items,
      billingAddress: invoice.billingAddress,
      customer: {
        name: invoice.user.name,
        email: invoice.user.email
      }
    };

    return NextResponse.json({
      success: true,
      invoice: invoiceData,
      downloadUrl: `/api/billing/invoice/${invoiceId}/pdf` // Future PDF endpoint
    });

  } catch (error) {
    console.error('Error fetching invoice:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch invoice'
      },
      { status: 500 }
    );
  }
}