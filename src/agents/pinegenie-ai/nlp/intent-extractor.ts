/**
 * Trading Intent Extractor
 * 
 * Extracts trading intent from tokenized text using pattern matching
 * and rule-based analysis.
 */

import { TradingIntent, StrategyType, Token, TokenType } from '../types/nlp-types';
import { PatternMatcher, TradingPattern } from './patterns/trading-patterns';
import { AILogger } from '../core/logger';

export interface IntentExtractionResult {
  intent: TradingIntent;
  confidence: number;
  matchedPatterns: Array<{
    pattern: TradingPattern;
    confidence: number;
    matchedKeywords: string[];
  }>;
  reasoning: string[];
  suggestions: string[];
}

export interface IntentExtractionOptions {
  minConfidence: number;
  maxPatterns: number;
  enableFallback: boolean;
  strictMatching: boolean;
}

export class IntentExtractor {
  private patternMatcher: PatternMatcher;
  private logger: AILogger;
  private options: IntentExtractionOptions;

  constructor(options: Partial<IntentExtractionOptions> = {}) {
    this.patternMatcher = new PatternMatcher();
    this.logger = AILogger.getInstance();
    
    this.options = {
      minConfidence: 0.3,
      maxPatterns: 5,
      enableFallback: true,
      strictMatching: false,
      ...options
    };
  }

  /**
   * Extract trading intent from tokens
   */
  public extractIntent(tokens: Token[], originalText: string): IntentExtractionResult {
    const startTime = performance.now();
    
    this.logger.debug('IntentExtractor', 'Starting intent extraction', {
      tokenCount: tokens.length,
      textPreview: originalText.substring(0, 100)
    });

    try {
      // Step 1: Prepare token data
      const tokenTexts = tokens.map(token => token.text);
      
      // Step 2: Find matching patterns
      const patternMatches = this.patternMatcher.findMatches(tokenTexts, originalText);
      
      // Step 3: Filter and rank patterns
      const validMatches = patternMatches
        .filter(match => match.confidence >= this.options.minConfidence)
        .slice(0, this.options.maxPatterns);

      // Step 4: Extract intent components
      const intentComponents = this.extractIntentComponents(tokens, validMatches, originalText);
      
      // Step 5: Build final intent
      const intent = this.buildTradingIntent(intentComponents, validMatches);
      
      // Step 6: Calculate confidence and generate reasoning
      const confidence = this.calculateIntentConfidence(intent, validMatches, tokens);
      const reasoning = this.generateReasoning(validMatches, intentComponents);
      const suggestions = this.generateSuggestions(intent, validMatches);

      const processingTime = performance.now() - startTime;
      
      this.logger.debug('IntentExtractor', 'Intent extraction completed', {
        strategyType: intent.strategyType,
        confidence,
        patternMatches: validMatches.length,
        processingTime: `${processingTime.toFixed(2)}ms`
      });

      return {
        intent,
        confidence,
        matchedPatterns: validMatches.map(match => ({
          pattern: match.pattern,
          confidence: match.confidence,
          matchedKeywords: match.matchedKeywords
        })),
        reasoning,
        suggestions
      };

    } catch (error) {
      this.logger.error('IntentExtractor', 'Intent extraction failed', { error, originalText });
      
      // Return fallback intent
      return this.createFallbackIntent(originalText);
    }
  }

  /**
   * Extract intent components from tokens
   */
  private extractIntentComponents(
    tokens: Token[], 
    patternMatches: any[], 
    originalText: string
  ): {
    indicators: string[];
    conditions: string[];
    actions: string[];
    riskManagement: string[];
    timeframe?: string;
    symbol?: string;
    parameters: Record<string, unknown>;
  } {
    const components = {
      indicators: [] as string[],
      conditions: [] as string[],
      actions: [] as string[],
      riskManagement: [] as string[],
      timeframe: undefined as string | undefined,
      symbol: undefined as string | undefined,
      parameters: {} as Record<string, unknown>
    };

    // Extract from tokens
    for (const token of tokens) {
      switch (token.type) {
        case TokenType.INDICATOR:
          if (!components.indicators.includes(token.text)) {
            components.indicators.push(token.text);
          }
          break;
          
        case TokenType.CONDITION:
          if (!components.conditions.includes(token.text)) {
            components.conditions.push(token.text);
          }
          break;
          
        case TokenType.ACTION:
          if (!components.actions.includes(token.text)) {
            components.actions.push(token.text);
          }
          break;
          
        case TokenType.TIMEFRAME:
          if (!components.timeframe) {
            components.timeframe = token.text;
          }
          break;
          
        case TokenType.SYMBOL:
          if (!components.symbol) {
            components.symbol = token.text;
          }
          break;
          
        case TokenType.NUMBER:
          // Store numeric parameters
          if (token.metadata?.value !== undefined) {
            const key = this.inferParameterName(token, tokens);
            components.parameters[key] = token.metadata.value;
          }
          break;
          
        case TokenType.PARAMETER:
          // Handle specific parameters like stop loss, take profit
          if (token.text.includes('stop') || token.text.includes('sl')) {
            components.riskManagement.push('stop_loss');
          } else if (token.text.includes('profit') || token.text.includes('tp')) {
            components.riskManagement.push('take_profit');
          }
          break;
      }
    }

    // Infer missing components from patterns
    this.inferMissingComponents(components, patternMatches, originalText);

    return components;
  }

  /**
   * Infer parameter name from context
   */
  private inferParameterName(numberToken: Token, allTokens: Token[]): string {
    const tokenIndex = allTokens.indexOf(numberToken);
    
    // Look at surrounding tokens for context
    const contextTokens = allTokens.slice(
      Math.max(0, tokenIndex - 2), 
      Math.min(allTokens.length, tokenIndex + 3)
    );

    // Check for common parameter patterns
    const contextText = contextTokens.map(t => t.text).join(' ').toLowerCase();
    
    if (contextText.includes('period') || contextText.includes('length')) {
      return 'period';
    } else if (contextText.includes('threshold') || contextText.includes('level')) {
      return 'threshold';
    } else if (contextText.includes('stop') || contextText.includes('sl')) {
      return 'stopLoss';
    } else if (contextText.includes('profit') || contextText.includes('tp')) {
      return 'takeProfit';
    } else if (contextText.includes('%') || numberToken.text.includes('%')) {
      return 'percentage';
    }

    return `param_${tokenIndex}`;
  }

  /**
   * Infer missing components from pattern matches
   */
  private inferMissingComponents(
    components: any, 
    patternMatches: any[], 
    originalText: string
  ): void {
    if (patternMatches.length === 0) return;

    const bestMatch = patternMatches[0];
    
    // Infer actions if missing
    if (components.actions.length === 0) {
      if (originalText.includes('buy') || originalText.includes('long')) {
        components.actions.push('buy');
      }
      if (originalText.includes('sell') || originalText.includes('short')) {
        components.actions.push('sell');
      }
      
      // Default actions based on strategy type
      if (components.actions.length === 0) {
        switch (bestMatch.pattern.strategyType) {
          case StrategyType.TREND_FOLLOWING:
          case StrategyType.BREAKOUT:
          case StrategyType.MOMENTUM:
            components.actions.push('buy', 'sell');
            break;
          case StrategyType.MEAN_REVERSION:
            components.actions.push('buy_oversold', 'sell_overbought');
            break;
          case StrategyType.SCALPING:
            components.actions.push('quick_buy', 'quick_sell');
            break;
        }
      }
    }

    // Infer conditions if missing
    if (components.conditions.length === 0) {
      switch (bestMatch.pattern.strategyType) {
        case StrategyType.TREND_FOLLOWING:
          components.conditions.push('crossover');
          break;
        case StrategyType.MEAN_REVERSION:
          components.conditions.push('oversold', 'overbought');
          break;
        case StrategyType.BREAKOUT:
          components.conditions.push('breakout');
          break;
        case StrategyType.MOMENTUM:
          components.conditions.push('momentum_change');
          break;
      }
    }

    // Add risk management if mentioned
    if (originalText.includes('stop') || originalText.includes('risk')) {
      if (!components.riskManagement.includes('stop_loss')) {
        components.riskManagement.push('stop_loss');
      }
    }
    if (originalText.includes('profit') || originalText.includes('target')) {
      if (!components.riskManagement.includes('take_profit')) {
        components.riskManagement.push('take_profit');
      }
    }
  }

  /**
   * Build final trading intent
   */
  private buildTradingIntent(
    components: any, 
    patternMatches: any[]
  ): TradingIntent {
    // Determine strategy type from best pattern match
    const strategyType = patternMatches.length > 0 ? 
      patternMatches[0].pattern.strategyType : 
      StrategyType.CUSTOM;

    return {
      strategyType,
      indicators: components.indicators,
      conditions: components.conditions,
      actions: components.actions,
      riskManagement: components.riskManagement,
      timeframe: components.timeframe,
      symbol: components.symbol,
      confidence: 0, // Will be calculated separately
      parameters: components.parameters
    };
  }

  /**
   * Calculate intent confidence
   */
  private calculateIntentConfidence(
    intent: TradingIntent, 
    patternMatches: any[], 
    tokens: Token[]
  ): number {
    if (patternMatches.length === 0) return 0.1;

    // Base confidence from best pattern match
    const baseConfidence = patternMatches[0].confidence;

    // Boost for having multiple components
    let componentBoost = 0;
    if (intent.indicators.length > 0) componentBoost += 0.1;
    if (intent.conditions.length > 0) componentBoost += 0.1;
    if (intent.actions.length > 0) componentBoost += 0.1;
    if (intent.riskManagement.length > 0) componentBoost += 0.05;
    if (intent.timeframe) componentBoost += 0.05;

    // Boost for trading-specific tokens
    const tradingTokens = tokens.filter(token => 
      token.type === TokenType.INDICATOR || 
      token.type === TokenType.ACTION || 
      token.type === TokenType.CONDITION
    );
    const tradingTokenBoost = Math.min(tradingTokens.length * 0.05, 0.2);

    // Penalty for missing essential components
    let missingPenalty = 0;
    if (intent.indicators.length === 0) missingPenalty += 0.1;
    if (intent.actions.length === 0) missingPenalty += 0.15;

    const finalConfidence = Math.max(0, Math.min(1, 
      baseConfidence + componentBoost + tradingTokenBoost - missingPenalty
    ));

    return finalConfidence;
  }

  /**
   * Generate reasoning for the extracted intent
   */
  private generateReasoning(patternMatches: any[], components: any): string[] {
    const reasoning: string[] = [];

    if (patternMatches.length > 0) {
      const bestMatch = patternMatches[0];
      reasoning.push(
        `Identified as ${bestMatch.pattern.name} strategy based on keywords: ${bestMatch.matchedKeywords.join(', ')}`
      );
    }

    if (components.indicators.length > 0) {
      reasoning.push(`Found indicators: ${components.indicators.join(', ')}`);
    }

    if (components.conditions.length > 0) {
      reasoning.push(`Detected conditions: ${components.conditions.join(', ')}`);
    }

    if (components.actions.length > 0) {
      reasoning.push(`Identified actions: ${components.actions.join(', ')}`);
    }

    if (Object.keys(components.parameters).length > 0) {
      reasoning.push(`Extracted parameters: ${Object.keys(components.parameters).join(', ')}`);
    }

    return reasoning;
  }

  /**
   * Generate suggestions for improving the request
   */
  private generateSuggestions(intent: TradingIntent, patternMatches: any[]): string[] {
    const suggestions: string[] = [];

    if (intent.indicators.length === 0) {
      suggestions.push('Consider specifying which indicators to use (RSI, MACD, Moving Averages, etc.)');
    }

    if (intent.riskManagement.length === 0) {
      suggestions.push('Add risk management parameters like stop loss and take profit');
    }

    if (!intent.timeframe) {
      suggestions.push('Specify a timeframe for the strategy (1h, 4h, 1d, etc.)');
    }

    if (patternMatches.length > 0 && patternMatches[0].missingElements.length > 0) {
      suggestions.push(`Consider adding: ${patternMatches[0].missingElements.join(', ')}`);
    }

    if (intent.conditions.length === 0) {
      suggestions.push('Specify entry/exit conditions more clearly');
    }

    return suggestions;
  }

  /**
   * Create fallback intent when extraction fails
   */
  private createFallbackIntent(originalText: string): IntentExtractionResult {
    const fallbackIntent: TradingIntent = {
      strategyType: StrategyType.CUSTOM,
      indicators: [],
      conditions: [],
      actions: [],
      riskManagement: [],
      confidence: 0.1,
      parameters: {}
    };

    return {
      intent: fallbackIntent,
      confidence: 0.1,
      matchedPatterns: [],
      reasoning: ['Failed to extract clear trading intent from the request'],
      suggestions: [
        'Try rephrasing your request with specific indicators and conditions',
        'Include clear entry and exit criteria',
        'Specify what actions to take (buy, sell, etc.)'
      ]
    };
  }

  /**
   * Get extraction statistics
   */
  public getStatistics(): {
    availablePatterns: number;
    supportedStrategyTypes: StrategyType[];
    minConfidence: number;
  } {
    return {
      availablePatterns: this.patternMatcher.getAllPatterns().length,
      supportedStrategyTypes: Object.values(StrategyType),
      minConfidence: this.options.minConfidence
    };
  }
}