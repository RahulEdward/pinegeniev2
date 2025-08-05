/**
 * PayU Money Configuration for Indian Market
 * 
 * This configuration is specifically for PayU Money (India)
 * which uses different API endpoints and parameters compared to PayU Latam
 */

import crypto from 'crypto';

export interface PayUConfig {
  merchantKey: string;
  merchantSalt: string;
  baseUrl: string;
  environment: 'test' | 'production';
  supportedCurrencies: string[];
  supportedCountries: string[];
}

export interface PayUPaymentRequest {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone?: string;
  surl: string; // success URL
  furl: string; // failure URL
  hash: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}

export interface PayUResponse {
  mihpayid: string;
  mode: string;
  status: string;
  unmappedstatus: string;
  key: string;
  txnid: string;
  amount: string;
  cardCategory: string;
  discount: string;
  net_amount_debit: string;
  addedon: string;
  productinfo: string;
  firstname: string;
  lastname: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  email: string;
  phone: string;
  udf1: string;
  udf2: string;
  udf3: string;
  udf4: string;
  udf5: string;
  field1: string;
  field2: string;
  field3: string;
  field4: string;
  field5: string;
  field6: string;
  field7: string;
  field8: string;
  field9: string;
  payment_source: string;
  PG_TYPE: string;
  bank_ref_num: string;
  bankcode: string;
  error: string;
  error_Message: string;
  name_on_card: string;
  cardnum: string;
  cardhash: string;
  hash: string;
}

// PayU Money Configuration
export const PAYU_CONFIG: PayUConfig = {
  merchantKey: process.env.PAYU_MERCHANT_KEY || 'nxK6O7',
  merchantSalt: process.env.PAYU_MERCHANT_SALT || 'G5jZkKgws87LzxkTRP0kdEPG4SzODiT9',
  baseUrl: process.env.PAYU_BASE_URL || 'https://secure.payu.in/_payment',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'test',
  supportedCurrencies: ['INR'], // PayU Money primarily supports INR
  supportedCountries: ['IN'] // India
};

// PayU Test Configuration (for development)
export const PAYU_TEST_CONFIG: PayUConfig = {
  merchantKey: 'rjQUPktU', // PayU test merchant key
  merchantSalt: 'e5iIg1jwi8', // PayU test salt
  baseUrl: 'https://test.payu.in/_payment',
  environment: 'test',
  supportedCurrencies: ['INR'],
  supportedCountries: ['IN']
};

/**
 * Generate PayU hash for payment request
 * Hash formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
 */
export function generatePayUHash(params: {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}, salt: string): string {
  const {
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1 = '',
    udf2 = '',
    udf3 = '',
    udf4 = '',
    udf5 = ''
  } = params;

  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
  
  return crypto.createHash('sha512').update(hashString).digest('hex');
}

/**
 * Verify PayU response hash
 * Reverse hash formula: sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export function verifyPayUResponseHash(response: Partial<PayUResponse>, salt: string): boolean {
  const {
    status,
    udf5 = '',
    udf4 = '',
    udf3 = '',
    udf2 = '',
    udf1 = '',
    email = '',
    firstname = '',
    productinfo = '',
    amount = '',
    txnid = '',
    key = '',
    hash = ''
  } = response;

  const hashString = `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');
  
  return calculatedHash === hash;
}

/**
 * Generate unique transaction ID
 */
export function generateTransactionId(prefix: string = 'PG'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${random}`.toUpperCase();
}

/**
 * Format amount for PayU (should be in paisa for INR)
 */
export function formatAmountForPayU(amount: number, currency: string = 'INR'): string {
  if (currency === 'INR') {
    // PayU expects amount in rupees, not paisa
    return amount.toFixed(2);
  }
  return amount.toFixed(2);
}

/**
 * PayU payment status mapping
 */
export const PAYU_STATUS_MAPPING = {
  success: 'APPROVED',
  failure: 'DECLINED',
  pending: 'PENDING',
  cancel: 'CANCELED',
  invalid: 'ERROR'
} as const;

/**
 * Get PayU configuration based on environment
 */
export function getPayUConfig(): PayUConfig {
  return process.env.NODE_ENV === 'production' ? PAYU_CONFIG : PAYU_TEST_CONFIG;
}

/**
 * Validate PayU configuration
 */
export function validatePayUConfig(config: PayUConfig): boolean {
  return !!(
    config.merchantKey &&
    config.merchantSalt &&
    config.baseUrl &&
    config.supportedCurrencies.length > 0
  );
}

/**
 * PayU error codes and messages
 */
export const PAYU_ERROR_CODES = {
  'E000': 'No Error',
  'E001': 'Unauthorized Payment Mode',
  'E002': 'Unauthorized Key',
  'E003': 'Unauthorized Txnid',
  'E004': 'Unauthorized Amount',
  'E005': 'Unauthorized Merchant',
  'E006': 'Unauthorized Return URL',
  'E007': 'Unauthorized Additional Charges',
  'E008': 'Unauthorized Payment Mode',
  'E009': 'Unauthorized Sub Merchant Id',
  'E010': 'Unauthorized Offer Key',
  'E011': 'Unauthorized Offer Type',
  'E012': 'Unauthorized Discount',
  'E013': 'Unauthorized Merchant Logo',
  'E014': 'Unauthorized Merchant Name',
  'E015': 'Unauthorized Drop Category',
  'E016': 'Unauthorized Enforce Payment',
  'E017': 'Unauthorized Custom Note',
  'E018': 'Unauthorized Note Category',
  'E019': 'Unauthorized Shipping Details',
  'E020': 'Unauthorized Billing Details'
} as const;

/**
 * Get error message for PayU error code
 */
export function getPayUErrorMessage(errorCode: string): string {
  return PAYU_ERROR_CODES[errorCode as keyof typeof PAYU_ERROR_CODES] || 'Unknown Error';
}