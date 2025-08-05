/**
 * Payment Services Index
 * 
 * Central export point for all payment-related services and types
 */

// Main Services
export { PaymentService, paymentService } from './PaymentService';
export { PaymentProcessor } from './PaymentProcessor';
export { PaymentValidator } from './PaymentValidator';
export { PaymentErrorHandler, PaymentErrorType } from './PaymentErrorHandler';

// Types
export type {
  PaymentRequest,
  PaymentResponse,
  PaymentStatus,
  CustomerInfo,
  Address,
  WebhookProcessingResult
} from './PaymentProcessor';

export type {
  ValidationResult,
  PaymentLimits
} from './PaymentValidator';

export type {
  PaymentErrorResponse,
  PaymentErrorContext
} from './PaymentErrorHandler';

export type {
  PaymentServiceResponse
} from './PaymentService';

// PayU Configuration
export {
  generatePayUHash,
  verifyPayUResponseHash,
  generateTransactionId,
  formatAmountForPayU,
  getPayUConfig,
  validatePayUConfig,
  PAYU_STATUS_MAPPING,
  PAYU_ERROR_CODES,
  getPayUErrorMessage
} from '@/lib/payu-config';

export type {
  PayUConfig,
  PayUPaymentRequest,
  PayUResponse
} from '@/lib/payu-config';