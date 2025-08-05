/**
 * Payment Service
 * 
 * Main service class that orchestrates payment processing, validation,
 * and error handling for the Pine Genie application
 */

import { PaymentProcessor } from './PaymentProcessor';
import { PaymentValidator } from './PaymentValidator';
import { PaymentErrorHandler, PaymentErrorType } from './PaymentErrorHandler';
import type { 
  PaymentRequest, 
  PaymentResponse, 
  PaymentStatus,
  WebhookProcessingResult 
} from './PaymentProcessor';
import type { PayUResponse } from '@/lib/payu-config';

export interface PaymentServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    type: PaymentErrorType;
    message: string;
    code: string;
    retryable: boolean;
    suggestedActions: string[];
  };
}

export class PaymentService {
  private processor: PaymentProcessor;
  
  constructor() {
    this.processor = new PaymentProcessor();
  }

  /**
   * Create a new payment
   */
  async createPayment(request: PaymentRequest): Promise<PaymentServiceResponse<PaymentResponse>> {
    try {
      // Validate payment request
      const validation = await PaymentValidator.validatePaymentRequest(request);
      
      if (!validation.isValid) {
        const errorType = PaymentErrorType.INVALID_PAYMENT_REQUEST;
        const errorResponse = PaymentErrorHandler.handleError(errorType, {
          userId: request.userId,
          amount: request.amount,
          currency: request.currency
        });

        PaymentErrorHandler.logError(errorType, {
          userId: request.userId,
          amount: request.amount,
          currency: request.currency,
          additionalInfo: { validationErrors: validation.errors }
        });

        return {
          success: false,
          error: {
            type: errorType,
            message: `Validation failed: ${validation.errors.join(', ')}`,
            code: errorResponse.errorCode,
            retryable: errorResponse.retryable,
            suggestedActions: errorResponse.suggestedActions
          }
        };
      }

      // Create payment
      const paymentResponse = await this.processor.createPayment(request);

      return {
        success: true,
        data: paymentResponse
      };

    } catch (error) {
      const errorType = PaymentErrorHandler.determineErrorType(error as Error, {
        userId: request.userId,
        amount: request.amount,
        currency: request.currency
      });

      const errorResponse = PaymentErrorHandler.handleError(errorType, {
        userId: request.userId,
        amount: request.amount,
        currency: request.currency,
        originalError: error as Error
      });

      PaymentErrorHandler.logError(errorType, {
        userId: request.userId,
        amount: request.amount,
        currency: request.currency,
        originalError: error as Error
      });

      return {
        success: false,
        error: {
          type: errorType,
          message: errorResponse.userMessage,
          code: errorResponse.errorCode,
          retryable: errorResponse.retryable,
          suggestedActions: errorResponse.suggestedActions
        }
      };
    }
  }

  /**
   * Process webhook from PayU
   */
  async processWebhook(webhookData: PayUResponse): Promise<PaymentServiceResponse<WebhookProcessingResult>> {
    try {
      const result = await this.processor.processWebhook(webhookData);

      return {
        success: result.success,
        data: result
      };

    } catch (error) {
      const errorType = PaymentErrorHandler.determineErrorType(error as Error, {
        transactionId: webhookData.txnid,
        additionalInfo: { webhookData }
      });

      const errorResponse = PaymentErrorHandler.handleError(errorType, {
        transactionId: webhookData.txnid,
        originalError: error as Error
      });

      PaymentErrorHandler.logError(errorType, {
        transactionId: webhookData.txnid,
        originalError: error as Error,
        additionalInfo: { webhookData }
      });

      return {
        success: false,
        error: {
          type: errorType,
          message: errorResponse.userMessage,
          code: errorResponse.errorCode,
          retryable: errorResponse.retryable,
          suggestedActions: errorResponse.suggestedActions
        }
      };
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentServiceResponse<PaymentStatus>> {
    try {
      const status = await this.processor.getPaymentStatus(paymentId);

      if (!status) {
        const errorType = PaymentErrorType.INVALID_PAYMENT_REQUEST;
        const errorResponse = PaymentErrorHandler.handleError(errorType, {
          paymentId
        });

        return {
          success: false,
          error: {
            type: errorType,
            message: 'Payment not found',
            code: errorResponse.errorCode,
            retryable: false,
            suggestedActions: errorResponse.suggestedActions
          }
        };
      }

      return {
        success: true,
        data: status
      };

    } catch (error) {
      const errorType = PaymentErrorHandler.determineErrorType(error as Error, {
        paymentId
      });

      const errorResponse = PaymentErrorHandler.handleError(errorType, {
        paymentId,
        originalError: error as Error
      });

      PaymentErrorHandler.logError(errorType, {
        paymentId,
        originalError: error as Error
      });

      return {
        success: false,
        error: {
          type: errorType,
          message: errorResponse.userMessage,
          code: errorResponse.errorCode,
          retryable: errorResponse.retryable,
          suggestedActions: errorResponse.suggestedActions
        }
      };
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(
    paymentId: string, 
    amount?: number
  ): Promise<PaymentServiceResponse<{ success: boolean; message: string }>> {
    try {
      const result = await this.processor.refundPayment(paymentId, amount);

      return {
        success: result.success,
        data: result
      };

    } catch (error) {
      const errorType = PaymentErrorHandler.determineErrorType(error as Error, {
        paymentId,
        amount
      });

      const errorResponse = PaymentErrorHandler.handleError(errorType, {
        paymentId,
        amount,
        originalError: error as Error
      });

      PaymentErrorHandler.logError(errorType, {
        paymentId,
        amount,
        originalError: error as Error
      });

      return {
        success: false,
        error: {
          type: errorType,
          message: errorResponse.userMessage,
          code: errorResponse.errorCode,
          retryable: errorResponse.retryable,
          suggestedActions: errorResponse.suggestedActions
        }
      };
    }
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(webhookData: PayUResponse): boolean {
    try {
      return this.processor.validateWebhookSignature(webhookData);
    } catch (error) {
      PaymentErrorHandler.logError(PaymentErrorType.WEBHOOK_VALIDATION_ERROR, {
        transactionId: webhookData.txnid,
        originalError: error as Error,
        additionalInfo: { webhookData }
      });
      return false;
    }
  }

  /**
   * Get payment limits
   */
  getPaymentLimits() {
    return PaymentValidator.getPaymentLimits();
  }

  /**
   * Check if amount is within limits
   */
  isAmountWithinLimits(amount: number, currency: string): boolean {
    return PaymentValidator.isAmountWithinLimits(amount, currency);
  }

  /**
   * Retry payment with exponential backoff
   */
  async retryPayment(
    originalRequest: PaymentRequest,
    attemptNumber: number = 1,
    maxAttempts: number = 3
  ): Promise<PaymentServiceResponse<PaymentResponse>> {
    if (attemptNumber > maxAttempts) {
      return {
        success: false,
        error: {
          type: PaymentErrorType.UNKNOWN_ERROR,
          message: 'Maximum retry attempts exceeded',
          code: 'PE999',
          retryable: false,
          suggestedActions: ['Contact customer support', 'Try again later']
        }
      };
    }

    const result = await this.createPayment(originalRequest);

    if (!result.success && result.error?.retryable) {
      const delay = PaymentErrorHandler.getRetryDelay(result.error.type, attemptNumber);
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay * 1000));
      
      return this.retryPayment(originalRequest, attemptNumber + 1, maxAttempts);
    }

    return result;
  }

  /**
   * Health check for payment service
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    checks: Record<string, boolean>;
    timestamp: string;
  }> {
    const checks: Record<string, boolean> = {};
    
    try {
      // Check database connectivity
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.$connect();
      await prisma.$disconnect();
      checks.database = true;
    } catch (error) {
      checks.database = false;
    }

    // Check PayU configuration
    try {
      const { validatePayUConfig, getPayUConfig } = await import('@/lib/payu-config');
      const config = getPayUConfig();
      checks.payuConfig = validatePayUConfig(config);
    } catch (error) {
      checks.payuConfig = false;
    }

    // Check environment variables
    checks.environment = !!(
      process.env.DATABASE_URL &&
      process.env.PAYU_MERCHANT_KEY &&
      process.env.PAYU_MERCHANT_SALT
    );

    const allHealthy = Object.values(checks).every(check => check);

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      checks,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const paymentService = new PaymentService();