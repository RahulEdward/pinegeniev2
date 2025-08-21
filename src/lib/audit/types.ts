/**
 * PayU Audit Framework - Core Types and Interfaces
 * 
 * Defines the foundational types and interfaces for the PayU integration audit system
 */

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AuditStatus = 'passed' | 'failed' | 'warning' | 'skipped';
export type IssueType = 'configuration' | 'security' | 'functionality' | 'performance' | 'data';
export type Environment = 'development' | 'staging' | 'production';

export interface Issue {
  id: string;
  type: IssueType;
  severity: AuditSeverity;
  title: string;
  description: string;
  location: string; // File path or component
  recommendation: string;
  fixable: boolean;
  autoFixAvailable: boolean;
  metadata?: Record<string, any>;
}

export interface AuditResult {
  passed: boolean;
  issues: Issue[];
  recommendations: string[];
  severity: AuditSeverity;
  executionTime: number;
  metadata?: Record<string, any>;
}

export interface AuditCheck {
  name: string;
  description: string;
  status: AuditStatus;
  result: AuditResult;
  executionTime: number;
}

export interface AuditSection {
  name: string;
  status: AuditStatus;
  checks: AuditCheck[];
  executionTime: number;
}

export interface PayUAuditReport {
  id: string;
  timestamp: Date;
  version: string;
  environment: Environment;
  overallStatus: AuditStatus;
  
  sections: {
    configuration: AuditSection;
    security: AuditSection;
    paymentFlow: AuditSection;
    database: AuditSection;
    errorHandling: AuditSection;
    performance: AuditSection;
  };
  
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    criticalIssues: number;
    recommendations: string[];
  };
}

export interface AuditContext {
  environment: Environment;
  timestamp: Date;
  version: string;
  config: Record<string, any>;
}

// Base auditor interface that all specific auditors implement
export interface BaseAuditor {
  name: string;
  description: string;
  runAudit(context: AuditContext): Promise<AuditSection>;
}

// Configuration auditor interface
export interface ConfigurationAuditor extends BaseAuditor {
  validateEnvironmentVariables(): Promise<AuditResult>;
  validatePayUCredentials(): Promise<AuditResult>;
  checkEnvironmentConsistency(): Promise<AuditResult>;
  validateURLConfiguration(): Promise<AuditResult>;
}

// Security auditor interface
export interface SecurityAuditor extends BaseAuditor {
  validateHashGeneration(): Promise<AuditResult>;
  validateResponseVerification(): Promise<AuditResult>;
  checkDataEncryption(): Promise<AuditResult>;
  validateWebhookSecurity(): Promise<AuditResult>;
  checkPCICompliance(): Promise<AuditResult>;
}

// Payment flow auditor interface
export interface PaymentFlowAuditor extends BaseAuditor {
  testPaymentInitiation(): Promise<AuditResult>;
  testPayURedirection(): Promise<AuditResult>;
  testSuccessFlow(): Promise<AuditResult>;
  testFailureFlow(): Promise<AuditResult>;
  testWebhookProcessing(): Promise<AuditResult>;
}

// Database auditor interface
export interface DatabaseAuditor extends BaseAuditor {
  validatePaymentModel(): Promise<AuditResult>;
  checkDataConsistency(): Promise<AuditResult>;
  testTransactionIntegrity(): Promise<AuditResult>;
  validateRelationships(): Promise<AuditResult>;
}

// Error handling auditor interface
export interface ErrorHandlingAuditor extends BaseAuditor {
  testPaymentErrors(): Promise<AuditResult>;
  testWebhookErrors(): Promise<AuditResult>;
  validateErrorLogging(): Promise<AuditResult>;
  testRecoveryMechanisms(): Promise<AuditResult>;
}

// Performance auditor interface
export interface PerformanceAuditor extends BaseAuditor {
  measurePaymentProcessingTime(): Promise<AuditResult>;
  testWebhookLatency(): Promise<AuditResult>;
  validateDatabasePerformance(): Promise<AuditResult>;
  checkMemoryUsage(): Promise<AuditResult>;
}

// Audit runner configuration
export interface AuditRunnerConfig {
  environment: Environment;
  enabledAuditors: string[];
  skipChecks: string[];
  outputFormat: 'json' | 'html' | 'console';
  outputPath?: string;
  verbose: boolean;
}