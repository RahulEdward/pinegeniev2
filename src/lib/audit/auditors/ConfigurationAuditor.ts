/**
 * PayU Configuration Auditor
 * 
 * Validates PayU configuration and environment variables for proper setup
 */

import { BaseAuditor } from '../BaseAuditor';
import { ConfigurationAuditor as IConfigurationAuditor, AuditResult } from '../types';
import { getPayUConfig, validatePayUConfig } from '@/lib/payu-config';

export class ConfigurationAuditor extends BaseAuditor implements IConfigurationAuditor {
  name = 'ConfigurationAuditor';
  description = 'Validates PayU configuration and environment setup';

  /**
   * Validate all required environment variables are present
   */
  async validateEnvironmentVariables(): Promise<AuditResult> {
    const requiredEnvVars = [
      'PAYU_MERCHANT_KEY',
      'PAYU_MERCHANT_SALT',
      'NEXTAUTH_URL'
    ];

    const optionalEnvVars = [
      'PAYU_BASE_URL',
      'NODE_ENV'
    ];

    const issues = [];
    const recommendations = [];
    let criticalMissing = 0;

    // Check required environment variables
    for (const envVar of requiredEnvVars) {
      const check = this.checkEnvironmentVariable(envVar);

      if (!check.exists) {
        criticalMissing++;
        issues.push(this.createIssue(
          'configuration',
          'critical',
          `Missing required environment variable: ${envVar}`,
          `The environment variable ${envVar} is not set or is empty`,
          'ConfigurationAuditor.validateEnvironmentVariables',
          `Set the ${envVar} environment variable with appropriate value`
        ));
      }
    }

    // Check optional environment variables and provide recommendations
    for (const envVar of optionalEnvVars) {
      const check = this.checkEnvironmentVariable(envVar);

      if (!check.exists) {
        recommendations.push(`Consider setting ${envVar} for better configuration control`);
      }
    }

    // Validate environment variable formats
    const merchantKeyCheck = this.checkEnvironmentVariable('PAYU_MERCHANT_KEY');
    if (merchantKeyCheck.exists && merchantKeyCheck.value) {
      if (merchantKeyCheck.value.length < 6) {
        issues.push(this.createIssue(
          'configuration',
          'high',
          'PayU Merchant Key appears invalid',
          'The PAYU_MERCHANT_KEY is too short to be a valid merchant key',
          'ConfigurationAuditor.validateEnvironmentVariables',
          'Verify the PAYU_MERCHANT_KEY value with PayU documentation'
        ));
      }
    }

    const saltCheck = this.checkEnvironmentVariable('PAYU_MERCHANT_SALT');
    if (saltCheck.exists && saltCheck.value) {
      if (saltCheck.value.length < 8) {
        issues.push(this.createIssue(
          'configuration',
          'high',
          'PayU Merchant Salt appears invalid',
          'The PAYU_MERCHANT_SALT is too short to be a valid salt',
          'ConfigurationAuditor.validateEnvironmentVariables',
          'Verify the PAYU_MERCHANT_SALT value with PayU documentation'
        ));
      }
    }

    // Add general recommendations
    if (criticalMissing === 0) {
      recommendations.push('All required environment variables are present');
      recommendations.push('Consider using environment-specific .env files for different deployments');
    }

    if (issues.length === 0) {
      return this.createSuccessResult(recommendations);
    } else {
      return this.createFailureResult(issues, recommendations);
    }
  }

  /**
   * Validate PayU credentials format and basic structure
   */
  async validatePayUCredentials(): Promise<AuditResult> {
    const issues = [];
    const recommendations = [];

    try {
      const config = getPayUConfig();

      // Validate merchant key format
      if (!config.merchantKey) {
        issues.push(this.createIssue(
          'configuration',
          'critical',
          'PayU Merchant Key not configured',
          'No merchant key found in PayU configuration',
          'ConfigurationAuditor.validatePayUCredentials',
          'Configure PAYU_MERCHANT_KEY environment variable'
        ));
      } else {
        // Check merchant key format (should be alphanumeric)
        const merchantKeyRegex = /^[a-zA-Z0-9]+$/;
        if (!merchantKeyRegex.test(config.merchantKey)) {
          issues.push(this.createIssue(
            'configuration',
            'high',
            'PayU Merchant Key format invalid',
            'Merchant key contains invalid characters',
            'ConfigurationAuditor.validatePayUCredentials',
            'Ensure merchant key contains only alphanumeric characters'
          ));
        }

        // Check if using test credentials in production
        if (process.env.NODE_ENV === 'production' && config.merchantKey === 'rjQUPktU') {
          issues.push(this.createIssue(
            'configuration',
            'critical',
            'Test credentials used in production',
            'Production environment is using PayU test merchant key',
            'ConfigurationAuditor.validatePayUCredentials',
            'Replace test credentials with production PayU credentials'
          ));
        }
      }

      // Validate merchant salt
      if (!config.merchantSalt) {
        issues.push(this.createIssue(
          'configuration',
          'critical',
          'PayU Merchant Salt not configured',
          'No merchant salt found in PayU configuration',
          'ConfigurationAuditor.validatePayUCredentials',
          'Configure PAYU_MERCHANT_SALT environment variable'
        ));
      } else {
        // Check salt format (should be alphanumeric)
        const saltRegex = /^[a-zA-Z0-9]+$/;
        if (!saltRegex.test(config.merchantSalt)) {
          issues.push(this.createIssue(
            'configuration',
            'high',
            'PayU Merchant Salt format invalid',
            'Merchant salt contains invalid characters',
            'ConfigurationAuditor.validatePayUCredentials',
            'Ensure merchant salt contains only alphanumeric characters'
          ));
        }

        // Check if using test salt in production
        if (process.env.NODE_ENV === 'production' && config.merchantSalt === 'e5iIg1jwi8') {
          issues.push(this.createIssue(
            'configuration',
            'critical',
            'Test salt used in production',
            'Production environment is using PayU test merchant salt',
            'ConfigurationAuditor.validatePayUCredentials',
            'Replace test salt with production PayU salt'
          ));
        }
      }

      // Validate supported currencies
      if (!config.supportedCurrencies || config.supportedCurrencies.length === 0) {
        issues.push(this.createIssue(
          'configuration',
          'medium',
          'No supported currencies configured',
          'PayU configuration has no supported currencies',
          'ConfigurationAuditor.validatePayUCredentials',
          'Configure supported currencies (e.g., INR for India)'
        ));
      } else if (!config.supportedCurrencies.includes('INR')) {
        recommendations.push('Consider adding INR to supported currencies for Indian market');
      }

      if (issues.length === 0) {
        recommendations.push('PayU credentials are properly formatted');
        recommendations.push('Merchant key and salt validation passed');
      }

      return issues.length === 0
        ? this.createSuccessResult(recommendations)
        : this.createFailureResult(issues, recommendations);

    } catch (error) {
      const issue = this.createIssue(
        'configuration',
        'critical',
        'PayU configuration validation failed',
        `Error validating PayU credentials: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ConfigurationAuditor.validatePayUCredentials',
        'Check PayU configuration implementation and environment variables'
      );
      return this.createFailureResult([issue]);
    }
  }

  /**
   * Check environment consistency between development, staging, and production
   */
  async checkEnvironmentConsistency(): Promise<AuditResult> {
    const issues = [];
    const recommendations = [];
    const currentEnv = process.env.NODE_ENV || 'development';

    try {
      const config = getPayUConfig();

      // Check if configuration matches environment
      if (currentEnv === 'production') {
        // Production environment checks
        if (config.baseUrl.includes('test.payu.in')) {
          issues.push(this.createIssue(
            'configuration',
            'critical',
            'Test PayU URL used in production',
            'Production environment is configured to use PayU test endpoints',
            'ConfigurationAuditor.checkEnvironmentConsistency',
            'Update PAYU_BASE_URL to use production PayU endpoints (secure.payu.in)'
          ));
        }

        if (config.environment !== 'production') {
          issues.push(this.createIssue(
            'configuration',
            'high',
            'Environment mismatch in production',
            'PayU configuration environment does not match NODE_ENV',
            'ConfigurationAuditor.checkEnvironmentConsistency',
            'Ensure PayU configuration environment matches NODE_ENV'
          ));
        }
      } else if (currentEnv === 'development' || currentEnv === 'test') {
        // Development/test environment checks
        if (config.baseUrl.includes('secure.payu.in')) {
          recommendations.push('Development environment is using production PayU URLs - consider using test URLs');
        }

        if (config.environment === 'production') {
          recommendations.push('Development environment has production PayU configuration - consider using test configuration');
        }
      }

      // Check URL consistency
      const expectedUrls = {
        production: 'https://secure.payu.in/_payment',
        test: 'https://test.payu.in/_payment'
      };

      const expectedUrl = config.environment === 'production'
        ? expectedUrls.production
        : expectedUrls.test;

      if (config.baseUrl !== expectedUrl) {
        issues.push(this.createIssue(
          'configuration',
          'medium',
          'PayU URL inconsistency',
          `PayU base URL (${config.baseUrl}) doesn't match expected URL for ${config.environment} environment`,
          'ConfigurationAuditor.checkEnvironmentConsistency',
          `Update PAYU_BASE_URL to ${expectedUrl} for ${config.environment} environment`
        ));
      }

      // Check NEXTAUTH_URL consistency
      const nextAuthUrl = process.env.NEXTAUTH_URL;
      if (nextAuthUrl) {
        if (currentEnv === 'production' && nextAuthUrl.includes('localhost')) {
          issues.push(this.createIssue(
            'configuration',
            'high',
            'Localhost URL in production',
            'Production environment is using localhost in NEXTAUTH_URL',
            'ConfigurationAuditor.checkEnvironmentConsistency',
            'Update NEXTAUTH_URL to use production domain'
          ));
        }

        if (currentEnv === 'production' && nextAuthUrl.startsWith('http://')) {
          issues.push(this.createIssue(
            'configuration',
            'high',
            'HTTP URL in production',
            'Production environment is using HTTP instead of HTTPS',
            'ConfigurationAuditor.checkEnvironmentConsistency',
            'Update NEXTAUTH_URL to use HTTPS in production'
          ));
        }
      }

      if (issues.length === 0) {
        recommendations.push(`Environment consistency validated for ${currentEnv}`);
        recommendations.push('PayU configuration matches environment requirements');
      }

      return issues.length === 0
        ? this.createSuccessResult(recommendations)
        : this.createFailureResult(issues, recommendations);

    } catch (error) {
      const issue = this.createIssue(
        'configuration',
        'high',
        'Environment consistency check failed',
        `Error checking environment consistency: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ConfigurationAuditor.checkEnvironmentConsistency',
        'Review environment configuration and PayU setup'
      );
      return this.createFailureResult([issue]);
    }
  }

  /**
   * Validate URL configuration for PayU endpoints
   */
  async validateURLConfiguration(): Promise<AuditResult> {
    const issues = [];
    const recommendations = [];

    try {
      const config = getPayUConfig();

      // Validate base URL format
      if (!this.validateURL(config.baseUrl)) {
        issues.push(this.createIssue(
          'configuration',
          'critical',
          'Invalid PayU base URL',
          `PayU base URL is not a valid URL: ${config.baseUrl}`,
          'ConfigurationAuditor.validateURLConfiguration',
          'Configure a valid PayU base URL in PAYU_BASE_URL'
        ));
      } else {
        // Check if URL uses HTTPS
        if (!config.baseUrl.startsWith('https://')) {
          issues.push(this.createIssue(
            'configuration',
            'high',
            'PayU URL not using HTTPS',
            'PayU base URL should use HTTPS for security',
            'ConfigurationAuditor.validateURLConfiguration',
            'Update PayU base URL to use HTTPS'
          ));
        }

        // Check if URL is a known PayU endpoint
        const knownPayUDomains = ['secure.payu.in', 'test.payu.in'];
        const urlDomain = new URL(config.baseUrl).hostname;

        if (!knownPayUDomains.includes(urlDomain)) {
          issues.push(this.createIssue(
            'configuration',
            'medium',
            'Unknown PayU domain',
            `PayU URL uses unknown domain: ${urlDomain}`,
            'ConfigurationAuditor.validateURLConfiguration',
            'Verify PayU URL domain is correct (secure.payu.in or test.payu.in)'
          ));
        }

        // Check URL path
        if (!config.baseUrl.includes('/_payment')) {
          issues.push(this.createIssue(
            'configuration',
            'medium',
            'PayU URL missing payment path',
            'PayU URL should include /_payment path',
            'ConfigurationAuditor.validateURLConfiguration',
            'Add /_payment to the PayU base URL'
          ));
        }
      }

      // Validate callback URLs
      const nextAuthUrl = process.env.NEXTAUTH_URL;
      if (nextAuthUrl) {
        if (!this.validateURL(nextAuthUrl)) {
          issues.push(this.createIssue(
            'configuration',
            'high',
            'Invalid NEXTAUTH_URL',
            `NEXTAUTH_URL is not a valid URL: ${nextAuthUrl}`,
            'ConfigurationAuditor.validateURLConfiguration',
            'Configure a valid NEXTAUTH_URL'
          ));
        } else {
          // Construct expected callback URLs
          const successUrl = `${nextAuthUrl}/payment/success`;
          const failureUrl = `${nextAuthUrl}/payment/failure`;

          recommendations.push(`Success URL will be: ${successUrl}`);
          recommendations.push(`Failure URL will be: ${failureUrl}`);

          // Validate callback URL accessibility (basic check)
          if (nextAuthUrl.includes('localhost') && process.env.NODE_ENV === 'production') {
            issues.push(this.createIssue(
              'configuration',
              'critical',
              'Localhost callback in production',
              'PayU callbacks cannot reach localhost URLs in production',
              'ConfigurationAuditor.validateURLConfiguration',
              'Use a publicly accessible domain for production callbacks'
            ));
          }
        }
      }

      if (issues.length === 0) {
        recommendations.push('All PayU URLs are properly configured');
        recommendations.push('URL format validation passed');
      }

      return issues.length === 0
        ? this.createSuccessResult(recommendations)
        : this.createFailureResult(issues, recommendations);

    } catch (error) {
      const issue = this.createIssue(
        'configuration',
        'high',
        'URL configuration validation failed',
        `Error validating URL configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ConfigurationAuditor.validateURLConfiguration',
        'Review URL configuration and PayU setup'
      );
      return this.createFailureResult([issue]);
    }
  }

  /**
   * Additional validation: Check PayU configuration object validity
   */
  async validatePayUConfigObject(): Promise<AuditResult> {
    const issues = [];
    const recommendations = [];

    try {
      const config = getPayUConfig();
      const isValid = validatePayUConfig(config);

      if (!isValid) {
        issues.push(this.createIssue(
          'configuration',
          'critical',
          'PayU configuration object invalid',
          'PayU configuration object failed validation',
          'ConfigurationAuditor.validatePayUConfigObject',
          'Check PayU configuration implementation and required fields'
        ));
      } else {
        recommendations.push('PayU configuration object is valid');
        recommendations.push(`Environment: ${config.environment}`);
        recommendations.push(`Supported currencies: ${config.supportedCurrencies.join(', ')}`);
        recommendations.push(`Supported countries: ${config.supportedCountries.join(', ')}`);
      }

      return issues.length === 0
        ? this.createSuccessResult(recommendations)
        : this.createFailureResult(issues, recommendations);

    } catch (error) {
      const issue = this.createIssue(
        'configuration',
        'critical',
        'PayU configuration object check failed',
        `Error checking PayU configuration object: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ConfigurationAuditor.validatePayUConfigObject',
        'Review PayU configuration implementation'
      );
      return this.createFailureResult([issue]);
    }
  }
}