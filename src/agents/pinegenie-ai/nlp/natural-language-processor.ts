/**
 * Natural Language Processor
 * 
 * Main NLP engine that coordinates tokenization, intent extraction,
 * parameter extraction, and context management for trading requests.
 */

import { ParsedRequest, TradingIntent, StrategyParameters, NLPResult } from '../types/nlp-types';
import { Tokenizer, type TokenizationResult } from './tokenizer';
import { IntentExtractor, type IntentExtractionResult } from './intent-extractor';
import { ParameterExtractor, type ParameterExtractionResult } from './parameter-extractor';
import { ContextEngine } from './context-engine';
import { AILogger } from '../core/logger';
import { AIErrorHandler, AIErrorType } from '../core/error-handler';

export interface NLPOptions {
  enableContextMemory: boolean;
  enableParameterValidation: boolean;
  enableFallbackProcessing: boolean;
  minConfidenceThreshold: number;
  maxProcessingTime: number;
}

export interface ProcessingMetrics {
  totalTime: number;
  tokenizationTime: number;
  intentExtractionTime: number;
  parameterExtractionTime: number;
  contextUpdateTime: number;
  tokenCount: number;
  entityCount: number;
  confidence: number;
}

export class NaturalLanguageProcessor {
  private tokenizer: Tokenizer;
  private intentExtractor: IntentExtractor;
  private parameterExtractor: ParameterExtractor;
  private contextEngine: ContextEngine;
  private logger: AILogger;
  private errorHandler: AIErrorHandler;
  private options: NLPOptions;

  constructor(options: Partial<NLPOptions> = {}) {
    this.tokenizer = new Tokenizer();
    this.intentExtractor = new IntentExtractor();
    this.parameterExtractor = new ParameterExtractor();
    this.contextEngine = new ContextEngine();
    this.logger = AILogger.getInstance();
    this.errorHandler = AIErrorHandler.getInstance();

    this.options = {
      enableContextMemory: true,
      enableParameterValidation: true,
      enableFallbackProcessing: true,
      minConfidenceThreshold: 0.3,
      maxProcessingTime: 5000, // 5 seconds
      ...options
    };

    this.logger.info('NaturalLanguageProcessor', 'NLP system initialized', {
      contextMemory: this.options.enableContextMemory,
      parameterValidation: this.options.enableParameterValidation,
      minConfidence: this.options.minConfidenceThreshold
    });
  }

  /**
   * Process a natural language trading request
   */
  public async processRequest(
    request: string,
    conversationId?: string,
    userId?: string
  ): Promise<NLPResult> {
    const startTime = performance.now();
    const timer = this.logger.startTimer('NaturalLanguageProcessor', 'request processing');

    this.logger.info('NaturalLanguageProcessor', 'Processing request', {
      requestLength: request.length,
      conversationId,
      userId,
      preview: request.substring(0, 100) + (request.length > 100 ? '...' : '')
    });

    try {
      // Validate input
      this.validateInput(request);

      // Step 1: Resolve references using context (if enabled)
      let processedRequest = request;
      let contextUpdateTime = 0;
      
      if (this.options.enableContextMemory && conversationId) {
        const contextStart = performance.now();
        processedRequest = this.contextEngine.resolveReferences(conversationId, request);
        contextUpdateTime = performance.now() - contextStart;
      }

      // Step 2: Tokenization
      const tokenizationStart = performance.now();
      const tokenizationResult = this.tokenizer.tokenize(processedRequest);
      const tokenizationTime = performance.now() - tokenizationStart;

      if (tokenizationResult.tokens.length === 0) {
        throw new Error('No meaningful tokens found in request');
      }

      // Step 3: Intent Extraction
      const intentStart = performance.now();
      const intentResult = this.intentExtractor.extractIntent(
        tokenizationResult.tokens,
        processedRequest
      );
      const intentExtractionTime = performance.now() - intentStart;

      // Step 4: Parameter Extraction
      const parameterStart = performance.now();
      const parameterResult = this.parameterExtractor.extractParameters(
        tokenizationResult.tokens,
        tokenizationResult.entities,
        processedRequest
      );
      const parameterExtractionTime = performance.now() - parameterStart;

      // Step 5: Update context (if enabled)
      if (this.options.enableContextMemory && conversationId) {
        const contextStart = performance.now();
        this.contextEngine.updateContextWithInput(
          conversationId,
          request,
          intentResult.intent,
          parameterResult.parameters
        );
        contextUpdateTime += performance.now() - contextStart;
      }

      // Step 6: Build final result
      const result = this.buildNLPResult(
        request,
        tokenizationResult,
        intentResult,
        parameterResult,
        {
          totalTime: performance.now() - startTime,
          tokenizationTime,
          intentExtractionTime,
          parameterExtractionTime,
          contextUpdateTime,
          tokenCount: tokenizationResult.tokens.length,
          entityCount: tokenizationResult.entities.length,
          confidence: this.calculateOverallConfidence(tokenizationResult, intentResult, parameterResult)
        }
      );

      // Validate result confidence
      if (result.confidence < this.options.minConfidenceThreshold) {
        this.logger.warn('NaturalLanguageProcessor', 'Low confidence result', {
          confidence: result.confidence,
          threshold: this.options.minConfidenceThreshold
        });

        if (!this.options.enableFallbackProcessing) {
          throw new Error(`Processing confidence ${result.confidence} below threshold ${this.options.minConfidenceThreshold}`);
        }
      }

      timer();
      
      this.logger.info('NaturalLanguageProcessor', 'Request processing completed', {
        confidence: result.confidence,
        strategyType: result.tradingIntent.strategyType,
        parameterCount: Object.keys(result.parameters).length,
        processingTime: `${(performance.now() - startTime).toFixed(2)}ms`
      });

      return result;

    } catch (error) {
      this.logger.error('NaturalLanguageProcessor', 'Request processing failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        request: request.substring(0, 200)
      });

      // Return error result or fallback
      if (this.options.enableFallbackProcessing) {
        return this.createFallbackResult(request, error instanceof Error ? error.message : 'Unknown error');
      } else {
        throw error;
      }
    }
  }

  /**
   * Get contextual suggestions for conversation
   */
  public getContextualSuggestions(conversationId: string): string[] {
    if (!this.options.enableContextMemory) {
      return this.getDefaultSuggestions();
    }

    try {
      return this.contextEngine.getContextualSuggestions(conversationId);
    } catch (error) {
      this.logger.warn('NaturalLanguageProcessor', 'Failed to get contextual suggestions', { error });
      return this.getDefaultSuggestions();
    }
  }

  /**
   * Get conversation summary
   */
  public getConversationSummary(conversationId: string) {
    if (!this.options.enableContextMemory) {
      return null;
    }

    try {
      return this.contextEngine.getConversationSummary(conversationId);
    } catch (error) {
      this.logger.warn('NaturalLanguageProcessor', 'Failed to get conversation summary', { error });
      return null;
    }
  }

  /**
   * Clear conversation context
   */
  public clearConversation(conversationId: string): void {
    if (this.options.enableContextMemory) {
      this.contextEngine.clearContext(conversationId);
      this.logger.info('NaturalLanguageProcessor', 'Cleared conversation context', { conversationId });
    }
  }

  /**
   * Update context with AI response
   */
  public updateContextWithResponse(
    conversationId: string,
    response: string,
    actions?: string[]
  ): void {
    if (this.options.enableContextMemory) {
      this.contextEngine.updateContextWithResponse(conversationId, response, actions);
    }
  }

  /**
   * Get NLP system statistics
   */
  public getStatistics(): {
    tokenizer: any;
    intentExtractor: any;
    parameterExtractor: any;
    activeConversations: number;
    options: NLPOptions;
  } {
    return {
      tokenizer: this.tokenizer.getStatistics(),
      intentExtractor: this.intentExtractor.getStatistics(),
      parameterExtractor: {
        parameterDefinitions: this.parameterExtractor.getParameterDefinitions().length
      },
      activeConversations: this.options.enableContextMemory ? 
        this.contextEngine.getActiveConversations().length : 0,
      options: this.options
    };
  }

  // Private helper methods

  private validateInput(request: string): void {
    if (!request || typeof request !== 'string') {
      throw new Error('Request must be a non-empty string');
    }

    if (request.trim().length === 0) {
      throw new Error('Request cannot be empty');
    }

    if (request.length > 10000) {
      throw new Error('Request too long (max 10,000 characters)');
    }

    // Check for potentially malicious content
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(request)) {
        throw new Error('Request contains potentially unsafe content');
      }
    }
  }

  private buildNLPResult(
    originalRequest: string,
    tokenizationResult: TokenizationResult,
    intentResult: IntentExtractionResult,
    parameterResult: ParameterExtractionResult,
    metrics: ProcessingMetrics
  ): NLPResult {
    // Build parsed request
    const parsedRequest: ParsedRequest = {
      originalText: originalRequest,
      tokens: tokenizationResult.tokens,
      entities: tokenizationResult.entities,
      confidence: tokenizationResult.confidence,
      processingTime: tokenizationResult.processingTime
    };

    // Combine suggestions from all components
    const allSuggestions = [
      ...intentResult.suggestions,
      ...parameterResult.suggestions
    ];

    // Remove duplicates and limit suggestions
    const uniqueSuggestions = [...new Set(allSuggestions)].slice(0, 5);

    // Combine clarifications
    const clarifications: string[] = [];
    
    if (intentResult.confidence < 0.7) {
      clarifications.push('Could you clarify what type of trading strategy you want?');
    }
    
    if (parameterResult.extractedCount === 0) {
      clarifications.push('Please specify some parameters for the strategy (periods, thresholds, etc.)');
    }
    
    if (parameterResult.validationErrors.length > 0) {
      clarifications.push('Some parameters need adjustment: ' + parameterResult.validationErrors.join(', '));
    }

    return {
      parsedRequest,
      tradingIntent: intentResult.intent,
      parameters: parameterResult.parameters,
      suggestions: uniqueSuggestions,
      clarifications: clarifications.length > 0 ? clarifications : undefined,
      confidence: metrics.confidence,
      processingTime: metrics.totalTime,
      metadata: {
        metrics,
        intentMatches: intentResult.matchedPatterns.length,
        parameterErrors: parameterResult.validationErrors.length,
        reasoning: intentResult.reasoning
      }
    };
  }

  private calculateOverallConfidence(
    tokenizationResult: TokenizationResult,
    intentResult: IntentExtractionResult,
    parameterResult: ParameterExtractionResult
  ): number {
    // Weighted average of component confidences
    const weights = {
      tokenization: 0.2,
      intent: 0.5,
      parameters: 0.3
    };

    const weightedConfidence = 
      (tokenizationResult.confidence * weights.tokenization) +
      (intentResult.confidence * weights.intent) +
      (parameterResult.confidence * weights.parameters);

    // Apply penalties for issues
    let penalty = 0;
    
    if (parameterResult.validationErrors.length > 0) {
      penalty += parameterResult.validationErrors.length * 0.05;
    }
    
    if (intentResult.matchedPatterns.length === 0) {
      penalty += 0.1;
    }

    return Math.max(0, Math.min(1, weightedConfidence - penalty));
  }

  private createFallbackResult(originalRequest: string, errorMessage: string): NLPResult {
    this.logger.warn('NaturalLanguageProcessor', 'Creating fallback result', {
      originalRequest: originalRequest.substring(0, 100),
      error: errorMessage
    });

    const fallbackIntent: TradingIntent = {
      strategyType: 'custom' as any,
      indicators: [],
      conditions: [],
      actions: [],
      riskManagement: [],
      confidence: 0.1
    };

    const fallbackParsedRequest: ParsedRequest = {
      originalText: originalRequest,
      tokens: [],
      entities: [],
      confidence: 0.1
    };

    return {
      parsedRequest: fallbackParsedRequest,
      tradingIntent: fallbackIntent,
      parameters: {},
      suggestions: [
        'Try rephrasing your request with specific trading terms',
        'Include indicators like RSI, MACD, or Moving Averages',
        'Specify entry and exit conditions clearly',
        'Mention timeframes and risk management preferences'
      ],
      clarifications: [
        'I had trouble understanding your request. Could you be more specific?',
        'What type of trading strategy are you looking for?',
        'Which indicators would you like to use?'
      ],
      confidence: 0.1,
      processingTime: 0,
      metadata: {
        fallback: true,
        error: errorMessage
      }
    };
  }

  private getDefaultSuggestions(): string[] {
    return [
      'Try: "Create an RSI strategy that buys when RSI is below 30"',
      'Try: "Build a moving average crossover strategy"',
      'Try: "Make a MACD momentum strategy with stop loss"',
      'Try: "Create a Bollinger Bands mean reversion strategy"'
    ];
  }
}