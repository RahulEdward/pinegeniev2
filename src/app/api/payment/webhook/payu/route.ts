/**
 * PayU Webhook Handler
 * 
 * POST /api/payment/webhook/payu - Handle PayU payment notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/services/payment';
import type { PayUResponse } from '@/lib/payu-config';

export async function POST(request: NextRequest) {
  try {
    // Parse form data from PayU
    const formData = await request.formData();
    
    // Convert FormData to PayUResponse object
    const webhookData: Partial<PayUResponse> = {};
    
    for (const [key, value] of formData.entries()) {
      webhookData[key as keyof PayUResponse] = value.toString();
    }

    console.log('PayU Webhook received:', {
      txnid: webhookData.txnid,
      status: webhookData.status,
      amount: webhookData.amount,
      mihpayid: webhookData.mihpayid
    });

    // Validate required fields
    if (!webhookData.txnid || !webhookData.status || !webhookData.hash) {
      console.error('Invalid webhook data - missing required fields');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields' 
        },
        { status: 400 }
      );
    }

    // Process webhook
    const result = await paymentService.processWebhook(webhookData as PayUResponse);

    if (result.success) {
      console.log('Webhook processed successfully:', result.data?.actions);
      return NextResponse.json({
        success: true,
        message: 'Webhook processed successfully'
      });
    } else {
      console.error('Webhook processing failed:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error?.message || 'Webhook processing failed'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error processing PayU webhook:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Handle GET requests (for webhook verification)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'PayU webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}