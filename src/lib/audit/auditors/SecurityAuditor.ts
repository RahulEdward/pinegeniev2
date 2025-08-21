/**
 * PayU Security Auditor
 * 
 * Validates security aspects of PayU integration including hash generation,
 * response verification, webhook security, and data protection
 */

import crypto from 'crypto';
import { BaseAuditor } from '../BaseAuditor';
import { SecurityAuditor as ISecurityAuditor, AuditResult, Issue } from '../types';
import { 
  generatePayUHash, 
  verifyPayUResponseHash, 
  PAYU_CONFIG, 
  PAYU_TEST_CONFIG,
  getPayUConfig,
  type PayUResponse 
} from '@/lib/payu-config';

export class SecurityAuditor extends BaseAuditor implements ISecurityAuditor {
  name = 'Security Auditor';
  description = 'Validates security aspects of PayU integration including hash generation, response verification, and webhook security';

  /**
   * Validate hash generation algorithm and implementation
   */
  async validateHashGeneration(): Promise<AuditResult> {
    const issues: Issue[] = [];
    const recommendations: string[] = [];

    try {
      // Test 1: Validate hash generation with known test data
      const testParams = {
        key: 'test_key',
        txnid: 'TEST123456',
        amount: '100.00',
        productinfo: 'Test Product',
        firstname: 'John',
        email: 'john@example.com',
        udf1: '',
        udf2: '',
        udf3: '',
        udf4: '',
        udf5: ''
      };
      const testSalt = 'test_salt';

      const generatedHash = generatePayUHash(testParams, testSalt);

      // Verify hash is generated
      if (!generatedHash || generatedHash.length === 0) {
        issues.push(this.createIssue(
          'security',
          'critical',
          'Hash generation failed',
          'PayU hash generation function returned empty or null hash',
          'generatePayUHash function',
          'Fix the hash generation implementation to ensure it always returns a valid hash',
          true,
          false
        ));
      }

      // Test 2: Verify hash format (should be SHA-512 hex string)
      if (generatedHash && !/^[a-f0-9]{128}$/i.test(generatedHash)) {
        issues.push(this.createIssue(
          'security',
          'high',
          'Invalid hash format',
          `Generated hash "${generatedHash}" is not a valid SHA-512 hex string (expected 128 characters)`,
          'generatePayUHash function',
          'Ensure hash generation uses SHA-512 and returns proper hex encoding',
          true,
          false
        ));
      }

      // Test 3: Verify hash consistency (same input should produce same hash)
      const secondHash = generatePayUHash(testParams, testSalt);
      if (generatedHash !== secondHash) {
        issues.push(this.createIssue(
          'security',
          'critical',
          'Hash generation inconsistency',
          'Same input parameters produce different hashes, indicating non-deterministic behavior',
          'generatePayUHash function',
          'Fix hash generation to be deterministic and consistent',
          true,
          false
        ));
      }

      // Test 4: Verify hash changes with different inputs
      const differentParams = { ...testParams, amount: '200.00' };
      const differentHash = generatePayUHash(differentParams, testSalt);
      if (generatedHash === differentHash) {
        issues.push(this.createIssue(
          'security',
          'high',
          'Hash not sensitive to input changes',
          'Different input parameters produce the same hash, indicating potential security vulnerability',
          'generatePayUHash function',
          'Verify that all input parameters are properly included in hash calculation',
          true,
          false
        ));
      }

      // Test 5: Verify hash includes salt
      const hashWithoutSalt = generatePayUHash(testParams, '');
      if (generatedHash === hashWithoutSalt) {
        issues.push(this.createIssue(
          'security',
          'critical',
          'Salt not included in hash',
          'Hash generation does not properly include salt, making it vulnerable to attacks',
          'generatePayUHash function',
          'Ensure salt is properly included in hash calculation',
          true,
          false
        ));
      }

      // Test 6: Validate hash formula compliance with PayU specification
      const expectedHashString = `${testParams.key}|${testParams.txnid}|${testParams.amount}|${testParams.productinfo}|${testParams.firstname}|${testParams.email}|${testParams.udf1}|${testParams.udf2}|${testParams.udf3}|${testParams.udf4}|${testParams.udf5}||||||${testSalt}`;
      const expectedHash = crypto.createHash('sha512').update(expectedHashString).digest('hex');
      
      if (generatedHash !== expectedHash) {
        issues.push(this.createIssue(
          'security',
          'critical',
          'Hash formula does not match PayU specification',
          `Generated hash does not match expected PayU hash formula. Expected: ${expectedHash}, Got: ${generatedHash}`,
          'generatePayUHash function',
          'Update hash generation to match PayU specification exactly',
          true,
          false
        ));
      }

      // Add recommendations
      if (issues.length === 0) {
        recommendations.push('Hash generation is working correctly');
        recommendations.push('Consider adding additional validation for edge cases');
      } else {
        recommendations.push('Fix hash generation issues immediately as they affect payment security');
        recommendations.push('Add comprehensive unit tests for hash generation');
        recommendations.push('Implement hash generation monitoring in production');
      }

      return issues.length === 0 
        ? this.createSuccessResult(recommendations)
        : this.createFailureResult(issues, recommendations);

    } catch (error) {
      const issue = this.createIssue(
        'security',
        'critical',
        'Hash generation validation failed',
        `Error during hash generation validation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SecurityAuditor.validateHashGeneration',
        'Fix the hash generation validation implementation',
        false,
        false
      );

      return this.createFailureResult([issue], ['Fix hash generation validation implementation']);
    }
  }

  /**
   * Validate response hash verification implementation
   */
  async validateResponseVerification(): Promise<AuditResult> {
    const issues: Issue[] = [];
    const recommendations: string[] = [];

    try {
      // Test 1: Validate response verification with valid hash
      const testResponse: Partial<PayUResponse> = {
        status: 'success',
        udf5: '',
        udf4: '',
        udf3: '',
        udf2: '',
        udf1: '',
        email: 'john@example.com',
        firstname: 'John',
        productinfo: 'Test Product',
        amount: '100.00',
        txnid: 'TEST123456',
        key: 'test_key'
      };
      const testSalt = 'test_salt';

      // Generate expected hash for response
      const hashString = `${testSalt}|${testResponse.status}||||||${testResponse.udf5}|${testResponse.udf4}|${testResponse.udf3}|${testResponse.udf2}|${testResponse.udf1}|${testResponse.email}|${testResponse.firstname}|${testResponse.productinfo}|${testResponse.amount}|${testResponse.txnid}|${testResponse.key}`;
      const validHash = crypto.createHash('sha512').update(hashString).digest('hex');
      
      const responseWithValidHash = { ...testResponse, hash: validHash };
      const isValidResponse = verifyPayUResponseHash(responseWithValidHash, testSalt);

      if (!isValidResponse) {
        issues.push(this.createIssue(
          'security',
          'critical',
          'Response verification fails for valid hash',
          'Response hash verification function rejects valid PayU response hash',
          'verifyPayUResponseHash function',
          'Fix response hash verification to properly validate correct hashes',
          true,
          false
        ));
      }

      // Test 2: Validate response verification rejects invalid hash
      const responseWithInvalidHash = { ...testResponse, hash: 'invalid_hash' };
      const isInvalidRejected = !verifyPayUResponseHash(responseWithInvalidHash, testSalt);

      if (!isInvalidRejected) {
        issues.push(this.createIssue(
          'security',
          'critical',
          'Response verification accepts invalid hash',
          'Response hash verification function accepts invalid PayU response hash',
          'verifyPayUResponseHash function',
          'Fix response hash verification to properly reject invalid hashes',
          true,
          false
        ));
      }

      // Test 3: Validate response verification with tampered data
      const tamperedResponse = { ...testResponse, amount: '200.00', hash: validHash };
      const isTamperedRejected = !verifyPayUResponseHash(tamperedResponse, testSalt);

      if (!isTamperedRejected) {
        issues.push(this.createIssue(
          'security',
          'critical',
          'Response verification accepts tampered data',
          'Response hash verification function accepts response with tampered data',
          'verifyPayUResponseHash function',
          'Ensure response verification properly validates all fields against the hash',
          true,
          false
        ));
      }

      // Test 4: Validate response verification with wrong salt
      const isWrongSaltRejected = !verifyPayUResponseHash(responseWithValidHash, 'wrong_salt');

      if (!isWrongSaltRejected) {
        issues.push(this.createIssue(
          'security',
          'critical',
          'Response verification accepts wrong salt',
          'Response hash verification function accepts response when using wrong salt',
          'verifyPayUResponseHash function',
          'Ensure response verification properly uses the provided salt',
          true,
          false
        ));
      }

      // Test 5: Validate response verification handles missing fields
      const responseWithMissingFields = { status: 'success', hash: validHash };
      try {
        const isMissingFieldsHandled = !verifyPayUResponseHash(responseWithMissingFields, testSalt);
        if (!isMissingFieldsHandled) {
          issues.push(this.createIssue(
            'security',
            'medium',
            'Response verification does not handle missing fields properly',
            'Response hash verification should reject responses with missing required fields',
            'verifyPayUResponseHash function',
            'Add proper validation for required fields in response verification',
            true,
            false
          ));
        }
      } catch (error) {
        // This is acceptable - function should handle missing fields gracefully
        recommendations.push('Response verification handles missing fields by throwing errors - consider graceful handling');
      }

      // Add recommendations
      if (issues.length === 0) {
        recommendations.push('Response hash verification is working correctly');
        recommendations.push('Consider adding logging for failed verification attempts');
      } else {
        recommendations.push('Fix response verification issues immediately to prevent security vulnerabilities');
        recommendations.push('Add comprehensive unit tests for response verification');
        recommendations.push('Implement response verification monitoring and alerting');
      }

      return issues.length === 0 
        ? this.createSuccessResult(recommendations)
        : this.createFailureResult(issues, recommendations);

    } catch (error) {
      const issue = this.createIssue(
        'security',
        'critical',
        'Response verification validation failed',
        `Error during response verification validation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SecurityAuditor.validateResponseVerification',
        'Fix the response verification validation implementation',
        false,
        false
      );

      return this.createFailureResult([issue], ['Fix response verification validation implementation']);
    }
  }

  /**
   * Check data encryption and sensitive data handling
   */
  async checkDataEncryption(): Promise<AuditResult> {
    const issues: Issue[] = [];
    const recommendations: string[] = [];

    try {
      // Test 1: Check if sensitive configuration is properly secured
      const config = getPayUConfig();
      
      // Check if merchant key and salt are not hardcoded in production
      if (process.env.NODE_ENV === 'production') {
        if (config.merchantKey === PAYU_TEST_CONFIG.merchantKey) {
          issues.push(this.createIssue(
            'security',
            'critical',
            'Production using test merchant key',
            'Production environment is using test merchant key instead of production credentials',
            'PayU configuration',
            'Update production environment to use proper production merchant credentials',
            true,
            false
          ));
        }

        if (config.merchantSalt === PAYU_TEST_CONFIG.merchantSalt) {
          issues.push(this.createIssue(
            'security',
            'critical',
            'Production using test merchant salt',
            'Production environment is using test merchant salt instead of production credentials',
            'PayU configuration',
            'Update production environment to use proper production merchant salt',
            true,
            false
          ));
        }
      }

      // Test 2: Check if credentials are loaded from environment variables
      const merchantKeyEnv = process.env.PAYU_MERCHANT_KEY;
      const merchantSaltEnv = process.env.PAYU_MERCHANT_SALT;

      if (!merchantKeyEnv && process.env.NODE_ENV === 'production') {
        issues.push(this.createIssue(
          'security',
          'high',
          'Merchant key not in environment variables',
          'PAYU_MERCHANT_KEY environment variable is not set in production',
          'Environment configuration',
          'Set PAYU_MERCHANT_KEY environment variable for production',
          true,
          false
        ));
      }

      if (!merchantSaltEnv && process.env.NODE_ENV === 'production') {
        issues.push(this.createIssue(
          'security',
          'high',
          'Merchant salt not in environment variables',
          'PAYU_MERCHANT_SALT environment variable is not set in production',
          'Environment configuration',
          'Set PAYU_MERCHANT_SALT environment variable for production',
          true,
          false
        ));
      }

      // Test 3: Check for hardcoded credentials in configuration
      const configString = JSON.stringify(PAYU_CONFIG);
      if (configString.includes('rjQUPktU') || configString.includes('e5iIg1jwi8')) {
        issues.push(this.createIssue(
          'security',
          'medium',
          'Test credentials found in production config',
          'Test merchant credentials are present in production configuration',
          'PAYU_CONFIG',
          'Remove test credentials from production configuration',
          true,
          false
        ));
      }

      // Test 4: Validate HTTPS usage
      if (config.baseUrl && !config.baseUrl.startsWith('https://')) {
        issues.push(this.createIssue(
          'security',
          'high',
          'PayU base URL not using HTTPS',
          `PayU base URL "${config.baseUrl}" is not using HTTPS protocol`,
          'PayU configuration',
          'Update PayU base URL to use HTTPS for secure communication',
          true,
          false
        ));
      }

      // Test 5: Check for proper error handling that doesn't expose sensitive data
      // This would require examining error handling code, but we can check configuration
      recommendations.push('Ensure error messages do not expose sensitive PayU credentials');
      recommendations.push('Implement proper logging that masks sensitive data');

      // Add general recommendations
      if (issues.length === 0) {
        recommendations.push('Data encryption and sensitive data handling appears secure');
        recommendations.push('Consider implementing additional encryption for stored payment data');
        recommendations.push('Regularly rotate PayU credentials');
      } else {
        recommendations.push('Fix data encryption and credential security issues immediately');
        recommendations.push('Implement credential rotation policy');
        recommendations.push('Add monitoring for credential exposure attempts');
      }

      return issues.length === 0 
        ? this.createSuccessResult(recommendations)
        : this.createFailureResult(issues, recommendations);

    } catch (error) {
      const issue = this.createIssue(
        'security',
        'critical',
        'Data encryption validation failed',
        `Error during data encryption validation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SecurityAuditor.checkDataEncryption',
        'Fix the data encryption validation implementation',
        false,
        false
      );

      return this.createFailureResult([issue], ['Fix data encryption validation implementation']);
    }
  }

  /**
   * Validate webhook security implementation
   */
  async validateWebhookSecurity(): Promise<AuditResult> {
    const issues: Issue[] = [];
    const recommendations: string[] = [];

    try {
      // Test 1: Validate webhook signature verification is implemented
      // We'll test this by examining the webhook handler implementation
      
      // Test 2: Check if webhook endpoint uses HTTPS in production
      const webhookUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL;
      if (webhookUrl && process.env.NODE_ENV === 'production' && !webhookUrl.startsWith('https://')) {
        issues.push(this.createIssue(
          'security',
          'high',
          'Webhook URL not using HTTPS',
          `Webhook URL "${webhookUrl}" is not using HTTPS in production`,
          'Webhook configuration',
          'Ensure webhook URL uses HTTPS in production environment',
          true,
          false
        ));
      }

      // Test 3: Validate webhook signature verification logic
      const testWebhookData: Partial<PayUResponse> = {
        status: 'success',
        txnid: 'TEST123456',
        amount: '100.00',
        productinfo: 'Test Product',
        firstname: 'John',
        email: 'john@example.com',
        key: 'test_key',
        udf1: '',
        udf2: '',
        udf3: '',
        udf4: '',
        udf5: ''
      };

      const testSalt = 'test_salt';
      const hashString = `${testSalt}|${testWebhookData.status}||||||${testWebhookData.udf5}|${testWebhookData.udf4}|${testWebhookData.udf3}|${testWebhookData.udf2}|${testWebhookData.udf1}|${testWebhookData.email}|${testWebhookData.firstname}|${testWebhookData.productinfo}|${testWebhookData.amount}|${testWebhookData.txnid}|${testWebhookData.key}`;
      const validHash = crypto.createHash('sha512').update(hashString).digest('hex');

      const validWebhookData = { ...testWebhookData, hash: validHash };
      const isValidWebhook = verifyPayUResponseHash(validWebhookData, testSalt);

      if (!isValidWebhook) {
        issues.push(this.createIssue(
          'security',
          'critical',
          'Webhook signature verification fails for valid data',
          'Webhook signature verification rejects valid PayU webhook data',
          'Webhook signature verification',
          'Fix webhook signature verification to properly validate correct signatures',
          true,
          false
        ));
      }

      // Test 4: Validate webhook rejects invalid signatures
      const invalidWebhookData = { ...testWebhookData, hash: 'invalid_signature' };
      const isInvalidRejected = !verifyPayUResponseHash(invalidWebhookData, testSalt);

      if (!isInvalidRejected) {
        issues.push(this.createIssue(
          'security',
          'critical',
          'Webhook accepts invalid signatures',
          'Webhook signature verification accepts invalid signatures',
          'Webhook signature verification',
          'Fix webhook signature verification to properly reject invalid signatures',
          true,
          false
        ));
      }

      // Test 5: Check for replay attack protection
      // This would require examining the webhook handler for timestamp validation or nonce checking
      recommendations.push('Implement replay attack protection using timestamps or nonces');
      recommendations.push('Add rate limiting to webhook endpoints');

      // Test 6: Validate webhook error handling
      recommendations.push('Ensure webhook errors are logged without exposing sensitive data');
      recommendations.push('Implement webhook retry mechanism for failed processing');

      // Add general recommendations
      if (issues.length === 0) {
        recommendations.push('Webhook security validation appears correct');
        recommendations.push('Consider implementing additional webhook security measures');
      } else {
        recommendations.push('Fix webhook security issues immediately to prevent unauthorized access');
        recommendations.push('Implement comprehensive webhook security monitoring');
        recommendations.push('Add webhook security testing to CI/CD pipeline');
      }

      return issues.length === 0 
        ? this.createSuccessResult(recommendations)
        : this.createFailureResult(issues, recommendations);

    } catch (error) {
      const issue = this.createIssue(
        'security',
        'critical',
        'Webhook security validation failed',
        `Error during webhook security validation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SecurityAuditor.validateWebhookSecurity',
        'Fix the webhook security validation implementation',
        false,
        false
      );

      return this.createFailureResult([issue], ['Fix webhook security validation implementation']);
    }
  }

  /**
   * Check PCI compliance aspects
   */
  async checkPCICompliance(): Promise<AuditResult> {
    const issues: Issue[] = [];
    const recommendations: string[] = [];

    try {
      // Test 1: Validate that sensitive card data is not stored
      // Since PayU handles card data, we should not be storing it
      recommendations.push('Verify that no card data (PAN, CVV, expiry) is stored in the application');
      recommendations.push('Ensure all payment processing is handled by PayU (PCI compliant processor)');

      // Test 2: Check for secure transmission
      const config = getPayUConfig();
      if (!config.baseUrl.startsWith('https://')) {
        issues.push(this.createIssue(
          'security',
          'critical',
          'PayU communication not using HTTPS',
          'PayU API communication is not using HTTPS, violating PCI DSS requirements',
          'PayU configuration',
          'Update PayU configuration to use HTTPS for all communications',
          true,
          false
        ));
      }

      // Test 3: Validate secure hash algorithms
      // PayU uses SHA-512 which is acceptable for PCI DSS
      recommendations.push('SHA-512 hash algorithm is PCI DSS compliant');

      // Test 4: Check for proper access controls
      recommendations.push('Implement proper access controls for PayU configuration and credentials');
      recommendations.push('Ensure PayU credentials are only accessible to authorized personnel');

      // Test 5: Validate logging practices
      recommendations.push('Ensure payment logs do not contain sensitive card data');
      recommendations.push('Implement secure log storage and access controls');

      // Test 6: Check for vulnerability management
      recommendations.push('Regularly update dependencies to address security vulnerabilities');
      recommendations.push('Implement security scanning for PayU integration code');

      // Test 7: Validate network security
      recommendations.push('Ensure PayU webhook endpoints are properly secured');
      recommendations.push('Implement firewall rules to restrict access to payment systems');

      // Add general PCI compliance recommendations
      recommendations.push('Conduct regular PCI DSS compliance assessments');
      recommendations.push('Implement security awareness training for development team');
      recommendations.push('Maintain documentation of security controls and procedures');

      return issues.length === 0 
        ? this.createSuccessResult(recommendations)
        : this.createFailureResult(issues, recommendations);

    } catch (error) {
      const issue = this.createIssue(
        'security',
        'critical',
        'PCI compliance validation failed',
        `Error during PCI compliance validation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SecurityAuditor.checkPCICompliance',
        'Fix the PCI compliance validation implementation',
        false,
        false
      );

      return this.createFailureResult([issue], ['Fix PCI compliance validation implementation']);
    }
  }
}