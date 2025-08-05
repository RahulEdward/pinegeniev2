/**
 * Payment Error Handler
 * 
 * Centralized error handling for payment operations with user-friendly messages
 * and appropriate retry strategies
 */

export enum PaymentErrorType {
  // Validation Errors
  INVALID_PAYMENT_REQUEST = 'INVALID_PAYMENT_REQUEST',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_CURRENCY = 'INVALID_CURRENCY',
  INVALID_CUSTOMER_INFO = 'INVALID_CUSTOMER_INFO',
  
  // User Errors
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_NOT_ELIGIBLE = 'USER_NOT_ELIGIBLE',
  PAYMENT_LIMIT_EXCEEDED = 'PAYMENT_LIMIT_EXCEEDED',
  
  // Payment Processing Errors
  PAYMENT_DECLINED = 'PAYMENT_DECLINED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INVALID_PAYMENT_METHOD = 'INVALID_PAYMENT_METHOD',
  PAYMENT_TIMEOUT = 'PAYMENT_TIMEOUT',
  
  // PayU Specific Errors
  PAYU_API_ERROR = 'PAYU_API_ERROR',
  PAYU_HASH_MISMATCH = 'PAYU_HASH_MISMATCH',
  PAYU_MERCHANT_ERROR = 'PAYU_MERCHANT_ERROR',
  
  // System Errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  WEBHOOK_VALIDATION_ERROR = 'WEBHOOK_VALIDATION_ERROR',
  SUBSCRIPTION_ERROR = 'SUBSCRIPTION_ERROR',
  
  // Security Errors
  FRAUD_DETECTED = 'FRAUD_DETECTED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  
  // General Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface PaymentErrorResponse {
  errorType: PaymentErrorType;
  userMessage: string;
  technicalMessage: string;
  errorCode: string;
  retryable: boolean;
  retryAfter?: number; // seconds
  suggestedActions: string[];
  supportContact?: boolean;
}

export interface PaymentErrorContext {
  userId?: string;
  paymentId?: string;
  transactionId?: string;
  amount?: number;
  currency?: string;
  originalError?: Error;
  additionalInfo?: Record<string, any>;
}

export class PaymentErrorHandler {
  private static readonly ERROR_CODES = {
    [PaymentErrorType.INVALID_PAYMENT_REQUEST]: 'PE001',
    [PaymentErrorType.INVALID_AMOUNT]: 'PE002',
    [PaymentErrorType.INVALID_CURRENCY]: 'PE003',
    [PaymentErrorType.INVALID_CUSTOMER_INFO]: 'PE004',
    [PaymentErrorType.USER_NOT_FOUND]: 'PE005',
    [PaymentErrorType.USER_NOT_ELIGIBLE]: 'PE006',
    [PaymentErrorType.PAYMENT_LIMIT_EXCEEDED]: 'PE007',
    [PaymentErrorType.PAYMENT_DECLINED]: 'PE008',
    [PaymentErrorType.INSUFFICIENT_FUNDS]: 'PE009',
    [PaymentErrorType.INVALID_PAYMENT_METHOD]: 'PE010',
    [PaymentErrorType.PAYMENT_TIMEOUT]: 'PE011',
    [PaymentErrorType.PAYU_API_ERROR]: 'PE012',
    [PaymentErrorType.PAYU_HASH_MISMATCH]: 'PE013',
    [PaymentErrorType.PAYU_MERCHANT_ERROR]: 'PE014',
    [PaymentErrorType.DATABASE_ERROR]: 'PE015',
    [PaymentErrorType.NETWORK_ERROR]: 'PE016',
    [PaymentErrorType.WEBHOOK_VALIDATION_ERROR]: 'PE017',
    [PaymentErrorType.SUBSCRIPTION_ERROR]: 'PE018',
    [PaymentErrorType.FRAUD_DETECTED]: 'PE019',
    [PaymentErrorType.SUSPICIOUS_ACTIVITY]: 'PE020',
    [PaymentErrorType.UNKNOWN_ERROR]: 'PE999'
  };

  /**
   * Handle payment error and return user-friendly response
   */
  static handleError(
    errorType: PaymentErrorType, 
    context: PaymentErrorContext = {}
  ): PaymentErrorResponse {
    const errorCode = this.ERROR_CODES[errorType];
    
    switch (errorType) {
      case PaymentErrorType.INVALID_PAYMENT_REQUEST:
        return {
          errorType,
          userMessage: 'Please check your payment information and try again.',
          technicalMessage: 'Invalid payment request parameters',
          errorCode,
          retryable: true,
          suggestedActions: [
            'Verify all required fields are filled',
            'Check payment amount and currency',
            'Ensure customer information is complete'
          ]
        };

      case PaymentErrorType.INVALID_AMOUNT:
        return {
          errorType,
          userMessage: `Payment amount must be between ₹1 and ₹1,00,000.`,
          technicalMessage: `Invalid amount: ${context.amount} ${context.currency}`,
          errorCode,
          retryable: true,
          suggestedActions: [
            'Enter a valid payment amount',
            'Check minimum and maximum limits',
            'Contact support for higher limits'
          ]
        };

      case PaymentErrorType.INVALID_CURRENCY:
        return {
          errorType,
          userMessage: 'Only Indian Rupees (INR) payments are supported.',
          technicalMessage: `Unsupported currency: ${context.currency}`,
          errorCode,
          retryable: false,
          suggestedActions: [
            'Use INR currency for payments',
            'Contact support for other currency options'
          ]
        };

      case PaymentErrorType.PAYMENT_LIMIT_EXCEEDED:
        return {
          errorType,
          userMessage: 'Payment limit exceeded. Please try with a smaller amount or contact support.',
          technicalMessage: 'Daily or monthly payment limit exceeded',
          errorCode,
          retryable: true,
          retryAfter: 86400, // 24 hours
          suggestedActions: [
            'Try with a smaller amount',
            'Wait for limit reset (daily/monthly)',
            'Contact support to increase limits'
          ],
          supportContact: true
        };

      case PaymentErrorType.PAYMENT_DECLINED:
        return {
          errorType,
          userMessage: 'Payment was declined by your bank. Please try a different payment method or contact your bank.',
          technicalMessage: 'Payment declined by payment processor',
          errorCode,
          retryable: true,
          suggestedActions: [
            'Try a different payment method',
            'Contact your bank',
            'Check account balance and limits',
            'Verify card details'
          ]
        };

      case PaymentErrorType.INSUFFICIENT_FUNDS:
        return {
          errorType,
          userMessage: 'Insufficient funds in your account. Please check your balance and try again.',
          technicalMessage: 'Payment declined due to insufficient funds',
          errorCode,
          retryable: true,
          suggestedActions: [
            'Check account balance',
            'Add funds to your account',
            'Try a different payment method'
          ]
        };

      case PaymentErrorType.INVALID_PAYMENT_METHOD:
        return {
          errorType,
          userMessage: 'Invalid payment method. Please check your card details and try again.',
          technicalMessage: 'Invalid payment method or card details',
          errorCode,
          retryable: true,
          suggestedActions: [
            'Verify card number and expiry date',
            'Check CVV code',
            'Try a different card',
            'Use net banking or UPI'
          ]
        };

      case PaymentErrorType.PAYMENT_TIMEOUT:
        return {
          errorType,
          userMessage: 'Payment timed out. Please try again.',
          technicalMessage: 'Payment processing timeout',
          errorCode,
          retryable: true,
          retryAfter: 300, // 5 minutes
          suggestedActions: [
            'Try again in a few minutes',
            'Check internet connection',
            'Use a different payment method'
          ]
        };

      case PaymentErrorType.PAYU_API_ERROR:
        return {
          errorType,
          userMessage: 'Payment service temporarily unavailable. Please try again later.',
          technicalMessage: 'PayU API error',
          errorCode,
          retryable: true,
          retryAfter: 600, // 10 minutes
          suggestedActions: [
            'Try again in a few minutes',
            'Contact support if problem persists'
          ],
          supportContact: true
        };

      case PaymentErrorType.PAYU_HASH_MISMATCH:
        return {
          errorType,
          userMessage: 'Payment verification failed. Please try again.',
          technicalMessage: 'PayU hash verification failed',
          errorCode,
          retryable: true,
          suggestedActions: [
            'Try the payment again',
            'Clear browser cache and cookies',
            'Contact support if problem persists'
          ],
          supportContact: true
        };

      case PaymentErrorType.USER_NOT_FOUND:
        return {
          errorType,
          userMessage: 'User account not found. Please log in and try again.',
          technicalMessage: 'User not found in database',
          errorCode,
          retryable: false,
          suggestedActions: [
            'Log in to your account',
            'Create an account if you don\'t have one',
            'Contact support'
          ],
          supportContact: true
        };

      case PaymentErrorType.SUBSCRIPTION_ERROR:
        return {
          errorType,
          userMessage: 'Subscription error. Please contact support.',
          technicalMessage: 'Subscription processing error',
          errorCode,
          retryable: false,
          suggestedActions: [
            'Contact customer support',
            'Check subscription status',
            'Try again later'
          ],
          supportContact: true
        };

      case PaymentErrorType.FRAUD_DETECTED:
        return {
          errorType,
          userMessage: 'Payment blocked for security reasons. Please contact support.',
          technicalMessage: 'Fraud detection triggered',
          errorCode,
          retryable: false,
          suggestedActions: [
            'Contact customer support immediately',
            'Verify your identity',
            'Use a different payment method'
          ],
          supportContact: true
        };

      case PaymentErrorType.DATABASE_ERROR:
        return {
          errorType,
          userMessage: 'System error occurred. Please try again later.',
          technicalMessage: 'Database operation failed',
          errorCode,
          retryable: true,
          retryAfter: 300,
          suggestedActions: [
            'Try again in a few minutes',
            'Contact support if problem persists'
          ],
          supportContact: true
        };

      case PaymentErrorType.NETWORK_ERROR:
        return {
          errorType,
          userMessage: 'Network error. Please check your connection and try again.',
          technicalMessage: 'Network connectivity issue',
          errorCode,
          retryable: true,
          retryAfter: 60,
          suggestedActions: [
            'Check internet connection',
            'Try again in a moment',
            'Use a different network'
          ]
        };

      default:
        return {
          errorType: PaymentErrorType.UNKNOWN_ERROR,
          userMessage: 'An unexpected error occurred. Please try again or contact support.',
          technicalMessage: context.originalError?.message || 'Unknown error',
          errorCode: this.ERROR_CODES[PaymentErrorType.UNKNOWN_ERROR],
          retryable: true,
          suggestedActions: [
            'Try the payment again',
            'Contact customer support',
            'Check system status'
          ],
          supportContact: true
        };
    }
  }

  /**
   * Determine error type from error message or code
   */
  static determineErrorType(error: Error | string, context: PaymentErrorContext = {}): PaymentErrorType {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const lowerMessage = errorMessage.toLowerCase();

    // PayU specific errors
    if (lowerMessage.includes('hash') && lowerMessage.includes('mismatch')) {
      return PaymentErrorType.PAYU_HASH_MISMATCH;
    }

    if (lowerMessage.includes('merchant') && lowerMessage.includes('unauthorized')) {
      return PaymentErrorType.PAYU_MERCHANT_ERROR;
    }

    // Payment processing errors
    if (lowerMessage.includes('declined') || lowerMessage.includes('rejected')) {
      return PaymentErrorType.PAYMENT_DECLINED;
    }

    if (lowerMessage.includes('insufficient') && lowerMessage.includes('funds')) {
      return PaymentErrorType.INSUFFICIENT_FUNDS;
    }

    if (lowerMessage.includes('invalid') && lowerMessage.includes('card')) {
      return PaymentErrorType.INVALID_PAYMENT_METHOD;
    }

    if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
      return PaymentErrorType.PAYMENT_TIMEOUT;
    }

    // Validation errors
    if (lowerMessage.includes('amount') && lowerMessage.includes('invalid')) {
      return PaymentErrorType.INVALID_AMOUNT;
    }

    if (lowerMessage.includes('currency') && lowerMessage.includes('not supported')) {
      return PaymentErrorType.INVALID_CURRENCY;
    }

    // System errors
    if (lowerMessage.includes('database') || lowerMessage.includes('prisma')) {
      return PaymentErrorType.DATABASE_ERROR;
    }

    if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
      return PaymentErrorType.NETWORK_ERROR;
    }

    if (lowerMessage.includes('user') && lowerMessage.includes('not found')) {
      return PaymentErrorType.USER_NOT_FOUND;
    }

    if (lowerMessage.includes('limit') && lowerMessage.includes('exceeded')) {
      return PaymentErrorType.PAYMENT_LIMIT_EXCEEDED;
    }

    // Security errors
    if (lowerMessage.includes('fraud') || lowerMessage.includes('suspicious')) {
      return PaymentErrorType.FRAUD_DETECTED;
    }

    return PaymentErrorType.UNKNOWN_ERROR;
  }

  /**
   * Log error with context
   */
  static logError(
    errorType: PaymentErrorType, 
    context: PaymentErrorContext, 
    error?: Error
  ): void {
    const logData = {
      errorType,
      errorCode: this.ERROR_CODES[errorType],
      context,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined,
      timestamp: new Date().toISOString()
    };

    console.error('Payment Error:', JSON.stringify(logData, null, 2));

    // In production, you might want to send this to a logging service
    // like Sentry, LogRocket, or CloudWatch
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(errorType: PaymentErrorType): boolean {
    const nonRetryableErrors = [
      PaymentErrorType.INVALID_CURRENCY,
      PaymentErrorType.USER_NOT_FOUND,
      PaymentErrorType.FRAUD_DETECTED,
      PaymentErrorType.SUBSCRIPTION_ERROR
    ];

    return !nonRetryableErrors.includes(errorType);
  }

  /**
   * Get retry delay for error type
   */
  static getRetryDelay(errorType: PaymentErrorType, attemptNumber: number = 1): number {
    const baseDelays: Record<PaymentErrorType, number> = {
      [PaymentErrorType.NETWORK_ERROR]: 60,
      [PaymentErrorType.PAYMENT_TIMEOUT]: 300,
      [PaymentErrorType.PAYU_API_ERROR]: 600,
      [PaymentErrorType.DATABASE_ERROR]: 300,
      [PaymentErrorType.PAYMENT_LIMIT_EXCEEDED]: 86400
    };

    const baseDelay = baseDelays[errorType] || 300;
    
    // Exponential backoff with jitter
    const exponentialDelay = baseDelay * Math.pow(2, attemptNumber - 1);
    const jitter = Math.random() * 0.1 * exponentialDelay;
    
    return Math.min(exponentialDelay + jitter, 3600); // Max 1 hour
  }
}