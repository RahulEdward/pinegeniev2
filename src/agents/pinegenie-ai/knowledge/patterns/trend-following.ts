/**
 * Trend Following Strategy Patterns
 * 
 * Comprehensive database of trend-following trading patterns and strategies.
 */

import { StrategyType } from '../../types/nlp-types';

export interface TrendFollowingPattern {
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

export const TREND_FOLLOWING_PATTERNS: TrendFollowingPattern[] = [
  {
    id: 'ma_crossover_basic',
    name: 'Simple Moving Average Crossover',
    description: 'Basic trend-following strategy using two moving averages of different periods',
    keywords: ['moving average', 'ma', 'sma', 'crossover', 'cross above', 'cross below', 'trend'],
    indicators: ['sma_fast', 'sma_slow'],
    entryConditions: [
      'fast_ma_crosses_above_slow_ma',
      'price_above_both_mas',
      'volume_confirmation'
    ],
    exitConditions: [
      'fast_ma_crosses_below_slow_ma',
      'price_below_fast_ma',
      'stop_loss_hit'
    ],
    riskManagement: ['stop_loss', 'position_sizing', 'trend_filter'],
    timeframes: ['1h', '4h', '1d'],
    marketConditions: ['trending', 'volatile'],
    difficulty: 'beginner',
    successRate: 0.65,
    riskLevel: 'medium',
    examples: [
      'Buy when 10 SMA crosses above 20 SMA',
      'Create a 50/200 moving average crossover strategy',
      'Use 9 and 21 EMA crossover for entries'
    ],
    variations: [
      'Triple moving average system',
      'Exponential moving average crossover',
      'Weighted moving average crossover'
    ]
  },
  {
    id: 'ema_pullback',
    name: 'EMA Pullback Strategy',
    description: 'Enter on pullbacks to key exponential moving averages in trending markets',
    keywords: ['ema', 'pullback', 'retracement', 'bounce', 'support', 'trend continuation'],
    indicators: ['ema_20', 'ema_50', 'rsi'],
    entryConditions: [
      'price_pulls_back_to_ema',
      'ema_acting_as_support',
      'rsi_oversold_in_uptrend',
      'volume_drying_up_on_pullback'
    ],
    exitConditions: [
      'price_breaks_below_ema',
      'trend_reversal_signal',
      'profit_target_reached'
    ],
    riskManagement: ['tight_stop_below_ema', 'position_sizing', 'trend_confirmation'],
    timeframes: ['15m', '1h', '4h'],
    marketConditions: ['trending', 'low_volatility'],
    difficulty: 'intermediate',
    successRate: 0.72,
    riskLevel: 'medium',
    examples: [
      'Buy pullbacks to 20 EMA in uptrend',
      'Enter when price bounces off 50 EMA with RSI oversold',
      'Trade retracements to key moving averages'
    ],
    variations: [
      'Multiple EMA pullback system',
      'Fibonacci retracement + EMA',
      'Volume-weighted pullback entries'
    ]
  },
  {
    id: 'breakout_momentum',
    name: 'Breakout Momentum Strategy',
    description: 'Trade breakouts from consolidation patterns with momentum confirmation',
    keywords: ['breakout', 'momentum', 'resistance', 'support', 'volume', 'consolidation'],
    indicators: ['atr', 'volume', 'rsi', 'macd'],
    entryConditions: [
      'price_breaks_resistance',
      'volume_surge_on_breakout',
      'momentum_confirmation',
      'no_false_breakout'
    ],
    exitConditions: [
      'momentum_divergence',
      'volume_dries_up',
      'pullback_to_breakout_level'
    ],
    riskManagement: ['stop_below_breakout_level', 'position_sizing', 'false_breakout_filter'],
    timeframes: ['5m', '15m', '1h', '4h'],
    marketConditions: ['consolidating', 'high_volatility'],
    difficulty: 'intermediate',
    successRate: 0.68,
    riskLevel: 'high',
    examples: [
      'Buy breakout above resistance with volume',
      'Trade range breakouts with momentum confirmation',
      'Enter on breakout with ATR expansion'
    ],
    variations: [
      'Flag and pennant breakouts',
      'Triangle breakout strategy',
      'Box breakout with volume filter'
    ]
  },
  {
    id: 'trend_channel',
    name: 'Trend Channel Strategy',
    description: 'Trade within established trend channels, buying support and selling resistance',
    keywords: ['channel', 'trend line', 'support', 'resistance', 'parallel', 'bounce'],
    indicators: ['trend_lines', 'rsi', 'stochastic'],
    entryConditions: [
      'price_bounces_off_channel_support',
      'oscillator_oversold',
      'trend_still_intact',
      'volume_confirmation'
    ],
    exitConditions: [
      'price_reaches_channel_resistance',
      'channel_break',
      'trend_reversal'
    ],
    riskManagement: ['stop_below_channel', 'partial_profits', 'trend_monitoring'],
    timeframes: ['1h', '4h', '1d'],
    marketConditions: ['trending', 'channeling'],
    difficulty: 'advanced',
    successRate: 0.75,
    riskLevel: 'medium',
    examples: [
      'Buy at lower trend line, sell at upper trend line',
      'Trade within ascending channel',
      'Use parallel channels for entries and exits'
    ],
    variations: [
      'Regression channel trading',
      'Fibonacci channel strategy',
      'Dynamic channel with moving averages'
    ]
  },
  {
    id: 'momentum_surge',
    name: 'Momentum Surge Strategy',
    description: 'Capture strong momentum moves with multiple confirmation signals',
    keywords: ['momentum', 'surge', 'acceleration', 'macd', 'rsi', 'volume'],
    indicators: ['macd', 'rsi', 'volume', 'atr'],
    entryConditions: [
      'macd_histogram_expanding',
      'rsi_breaking_50',
      'volume_above_average',
      'price_acceleration'
    ],
    exitConditions: [
      'momentum_divergence',
      'macd_histogram_contracting',
      'rsi_overbought'
    ],
    riskManagement: ['trailing_stop', 'momentum_stop', 'position_scaling'],
    timeframes: ['5m', '15m', '1h'],
    marketConditions: ['trending', 'high_momentum'],
    difficulty: 'advanced',
    successRate: 0.70,
    riskLevel: 'high',
    examples: [
      'Enter on MACD surge with volume confirmation',
      'Trade momentum acceleration with RSI break',
      'Capture strong moves with multiple indicators'
    ],
    variations: [
      'Multi-timeframe momentum',
      'Sector momentum strategy',
      'News-driven momentum trades'
    ]
  }
];

export class TrendFollowingPatternMatcher {
  private patterns: TrendFollowingPattern[];

  constructor() {
    this.patterns = TREND_FOLLOWING_PATTERNS;
  }

  /**
   * Find matching trend-following patterns
   */
  public findMatches(
    keywords: string[],
    indicators: string[],
    conditions: string[]
  ): Array<{
    pattern: TrendFollowingPattern;
    confidence: number;
    matchedKeywords: string[];
    matchedIndicators: string[];
  }> {
    const matches: Array<{
      pattern: TrendFollowingPattern;
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
   * Get patterns by difficulty level
   */
  public getPatternsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): TrendFollowingPattern[] {
    return this.patterns.filter(pattern => pattern.difficulty === difficulty);
  }

  /**
   * Get patterns by risk level
   */
  public getPatternsByRisk(riskLevel: 'low' | 'medium' | 'high'): TrendFollowingPattern[] {
    return this.patterns.filter(pattern => pattern.riskLevel === riskLevel);
  }

  /**
   * Get patterns suitable for timeframe
   */
  public getPatternsByTimeframe(timeframe: string): TrendFollowingPattern[] {
    return this.patterns.filter(pattern => pattern.timeframes.includes(timeframe));
  }

  private calculateMatch(
    pattern: TrendFollowingPattern,
    keywords: string[],
    indicators: string[],
    conditions: string[]
  ): {
    pattern: TrendFollowingPattern;
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
  public getAllPatterns(): TrendFollowingPattern[] {
    return [...this.patterns];
  }

  /**
   * Add custom pattern
   */
  public addPattern(pattern: TrendFollowingPattern): void {
    this.patterns.push(pattern);
  }
}