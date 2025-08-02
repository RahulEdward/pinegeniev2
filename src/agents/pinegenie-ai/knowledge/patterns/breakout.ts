/**
 * Breakout Strategy Patterns
 * 
 * Comprehensive database of breakout trading patterns and strategies.
 */

export interface BreakoutPattern {
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

export const BREAKOUT_PATTERNS: BreakoutPattern[] = [
  {
    id: 'resistance_breakout',
    name: 'Resistance Level Breakout',
    description: 'Trade breakouts above established resistance levels with volume confirmation',
    keywords: ['breakout', 'resistance', 'break above', 'volume', 'level', 'breakthrough'],
    indicators: ['volume', 'atr', 'rsi'],
    entryConditions: [
      'price_breaks_resistance',
      'volume_surge',
      'strong_momentum',
      'no_immediate_rejection'
    ],
    exitConditions: [
      'momentum_fades',
      'volume_dries_up',
      'pullback_to_breakout_level',
      'next_resistance_reached'
    ],
    riskManagement: ['stop_below_breakout_level', 'position_sizing', 'false_breakout_filter'],
    timeframes: ['15m', '1h', '4h', '1d'],
    marketConditions: ['consolidating', 'range_bound', 'accumulation'],
    difficulty: 'beginner',
    successRate: 0.65,
    riskLevel: 'medium',
    examples: [
      'Buy breakout above key resistance with volume',
      'Enter on break of previous high',
      'Trade resistance breakout with momentum confirmation'
    ],
    variations: [
      'Multiple resistance level breaks',
      'Diagonal resistance breakouts',
      'Volume-weighted breakouts'
    ]
  },
  {
    id: 'triangle_breakout',
    name: 'Triangle Pattern Breakout',
    description: 'Trade breakouts from triangle consolidation patterns',
    keywords: ['triangle', 'wedge', 'pennant', 'consolidation', 'compression', 'apex'],
    indicators: ['volume', 'bollinger_bands', 'atr'],
    entryConditions: [
      'triangle_pattern_complete',
      'breakout_direction_clear',
      'volume_expansion',
      'volatility_contraction_ending'
    ],
    exitConditions: [
      'measured_move_complete',
      'momentum_divergence',
      'return_to_pattern'
    ],
    riskManagement: ['stop_inside_triangle', 'measured_move_target', 'pattern_invalidation'],
    timeframes: ['1h', '4h', '1d'],
    marketConditions: ['consolidating', 'low_volatility', 'indecision'],
    difficulty: 'intermediate',
    successRate: 0.70,
    riskLevel: 'medium',
    examples: [
      'Trade ascending triangle breakouts',
      'Enter on symmetrical triangle break',
      'Use descending triangle for short entries'
    ],
    variations: [
      'Ascending triangle breakout',
      'Descending triangle breakout',
      'Symmetrical triangle breakout'
    ]
  },
  {
    id: 'range_breakout',
    name: 'Trading Range Breakout',
    description: 'Trade breakouts from established trading ranges',
    keywords: ['range', 'box', 'rectangle', 'sideways', 'horizontal', 'channel'],
    indicators: ['volume', 'rsi', 'bollinger_bands'],
    entryConditions: [
      'clear_range_established',
      'multiple_touches_of_levels',
      'breakout_with_volume',
      'momentum_confirmation'
    ],
    exitConditions: [
      'range_height_measured_move',
      'momentum_exhaustion',
      'false_breakout_reversal'
    ],
    riskManagement: ['stop_back_in_range', 'position_sizing', 'time_stop'],
    timeframes: ['30m', '1h', '4h'],
    marketConditions: ['sideways', 'range_bound', 'consolidation'],
    difficulty: 'beginner',
    successRate: 0.68,
    riskLevel: 'medium',
    examples: [
      'Buy breakout above range high',
      'Sell breakdown below range low',
      'Trade rectangular pattern breakouts'
    ],
    variations: [
      'Expanding range breakouts',
      'Contracting range breakouts',
      'Multiple timeframe ranges'
    ]
  },
  {
    id: 'volatility_breakout',
    name: 'Volatility Expansion Breakout',
    description: 'Trade breakouts when volatility expands after compression',
    keywords: ['volatility', 'expansion', 'compression', 'atr', 'squeeze', 'explosion'],
    indicators: ['atr', 'bollinger_bands', 'volume'],
    entryConditions: [
      'volatility_compression',
      'atr_at_low_levels',
      'bollinger_band_squeeze',
      'volume_surge_on_breakout'
    ],
    exitConditions: [
      'volatility_returns_to_normal',
      'atr_expansion_complete',
      'momentum_fades'
    ],
    riskManagement: ['atr_based_stops', 'volatility_position_sizing', 'time_based_exits'],
    timeframes: ['5m', '15m', '1h', '4h'],
    marketConditions: ['low_volatility', 'compression', 'coiling'],
    difficulty: 'advanced',
    successRate: 0.72,
    riskLevel: 'high',
    examples: [
      'Trade ATR expansion breakouts',
      'Enter on Bollinger Band squeeze breaks',
      'Use volatility indicators for timing'
    ],
    variations: [
      'Multi-timeframe volatility',
      'Sector volatility breakouts',
      'News-driven volatility'
    ]
  },
  {
    id: 'flag_pennant_breakout',
    name: 'Flag and Pennant Breakout',
    description: 'Trade continuation breakouts from flag and pennant patterns',
    keywords: ['flag', 'pennant', 'continuation', 'pole', 'consolidation', 'pause'],
    indicators: ['volume', 'trend_lines', 'momentum'],
    entryConditions: [
      'strong_initial_move',
      'flag_pennant_formation',
      'volume_dries_up_in_pattern',
      'breakout_in_trend_direction'
    ],
    exitConditions: [
      'flagpole_measured_move',
      'trend_exhaustion',
      'volume_climax'
    ],
    riskManagement: ['stop_below_flag', 'trend_following_stops', 'momentum_stops'],
    timeframes: ['5m', '15m', '1h'],
    marketConditions: ['trending', 'strong_momentum', 'continuation'],
    difficulty: 'intermediate',
    successRate: 0.75,
    riskLevel: 'medium',
    examples: [
      'Buy bull flag breakouts',
      'Trade pennant continuation patterns',
      'Enter on flag pattern completion'
    ],
    variations: [
      'High tight flag',
      'Bear flag breakdowns',
      'Multiple flag patterns'
    ]
  },
  {
    id: 'gap_breakout',
    name: 'Gap Breakout Strategy',
    description: 'Trade breakouts that occur with price gaps',
    keywords: ['gap', 'gap up', 'gap down', 'opening gap', 'breakaway gap'],
    indicators: ['volume', 'gap_size', 'pre_market_volume'],
    entryConditions: [
      'significant_gap',
      'gap_in_trend_direction',
      'high_volume_on_gap',
      'no_immediate_fill'
    ],
    exitConditions: [
      'gap_fill_threat',
      'momentum_exhaustion',
      'end_of_day_profit_taking'
    ],
    riskManagement: ['gap_fill_stops', 'intraday_exits', 'size_based_on_gap'],
    timeframes: ['1m', '5m', '15m'],
    marketConditions: ['news_driven', 'earnings', 'high_volatility'],
    difficulty: 'advanced',
    successRate: 0.60,
    riskLevel: 'high',
    examples: [
      'Trade earnings gap breakouts',
      'Enter on news-driven gaps',
      'Use pre-market gaps for entries'
    ],
    variations: [
      'Breakaway gaps',
      'Runaway gaps',
      'Exhaustion gaps'
    ]
  }
];

export class BreakoutPatternMatcher {
  private patterns: BreakoutPattern[];

  constructor() {
    this.patterns = BREAKOUT_PATTERNS;
  }

  /**
   * Find matching breakout patterns
   */
  public findMatches(
    keywords: string[],
    indicators: string[],
    conditions: string[]
  ): Array<{
    pattern: BreakoutPattern;
    confidence: number;
    matchedKeywords: string[];
    matchedIndicators: string[];
  }> {
    const matches: Array<{
      pattern: BreakoutPattern;
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
   * Get patterns by volatility requirement
   */
  public getPatternsByVolatility(volatilityLevel: 'low' | 'medium' | 'high'): BreakoutPattern[] {
    const volatilityMap = {
      low: ['consolidating', 'low_volatility', 'compression'],
      medium: ['range_bound', 'sideways'],
      high: ['high_volatility', 'news_driven', 'earnings']
    };

    const conditions = volatilityMap[volatilityLevel];
    return this.patterns.filter(pattern => 
      pattern.marketConditions.some(condition => 
        conditions.some(vc => condition.includes(vc))
      )
    );
  }

  /**
   * Get patterns suitable for specific timeframes
   */
  public getPatternsByTimeframe(timeframe: string): BreakoutPattern[] {
    return this.patterns.filter(pattern => pattern.timeframes.includes(timeframe));
  }

  private calculateMatch(
    pattern: BreakoutPattern,
    keywords: string[],
    indicators: string[],
    conditions: string[]
  ): {
    pattern: BreakoutPattern;
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
  public getAllPatterns(): BreakoutPattern[] {
    return [...this.patterns];
  }

  /**
   * Add custom pattern
   */
  public addPattern(pattern: BreakoutPattern): void {
    this.patterns.push(pattern);
  }
}