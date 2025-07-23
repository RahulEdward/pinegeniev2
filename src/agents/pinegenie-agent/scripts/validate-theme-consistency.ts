#!/usr/bin/env tsx

/**
 * Theme Consistency Validation Script
 * 
 * Validates that all agent UI components use theme adapter colors consistently
 * and meet accessibility requirements.
 */

import { promises as fs } from 'fs';
import path from 'path';

interface ValidationResult {
  file: string;
  issues: string[];
  hasThemeImport: boolean;
  usesHardcodedColors: boolean;
  accessibilityIssues: string[];
}

class ThemeConsistencyChecker {
  private readonly componentPaths = [
    'src/agents/pinegenie-agent/components',
    'src/app/ai-chat/components'
  ];

  private readonly hardcodedColorPatterns = [
    /(?:background|color|border):\s*['"]?#[0-9a-fA-F]{3,8}['"]?/g,
    /(?:bg|text|border)-(?:red|blue|green|yellow|purple|pink|indigo|gray|slate|zinc)-\d{2,3}/g,
    /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g,
    /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g,
    /hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)/g
  ];

  private readonly themeImportPatterns = [
    /import.*useAgentColors.*from/,
    /import.*useAgentTheme.*from/,
    /import.*AgentThemeProvider.*from/
  ];

  private readonly accessibilityPatterns = [
    {
      pattern: /<button[^>]*(?!aria-label|aria-labelledby)[^>]*>/g,
      message: 'Button missing aria-label or aria-labelledby'
    },
    {
      pattern: /<input[^>]*(?!aria-label|aria-labelledby|id)[^>]*>/g,
      message: 'Input missing aria-label, aria-labelledby, or id'
    },
    {
      pattern: /<img[^>]*(?!alt)[^>]*>/g,
      message: 'Image missing alt attribute'
    }
  ];

  public async validateAllComponents(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const componentPath of this.componentPaths) {
      try {
        const files = await this.getComponentFiles(componentPath);
        
        for (const file of files) {
          const result = await this.validateFile(file);
          results.push(result);
        }
      } catch (error) {
        console.warn(`Could not process path ${componentPath}:`, error);
      }
    }

    return results;
  }

  private async getComponentFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.getComponentFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.name.match(/\.(tsx?|jsx?)$/)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist, skip silently
    }
    
    return files;
  }

  private async validateFile(filePath: string): Promise<ValidationResult> {
    const content = await fs.readFile(filePath, 'utf-8');
    const issues: string[] = [];
    const accessibilityIssues: string[] = [];

    // Check for theme imports
    const hasThemeImport = this.themeImportPatterns.some(pattern => 
      pattern.test(content)
    );

    // Check for hardcoded colors
    const hardcodedColorMatches = this.hardcodedColorPatterns.flatMap(pattern => 
      Array.from(content.matchAll(pattern))
    );

    const usesHardcodedColors = hardcodedColorMatches.length > 0;

    if (usesHardcodedColors && !hasThemeImport) {
      issues.push('Uses hardcoded colors without theme adapter import');
    }

    // Check specific hardcoded color issues
    hardcodedColorMatches.forEach((match, index) => {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      issues.push(`Hardcoded color at line ${lineNumber}: ${match[0]}`);
    });

    // Check accessibility issues
    this.accessibilityPatterns.forEach(({ pattern, message }) => {
      const matches = Array.from(content.matchAll(pattern));
      matches.forEach(match => {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        accessibilityIssues.push(`${message} at line ${lineNumber}`);
      });
    });

    // Check for proper color usage patterns
    if (hasThemeImport) {
      // Should use colors.* instead of hardcoded values
      const colorUsagePattern = /style=\{[^}]*(?:backgroundColor|color|borderColor):\s*['"`][^'"`]*['"`]/g;
      const colorUsageMatches = Array.from(content.matchAll(colorUsagePattern));
      
      colorUsageMatches.forEach(match => {
        if (!match[0].includes('colors.')) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          issues.push(`Style property should use theme colors at line ${lineNumber}`);
        }
      });
    }

    return {
      file: filePath,
      issues,
      hasThemeImport,
      usesHardcodedColors,
      accessibilityIssues
    };
  }

  public generateReport(results: ValidationResult[]): string {
    const totalFiles = results.length;
    const filesWithIssues = results.filter(r => r.issues.length > 0 || r.accessibilityIssues.length > 0).length;
    const filesWithThemeImport = results.filter(r => r.hasThemeImport).length;
    const filesWithHardcodedColors = results.filter(r => r.usesHardcodedColors).length;

    let report = `
# Theme Consistency Validation Report

## Summary
- Total files checked: ${totalFiles}
- Files with issues: ${filesWithIssues}
- Files using theme adapter: ${filesWithThemeImport}
- Files with hardcoded colors: ${filesWithHardcodedColors}
- Theme consistency: ${filesWithIssues === 0 ? '✅ PASS' : '❌ FAIL'}

## Detailed Results

`;

    results.forEach(result => {
      if (result.issues.length > 0 || result.accessibilityIssues.length > 0) {
        report += `### ${result.file}\n\n`;
        
        if (result.issues.length > 0) {
          report += `**Theme Issues:**\n`;
          result.issues.forEach(issue => {
            report += `- ${issue}\n`;
          });
          report += '\n';
        }

        if (result.accessibilityIssues.length > 0) {
          report += `**Accessibility Issues:**\n`;
          result.accessibilityIssues.forEach(issue => {
            report += `- ${issue}\n`;
          });
          report += '\n';
        }
      }
    });

    // Add recommendations
    report += `
## Recommendations

`;

    if (filesWithHardcodedColors > 0) {
      report += `- Replace hardcoded colors with theme adapter colors (${filesWithHardcodedColors} files affected)\n`;
    }

    if (filesWithThemeImport < totalFiles) {
      report += `- Add theme adapter imports to remaining ${totalFiles - filesWithThemeImport} files\n`;
    }

    const totalAccessibilityIssues = results.reduce((sum, r) => sum + r.accessibilityIssues.length, 0);
    if (totalAccessibilityIssues > 0) {
      report += `- Fix ${totalAccessibilityIssues} accessibility issues across components\n`;
    }

    report += `
## Next Steps

1. Update components to use \`useAgentColors()\` hook
2. Replace hardcoded color values with theme variables
3. Wrap components with \`AgentThemeProvider\`
4. Add proper ARIA labels and accessibility attributes
5. Test color contrast ratios meet WCAG AA standards

`;

    return report;
  }
}

// Main execution
async function main() {
  console.log('🎨 Starting theme consistency validation...\n');

  const checker = new ThemeConsistencyChecker();
  const results = await checker.validateAllComponents();
  const report = checker.generateReport(results);

  console.log(report);

  // Write report to file
  const reportPath = 'src/agents/pinegenie-agent/docs/theme-consistency-report.md';
  await fs.writeFile(reportPath, report);
  console.log(`📄 Report saved to: ${reportPath}`);

  // Exit with error code if issues found
  const hasIssues = results.some(r => r.issues.length > 0 || r.accessibilityIssues.length > 0);
  process.exit(hasIssues ? 1 : 0);
}

if (require.main === module) {
  main().catch(console.error);
}

export { ThemeConsistencyChecker };