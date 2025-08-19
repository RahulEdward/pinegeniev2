// AI Token and Pricing Management Types

import { z } from 'zod';

// ============================================================================
// ENUMS (Declared first to avoid forward reference issues)
// ============================================================================

export enum PromotionType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_TRIAL = 'free_trial',
  UPGRADE_DISCOUNT = 'upgrade_discount'
}

export enum ErrorCode {
  INVALID_TOKEN_ALLOCATION = 'INVALID_TOKEN_ALLOCATION',
  PRICING_PLAN_NOT_FOUND = 'PRICING_PLAN_NOT_FOUND',
  PROMOTION_EXPIRED = 'PROMOTION_EXPIRED',
  CONTENT_VALIDATION_FAILED = 'CONTENT_VALIDATION_FAILED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS'
}

export enum RequestType {
  CHAT = 'chat',
  GENERATION = 'generation',
  ANALYSIS = 'analysis'
}

export enum TemplatesAccess {
  BASIC = 'basic',
  ALL = 'all'
}

export enum SupportLevel {
  BASIC = 'basic',
  PRIORITY = 'priority',
  DEDICATED = 'dedicated'
}

export enum AllocationType {
  ADD = 'add',
  SET = 'set',
  SUBTRACT = 'subtract'
}

export enum ContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published'
}

export enum PromotionStatus {
  ACTIVE = 'active',
  SCHEDULED = 'scheduled',
  EXPIRED = 'expired',
  INACTIVE = 'inactive'
}

// ============================================================================
// TOKEN MANAGEMENT TYPES
// ============================================================================

export interface TokenAllocation {
  id: string;
  userId: string;
  tokenAmount: number;
  allocatedBy: string;
  reason?: string;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface TokenUsageLog {
  id: string;
  userId: string;
  modelId?: string;
  tokensUsed: number;
  cost: number;
  requestType: RequestType;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface UserTokenData {
  userId: string;
  userName: string;
  email: string;
  currentTokens: number;
  monthlyAllocation: number;
  tokensUsed: number;
  subscriptionPlan: string;
  lastRefresh: Date;
  expiresAt?: Date;
}

export interface TokenUsageMetrics {
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

export interface TokenAllocationRequest {
  userId: string;
  tokenAmount: number;
  allocationType: AllocationType;
  expiryDate?: Date;
  reason: string;
  notifyUser: boolean;
}

// ============================================================================
// PRICING MANAGEMENT TYPES
// ============================================================================

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  icon?: string;
  highlight?: boolean;
}

export interface PlanLimits {
  strategiesPerMonth: number | 'unlimited';
  templatesAccess: TemplatesAccess;
  aiGenerations: number;
  aiChatAccess: boolean;
  scriptStorage: number | 'unlimited';
  exportFormats: string[];
  supportLevel: SupportLevel;
  customSignatures: boolean;
  apiAccess: boolean;
  whiteLabel: boolean;
  teamCollaboration: boolean;
  advancedIndicators: boolean;
  backtesting: boolean;
}

export interface PricingPlan {
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

export interface PricingHistory {
  id: string;
  planId: string;
  oldMonthlyPrice: number;
  newMonthlyPrice: number;
  oldAnnualPrice: number;
  newAnnualPrice: number;
  changeReason: string;
  effectiveDate: Date;
  affectedUsers: number;
  grandfatheredUsers: number;
  createdAt: Date;
  createdBy: string;
}

// ============================================================================
// PROMOTION MANAGEMENT TYPES
// ============================================================================

export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: PromotionType;
  value: number;
  code?: string;
  isCodeRequired: boolean;
  startDate: Date;
  endDate: Date;
  usageLimit?: number;
  usageCount: number;
  eligiblePlans: string[];
  eligibleUsers?: string[];
  isActive: boolean;
  autoApply: boolean;
  stackable: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface PromotionUsage {
  id: string;
  promotionId: string;
  userId: string;
  subscriptionId?: string;
  paymentId?: string;
  discountAmount: number;
  appliedAt: Date;
}

export interface PromotionAnalytics {
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

export interface DiscountCodeGenerator {
  prefix?: string;
  length: number;
  quantity: number;
  includeNumbers: boolean;
  includeLetters: boolean;
  excludeSimilar: boolean;
}

// ============================================================================
// CONTENT MANAGEMENT TYPES
// ============================================================================

export interface ContentFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  highlight: boolean;
  order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  content: string;
  avatar?: string;
  rating: number;
  featured: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isPublished: boolean;
}

export interface CallToAction {
  primaryText: string;
  secondaryText?: string;
  buttonText: string;
  buttonColor: string;
  urgencyText?: string;
  guaranteeText?: string;
}

export interface ComparisonColumn {
  id: string;
  planId: string;
  planName: string;
  isHighlighted: boolean;
  badge?: string;
}

export interface ComparisonRow {
  id: string;
  feature: string;
  category: string;
  values: Record<string, string | boolean>;
}

export interface ComparisonTableData {
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
}

export interface PricingPageContent {
  id: string;
  planId: string;
  heroTitle: string;
  heroSubtitle: string;
  features: ContentFeature[];
  benefits: string[];
  testimonials: Testimonial[];
  faq: FAQ[];
  callToAction: CallToAction;
  comparisonTable?: ComparisonTableData;
  isDraft: boolean;
  publishedAt?: Date;
  lastUpdated: Date;
  updatedBy: string;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const tokenAllocationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  tokenAmount: z.number().min(1, 'Token amount must be positive'),
  allocationType: z.nativeEnum(AllocationType),
  expiryDate: z.date().optional(),
  reason: z.string().min(1, 'Reason is required'),
  notifyUser: z.boolean().default(true),
});

export const planFeatureSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Feature name is required'),
  description: z.string().min(1, 'Feature description is required'),
  included: z.boolean(),
  icon: z.string().optional(),
  highlight: z.boolean().default(false),
});

export const planLimitsSchema = z.object({
  strategiesPerMonth: z.union([z.number().min(0), z.literal('unlimited')]),
  templatesAccess: z.nativeEnum(TemplatesAccess),
  aiGenerations: z.number().min(0),
  aiChatAccess: z.boolean(),
  scriptStorage: z.union([z.number().min(0), z.literal('unlimited')]),
  exportFormats: z.array(z.string()),
  supportLevel: z.nativeEnum(SupportLevel),
  customSignatures: z.boolean(),
  apiAccess: z.boolean(),
  whiteLabel: z.boolean(),
  teamCollaboration: z.boolean(),
  advancedIndicators: z.boolean(),
  backtesting: z.boolean(),
});

export const pricingPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required').max(50),
  displayName: z.string().min(1, 'Display name is required').max(100),
  description: z.string().min(1, 'Description is required'),
  monthlyPrice: z.number().min(0, 'Monthly price must be non-negative').max(999999),
  annualPrice: z.number().min(0, 'Annual price must be non-negative').max(999999),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  features: z.array(planFeatureSchema),
  limits: planLimitsSchema,
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  trialDays: z.number().min(0).max(365),
  payuPlanId: z.string().optional(),
});

export const promotionSchema = z.object({
  name: z.string().min(1, 'Promotion name is required').max(100),
  description: z.string().min(1, 'Description is required'),
  type: z.nativeEnum(PromotionType),
  value: z.number().min(0, 'Value must be non-negative'),
  code: z.string().optional(),
  isCodeRequired: z.boolean().default(true),
  startDate: z.date(),
  endDate: z.date(),
  usageLimit: z.number().min(1).optional(),
  eligiblePlans: z.array(z.string()),
  eligibleUsers: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  autoApply: z.boolean().default(false),
  stackable: z.boolean().default(false),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const contentFeatureSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Feature title is required'),
  description: z.string().min(1, 'Feature description is required'),
  icon: z.string().min(1, 'Icon is required'),
  highlight: z.boolean().default(false),
  order: z.number().min(0),
});

export const testimonialSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  company: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  avatar: z.string().optional(),
  rating: z.number().min(1).max(5),
  featured: z.boolean().default(false),
});

export const faqSchema = z.object({
  id: z.string(),
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
  category: z.string().min(1, 'Category is required'),
  order: z.number().min(0),
  isPublished: z.boolean().default(true),
});

export const callToActionSchema = z.object({
  primaryText: z.string().min(1, 'Primary text is required'),
  secondaryText: z.string().optional(),
  buttonText: z.string().min(1, 'Button text is required'),
  buttonColor: z.string().min(1, 'Button color is required'),
  urgencyText: z.string().optional(),
  guaranteeText: z.string().optional(),
});

export const pricingContentSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  heroTitle: z.string().min(1, 'Hero title is required'),
  heroSubtitle: z.string().min(1, 'Hero subtitle is required'),
  features: z.array(contentFeatureSchema),
  benefits: z.array(z.string().min(1)),
  testimonials: z.array(testimonialSchema),
  faq: z.array(faqSchema),
  callToAction: callToActionSchema,
  comparisonTable: z.object({
    columns: z.array(z.object({
      id: z.string(),
      planId: z.string(),
      planName: z.string(),
      isHighlighted: z.boolean(),
      badge: z.string().optional(),
    })),
    rows: z.array(z.object({
      id: z.string(),
      feature: z.string(),
      category: z.string(),
      values: z.record(z.union([z.string(), z.boolean()])),
    })),
  }).optional(),
  isDraft: z.boolean().default(true),
});

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface TokenManagementResponse {
  overview: TokenUsageMetrics;
  users: PaginatedResponse<UserTokenData>;
}

export interface PricingManagementResponse {
  plans: PricingPlan[];
  analytics: {
    totalRevenue: number;
    monthlyRecurringRevenue: number;
    averageRevenuePerUser: number;
    churnRate: number;
    conversionRate: number;
  };
}

export interface PromotionManagementResponse {
  promotions: PaginatedResponse<Promotion>;
  analytics: PromotionAnalytics;
}

export interface ContentManagementResponse {
  content: PricingPageContent[];
  publishedCount: number;
  draftCount: number;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export type TokenAllocationFormData = z.infer<typeof tokenAllocationSchema>;
export type PricingPlanFormData = z.infer<typeof pricingPlanSchema>;
export type PromotionFormData = z.infer<typeof promotionSchema>;
export type PricingContentFormData = z.infer<typeof pricingContentSchema>;

// ============================================================================
// FILTER AND SEARCH TYPES
// ============================================================================

export interface TokenFilters {
  search?: string;
  subscriptionPlan?: string;
  tokenRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'name' | 'tokens' | 'usage' | 'lastActivity';
  sortOrder?: 'asc' | 'desc';
}

export interface PricingFilters {
  search?: string;
  currency?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  isActive?: boolean;
  isPopular?: boolean;
  sortBy?: 'name' | 'price' | 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
}

export interface PromotionFilters {
  search?: string;
  type?: PromotionType;
  status?: PromotionStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'name' | 'created' | 'startDate' | 'usage';
  sortOrder?: 'asc' | 'desc';
}

export interface ContentFilters {
  search?: string;
  planId?: string;
  status?: ContentStatus;
  lastUpdated?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'plan' | 'updated' | 'published';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface TokenManagementTableProps {
  users: UserTokenData[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onUserAction: (action: string, userId: string) => void;
  filters: TokenFilters;
  onFiltersChange: (filters: TokenFilters) => void;
  loading?: boolean;
}

export interface PricingPlanEditorProps {
  plan?: PricingPlan;
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: PricingPlanFormData) => void;
  loading?: boolean;
}

export interface PromotionEditorProps {
  promotion?: Promotion;
  isOpen: boolean;
  onClose: () => void;
  onSave: (promotion: PromotionFormData) => void;
  availablePlans: PricingPlan[];
  loading?: boolean;
}

export interface ContentEditorProps {
  content?: PricingPageContent;
  plan: PricingPlan;
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: PricingContentFormData) => void;
  onPublish: (content: PricingContentFormData) => void;
  loading?: boolean;
}

export interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  maxLength?: number;
  toolbar?: Array<'bold' | 'italic' | 'underline' | 'link' | 'list' | 'heading' | 'color' | 'image'>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DateRange = {
  start: Date;
  end: Date;
};

export type SortOrder = 'asc' | 'desc';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingStates {
  tokens: LoadingState;
  pricing: LoadingState;
  promotions: LoadingState;
  content: LoadingState;
}

export interface ErrorStates {
  tokens?: string;
  pricing?: string;
  promotions?: string;
  content?: string;
}



// ============================================================================
// ADDITIONAL UTILITY TYPES
// ============================================================================

export type TokenPackage = {
  id: string;
  name: string;
  tokenCount: number;
  price: number;
  currency: string;
  validityDays: number;
  isActive: boolean;
};

export type BulkTokenAllocation = {
  userIds: string[];
  tokenAmount: number;
  allocationType: AllocationType;
  expiryDate?: Date;
  reason: string;
  notifyUsers: boolean;
};

export type PricingAnalytics = {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  churnRate: number;
  conversionRate: number;
  planPerformance: Array<{
    planId: string;
    planName: string;
    subscribers: number;
    revenue: number;
    conversionRate: number;
  }>;
};

export type TokenAnalytics = {
  totalAllocated: number;
  totalUsed: number;
  totalCost: number;
  averageCostPerToken: number;
  utilizationRate: number;
  topConsumers: Array<{
    userId: string;
    userName: string;
    tokensUsed: number;
    cost: number;
  }>;
  usageByModel: Record<string, {
    tokens: number;
    cost: number;
    requests: number;
  }>;
};

// Validation schemas for additional types
export const tokenPackageSchema = z.object({
  name: z.string().min(1, 'Package name is required').max(50),
  tokenCount: z.number().min(1, 'Token count must be positive'),
  price: z.number().min(0, 'Price must be non-negative'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  validityDays: z.number().min(1, 'Validity days must be positive'),
  isActive: z.boolean().default(true),
});

export const bulkTokenAllocationSchema = z.object({
  userIds: z.array(z.string().min(1)).min(1, 'At least one user must be selected'),
  tokenAmount: z.number().min(1, 'Token amount must be positive'),
  allocationType: z.nativeEnum(AllocationType),
  expiryDate: z.date().optional(),
  reason: z.string().min(1, 'Reason is required'),
  notifyUsers: z.boolean().default(true),
});

export const discountCodeGeneratorSchema = z.object({
  prefix: z.string().max(10).optional(),
  length: z.number().min(4).max(20),
  quantity: z.number().min(1).max(1000),
  includeNumbers: z.boolean().default(true),
  includeLetters: z.boolean().default(true),
  excludeSimilar: z.boolean().default(true),
});

// Form data types for additional schemas
export type TokenPackageFormData = z.infer<typeof tokenPackageSchema>;
export type BulkTokenAllocationFormData = z.infer<typeof bulkTokenAllocationSchema>;
export type DiscountCodeGeneratorFormData = z.infer<typeof discountCodeGeneratorSchema>;