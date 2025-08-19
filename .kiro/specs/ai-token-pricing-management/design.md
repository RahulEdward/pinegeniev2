# AI Token and Pricing Management System Design

## Overview

The AI Token and Pricing Management System extends the existing PineGenie admin dashboard with four new management sections that integrate seamlessly with the current architecture. Built using the existing Next.js, TypeScript, Tailwind CSS, and Prisma stack, this system adds powerful monetization and resource management capabilities while preserving all existing admin functionality.

The design follows the established patterns from the existing admin system, using the same AdminLayout, theme system, and security model to ensure consistency and maintainability.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Existing Admin Dashboard                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │ AI Control  │ │   Models    │ │  API Keys   │ │ Settings  │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │    Users    │ │  Analytics  │ │  Security   │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              NEW: AI Token & Pricing Management                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │   Tokens    │ │   Pricing   │ │ Promotions  │ │  Content  │ │
│  │ Management  │ │ Management  │ │ & Discounts │ │Management │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Existing Database Layer                      │
│     SubscriptionPlan │ Payment │ Invoice │ UsageMetric          │
│     User │ AdminUser │ AuditLog │ AdminSettings                 │
└─────────────────────────────────────────────────────────────────┘
```

### Integration Strategy

1. **Non-Invasive Extension**: New features are added as separate admin routes without modifying existing functionality
2. **Shared Infrastructure**: Uses existing AdminLayout, theme system, authentication, and database models
3. **Consistent UX**: Follows established design patterns and component structure
4. **Database Harmony**: Extends existing schema with new tables while preserving current relationships

## Components and Interfaces

### 1. AI Token Management System

#### TokenManagement Component
```typescript
interface TokenManagementProps {
  // Main token management interface
}

interface UserTokenData {
  userId: string;
  userName: string;
  email: string;
  currentTokens: number;
  monthlyAllocation: number;
  tokensUsed: number;
  subscriptionPlan: string;
  lastRefresh: Date;
  expiresAt: Date;
}

interface TokenPackage {
  id: string;
  name: string;
  tokenCount: number;
  price: number;
  currency: string;
  validityDays: number;
  isActive: boolean;
}

interface TokenUsageMetrics {
  totalTokensAllocated: number;
  totalTokensUsed: number;
  utilizationRate: number;
  costPerToken: number;
  revenuePerToken: number;
  topUsers: UserTokenData[];
  usageByModel: Record<string, number>;
  usageByTimeframe: Array<{
    date: string;
    tokens: number;
    cost: number;
  }>;
}
```

#### TokenAllocationModal Component
```typescript
interface TokenAllocationModalProps {
  user: UserTokenData;
  isOpen: boolean;
  onClose: () => void;
  onAllocate: (allocation: TokenAllocation) => void;
}

interface TokenAllocation {
  userId: string;
  tokenAmount: number;
  allocationType: 'add' | 'set' | 'subtract';
  expiryDate?: Date;
  reason: string;
  notifyUser: boolean;
}
```

### 2. Dynamic Pricing Management System

#### PricingManagement Component
```typescript
interface PricingManagementProps {
  // Main pricing management interface
}

interface PricingPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  features: PlanFeature[];
  limits: PlanLimits;
  isPopular: boolean;
  isActive: boolean;
  trialDays: number;
  payuPlanId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  icon?: string;
  highlight?: boolean;
}

interface PlanLimits {
  strategiesPerMonth: number | 'unlimited';
  templatesAccess: 'basic' | 'all';
  aiGenerations: number;
  aiChatAccess: boolean;
  scriptStorage: number | 'unlimited';
  exportFormats: string[];
  supportLevel: 'basic' | 'priority' | 'dedicated';
  customSignatures: boolean;
  apiAccess: boolean;
  whiteLabel: boolean;
  teamCollaboration: boolean;
  advancedIndicators: boolean;
  backtesting: boolean;
}
```

#### PricingPlanEditor Component
```typescript
interface PricingPlanEditorProps {
  plan?: PricingPlan;
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: PricingPlan) => void;
}

interface PricingHistory {
  id: string;
  planId: string;
  oldPrice: number;
  newPrice: number;
  changeReason: string;
  effectiveDate: Date;
  affectedUsers: number;
  grandfatheredUsers: number;
  adminId: string;
}
```

### 3. Promotional Offers and Discount System

#### PromotionManagement Component
```typescript
interface PromotionManagementProps {
  // Main promotion management interface
}

interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'free_trial' | 'upgrade_discount';
  value: number; // percentage or fixed amount
  code?: string; // discount code
  isCodeRequired: boolean;
  startDate: Date;
  endDate: Date;
  usageLimit?: number;
  usageCount: number;
  eligiblePlans: string[]; // plan IDs
  eligibleUsers?: string[]; // user IDs for targeted promotions
  isActive: boolean;
  autoApply: boolean; // apply automatically without code
  stackable: boolean; // can be combined with other promotions
  createdAt: Date;
  updatedAt: Date;
}

interface PromotionUsage {
  id: string;
  promotionId: string;
  userId: string;
  subscriptionId: string;
  discountAmount: number;
  appliedAt: Date;
}

interface PromotionAnalytics {
  totalPromotions: number;
  activePromotions: number;
  totalUsage: number;
  totalDiscountGiven: number;
  conversionRate: number;
  revenueImpact: number;
  topPerformingPromotions: Array<{
    promotion: Promotion;
    usage: number;
    revenue: number;
    conversionRate: number;
  }>;
}
```

#### PromotionEditor Component
```typescript
interface PromotionEditorProps {
  promotion?: Promotion;
  isOpen: boolean;
  onClose: () => void;
  onSave: (promotion: Promotion) => void;
}

interface DiscountCodeGenerator {
  prefix?: string;
  length: number;
  quantity: number;
  includeNumbers: boolean;
  includeLetters: boolean;
  excludeSimilar: boolean; // exclude 0, O, 1, I, etc.
}
```

### 4. Pricing Plan Content Management System

#### ContentManagement Component
```typescript
interface ContentManagementProps {
  // Main content management interface
}

interface PricingPageContent {
  id: string;
  planId: string;
  heroTitle: string;
  heroSubtitle: string;
  features: ContentFeature[];
  benefits: string[];
  testimonials: Testimonial[];
  faq: FAQ[];
  callToAction: CallToAction;
  comparisonTable: ComparisonTableData;
  lastUpdated: Date;
  publishedAt?: Date;
  isDraft: boolean;
}

interface ContentFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  highlight: boolean;
  order: number;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  content: string;
  avatar?: string;
  rating: number;
  featured: boolean;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isPublished: boolean;
}

interface CallToAction {
  primaryText: string;
  secondaryText?: string;
  buttonText: string;
  buttonColor: string;
  urgencyText?: string;
  guaranteeText?: string;
}

interface ComparisonTableData {
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
}

interface ComparisonColumn {
  id: string;
  planId: string;
  planName: string;
  isHighlighted: boolean;
  badge?: string;
}

interface ComparisonRow {
  id: string;
  feature: string;
  category: string;
  values: Record<string, string | boolean>; // planId -> value
}
```

#### RichTextEditor Component
```typescript
interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  toolbar?: ToolbarOption[];
  maxLength?: number;
}

interface ToolbarOption {
  type: 'bold' | 'italic' | 'underline' | 'link' | 'list' | 'heading' | 'color' | 'image';
  enabled: boolean;
}
```

## Data Models

### Extended Database Schema

```typescript
// New tables to add to existing schema

model TokenAllocation {
  id            String   @id @default(cuid())
  userId        String   @map("user_id")
  tokenAmount   Int      @map("token_amount")
  allocatedBy   String   @map("allocated_by") // Admin user ID
  reason        String?
  expiresAt     DateTime? @map("expires_at")
  isActive      Boolean  @default(true) @map("is_active")
  createdAt     DateTime @default(now()) @map("created_at")
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
  @@index([isActive])
  @@map("token_allocations")
}

model TokenUsageLog {
  id              String   @id @default(cuid())
  userId          String   @map("user_id")
  modelId         String?  @map("model_id")
  tokensUsed      Int      @map("tokens_used")
  cost            Decimal  @db.Decimal(10,4)
  requestType     String   @map("request_type") // 'chat', 'generation', 'analysis'
  metadata        Json?
  timestamp       DateTime @default(now())
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([timestamp])
  @@index([modelId])
  @@map("token_usage_logs")
}

model Promotion {
  id              String           @id @default(cuid())
  name            String
  description     String
  type            PromotionType
  value           Decimal          @db.Decimal(10,2)
  code            String?          @unique
  isCodeRequired  Boolean          @default(true) @map("is_code_required")
  startDate       DateTime         @map("start_date")
  endDate         DateTime         @map("end_date")
  usageLimit      Int?             @map("usage_limit")
  usageCount      Int              @default(0) @map("usage_count")
  eligiblePlans   Json             @map("eligible_plans") // Array of plan IDs
  eligibleUsers   Json?            @map("eligible_users") // Array of user IDs
  isActive        Boolean          @default(true) @map("is_active")
  autoApply       Boolean          @default(false) @map("auto_apply")
  stackable       Boolean          @default(false)
  createdAt       DateTime         @default(now()) @map("created_at")
  updatedAt       DateTime         @updatedAt @map("updated_at")
  createdBy       String           @map("created_by") // Admin user ID
  usages          PromotionUsage[]

  @@index([code])
  @@index([isActive])
  @@index([startDate, endDate])
  @@map("promotions")
}

model PromotionUsage {
  id              String     @id @default(cuid())
  promotionId     String     @map("promotion_id")
  userId          String     @map("user_id")
  subscriptionId  String?    @map("subscription_id")
  paymentId       String?    @map("payment_id")
  discountAmount  Decimal    @db.Decimal(10,2) @map("discount_amount")
  appliedAt       DateTime   @default(now()) @map("applied_at")
  promotion       Promotion  @relation(fields: [promotionId], references: [id], onDelete: Cascade)
  user            User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  subscription    Subscription? @relation(fields: [subscriptionId], references: [id])
  payment         Payment?   @relation(fields: [paymentId], references: [id])

  @@index([promotionId])
  @@index([userId])
  @@index([appliedAt])
  @@map("promotion_usages")
}

model PricingContent {
  id              String   @id @default(cuid())
  planId          String   @unique @map("plan_id")
  heroTitle       String   @map("hero_title")
  heroSubtitle    String   @map("hero_subtitle")
  features        Json     // Array of ContentFeature objects
  benefits        Json     // Array of strings
  testimonials    Json     // Array of Testimonial objects
  faq             Json     // Array of FAQ objects
  callToAction    Json     @map("call_to_action") // CallToAction object
  comparisonTable Json?    @map("comparison_table") // ComparisonTableData object
  isDraft         Boolean  @default(true) @map("is_draft")
  publishedAt     DateTime? @map("published_at")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  updatedBy       String   @map("updated_by") // Admin user ID
  plan            SubscriptionPlan @relation(fields: [planId], references: [id], onDelete: Cascade)

  @@index([planId])
  @@index([isDraft])
  @@map("pricing_content")
}

model PricingHistory {
  id                String           @id @default(cuid())
  planId            String           @map("plan_id")
  oldMonthlyPrice   Decimal          @map("old_monthly_price") @db.Decimal(10,2)
  newMonthlyPrice   Decimal          @map("new_monthly_price") @db.Decimal(10,2)
  oldAnnualPrice    Decimal          @map("old_annual_price") @db.Decimal(10,2)
  newAnnualPrice    Decimal          @map("new_annual_price") @db.Decimal(10,2)
  changeReason      String           @map("change_reason")
  effectiveDate     DateTime         @map("effective_date")
  affectedUsers     Int              @map("affected_users")
  grandfatheredUsers Int             @map("grandfathered_users")
  createdAt         DateTime         @default(now()) @map("created_at")
  createdBy         String           @map("created_by") // Admin user ID
  plan              SubscriptionPlan @relation(fields: [planId], references: [id], onDelete: Cascade)

  @@index([planId])
  @@index([effectiveDate])
  @@map("pricing_history")
}

enum PromotionType {
  PERCENTAGE
  FIXED_AMOUNT
  FREE_TRIAL
  UPGRADE_DISCOUNT
}
```

### Extended Existing Models

```typescript
// Add relations to existing models

model User {
  // ... existing fields
  tokenAllocations   TokenAllocation[]
  tokenUsageLogs     TokenUsageLog[]
  promotionUsages    PromotionUsage[]
}

model SubscriptionPlan {
  // ... existing fields
  pricingContent     PricingContent?
  pricingHistory     PricingHistory[]
  promotionUsages    PromotionUsage[]
}

model Payment {
  // ... existing fields
  promotionUsages    PromotionUsage[]
}

model Subscription {
  // ... existing fields
  promotionUsages    PromotionUsage[]
}
```

## API Endpoints

### Token Management APIs

```typescript
// GET /api/admin/tokens - Get token overview and analytics
// GET /api/admin/tokens/users - Get user token data with pagination
// POST /api/admin/tokens/allocate - Allocate tokens to users
// PUT /api/admin/tokens/users/:userId - Update user token allocation
// GET /api/admin/tokens/usage - Get token usage analytics
// GET /api/admin/tokens/packages - Get available token packages
// POST /api/admin/tokens/packages - Create new token package
// PUT /api/admin/tokens/packages/:id - Update token package
// DELETE /api/admin/tokens/packages/:id - Delete token package
```

### Pricing Management APIs

```typescript
// GET /api/admin/pricing/plans - Get all subscription plans
// POST /api/admin/pricing/plans - Create new subscription plan
// PUT /api/admin/pricing/plans/:id - Update subscription plan
// DELETE /api/admin/pricing/plans/:id - Delete subscription plan
// GET /api/admin/pricing/history/:planId - Get pricing history for plan
// GET /api/admin/pricing/analytics - Get pricing analytics and metrics
// POST /api/admin/pricing/preview - Preview pricing changes impact
```

### Promotion Management APIs

```typescript
// GET /api/admin/promotions - Get all promotions with pagination
// POST /api/admin/promotions - Create new promotion
// PUT /api/admin/promotions/:id - Update promotion
// DELETE /api/admin/promotions/:id - Delete promotion
// POST /api/admin/promotions/codes/generate - Generate discount codes
// GET /api/admin/promotions/:id/usage - Get promotion usage analytics
// GET /api/admin/promotions/analytics - Get overall promotion analytics
// POST /api/admin/promotions/validate - Validate promotion code
```

### Content Management APIs

```typescript
// GET /api/admin/content/pricing/:planId - Get pricing content for plan
// PUT /api/admin/content/pricing/:planId - Update pricing content
// POST /api/admin/content/pricing/:planId/publish - Publish pricing content
// GET /api/admin/content/comparison - Get comparison table data
// PUT /api/admin/content/comparison - Update comparison table
// POST /api/admin/content/preview - Preview content changes
```

## User Interface Design

### 1. Navigation Integration

The new features will be added to the existing admin sidebar navigation:

```typescript
const newNavigationItems: NavigationItem[] = [
  // ... existing items
  {
    id: 'tokens',
    label: 'Token Management',
    icon: Coins,
    href: '/admin/tokens',
    badge: 'NEW'
  },
  {
    id: 'pricing',
    label: 'Pricing Plans',
    icon: CreditCard,
    href: '/admin/pricing'
  },
  {
    id: 'promotions',
    label: 'Promotions',
    icon: Tag,
    href: '/admin/promotions'
  },
  {
    id: 'content',
    label: 'Content Management',
    icon: FileText,
    href: '/admin/content'
  }
];
```

### 2. Page Layouts

Each new section follows the established AdminLayout pattern:

```typescript
// Example: Token Management Page
export default function TokenManagementPage() {
  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Token Management', icon: 'Coins' },
  ];

  return (
    <AdminLayout 
      title="Token Management" 
      breadcrumbs={breadcrumbs}
      actions={<TokenManagementActions />}
    >
      <TokenManagementContent />
    </AdminLayout>
  );
}
```

### 3. Theme Integration

All new components will use the existing theme system:

```typescript
// Components will use existing theme classes
const themeClasses = {
  card: 'bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700',
  button: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors',
  input: 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
  // ... other theme classes
};
```

## Security Considerations

### 1. Authentication and Authorization

- Uses existing AdminRoute component for access control
- Integrates with existing AdminAuthContext
- Maintains single admin model from existing system
- All actions logged through existing AuditLog system

### 2. Data Protection

- Sensitive pricing data encrypted at rest
- Promotion codes generated with cryptographically secure methods
- Token allocation changes require admin authentication
- All API endpoints protected with existing admin middleware

### 3. Input Validation

```typescript
// Example validation schemas using existing patterns
const pricingPlanSchema = z.object({
  name: z.string().min(1).max(50),
  displayName: z.string().min(1).max(100),
  monthlyPrice: z.number().min(0).max(999999),
  annualPrice: z.number().min(0).max(999999),
  features: z.array(planFeatureSchema),
  limits: planLimitsSchema,
  // ... other fields
});

const promotionSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['percentage', 'fixed_amount', 'free_trial', 'upgrade_discount']),
  value: z.number().min(0),
  startDate: z.date(),
  endDate: z.date(),
  // ... other fields
});
```

## Performance Optimization

### 1. Database Optimization

- Proper indexing on frequently queried fields
- Pagination for large datasets
- Efficient joins for related data
- Caching for frequently accessed pricing data

### 2. Frontend Optimization

- Lazy loading of heavy components
- Memoization of expensive calculations
- Virtual scrolling for large lists
- Optimistic updates for better UX

### 3. API Optimization

- Response caching for static data
- Batch operations for bulk updates
- Background processing for heavy operations
- Rate limiting to prevent abuse

## Error Handling

### 1. API Error Handling

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

enum ErrorCode {
  INVALID_TOKEN_ALLOCATION = 'INVALID_TOKEN_ALLOCATION',
  PRICING_PLAN_NOT_FOUND = 'PRICING_PLAN_NOT_FOUND',
  PROMOTION_EXPIRED = 'PROMOTION_EXPIRED',
  CONTENT_VALIDATION_FAILED = 'CONTENT_VALIDATION_FAILED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS'
}
```

### 2. Frontend Error Handling

- Toast notifications for user feedback
- Error boundaries for component failures
- Graceful degradation for network issues
- Retry mechanisms for failed operations

## Testing Strategy

### 1. Unit Testing

- Component testing with React Testing Library
- API endpoint testing with Jest
- Utility function testing
- Database model testing

### 2. Integration Testing

- Admin authentication flow testing
- Database integration testing
- Payment system integration testing
- End-to-end admin workflows

### 3. Security Testing

- Admin access control testing
- Input validation testing
- SQL injection prevention
- XSS protection testing

## Deployment Considerations

### 1. Database Migrations

```sql
-- Example migration for new tables
CREATE TABLE token_allocations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_amount INTEGER NOT NULL,
  allocated_by TEXT NOT NULL,
  reason TEXT,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_token_allocations_user_id ON token_allocations(user_id);
CREATE INDEX idx_token_allocations_expires_at ON token_allocations(expires_at);
CREATE INDEX idx_token_allocations_is_active ON token_allocations(is_active);
```

### 2. Environment Configuration

```typescript
// Additional environment variables needed
interface NewEnvConfig {
  // Token management
  DEFAULT_TOKEN_ALLOCATION: number;
  TOKEN_EXPIRY_DAYS: number;
  
  // Pricing
  PRICING_CHANGE_NOTIFICATION_EMAIL: string;
  
  // Promotions
  PROMOTION_CODE_LENGTH: number;
  MAX_PROMOTION_USAGE: number;
  
  // Content
  CONTENT_PREVIEW_URL: string;
}
```

### 3. Feature Flags

```typescript
// Feature flags for gradual rollout
interface FeatureFlags {
  enableTokenManagement: boolean;
  enableDynamicPricing: boolean;
  enablePromotions: boolean;
  enableContentManagement: boolean;
}
```

This design provides a comprehensive foundation for implementing the AI Token and Pricing Management System while maintaining full compatibility with the existing PineGenie admin infrastructure. The system extends current capabilities without disrupting existing functionality, ensuring a smooth integration and consistent user experience.