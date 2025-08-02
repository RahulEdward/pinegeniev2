/**
 * PineGenie AI Error Handling System
 * 
 * Isolated error handling for AI system that doesn't interfere
 * with existing application error handling.
 */

export enum AIErrorType {
  // Natural Language Processing Errors
  PARSING_FAILED = 'parsing_failed',
  AMBIGUOUS_REQUEST = 'ambiguous_request',
  INSUFFICIENT_INFORMATION = 'insufficient_information',
  INVALID_SYNTAX = 'invalid_syntax',

  // Strategy Building Errors
  INVALID_STRATEGY = 'invalid_strategy',
  BUILD_FAILED = 'build_failed',
  NODE_PLACEMENT_FAILED = 'node_placement_failed',
  CONNECTION_FAILED = 'connection_failed',

  // Knowledge Base Errors
  PATTERN_NOT_FOUND = 'pattern_not_found',
  KNOWLEDGE_BASE_ERROR = 'knowledge_base_error',
  TEMPLATE_ERROR = 'template_error',

  // Optimization Errors
  OPTIMIZATION_FAILED = 'optimization_failed',
  PARAMETER_INVALID = 'parameter_invalid',
  VALIDATION_FAILED = 'validation_failed',

  // System Errors
  TIMEOUT = 'timeout',
  MEMORY_ERROR = 'memory_error',
  UNKNOWN_ERROR = 'unknown_error',
}

export interface AIError {
  type: AIErrorType;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  context?: string;
  suggestions?: string[];
  canRetry: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorResponse {
  success: false;
  error: AIError;
  fallbackOptions?: FallbackOption[];
  clarificationQuestions?: string[];
}

export interface FallbackOption {
  id: string;
  title: string;
  description: string;
  action: () => void;
}

export class AIErrorHandler {
  private static instance: AIErrorHandler;
  private errorHistory: AIError[] = [];
  private maxHistorySize = 100;

  private constructor() {}

  public static getInstance(): AIErrorHandler {
    if (!AIErrorHandler.instance) {
      AIErrorHandler.instance = new AIErrorHandler();
    }
    return AIErrorHandler.instance;
  }

  public createError(
    type: AIErrorType,
    message: string,
    options: {
      details?: Record<string, unknown>;
      context?: string;
      suggestions?: string[];
      canRetry?: boolean;
      severity?: 'low' | 'medium' | 'high' | 'critical';
    } = {}
  ): AIError {
    const error: AIError = {
      type,
      message,
      details: options.details,
      timestamp: new Date(),
      context: options.context,
      suggestions: options.suggestions || [],
      canRetry: options.canRetry ?? true,
      severity: options.severity || 'medium',
    };

    this.logError(error);
    this.addToHistory(error);

    return error;
  }

  public handleParsingError(
    originalText: string,
    parseError: string
  ): ErrorResponse {
    const error = this.createError(
      AIErrorType.PARSING_FAILED,
      `Failed to parse trading request: ${parseError}`,
      {
        details: { originalText, parseError },
        context: 'Natural Language Processing',
        suggestions: [
          'Try rephrasing your request with simpler language',
          'Include specific indicator names (RSI, MACD, etc.)',
          'Specify timeframes and parameters clearly',
        ],
        canRetry: true,
        severity: 'medium',
      }
    );

    return {
      success: false,
      error,
      clarificationQuestions: [
        'What type of trading strategy are you looking for?',
        'Which indicators would you like to use?',
        'What timeframe should the strategy work on?',
      ],
    };
  }

  public handleBuildError(
    strategyName: string,
    buildError: string
  ): ErrorResponse {
    const error = this.createError(
      AIErrorType.BUILD_FAILED,
      `Failed to build strategy "${strategyName}": ${buildError}`,
      {
        details: { strategyName, buildError },
        context: 'Strategy Building',
        suggestions: [
          'Try a simpler strategy configuration',
          'Check if all required components are available',
          'Reduce the number of indicators in the strategy',
        ],
        canRetry: true,
        severity: 'high',
      }
    );

    return {
      success: false,
      error,
      fallbackOptions: [
        {
          id: 'manual_build',
          title: 'Switch to Manual Building',
          description: 'Build the strategy manually using the visual builder',
          action: () => {
            // This would trigger manual building mode
            console.log('Switching to manual building mode');
          },
        },
        {
          id: 'use_template',
          title: 'Use Similar Template',
          description: 'Start with a pre-built template and customize it',
          action: () => {
            // This would open template selection
            console.log('Opening template selection');
          },
        },
      ],
    };
  }

  public handleValidationError(
    validationErrors: string[]
  ): ErrorResponse {
    const error = this.createError(
      AIErrorType.VALIDATION_FAILED,
      `Strategy validation failed: ${validationErrors.join(', ')}`,
      {
        details: { validationErrors },
        context: 'Strategy Validation',
        suggestions: [
          'Review the strategy components and connections',
          'Ensure all required parameters are set',
          'Check for circular dependencies',
        ],
        canRetry: true,
        severity: 'medium',
      }
    );

    return {
      success: false,
      error,
    };
  }

  public handleOptimizationError(
    optimizationError: string
  ): ErrorResponse {
    const error = this.createError(
      AIErrorType.OPTIMIZATION_FAILED,
      `Strategy optimization failed: ${optimizationError}`,
      {
        details: { optimizationError },
        context: 'Strategy Optimization',
        suggestions: [
          'Use default parameters instead of optimized ones',
          'Try optimizing fewer parameters at once',
          'Check parameter ranges and constraints',
        ],
        canRetry: true,
        severity: 'low',
      }
    );

    return {
      success: false,
      error,
      fallbackOptions: [
        {
          id: 'use_defaults',
          title: 'Use Default Parameters',
          description: 'Continue with default parameter values',
          action: () => {
            console.log('Using default parameters');
          },
        },
      ],
    };
  }

  public isRetryableError(error: AIError): boolean {
    return error.canRetry && error.severity !== 'critical';
  }

  public getErrorHistory(): AIError[] {
    return [...this.errorHistory];
  }

  public clearErrorHistory(): void {
    this.errorHistory = [];
  }

  private logError(error: AIError): void {
    const logMessage = `[PineGenie AI Error] ${error.type}: ${error.message}`;
    
    switch (error.severity) {
      case 'critical':
        console.error(logMessage, error);
        break;
      case 'high':
        console.error(logMessage, error);
        break;
      case 'medium':
        console.warn(logMessage, error);
        break;
      case 'low':
        console.info(logMessage, error);
        break;
    }
  }

  private addToHistory(error: AIError): void {
    this.errorHistory.push(error);
    
    // Keep history size manageable
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }
  }
}