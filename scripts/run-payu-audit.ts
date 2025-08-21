#!/usr/bin/env tsx
/**
 * PayU Audit CLI Tool
 * 
 * Command-line interface for running PayU integration audits
 */

import { AuditRunner, AuditUtils } from '../src/lib/audit';

interface CLIOptions {
  environment?: 'development' | 'staging' | 'production';
  output?: 'console' | 'json' | 'html';
  outputPath?: string;
  verbose?: boolean;
  auditors?: string[];
  help?: boolean;
}

class PayUAuditCLI {
  private options: CLIOptions = {};

  constructor() {
    this.parseArguments();
  }

  /**
   * Parse command line arguments
   */
  private parseArguments(): void {
    const args = process.argv.slice(2);
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      switch (arg) {
        case '--help':
        case '-h':
          this.options.help = true;
          break;
        case '--environment':
        case '-e':
          this.options.environment = args[++i] as any;
          break;
        case '--output':
        case '-o':
          this.options.output = args[++i] as any;
          break;
        case '--output-path':
        case '-p':
          this.options.outputPath = args[++i];
          break;
        case '--verbose':
        case '-v':
          this.options.verbose = true;
          break;
        case '--auditors':
        case '-a':
          this.options.auditors = args[++i].split(',');
          break;
        case '--demo':
        case '-d':
          // Demo mode flag - handled in isDemoMode()
          break;
        default:
          if (arg.startsWith('--')) {
            console.warn(`Unknown option: ${arg}`);
          }
          break;
      }
    }
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.log(`
PayU Integration Audit Tool

Usage: npm run audit:payu [options]

Options:
  -h, --help                 Show this help message
  -e, --environment <env>    Set environment (development|staging|production)
  -o, --output <format>      Output format (console|json|html)
  -p, --output-path <path>   Output file path (for json/html formats)
  -v, --verbose              Enable verbose logging
  -a, --auditors <list>      Comma-separated list of auditors to run
  -d, --demo                 Run in demo mode (no database required)

Examples:
  npm run audit:payu                                    # Run all auditors with console output
  npm run audit:payu -e production -o json             # Run in production mode with JSON output
  npm run audit:payu -a ConfigurationAuditor,SecurityAuditor  # Run specific auditors only
  npm run audit:payu -v -o json -p audit-report.json   # Verbose mode with JSON file output

Available Auditors:
  - ConfigurationAuditor     # Validate PayU configuration and environment
  - SecurityAuditor          # Check hash generation and security practices
  - PaymentFlowAuditor       # Test payment flows end-to-end
  - DatabaseAuditor          # Validate database integration
  - ErrorHandlingAuditor     # Test error scenarios and logging
  - PerformanceAuditor       # Monitor performance characteristics
`);
  }

  /**
   * Check if running in demo mode
   */
  private isDemoMode(): boolean {
    return process.argv.includes('--demo') || process.argv.includes('-d');
  }

  /**
   * Validate CLI options
   */
  private validateOptions(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate environment
    if (this.options.environment && !['development', 'staging', 'production'].includes(this.options.environment)) {
      errors.push('Invalid environment. Must be one of: development, staging, production');
    }

    // Validate output format
    if (this.options.output && !['console', 'json', 'html'].includes(this.options.output)) {
      errors.push('Invalid output format. Must be one of: console, json, html');
    }

    // Validate output path for file formats
    if ((this.options.output === 'json' || this.options.output === 'html') && !this.options.outputPath) {
      console.warn('No output path specified. Will use default filename.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Run the audit
   */
  async run(): Promise<void> {
    // Show help if requested
    if (this.options.help) {
      this.showHelp();
      return;
    }

    // Validate options
    const validation = this.validateOptions();
    if (!validation.valid) {
      console.error('Invalid options:');
      validation.errors.forEach(error => console.error(`  - ${error}`));
      console.log('\nUse --help for usage information.');
      process.exit(1);
    }

    // Validate audit environment (skip in demo mode)
    if (!this.isDemoMode()) {
      const envValidation = AuditUtils.validateAuditEnvironment();
      if (!envValidation.valid) {
        console.error('Environment validation failed:');
        envValidation.issues.forEach(issue => console.error(`  - ${issue}`));
        console.log('\n💡 Tip: Use --demo flag to run without database connection');
        process.exit(1);
      }
    } else {
      console.log('🎭 Running in demo mode (no database required)');
    }

    console.log('🔍 Starting PayU Integration Audit...\n');

    try {
      // Create audit runner with options
      const runner = new AuditRunner({
        environment: this.options.environment || 'development',
        enabledAuditors: this.options.auditors || [],
        outputFormat: this.options.output || 'console',
        outputPath: this.options.outputPath,
        verbose: this.options.verbose || false,
        skipChecks: []
      });

      // Register available auditors
      await this.registerAuditors(runner);

      // Run the audit
      const report = await runner.runAudit();

      // Show summary
      this.showSummary(report);

      // Exit with appropriate code
      const exitCode = report.overallStatus === 'failed' ? 1 : 0;
      process.exit(exitCode);

    } catch (error) {
      console.error('❌ Audit failed with error:', error);
      process.exit(1);
    }
  }

  /**
   * Register available auditors
   */
  private async registerAuditors(runner: AuditRunner): Promise<void> {
    if (this.options.verbose) {
      console.log('Registering auditors...');
    }

    if (this.isDemoMode()) {
      // Register demo auditor for demonstration
      const { DemoAuditor } = await import('../src/lib/audit/auditors/DemoAuditor');
      const demoAuditor = new DemoAuditor();
      runner.registerAuditor(demoAuditor);
      
      if (this.options.verbose) {
        console.log('Registered: DemoAuditor (demonstration purposes)');
      }
    } else {
      // Register actual auditor implementations
      try {
        // Import and register Configuration Auditor
        const { ConfigurationAuditor } = await import('../src/lib/audit/auditors/ConfigurationAuditor');
        const configAuditor = new ConfigurationAuditor();
        runner.registerAuditor(configAuditor);
        
        if (this.options.verbose) {
          console.log('Registered: ConfigurationAuditor');
        }
      } catch (error) {
        if (this.options.verbose) {
          console.log('ConfigurationAuditor not available:', error instanceof Error ? error.message : 'Unknown error');
        }
      }

      // TODO: Register other auditors as they are implemented
      const pendingAuditors = [
        'SecurityAuditor', 
        'PaymentFlowAuditor',
        'DatabaseAuditor',
        'ErrorHandlingAuditor',
        'PerformanceAuditor'
      ];

      if (this.options.verbose) {
        console.log(`Pending auditors: ${pendingAuditors.join(', ')}`);
        console.log('These will be added in subsequent tasks.\n');
      }
    }
  }

  /**
   * Show audit summary
   */
  private showSummary(report: any): void {
    const statusIcon = report.overallStatus === 'passed' ? '✅' : 
                      report.overallStatus === 'warning' ? '⚠️' : '❌';
    
    console.log(`\n${statusIcon} Audit Summary:`);
    console.log(`Status: ${report.overallStatus.toUpperCase()}`);
    console.log(`Total Checks: ${report.summary.totalChecks}`);
    console.log(`Passed: ${report.summary.passedChecks}`);
    console.log(`Failed: ${report.summary.failedChecks}`);
    console.log(`Critical Issues: ${report.summary.criticalIssues}`);
    
    if (report.summary.recommendations.length > 0) {
      console.log('\n📋 Recommendations:');
      report.summary.recommendations.slice(0, 5).forEach((rec: string) => {
        console.log(`  • ${rec}`);
      });
      
      if (report.summary.recommendations.length > 5) {
        console.log(`  ... and ${report.summary.recommendations.length - 5} more`);
      }
    }
  }
}

// Run the CLI if this file is executed directly
if (require.main === module) {
  const cli = new PayUAuditCLI();
  cli.run().catch(error => {
    console.error('CLI execution failed:', error);
    process.exit(1);
  });
}

export { PayUAuditCLI };