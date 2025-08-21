/**
 * PayU Audit Framework - Base Auditor Class
 * 
 * Abstract base class that provides common functionality for all auditors
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  BaseAuditor as IBaseAuditor, 
  AuditResult, 
  AuditSection, 
  AuditCheck, 
  AuditContext, 
  Issue, 
  AuditSeverity,
  AuditStatus 
} from './types';

export abstract class BaseAuditor implements IBaseAuditor {
  abstract name: string;
  abstract description: string;

  /**
   * Run the complete audit for this auditor
   */
  async runAudit(context: AuditContext): Promise<AuditSection> {
    const startTime = Date.now();
    const checks: AuditCheck[] = [];
    
    try {
      // Get all audit methods from the implementing class
      const auditMethods = this.getAuditMethods();
      
      for (const methodName of auditMethods) {
        const checkStartTime = Date.now();
        
        try {
          const result = await (this as any)[methodName]();
          const executionTime = Date.now() - checkStartTime;
          
          checks.push({
            name: methodName,
            description: this.getMethodDescription(methodName),
            status: result.passed ? 'passed' : 'failed',
            result,
            executionTime
          });
        } catch (error) {
          const executionTime = Date.now() - checkStartTime;
          
          checks.push({
            name: methodName,
            description: this.getMethodDescription(methodName),
            status: 'failed',
            result: {
              passed: false,
              issues: [{
                id: uuidv4(),
                type: 'functionality',
                severity: 'high',
                title: `Audit check failed: ${methodName}`,
                description: error instanceof Error ? error.message : 'Unknown error',
                location: `${this.name}.${methodName}`,
                recommendation: 'Check the audit implementation and fix any errors',
                fixable: false,
                autoFixAvailable: false
              }],
              recommendations: ['Fix the audit implementation'],
              severity: 'high' as AuditSeverity,
              executionTime
            },
            executionTime
          });
        }
      }
      
      const executionTime = Date.now() - startTime;
      const overallStatus = this.calculateOverallStatus(checks);
      
      return {
        name: this.name,
        status: overallStatus,
        checks,
        executionTime
      };
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      return {
        name: this.name,
        status: 'failed',
        checks: [{
          name: 'audit_execution',
          description: 'Execute audit section',
          status: 'failed',
          result: {
            passed: false,
            issues: [{
              id: uuidv4(),
              type: 'functionality',
              severity: 'critical',
              title: `Audit section failed: ${this.name}`,
              description: error instanceof Error ? error.message : 'Unknown error',
              location: this.name,
              recommendation: 'Check the audit implementation and fix any critical errors',
              fixable: false,
              autoFixAvailable: false
            }],
            recommendations: ['Fix the audit implementation'],
            severity: 'critical',
            executionTime
          },
          executionTime
        }],
        executionTime
      };
    }
  }

  /**
   * Create a successful audit result
   */
  protected createSuccessResult(recommendations: string[] = [], metadata?: Record<string, any>): AuditResult {
    return {
      passed: true,
      issues: [],
      recommendations,
      severity: 'low',
      executionTime: 0,
      metadata
    };
  }

  /**
   * Create a failed audit result
   */
  protected createFailureResult(
    issues: Issue[], 
    recommendations: string[] = [], 
    metadata?: Record<string, any>
  ): AuditResult {
    const severity = this.calculateSeverity(issues);
    
    return {
      passed: false,
      issues,
      recommendations,
      severity,
      executionTime: 0,
      metadata
    };
  }

  /**
   * Create an issue object
   */
  protected createIssue(
    type: Issue['type'],
    severity: AuditSeverity,
    title: string,
    description: string,
    location: string,
    recommendation: string,
    fixable: boolean = false,
    autoFixAvailable: boolean = false,
    metadata?: Record<string, any>
  ): Issue {
    return {
      id: uuidv4(),
      type,
      severity,
      title,
      description,
      location,
      recommendation,
      fixable,
      autoFixAvailable,
      metadata
    };
  }

  /**
   * Get all audit methods from the implementing class
   */
  private getAuditMethods(): string[] {
    const prototype = Object.getPrototypeOf(this);
    const methods = Object.getOwnPropertyNames(prototype)
      .filter(name => {
        return name.startsWith('validate') || 
               name.startsWith('test') || 
               name.startsWith('check') ||
               name.startsWith('measure');
      })
      .filter(name => typeof (this as any)[name] === 'function')
      .filter(name => name !== 'validateEnvironmentVariables'); // Exclude base methods
    
    return methods;
  }

  /**
   * Get description for an audit method
   */
  private getMethodDescription(methodName: string): string {
    // Convert camelCase to readable description
    const readable = methodName
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .replace(/^./, str => str.toUpperCase());
    
    return readable;
  }

  /**
   * Calculate overall status from checks
   */
  private calculateOverallStatus(checks: AuditCheck[]): AuditStatus {
    if (checks.length === 0) return 'skipped';
    
    const hasFailures = checks.some(check => check.status === 'failed');
    const hasWarnings = checks.some(check => check.status === 'warning');
    
    if (hasFailures) return 'failed';
    if (hasWarnings) return 'warning';
    return 'passed';
  }

  /**
   * Calculate severity from issues
   */
  private calculateSeverity(issues: Issue[]): AuditSeverity {
    if (issues.length === 0) return 'low';
    
    const severities = issues.map(issue => issue.severity);
    
    if (severities.includes('critical')) return 'critical';
    if (severities.includes('high')) return 'high';
    if (severities.includes('medium')) return 'medium';
    return 'low';
  }

  /**
   * Utility method to check if environment variable exists
   */
  protected checkEnvironmentVariable(name: string): { exists: boolean; value?: string } {
    const value = process.env[name];
    return {
      exists: value !== undefined && value !== '',
      value
    };
  }

  /**
   * Utility method to validate URL format
   */
  protected validateURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Utility method to measure execution time
   */
  protected async measureExecutionTime<T>(fn: () => Promise<T>): Promise<{ result: T; executionTime: number }> {
    const startTime = Date.now();
    const result = await fn();
    const executionTime = Date.now() - startTime;
    
    return { result, executionTime };
  }
}