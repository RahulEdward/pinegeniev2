/**
 * Pine Script Code Validation System
 * Real-time Pine Script v6 syntax checker with error highlighting and suggestions
 */

export interface ValidationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code: string;
  suggestion?: string;
  quickFix?: QuickFix;
}

export interface QuickFix {
  title: string;
  description: string;
  replacement: string;
  range: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  suggestions: ValidationError[];
  pineScriptVersion: string;
  performanceScore: number;
  securityIssues: ValidationError[];
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  category: 'syntax' | 'logic' | 'performance' | 'security' | 'style';
  severity: 'error' | 'warning' | 'info';
  pattern: RegExp;
  message: string;
  suggestion?: string;
  quickFix?: (match: RegExpMatchArray, line: number) => QuickFix;
}

/**
 * Pine Script Code Validator
 */
export class PineScriptValidator {
  private rules: ValidationRule[];
  private keywords: Set<string>;
  private functions: Set<string>;
  private variables: Set<string>;

  constructor() {
    this.rules = this.initializeRules();
    this.keywords = this.initializeKeywords();
    this.functions = this.initializeFunctions();
    this.variables = new Set();
  }

  /**
   * Initialize validation rules
   */
  private initializeRules(): ValidationRule[] {
    return [
      // Version validation
      {
        id: 'version_required',
        name: 'Version Declaration Required',
        description: 'Pine Script must start with version declaration',
        category: 'syntax',
        severity: 'error',
        pattern: /^(?!\/\/@version=)/m,
        message: 'Pine Script must start with //@version=6',
        suggestion: 'Add //@version=6 at the beginning of your script',
        quickFix: (match, line) => ({
          title: 'Add version declaration',
          description: 'Insert //@version=6 at the beginning',
          replacement: '//@version=6\n',
          range: { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 }
        })
      },

      // Syntax errors
      {
        id: 'missing_parentheses',
        name: 'Missing Parentheses',
        description: 'Function calls must have parentheses',
        category: 'syntax',
        severity: 'error',
        pattern: /\b(ta\.\w+|math\.\w+|str\.\w+)\s*(?!\()/g,
        message: 'Function calls must include parentheses',
        suggestion: 'Add () after function name',
        quickFix: (match, line) => ({
          title: 'Add parentheses',
          description: 'Add () to complete function call',
          replacement: `${match[1]}()`,
          range: { startLine: line, startColumn: match.index!, endLine: line, endColumn: match.index! + match[0].length }
        })
      },

      {
        id: 'invalid_variable_name',
        name: 'Invalid Variable Name',
        description: 'Variable names must follow Pine Script naming rules',
        category: 'syntax',
        severity: 'error',
        pattern: /\b(\d+\w+|\w*-\w*)\s*=/g,
        message: 'Variable names cannot start with numbers or contain hyphens',
        suggestion: 'Use valid variable names (letters, numbers, underscores)'
      },

      // Logic errors
      {
        id: 'undefined_variable',
        name: 'Undefined Variable',
        description: 'Variable used before declaration',
        category: 'logic',
        severity: 'error',
        pattern: /\b([a-zA-Z_]\w*)\b/g,
        message: 'Variable used before declaration',
        suggestion: 'Declare variable before use or check spelling'
      },

      {
        id: 'recursive_reference',
        name: 'Recursive Reference',
        description: 'Variable references itself in calculation',
        category: 'logic',
        severity: 'error',
        pattern: /(\w+)\s*=.*\b\1\b/g,
        message: 'Variable cannot reference itself directly',
        suggestion: 'Use previous value with [1] or different logic'
      },

      // Performance issues
      {
        id: 'inefficient_loop',
        name: 'Inefficient Loop',
        description: 'Loop could be optimized',
        category: 'performance',
        severity: 'warning',
        pattern: /for\s+\w+\s*=\s*\d+\s+to\s+(\d+)/g,
        message: 'Large loops can impact performance',
        suggestion: 'Consider using built-in functions or reducing iterations'
      },

      {
        id: 'redundant_calculation',
        name: 'Redundant Calculation',
        description: 'Same calculation performed multiple times',
        category: 'performance',
        severity: 'warning',
        pattern: /(ta\.\w+\([^)]+\)).*\1/g,
        message: 'Redundant calculation detected',
        suggestion: 'Store result in variable and reuse'
      },

      // Security issues
      {
        id: 'hardcoded_credentials',
        name: 'Hardcoded Credentials',
        description: 'Potential hardcoded credentials or API keys',
        category: 'security',
        severity: 'warning',
        pattern: /(api[_-]?key|password|secret|token)\s*=\s*["'][^"']+["']/gi,
        message: 'Avoid hardcoding credentials in scripts',
        suggestion: 'Use input parameters for sensitive data'
      },

      // Style issues
      {
        id: 'inconsistent_indentation',
        name: 'Inconsistent Indentation',
        description: 'Inconsistent indentation style',
        category: 'style',
        severity: 'info',
        pattern: /^(\t+| {2,})(?=\S)/gm,
        message: 'Use consistent indentation (4 spaces recommended)',
        suggestion: 'Use 4 spaces for indentation'
      },

      {
        id: 'missing_comments',
        name: 'Missing Comments',
        description: 'Complex logic should be commented',
        category: 'style',
        severity: 'info',
        pattern: /^(?!\/\/).*[{}()=+\-*\/]{3,}/gm,
        message: 'Consider adding comments for complex logic',
        suggestion: 'Add explanatory comments'
      }
    ];
  }

  /**
   * Initialize Pine Script keywords
   */
  private initializeKeywords(): Set<string> {
    return new Set([
      'strategy', 'indicator', 'library', 'import', 'export',
      'var', 'varip', 'if', 'else', 'for', 'while', 'switch',
      'true', 'false', 'na', 'open', 'high', 'low', 'close', 'volume',
      'time', 'bar_index', 'last_bar_index', 'barstate',
      'input', 'plot', 'plotshape', 'plotchar', 'bgcolor', 'hline',
      'fill', 'table', 'label', 'line', 'box', 'polyline'
    ]);
  }

  /**
   * Initialize Pine Script built-in functions
   */
  private initializeFunctions(): Set<string> {
    return new Set([
      // Technical analysis
      'ta.sma', 'ta.ema', 'ta.rsi', 'ta.macd', 'ta.bb', 'ta.atr',
      'ta.stoch', 'ta.cci', 'ta.mfi', 'ta.adx', 'ta.obv',
      'ta.crossover', 'ta.crossunder', 'ta.highest', 'ta.lowest',
      'ta.valuewhen', 'ta.barssince', 'ta.change', 'ta.mom',
      
      // Math functions
      'math.abs', 'math.max', 'math.min', 'math.round', 'math.floor',
      'math.ceil', 'math.pow', 'math.sqrt', 'math.log', 'math.exp',
      'math.sin', 'math.cos', 'math.tan', 'math.avg', 'math.sum',
      
      // String functions
      'str.tostring', 'str.tonumber', 'str.length', 'str.substring',
      'str.contains', 'str.startswith', 'str.endswith', 'str.replace',
      
      // Array functions
      'array.new', 'array.push', 'array.pop', 'array.get', 'array.set',
      'array.size', 'array.clear', 'array.slice', 'array.sort',
      
      // Strategy functions
      'strategy.entry', 'strategy.exit', 'strategy.close', 'strategy.cancel',
      'strategy.position_size', 'strategy.position_avg_price',
      'strategy.equity', 'strategy.netprofit', 'strategy.grossprofit'
    ]);
  }

  /**
   * Validate Pine Script code
   */
  validate(code: string): ValidationResult {
    const lines = code.split('\n');
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const suggestions: ValidationError[] = [];
    const securityIssues: ValidationError[] = [];

    // Track variables for undefined reference checking
    this.variables.clear();
    this.extractVariables(code);

    // Apply validation rules
    lines.forEach((line, lineIndex) => {
      this.rules.forEach(rule => {
        const matches = Array.from(line.matchAll(rule.pattern));
        matches.forEach(match => {
          const error: ValidationError = {
            line: lineIndex + 1,
            column: match.index! + 1,
            message: rule.message,
            severity: rule.severity,
            code: rule.id,
            suggestion: rule.suggestion,
            quickFix: rule.quickFix ? rule.quickFix(match, lineIndex) : undefined
          };

          // Special handling for undefined variables
          if (rule.id === 'undefined_variable') {
            const variable = match[1];
            if (!this.isValidReference(variable, line)) {
              errors.push(error);
            }
            return;
          }

          switch (rule.severity) {
            case 'error':
              errors.push(error);
              break;
            case 'warning':
              if (rule.category === 'security') {
                securityIssues.push(error);
              } else {
                warnings.push(error);
              }
              break;
            case 'info':
              suggestions.push(error);
              break;
          }
        });
      });
    });

    // Additional validations
    this.validateSyntax(code, errors);
    this.validateLogic(code, errors, warnings);
    
    const performanceScore = this.calculatePerformanceScore(code, warnings);
    const pineScriptVersion = this.extractVersion(code);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      pineScriptVersion,
      performanceScore,
      securityIssues
    };
  }

  /**
   * Extract variables from code
   */
  private extractVariables(code: string): void {
    // Extract variable declarations
    const varPattern = /(?:var\s+|varip\s+)?([a-zA-Z_]\w*)\s*=/g;
    let match;
    while ((match = varPattern.exec(code)) !== null) {
      this.variables.add(match[1]);
    }

    // Add built-in variables
    ['open', 'high', 'low', 'close', 'volume', 'time', 'bar_index'].forEach(v => {
      this.variables.add(v);
    });
  }

  /**
   * Check if variable reference is valid
   */
  private isValidReference(variable: string, line: string): boolean {
    // Skip if it's a keyword or function
    if (this.keywords.has(variable) || this.functions.has(variable)) {
      return true;
    }

    // Skip if it's being declared in this line
    if (line.includes(`${variable} =`) || line.includes(`var ${variable}`) || line.includes(`varip ${variable}`)) {
      return true;
    }

    // Skip if it's a property access
    if (line.includes(`${variable}.`)) {
      return true;
    }

    // Check if variable is declared
    return this.variables.has(variable);
  }

  /**
   * Validate syntax
   */
  private validateSyntax(code: string, errors: ValidationError[]): void {
    // Check for balanced parentheses
    const lines = code.split('\n');
    lines.forEach((line, index) => {
      let parenCount = 0;
      let bracketCount = 0;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '(') parenCount++;
        else if (char === ')') parenCount--;
        else if (char === '[') bracketCount++;
        else if (char === ']') bracketCount--;
      }

      if (parenCount !== 0) {
        errors.push({
          line: index + 1,
          column: line.length,
          message: 'Unbalanced parentheses',
          severity: 'error',
          code: 'unbalanced_parentheses',
          suggestion: 'Check for missing or extra parentheses'
        });
      }

      if (bracketCount !== 0) {
        errors.push({
          line: index + 1,
          column: line.length,
          message: 'Unbalanced brackets',
          severity: 'error',
          code: 'unbalanced_brackets',
          suggestion: 'Check for missing or extra brackets'
        });
      }
    });
  }

  /**
   * Validate logic
   */
  private validateLogic(code: string, errors: ValidationError[], warnings: ValidationError[]): void {
    const lines = code.split('\n');
    
    // Check for common logic errors
    lines.forEach((line, index) => {
      // Division by zero check
      if (line.includes('/ 0') || line.includes('/0')) {
        errors.push({
          line: index + 1,
          column: line.indexOf('/') + 1,
          message: 'Division by zero',
          severity: 'error',
          code: 'division_by_zero',
          suggestion: 'Add zero check before division'
        });
      }

      // Unreachable code after return
      if (line.trim().startsWith('return') && index < lines.length - 1) {
        const nextLine = lines[index + 1].trim();
        if (nextLine && !nextLine.startsWith('//') && !nextLine.startsWith('/*')) {
          warnings.push({
            line: index + 2,
            column: 1,
            message: 'Unreachable code after return',
            severity: 'warning',
            code: 'unreachable_code',
            suggestion: 'Remove unreachable code or restructure logic'
          });
        }
      }
    });
  }

  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(code: string, warnings: ValidationError[]): number {
    let score = 100;
    
    // Deduct points for performance issues
    const performanceWarnings = warnings.filter(w => w.code.includes('performance') || w.code.includes('inefficient'));
    score -= performanceWarnings.length * 10;
    
    // Deduct points for complex calculations
    const complexityMatches = code.match(/for\s+|while\s+|if\s+.*if\s+/g);
    if (complexityMatches) {
      score -= Math.min(complexityMatches.length * 5, 30);
    }
    
    // Bonus for using built-in functions
    const builtinMatches = code.match(/ta\.|math\.|str\./g);
    if (builtinMatches) {
      score += Math.min(builtinMatches.length * 2, 20);
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Extract Pine Script version
   */
  private extractVersion(code: string): string {
    const versionMatch = code.match(/\/\/@version=(\d+)/);
    return versionMatch ? `v${versionMatch[1]}` : 'unknown';
  }

  /**
   * Get suggestions for code improvement
   */
  getSuggestions(code: string): string[] {
    const suggestions: string[] = [];
    
    // Performance suggestions
    if (code.includes('for ') && code.includes('ta.')) {
      suggestions.push('Consider using vectorized operations instead of loops for better performance');
    }
    
    // Style suggestions
    if (!code.includes('//')) {
      suggestions.push('Add comments to explain your strategy logic');
    }
    
    // Security suggestions
    if (code.includes('request.security')) {
      suggestions.push('Be cautious with external data requests for security');
    }
    
    return suggestions;
  }

  /**
   * Auto-fix common issues
   */
  autoFix(code: string, errorCodes: string[]): string {
    let fixedCode = code;
    
    errorCodes.forEach(errorCode => {
      switch (errorCode) {
        case 'version_required':
          if (!fixedCode.startsWith('//@version=')) {
            fixedCode = '//@version=6\n' + fixedCode;
          }
          break;
          
        case 'missing_parentheses':
          fixedCode = fixedCode.replace(/\b(ta\.\w+|math\.\w+|str\.\w+)\s*(?!\()/g, '$1()');
          break;
          
        case 'inconsistent_indentation':
          fixedCode = fixedCode.replace(/^\t+/gm, match => '    '.repeat(match.length));
          break;
      }
    });
    
    return fixedCode;
  }
}

// Export singleton instance
export const pineScriptValidator = new PineScriptValidator();