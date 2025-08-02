/**
 * Mean Reversion Strategy Patterns
 * 
 * Comprehensive database of mean-reversion trading patterns and strategies.
 */

export interface MeanReversionPattern {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  indicators: string[];
  entryConditions: string[];
  exitConditions: string[];
  riskManagement: string[];
  timeframes: string[];
  marketConditions: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  successRate: number;
  riskLevel: 'low' | 'medium' | 'high';
  examples: string[];
  variations: string[];
}

export const MEAN_REVERSION_PATTERNS: MeanReversionPattern[] = [
  {
    id: 'rsi_oversold_overbought',
    name: 'RSI Oversold/Overbought',
    description: 'Classic mean reversion using RSI overbought and oversold levels',
    keywords: ['rsi', 'oversold', 'overbought', 'mean reversion', '30', '70', 'relative strength'],
    indicators: ['rsi'],
    entryConditions: [
      'rsi_below_30',
      'rsi_above_70',
      'price_at_support_resistance',
      'volume_confirmation'
    ],
    exitConditions: [
      'rsi_returns_to_50',
      'rsi_opposite_extreme',
      'price_target_reached'
    ],
    riskManagement: ['tight_stop_loss', 'position_sizing', 'market_regime_filter'],
    timeframes: ['15m', '1h', '4h', '1d'],
    marketConditions: ['ranging', 'low_volatility', 'sideways'],
    difficulty: 'beginner',
    successRate: 0.68,
    riskLevel: 'medium',
    examples: [
      'Buy when RSI drops below 30',
      'Sell when RSI rises above 70',
      'RSI mean reversion with 14 period'
    ],
    variations: [
      'RSI with Bollinger Bands',
      'Multi-timeframe RSI',
      'RSI divergence strategy'
    ]
  },
  {
    id: 'bollinger_band_bounce',
    name: 'Bollinger Band Bounce',
    description: 'Trade bounces off Bollinger Band extremes back to the mean',
    keywords: ['bollinger bands', 'bb', 'bounce', 'upper band', 'lower band', 'squeeze', 'expansion'],
    indicators: ['bollinger_bands', 'rsi'],
    entryConditions: [
      'price_touches_lower_band',
      'price_touches_upper_band',
      'band_squeeze_ending',
      'rsi_confirmation'
    ],
    exitConditions: [
      'price_reaches_middle_band',
      'price_reaches_opposite_band',
      'band_expansion_ends'
    ],
    riskManagement: ['stop_outside_bands', 'partial_profits', 'volatility_filter'],
    timeframes: ['5m', '15m', '1h', '4h'],
    marketConditions: ['ranging', 'low_volatility', 'mean_reverting'],
    difficulty: 'intermediate',
    successRate: 0.72,
    riskLevel: 'medium',
    examples: [
      'Buy at lower Bollinger Band, sell at upper band',
      'Trade BB squeeze breakouts and reversions',
      'Use 20-period BB with 2 standard deviations'
    ],
    variations: [
      'BB with RSI confirmation',
      'Multiple timeframe BB',
      'BB percentage strategy'
    ]
  },
  {
    id: 'stochastic_extremes',
    name: 'Stochastic Extremes',
    description: 'Mean reversion using Stochastic oscillator extreme readings',
    keywords: ['stochastic', 'stoch', 'oversold', 'overbought', '%k', '%d', 'crossover'],
    indicators: ['stochastic', 'moving_average'],
    entryConditions: [
      'stoch_below_20',
      'stoch_above_80',
      'stoch_k_crosses_d',
      'price_near_support_resistance'
    ],
    exitConditions: [
      'stoch_returns_to_50',
      'stoch_opposite_extreme',
      'stoch_divergence'
    ],
    riskManagement: ['quick_stops', 'small_position_size', 'trend_filter'],
    timeframes: ['5m', '15m', '1h'],
    marketConditions: ['ranging', 'choppy', 'sideways'],
    difficulty: 'intermediate',
    successRate: 0.65,
    riskLevel: 'medium',
    examples: [
      'Buy when Stochastic below 20 and rising',
      'Sell when Stochastic above 80 and falling',
      'Use 14-period Stochastic with 3-period smoothing'
    ],
    variations: [
      'Slow Stochastic strategy',
      'Stochastic with MA filter',
      'Multiple timeframe Stochastic'
    ]
  },
  {
    id: 'support_resistance_bounce',
    name: 'Support/Resistance Bounce',
    description: 'Trade bounces off key support and resistance levels',
    keywords: ['support', 'resistance', 'bounce', 'level', 'horizontal', 'key level'],
    indicators: ['support_resistance_levels', 'volume', 'rsi'],
    entryConditions: [
      'price_bounces_off_support',
      'price_bounces_off_resistance',
      'volume_confirmation',
      'multiple_touches'
    ],
    exitConditions: [
      'price_reaches_opposite_level',
      'level_breaks',
      'momentum_fades'
    ],
    riskManagement: ['stop_beyond_level', 'position_sizing', 'level_strength_filter'],
    timeframes: ['1h', '4h', '1d'],
    marketConditions: ['ranging', 'established_levels', 'sideways'],
    difficulty: 'intermediate',
    successRate: 0.70,
    riskLevel: 'medium',
    examples: [
      'Buy bounces off major support levels',
      'Sell bounces off key resistance',
      'Trade between well-defined levels'
    ],
    variations: [
      'Fibonacci retracement levels',
      'Pivot point bounces',
      'Volume profile levels'
    ]
  },
  {
    id: 'mean_reversion_pullback',
    name: 'Mean Reversion Pullback',
    description: 'Trade pullbacks to moving averages in ranging markets',
    keywords: ['pullback', 'retracement', 'moving average', 'mean', 'regression'],
    indicators: ['sma_20', 'ema_50', 'rsi', 'macd'],
    entryConditions: [
      'price_pulls_back_to_ma',
      'ma_acting_as_support_resistance',
      'oscillator_extreme',
      'volume_drying_up'
    ],
    exitConditions: [
      'price_returns_to_range_extreme',
      'ma_breaks',
      'oscillator_normalizes'
    ],
    riskManagement: ['tight_stop_beyond_ma', 'quick_profits', 'range_filter'],
    timeframes: ['15m', '1h', '4h'],
    marketConditions: ['ranging', 'sideways', 'consolidating'],
    difficulty: 'advanced',
    successRate: 0.73,
    riskLevel: 'low',
    examples: [
      'Buy pullbacks to 20 SMA in range',
      'Sell bounces off 50 EMA resistance',
      'Trade MA mean reversion with RSI'
    ],
    variations: [
      'Multiple MA system',
      'VWAP mean reversion',
      'Linear regression mean reversion'
    ]
  },
  {
    id: 'contrarian_sentiment',
    name: 'Contrarian Sentiment Strategy',
    description: 'Trade against extreme sentiment and positioning',
    keywords: ['contrarian', 'sentiment', 'extreme', 'vix', 'put_call_ratio', 'fear_greed'],
    indicators: ['vix', 'put_call_ratio', 'rsi', 'bollinger_bands'],
    entryConditions: [
      'extreme_fear_reading',
      'extreme_greed_reading',
      'high_vix_with_oversold',
      'sentiment_divergence'
    ],
    exitConditions: [
      'sentiment_normalizes',
      'technical_resistance',
      'momentum_shifts'
    ],
    riskManagement: ['wide_stops', 'small_size', 'time_stops'],
    timeframes: ['1d', '1w'],
    marketConditions: ['extreme_sentiment', 'market_stress', 'capitulation'],
    difficulty: 'advanced',
    successRate: 0.75,
    riskLevel: 'high',
    examples: [
      'Buy when VIX spikes above 30',
      'Sell when put/call ratio extremely low',
      'Trade against extreme fear/greed readings'
    ],
    variations: [
      'News sentiment analysis',
      'Social media sentiment',
      'Institutional positioning'
    ]
  }
];

export class MeanReversionPatternMatcher {
  private patterns: MeanReversionPattern[];

  constructor() {
    this.patterns = MEAN_REVERSION_PATTERNS;
  }

  /**
   * Find matching mean reversion patterns
   */
  public findMatches(
    keywords: string[],
    indicators: string[],
    conditions: string[]
  ): Array<{
    pattern: MeanReversionPattern;
    confidence: number;
    matchedKeywords: string[];
    matchedIndicators: string[];
  }> {
    const matches: Array<{
      pattern: MeanReversionPattern;
      confidence: number;
      matchedKeywords: string[];
      matchedIndicators: string[];
    }> = [];

    for (const pattern of this.patterns) {
      const matchResult = this.calculateMatch(pattern, keywords, indicators, conditions);
      
      if (matchResult.confidence > 0.3) {
        matches.push(matchResult);
      }
    }

    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get patterns by market condition
   */
  public getPatternsByMarketCondition(condition: string): MeanReversionPattern[] {
    return this.patterns.filter(pattern => 
      pattern.marketConditions.some(mc => mc.toLowerCase().includes(condition.toLowerCase()))
    );
  }

  /**
   * Get patterns by success rate
   */
  public getPatternsBySuccessRate(minRate: number): MeanReversionPattern[] {
    return this.patterns.filter(pattern => pattern.successRate >= minRate);
  }

  private calculateMatch(
    pattern: MeanReversionPattern,
    keywords: string[],
    indicators: string[],
    conditions: string[]
  ): {
    pattern: MeanReversionPattern;
    confidence: number;
    matchedKeywords: string[];
    matchedIndicators: string[];
  } {
    const matchedKeywords: string[] = [];
    const matchedIndicators: string[] = [];

    // Calculate keyword matches
    let keywordScore = 0;
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();
      const found = pattern.keywords.some(patternKeyword => 
        patternKeyword.toLowerCase().includes(keywordLower) ||
        keywordLower.includes(patternKeyword.toLowerCase())
      );
      
      if (found) {
        matchedKeywords.push(keyword);
        keywordScore += 1;
      }
    }

    // Calculate indicator matches
    let indicatorScore = 0;
    for (const indicator of indicators) {
      const indicatorLower = indicator.toLowerCase();
      const found = pattern.indicators.some(patternIndicator => 
        patternIndicator.toLowerCase().includes(indicatorLower) ||
        indicatorLower.includes(patternIndicator.toLowerCase())
      );
      
      if (found) {
        matchedIndicators.push(indicator);
        indicatorScore += 1;
      }
    }

    // Calculate condition matches
    let conditionScore = 0;
    for (const condition of conditions) {
      const conditionLower = condition.toLowerCase();
      const found = pattern.entryConditions.some(patternCondition => 
        patternCondition.toLowerCase().includes(conditionLower) ||
        conditionLower.includes(patternCondition.toLowerCase())
      );
      
      if (found) {
        conditionScore += 1;
      }
    }

    // Calculate overall confidence
    const keywordRatio = pattern.keywords.length > 0 ? keywordScore / pattern.keywords.length : 0;
    const indicatorRatio = pattern.indicators.length > 0 ? indicatorScore / pattern.indicators.length : 0;
    const conditionRatio = pattern.entryConditions.length > 0 ? conditionScore / pattern.entryConditions.length : 0;

    const confidence = (keywordRatio * 0.4) + (indicatorRatio * 0.4) + (conditionRatio * 0.2);

    return {
      pattern,
      confidence: Math.min(confidence, 1.0),
      matchedKeywords,
      matchedIndicators
    };
  }

  /**
   * Get all patterns
   */
  public getAllPatterns(): MeanReversionPattern[] {
    return [...this.patterns];
  }

  /**
   * Add custom pattern
   */
  public addPattern(pattern: MeanReversionPattern): void {
    this.patterns.push(pattern);
  }
}