# PayU Integration Audit Framework

A comprehensive audit framework for validating and monitoring PayU payment integration in the PineGenie application.

## Overview

The PayU Audit Framework provides systematic validation of all aspects of the PayU payment integration, including:

- **Configuration Validation** - Environment variables, credentials, and settings
- **Security Auditing** - Hash generation, signature validation, and data protection
- **Payment Flow Testing** - End-to-end payment scenarios and edge cases
- **Database Integration** - Data consistency and relationship validation
- **Error Handling** - Error scenarios and recovery mechanisms
- **Performance Monitoring** - Response times and system performance

## Quick Start

### Running Audits

```bash
# Run all audits with console output
npm run audit:payu

# Run with verbose logging
npm run audit:payu:verbose

# Generate JSON report
npm run audit:payu:json

# Run specific auditors only
npm run audit:payu -- --auditors ConfigurationAuditor,SecurityAuditor

# Run in production mode
npm run audit:payu -- --environment production
```

### CLI Options

```bash
Options:
  -h, --help                 Show help message
  -e, --environment <env>    Set environment (development|staging|production)
  -o, --output <format>      Output format (console|json|html)
  -p, --output-path <path>   Output file path (for json/html formats)
  -v, --verbose              Enable verbose logging
  -a, --auditors <list>      Comma-separated list of auditors to run
```

## Architecture

### Core Components

1. **BaseAuditor** - Abstract base class for all auditors
2. **AuditRunner** - Orchestrates audit execution and reporting
3. **Types** - TypeScript interfaces and type definitions
4. **Test Utilities** - Mock data and test database helpers

### Auditor Types

- **ConfigurationAuditor** - Validates PayU configuration and environment setup
- **SecurityAuditor** - Checks hash generation, validation, and security practices
- **PaymentFlowAuditor** - Tests complete payment flows end-to-end
- **DatabaseAuditor** - Validates database integration and data consistency
- **ErrorHandlingAuditor** - Tests error scenarios and logging mechanisms
- **PerformanceAuditor** - Monitors and tests performance characteristics

## Usage Examples

### Basic Audit

```typescript
import { AuditRunner, ConfigurationAuditor } from '@/lib/audit';

const runner = new AuditRunner({
  environment: 'development',
  outputFormat: 'console',
  verbose: true
});

const configAuditor = new ConfigurationAuditor();
runner.registerAuditor(configAuditor);

const report = await runner.runAudit();
console.log('Audit Status:', report.overallStatus);
```

### Custom Auditor

```typescript
import { BaseAuditor, AuditResult } from '@/lib/audit';

class CustomAuditor extends BaseAuditor {
  name = 'CustomAuditor';
  description = 'Custom validation logic';

  async validateCustomLogic(): Promise<AuditResult> {
    // Your validation logic here
    const isValid = await this.checkSomething();
    
    if (isValid) {
      return this.createSuccessResult(['Custom validation passed']);
    } else {
      const issue = this.createIssue(
        'functionality',
        'high',
        'Custom validation failed',
        'Description of the issue',
        'CustomAuditor.validateCustomLogic',
        'Fix the custom logic'
      );
      return this.createFailureResult([issue]);
    }
  }
}
```

### Using Test Utilities

```typescript
import { MockPayUResponses, TestDatabase } from '@/lib/audit';

// Create mock PayU responses
const successResponse = MockPayUResponses.createSuccessResponse();
const failureResponse = MockPayUResponses.createFailureResponse();

// Set up test database
const testDb = new TestDatabase();
const testUser = await testDb.createTestUser();
const testPayment = await testDb.createTestPayment(testUser.id);

// Clean up after tests
await testDb.cleanupTestData();
```

## Report Structure

### Audit Report

```typescript
interface PayUAuditReport {
  id: string;
  timestamp: Date;
  version: string;
  environment: 'development' | 'staging' | 'production';
  overallStatus: 'passed' | 'failed' | 'warning';
  
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
```

### Issue Tracking

```typescript
interface Issue {
  id: string;
  type: 'configuration' | 'security' | 'functionality' | 'performance' | 'data';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  recommendation: string;
  fixable: boolean;
  autoFixAvailable: boolean;
}
```

## Testing

### Running Tests

```bash
# Run audit framework tests
npm run test:audit

# Run specific test file
npx jest src/lib/audit/__tests__/audit-framework.test.ts
```

### Test Structure

```typescript
describe('PayU Audit Framework', () => {
  describe('BaseAuditor', () => {
    it('should create successful audit results', async () => {
      // Test implementation
    });
  });

  describe('AuditRunner', () => {
    it('should run audit and generate report', async () => {
      // Test implementation
    });
  });
});
```

## Configuration

### Environment Variables

The audit framework requires the following environment variables:

```bash
# Database connection
DATABASE_URL="postgresql://..."

# PayU configuration (for validation)
PAYU_MERCHANT_KEY="your_merchant_key"
PAYU_MERCHANT_SALT="your_merchant_salt"
PAYU_BASE_URL="https://test.payu.in/_payment"

# Application settings
NODE_ENV="development"
NEXTAUTH_URL="http://localhost:3000"
```

### Audit Configuration

```typescript
interface AuditRunnerConfig {
  environment: 'development' | 'staging' | 'production';
  enabledAuditors: string[];
  skipChecks: string[];
  outputFormat: 'json' | 'html' | 'console';
  outputPath?: string;
  verbose: boolean;
}
```

## Best Practices

### Writing Auditors

1. **Extend BaseAuditor** - Always extend the BaseAuditor class
2. **Use Descriptive Names** - Method names should start with `validate`, `test`, `check`, or `measure`
3. **Handle Errors Gracefully** - Use try-catch blocks and return appropriate results
4. **Provide Clear Recommendations** - Include actionable recommendations for issues
5. **Use Appropriate Severity Levels** - Match severity to the actual impact

### Running Audits

1. **Regular Audits** - Run audits regularly, especially before deployments
2. **Environment-Specific** - Run audits in all environments (dev, staging, production)
3. **CI/CD Integration** - Include audits in your CI/CD pipeline
4. **Monitor Trends** - Track audit results over time to identify patterns
5. **Address Critical Issues** - Prioritize fixing critical and high-severity issues

### Security Considerations

1. **Protect Sensitive Data** - Don't log sensitive information in audit results
2. **Validate Inputs** - Always validate audit inputs and configurations
3. **Secure Storage** - Store audit reports securely if they contain sensitive information
4. **Access Control** - Limit access to audit results and configuration

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check DATABASE_URL environment variable
   - Verify database is accessible
   - Ensure Prisma client is properly configured

2. **PayU Configuration Errors**
   - Verify PAYU_MERCHANT_KEY and PAYU_MERCHANT_SALT
   - Check environment-specific URLs
   - Validate hash generation logic

3. **Test Failures**
   - Clean up test data between runs
   - Check for conflicting test data
   - Verify mock responses are properly configured

### Debug Mode

Enable verbose logging for detailed audit information:

```bash
npm run audit:payu -- --verbose
```

### Log Analysis

Audit logs include:
- Execution times for each check
- Detailed error messages
- Recommendations for fixes
- Performance metrics

## Contributing

### Adding New Auditors

1. Create a new class extending BaseAuditor
2. Implement required audit methods
3. Add tests for the new auditor
4. Register the auditor in the CLI tool
5. Update documentation

### Improving Existing Auditors

1. Add new validation methods
2. Improve error messages and recommendations
3. Add more test scenarios
4. Optimize performance

### Reporting Issues

When reporting issues:
1. Include audit report output
2. Specify environment and configuration
3. Provide steps to reproduce
4. Include relevant log messages

## License

This audit framework is part of the PineGenie application and follows the same license terms.