/**
 * Pine Script Code Validation System
 * Real-time syntax checking and error detection for Pine Script v6
 */

export interface ValidationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code: string;
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  suggestions: ValidationError[];
}

class PineScriptValidator {
  private readonly PINE_KEYWORDS = [
    'strategy', 'indicator', 'library', 'import', 'export',
    'var', 'varip', 'if', 'else', 'for', 'while', 'switch',
    'true', 'false', 'na', 'math', 'ta', 'str', 'array',
    'matrix', 'map', 'color', 'line', 'label', 'table',
    'plot', 'plotshape', 'plotchar', 'plotcandle', 'plotbar',
    'hline', 'fill', 'bgcolor', 'barcolor'
  ];

  private readonly PINE_FUNCTIONS = [
    'ta.sma', 'ta.ema', 'ta.rsi', 'ta.macd', 'ta.bb', 'ta.stoch',
    'ta.atr', 'ta.cci', 'ta.mfi', 'ta.adx', 'ta.crossover', 'ta.crossunder',
    'math.abs', 'math.max', 'math.min', 'math.round', 'math.floor', 'math.ceil',
    'str.tostring', 'str.tonumber', 'str.length', 'str.contains',
    'array.new', 'array.push', 'array.pop', 'array.get', 'array.set',
    'strategy.entry', 'strategy.exit', 'strategy.close', 'strategy.cancel'
  ];

  private readonly REQUIRED_VERSION = '//@version=6';

  validate(code: string): ValidationResult {
    const lines = code.split('\n');
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const suggestions: ValidationError[] = [];

    // Check for version declaration
    this.validateVersion(lines, errors);

    // Check each line for syntax issues
    lines.forEach((line, index) => {
      this.validateLine(line, index + 1, errors, warnings, suggestions);
    });

    // Check for common Pine Script patterns
    this.validatePineScriptPatterns(code, errors, warnings, suggestions);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  private validateVersion(lines: string[], errors: ValidationError[]): void {
    const firstLine = lines[0]?.trim();
    if (!firstLine?.startsWith('//@version=')) {
      errors.push({
        line: 1,
        column: 1,
        message: 'Pine Script version declaration is required',
        severity: 'error',
        code: 'MISSING_VERSION',
        suggestion: 'Add "//@version=6" as the first line'
      });
    } else if (firstLine !== this.REQUIRED_VERSION) {
      errors.push({
        line: 1,
        column: 1,
        message: 'Pine Script v6 is required',
        severity: 'error',
        code: 'WRONG_VERSION',
        suggestion: 'Change to "//@version=6"'
      });
    }
  }

  private validateLine(line: string, lineNumber: number, errors: ValidationError[], warnings: ValidationError[], suggestions: ValidationError[]): void {
    const trimmedLine = line.trim();
    
    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('//')) {
      return;
    }

    // Check for common syntax errors
    this.checkBrackets(line, lineNumber, errors);
    this.checkQuotes(line, lineNumber, errors);
    this.checkDeprecatedFunctions(line, lineNumber, warnings);
    this.checkVariableNaming(line, lineNumber, suggestions);
    this.checkIndentation(line, lineNumber, suggestions);
  }

  private checkBrackets(line: string, lineNumber: number, errors: ValidationError[]): void {
    const brackets = { '(': 0, '[': 0, '{': 0 };
    const closingBrackets = { ')': '(', ']': '[', '}': '{' };

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char in brackets) {
        brackets[char as keyof typeof brackets]++;
      } else if (char in closingBrackets) {
        const opening = closingBrackets[char as keyof typeof closingBrackets];
        if (brackets[opening as keyof typeof brackets] > 0) {
          brackets[opening as keyof typeof brackets]--;
        } else {
          errors.push({
            line: lineNumber,
            column: i + 1,
            message: `Unmatched closing bracket '${char}'`,
            severity: 'error',
            code: 'UNMATCHED_BRACKET'
          });
        }
      }
    }

    // Check for unclosed brackets
    Object.entries(brackets).forEach(([bracket, count]) => {
      if (count > 0) {
        errors.push({
          line: lineNumber,
          column: line.lastIndexOf(bracket) + 1,
          message: `Unclosed bracket '${bracket}'`,
          severity: 'error',
          code: 'UNCLOSED_BRACKET'
        });
      }
    });
  }

  private checkQuotes(line: string, lineNumber: number, errors: ValidationError[]): void {
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if ((char === '"' || char === "'") && !inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar && inString) {
        // Check for escaped quotes
        if (i > 0 && line[i - 1] !== '\\') {
          inString = false;
          stringChar = '';
        }
      }
    }

    if (inString) {
      errors.push({
        line: lineNumber,
        column: line.indexOf(stringChar) + 1,
        message: `Unclosed string literal`,
        severity: 'error',
        code: 'UNCLOSED_STRING'
      });
    }
  }

  private checkDeprecatedFunctions(line: string, lineNumber: number, warnings: ValidationError[]): void {
    const deprecatedFunctions = [
      { old: 'security(', new: 'request.security(' },
      { old: 'study(', new: 'indicator(' },
      { old: 'rsi(', new: 'ta.rsi(' },
      { old: 'sma(', new: 'ta.sma(' },
      { old: 'ema(', new: 'ta.ema(' },
      { old: 'crossover(', new: 'ta.crossover(' },
      { old: 'crossunder(', new: 'ta.crossunder(' }
    ];

    deprecatedFunctions.forEach(({ old, new: newFunc }) => {
      const index = line.indexOf(old);
      if (index !== -1) {
        warnings.push({
          line: lineNumber,
          column: index + 1,
          message: `Deprecated function '${old.slice(0, -1)}' used`,
          severity: 'warning',
          code: 'DEPRECATED_FUNCTION',
          suggestion: `Use '${newFunc.slice(0, -1)}' instead`
        });
      }
    });
  }

  private checkVariableNaming(line: string, lineNumber: number, suggestions: ValidationError[]): void {
    // Check for variable declarations
    const varMatch = line.match(/^\s*(\w+)\s*=/);
    if (varMatch) {
      const varName = varMatch[1];
      
      // Check naming conventions
      if (varName.includes('_') && !varName.match(/^[a-z][a-zA-Z0-9_]*$/)) {
        suggestions.push({
          line: lineNumber,
          column: line.indexOf(varName) + 1,
          message: `Variable name '${varName}' doesn't follow camelCase convention`,
          severity: 'info',
          code: 'NAMING_CONVENTION',
          suggestion: 'Use camelCase for variable names'
        });
      }

      // Check for reserved keywords
      if (this.PINE_KEYWORDS.includes(varName)) {
        suggestions.push({
          line: lineNumber,
          column: line.indexOf(varName) + 1,
          message: `Variable name '${varName}' is a reserved keyword`,
          severity: 'info',
          code: 'RESERVED_KEYWORD',
          suggestion: 'Choose a different variable name'
        });
      }
    }
  }

  private checkIndentation(line: string, lineNumber: number, suggestions: ValidationError[]): void {
    if (line.length > 0 && line[0] === ' ') {
      const leadingSpaces = line.match(/^ */)?.[0].length || 0;
      if (leadingSpaces % 4 !== 0) {
        suggestions.push({
          line: lineNumber,
          column: 1,
          message: 'Inconsistent indentation',
          severity: 'info',
          code: 'INDENTATION',
          suggestion: 'Use 4 spaces for indentation'
        });
      }
    }
  }

  private validatePineScriptPatterns(code: string, errors: ValidationError[], warnings: ValidationError[], suggestions: ValidationError[]): void {
    // Check for strategy/indicator declaration
    if (!code.includes('strategy(') && !code.includes('indicator(')) {
      errors.push({
        line: 1,
        column: 1,
        message: 'Missing strategy() or indicator() declaration',
        severity: 'error',
        code: 'MISSING_DECLARATION',
        suggestion: 'Add strategy() or indicator() declaration'
      });
    }

    // Check for proper overlay setting with strategy
    if (code.includes('strategy(') && !code.includes('overlay=')) {
      suggestions.push({
        line: 1,
        column: 1,
        message: 'Consider specifying overlay parameter',
        severity: 'info',
        code: 'MISSING_OVERLAY',
        suggestion: 'Add overlay=true or overlay=false to strategy() declaration'
      });
    }

    // Check for input validation
    const inputMatches = code.match(/input\.[a-z]+\(/g);
    if (inputMatches) {
      inputMatches.forEach(match => {
        const lineIndex = code.indexOf(match);
        const lineNumber = code.substring(0, lineIndex).split('\n').length;
        
        if (!code.includes('minval=') && !code.includes('maxval=')) {
          suggestions.push({
            line: lineNumber,
            column: 1,
            message: 'Consider adding input validation with minval/maxval',
            severity: 'info',
            code: 'INPUT_VALIDATION',
            suggestion: 'Add minval and maxval parameters to input functions'
          });
        }
      });
    }
  }

  validateSyntax(code: string): boolean {
    const result = this.validate(code);
    return result.isValid;
  }

  getQuickFixes(error: ValidationError): string[] {
    const fixes: string[] = [];
    
    switch (error.code) {
      case 'MISSING_VERSION':
        fixes.push('//@version=6');
        break;
      case 'WRONG_VERSION':
        fixes.push('//@version=6');
        break;
      case 'DEPRECATED_FUNCTION':
        if (error.suggestion) {
          fixes.push(error.suggestion);
        }
        break;
      case 'UNCLOSED_BRACKET':
        fixes.push('Add closing bracket');
        break;
      case 'UNCLOSED_STRING':
        fixes.push('Add closing quote');
        break;
    }
    
    return fixes;
  }
}

export const pineValidator = new PineScriptValidator();