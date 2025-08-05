/**
 * Pine Genie Signature Service - Main Export
 * 
 * This file exports the main signature service components for easy importing
 * throughout the application.
 */

export { SignatureService } from './SignatureService';
export { SignatureManager } from './SignatureManager';
export { ConfigurationService } from './ConfigurationService';
export { SignatureErrorHandler } from './SignatureErrorHandler';
export { DEFAULT_TEMPLATES, DEFAULT_SIGNATURE_DEFAULTS } from './templates';

// Re-export types for convenience
export * from '../../types/signature';