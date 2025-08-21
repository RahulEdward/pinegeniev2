/**
 * PayU Audit Framework - Audit Runner
 * 
 * Main orchestrator that runs all auditors and generates comprehensive reports
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  PayUAuditReport, 
  AuditContext, 
  AuditRunnerConfig, 
  BaseAuditor,
  Environment,
  AuditStatus
} from './types';

export class AuditRunner {
  private auditors: Map<string, BaseAuditor> = new Map();
  private config: AuditRunnerConfig;

  constructor(config: Partial<AuditRunnerConfig> = {}) {
    this.config = {
      environment: 'development',
      enabledAuditors: [],
      skipChecks: [],
      outputFormat: 'console',
      verbose: false,
      ...config
    };
  }

  /**
   * Register an auditor with the runner
   */
  registerAuditor(auditor: BaseAuditor): void {
    this.auditors.set(auditor.name, auditor);
    
    if (this.config.verbose) {
      console.log(`Registered auditor: ${auditor.name}`);
    }
  }

  /**
   * Run all registered auditors and generate a comprehensive report
   */
  async runAudit(): Promise<PayUAuditReport> {
    const startTime = Date.now();
    const context = this.createAuditContext();
    
    if (this.config.verbose) {
      console.log(`Starting PayU integration audit...`);
      console.log(`Environment: ${context.environment}`);
      console.log(`Registered auditors: ${Array.from(this.auditors.keys()).join(', ')}`);
    }

    // Initialize report structure
    const report: PayUAuditReport = {
      id: uuidv4(),
      timestamp: context.timestamp,
      version: context.version,
      environment: context.environment,
      overallStatus: 'passed',
      sections: {
        configuration: { name: 'Configuration', status: 'skipped', checks: [], executionTime: 0 },
        security: { name: 'Security', status: 'skipped', checks: [], executionTime: 0 },
        paymentFlow: { name: 'Payment Flow', status: 'skipped', checks: [], executionTime: 0 },
        database: { name: 'Database', status: 'skipped', checks: [], executionTime: 0 },
        errorHandling: { name: 'Error Handling', status: 'skipped', checks: [], executionTime: 0 },
        performance: { name: 'Performance', status: 'skipped', checks: [], executionTime: 0 }
      },
      summary: {
        totalChecks: 0,
        passedChecks: 0,
        failedChecks: 0,
        criticalIssues: 0,
        recommendations: []
      }
    };

    // Run each auditor
    for (const [name, auditor] of this.auditors) {
      if (this.shouldSkipAuditor(name)) {
        if (this.config.verbose) {
          console.log(`Skipping auditor: ${name}`);
        }
        continue;
      }

      if (this.config.verbose) {
        console.log(`Running auditor: ${name}...`);
      }

      try {
        const section = await auditor.runAudit(context);
        
        // Map auditor results to report sections
        this.mapAuditorToSection(name, section, report);
        
        if (this.config.verbose) {
          console.log(`Completed auditor: ${name} (${section.status})`);
        }
      } catch (error) {
        console.error(`Error running auditor ${name}:`, error);
        
        // Create a failed section for the auditor
        const failedSection = {
          name,
          status: 'failed' as AuditStatus,
          checks: [{
            name: 'auditor_execution',
            description: `Execute ${name} auditor`,
            status: 'failed' as AuditStatus,
            result: {
              passed: false,
              issues: [{
                id: uuidv4(),
                type: 'functionality' as const,
                severity: 'critical' as const,
                title: `Auditor execution failed: ${name}`,
                description: error instanceof Error ? error.message : 'Unknown error',
                location: name,
                recommendation: 'Check auditor implementation and fix any errors',
                fixable: false,
                autoFixAvailable: false
              }],
              recommendations: ['Fix auditor implementation'],
              severity: 'critical' as const,
              executionTime: 0
            },
            executionTime: 0
          }],
          executionTime: 0
        };
        
        this.mapAuditorToSection(name, failedSection, report);
      }
    }

    // Calculate summary and overall status
    this.calculateSummary(report);
    
    const totalTime = Date.now() - startTime;
    
    if (this.config.verbose) {
      console.log(`Audit completed in ${totalTime}ms`);
      console.log(`Overall status: ${report.overallStatus}`);
      console.log(`Total checks: ${report.summary.totalChecks}`);
      console.log(`Passed: ${report.summary.passedChecks}`);
      console.log(`Failed: ${report.summary.failedChecks}`);
      console.log(`Critical issues: ${report.summary.criticalIssues}`);
    }

    // Output report based on configuration
    await this.outputReport(report);

    return report;
  }

  /**
   * Create audit context
   */
  private createAuditContext(): AuditContext {
    return {
      environment: this.config.environment,
      timestamp: new Date(),
      version: process.env.npm_package_version || '1.0.0',
      config: this.config
    };
  }

  /**
   * Check if an auditor should be skipped
   */
  private shouldSkipAuditor(auditorName: string): boolean {
    // If enabledAuditors is specified, only run those
    if (this.config.enabledAuditors.length > 0) {
      return !this.config.enabledAuditors.includes(auditorName);
    }
    
    // Otherwise, skip only explicitly disabled auditors
    return false;
  }

  /**
   * Map auditor results to appropriate report section
   */
  private mapAuditorToSection(auditorName: string, section: any, report: PayUAuditReport): void {
    const sectionMapping: Record<string, keyof PayUAuditReport['sections']> = {
      'ConfigurationAuditor': 'configuration',
      'SecurityAuditor': 'security',
      'PaymentFlowAuditor': 'paymentFlow',
      'DatabaseAuditor': 'database',
      'ErrorHandlingAuditor': 'errorHandling',
      'PerformanceAuditor': 'performance',
      'DemoAuditor': 'configuration' // Map demo auditor to configuration section
    };

    const sectionKey = sectionMapping[auditorName] || 'configuration';
    report.sections[sectionKey] = section;
  }

  /**
   * Calculate summary statistics and overall status
   */
  private calculateSummary(report: PayUAuditReport): void {
    let totalChecks = 0;
    let passedChecks = 0;
    let failedChecks = 0;
    let criticalIssues = 0;
    const allRecommendations: string[] = [];
    let hasFailures = false;
    let hasWarnings = false;

    // Iterate through all sections
    Object.values(report.sections).forEach(section => {
      section.checks.forEach(check => {
        totalChecks++;
        
        if (check.status === 'passed') {
          passedChecks++;
        } else if (check.status === 'failed') {
          failedChecks++;
          hasFailures = true;
        } else if (check.status === 'warning') {
          hasWarnings = true;
        }

        // Count critical issues
        criticalIssues += check.result.issues.filter(issue => issue.severity === 'critical').length;
        
        // Collect recommendations
        allRecommendations.push(...check.result.recommendations);
      });
    });

    // Determine overall status
    let overallStatus: AuditStatus = 'passed';
    if (hasFailures || criticalIssues > 0) {
      overallStatus = 'failed';
    } else if (hasWarnings) {
      overallStatus = 'warning';
    }

    // Update summary
    report.summary = {
      totalChecks,
      passedChecks,
      failedChecks,
      criticalIssues,
      recommendations: [...new Set(allRecommendations)] // Remove duplicates
    };

    report.overallStatus = overallStatus;
  }

  /**
   * Output report based on configuration
   */
  private async outputReport(report: PayUAuditReport): Promise<void> {
    switch (this.config.outputFormat) {
      case 'json':
        await this.outputJSON(report);
        break;
      case 'html':
        await this.outputHTML(report);
        break;
      case 'console':
      default:
        this.outputConsole(report);
        break;
    }
  }

  /**
   * Output report to console
   */
  private outputConsole(report: PayUAuditReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('PayU Integration Audit Report');
    console.log('='.repeat(60));
    console.log(`Status: ${report.overallStatus.toUpperCase()}`);
    console.log(`Environment: ${report.environment}`);
    console.log(`Timestamp: ${report.timestamp.toISOString()}`);
    console.log(`Total Checks: ${report.summary.totalChecks}`);
    console.log(`Passed: ${report.summary.passedChecks}`);
    console.log(`Failed: ${report.summary.failedChecks}`);
    console.log(`Critical Issues: ${report.summary.criticalIssues}`);
    
    // Output section details
    Object.entries(report.sections).forEach(([key, section]) => {
      if (section.checks.length > 0) {
        console.log(`\n${section.name} (${section.status}):`);
        section.checks.forEach(check => {
          const status = check.status === 'passed' ? '✓' : 
                        check.status === 'failed' ? '✗' : 
                        check.status === 'warning' ? '⚠' : '○';
          console.log(`  ${status} ${check.description}`);
          
          if (check.result.issues.length > 0) {
            check.result.issues.forEach(issue => {
              console.log(`    - ${issue.title} (${issue.severity})`);
            });
          }
        });
      }
    });

    if (report.summary.recommendations.length > 0) {
      console.log('\nRecommendations:');
      report.summary.recommendations.forEach(rec => {
        console.log(`  • ${rec}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
  }

  /**
   * Output report to JSON file
   */
  private async outputJSON(report: PayUAuditReport): Promise<void> {
    const fs = await import('fs/promises');
    const path = this.config.outputPath || `audit-report-${Date.now()}.json`;
    
    await fs.writeFile(path, JSON.stringify(report, null, 2));
    console.log(`Audit report saved to: ${path}`);
  }

  /**
   * Output report to HTML file
   */
  private async outputHTML(report: PayUAuditReport): Promise<void> {
    // TODO: Implement HTML report generation
    console.log('HTML output not yet implemented');
  }
}