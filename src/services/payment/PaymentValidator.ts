/**
 * Payment Validation Service
 * 
 * Handles validation of payment requests, amounts, and user eligibility
 */

import { PrismaClient } from '@prisma/client';
import type { PaymentRequest, CustomerInfo } from './PaymentProcessor';

const prisma = new PrismaClient();

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PaymentLimits {
  minAmount: number;
  maxAmount: number;
  dailyLimit: number;
  monthlyLimit: number;
  allowedCurrencies: string[];
}

export class PaymentValidator {
  private static readonly PAYMENT_LIMITS: PaymentLimits = {
    minAmount: 1, // ₹1
    maxAmount: 100000, // ₹1,00,000
    dailyLimit: 500000, // ₹5,00,000
    monthlyLimit: 2000000, // ₹20,00,000
    allowedCurrencies: ['INR']
  };

  /**
   * Validate payment request
   */
  static async validatePaymentRequest(request: PaymentRequest): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate basic fields
      if (!request.userId) {
        errors.push('User ID is required');
      }

      if (!request.amount || request.amount <= 0) {
        errors.push('Amount must be greater than 0');
      }

      if (!request.currency) {
        errors.push('Currency is required');
      }

      if (!request.description) {
        errors.push('Payment description is required');
      }

      // Validate customer info
      const customerValidation = this.validateCustomerInfo(request.customerInfo);
      errors.push(...customerValidation.errors);
      warnings.push(...customerValidation.warnings);

      // Validate amount limits
      const amountValidation = this.validateAmount(request.amount, request.currency);
      errors.push(...amountValidation.errors);
      warnings.push(...amountValidation.warnings);

      // Validate user eligibility
      if (request.userId) {
        const userValidation = await this.validateUserEligibility(request.userId);
        errors.push(...userValidation.errors);
        warnings.push(...userValidation.warnings);
      }

      // Validate daily/monthly limits
      if (request.userId && request.amount) {
        const limitsValidation = await this.validatePaymentLimits(request.userId, request.amount);
        errors.push(...limitsValidation.errors);
        warnings.push(...limitsValidation.warnings);
      }

      // Validate subscription-specific rules
      if (request.subscriptionId) {
        const subscriptionValidation = await this.validateSubscriptionPayment(request);
        errors.push(...subscriptionValidation.errors);
        warnings.push(...subscriptionValidation.warnings);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      console.error('Error validating payment request:', error);
      return {
        isValid: false,
        errors: ['Payment validation failed due to system error'],
        warnings
      };
    }
  }

  /**
   * Validate customer information
   */
  private static validateCustomerInfo(customerInfo: CustomerInfo): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!customerInfo) {
      errors.push('Customer information is required');
      return { isValid: false, errors, warnings };
    }

    // Validate email
    if (!customerInfo.email) {
      errors.push('Customer email is required');
    } else if (!this.isValidEmail(customerInfo.email)) {
      errors.push('Invalid email format');
    }

    // Validate name
    if (!customerInfo.firstName) {
      errors.push('Customer first name is required');
    } else if (customerInfo.firstName.length < 2) {
      errors.push('First name must be at least 2 characters');
    }

    // Validate phone (optional but if provided, should be valid)
    if (customerInfo.phone && !this.isValidIndianPhone(customerInfo.phone)) {
      warnings.push('Phone number format may be invalid');
    }

    // Validate address if provided
    if (customerInfo.address) {
      if (!customerInfo.address.country) {
        warnings.push('Country is recommended for billing address');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate payment amount
   */
  private static validateAmount(amount: number, currency: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check currency support
    if (!this.PAYMENT_LIMITS.allowedCurrencies.includes(currency)) {
      errors.push(`Currency ${currency} is not supported. Supported currencies: ${this.PAYMENT_LIMITS.allowedCurrencies.join(', ')}`);
    }

    // Check amount limits
    if (amount < this.PAYMENT_LIMITS.minAmount) {
      errors.push(`Amount must be at least ₹${this.PAYMENT_LIMITS.minAmount}`);
    }

    if (amount > this.PAYMENT_LIMITS.maxAmount) {
      errors.push(`Amount cannot exceed ₹${this.PAYMENT_LIMITS.maxAmount}`);
    }

    // Warning for large amounts
    if (amount > 50000) {
      warnings.push('Large amount transaction - additional verification may be required');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate user eligibility for payments
   */
  private static async validateUserEligibility(userId: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        errors.push('User not found');
        return { isValid: false, errors, warnings };
      }

      // Check if user email is verified
      if (!user.emailVerified) {
        warnings.push('Email verification recommended before payment');
      }

      // Check for any payment restrictions
      const recentFailedPayments = await prisma.payment.count({
        where: {
          userId: userId,
          status: 'DECLINED',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      if (recentFailedPayments >= 5) {
        errors.push('Too many failed payment attempts. Please try again later.');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      console.error('Error validating user eligibility:', error);
      return {
        isValid: false,
        errors: ['Unable to validate user eligibility'],
        warnings
      };
    }
  }

  /**
   * Validate payment limits (daily/monthly)
   */
  private static async validatePaymentLimits(userId: string, amount: number): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Check daily limit
      const dailyTotal = await prisma.payment.aggregate({
        where: {
          userId: userId,
          status: 'APPROVED',
          createdAt: {
            gte: startOfDay
          }
        },
        _sum: {
          amount: true
        }
      });

      const dailySpent = Number(dailyTotal._sum.amount || 0);
      if (dailySpent + amount > this.PAYMENT_LIMITS.dailyLimit) {
        errors.push(`Daily payment limit exceeded. Limit: ₹${this.PAYMENT_LIMITS.dailyLimit}, Spent: ₹${dailySpent}`);
      }

      // Check monthly limit
      const monthlyTotal = await prisma.payment.aggregate({
        where: {
          userId: userId,
          status: 'APPROVED',
          createdAt: {
            gte: startOfMonth
          }
        },
        _sum: {
          amount: true
        }
      });

      const monthlySpent = Number(monthlyTotal._sum.amount || 0);
      if (monthlySpent + amount > this.PAYMENT_LIMITS.monthlyLimit) {
        errors.push(`Monthly payment limit exceeded. Limit: ₹${this.PAYMENT_LIMITS.monthlyLimit}, Spent: ₹${monthlySpent}`);
      }

      // Warnings for approaching limits
      if (dailySpent + amount > this.PAYMENT_LIMITS.dailyLimit * 0.8) {
        warnings.push('Approaching daily payment limit');
      }

      if (monthlySpent + amount > this.PAYMENT_LIMITS.monthlyLimit * 0.8) {
        warnings.push('Approaching monthly payment limit');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      console.error('Error validating payment limits:', error);
      return {
        isValid: false,
        errors: ['Unable to validate payment limits'],
        warnings
      };
    }
  }

  /**
   * Validate subscription payment
   */
  private static async validateSubscriptionPayment(request: PaymentRequest): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      if (!request.subscriptionId) {
        return { isValid: true, errors, warnings };
      }

      // Check if subscription exists
      const subscription = await prisma.subscription.findUnique({
        where: { id: request.subscriptionId },
        include: { plan: true }
      });

      if (!subscription) {
        errors.push('Subscription not found');
        return { isValid: false, errors, warnings };
      }

      // Check if subscription belongs to the user
      if (subscription.userId !== request.userId) {
        errors.push('Subscription does not belong to the user');
      }

      // Check if subscription is in a payable state
      if (subscription.status === 'ACTIVE' && !subscription.cancelAtPeriodEnd) {
        warnings.push('Subscription is already active');
      }

      // Validate payment amount matches subscription plan
      const expectedAmount = subscription.plan.monthlyPrice;
      if (Math.abs(Number(expectedAmount) - request.amount) > 0.01) {
        errors.push(`Payment amount (₹${request.amount}) does not match subscription plan amount (₹${expectedAmount})`);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      console.error('Error validating subscription payment:', error);
      return {
        isValid: false,
        errors: ['Unable to validate subscription payment'],
        warnings
      };
    }
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate Indian phone number
   */
  private static isValidIndianPhone(phone: string): boolean {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check for valid Indian mobile number patterns
    const indianMobileRegex = /^(\+91|91|0)?[6-9]\d{9}$/;
    return indianMobileRegex.test(cleanPhone);
  }

  /**
   * Get payment limits for a user
   */
  static getPaymentLimits(): PaymentLimits {
    return { ...this.PAYMENT_LIMITS };
  }

  /**
   * Check if amount is within limits
   */
  static isAmountWithinLimits(amount: number, currency: string): boolean {
    return (
      amount >= this.PAYMENT_LIMITS.minAmount &&
      amount <= this.PAYMENT_LIMITS.maxAmount &&
      this.PAYMENT_LIMITS.allowedCurrencies.includes(currency)
    );
  }
}