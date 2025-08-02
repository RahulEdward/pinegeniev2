/**
 * Trading Pattern Recognition
 * 
 * Patterns for recognizing different types of trading strategies
 * and intents from natural language requests.
 */

import { StrategyType } from '../../types/nlp-types';

export interface TradingPattern {
  id: string;
  name: string;
  strategyType: StrategyType;
  keywords: string[];
  requiredElements: string[];
  optionalElements: string[];
  confidence: number;
  examples: string[];
  description: string;
}

export const TRADING_PATTERNS: TradingPattern[] = [
  // Trend Following Patterns
  {
    id: 'ma_crossover',
    name: 'Moving Average Crossover',
    strategyType: StrategyType.TREND_FOLLOWING,
    keywords: ['moving average', 'ma', 'sma', 'ema', 'crossover', 'crosses above', 'crosses below'],
    requiredElements: ['indicator:moving_average', 'condition:crossover', 'action:buy_sell'],
    optionalElements: ['timeframe', 'stop_loss', 'take_profit'],
    confidence: 0.9,
    examples: [
      'Create a strategy where fast MA crosses above slow MA',
      'Buy when 10 SMA crosses above 20 SMA',
      'Moving average crossover strategy'
    ],
    description: 'Strategy based on moving average crossovers for trend following'
  },
  {
    id: 'trend_following_general',
    name: 'General Trend Following',
    strategyType: StrategyType.TREND_FOLLOWING,
    keywords: ['trend', 'trending', 'breakout', 'momentum', 'follow', 'direction'],
    requiredElements: ['indicator:trend', 'action:buy_sell'],
    optionalElements: ['timeframe', 'confirmation'],
    confidence: 0.7,
    examples: [
      'Create a trend following strategy',
      'Follow the trend with momentum indicators',
      'Breakout strategy for trending markets'
    ],
    description: 'General trend following strategies'
  },

  // Mean Reversion Patterns
  {
    id: 'rsi_oversold_overbought',
    name: 'RSI Oversold/Overbought',
    strategyType: StrategyType.MEAN_REVERSION,
    keywords: ['rsi', 'oversold', 'overbought', 'relative strength', '30', '70'],
    requiredElements: ['indicator:rsi', 'condition:level', 'action:buy_sell'],
    optionalElements: ['threshold', 'timeframe'],
    confidence: 0.95,
    examples: [
      'Buy when RSI is below 30',
      'RSI oversold overbought strategy',
      'Sell when RSI above 70, buy when RSI below 30'
    ],
    description: 'Mean reversion strategy using RSI overbought/oversold levels'
  },
  {
    id: 'bollinger_bands_reversion',
    name: 'Bollinger Bands Mean Reversion',
    strategyType: StrategyType.MEAN_REVERSION,
    keywords: ['bollinger bands', 'bb', 'bands', 'upper band', 'lower band', 'mean reversion'],
    requiredElements: ['indicator:bollinger_bands', 'condition:touch_band', 'action:buy_sell'],
    optionalElements: ['period', 'standard_deviation'],
    confidence: 0.9,
    examples: [
      'Buy when price touches lower Bollinger Band',
      'Sell at upper band, buy at lower band',
      'Bollinger Bands mean reversion strategy'
    ],
    description: 'Mean reversion strategy using Bollinger Bands'
  },
  {
    id: 'mean_reversion_general',
    name: 'General Mean Reversion',
    strategyType: StrategyType.MEAN_REVERSION,
    keywords: ['mean reversion', 'revert', 'bounce', 'support', 'resistance', 'oversold', 'overbought'],
    requiredElements: ['condition:level', 'action:buy_sell'],
    optionalElements: ['indicator', 'threshold'],
    confidence: 0.7,
    examples: [
      'Create a mean reversion strategy',
      'Buy oversold, sell overbought',
      'Bounce off support and resistance'
    ],
    description: 'General mean reversion strategies'
  },

  // Breakout Patterns
  {
    id: 'price_breakout',
    name: 'Price Breakout',
    strategyType: StrategyType.BREAKOUT,
    keywords: ['breakout', 'break above', 'break below', 'resistance', 'support', 'level'],
    requiredElements: ['condition:breakout', 'action:buy_sell'],
    optionalElements: ['volume', 'confirmation'],
    confidence: 0.85,
    examples: [
      'Buy when price breaks above resistance',
      'Breakout strategy above key levels',
      'Trade breakouts with volume confirmation'
    ],
    description: 'Strategy based on price breakouts above/below key levels'
  },
  {
    id: 'volatility_breakout',
    name: 'Volatility Breakout',
    strategyType: StrategyType.BREAKOUT,
    keywords: ['volatility', 'atr', 'range', 'expansion', 'squeeze'],
    requiredElements: ['indicator:volatility', 'condition:expansion', 'action:buy_sell'],
    optionalElements: ['period', 'multiplier'],
    confidence: 0.8,
    examples: [
      'Trade volatility breakouts using ATR',
      'Buy when volatility expands',
      'Range breakout strategy'
    ],
    description: 'Strategy based on volatility expansion and breakouts'
  },

  // Momentum Patterns
  {
    id: 'macd_momentum',
    name: 'MACD Momentum',
    strategyType: StrategyType.MOMENTUM,
    keywords: ['macd', 'momentum', 'signal line', 'histogram', 'divergence'],
    requiredElements: ['indicator:macd', 'condition:crossover', 'action:buy_sell'],
    optionalElements: ['histogram', 'zero_line'],
    confidence: 0.9,
    examples: [
      'Buy when MACD crosses above signal line',
      'MACD momentum strategy',
      'Trade MACD histogram divergence'
    ],
    description: 'Momentum strategy using MACD indicator'
  },
  {
    id: 'stochastic_momentum',
    name: 'Stochastic Momentum',
    strategyType: StrategyType.MOMENTUM,
    keywords: ['stochastic', 'stoch', '%k', '%d', 'momentum'],
    requiredElements: ['indicator:stochastic', 'condition:crossover', 'action:buy_sell'],
    optionalElements: ['overbought', 'oversold'],
    confidence: 0.85,
    examples: [
      'Buy when Stochastic %K crosses above %D',
      'Stochastic momentum strategy',
      'Trade stochastic crossovers'
    ],
    description: 'Momentum strategy using Stochastic oscillator'
  },

  // Scalping Patterns
  {
    id: 'quick_scalp',
    name: 'Quick Scalping',
    strategyType: StrategyType.SCALPING,
    keywords: ['scalp', 'scalping', 'quick', 'fast', 'short term', '1m', '5m'],
    requiredElements: ['timeframe:short', 'action:quick_entry_exit'],
    optionalElements: ['tight_stops', 'small_targets'],
    confidence: 0.8,
    examples: [
      'Quick scalping strategy on 1 minute chart',
      'Fast entries and exits for scalping',
      'Short term scalping with tight stops'
    ],
    description: 'High-frequency scalping strategies'
  },

  // Custom/Complex Patterns
  {
    id: 'multi_indicator',
    name: 'Multi-Indicator Strategy',
    strategyType: StrategyType.CUSTOM,
    keywords: ['multiple', 'combine', 'confirmation', 'filter', 'and', 'with'],
    requiredElements: ['indicator:multiple', 'condition:multiple', 'action:buy_sell'],
    optionalElements: ['timeframe', 'risk_management'],
    confidence: 0.7,
    examples: [
      'Combine RSI and MACD for entries',
      'Use multiple indicators for confirmation',
      'Strategy with RSI, MA, and volume'
    ],
    description: 'Complex strategies using multiple indicators'
  }
];

export class PatternMatcher {
  private patterns: TradingPattern[];

  constructor() {
    this.patterns = TRADING_PATTERNS;
  }

  /**
   * Find matching patterns for given tokens and text
   */
  public findMatches(tokens: string[], originalText: string): Array<{
    pattern: TradingPattern;
    confidence: number;
    matchedKeywords: string[];
    missingElements: string[];
  }> {
    const matches: Array<{
      pattern: TradingPattern;
      confidence: number;
      matchedKeywords: string[];
      missingElements: string[];
    }> = [];

    const normalizedText = originalText.toLowerCase();
    const normalizedTokens = tokens.map(t => t.toLowerCase());

    for (const pattern of this.patterns) {
      const matchResult = this.matchPattern(pattern, normalizedTokens, normalizedText);
      
      if (matchResult.confidence > 0.3) { // Minimum threshold
        matches.push({
          pattern,
          confidence: matchResult.confidence,
          matchedKeywords: matchResult.matchedKeywords,
          missingElements: matchResult.missingElements
        });
      }
    }

    // Sort by confidence (highest first)
    matches.sort((a, b) => b.confidence - a.confidence);

    return matches;
  }

  /**
   * Match a single pattern against tokens and text
   */
  private matchPattern(
    pattern: TradingPattern, 
    tokens: string[], 
    text: string
  ): {
    confidence: number;
    matchedKeywords: string[];
    missingElements: string[];
  } {
    let matchedKeywords: string[] = [];
    let keywordScore = 0;

    // Check keyword matches
    for (const keyword of pattern.keywords) {
      const keywordFound = tokens.some(token => token.includes(keyword.toLowerCase())) ||
                          text.includes(keyword.toLowerCase());
      
      if (keywordFound) {
        matchedKeywords.push(keyword);
        keywordScore += 1;
      }
    }

    // Calculate keyword match ratio
    const keywordRatio = keywordScore / pattern.keywords.length;

    // Check required elements
    const missingElements: string[] = [];
    let requiredScore = 0;

    for (const element of pattern.requiredElements) {
      if (this.hasElement(element, tokens, text)) {
        requiredScore += 1;
      } else {
        missingElements.push(element);
      }
    }

    const requiredRatio = requiredScore / pattern.requiredElements.length;

    // Check optional elements (bonus points)
    let optionalScore = 0;
    for (const element of pattern.optionalElements) {
      if (this.hasElement(element, tokens, text)) {
        optionalScore += 1;
      }
    }

    const optionalBonus = pattern.optionalElements.length > 0 ? 
      (optionalScore / pattern.optionalElements.length) * 0.2 : 0;

    // Calculate final confidence
    const baseConfidence = (keywordRatio * 0.6) + (requiredRatio * 0.4);
    const finalConfidence = Math.min((baseConfidence + optionalBonus) * pattern.confidence, 1.0);

    return {
      confidence: finalConfidence,
      matchedKeywords,
      missingElements
    };
  }

  /**
   * Check if a required element is present
   */
  private hasElement(element: string, tokens: string[], text: string): boolean {
    const [category, type] = element.split(':');

    switch (category) {
      case 'indicator':
        return this.hasIndicator(type, tokens, text);
      case 'condition':
        return this.hasCondition(type, tokens, text);
      case 'action':
        return this.hasAction(type, tokens, text);
      case 'timeframe':
        return this.hasTimeframe(type, tokens, text);
      default:
        return tokens.some(token => token.includes(element)) || text.includes(element);
    }
  }

  private hasIndicator(type: string, tokens: string[], text: string): boolean {
    const indicatorKeywords = {
      moving_average: ['ma', 'sma', 'ema', 'moving average', 'average'],
      rsi: ['rsi', 'relative strength'],
      macd: ['macd', 'convergence', 'divergence'],
      bollinger_bands: ['bollinger', 'bands', 'bb'],
      stochastic: ['stochastic', 'stoch'],
      trend: ['trend', 'trending', 'direction'],
      volatility: ['volatility', 'atr', 'true range'],
      multiple: ['and', 'with', 'plus', 'combine']
    };

    const keywords = indicatorKeywords[type as keyof typeof indicatorKeywords] || [];
    return keywords.some(keyword => 
      tokens.some(token => token.includes(keyword)) || text.includes(keyword)
    );
  }

  private hasCondition(type: string, tokens: string[], text: string): boolean {
    const conditionKeywords = {
      crossover: ['cross', 'crosses', 'above', 'below'],
      level: ['above', 'below', 'over', 'under', 'threshold'],
      breakout: ['break', 'breakout', 'breakthrough'],
      touch_band: ['touch', 'reaches', 'hits'],
      expansion: ['expand', 'expansion', 'increase'],
      multiple: ['and', 'when', 'if']
    };

    const keywords = conditionKeywords[type as keyof typeof conditionKeywords] || [];
    return keywords.some(keyword => 
      tokens.some(token => token.includes(keyword)) || text.includes(keyword)
    );
  }

  private hasAction(type: string, tokens: string[], text: string): boolean {
    const actionKeywords = {
      buy_sell: ['buy', 'sell', 'long', 'short', 'enter', 'exit'],
      quick_entry_exit: ['quick', 'fast', 'scalp', 'short term']
    };

    const keywords = actionKeywords[type as keyof typeof actionKeywords] || [];
    return keywords.some(keyword => 
      tokens.some(token => token.includes(keyword)) || text.includes(keyword)
    );
  }

  private hasTimeframe(type: string, tokens: string[], text: string): boolean {
    const timeframeKeywords = {
      short: ['1m', '5m', '15m', 'minute', 'short', 'quick'],
      medium: ['1h', '4h', 'hour', 'hourly'],
      long: ['1d', 'daily', 'day', 'long term']
    };

    const keywords = timeframeKeywords[type as keyof typeof timeframeKeywords] || [];
    return keywords.some(keyword => 
      tokens.some(token => token.includes(keyword)) || text.includes(keyword)
    );
  }

  /**
   * Get all available patterns
   */
  public getAllPatterns(): TradingPattern[] {
    return [...this.patterns];
  }

  /**
   * Get patterns by strategy type
   */
  public getPatternsByType(strategyType: StrategyType): TradingPattern[] {
    return this.patterns.filter(pattern => pattern.strategyType === strategyType);
  }

  /**
   * Add custom pattern
   */
  public addPattern(pattern: TradingPattern): void {
    this.patterns.push(pattern);
  }
}