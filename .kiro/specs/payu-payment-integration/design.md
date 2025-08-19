# PayU Payment Integration - Design Document

## Overview

The PayU Payment Integration will provide a comprehensive payment solution for Pine Genie, supporting multiple subscription tiers, secure payment processing, and seamless user experience. The system will integrate PayU's payment gateway while maintaining PCI compliance and providing robust subscription management capabilities.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Pine Genie Frontend                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Pricing Page  │  Checkout Flow  │  Account Settings  │  Payment History      │
│                │                 │                    │                       │
│  ┌───────────┐ │  ┌─────────────┐ │  ┌──────────────┐ │  ┌─────────────────┐  │
│  │Subscription│ │  │   Payment   │ │  │ Subscription │ │  │    Invoice      │  │
│  │   Plans    │ │  │   Form      │ │  │  Management  │ │  │   Management    │  │
│  └───────────┘ │  └─────────────┘ │  └──────────────┘ │  └─────────────────┘  │
└─────────────────┼─────────────────┼────────────────────┼───────────────────────┘
                  │                 │                    │
          ┌───────▼─────────────────▼────────────────────▼───────────────────────┐
          │                    Pine Genie Backend API                           │
          │                                                                     │
          │  ┌─────────────────────────────────────────────────────────────┐   │
          │  │                Payment Service Layer                        │   │
          │  │                                                             │   │
          │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
          │  │  │ Subscription│  │   Payment   │  │     Invoice         │  │   │
          │  │  │   Manager   │  │  Processor  │  │    Generator        │  │   │
          │  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │   │
          │  │                                                             │   │
          │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
          │  │  │   Webhook   │  │   Currency  │  │      Security       │  │   │
          │  │  │   Handler   │  │   Manager   │  │     Validator       │  │   │
          │  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │   │
          │  └─────────────────────────────────────────────────────────────┘   │
          │                                                                     │
          │  ┌─────────────────────────────────────────────────────────────┐   │
          │  │                   Database Layer                            │   │
          │  │                                                             │   │
          │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
          │  │  │Subscriptions│  │  Payments   │  │      Invoices       │  │   │
          │  │  │    Table    │  │   Table     │  │       Table         │  │   │
          │  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │   │
          │  │                                                             │   │
          │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
          │  │  │    Plans    │  │   Webhooks  │  │    Usage Metrics    │  │   │
          │  │  │    Table    │  │    Table    │  │       Table         │  │   │
          │  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │   │
          │  └─────────────────────────────────────────────────────────────┘   │
          └─────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
          ┌─────────────────────────────────────────────────────────────────────┐
          │                        PayU Gateway                                 │
          │                                                                     │
          │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐ │
          │  │   Payment   │  │   Webhook   │  │        Currency             │ │
          │  │ Processing  │  │ Notifications│  │       Conversion            │ │
          │  └─────────────┘  └─────────────┘  └─────────────────────────────┘ │
          └─────────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Subscription Manager

**Purpose**: Manages subscription plans, user subscriptions, and plan transitions.

**Key Interfaces**:

```typescript
interface SubscriptionManager {
  getAvailablePlans(): Promise<SubscriptionPlan[]>;
  createSubscription(userId: string, planId: string, paymentMethodId: string): Promise<Subscription>;
  updateSubscription(subscriptionId: string, newPlanId: string): Promise<Subscription>;
  cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean): Promise<void>;
  getUserSubscription(userId: string): Promise<Subscription | null>;
  checkFeatureAccess(userId: string, feature: string): Promise<boolean>;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: {
    monthly: number;
    annual: number;
    currency: string;
  };
  features: PlanFeature[];
  limits: PlanLimits;
  isPopular: boolean;
  trialDays?: number;
  stripePriceId?: string;
  payuPlanId?: string;
}

interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number;
}

interface PlanLimits {
  strategiesPerMonth: number | 'unlimited';
  templatesAccess: 'basic' | 'all';
  aiGenerations: number | 'unlimited';
  exportFormats: string[];
  supportLevel: 'community' | 'priority' | 'dedicated';
  customSignatures: boolean;
  apiAccess: boolean;
  whiteLabel: boolean;
  teamCollaboration: boolean;
}

interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  payuSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Payment Processor

**Purpose**: Handles payment processing, PayU integration, and transaction management.

**Key Interfaces**:

```typescript
interface PaymentProcessor {
  createPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse>;
  processWebhook(webhookData: PayUWebhook): Promise<void>;
  refundPayment(paymentId: string, amount?: number): Promise<RefundResponse>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>;
  validateWebhookSignature(payload: string, signature: string): boolean;
}

interface PaymentRequest {
  userId: string;
  amount: number;
  currency: string;
  planId?: string;
  subscriptionId?: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  webhookUrl: string;
  customerInfo: CustomerInfo;
}

interface PaymentResponse {
  paymentId: string;
  payuTransactionId: string;
  redirectUrl: string;
  status: 'pending' | 'processing';
  expiresAt: Date;
}

interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: Address;
}

interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface PayUWebhook {
  merchantId: string;
  transactionId: string;
  referenceCode: string;
  status: PayUTransactionStatus;
  amount: number;
  currency: string;
  signature: string;
  timestamp: string;
  additionalInfo?: Record<string, any>;
}

enum PayUTransactionStatus {
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  PENDING = 'PENDING',
  ERROR = 'ERROR',
  EXPIRED = 'EXPIRED'
}
```

### 3. Invoice Generator

**Purpose**: Generates invoices, receipts, and handles tax calculations.

**Key Interfaces**:

```typescript
interface InvoiceGenerator {
  generateInvoice(payment: Payment): Promise<Invoice>;
  generateReceipt(payment: Payment): Promise<Receipt>;
  calculateTax(amount: number, country: string, state?: string): Promise<TaxCalculation>;
  sendInvoiceEmail(invoiceId: string, email: string): Promise<void>;
  getInvoicePDF(invoiceId: string): Promise<Buffer>;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  paymentId: string;
  amount: number;
  tax: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: Date;
  items: InvoiceItem[];
  billingAddress: Address;
  createdAt: Date;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate: number;
}

interface TaxCalculation {
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  taxJurisdiction: string;
}
```

### 4. Webhook Handler

**Purpose**: Processes PayU webhooks and updates system state accordingly.

**Key Interfaces**:

```typescript
interface WebhookHandler {
  processWebhook(webhook: PayUWebhook): Promise<WebhookProcessingResult>;
  validateSignature(payload: string, signature: string): boolean;
  handlePaymentSuccess(webhook: PayUWebhook): Promise<void>;
  handlePaymentFailure(webhook: PayUWebhook): Promise<void>;
  handleSubscriptionUpdate(webhook: PayUWebhook): Promise<void>;
}

interface WebhookProcessingResult {
  success: boolean;
  message: string;
  actions: string[];
  errors?: string[];
}
```

## Data Models

### Database Schema

```sql
-- Subscription Plans
CREATE TABLE subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  monthly_price DECIMAL(10,2) NOT NULL,
  annual_price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  features JSONB NOT NULL,
  limits JSONB NOT NULL,
  is_popular BOOLEAN DEFAULT false,
  trial_days INTEGER DEFAULT 0,
  payu_plan_id VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Subscriptions
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES subscription_plans(id),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_end TIMESTAMP,
  payu_subscription_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, status) WHERE status = 'active'
);

-- Payments
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  subscription_id INTEGER REFERENCES subscriptions(id),
  payu_transaction_id VARCHAR(100) UNIQUE,
  reference_code VARCHAR(100) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(20) NOT NULL,
  payment_method VARCHAR(50),
  description TEXT,
  customer_info JSONB,
  payu_response JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  payment_id INTEGER REFERENCES payments(id),
  amount DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  due_date TIMESTAMP,
  items JSONB NOT NULL,
  billing_address JSONB,
  pdf_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Webhook Events
CREATE TABLE webhook_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  payu_transaction_id VARCHAR(100),
  payload JSONB NOT NULL,
  signature VARCHAR(255),
  processed BOOLEAN DEFAULT false,
  processing_result JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);

-- Usage Metrics
CREATE TABLE usage_metrics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  subscription_id INTEGER REFERENCES subscriptions(id),
  metric_type VARCHAR(50) NOT NULL,
  metric_value INTEGER NOT NULL DEFAULT 1,
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, metric_type, period_start, period_end)
);

-- Indexes for performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payu_transaction_id ON payments(payu_transaction_id);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX idx_usage_metrics_user_period ON usage_metrics(user_id, period_start, period_end);
```

### Subscription Plan Definitions

```typescript
const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'free',
    displayName: 'Free',
    description: 'Perfect for getting started with Pine Script',
    price: {
      monthly: 0,
      annual: 0,
      currency: 'USD'
    },
    features: [
      { id: 'basic_templates', name: 'Basic Templates', description: 'Access to 5 basic strategy templates', included: true },
      { id: 'community_support', name: 'Community Support', description: 'Access to community forums', included: true },
      { id: 'pine_signature', name: 'Pine Genie Signature', description: 'Pine Genie branding in generated scripts', included: true }
    ],
    limits: {
      strategiesPerMonth: 5,
      templatesAccess: 'basic',
      aiGenerations: 3,
      exportFormats: ['pine'],
      supportLevel: 'community',
      customSignatures: false,
      apiAccess: false,
      whiteLabel: false,
      teamCollaboration: false
    },
    isPopular: false,
    trialDays: 0
  },
  {
    id: 'pro',
    name: 'pro',
    displayName: 'Pro',
    description: 'For serious traders who need advanced features',
    price: {
      monthly: 29.99,
      annual: 299.99,
      currency: 'USD'
    },
    features: [
      { id: 'all_templates', name: 'All Templates', description: 'Access to 50+ professional templates', included: true },
      { id: 'unlimited_strategies', name: 'Unlimited Strategies', description: 'Generate unlimited strategies', included: true },
      { id: 'advanced_ai', name: 'Advanced AI Features', description: 'AI-powered strategy optimization', included: true },
      { id: 'priority_support', name: 'Priority Support', description: 'Email support with 24h response', included: true },
      { id: 'custom_signatures', name: 'Custom Signatures', description: 'Customize script signatures', included: true },
      { id: 'export_formats', name: 'Multiple Export Formats', description: 'Export to Pine, JSON, and more', included: true }
    ],
    limits: {
      strategiesPerMonth: 'unlimited',
      templatesAccess: 'all',
      aiGenerations: 'unlimited',
      exportFormats: ['pine', 'json', 'txt'],
      supportLevel: 'priority',
      customSignatures: true,
      apiAccess: false,
      whiteLabel: false,
      teamCollaboration: false
    },
    isPopular: true,
    trialDays: 14
  },
  {
    id: 'enterprise',
    name: 'enterprise',
    displayName: 'Enterprise',
    description: 'For teams and organizations with advanced needs',
    price: {
      monthly: 99.99,
      annual: 999.99,
      currency: 'USD'
    },
    features: [
      { id: 'everything_pro', name: 'Everything in Pro', description: 'All Pro features included', included: true },
      { id: 'white_label', name: 'White Label Options', description: 'Remove Pine Genie branding', included: true },
      { id: 'api_access', name: 'API Access', description: 'Full REST API access', included: true },
      { id: 'dedicated_support', name: 'Dedicated Support', description: 'Dedicated account manager', included: true },
      { id: 'team_collaboration', name: 'Team Collaboration', description: 'Share strategies with team members', included: true },
      { id: 'custom_integrations', name: 'Custom Integrations', description: 'Custom integration development', included: true }
    ],
    limits: {
      strategiesPerMonth: 'unlimited',
      templatesAccess: 'all',
      aiGenerations: 'unlimited',
      exportFormats: ['pine', 'json', 'txt', 'xml'],
      supportLevel: 'dedicated',
      customSignatures: true,
      apiAccess: true,
      whiteLabel: true,
      teamCollaboration: true
    },
    isPopular: false,
    trialDays: 30
  }
];
```

## PayU Integration Configuration

### PayU API Configuration

```typescript
interface PayUConfig {
  merchantId: string;
  accountId: string;
  apiKey: string;
  apiLogin: string;
  publicKey: string;
  environment: 'sandbox' | 'production';
  baseUrl: string;
  webhookSecret: string;
  supportedCurrencies: string[];
  supportedCountries: string[];
}

const PAYU_CONFIG: PayUConfig = {
  merchantId: process.env.PAYU_MERCHANT_ID!,
  accountId: process.env.PAYU_ACCOUNT_ID!,
  apiKey: process.env.PAYU_API_KEY!,
  apiLogin: process.env.PAYU_API_LOGIN!,
  publicKey: process.env.PAYU_PUBLIC_KEY!,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://api.payulatam.com' 
    : 'https://sandbox.api.payulatam.com',
  webhookSecret: process.env.PAYU_WEBHOOK_SECRET!,
  supportedCurrencies: ['USD', 'EUR', 'GBP', 'INR', 'BRL', 'MXN'],
  supportedCountries: ['US', 'GB', 'IN', 'BR', 'MX', 'CO', 'AR', 'PE', 'CL']
};
```

## Error Handling

### Payment Error Types

```typescript
enum PaymentErrorType {
  INVALID_PAYMENT_METHOD = 'INVALID_PAYMENT_METHOD',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  PAYMENT_DECLINED = 'PAYMENT_DECLINED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PAYU_API_ERROR = 'PAYU_API_ERROR',
  WEBHOOK_VALIDATION_ERROR = 'WEBHOOK_VALIDATION_ERROR',
  SUBSCRIPTION_ERROR = 'SUBSCRIPTION_ERROR',
  CURRENCY_NOT_SUPPORTED = 'CURRENCY_NOT_SUPPORTED'
}

class PaymentErrorHandler {
  static handle(error: PaymentErrorType, context: any): PaymentErrorResponse {
    switch (error) {
      case PaymentErrorType.INVALID_PAYMENT_METHOD:
        return {
          userMessage: 'Please check your payment information and try again.',
          technicalMessage: 'Invalid payment method provided',
          retryable: true,
          suggestedActions: ['verify_payment_info', 'try_different_method']
        };
      case PaymentErrorType.INSUFFICIENT_FUNDS:
        return {
          userMessage: 'Insufficient funds. Please check your account balance.',
          technicalMessage: 'Payment declined due to insufficient funds',
          retryable: true,
          suggestedActions: ['check_balance', 'try_different_method']
        };
      case PaymentErrorType.PAYMENT_DECLINED:
        return {
          userMessage: 'Payment was declined. Please contact your bank or try a different payment method.',
          technicalMessage: 'Payment declined by payment processor',
          retryable: true,
          suggestedActions: ['contact_bank', 'try_different_method']
        };
      default:
        return {
          userMessage: 'An error occurred while processing your payment. Please try again.',
          technicalMessage: 'Unknown payment error',
          retryable: true,
          suggestedActions: ['retry_payment', 'contact_support']
        };
    }
  }
}

interface PaymentErrorResponse {
  userMessage: string;
  technicalMessage: string;
  retryable: boolean;
  suggestedActions: string[];
}
```

## Testing Strategy

### Testing Approach

1. **Unit Testing**
   - Payment processor logic
   - Subscription management
   - Webhook handling
   - Invoice generation
   - Tax calculations

2. **Integration Testing**
   - PayU API integration
   - Database operations
   - Email notifications
   - PDF generation

3. **End-to-End Testing**
   - Complete payment flows
   - Subscription lifecycle
   - Webhook processing
   - Error scenarios

4. **Security Testing**
   - Payment data encryption
   - Webhook signature validation
   - SQL injection prevention
   - Access control validation

### Test Coverage Requirements

- Minimum 95% code coverage for payment-related code
- All error scenarios tested
- Performance tests for high-volume scenarios
- Security penetration testing
- PayU sandbox integration testing

## Security Considerations

### Security Measures

1. **Data Encryption**
   - All payment data encrypted at rest
   - TLS 1.3 for data in transit
   - Sensitive data tokenization

2. **Access Control**
   - Role-based access to payment data
   - API rate limiting
   - IP whitelisting for webhooks

3. **Compliance**
   - PCI DSS compliance
   - GDPR compliance for EU users
   - SOX compliance for financial data

4. **Monitoring**
   - Real-time fraud detection
   - Payment anomaly monitoring
   - Security event logging

## Performance Considerations

### Optimization Strategies

1. **Database Optimization**
   - Proper indexing for payment queries
   - Connection pooling
   - Query optimization

2. **Caching**
   - Subscription plan caching
   - User permission caching
   - Invoice template caching

3. **Async Processing**
   - Webhook processing in background
   - Email notifications queued
   - Invoice generation async

### Performance Targets

- Payment processing: < 3 seconds
- Webhook processing: < 1 second
- Subscription status check: < 100ms
- Invoice generation: < 2 seconds
- Database queries: < 50ms average