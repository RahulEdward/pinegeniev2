/**
 * PayU Webhook Handler
 * 
 * POST /api/payment/webhook - Handle PayU payment notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/services/payment';
import { subscriptionPlanManager } from '@/services/subscription';
import { verifyPayUResponseHash } from '@/lib/payu-config';
import type { PayUResponse } from '@/lib/payu-config';

export async function POST(request: NextRequest) {
  try {
    console.log('PayU webhook received');
    
    // Parse the webhook data
    const formData = await request.formData();
    const webhookData: Partial<PayUResponse> = {};
    
    // Convert FormData to PayUResponse object
    for (const [key, value] of formData.entries()) {
      webhookData[key as keyof PayUResponse] = value as string;
    }

    console.log('Webhook data:', {
      txnid: webhookData.txnid,
      status: webhookData.status,
      amount: webhookData.amount,
      mihpayid: webhookData.mihpayid
    });

    // Validate required fields
    if (!webhookData.txnid || !webhookData.status || !webhookData.hash) {
      console.error('Missing required webhook fields');
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValidSignature = paymentService.validateWebhookSignature(webhookData as PayUResponse);
    
    if (!isValidSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Process the webhook
    const result = await paymentService.processWebhook(webhookData as PayUResponse);

    if (!result.success) {
      console.error('Webhook processing failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error?.message || 'Processing failed' },
        { status: 500 }
      );
    }

    console.log('Webhook processed successfully:', result.data);

    // If payment was successful, activate subscription
    if (webhookData.status === 'success' && result.data?.payment) {
      try {
        const payment = result.data.payment;
        
        // Get payment metadata to find subscription details
        if (payment.subscriptionId) {
          // Update subscription status to active
          await subscriptionPlanManager.activateSubscription(payment.subscriptionId);
          console.log('Subscription activated:', payment.subscriptionId);
        }
      } catch (error) {
        console.error('Error activating subscription:', error);
        // Don't fail the webhook for subscription activation errors
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'PayU webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}