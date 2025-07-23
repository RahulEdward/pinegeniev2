/**
 * Theme Validation Utilities
 * 
 * Provides utilities for testing and validating theme consistency
 * and accessibility compliance.
 */

import { themeAdapter, AgentTheme, ValidationResult } from '../config/theme-adapter';

export interface ThemeTestResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  details: {
    colorExtraction: boolean;
    themeMapping: boolean;
    accessibilityCompliance: boolean;
    cssVariableApplication: boolean;
    themeChangeDetection: boolean;
  };
}

export interface AccessibilityReport {
  overallScore: number;
  issues: Array<{
    severity: 'error' | 'warning' | 'info';
    component: string;
    description: string;
    suggestion: string;
    contrastRatio?: number;
    requiredRatio?: number;
  }>;
  recommendations: string[];
}

/**
 * Comprehensive theme system validation
 */
export async function validateThemeSystem(): Promise<ThemeTestResult> {
  const result: ThemeTestResult = {
    passed: true,
    errors: [],
    warnings: [],
    details: {
      colorExtraction: false,
      themeMapping: false,
      accessibilityCompliance: false,
      cssVariableApplication: false,
      themeChangeDetection: false,
    },
  };

  try {
    // Test 1: Color extraction
    console.log('Testing color extraction...');
    const colors = themeAdapter.extractDashboardColors();
    if (colors && colors.primary && colors.background) {
      result.details.colorExtraction = true;
    } else {
      result.errors.push('Color extraction failed - missing required colors');
      result.passed = false;
    }

    // Test 2: Theme mapping
    console.log('Testing theme mapping...');
    const theme = themeAdapter.mapToAgentTheme(colors);
    if (theme && theme.colors && theme.colors.primary) {
      result.details.themeMapping = true;
    } else {
      result.errors.push('Theme mapping failed - invalid theme structure');
      result.passed = false;
    }

    // Test 3: Accessibility compliance
    console.log('Testing accessibility compliance...');
    const validation = themeAdapter.validateColorConsistency();
    if (validation.isValid) {
      result.details.accessibilityCompliance = true;
    } else {
      result.warnings.push(`Accessibility issues: ${validation.warnings.join(', ')}`);
      // Don't fail the test for accessibility warnings, just warn
    }

    // Test 4: CSS variable application
    console.log('Testing CSS variable application...');
    themeAdapter.updateThemeVariables(theme);
    const rootStyle = getComputedStyle(document.documentElement);
    const primaryVar = rootStyle.getPropertyValue('--agent-primary').trim();
    if (primaryVar && primaryVar !== '') {
      result.details.cssVariableApplication = true;
    } else {
      result.errors.push('CSS variable application failed - variables not set');
      result.passed = false;
    }

    // Test 5: Theme change detection (simulate)
    console.log('Testing theme change detection...');
    let changeDetected = false;
    const testListener = () => { changeDetected = true; };
    
    themeAdapter.addThemeChangeListener(testListener);
    
    // Simulate theme change by toggling dark class
    const originalClass = document.documentElement.className;
    document.documentElement.classList.toggle('dark');
    
    // Wait a bit for the observer to trigger
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Restore original class
    document.documentElement.className = originalClass;
    
    if (changeDetected) {
      result.details.themeChangeDetection = true;
    } else {
      result.warnings.push('Theme change detection may not be working properly');
    }
    
    themeAdapter.removeThemeChangeListener(testListener);

  } catch (error) {
    result.errors.push(`Theme validation error: ${error}`);
    result.passed = false;
  }

  return result;
}

/**
 * Generate detailed accessibility report
 */
export function generateAccessibilityReport(theme: AgentTheme): AccessibilityReport {
  const report: AccessibilityReport = {
    overallScore: 0,
    issues: [],
    recommendations: [],
  };

  if (!theme) {
    report.issues.push({
      severity: 'error',
      component: 'Theme',
      description: 'No theme provided for accessibility analysis',
      suggestion: 'Initialize theme before running accessibility report',
    });
    return report;
  }

  const { accessibility } = theme;
  let totalChecks = 0;
  let passedChecks = 0;

  // Check contrast ratios
  Object.entries(accessibility.contrastRatios).forEach(([name, ratio]) => {
    totalChecks++;
    
    if (ratio >= 4.5) {
      passedChecks++;
    } else if (ratio >= 3.0) {
      passedChecks += 0.5; // Partial credit for large text compliance
      report.issues.push({
        severity: 'warning',
        component: name,
        description: `Contrast ratio ${ratio.toFixed(2)}:1 meets large text requirements but not normal text`,
        suggestion: 'Consider increasing contrast for better readability',
        contrastRatio: ratio,
        requiredRatio: 4.5,
      });
    } else {
      report.issues.push({
        severity: 'error',
        component: name,
        description: `Contrast ratio ${ratio.toFixed(2)}:1 fails WCAG AA requirements`,
        suggestion: 'Increase color contrast to at least 4.5:1 for normal text',
        contrastRatio: ratio,
        requiredRatio: 4.5,
      });
    }
  });

  // Calculate overall score
  report.overallScore = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0;

  // Generate recommendations based on issues
  if (report.issues.length > 0) {
    const errorCount = report.issues.filter(i => i.severity === 'error').length;
    const warningCount = report.issues.filter(i => i.severity === 'warning').length;

    if (errorCount > 0) {
      report.recommendations.push(
        `Fix ${errorCount} critical accessibility issue${errorCount > 1 ? 's' : ''} to meet WCAG AA standards`
      );
    }

    if (warningCount > 0) {
      report.recommendations.push(
        `Address ${warningCount} accessibility warning${warningCount > 1 ? 's' : ''} to improve user experience`
      );
    }

    // Specific recommendations
    if (report.issues.some(i => i.component.includes('chat'))) {
      report.recommendations.push('Pay special attention to chat bubble contrast as these are primary interaction elements');
    }

    if (report.issues.some(i => i.component.includes('status'))) {
      report.recommendations.push('Ensure status indicators are clearly distinguishable for users with visual impairments');
    }
  } else {
    report.recommendations.push('Great job! Your theme meets accessibility standards');
  }

  return report;
}

/**
 * Test theme consistency across different modes
 */
export async function testThemeConsistency(): Promise<{
  lightMode: ValidationResult;
  darkMode: ValidationResult;
  consistent: boolean;
  differences: string[];
}> {
  const differences: string[] = [];
  
  // Test light mode
  document.documentElement.classList.remove('dark');
  await new Promise(resolve => setTimeout(resolve, 50));
  const lightTheme = themeAdapter.initializeTheme();
  const lightValidation = themeAdapter.validateColorConsistency();

  // Test dark mode
  document.documentElement.classList.add('dark');
  await new Promise(resolve => setTimeout(resolve, 50));
  const darkTheme = themeAdapter.initializeTheme();
  const darkValidation = themeAdapter.validateColorConsistency();

  // Compare themes for consistency
  const lightColors = lightTheme.colors;
  const darkColors = darkTheme.colors;

  // Check if primary colors remain consistent (they should)
  if (lightColors.primary !== darkColors.primary) {
    differences.push('Primary color changes between light and dark mode');
  }

  // Check if text contrast is maintained
  const lightTextIssues = lightValidation.warnings.length;
  const darkTextIssues = darkValidation.warnings.length;
  
  if (Math.abs(lightTextIssues - darkTextIssues) > 2) {
    differences.push('Significant difference in accessibility between light and dark modes');
  }

  return {
    lightMode: lightValidation,
    darkMode: darkValidation,
    consistent: differences.length === 0,
    differences,
  };
}

/**
 * Performance test for theme operations
 */
export async function testThemePerformance(): Promise<{
  extractionTime: number;
  mappingTime: number;
  validationTime: number;
  updateTime: number;
  totalTime: number;
}> {
  const start = performance.now();
  
  // Test extraction performance
  const extractStart = performance.now();
  const colors = themeAdapter.extractDashboardColors();
  const extractionTime = performance.now() - extractStart;

  // Test mapping performance
  const mapStart = performance.now();
  const theme = themeAdapter.mapToAgentTheme(colors);
  const mappingTime = performance.now() - mapStart;

  // Test validation performance
  const validationStart = performance.now();
  themeAdapter.validateColorConsistency();
  const validationTime = performance.now() - validationStart;

  // Test update performance
  const updateStart = performance.now();
  themeAdapter.updateThemeVariables(theme);
  const updateTime = performance.now() - updateStart;

  const totalTime = performance.now() - start;

  return {
    extractionTime,
    mappingTime,
    validationTime,
    updateTime,
    totalTime,
  };
}

/**
 * Export theme configuration for debugging
 */
export function exportThemeDebugInfo(): {
  currentTheme: AgentTheme | null;
  cssVariables: Record<string, string>;
  validation: ValidationResult;
  systemInfo: {
    isDark: boolean;
    prefersDark: boolean;
    storedTheme: string | null;
  };
} {
  const currentTheme = themeAdapter.getCurrentTheme();
  const validation = themeAdapter.validateColorConsistency();
  
  // Extract current CSS variables
  const rootStyle = getComputedStyle(document.documentElement);
  const cssVariables: Record<string, string> = {};
  
  // Get all agent-related CSS variables
  const agentVarNames = [
    '--agent-primary', '--agent-primary-hover', '--agent-primary-active',
    '--agent-secondary', '--agent-secondary-hover', '--agent-accent',
    '--agent-background', '--agent-surface', '--agent-surface-hover',
    '--agent-border', '--agent-border-hover',
    '--agent-text-primary', '--agent-text-secondary', '--agent-text-muted', '--agent-text-inverse',
    '--agent-success', '--agent-success-bg', '--agent-warning', '--agent-warning-bg',
    '--agent-error', '--agent-error-bg', '--agent-info', '--agent-info-bg',
  ];

  agentVarNames.forEach(varName => {
    cssVariables[varName] = rootStyle.getPropertyValue(varName).trim();
  });

  return {
    currentTheme,
    cssVariables,
    validation,
    systemInfo: {
      isDark: document.documentElement.classList.contains('dark'),
      prefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
      storedTheme: localStorage.getItem('theme'),
    },
  };
}