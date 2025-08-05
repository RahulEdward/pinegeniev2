/**
 * Payment Service Tests
 * 
 * Basic tests to verify payment service functionality
 */

import { PaymentService } from '../PaymentService';
import { PaymentValidator } from '../PaymentValidator';
import { PaymentErrorType } from '../PaymentErrorHandler';
import type { PaymentRequest } from '../PaymentProcessor';

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    payment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn()
    },
    user: {
      findUnique: jest.fn()
    },
    subscription: {
      findUnique: jest.fn(),
      update: jest.fn()
    },
    webhookEvent: {
      create: jest.fn(),
      updateMany: jest.fn()
    },
    invoice: {
      create: jest.fn()
    }
  }))
}));

describe('PaymentService', () => {
  let paymentService: PaymentService;

  beforeEach(() => {
    paymentService = new PaymentService();
    jest.clearAllMocks();
  });

  describe('Payment Validation', () => {
    test('should validate payment limits', () => {
      const limits = PaymentValidator.getPaymentLimits();
      
      expect(limits.minAmount).toBe(1);
      expect(limits.maxAmount).toBe(100000);
      expect(limits.allowedCurrencies).toContain('INR');
    });

    test('should check if amount is within limits', () => {
      expect(PaymentValidator.isAmountWithinLimits(100, 'INR')).toBe(true);
      expect(PaymentValidator.isAmountWithinLimits(0.5, 'INR')).toBe(false);
      expect(PaymentValidator.isAmountWithinLimits(200000, 'INR')).toBe(false);
      expect(PaymentValidator.isAmountWithinLimits(100, 'USD')).toBe(false);
    });
  });

  describe('Payment Request Validation', () => {
    const validPaymentRequest: PaymentRequest = {
      userId: 'user123',
      amount: 299.99,
      currency: 'INR',
      description: 'Pro Plan Subscription',
      customerInfo: {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+919876543210'
      }
    };

    test('should validate valid payment request', async () => {
      // Mock user exists
      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user123',
        email: 'test@example.com',
        emailVerified: new Date()
      });
      mockPrisma.payment.count.mockResolvedValue(0);
      mockPrisma.payment.aggregate.mockResolvedValue({ _sum: { amount: 0 } });

      const validation = await PaymentValidator.validatePaymentRequest(validPaymentRequest);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should reject invalid email', async () => {
      const invalidRequest = {
        ...validPaymentRequest,
        customerInfo: {
          ...validPaymentRequest.customerInfo,
          email: 'invalid-email'
        }
      };

      const validation = await PaymentValidator.validatePaymentRequest(invalidRequest);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid email format');
    });

    test('should reject invalid amount', async () => {
      const invalidRequest = {
        ...validPaymentRequest,
        amount: -100
      };

      const validation = await PaymentValidator.validatePaymentRequest(invalidRequest);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Amount must be greater than 0');
    });

    test('should reject unsupported currency', async () => {
      const invalidRequest = {
        ...validPaymentRequest,
        currency: 'USD'
      };

      const validation = await PaymentValidator.validatePaymentRequest(invalidRequest);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(error => error.includes('Currency USD is not supported'))).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle validation errors gracefully', async () => {
      const invalidRequest: PaymentRequest = {
        userId: '',
        amount: 0,
        currency: 'USD',
        description: '',
        customerInfo: {
          email: 'invalid-email',
          firstName: ''
        }
      };

      const result = await paymentService.createPayment(invalidRequest);
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(PaymentErrorType.INVALID_PAYMENT_REQUEST);
      expect(result.error?.retryable).toBe(true);
      expect(result.error?.suggestedActions).toBeDefined();
    });
  });

  describe('Health Check', () => {
    test('should perform health check', async () => {
      const health = await paymentService.healthCheck();
      
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('checks');
      expect(health).toHaveProperty('timestamp');
      expect(health.checks).toHaveProperty('database');
      expect(health.checks).toHaveProperty('payuConfig');
      expect(health.checks).toHaveProperty('environment');
    });
  });

  describe('Utility Methods', () => {
    test('should get payment limits', () => {
      const limits = paymentService.getPaymentLimits();
      
      expect(limits).toHaveProperty('minAmount');
      expect(limits).toHaveProperty('maxAmount');
      expect(limits).toHaveProperty('allowedCurrencies');
      expect(limits.allowedCurrencies).toContain('INR');
    });

    test('should check amount limits', () => {
      expect(paymentService.isAmountWithinLimits(100, 'INR')).toBe(true);
      expect(paymentService.isAmountWithinLimits(0, 'INR')).toBe(false);
      expect(paymentService.isAmountWithinLimits(100, 'USD')).toBe(false);
    });
  });
});