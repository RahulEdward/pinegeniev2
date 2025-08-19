// AI Token and Pricing Management Constants

// ============================================================================
// TOKEN MANAGEMENT CONSTANTS
// ============================================================================

export const TOKEN_CONSTANTS = {
  DEFAULT_ALLOCATION: 1000,
  MAX_ALLOCATION: 100000,
  MIN_ALLOCATION: 0,
  DEFAULT_EXPIRY_DAYS: 30,
  MAX_EXPIRY_DAYS: 365,
  COST_PER_1K_TOKENS: 0.002, // $0.002 per 1K tokens
} as const;

export const TOKEN_REQUEST_TYPES = {
  CHAT: 'chat',
  GENERATION: 'generation',
  ANALYSIS: 'analysis',
} as const;

export const TOKEN_ALLOCATION_TYPES = {
  ADD: 'add',
  SET: 'set',
  SUBTRACT: 'subtract',
} as const;

// ============================================================================
// PRICING MANAGEMENT CONSTANTS
// ============================================================================

export const PRICING_CONSTANTS = {
  MIN_PRICE: 0,
  MAX_PRICE: 999999,
  DEFAULT_CURRENCY: 'USD',
  MAX_TRIAL_DAYS: 365,
  MIN_TRIAL_DAYS: 0,
} as const;

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
] as const;

export const PLAN_FEATURES_CATEGORIES = {
  CORE: 'core',
  AI: 'ai',
  STORAGE: 'storage',
  SUPPORT: 'support',
  ADVANCED: 'advanced',
  INTEGRATIONS: 'integrations',
} as const;

export const SUPPORT_LEVELS = {
  BASIC: 'basic',
  PRIORITY: 'priority',
  DEDICATED: 'dedicated',
} as const;

// ============================================================================
// PROMOTION MANAGEMENT CONSTANTS
// ============================================================================

export const PROMOTION_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED_AMOUNT: 'fixed_amount',
  FREE_TRIAL: 'free_trial',
  UPGRADE_DISCOUNT: 'upgrade_discount',
} as const;

export const PROMOTION_CONSTANTS = {
  MAX_PERCENTAGE: 100,
  MIN_PERCENTAGE: 1,
  MAX_FIXED_AMOUNT: 10000,
  MIN_FIXED_AMOUNT: 1,
  DEFAULT_CODE_LENGTH: 8,
  MAX_CODE_LENGTH: 20,
  MIN_CODE_LENGTH: 4,
  MAX_USAGE_LIMIT: 10000,
  MIN_USAGE_LIMIT: 1,
} as const;

export const DISCOUNT_CODE_CHARACTERS = {
  NUMBERS: '0123456789',
  LETTERS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  SIMILAR_CHARS: '0O1IL', // Characters to exclude for clarity
} as const;

export const PROMOTION_STATUS = {
  ACTIVE: 'active',
  SCHEDULED: 'scheduled',
  EXPIRED: 'expired',
  INACTIVE: 'inactive',
} as const;

// ============================================================================
// CONTENT MANAGEMENT CONSTANTS
// ============================================================================

export const CONTENT_CONSTANTS = {
  MAX_HERO_TITLE_LENGTH: 100,
  MAX_HERO_SUBTITLE_LENGTH: 200,
  MAX_FEATURE_TITLE_LENGTH: 50,
  MAX_FEATURE_DESCRIPTION_LENGTH: 200,
  MAX_BENEFIT_LENGTH: 100,
  MAX_TESTIMONIAL_CONTENT_LENGTH: 500,
  MAX_FAQ_QUESTION_LENGTH: 200,
  MAX_FAQ_ANSWER_LENGTH: 1000,
  MAX_CTA_TEXT_LENGTH: 50,
} as const;

export const CONTENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const;

export const RICH_TEXT_TOOLBAR_OPTIONS = [
  'bold',
  'italic',
  'underline',
  'link',
  'list',
  'heading',
  'color',
  'image',
] as const;

// ============================================================================
// API CONSTANTS
// ============================================================================

export const API_ENDPOINTS = {
  // Token Management
  TOKENS: '/api/admin/tokens',
  TOKEN_USERS: '/api/admin/tokens/users',
  TOKEN_ALLOCATE: '/api/admin/tokens/allocate',
  TOKEN_USAGE: '/api/admin/tokens/usage',
  
  // Pricing Management
  PRICING_PLANS: '/api/admin/pricing/plans',
  PRICING_HISTORY: '/api/admin/pricing/history',
  PRICING_ANALYTICS: '/api/admin/pricing/analytics',
  PRICING_PREVIEW: '/api/admin/pricing/preview',
  
  // Promotion Management
  PROMOTIONS: '/api/admin/promotions',
  PROMOTION_CODES: '/api/admin/promotions/codes/generate',
  PROMOTION_USAGE: '/api/admin/promotions/usage',
  PROMOTION_ANALYTICS: '/api/admin/promotions/analytics',
  PROMOTION_VALIDATE: '/api/admin/promotions/validate',
  
  // Content Management
  CONTENT_PRICING: '/api/admin/content/pricing',
  CONTENT_COMPARISON: '/api/admin/content/comparison',
  CONTENT_PREVIEW: '/api/admin/content/preview',
} as const;

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// ============================================================================
// PAGINATION CONSTANTS
// ============================================================================

export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5,
  DEFAULT_PAGE: 1,
} as const;

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_URL: 'Please enter a valid URL',
  INVALID_DATE: 'Please enter a valid date',
  INVALID_NUMBER: 'Please enter a valid number',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must be no more than ${max} characters`,
  MIN_VALUE: (min: number) => `Must be at least ${min}`,
  MAX_VALUE: (max: number) => `Must be no more than ${max}`,
  INVALID_RANGE: 'End date must be after start date',
  DUPLICATE_CODE: 'This promotion code already exists',
  INVALID_PERCENTAGE: 'Percentage must be between 1 and 100',
  INVALID_CURRENCY: 'Please select a valid currency',
} as const;

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
  MODAL_ANIMATION_DURATION: 200,
  LOADING_SPINNER_DELAY: 500,
} as const;

export const THEME_COLORS = {
  PRIMARY: 'blue',
  SUCCESS: 'green',
  WARNING: 'yellow',
  DANGER: 'red',
  INFO: 'purple',
  NEUTRAL: 'gray',
} as const;

export const CHART_COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#F97316', // orange-500
] as const;

// ============================================================================
// DATE CONSTANTS
// ============================================================================

export const DATE_FORMATS = {
  SHORT: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  WITH_TIME: 'MMM dd, yyyy HH:mm',
  ISO: 'yyyy-MM-dd',
  TIME_ONLY: 'HH:mm',
} as const;

export const DATE_RANGES = {
  LAST_7_DAYS: 7,
  LAST_30_DAYS: 30,
  LAST_90_DAYS: 90,
  LAST_YEAR: 365,
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER: 'Server error. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.',
  
  // Token specific
  TOKEN_ALLOCATION_FAILED: 'Failed to allocate tokens. Please try again.',
  INSUFFICIENT_TOKENS: 'Insufficient tokens available.',
  TOKEN_EXPIRED: 'Token allocation has expired.',
  
  // Pricing specific
  PRICING_UPDATE_FAILED: 'Failed to update pricing. Please try again.',
  INVALID_PRICE: 'Invalid price value.',
  PLAN_NOT_FOUND: 'Subscription plan not found.',
  
  // Promotion specific
  PROMOTION_EXPIRED: 'This promotion has expired.',
  PROMOTION_LIMIT_REACHED: 'Promotion usage limit has been reached.',
  INVALID_PROMOTION_CODE: 'Invalid promotion code.',
  
  // Content specific
  CONTENT_SAVE_FAILED: 'Failed to save content. Please try again.',
  CONTENT_PUBLISH_FAILED: 'Failed to publish content. Please try again.',
  INVALID_CONTENT: 'Invalid content format.',
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  GENERIC: 'Operation completed successfully.',
  SAVED: 'Changes saved successfully.',
  CREATED: 'Created successfully.',
  UPDATED: 'Updated successfully.',
  DELETED: 'Deleted successfully.',
  
  // Token specific
  TOKENS_ALLOCATED: 'Tokens allocated successfully.',
  TOKEN_SETTINGS_UPDATED: 'Token settings updated successfully.',
  
  // Pricing specific
  PLAN_CREATED: 'Subscription plan created successfully.',
  PLAN_UPDATED: 'Subscription plan updated successfully.',
  PRICING_UPDATED: 'Pricing updated successfully.',
  
  // Promotion specific
  PROMOTION_CREATED: 'Promotion created successfully.',
  PROMOTION_UPDATED: 'Promotion updated successfully.',
  PROMOTION_ACTIVATED: 'Promotion activated successfully.',
  PROMOTION_DEACTIVATED: 'Promotion deactivated successfully.',
  
  // Content specific
  CONTENT_SAVED: 'Content saved successfully.',
  CONTENT_PUBLISHED: 'Content published successfully.',
  CONTENT_UPDATED: 'Content updated successfully.',
} as const;

// ============================================================================
// EXPORT ALL CONSTANTS
// ============================================================================

export const ADMIN_TOKEN_PRICING_CONSTANTS = {
  TOKEN_CONSTANTS,
  TOKEN_REQUEST_TYPES,
  TOKEN_ALLOCATION_TYPES,
  PRICING_CONSTANTS,
  SUPPORTED_CURRENCIES,
  PLAN_FEATURES_CATEGORIES,
  SUPPORT_LEVELS,
  PROMOTION_TYPES,
  PROMOTION_CONSTANTS,
  DISCOUNT_CODE_CHARACTERS,
  PROMOTION_STATUS,
  CONTENT_CONSTANTS,
  CONTENT_STATUS,
  RICH_TEXT_TOOLBAR_OPTIONS,
  API_ENDPOINTS,
  HTTP_METHODS,
  HTTP_STATUS,
  PAGINATION_CONSTANTS,
  VALIDATION_MESSAGES,
  UI_CONSTANTS,
  THEME_COLORS,
  CHART_COLORS,
  DATE_FORMATS,
  DATE_RANGES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} as const;