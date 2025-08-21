/**
 * PayU Audit Framework - Main Export
 * 
 * Central export point for the PayU audit framework
 */

// Core types and interfaces
export * from './types';

// Base auditor class
export { BaseAuditor } from './BaseAuditor';

// Audit runner
export { AuditRunner } from './AuditRunner';

// Test utilities
export { MockPayUResponses } from './test-utils/MockPayUResponses';
export { TestDatabase } from './test-utils/TestDatabase';

// Auditor implementations
export { ConfigurationAuditor } from './auditors/ConfigurationAuditor';

// Utility functions
export const AuditUtils = {
  /**
   * Generate a unique audit ID
   */
  generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  },

  /**
   * Format execution time for display
   */
  formatExecutionTime(milliseconds: number): string {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    } else if (milliseconds < 60000) {
      return `${(milliseconds / 1000).toFixed(2)}s`;
    } else {
      const minutes = Math.floor(milliseconds / 60000);
      const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
      return `${minutes}m ${seconds}s`;
    }
  },

  /**
   * Calculate percentage
   */
  calculatePercentage(part: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
  },

  /**
   * Get severity color for console output
   */
  getSeverityColor(severity: string): string {
    const colors = {
      low: '\x1b[32m',      // Green
      medium: '\x1b[33m',   // Yellow
      high: '\x1b[31m',     // Red
      critical: '\x1b[35m'  // Magenta
    };
    return colors[severity as keyof typeof colors] || '\x1b[0m';
  },

  /**
   * Reset console color
   */
  resetColor(): string {
    return '\x1b[0m';
  },

  /**
   * Validate environment for audit
   */
  validateAuditEnvironment(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
    if (majorVersion < 16) {
      issues.push(`Node.js version ${nodeVersion} is not supported. Please use Node.js 16 or higher.`);
    }

    // Check required environment variables for audit
    const requiredEnvVars = ['DATABASE_URL'];
    requiredEnvVars.forEach(envVar => {
      if (!process.env[envVar]) {
        issues.push(`Missing required environment variable: ${envVar}`);
      }
    });

    return {
      valid: issues.length === 0,
      issues
    };
  },

  /**
   * Create audit context with default values
   */
  createDefaultAuditContext(): import('./types').AuditContext {
    return {
      environment: (process.env.NODE_ENV as any) || 'development',
      timestamp: new Date(),
      version: process.env.npm_package_version || '1.0.0',
      config: {}
    };
  }
};