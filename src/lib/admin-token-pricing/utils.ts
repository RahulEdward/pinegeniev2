// AI Token and Pricing Management Utilities

import { 
  TokenUsageMetrics, 
  UserTokenData, 
  PricingPlan, 
  Promotion, 
  PromotionType,
  DateRange,
  DISCOUNT_CODE_CHARACTERS,
  PROMOTION_CONSTANTS,
  SUPPORTED_CURRENCIES,
  DATE_FORMATS,
} from '@/types/admin-token-pricing';
import { format, isAfter, isBefore, isWithinInterval, addDays, subDays } from 'date-fns';

// ============================================================================
// TOKEN MANAGEMENT UTILITIES
// ============================================================================

/**
 * Calculate token utilization rate
 */
export function calculateTokenUtilization(allocated: number, used: number): number {
  if (allocated === 0) return 0;
  return Math.round((used / allocated) * 100);
}

/**
 * Calculate token cost
 */
export function calculateTokenCost(tokens: number, costPer1k: number = 0.002): number {
  return (tokens / 1000) * costPer1k;
}

/**
 * Format token count with appropriate units
 */
export function formatTokenCount(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  } else if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
}

/**
 * Calculate token usage metrics
 */
export function calculateTokenMetrics(users: UserTokenData[]): TokenUsageMetrics {
  const totalAllocated = users.reduce((sum, user) => sum + user.monthlyAllocation, 0);
  const totalUsed = users.reduce((sum, user) => sum + user.tokensUsed, 0);
  const utilizationRate = calculateTokenUtilization(totalAllocated, totalUsed);
  
  const topUsers = users
    .sort((a, b) => b.tokensUsed - a.tokensUsed)
    .slice(0, 10);

  return {
    totalTokensAllocated: totalAllocated,
    totalTokensUsed: totalUsed,
    utilizationRate,
    costPerToken: 0.002,
    revenuePerToken: 0.005, // Example revenue per token
    topUsers,
    usageByModel: {}, // Would be populated from actual data
    usageByTimeframe: [], // Would be populated from actual data
  };
}

/**
 * Check if token allocation is expired
 */
export function isTokenAllocationExpired(expiresAt?: Date): boolean {
  if (!expiresAt) return false;
  return isAfter(new Date(), expiresAt);
}

/**
 * Get token allocation status
 */
export function getTokenAllocationStatus(
  currentTokens: number,
  monthlyAllocation: number,
  expiresAt?: Date
): 'active' | 'low' | 'expired' | 'depleted' {
  if (expiresAt && isTokenAllocationExpired(expiresAt)) {
    return 'expired';
  }
  
  if (currentTokens === 0) {
    return 'depleted';
  }
  
  const utilizationRate = calculateTokenUtilization(monthlyAllocation, monthlyAllocation - currentTokens);
  if (utilizationRate >= 80) {
    return 'low';
  }
  
  return 'active';
}

// ============================================================================
// PRICING MANAGEMENT UTILITIES
// ============================================================================

/**
 * Calculate annual discount percentage
 */
export function calculateAnnualDiscount(monthlyPrice: number, annualPrice: number): number {
  const monthlyTotal = monthlyPrice * 12;
  if (monthlyTotal === 0) return 0;
  return Math.round(((monthlyTotal - annualPrice) / monthlyTotal) * 100);
}

/**
 * Format price with currency
 */
export function formatPrice(amount: number, currency: string = 'USD'): string {
  const currencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === currency);
  const symbol = currencyInfo?.symbol || '$';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount).replace(/[A-Z]{3}/, symbol);
}

/**
 * Calculate price change impact
 */
export function calculatePriceChangeImpact(
  oldPrice: number,
  newPrice: number,
  subscriberCount: number
): {
  percentageChange: number;
  revenueImpact: number;
  direction: 'increase' | 'decrease' | 'no-change';
} {
  const percentageChange = oldPrice === 0 ? 0 : ((newPrice - oldPrice) / oldPrice) * 100;
  const revenueImpact = (newPrice - oldPrice) * subscriberCount;
  
  let direction: 'increase' | 'decrease' | 'no-change' = 'no-change';
  if (newPrice > oldPrice) direction = 'increase';
  else if (newPrice < oldPrice) direction = 'decrease';
  
  return {
    percentageChange: Math.round(percentageChange * 100) / 100,
    revenueImpact,
    direction,
  };
}

/**
 * Validate pricing plan data
 */
export function validatePricingPlan(plan: Partial<PricingPlan>): string[] {
  const errors: string[] = [];
  
  if (!plan.name || plan.name.trim().length === 0) {
    errors.push('Plan name is required');
  }
  
  if (!plan.displayName || plan.displayName.trim().length === 0) {
    errors.push('Display name is required');
  }
  
  if (typeof plan.monthlyPrice !== 'number' || plan.monthlyPrice < 0) {
    errors.push('Monthly price must be a non-negative number');
  }
  
  if (typeof plan.annualPrice !== 'number' || plan.annualPrice < 0) {
    errors.push('Annual price must be a non-negative number');
  }
  
  if (plan.monthlyPrice && plan.annualPrice && plan.annualPrice > plan.monthlyPrice * 12) {
    errors.push('Annual price should not exceed monthly price × 12');
  }
  
  return errors;
}

// ============================================================================
// PROMOTION MANAGEMENT UTILITIES
// ============================================================================

/**
 * Generate random discount code
 */
export function generateDiscountCode(
  length: number = 8,
  includeNumbers: boolean = true,
  includeLetters: boolean = true,
  excludeSimilar: boolean = true,
  prefix?: string
): string {
  let characters = '';
  
  if (includeNumbers) {
    characters += DISCOUNT_CODE_CHARACTERS.NUMBERS;
  }
  
  if (includeLetters) {
    characters += DISCOUNT_CODE_CHARACTERS.LETTERS;
  }
  
  if (excludeSimilar) {
    for (const char of DISCOUNT_CODE_CHARACTERS.SIMILAR_CHARS) {
      characters = characters.replace(new RegExp(char, 'g'), '');
    }
  }
  
  let code = '';
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return prefix ? `${prefix}${code}` : code;
}

/**
 * Generate multiple discount codes
 */
export function generateMultipleDiscountCodes(
  quantity: number,
  options: {
    length?: number;
    includeNumbers?: boolean;
    includeLetters?: boolean;
    excludeSimilar?: boolean;
    prefix?: string;
  } = {}
): string[] {
  const codes = new Set<string>();
  const maxAttempts = quantity * 10; // Prevent infinite loop
  let attempts = 0;
  
  while (codes.size < quantity && attempts < maxAttempts) {
    const code = generateDiscountCode(
      options.length,
      options.includeNumbers,
      options.includeLetters,
      options.excludeSimilar,
      options.prefix
    );
    codes.add(code);
    attempts++;
  }
  
  return Array.from(codes);
}

/**
 * Calculate discount amount
 */
export function calculateDiscountAmount(
  originalAmount: number,
  promotion: Pick<Promotion, 'type' | 'value'>
): number {
  switch (promotion.type) {
    case 'percentage':
      return (originalAmount * promotion.value) / 100;
    case 'fixed_amount':
      return Math.min(promotion.value, originalAmount);
    case 'free_trial':
      return 0; // Free trial doesn't reduce price, extends trial period
    case 'upgrade_discount':
      return (originalAmount * promotion.value) / 100;
    default:
      return 0;
  }
}

/**
 * Check if promotion is currently active
 */
export function isPromotionActive(promotion: Pick<Promotion, 'isActive' | 'startDate' | 'endDate'>): boolean {
  if (!promotion.isActive) return false;
  
  const now = new Date();
  return isWithinInterval(now, {
    start: promotion.startDate,
    end: promotion.endDate,
  });
}

/**
 * Get promotion status
 */
export function getPromotionStatus(
  promotion: Pick<Promotion, 'isActive' | 'startDate' | 'endDate' | 'usageLimit' | 'usageCount'>
): 'active' | 'scheduled' | 'expired' | 'inactive' | 'limit_reached' {
  if (!promotion.isActive) return 'inactive';
  
  const now = new Date();
  
  if (isBefore(now, promotion.startDate)) {
    return 'scheduled';
  }
  
  if (isAfter(now, promotion.endDate)) {
    return 'expired';
  }
  
  if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
    return 'limit_reached';
  }
  
  return 'active';
}

/**
 * Validate promotion data
 */
export function validatePromotion(promotion: Partial<Promotion>): string[] {
  const errors: string[] = [];
  
  if (!promotion.name || promotion.name.trim().length === 0) {
    errors.push('Promotion name is required');
  }
  
  if (!promotion.type) {
    errors.push('Promotion type is required');
  }
  
  if (typeof promotion.value !== 'number' || promotion.value < 0) {
    errors.push('Promotion value must be a non-negative number');
  }
  
  if (promotion.type === 'percentage' && promotion.value > 100) {
    errors.push('Percentage discount cannot exceed 100%');
  }
  
  if (!promotion.startDate) {
    errors.push('Start date is required');
  }
  
  if (!promotion.endDate) {
    errors.push('End date is required');
  }
  
  if (promotion.startDate && promotion.endDate && isAfter(promotion.startDate, promotion.endDate)) {
    errors.push('End date must be after start date');
  }
  
  return errors;
}

// ============================================================================
// CONTENT MANAGEMENT UTILITIES
// ============================================================================

/**
 * Sanitize HTML content
 */
export function sanitizeHtmlContent(content: string): string {
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

/**
 * Extract plain text from HTML
 */
export function extractPlainText(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Calculate reading time for content
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const plainText = extractPlainText(content);
  const wordCount = plainText.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Validate content length
 */
export function validateContentLength(content: string, maxLength: number): boolean {
  const plainText = extractPlainText(content);
  return plainText.length <= maxLength;
}

// ============================================================================
// DATE AND TIME UTILITIES
// ============================================================================

/**
 * Format date with specified format
 */
export function formatDate(date: Date, formatString: string = DATE_FORMATS.SHORT): string {
  return format(date, formatString);
}

/**
 * Get date range for common periods
 */
export function getDateRange(period: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'last_year'): DateRange {
  const end = new Date();
  let start: Date;
  
  switch (period) {
    case 'last_7_days':
      start = subDays(end, 7);
      break;
    case 'last_30_days':
      start = subDays(end, 30);
      break;
    case 'last_90_days':
      start = subDays(end, 90);
      break;
    case 'last_year':
      start = subDays(end, 365);
      break;
    default:
      start = subDays(end, 30);
  }
  
  return { start, end };
}

/**
 * Check if date is within range
 */
export function isDateInRange(date: Date, range: DateRange): boolean {
  return isWithinInterval(date, range);
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate currency code
 */
export function isValidCurrency(currency: string): boolean {
  return SUPPORTED_CURRENCIES.some(c => c.code === currency);
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Sort array by multiple keys
 */
export function sortBy<T>(array: T[], ...keys: (keyof T)[]): T[] {
  return array.sort((a, b) => {
    for (const key of keys) {
      if (a[key] < b[key]) return -1;
      if (a[key] > b[key]) return 1;
    }
    return 0;
  });
}

/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

// ============================================================================
// DEBOUNCE UTILITY
// ============================================================================

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// ============================================================================
// LOCAL STORAGE UTILITIES
// ============================================================================

/**
 * Safe localStorage operations
 */
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Silently fail if localStorage is not available
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail if localStorage is not available
    }
  },
};

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'An unexpected error occurred';
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof Error && (
    error.message.includes('fetch') ||
    error.message.includes('network') ||
    error.message.includes('NetworkError')
  );
}