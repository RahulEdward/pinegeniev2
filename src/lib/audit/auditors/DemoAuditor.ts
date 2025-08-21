/**
 * Demo Auditor - For demonstration purposes
 * 
 * Shows how the audit framework works without requiring database or PayU configuration
 */

import { BaseAuditor } from '../BaseAuditor';
import { AuditResult } from '../types';

export class DemoAuditor extends BaseAuditor {
  name = 'DemoAuditor';
  description = 'Demonstration auditor showing framework capabilities';

  /**
   * Validate basic framework functionality
   */
  async validateFrameworkSetup(): Promise<AuditResult> {
    // Simulate checking if the audit framework is properly set up
    const hasTypes = typeof this.createSuccessResult === 'function';
    const hasUtils = typeof this.createIssue === 'function';
    
    if (hasTypes && hasUtils) {
      return this.createSuccessResult([
        'Audit framework is properly initialized',
        'All base utilities are available'
      ]);
    } else {
      const issue = this.createIssue(
        'functionality',
        'critical',
        'Framework setup incomplete',
        'The audit framework is not properly initialized',
        'DemoAuditor.validateFrameworkSetup',
        'Check framework installation and imports'
      );
      return this.createFailureResult([issue]);
    }
  }

  /**
   * Test different severity levels
   */
  async testSeverityLevels(): Promise<AuditResult> {
    // Create issues of different severities for demonstration
    const issues = [
      this.createIssue(
        'configuration',
        'low',
        'Minor configuration suggestion',
        'This is a low-severity demonstration issue',
        'DemoAuditor.testSeverityLevels',
        'This is just for demo purposes'
      ),
      this.createIssue(
        'security',
        'medium',
        'Medium security concern',
        'This is a medium-severity demonstration issue',
        'DemoAuditor.testSeverityLevels',
        'Address this medium-priority item'
      )
    ];

    return this.createFailureResult(issues, [
      'Review all security configurations',
      'Update configuration settings as needed'
    ]);
  }

  /**
   * Validate mock PayU responses
   */
  async validateMockResponses(): Promise<AuditResult> {
    try {
      // Import and test mock responses
      const { MockPayUResponses } = await import('../test-utils/MockPayUResponses');
      
      const successResponse = MockPayUResponses.createSuccessResponse();
      const failureResponse = MockPayUResponses.createFailureResponse();
      
      const hasRequiredFields = !!(
        successResponse.status &&
        successResponse.txnid &&
        successResponse.amount &&
        failureResponse.status
      );

      if (hasRequiredFields) {
        return this.createSuccessResult([
          'Mock PayU responses are working correctly',
          'All required fields are present in mock data',
          `Success response status: ${successResponse.status}`,
          `Failure response status: ${failureResponse.status}`
        ]);
      } else {
        const issue = this.createIssue(
          'functionality',
          'high',
          'Mock responses incomplete',
          'Mock PayU responses are missing required fields',
          'DemoAuditor.validateMockResponses',
          'Check MockPayUResponses implementation'
        );
        return this.createFailureResult([issue]);
      }
    } catch (error) {
      const issue = this.createIssue(
        'functionality',
        'critical',
        'Mock response system failed',
        `Error testing mock responses: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DemoAuditor.validateMockResponses',
        'Check mock response imports and implementation'
      );
      return this.createFailureResult([issue]);
    }
  }

  /**
   * Test execution time measurement
   */
  async measureExecutionTime(): Promise<AuditResult> {
    try {
      const startTime = Date.now();
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 50));
      const executionTime = Date.now() - startTime;

      if (executionTime > 0) {
        return this.createSuccessResult([
          `Execution time measurement working correctly`,
          `Measured time: ${executionTime}ms`,
          'Performance monitoring capabilities available'
        ]);
      } else {
        const issue = this.createIssue(
          'performance',
          'medium',
          'Execution time measurement failed',
          'Unable to properly measure execution time',
          'DemoAuditor.measureExecutionTime',
          'Check timing utilities implementation'
        );
        return this.createFailureResult([issue]);
      }
    } catch (error) {
      const issue = this.createIssue(
        'performance',
        'high',
        'Execution time measurement error',
        `Error during timing test: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DemoAuditor.measureExecutionTime',
        'Fix timing implementation'
      );
      return this.createFailureResult([issue]);
    }
  }

  /**
   * Check environment detection
   */
  async checkEnvironmentDetection(): Promise<AuditResult> {
    const nodeEnv = process.env.NODE_ENV || 'development';
    const hasNodeVersion = !!process.version;
    
    return this.createSuccessResult([
      `Environment detected: ${nodeEnv}`,
      `Node.js version: ${process.version}`,
      'Environment detection working correctly'
    ]);
  }

  /**
   * Test URL validation utility
   */
  async testURLValidation(): Promise<AuditResult> {
    const validUrls = [
      'https://example.com',
      'http://localhost:3000',
      'https://secure.payu.in/_payment'
    ];

    const invalidUrls = [
      'not-a-url',
      'ftp://invalid',
      ''
    ];

    const validResults = validUrls.map(url => this.validateURL(url));
    const invalidResults = invalidUrls.map(url => this.validateURL(url));

    const allValidPassed = validResults.every(result => result === true);
    const allInvalidFailed = invalidResults.every(result => result === false);

    if (allValidPassed && allInvalidFailed) {
      return this.createSuccessResult([
        'URL validation utility working correctly',
        `Validated ${validUrls.length} valid URLs`,
        `Rejected ${invalidUrls.length} invalid URLs`
      ]);
    } else {
      const issue = this.createIssue(
        'functionality',
        'medium',
        'URL validation not working correctly',
        'URL validation utility is not properly validating URLs',
        'DemoAuditor.testURLValidation',
        'Check URL validation implementation'
      );
      return this.createFailureResult([issue]);
    }
  }
}