/**
 * PayU Payment Processor
 * 
 * Core service for handling PayU Money payments in the Indian market.
 * Handles payment creation, processing, and webhook validation.
 */

import { PrismaClient } from '@prisma/client';
import { 
  generatePayUHash, 
  verifyPayUResponseHash, 
  generateTransactionId,
  formatAmountForPayU,
  getPayUConfig,
  PAYU_STATUS_MAPPING,
  getPayUErrorMessage
} from '@/lib/payu-config';
import type { 
  PayUPaymentRequest, 
  PayUResponse 
} from '@/lib/payu-config';

const prisma = new PrismaClient();

export interface PaymentRequest {
  userId: string;
  amount: number;
  currency: string;
  planId?: string;
  subscriptionId?: string;
  description: string;
  customerInfo: CustomerInfo;
  metadata?: Record<string, any>;
}

export interface CustomerInfo {
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  address?: Address;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country: string;
  postalCode?: string;
}

export interface PaymentResponse {
  paymentId: string;
  transactionId: string;
  redirectUrl: string;
  status: 'pending' | 'processing';
  expiresAt: Date;
  payuForm: PayUPaymentRequest;
}

export interface PaymentStatus {
  paymentId: string;
  status: 'pending' | 'processing' | 'approved' | 'declined' | 'error' | 'expired' | 'refunded';
  transactionId?: string;
  amount: number;
  currency: string;
  payuResponse?: any;
  updatedAt: Date;
}

export interface WebhookProcessingResult {
  success: boolean;
  message: string;
  actions: string[];
  errors?: string[];
}

export class PaymentProcessor {
  private config = getPayUConfig();

  /**
   * Create a new payment request
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Generate unique transaction ID
      const transactionId = generateTransactionId('PG');
      
      // Format amount for PayU
      const formattedAmount = formatAmountForPayU(request.amount, request.currency);
      
      // Create payment record in database
      const payment = await prisma.payment.create({
        data: {
          userId: request.userId,
          subscriptionId: request.subscriptionId,
          referenceCode: transactionId,
          amount: request.amount,
          currency: request.currency,
          status: 'PENDING',
          description: request.description,
          customerInfo: request.customerInfo,
          payuResponse: null
        }
      });

      // Prepare PayU payment request
      const payuRequest: PayUPaymentRequest = {
        key: this.config.merchantKey,
        txnid: transactionId,
        amount: formattedAmount,
        productinfo: request.description,
        firstname: request.customerInfo.firstName,
        email: request.customerInfo.email,
        phone: request.customerInfo.phone || '',
        surl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/success`,
        furl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/failure`,
        hash: '', // Will be generated below
        udf1: request.planId || '',
        udf2: request.subscriptionId || '',
        udf3: request.userId,
        udf4: payment.id,
        udf5: JSON.stringify(request.metadata || {})
      };

      // Generate hash for PayU request
      payuRequest.hash = generatePayUHash({
        key: payuRequest.key,
        txnid: payuRequest.txnid,
        amount: payuRequest.amount,
        productinfo: payuRequest.productinfo,
        firstname: payuRequest.firstname,
        email: payuRequest.email,
        udf1: payuRequest.udf1,
        udf2: payuRequest.udf2,
        udf3: payuRequest.udf3,
        udf4: payuRequest.udf4,
        udf5: payuRequest.udf5
      }, this.config.merchantSalt);

      // Update payment with PayU request data
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          payuTransactionId: transactionId,
          payuResponse: payuRequest
        }
      });

      return {
        paymentId: payment.id,
        transactionId: transactionId,
        redirectUrl: this.config.baseUrl,
        status: 'pending',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        payuForm: payuRequest
      };

    } catch (error) {
      console.error('Error creating payment:', error);
      throw new Error(`Payment creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process PayU webhook response
   */
  async processWebhook(webhookData: PayUResponse): Promise<WebhookProcessingResult> {
    try {
      const actions: string[] = [];
      
      // Verify webhook signature
      if (!this.validateWebhookSignature(webhookData)) {
        return {
          success: false,
          message: 'Invalid webhook signature',
          actions: [],
          errors: ['Webhook signature verification failed']
        };
      }

      // Log webhook event
      await prisma.webhookEvent.create({
        data: {
          eventType: 'payu_payment_response',
          payuTransactionId: webhookData.txnid,
          payload: webhookData,
          signature: webhookData.hash,
          processed: false
        }
      });

      // Find payment by transaction ID
      const payment = await prisma.payment.findUnique({
        where: { payuTransactionId: webhookData.txnid },
        include: { subscription: true, user: true }
      });

      if (!payment) {
        return {
          success: false,
          message: 'Payment not found',
          actions: [],
          errors: [`Payment with transaction ID ${webhookData.txnid} not found`]
        };
      }

      // Map PayU status to our status
      const newStatus = this.mapPayUStatus(webhookData.status);
      
      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          payuResponse: webhookData,
          updatedAt: new Date()
        }
      });

      actions.push(`Updated payment ${payment.id} status to ${newStatus}`);

      // Handle successful payment
      if (newStatus === 'APPROVED') {
        await this.handlePaymentSuccess(payment, webhookData);
        actions.push('Processed successful payment');
      }

      // Handle failed payment
      if (newStatus === 'DECLINED' || newStatus === 'ERROR') {
        await this.handlePaymentFailure(payment, webhookData);
        actions.push('Processed failed payment');
      }

      // Mark webhook as processed
      await prisma.webhookEvent.updateMany({
        where: { payuTransactionId: webhookData.txnid },
        data: { 
          processed: true, 
          processedAt: new Date(),
          processingResult: { success: true, actions }
        }
      });

      return {
        success: true,
        message: 'Webhook processed successfully',
        actions
      };

    } catch (error) {
      console.error('Error processing webhook:', error);
      
      // Mark webhook as failed
      if (webhookData.txnid) {
        await prisma.webhookEvent.updateMany({
          where: { payuTransactionId: webhookData.txnid },
          data: { 
            processed: true, 
            processedAt: new Date(),
            processingResult: { 
              success: false, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            }
          }
        });
      }

      return {
        success: false,
        message: 'Webhook processing failed',
        actions: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus | null> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
      });

      if (!payment) {
        return null;
      }

      return {
        paymentId: payment.id,
        status: payment.status.toLowerCase() as any,
        transactionId: payment.payuTransactionId || undefined,
        amount: Number(payment.amount),
        currency: payment.currency,
        payuResponse: payment.payuResponse,
        updatedAt: payment.updatedAt
      };

    } catch (error) {
      console.error('Error getting payment status:', error);
      throw new Error(`Failed to get payment status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentId: string, amount?: number): Promise<{ success: boolean; message: string }> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
      });

      if (!payment) {
        return { success: false, message: 'Payment not found' };
      }

      if (payment.status !== 'APPROVED') {
        return { success: false, message: 'Only approved payments can be refunded' };
      }

      // Note: PayU Money doesn't have direct refund API
      // Refunds need to be processed manually through PayU dashboard
      // We'll mark the payment as refunded in our system
      
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'REFUNDED',
          updatedAt: new Date()
        }
      });

      return { 
        success: true, 
        message: 'Payment marked as refunded. Please process refund through PayU dashboard.' 
      };

    } catch (error) {
      console.error('Error processing refund:', error);
      return { 
        success: false, 
        message: `Refund failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(response: PayUResponse): boolean {
    try {
      return verifyPayUResponseHash(response, this.config.merchantSalt);
    } catch (error) {
      console.error('Error validating webhook signature:', error);
      return false;
    }
  }

  /**
   * Map PayU status to our internal status
   */
  private mapPayUStatus(payuStatus: string): 'PENDING' | 'PROCESSING' | 'APPROVED' | 'DECLINED' | 'ERROR' | 'EXPIRED' | 'REFUNDED' {
    const statusMap: Record<string, any> = {
      'success': 'APPROVED',
      'failure': 'DECLINED',
      'pending': 'PENDING',
      'cancel': 'DECLINED',
      'invalid': 'ERROR',
      'dropped': 'DECLINED',
      'bounced': 'DECLINED',
      'userCancelled': 'DECLINED'
    };

    return statusMap[payuStatus] || 'ERROR';
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSuccess(payment: any, webhookData: PayUResponse): Promise<void> {
    try {
      // If this is a subscription payment, activate the subscription
      if (payment.subscriptionId) {
        await prisma.subscription.update({
          where: { id: payment.subscriptionId },
          data: {
            status: 'ACTIVE',
            updatedAt: new Date()
          }
        });
      }

      // Generate invoice
      await this.generateInvoice(payment, webhookData);

      // Send confirmation email (implement later)
      // await this.sendPaymentConfirmationEmail(payment);

    } catch (error) {
      console.error('Error handling payment success:', error);
    }
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailure(payment: any, webhookData: PayUResponse): Promise<void> {
    try {
      // If this is a subscription payment, mark subscription as failed
      if (payment.subscriptionId) {
        await prisma.subscription.update({
          where: { id: payment.subscriptionId },
          data: {
            status: 'UNPAID',
            updatedAt: new Date()
          }
        });
      }

      // Send failure notification email (implement later)
      // await this.sendPaymentFailureEmail(payment, webhookData);

    } catch (error) {
      console.error('Error handling payment failure:', error);
    }
  }

  /**
   * Generate invoice for successful payment
   */
  private async generateInvoice(payment: any, webhookData: PayUResponse): Promise<void> {
    try {
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      await prisma.invoice.create({
        data: {
          invoiceNumber,
          userId: payment.userId,
          paymentId: payment.id,
          amount: payment.amount,
          tax: Number(payment.amount) * 0.18, // 18% GST
          total: Number(payment.amount) * 1.18,
          currency: payment.currency,
          status: 'PAID',
          items: [{
            description: payment.description,
            quantity: 1,
            unitPrice: Number(payment.amount),
            total: Number(payment.amount),
            taxRate: 0.18
          }],
          billingAddress: payment.customerInfo
        }
      });

    } catch (error) {
      console.error('Error generating invoice:', error);
    }
  }
}