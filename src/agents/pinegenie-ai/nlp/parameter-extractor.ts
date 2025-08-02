/**
 * Parameter Extractor
 * 
 * Extracts and validates trading parameters from natural language
 * requests, including numeric values, thresholds, and configuration options.
 */

import { StrategyParameters, ParameterValue, Token, TokenType, Entity, EntityType } from '../types/nlp-types';
import { AILogger } from '../core/logger';

export interface ParameterExtractionResult {
  parameters: StrategyParameters;
  confidence: number;
  extractedCount: number;
  validationErrors: string[];
  suggestions: string[];
}

export interface ParameterDefinition {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'array';
  defaultValue: unknown;
  range?: [number, number];
  options?: unknown[];
  description: string;
  aliases: string[];
  validation?: (value: unknown) => boolean;
}

export interface ParameterExtractionOptions {
  enableTypeCoercion: boolean;
  enableRangeValidation: boolean;
  enableDefaultValues: boolean;
  strictValidation: boolean;
}

export class ParameterExtractor {
  private logger: AILogger;
  private options: ParameterExtractionOptions;
  
  // Common trading parameter definitions
  private readonly parameterDefinitions: ParameterDefinition[] = [
    {
      name: 'period',
      type: 'number',
      defaultValue: 14,
      range: [1, 200],
      description: 'Period for indicator calculation',
      aliases: ['length', 'window', 'lookback', 'days', 'bars'],
      validation: (value) => Number.isInteger(Number(value)) && Number(value) > 0
    },
    {
      name: 'threshold',
      type: 'number',
      defaultValue: 50,
      range: [0, 100],
      description: 'Threshold level for conditions',
      aliases: ['level', 'limit', 'boundary', 'value'],
      validation: (value) => typeof value === 'number' && value >= 0
    },
    {
      name: 'stopLoss',
      type: 'number',
      defaultValue: 2.0,
      range: [0.1, 20],
      description: 'Stop loss percentage',
      aliases: ['sl', 'stop', 'max loss', 'risk limit', 'stop loss'],
      validation: (value) => typeof value === 'number' && value > 0
    },
    {
      name: 'takeProfit',
      type: 'number',
      defaultValue: 4.0,
      range: [0.1, 50],
      description: 'Take profit percentage',
      aliases: ['tp', 'profit target', 'target', 'profit limit', 'take profit'],
      validation: (value) => typeof value === 'number' && value > 0
    },
    {
      name: 'oversoldLevel',
      type: 'number',
      defaultValue: 30,
      range: [10, 40],
      description: 'Oversold threshold for oscillators',
      aliases: ['oversold', 'oversold level', 'buy level'],
      validation: (value) => typeof value === 'number' && value >= 10 && value <= 40
    },
    {
      name: 'overboughtLevel',
      type: 'number',
      defaultValue: 70,
      range: [60, 90],
      description: 'Overbought threshold for oscillators',
      aliases: ['overbought', 'overbought level', 'sell level'],
      validation: (value) => typeof value === 'number' && value >= 60 && value <= 90
    },
    {
      name: 'fastPeriod',
      type: 'number',
      defaultValue: 12,
      range: [5, 50],
      description: 'Fast period for MACD',
      aliases: ['fast', 'fast length', 'fast ma'],
      validation: (value) => Number.isInteger(Number(value)) && Number(value) > 0
    },
    {
      name: 'slowPeriod',
      type: 'number',
      defaultValue: 26,
      range: [10, 100],
      description: 'Slow period for MACD',
      aliases: ['slow', 'slow length', 'slow ma'],
      validation: (value) => Number.isInteger(Number(value)) && Number(value) > 0
    },
    {
      name: 'signalPeriod',
      type: 'number',
      defaultValue: 9,
      range: [3, 30],
      description: 'Signal line period',
      aliases: ['signal', 'signal length', 'signal line'],
      validation: (value) => Number.isInteger(Number(value)) && Number(value) > 0
    },
    {
      name: 'standardDeviation',
      type: 'number',
      defaultValue: 2.0,
      range: [1.0, 3.0],
      description: 'Standard deviation multiplier for Bollinger Bands',
      aliases: ['stddev', 'std dev', 'deviation', 'multiplier'],
      validation: (value) => typeof value === 'number' && value > 0
    },
    {
      name: 'timeframe',
      type: 'string',
      defaultValue: '1h',
      options: ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'],
      description: 'Chart timeframe',
      aliases: ['tf', 'interval', 'period'],
      validation: (value) => ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'].includes(String(value))
    },
    {
      name: 'symbol',
      type: 'string',
      defaultValue: 'BTCUSDT',
      description: 'Trading symbol',
      aliases: ['pair', 'instrument', 'asset'],
      validation: (value) => typeof value === 'string' && value.length >= 3
    },
    {
      name: 'quantity',
      type: 'string',
      defaultValue: '10%',
      description: 'Position size',
      aliases: ['size', 'amount', 'position', 'qty'],
      validation: (value) => typeof value === 'string' && (value.includes('%') || !isNaN(Number(value)))
    }
  ];

  constructor(options: Partial<ParameterExtractionOptions> = {}) {
    this.logger = AILogger.getInstance();
    
    this.options = {
      enableTypeCoercion: true,
      enableRangeValidation: true,
      enableDefaultValues: true,
      strictValidation: false,
      ...options
    };
  }

  /**
   * Extract parameters from tokens and entities
   */
  public extractParameters(
    tokens: Token[], 
    entities: Entity[], 
    originalText: string
  ): ParameterExtractionResult {
    const startTime = performance.now();
    
    this.logger.debug('ParameterExtractor', 'Starting parameter extraction', {
      tokenCount: tokens.length,
      entityCount: entities.length
    });

    try {
      const parameters: StrategyParameters = {};
      const validationErrors: string[] = [];
      const suggestions: string[] = [];

      // Step 1: Extract from entities (most reliable)
      this.extractFromEntities(entities, parameters, validationErrors);

      // Step 2: Extract from token patterns
      this.extractFromTokenPatterns(tokens, originalText, parameters, validationErrors);

      // Step 3: Extract contextual parameters
      this.extractContextualParameters(tokens, originalText, parameters, validationErrors);

      // Step 4: Apply defaults for missing parameters
      if (this.options.enableDefaultValues) {
        this.applyDefaultParameters(parameters, tokens, originalText);
      }

      // Step 5: Validate all parameters
      if (this.options.enableRangeValidation) {
        this.validateParameters(parameters, validationErrors);
      }

      // Step 6: Generate suggestions
      this.generateParameterSuggestions(parameters, suggestions, originalText);

      const extractedCount = Object.keys(parameters).length;
      const confidence = this.calculateParameterConfidence(parameters, validationErrors, tokens);

      const processingTime = performance.now() - startTime;
      
      this.logger.debug('ParameterExtractor', 'Parameter extraction completed', {
        extractedCount,
        confidence,
        validationErrors: validationErrors.length,
        processingTime: `${processingTime.toFixed(2)}ms`
      });

      return {
        parameters,
        confidence,
        extractedCount,
        validationErrors,
        suggestions
      };

    } catch (error) {
      this.logger.error('ParameterExtractor', 'Parameter extraction failed', { error });
      
      return {
        parameters: {},
        confidence: 0,
        extractedCount: 0,
        validationErrors: ['Parameter extraction failed'],
        suggestions: ['Please specify parameters more clearly']
      };
    }
  }

  /**
   * Extract parameters from entities
   */
  private extractFromEntities(
    entities: Entity[], 
    parameters: StrategyParameters, 
    validationErrors: string[]
  ): void {
    for (const entity of entities) {
      switch (entity.type) {
        case EntityType.PARAMETER_VALUE:
          this.extractNumericParameter(entity, parameters, validationErrors);
          break;
          
        case EntityType.THRESHOLD:
          parameters.threshold = this.createParameterValue(entity.value, 'number', entity.confidence, 'explicit');
          break;
          
        case EntityType.TIMEFRAME:
          parameters.timeframe = this.createParameterValue(entity.value, 'string', entity.confidence, 'explicit');
          break;
          
        case EntityType.SYMBOL:
          parameters.symbol = this.createParameterValue(entity.value, 'string', entity.confidence, 'explicit');
          break;
          
        case EntityType.PERCENTAGE:
          this.extractPercentageParameter(entity, parameters, validationErrors);
          break;
      }
    }
  }

  /**
   * Extract numeric parameter with context
   */
  private extractNumericParameter(
    entity: Entity, 
    parameters: StrategyParameters, 
    validationErrors: string[]
  ): void {
    const value = Number(entity.value);
    
    // Try to infer parameter name from context
    const parameterName = this.inferParameterName(entity.text, entity);
    
    if (parameterName) {
      const paramDef = this.findParameterDefinition(parameterName);
      
      if (paramDef && this.validateParameterValue(value, paramDef)) {
        parameters[parameterName] = this.createParameterValue(value, 'number', entity.confidence, 'explicit');
      } else {
        validationErrors.push(`Invalid value ${value} for parameter ${parameterName}`);
      }
    } else {
      // Store as generic numeric parameter
      const genericKey = `numericParam_${Object.keys(parameters).length}`;
      parameters[genericKey] = this.createParameterValue(value, 'number', entity.confidence * 0.7, 'inferred');
    }
  }

  /**
   * Extract percentage parameter
   */
  private extractPercentageParameter(
    entity: Entity, 
    parameters: StrategyParameters, 
    validationErrors: string[]
  ): void {
    const value = Number(entity.value);
    
    // Common percentage parameters
    if (entity.text.toLowerCase().includes('stop') || entity.text.toLowerCase().includes('sl')) {
      parameters.stopLoss = this.createParameterValue(value, 'number', entity.confidence, 'explicit');
    } else if (entity.text.toLowerCase().includes('profit') || entity.text.toLowerCase().includes('tp')) {
      parameters.takeProfit = this.createParameterValue(value, 'number', entity.confidence, 'explicit');
    } else if (entity.text.toLowerCase().includes('size') || entity.text.toLowerCase().includes('quantity')) {
      parameters.quantity = this.createParameterValue(`${value}%`, 'string', entity.confidence, 'explicit');
    } else {
      // Generic percentage
      parameters.percentage = this.createParameterValue(value, 'number', entity.confidence, 'inferred');
    }
  }

  /**
   * Extract parameters from token patterns
   */
  private extractFromTokenPatterns(
    tokens: Token[], 
    originalText: string, 
    parameters: StrategyParameters, 
    validationErrors: string[]
  ): void {
    const text = originalText.toLowerCase();

    // Pattern: "RSI 14" or "RSI with period 14"
    const rsiPeriodMatch = text.match(/rsi\s*(?:with\s*period\s*)?(\d+)/);
    if (rsiPeriodMatch) {
      const period = parseInt(rsiPeriodMatch[1]);
      parameters.period = this.createParameterValue(period, 'number', 0.9, 'explicit');
    }

    // Pattern: "SMA 20" or "20 period SMA"
    const smaPeriodMatch = text.match(/(?:sma|simple moving average)\s*(\d+)|(\d+)\s*(?:period\s*)?(?:sma|simple moving average)/);
    if (smaPeriodMatch) {
      const period = parseInt(smaPeriodMatch[1] || smaPeriodMatch[2]);
      parameters.period = this.createParameterValue(period, 'number', 0.9, 'explicit');
    }

    // Pattern: "stop loss 2%" or "2% stop loss"
    const stopLossMatch = text.match(/(?:stop\s*loss|sl)\s*(\d+(?:\.\d+)?)%?|(\d+(?:\.\d+)?)%?\s*(?:stop\s*loss|sl)/);
    if (stopLossMatch) {
      const value = parseFloat(stopLossMatch[1] || stopLossMatch[2]);
      parameters.stopLoss = this.createParameterValue(value, 'number', 0.9, 'explicit');
    }

    // Pattern: "take profit 5%" or "5% take profit"
    const takeProfitMatch = text.match(/(?:take\s*profit|tp)\s*(\d+(?:\.\d+)?)%?|(\d+(?:\.\d+)?)%?\s*(?:take\s*profit|tp)/);
    if (takeProfitMatch) {
      const value = parseFloat(takeProfitMatch[1] || takeProfitMatch[2]);
      parameters.takeProfit = this.createParameterValue(value, 'number', 0.9, 'explicit');
    }

    // Pattern: "oversold 30" or "overbought 70"
    const oversoldMatch = text.match(/oversold\s*(?:at\s*|level\s*)?(\d+)/);
    if (oversoldMatch) {
      const value = parseInt(oversoldMatch[1]);
      parameters.oversoldLevel = this.createParameterValue(value, 'number', 0.8, 'explicit');
    }

    const overboughtMatch = text.match(/overbought\s*(?:at\s*|level\s*)?(\d+)/);
    if (overboughtMatch) {
      const value = parseInt(overboughtMatch[1]);
      parameters.overboughtLevel = this.createParameterValue(value, 'number', 0.8, 'explicit');
    }
  }

  /**
   * Extract contextual parameters
   */
  private extractContextualParameters(
    tokens: Token[], 
    originalText: string, 
    parameters: StrategyParameters, 
    validationErrors: string[]
  ): void {
    const text = originalText.toLowerCase();

    // Infer timeframe from context
    if (!parameters.timeframe) {
      if (text.includes('scalp') || text.includes('quick') || text.includes('fast')) {
        parameters.timeframe = this.createParameterValue('5m', 'string', 0.7, 'inferred');
      } else if (text.includes('swing') || text.includes('daily')) {
        parameters.timeframe = this.createParameterValue('1d', 'string', 0.7, 'inferred');
      } else if (text.includes('intraday') || text.includes('hourly')) {
        parameters.timeframe = this.createParameterValue('1h', 'string', 0.7, 'inferred');
      }
    }

    // Infer risk parameters from strategy type
    if (text.includes('conservative') && !parameters.stopLoss) {
      parameters.stopLoss = this.createParameterValue(1.5, 'number', 0.6, 'inferred');
    } else if (text.includes('aggressive') && !parameters.stopLoss) {
      parameters.stopLoss = this.createParameterValue(3.0, 'number', 0.6, 'inferred');
    }

    // Infer quantity from risk level
    if (!parameters.quantity) {
      if (text.includes('small') || text.includes('conservative')) {
        parameters.quantity = this.createParameterValue('5%', 'string', 0.6, 'inferred');
      } else if (text.includes('large') || text.includes('aggressive')) {
        parameters.quantity = this.createParameterValue('20%', 'string', 0.6, 'inferred');
      }
    }
  }

  /**
   * Apply default parameters
   */
  private applyDefaultParameters(
    parameters: StrategyParameters, 
    tokens: Token[], 
    originalText: string
  ): void {
    const text = originalText.toLowerCase();

    // Apply defaults based on mentioned indicators
    if (text.includes('rsi') && !parameters.period) {
      parameters.period = this.createParameterValue(14, 'number', 0.5, 'default');
    }

    if (text.includes('rsi') && !parameters.oversoldLevel) {
      parameters.oversoldLevel = this.createParameterValue(30, 'number', 0.5, 'default');
    }

    if (text.includes('rsi') && !parameters.overboughtLevel) {
      parameters.overboughtLevel = this.createParameterValue(70, 'number', 0.5, 'default');
    }

    if ((text.includes('sma') || text.includes('moving average')) && !parameters.period) {
      parameters.period = this.createParameterValue(20, 'number', 0.5, 'default');
    }

    if (text.includes('macd') && !parameters.fastPeriod) {
      parameters.fastPeriod = this.createParameterValue(12, 'number', 0.5, 'default');
      parameters.slowPeriod = this.createParameterValue(26, 'number', 0.5, 'default');
      parameters.signalPeriod = this.createParameterValue(9, 'number', 0.5, 'default');
    }

    // Default risk management
    if (!parameters.stopLoss && (text.includes('stop') || text.includes('risk'))) {
      parameters.stopLoss = this.createParameterValue(2.0, 'number', 0.5, 'default');
    }

    if (!parameters.takeProfit && (text.includes('profit') || text.includes('target'))) {
      parameters.takeProfit = this.createParameterValue(4.0, 'number', 0.5, 'default');
    }
  }

  /**
   * Validate parameters against definitions
   */
  private validateParameters(
    parameters: StrategyParameters, 
    validationErrors: string[]
  ): void {
    for (const [name, paramValue] of Object.entries(parameters)) {
      const definition = this.findParameterDefinition(name);
      
      if (definition) {
        if (!this.validateParameterValue(paramValue.value, definition)) {
          validationErrors.push(`Parameter ${name} value ${paramValue.value} is outside valid range`);
        }
      }
    }

    // Cross-parameter validation
    if (parameters.fastPeriod && parameters.slowPeriod) {
      const fastValue = Number(parameters.fastPeriod.value);
      const slowValue = Number(parameters.slowPeriod.value);
      
      if (fastValue >= slowValue) {
        validationErrors.push('Fast period must be less than slow period for MACD');
      }
    }

    if (parameters.oversoldLevel && parameters.overboughtLevel) {
      const oversold = Number(parameters.oversoldLevel.value);
      const overbought = Number(parameters.overboughtLevel.value);
      
      if (oversold >= overbought) {
        validationErrors.push('Oversold level must be less than overbought level');
      }
    }
  }

  /**
   * Generate parameter suggestions
   */
  private generateParameterSuggestions(
    parameters: StrategyParameters, 
    suggestions: string[], 
    originalText: string
  ): void {
    const text = originalText.toLowerCase();

    if (text.includes('rsi') && !parameters.oversoldLevel && !parameters.overboughtLevel) {
      suggestions.push('Consider specifying RSI levels (e.g., "buy when RSI below 30")');
    }

    if ((text.includes('moving average') || text.includes('sma') || text.includes('ema')) && !parameters.period) {
      suggestions.push('Specify the moving average period (e.g., "20-period SMA")');
    }

    if (!parameters.stopLoss && !parameters.takeProfit) {
      suggestions.push('Add risk management parameters like stop loss and take profit');
    }

    if (!parameters.timeframe) {
      suggestions.push('Specify a timeframe for the strategy (1h, 4h, 1d, etc.)');
    }

    if (Object.keys(parameters).length < 3) {
      suggestions.push('Provide more specific parameters for better strategy customization');
    }
  }

  /**
   * Helper methods
   */
  private createParameterValue(
    value: unknown, 
    type: 'number' | 'string' | 'boolean' | 'array', 
    confidence: number, 
    source: 'explicit' | 'inferred' | 'default'
  ): ParameterValue {
    return {
      value,
      type,
      confidence,
      source
    };
  }

  private inferParameterName(text: string, entity: Entity): string | null {
    const lowerText = text.toLowerCase();
    
    for (const definition of this.parameterDefinitions) {
      if (definition.aliases.some(alias => lowerText.includes(alias.toLowerCase()))) {
        return definition.name;
      }
    }

    return null;
  }

  private findParameterDefinition(name: string): ParameterDefinition | null {
    return this.parameterDefinitions.find(def => def.name === name) || null;
  }

  private validateParameterValue(value: unknown, definition: ParameterDefinition): boolean {
    if (definition.validation) {
      return definition.validation(value);
    }

    if (definition.range && typeof value === 'number') {
      return value >= definition.range[0] && value <= definition.range[1];
    }

    if (definition.options) {
      return definition.options.includes(value);
    }

    return true;
  }

  private calculateParameterConfidence(
    parameters: StrategyParameters, 
    validationErrors: string[], 
    tokens: Token[]
  ): number {
    if (Object.keys(parameters).length === 0) return 0;

    // Base confidence from parameter values
    const parameterConfidences = Object.values(parameters).map(p => p.confidence);
    const averageConfidence = parameterConfidences.reduce((sum, conf) => sum + conf, 0) / parameterConfidences.length;

    // Penalty for validation errors
    const errorPenalty = validationErrors.length * 0.1;

    // Boost for explicit parameters
    const explicitParams = Object.values(parameters).filter(p => p.source === 'explicit').length;
    const explicitBoost = explicitParams * 0.05;

    return Math.max(0, Math.min(1, averageConfidence - errorPenalty + explicitBoost));
  }

  /**
   * Get parameter definitions
   */
  public getParameterDefinitions(): ParameterDefinition[] {
    return [...this.parameterDefinitions];
  }

  /**
   * Add custom parameter definition
   */
  public addParameterDefinition(definition: ParameterDefinition): void {
    this.parameterDefinitions.push(definition);
  }
}