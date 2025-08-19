/**
 * Pine Genie Signature System - Type Definitions
 * 
 * This file contains all TypeScript interfaces and types for the signature system.
 * These types define the structure for signature templates, user preferences,
 * generation context, and validation results.
 */

// Core Enums
export enum SignatureType {
  TEMPLATE = 'template',
  BUILDER = 'builder',
  AI_CHAT = 'ai-chat',
  CUSTOM = 'custom'
}

export enum SignaturePosition {
  TOP = 'top',
  BOTTOM = 'bottom',
  AFTER_VERSION = 'after-version'
}

export enum SignatureError {
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  VARIABLE_RESOLUTION_FAILED = 'VARIABLE_RESOLUTION_FAILED',
  INJECTION_FAILED = 'INJECTION_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  USER_PREFERENCES_ERROR = 'USER_PREFERENCES_ERROR'
}

// Core Interfaces
export interface GenerationContext {
  type: 'template' | 'builder' | 'ai-chat';
  userId?: string;
  strategyName?: string;
  templateId?: string;
  timestamp: Date;
  version: string;
  metadata?: Record<string, unknown>;
}

export interface SignatureVariable {
  name: string;
  type: 'string' | 'number' | 'datetime' | 'boolean';
  required: boolean;
  defaultValue?: unknown;
  description?: string;
}

export interface SignatureTemplate {
  id: string;
  name: string;
  type: SignatureType;
  template: string;
  variables: SignatureVariable[];
  position: SignaturePosition;
  enabled: boolean;
}

export interface SignaturePreferences {
  enabled: boolean;
  verbosityLevel: 'minimal' | 'standard' | 'detailed';
  customBranding?: string;
  includeTimestamp: boolean;
  includeMetadata: boolean;
  position: SignaturePosition;
}

export interface SignatureDefaults {
  enabled: boolean;
  defaultType: SignatureType;
  defaultPosition: SignaturePosition;
  defaultVerbosity: 'minimal' | 'standard' | 'detailed';
  brandingText: string;
  websiteUrl: string;
  version: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Service Interfaces
export interface SignatureService {
  addSignature(code: string, context: GenerationContext): Promise<string>;
  getSignatureTemplate(type: SignatureType): Promise<SignatureTemplate>;
  updateUserPreferences(userId: string, preferences: SignaturePreferences): Promise<void>;
  validateSignature(signature: string): ValidationResult;
}

export interface SignatureManager {
  generateSignature(context: GenerationContext): Promise<string>;
  injectSignature(code: string, signature: string, position: SignaturePosition): string;
  resolveVariables(template: string, context: GenerationContext): string;
}

export interface ConfigurationService {
  getSignatureTemplate(type: SignatureType): Promise<SignatureTemplate>;
  getUserPreferences(userId: string): Promise<SignaturePreferences>;
  updateSignatureTemplate(template: SignatureTemplate): Promise<void>;
  getSystemDefaults(): SignatureDefaults;
}

// Database Models (for Prisma integration)
export interface UserSignaturePreference {
  id: number;
  userId: number;
  enabled: boolean;
  verbosityLevel: string;
  customBranding?: string;
  includeTimestamp: boolean;
  includeMetadata: boolean;
  position: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignatureTemplateModel {
  id: number;
  name: string;
  type: string;
  template: string;
  variables: Record<string, unknown>; // JSONB field
  position: string;
  enabled: boolean;
  isSystem: boolean;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignatureUsageAnalytics {
  id: number;
  userId?: number;
  signatureType: string;
  templateId?: number;
  generationContext: Record<string, unknown>; // JSONB field
  createdAt: Date;
}