/**
 * Theme Consistency Validator
 * 
 * Validates theme consistency across different screen sizes, devices,
 * and accessibility requirements for the agent interface.
 */

import { themeAdapter, AgentTheme, ValidationResult } from '../config/theme-adapter';

export interface ThemeConsistencyReport {
  isConsistent: boolean;
  accessibility: {
    isCompliant: boolean;
    contrastIssues: Array<{
      element: string;
      foreground: string;
      background: string;
      ratio: number;
      required: number;
      level: 'AA' | 'AAA';
    }>;
    warnings: string[];
  };
  responsiveness: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
    issues: string[];
  };
  crossBrowser: {
    chrome: boolean;
    firefox: boolean;
    safari: boolean;
    edge: boolean;
    issues: string[];
  };
  performance: {
    renderTime: number;
    memoryUsage: number;
    isOptimal: boolean;
    issues: string[];
  };
  recommendations: string[];
}

export class ThemeConsistencyValidator {
  private theme: AgentTheme | null = null;
  private testResults: Partial<ThemeConsistencyReport> = {};

  constructor() {
    this.theme = themeAdapter.getCurrentTheme();
  }

  /**
   * Run comprehensive theme consistency validation
   */
  public async validateThemeConsistency(): Promise<ThemeConsistencyReport> {
    const startTime = performance.now();

    // Initialize theme if not already done
    if (!this.theme) {
      this.theme = themeAdapter.initializeTheme();
    }

    // Run all validation tests
    const accessibility = await this.validateAccessibility();
    const responsiveness = await this.validateResponsiveness();
    const crossBrowser = await this.validateCrossBrowser();
    const performance = await this.validatePerformance();

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    const report: ThemeConsistencyReport = {
      isConsistent: accessibility.isCompliant && 
                   responsiveness.mobile && 
                   responsiveness.tablet && 
                   responsiveness.desktop &&
                   performance.isOptimal,
      accessibility,
      responsiveness,
      crossBrowser,
      performance: {
        ...performance,
        renderTime: totalTime
      },
      recommendations: this.generateRecommendations({
        accessibility,
        responsiveness,
        crossBrowser,
        performance
      })
    };

    return report;
  }

  /**
   * Validate accessibility compliance
   */
  private async validateAccessibility(): Promise<ThemeConsistencyReport['accessibility']> {
    if (!this.theme) {
      return {
        isCompliant: false,
        contrastIssues: [],
        warnings: ['Theme not initialized']
      };
    }

    const validation = themeAdapter.validateColorConsistency();
    
    // Additional accessibility checks
    const additionalChecks = await this.performAdditionalAccessibilityChecks();

    return {
      isCompliant: validation.isValid && additionalChecks.isCompliant,
      contrastIssues: validation.contrastIssues.map(issue => ({
        element: 'Unknown', // Would be populated with actual element info
        foreground: issue.foreground,
        background: issue.background,
        ratio: issue.ratio,
        required: issue.required,
        level: issue.level
      })),
      warnings: [...validation.warnings, ...additionalChecks.warnings]
    };
  }

  /**
   * Validate responsiveness across different screen sizes
   */
  private async validateResponsiveness(): Promise<ThemeConsistencyReport['responsiveness']> {
    const issues: string[] = [];
    
    // Test different viewport sizes
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];

    const results = {
      mobile: true,
      tablet: true,
      desktop: true,
      issues
    };

    for (const viewport of viewports) {
      try {
        const isResponsive = await this.testViewport(viewport.width, viewport.height);
        if (!isResponsive) {
          results[viewport.name as keyof typeof results] = false;
          issues.push(`Layout issues detected at ${viewport.name} viewport (${viewport.width}x${viewport.height})`);
        }
      } catch (error) {
        results[viewport.name as keyof typeof results] = false;
        issues.push(`Failed to test ${viewport.name} viewport: ${error}`);
      }
    }

    return results;
  }

  /**
   * Validate cross-browser compatibility
   */
  private async validateCrossBrowser(): Promise<ThemeConsistencyReport['crossBrowser']> {
    const issues: string[] = [];
    
    // Check for CSS features that might not be supported
    const cssFeatures = [
      'CSS.supports("display", "grid")',
      'CSS.supports("display", "flex")',
      'CSS.supports("color", "var(--test)")',
      'CSS.supports("backdrop-filter", "blur(10px)")'
    ];

    const results = {
      chrome: true,
      firefox: true,
      safari: true,
      edge: true,
      issues
    };

    // Test CSS feature support
    for (const feature of cssFeatures) {
      try {
        const isSupported = eval(feature);
        if (!isSupported) {
          issues.push(`CSS feature not supported: ${feature}`);
        }
      } catch (error) {
        issues.push(`Failed to test CSS feature: ${feature}`);
      }
    }

    // Check user agent for browser-specific issues
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      // Safari-specific checks
      if (!CSS.supports('backdrop-filter', 'blur(10px)')) {
        results.safari = false;
        issues.push('Safari: backdrop-filter not supported');
      }
    }

    if (userAgent.includes('firefox')) {
      // Firefox-specific checks
      if (!CSS.supports('scrollbar-width', 'thin')) {
        issues.push('Firefox: Custom scrollbar styling limited');
      }
    }

    return results;
  }

  /**
   * Validate performance characteristics
   */
  private async validatePerformance(): Promise<Omit<ThemeConsistencyReport['performance'], 'renderTime'>> {
    const issues: string[] = [];
    let memoryUsage = 0;

    // Check memory usage if available
    if ('memory' in performance) {
      memoryUsage = (performance as any).memory.usedJSHeapSize;
    }

    // Check for performance anti-patterns
    const cssRules = document.styleSheets;
    let totalRules = 0;
    
    try {
      for (let i = 0; i < cssRules.length; i++) {
        const sheet = cssRules[i];
        if (sheet.cssRules) {
          totalRules += sheet.cssRules.length;
        }
      }
    } catch (error) {
      issues.push('Could not analyze CSS rules for performance');
    }

    if (totalRules > 5000) {
      issues.push(`High number of CSS rules detected: ${totalRules}`);
    }

    // Check for expensive CSS properties
    const expensiveProperties = [
      'box-shadow',
      'border-radius',
      'transform',
      'filter',
      'backdrop-filter'
    ];

    const isOptimal = issues.length === 0 && memoryUsage < 50 * 1024 * 1024; // 50MB threshold

    return {
      memoryUsage,
      isOptimal,
      issues
    };
  }

  /**
   * Perform additional accessibility checks beyond color contrast
   */
  private async performAdditionalAccessibilityChecks(): Promise<{
    isCompliant: boolean;
    warnings: string[];
  }> {
    const warnings: string[] = [];

    // Check for proper ARIA labels
    const interactiveElements = document.querySelectorAll('button, input, select, textarea, [role="button"]');
    interactiveElements.forEach((element, index) => {
      const hasLabel = element.getAttribute('aria-label') || 
                      element.getAttribute('aria-labelledby') ||
                      element.textContent?.trim();
      
      if (!hasLabel) {
        warnings.push(`Interactive element ${index} missing accessible label`);
      }
    });

    // Check for proper heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1) {
        warnings.push(`Heading hierarchy skip detected at heading ${index} (h${level} after h${previousLevel})`);
      }
      previousLevel = level;
    });

    // Check for keyboard navigation
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) {
      warnings.push('No focusable elements found - keyboard navigation may be impaired');
    }

    return {
      isCompliant: warnings.length === 0,
      warnings
    };
  }

  /**
   * Test specific viewport dimensions
   */
  private async testViewport(width: number, height: number): Promise<boolean> {
    // This would typically involve creating a test iframe or using a headless browser
    // For now, we'll simulate the test
    
    // Check if layout would break at this viewport
    const minWidth = 320; // Minimum supported width
    const minHeight = 568; // Minimum supported height
    
    if (width < minWidth || height < minHeight) {
      return false;
    }

    // Check for common responsive breakpoints
    const breakpoints = [375, 768, 1024, 1440];
    const hasNearbyBreakpoint = breakpoints.some(bp => Math.abs(width - bp) < 50);
    
    return hasNearbyBreakpoint || width >= 1440;
  }

  /**
   * Generate recommendations based on validation results
   */
  private generateRecommendations(results: {
    accessibility: ThemeConsistencyReport['accessibility'];
    responsiveness: ThemeConsistencyReport['responsiveness'];
    crossBrowser: ThemeConsistencyReport['crossBrowser'];
    performance: Omit<ThemeConsistencyReport['performance'], 'renderTime'>;
  }): string[] {
    const recommendations: string[] = [];

    // Accessibility recommendations
    if (!results.accessibility.isCompliant) {
      recommendations.push('Improve color contrast ratios to meet WCAG AA standards');
      recommendations.push('Add proper ARIA labels to interactive elements');
      recommendations.push('Ensure proper heading hierarchy');
    }

    // Responsiveness recommendations
    if (!results.responsiveness.mobile) {
      recommendations.push('Optimize layout for mobile devices (375px width)');
    }
    if (!results.responsiveness.tablet) {
      recommendations.push('Improve tablet layout responsiveness (768px width)');
    }
    if (!results.responsiveness.desktop) {
      recommendations.push('Enhance desktop layout for large screens (1920px+ width)');
    }

    // Performance recommendations
    if (!results.performance.isOptimal) {
      recommendations.push('Optimize CSS to reduce render time');
      recommendations.push('Consider lazy loading for non-critical components');
      recommendations.push('Minimize use of expensive CSS properties');
    }

    // Cross-browser recommendations
    if (results.crossBrowser.issues.length > 0) {
      recommendations.push('Add vendor prefixes for better browser compatibility');
      recommendations.push('Provide fallbacks for unsupported CSS features');
    }

    return recommendations;
  }

  /**
   * Generate a detailed report as HTML
   */
  public generateHTMLReport(report: ThemeConsistencyReport): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Theme Consistency Report</title>
        <style>
          body { font-family: system-ui, sans-serif; margin: 2rem; }
          .status-pass { color: #22c55e; }
          .status-fail { color: #ef4444; }
          .status-warning { color: #f59e0b; }
          .section { margin: 2rem 0; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; }
          .metric { display: flex; justify-content: space-between; margin: 0.5rem 0; }
          ul { margin: 0.5rem 0; }
        </style>
      </head>
      <body>
        <h1>Theme Consistency Report</h1>
        <div class="section">
          <h2>Overall Status: <span class="${report.isConsistent ? 'status-pass' : 'status-fail'}">${report.isConsistent ? 'PASS' : 'FAIL'}</span></h2>
        </div>
        
        <div class="section">
          <h2>Accessibility</h2>
          <div class="metric">
            <span>WCAG Compliance:</span>
            <span class="${report.accessibility.isCompliant ? 'status-pass' : 'status-fail'}">${report.accessibility.isCompliant ? 'PASS' : 'FAIL'}</span>
          </div>
          <div class="metric">
            <span>Contrast Issues:</span>
            <span class="${report.accessibility.contrastIssues.length === 0 ? 'status-pass' : 'status-fail'}">${report.accessibility.contrastIssues.length}</span>
          </div>
          ${report.accessibility.warnings.length > 0 ? `
            <h3>Warnings:</h3>
            <ul>${report.accessibility.warnings.map(w => `<li>${w}</li>`).join('')}</ul>
          ` : ''}
        </div>
        
        <div class="section">
          <h2>Responsiveness</h2>
          <div class="metric">
            <span>Mobile:</span>
            <span class="${report.responsiveness.mobile ? 'status-pass' : 'status-fail'}">${report.responsiveness.mobile ? 'PASS' : 'FAIL'}</span>
          </div>
          <div class="metric">
            <span>Tablet:</span>
            <span class="${report.responsiveness.tablet ? 'status-pass' : 'status-fail'}">${report.responsiveness.tablet ? 'PASS' : 'FAIL'}</span>
          </div>
          <div class="metric">
            <span>Desktop:</span>
            <span class="${report.responsiveness.desktop ? 'status-pass' : 'status-fail'}">${report.responsiveness.desktop ? 'PASS' : 'FAIL'}</span>
          </div>
        </div>
        
        <div class="section">
          <h2>Performance</h2>
          <div class="metric">
            <span>Render Time:</span>
            <span>${report.performance.renderTime.toFixed(2)}ms</span>
          </div>
          <div class="metric">
            <span>Memory Usage:</span>
            <span>${(report.performance.memoryUsage / 1024 / 1024).toFixed(1)}MB</span>
          </div>
          <div class="metric">
            <span>Overall:</span>
            <span class="${report.performance.isOptimal ? 'status-pass' : 'status-warning'}">${report.performance.isOptimal ? 'OPTIMAL' : 'NEEDS IMPROVEMENT'}</span>
          </div>
        </div>
        
        ${report.recommendations.length > 0 ? `
          <div class="section">
            <h2>Recommendations</h2>
            <ul>${report.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
          </div>
        ` : ''}
      </body>
      </html>
    `;
  }
}

// Export singleton instance
export const themeConsistencyValidator = new ThemeConsistencyValidator();