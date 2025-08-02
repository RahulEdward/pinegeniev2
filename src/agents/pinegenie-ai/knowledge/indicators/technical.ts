/**
 * Technical Indicators Knowledge Base
 * 
 * Comprehensive database of technical indicators with their properties,
 * parameters, use cases, and combinations.
 */

export interface TechnicalIndicator {
  id: string;
  name: string;
  category: 'trend' | 'momentum' | 'volatility' | 'volume' | 'oscillator';
  description: string;
  formula?: string;
  parameters: IndicatorParameter[];
  outputs: IndicatorOutput[];
  interpretation: IndicatorInterpretation;
  useCases: string[];
  bestTimeframes: string[];
  marketConditions: string[];
  combinations: string[];
  strengths: string[];
  weaknesses: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  popularity: number; // 1-10 scale
}

export interface IndicatorParameter {
  name: string;
  type: 'int' | 'float' | 'source' | 'string';
  defaultValue: unknown;
  range?: [number, number];
  description: string;
  impact: 'low' | 'medium' | 'high';
}

export interface IndicatorOutput {
  name: string;
  type: 'line' | 'histogram' | 'cloud' | 'level';
  description: string;
  range?: [number, number];
}

export interface IndicatorInterpretation {
  bullishSignals: string[];
  bearishSignals: string[];
  neutralSignals: string[];
  divergenceSignals: string[];
  extremeLevels?: {
    overbought?: number;
    oversold?: number;
  };
}

export const TECHNICAL_INDICATORS: TechnicalIndicator[] = [
  {
    id: 'rsi',
    name: 'Relative Strength Index',
    category: 'oscillator',
    description: 'Momentum oscillator that measures the speed and change of price movements',
    formula: 'RSI = 100 - (100 / (1 + RS)), where RS = Average Gain / Average Loss',
    parameters: [
      {
        name: 'period',
        type: 'int',
        defaultValue: 14,
        range: [2, 50],
        description: 'Number of periods for RSI calculation',
        impact: 'high'
      },
      {
        name: 'source',
        type: 'source',
        defaultValue: 'close',
        description: 'Price source for calculation',
        impact: 'medium'
      }
    ],
    outputs: [
      {
        name: 'rsi',
        type: 'line',
        description: 'RSI oscillator line',
        range: [0, 100]
      }
    ],
    interpretation: {
      bullishSignals: [
        'RSI crosses above 30 from oversold',
        'Bullish divergence with price',
        'RSI breaks above 50 in uptrend'
      ],
      bearishSignals: [
        'RSI crosses below 70 from overbought',
        'Bearish divergence with price',
        'RSI breaks below 50 in downtrend'
      ],
      neutralSignals: [
        'RSI between 40-60',
        'RSI consolidating near 50'
      ],
      divergenceSignals: [
        'Price makes new high but RSI doesn\'t',
        'Price makes new low but RSI doesn\'t'
      ],
      extremeLevels: {
        overbought: 70,
        oversold: 30
      }
    },
    useCases: [
      'Identify overbought/oversold conditions',
      'Spot momentum divergences',
      'Confirm trend strength',
      'Generate entry/exit signals'
    ],
    bestTimeframes: ['15m', '1h', '4h', '1d'],
    marketConditions: ['ranging', 'trending', 'volatile'],
    combinations: ['bollinger_bands', 'macd', 'moving_averages', 'stochastic'],
    strengths: [
      'Clear overbought/oversold levels',
      'Works well in ranging markets',
      'Good for divergence analysis',
      'Simple to interpret'
    ],
    weaknesses: [
      'Can stay overbought/oversold in strong trends',
      'Prone to false signals in choppy markets',
      'Lagging indicator',
      'Less effective in trending markets'
    ],
    difficulty: 'beginner',
    popularity: 9
  },
  {
    id: 'sma',
    name: 'Simple Moving Average',
    category: 'trend',
    description: 'Average price over a specified number of periods',
    formula: 'SMA = (P1 + P2 + ... + Pn) / n',
    parameters: [
      {
        name: 'period',
        type: 'int',
        defaultValue: 20,
        range: [1, 200],
        description: 'Number of periods to average',
        impact: 'high'
      },
      {
        name: 'source',
        type: 'source',
        defaultValue: 'close',
        description: 'Price source for calculation',
        impact: 'medium'
      }
    ],
    outputs: [
      {
        name: 'sma',
        type: 'line',
        description: 'Simple moving average line'
      }
    ],
    interpretation: {
      bullishSignals: [
        'Price crosses above SMA',
        'SMA slope turning upward',
        'Price bounces off SMA support'
      ],
      bearishSignals: [
        'Price crosses below SMA',
        'SMA slope turning downward',
        'Price rejected at SMA resistance'
      ],
      neutralSignals: [
        'Price consolidating around SMA',
        'SMA flat with no clear direction'
      ],
      divergenceSignals: [
        'Price trend differs from SMA direction'
      ]
    },
    useCases: [
      'Identify trend direction',
      'Dynamic support/resistance levels',
      'Crossover strategies',
      'Trend confirmation'
    ],
    bestTimeframes: ['1h', '4h', '1d', '1w'],
    marketConditions: ['trending', 'stable'],
    combinations: ['ema', 'rsi', 'macd', 'bollinger_bands'],
    strengths: [
      'Simple and reliable',
      'Good trend identification',
      'Works as dynamic support/resistance',
      'Easy to understand'
    ],
    weaknesses: [
      'Lagging indicator',
      'Poor performance in choppy markets',
      'Prone to whipsaws',
      'Less responsive than EMA'
    ],
    difficulty: 'beginner',
    popularity: 10
  },
  {
    id: 'ema',
    name: 'Exponential Moving Average',
    category: 'trend',
    description: 'Moving average that gives more weight to recent prices',
    formula: 'EMA = (Close - EMA_prev) * (2 / (n + 1)) + EMA_prev',
    parameters: [
      {
        name: 'period',
        type: 'int',
        defaultValue: 20,
        range: [1, 200],
        description: 'Number of periods for EMA calculation',
        impact: 'high'
      },
      {
        name: 'source',
        type: 'source',
        defaultValue: 'close',
        description: 'Price source for calculation',
        impact: 'medium'
      }
    ],
    outputs: [
      {
        name: 'ema',
        type: 'line',
        description: 'Exponential moving average line'
      }
    ],
    interpretation: {
      bullishSignals: [
        'Price crosses above EMA',
        'EMA slope turning upward',
        'Price bounces off EMA support',
        'Fast EMA crosses above slow EMA'
      ],
      bearishSignals: [
        'Price crosses below EMA',
        'EMA slope turning downward',
        'Price rejected at EMA resistance',
        'Fast EMA crosses below slow EMA'
      ],
      neutralSignals: [
        'Price consolidating around EMA',
        'EMA flat with sideways movement'
      ],
      divergenceSignals: [
        'Price trend differs from EMA slope'
      ]
    },
    useCases: [
      'Trend following strategies',
      'Dynamic support/resistance',
      'Crossover systems',
      'Pullback entries'
    ],
    bestTimeframes: ['15m', '1h', '4h', '1d'],
    marketConditions: ['trending', 'volatile'],
    combinations: ['sma', 'rsi', 'macd', 'stochastic'],
    strengths: [
      'More responsive than SMA',
      'Better for trending markets',
      'Good for pullback strategies',
      'Widely used and accepted'
    ],
    weaknesses: [
      'More prone to false signals',
      'Can be whippy in ranging markets',
      'Still a lagging indicator',
      'Requires trend confirmation'
    ],
    difficulty: 'beginner',
    popularity: 9
  },
  {
    id: 'macd',
    name: 'Moving Average Convergence Divergence',
    category: 'momentum',
    description: 'Trend-following momentum indicator using two moving averages',
    formula: 'MACD = EMA(12) - EMA(26), Signal = EMA(9) of MACD, Histogram = MACD - Signal',
    parameters: [
      {
        name: 'fastPeriod',
        type: 'int',
        defaultValue: 12,
        range: [5, 50],
        description: 'Fast EMA period',
        impact: 'high'
      },
      {
        name: 'slowPeriod',
        type: 'int',
        defaultValue: 26,
        range: [10, 100],
        description: 'Slow EMA period',
        impact: 'high'
      },
      {
        name: 'signalPeriod',
        type: 'int',
        defaultValue: 9,
        range: [3, 30],
        description: 'Signal line EMA period',
        impact: 'medium'
      }
    ],
    outputs: [
      {
        name: 'macd',
        type: 'line',
        description: 'MACD line'
      },
      {
        name: 'signal',
        type: 'line',
        description: 'Signal line'
      },
      {
        name: 'histogram',
        type: 'histogram',
        description: 'MACD histogram'
      }
    ],
    interpretation: {
      bullishSignals: [
        'MACD crosses above signal line',
        'MACD crosses above zero line',
        'Histogram turns positive',
        'Bullish divergence'
      ],
      bearishSignals: [
        'MACD crosses below signal line',
        'MACD crosses below zero line',
        'Histogram turns negative',
        'Bearish divergence'
      ],
      neutralSignals: [
        'MACD and signal line converging',
        'Histogram near zero'
      ],
      divergenceSignals: [
        'Price makes new high but MACD doesn\'t',
        'Price makes new low but MACD doesn\'t'
      ]
    },
    useCases: [
      'Trend change identification',
      'Momentum analysis',
      'Divergence detection',
      'Entry/exit timing'
    ],
    bestTimeframes: ['1h', '4h', '1d'],
    marketConditions: ['trending', 'momentum'],
    combinations: ['rsi', 'stochastic', 'bollinger_bands', 'moving_averages'],
    strengths: [
      'Good for trend changes',
      'Multiple signal types',
      'Effective divergence tool',
      'Works in trending markets'
    ],
    weaknesses: [
      'Lagging indicator',
      'Poor in ranging markets',
      'Can give false signals',
      'Complex for beginners'
    ],
    difficulty: 'intermediate',
    popularity: 8
  },
  {
    id: 'bollinger_bands',
    name: 'Bollinger Bands',
    category: 'volatility',
    description: 'Volatility bands placed above and below a moving average',
    formula: 'Upper = SMA + (StdDev * multiplier), Lower = SMA - (StdDev * multiplier)',
    parameters: [
      {
        name: 'period',
        type: 'int',
        defaultValue: 20,
        range: [5, 50],
        description: 'Period for moving average and standard deviation',
        impact: 'high'
      },
      {
        name: 'stdDev',
        type: 'float',
        defaultValue: 2.0,
        range: [1.0, 3.0],
        description: 'Standard deviation multiplier',
        impact: 'high'
      },
      {
        name: 'source',
        type: 'source',
        defaultValue: 'close',
        description: 'Price source for calculation',
        impact: 'medium'
      }
    ],
    outputs: [
      {
        name: 'upper',
        type: 'line',
        description: 'Upper Bollinger Band'
      },
      {
        name: 'middle',
        type: 'line',
        description: 'Middle line (SMA)'
      },
      {
        name: 'lower',
        type: 'line',
        description: 'Lower Bollinger Band'
      }
    ],
    interpretation: {
      bullishSignals: [
        'Price bounces off lower band',
        'Squeeze followed by upward breakout',
        'Price walks the upper band'
      ],
      bearishSignals: [
        'Price bounces off upper band',
        'Squeeze followed by downward breakout',
        'Price walks the lower band'
      ],
      neutralSignals: [
        'Price consolidating between bands',
        'Bands contracting (squeeze)'
      ],
      divergenceSignals: [
        'Price makes new high outside bands but momentum doesn\'t'
      ]
    },
    useCases: [
      'Volatility analysis',
      'Mean reversion strategies',
      'Breakout identification',
      'Overbought/oversold conditions'
    ],
    bestTimeframes: ['15m', '1h', '4h', '1d'],
    marketConditions: ['ranging', 'volatile', 'trending'],
    combinations: ['rsi', 'stochastic', 'volume', 'macd'],
    strengths: [
      'Adapts to volatility',
      'Multiple strategy applications',
      'Visual and intuitive',
      'Good for ranging markets'
    ],
    weaknesses: [
      'Can give false breakout signals',
      'Less effective in strong trends',
      'Requires confirmation',
      'Parameter sensitive'
    ],
    difficulty: 'intermediate',
    popularity: 8
  },
  {
    id: 'stochastic',
    name: 'Stochastic Oscillator',
    category: 'oscillator',
    description: 'Momentum oscillator comparing closing price to price range',
    formula: '%K = (Close - Low) / (High - Low) * 100, %D = SMA of %K',
    parameters: [
      {
        name: 'kPeriod',
        type: 'int',
        defaultValue: 14,
        range: [5, 50],
        description: 'Period for %K calculation',
        impact: 'high'
      },
      {
        name: 'dPeriod',
        type: 'int',
        defaultValue: 3,
        range: [1, 10],
        description: 'Period for %D smoothing',
        impact: 'medium'
      },
      {
        name: 'smooth',
        type: 'int',
        defaultValue: 3,
        range: [1, 10],
        description: 'Smoothing period for %K',
        impact: 'medium'
      }
    ],
    outputs: [
      {
        name: 'k',
        type: 'line',
        description: '%K line',
        range: [0, 100]
      },
      {
        name: 'd',
        type: 'line',
        description: '%D line',
        range: [0, 100]
      }
    ],
    interpretation: {
      bullishSignals: [
        '%K crosses above %D',
        'Both lines cross above 20',
        'Bullish divergence'
      ],
      bearishSignals: [
        '%K crosses below %D',
        'Both lines cross below 80',
        'Bearish divergence'
      ],
      neutralSignals: [
        'Lines between 20-80',
        'Lines converging'
      ],
      divergenceSignals: [
        'Price makes new high but Stochastic doesn\'t',
        'Price makes new low but Stochastic doesn\'t'
      ],
      extremeLevels: {
        overbought: 80,
        oversold: 20
      }
    },
    useCases: [
      'Momentum analysis',
      'Overbought/oversold identification',
      'Divergence detection',
      'Short-term timing'
    ],
    bestTimeframes: ['5m', '15m', '1h', '4h'],
    marketConditions: ['ranging', 'volatile', 'sideways'],
    combinations: ['rsi', 'macd', 'moving_averages', 'bollinger_bands'],
    strengths: [
      'Good for ranging markets',
      'Clear overbought/oversold levels',
      'Fast and responsive',
      'Good for short-term trading'
    ],
    weaknesses: [
      'Very noisy in trending markets',
      'Prone to false signals',
      'Can stay extreme for long periods',
      'Requires confirmation'
    ],
    difficulty: 'intermediate',
    popularity: 7
  },
  {
    id: 'atr',
    name: 'Average True Range',
    category: 'volatility',
    description: 'Measures market volatility by calculating average of true ranges',
    formula: 'TR = max(High-Low, abs(High-Close_prev), abs(Low-Close_prev)), ATR = SMA of TR',
    parameters: [
      {
        name: 'period',
        type: 'int',
        defaultValue: 14,
        range: [5, 50],
        description: 'Period for ATR calculation',
        impact: 'high'
      }
    ],
    outputs: [
      {
        name: 'atr',
        type: 'line',
        description: 'Average True Range value'
      }
    ],
    interpretation: {
      bullishSignals: [
        'ATR increasing with upward price movement',
        'Low ATR followed by breakout'
      ],
      bearishSignals: [
        'ATR increasing with downward price movement',
        'High ATR suggesting exhaustion'
      ],
      neutralSignals: [
        'Stable ATR levels',
        'ATR in normal range'
      ],
      divergenceSignals: [
        'Price volatility not matching ATR readings'
      ]
    },
    useCases: [
      'Stop loss placement',
      'Position sizing',
      'Volatility analysis',
      'Breakout confirmation'
    ],
    bestTimeframes: ['1h', '4h', '1d'],
    marketConditions: ['all'],
    combinations: ['bollinger_bands', 'rsi', 'macd', 'moving_averages'],
    strengths: [
      'Excellent for risk management',
      'Adapts to market volatility',
      'Non-directional indicator',
      'Useful for all strategies'
    ],
    weaknesses: [
      'Doesn\'t indicate direction',
      'Lagging indicator',
      'Can be misleading in gaps',
      'Requires interpretation'
    ],
    difficulty: 'intermediate',
    popularity: 6
  }
];

export interface IndicatorCompatibilityRule {
  id: string;
  primaryIndicator: string;
  compatibleIndicators: string[];
  incompatibleIndicators: string[];
  synergy: string;
  conflictReason?: string;
  effectiveness: number; // 0-1 scale
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  bestUseCase: string;
}

export interface IndicatorSuggestion {
  indicator: TechnicalIndicator;
  reason: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  parameters?: Record<string, unknown>;
  implementation: string;
  expectedOutcome: string;
}

export interface ParameterOptimization {
  parameterId: string;
  parameterName: string;
  currentValue: unknown;
  optimizedValue: unknown;
  reason: string;
  impact: 'low' | 'medium' | 'high';
  marketCondition: string;
  confidence: number;
}

export interface IndicatorAnalysis {
  indicator: TechnicalIndicator;
  suitability: number; // 0-1 scale
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  parameterOptimizations: ParameterOptimization[];
}

export class TechnicalIndicatorDatabase {
  private indicators: Map<string, TechnicalIndicator>;
  private compatibilityRules: Map<string, IndicatorCompatibilityRule[]>;
  private strategyIndicatorMap: Map<string, string[]>;

  constructor() {
    this.indicators = new Map();
    this.compatibilityRules = new Map();
    this.strategyIndicatorMap = new Map();
    this.buildIndicatorMap();
    this.buildCompatibilityRules();
    this.buildStrategyIndicatorMap();
  }

  private buildIndicatorMap(): void {
    TECHNICAL_INDICATORS.forEach(indicator => {
      this.indicators.set(indicator.id, indicator);
    });
  }

  private buildCompatibilityRules(): void {
    const rules: IndicatorCompatibilityRule[] = [
      {
        id: 'rsi_bollinger_synergy',
        primaryIndicator: 'rsi',
        compatibleIndicators: ['bollinger_bands', 'stochastic'],
        incompatibleIndicators: ['macd'],
        synergy: 'RSI momentum signals complement Bollinger Band volatility extremes for mean reversion strategies',
        effectiveness: 0.85,
        difficulty: 'beginner',
        bestUseCase: 'Mean reversion in ranging markets'
      },
      {
        id: 'macd_ema_synergy',
        primaryIndicator: 'macd',
        compatibleIndicators: ['ema', 'sma', 'atr'],
        incompatibleIndicators: ['rsi', 'stochastic'],
        synergy: 'MACD momentum signals work well with EMA trend confirmation for trend-following strategies',
        effectiveness: 0.80,
        difficulty: 'intermediate',
        bestUseCase: 'Trend following with momentum confirmation'
      },
      {
        id: 'bollinger_atr_synergy',
        primaryIndicator: 'bollinger_bands',
        compatibleIndicators: ['atr', 'rsi'],
        incompatibleIndicators: ['macd'],
        synergy: 'Bollinger Bands volatility signals enhanced by ATR for better risk management',
        effectiveness: 0.75,
        difficulty: 'intermediate',
        bestUseCase: 'Volatility breakout strategies with proper risk sizing'
      },
      {
        id: 'stochastic_sma_synergy',
        primaryIndicator: 'stochastic',
        compatibleIndicators: ['sma', 'ema', 'rsi'],
        incompatibleIndicators: ['macd'],
        synergy: 'Stochastic timing signals filtered by SMA trend direction for better accuracy',
        effectiveness: 0.70,
        difficulty: 'intermediate',
        bestUseCase: 'Short-term scalping with trend filter'
      },
      {
        id: 'ema_sma_synergy',
        primaryIndicator: 'ema',
        compatibleIndicators: ['sma', 'macd', 'atr'],
        incompatibleIndicators: [],
        synergy: 'Multiple moving averages provide comprehensive trend analysis across timeframes',
        effectiveness: 0.78,
        difficulty: 'beginner',
        bestUseCase: 'Multi-timeframe trend analysis'
      },
      {
        id: 'atr_universal_synergy',
        primaryIndicator: 'atr',
        compatibleIndicators: ['rsi', 'macd', 'bollinger_bands', 'ema', 'sma', 'stochastic'],
        incompatibleIndicators: [],
        synergy: 'ATR enhances any strategy by providing volatility-based risk management',
        effectiveness: 0.90,
        difficulty: 'intermediate',
        bestUseCase: 'Risk management and position sizing for any strategy'
      }
    ];

    // Build compatibility map
    rules.forEach(rule => {
      if (!this.compatibilityRules.has(rule.primaryIndicator)) {
        this.compatibilityRules.set(rule.primaryIndicator, []);
      }
      this.compatibilityRules.get(rule.primaryIndicator)!.push(rule);

      // Add reverse compatibility
      rule.compatibleIndicators.forEach(compatibleId => {
        if (!this.compatibilityRules.has(compatibleId)) {
          this.compatibilityRules.set(compatibleId, []);
        }
        
        // Check if reverse rule already exists
        const existingRules = this.compatibilityRules.get(compatibleId)!;
        const reverseExists = existingRules.some(r => r.primaryIndicator === compatibleId && 
          r.compatibleIndicators.includes(rule.primaryIndicator));
        
        if (!reverseExists) {
          existingRules.push({
            id: `${rule.id}_reverse`,
            primaryIndicator: compatibleId,
            compatibleIndicators: [rule.primaryIndicator],
            incompatibleIndicators: [],
            synergy: `Reverse synergy: ${rule.synergy}`,
            effectiveness: rule.effectiveness * 0.9, // Slightly lower for reverse
            difficulty: rule.difficulty,
            bestUseCase: rule.bestUseCase
          });
        }
      });
    });
  }

  private buildStrategyIndicatorMap(): void {
    this.strategyIndicatorMap.set('trend-following', ['ema', 'sma', 'macd', 'atr']);
    this.strategyIndicatorMap.set('mean-reversion', ['rsi', 'bollinger_bands', 'stochastic']);
    this.strategyIndicatorMap.set('breakout', ['bollinger_bands', 'atr', 'ema']);
    this.strategyIndicatorMap.set('momentum', ['macd', 'rsi', 'stochastic']);
    this.strategyIndicatorMap.set('scalping', ['stochastic', 'ema', 'atr']);
    this.strategyIndicatorMap.set('custom', ['rsi', 'ema', 'macd', 'bollinger_bands']);
  }

  /**
   * Get indicator by ID
   */
  public getIndicator(id: string): TechnicalIndicator | null {
    return this.indicators.get(id) || null;
  }

  /**
   * Find indicators by category
   */
  public getIndicatorsByCategory(category: string): TechnicalIndicator[] {
    return TECHNICAL_INDICATORS.filter(indicator => indicator.category === category);
  }

  /**
   * Find indicators by difficulty
   */
  public getIndicatorsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): TechnicalIndicator[] {
    return TECHNICAL_INDICATORS.filter(indicator => indicator.difficulty === difficulty);
  }

  /**
   * Find indicators suitable for timeframe
   */
  public getIndicatorsByTimeframe(timeframe: string): TechnicalIndicator[] {
    return TECHNICAL_INDICATORS.filter(indicator => 
      indicator.bestTimeframes.includes(timeframe)
    );
  }

  /**
   * Find indicators by market condition
   */
  public getIndicatorsByMarketCondition(condition: string): TechnicalIndicator[] {
    return TECHNICAL_INDICATORS.filter(indicator =>
      indicator.marketConditions.includes(condition)
    );
  }

  /**
   * Get popular indicators
   */
  public getPopularIndicators(minPopularity: number = 7): TechnicalIndicator[] {
    return TECHNICAL_INDICATORS
      .filter(indicator => indicator.popularity >= minPopularity)
      .sort((a, b) => b.popularity - a.popularity);
  }

  /**
   * Find compatible indicator combinations
   */
  public getCompatibleIndicators(indicatorId: string): TechnicalIndicator[] {
    const indicator = this.getIndicator(indicatorId);
    if (!indicator) return [];

    const compatibleIds = indicator.combinations;
    return compatibleIds
      .map(id => this.getIndicator(id))
      .filter(ind => ind !== null) as TechnicalIndicator[];
  }

  /**
   * Search indicators by keywords
   */
  public searchIndicators(keywords: string[]): TechnicalIndicator[] {
    const results: Array<{ indicator: TechnicalIndicator; score: number }> = [];

    TECHNICAL_INDICATORS.forEach(indicator => {
      let score = 0;
      const searchText = `${indicator.name} ${indicator.description} ${indicator.useCases.join(' ')}`.toLowerCase();

      keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        if (searchText.includes(keywordLower)) {
          score += 1;
        }
        if (indicator.name.toLowerCase().includes(keywordLower)) {
          score += 2; // Boost for name matches
        }
      });

      if (score > 0) {
        results.push({ indicator, score });
      }
    });

    return results
      .sort((a, b) => b.score - a.score)
      .map(result => result.indicator);
  }

  /**
   * Get indicator suggestions based on strategy type
   */
  public getIndicatorSuggestions(
    strategyType: string,
    existingIndicators: string[] = [],
    userLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
    marketCondition?: string,
    timeframe?: string
  ): IndicatorSuggestion[] {
    const suggestions: IndicatorSuggestion[] = [];
    
    // Get base indicators for strategy type
    const baseIndicators = this.strategyIndicatorMap.get(strategyType) || [];
    
    // Filter out existing indicators
    const availableIndicators = baseIndicators.filter(id => !existingIndicators.includes(id));
    
    availableIndicators.forEach(indicatorId => {
      const indicator = this.getIndicator(indicatorId);
      if (!indicator) return;
      
      // Check if indicator matches user level
      const levelMatch = this.checkLevelMatch(indicator.difficulty, userLevel);
      if (!levelMatch.suitable) return;
      
      // Check market condition compatibility
      let marketMatch = 1.0;
      if (marketCondition && !indicator.marketConditions.includes(marketCondition)) {
        marketMatch = 0.6;
      }
      
      // Check timeframe compatibility
      let timeframeMatch = 1.0;
      if (timeframe && !indicator.bestTimeframes.includes(timeframe)) {
        timeframeMatch = 0.7;
      }
      
      const confidence = levelMatch.confidence * marketMatch * timeframeMatch;
      
      if (confidence > 0.5) {
        suggestions.push({
          indicator,
          reason: this.generateSuggestionReason(indicator, strategyType, marketCondition, timeframe),
          confidence,
          priority: confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low',
          parameters: this.getOptimizedParameters(indicator, strategyType, marketCondition, timeframe),
          implementation: `Add ${indicator.name} with ${indicator.bestTimeframes[0]} timeframe`,
          expectedOutcome: this.getExpectedOutcome(indicator, strategyType)
        });
      }
    });
    
    // Sort by confidence and priority
    return suggestions.sort((a, b) => {
      if (a.priority !== b.priority) {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.confidence - a.confidence;
    }).slice(0, 5);
  }

  /**
   * Get indicator compatibility analysis
   */
  public getCompatibilityAnalysis(indicatorIds: string[]): {
    compatible: Array<{ indicators: string[]; synergy: string; effectiveness: number }>;
    incompatible: Array<{ indicators: string[]; reason: string }>;
    suggestions: IndicatorSuggestion[];
  } {
    const compatible: Array<{ indicators: string[]; synergy: string; effectiveness: number }> = [];
    const incompatible: Array<{ indicators: string[]; reason: string }> = [];
    const suggestions: IndicatorSuggestion[] = [];
    
    // Check pairwise compatibility
    for (let i = 0; i < indicatorIds.length; i++) {
      for (let j = i + 1; j < indicatorIds.length; j++) {
        const id1 = indicatorIds[i];
        const id2 = indicatorIds[j];
        
        const rules1 = this.compatibilityRules.get(id1) || [];
        const compatibilityRule = rules1.find(rule => 
          rule.compatibleIndicators.includes(id2)
        );
        
        if (compatibilityRule) {
          compatible.push({
            indicators: [id1, id2],
            synergy: compatibilityRule.synergy,
            effectiveness: compatibilityRule.effectiveness
          });
        }
        
        const incompatibilityRule = rules1.find(rule => 
          rule.incompatibleIndicators.includes(id2)
        );
        
        if (incompatibilityRule) {
          incompatible.push({
            indicators: [id1, id2],
            reason: incompatibilityRule.conflictReason || 'Indicators may provide conflicting signals'
          });
        }
      }
    }
    
    // Generate suggestions for additional indicators
    indicatorIds.forEach(id => {
      const rules = this.compatibilityRules.get(id) || [];
      rules.forEach(rule => {
        rule.compatibleIndicators.forEach(compatibleId => {
          if (!indicatorIds.includes(compatibleId)) {
            const indicator = this.getIndicator(compatibleId);
            if (indicator) {
              suggestions.push({
                indicator,
                reason: `Highly compatible with ${this.getIndicator(id)?.name}: ${rule.synergy}`,
                confidence: rule.effectiveness,
                priority: rule.effectiveness > 0.8 ? 'high' : 'medium',
                implementation: `Add ${indicator.name} to enhance ${rule.bestUseCase}`,
                expectedOutcome: `Improved strategy effectiveness by ${(rule.effectiveness * 100).toFixed(0)}%`
              });
            }
          }
        });
      });
    });
    
    // Remove duplicate suggestions and sort
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) =>
      index === self.findIndex(s => s.indicator.id === suggestion.indicator.id)
    ).sort((a, b) => b.confidence - a.confidence).slice(0, 3);
    
    return {
      compatible,
      incompatible,
      suggestions: uniqueSuggestions
    };
  }

  /**
   * Get parameter optimization recommendations
   */
  public getParameterOptimizations(
    indicatorId: string,
    strategyType: string,
    marketCondition?: string,
    timeframe?: string,
    currentParameters?: Record<string, unknown>
  ): ParameterOptimization[] {
    const indicator = this.getIndicator(indicatorId);
    if (!indicator) return [];
    
    const optimizations: ParameterOptimization[] = [];
    
    indicator.parameters.forEach(param => {
      const currentValue = currentParameters?.[param.name] ?? param.defaultValue;
      const optimization = this.calculateParameterOptimization(
        param,
        currentValue,
        strategyType,
        marketCondition,
        timeframe
      );
      
      if (optimization) {
        optimizations.push(optimization);
      }
    });
    
    return optimizations.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  }

  /**
   * Analyze indicator suitability for specific context
   */
  public analyzeIndicatorSuitability(
    indicatorId: string,
    context: {
      strategyType: string;
      marketCondition?: string;
      timeframe?: string;
      userLevel?: 'beginner' | 'intermediate' | 'advanced';
      existingIndicators?: string[];
    }
  ): IndicatorAnalysis {
    const indicator = this.getIndicator(indicatorId);
    if (!indicator) {
      throw new Error(`Indicator ${indicatorId} not found`);
    }
    
    let suitability = 0.5; // Base suitability
    const strengths: string[] = [...indicator.strengths];
    const weaknesses: string[] = [...indicator.weaknesses];
    const recommendations: string[] = [];
    
    // Analyze strategy type compatibility
    const strategyIndicators = this.strategyIndicatorMap.get(context.strategyType) || [];
    if (strategyIndicators.includes(indicatorId)) {
      suitability += 0.3;
      strengths.push(`Excellent for ${context.strategyType} strategies`);
    } else {
      suitability -= 0.1;
      weaknesses.push(`Not optimized for ${context.strategyType} strategies`);
    }
    
    // Analyze market condition compatibility
    if (context.marketCondition) {
      if (indicator.marketConditions.includes(context.marketCondition)) {
        suitability += 0.2;
        strengths.push(`Works well in ${context.marketCondition} markets`);
      } else {
        suitability -= 0.15;
        weaknesses.push(`May struggle in ${context.marketCondition} markets`);
        recommendations.push(`Consider additional confirmation in ${context.marketCondition} conditions`);
      }
    }
    
    // Analyze timeframe compatibility
    if (context.timeframe) {
      if (indicator.bestTimeframes.includes(context.timeframe)) {
        suitability += 0.15;
        strengths.push(`Optimized for ${context.timeframe} timeframe`);
      } else {
        suitability -= 0.1;
        recommendations.push(`Consider adjusting parameters for ${context.timeframe} timeframe`);
      }
    }
    
    // Analyze user level compatibility
    if (context.userLevel) {
      const levelMatch = this.checkLevelMatch(indicator.difficulty, context.userLevel);
      suitability += levelMatch.suitable ? 0.1 : -0.2;
      if (!levelMatch.suitable) {
        if (indicator.difficulty === 'advanced' && context.userLevel === 'beginner') {
          weaknesses.push('Complex indicator requiring advanced understanding');
          recommendations.push('Start with simpler indicators before using this one');
        }
      }
    }
    
    // Analyze compatibility with existing indicators
    if (context.existingIndicators && context.existingIndicators.length > 0) {
      const compatibility = this.getCompatibilityAnalysis([indicatorId, ...context.existingIndicators]);
      if (compatibility.compatible.length > 0) {
        suitability += 0.1;
        strengths.push('Good synergy with existing indicators');
      }
      if (compatibility.incompatible.length > 0) {
        suitability -= 0.2;
        weaknesses.push('May conflict with existing indicators');
        recommendations.push('Consider removing conflicting indicators');
      }
    }
    
    // Generate parameter optimizations
    const parameterOptimizations = this.getParameterOptimizations(
      indicatorId,
      context.strategyType,
      context.marketCondition,
      context.timeframe
    );
    
    // Ensure suitability is within bounds
    suitability = Math.max(0, Math.min(1, suitability));
    
    return {
      indicator,
      suitability,
      strengths: [...new Set(strengths)], // Remove duplicates
      weaknesses: [...new Set(weaknesses)],
      recommendations: [...new Set(recommendations)],
      parameterOptimizations
    };
  }

  /**
   * Get all indicators
   */
  public getAllIndicators(): TechnicalIndicator[] {
    return [...TECHNICAL_INDICATORS];
  }

  /**
   * Get indicator statistics
   */
  public getStatistics(): {
    totalIndicators: number;
    byCategory: Record<string, number>;
    byDifficulty: Record<string, number>;
    averagePopularity: number;
    compatibilityRules: number;
    strategyMappings: number;
  } {
    const byCategory: Record<string, number> = {};
    const byDifficulty: Record<string, number> = {};
    let totalPopularity = 0;

    TECHNICAL_INDICATORS.forEach(indicator => {
      byCategory[indicator.category] = (byCategory[indicator.category] || 0) + 1;
      byDifficulty[indicator.difficulty] = (byDifficulty[indicator.difficulty] || 0) + 1;
      totalPopularity += indicator.popularity;
    });

    return {
      totalIndicators: TECHNICAL_INDICATORS.length,
      byCategory,
      byDifficulty,
      averagePopularity: totalPopularity / TECHNICAL_INDICATORS.length,
      compatibilityRules: Array.from(this.compatibilityRules.values()).reduce((sum, rules) => sum + rules.length, 0),
      strategyMappings: this.strategyIndicatorMap.size
    };
  }

  // Private helper methods

  private checkLevelMatch(
    indicatorLevel: 'beginner' | 'intermediate' | 'advanced',
    userLevel: 'beginner' | 'intermediate' | 'advanced'
  ): { suitable: boolean; confidence: number } {
    const levelOrder = { beginner: 1, intermediate: 2, advanced: 3 };
    const indicatorLevelNum = levelOrder[indicatorLevel];
    const userLevelNum = levelOrder[userLevel];
    
    if (indicatorLevelNum <= userLevelNum) {
      return { suitable: true, confidence: 1.0 };
    } else if (indicatorLevelNum - userLevelNum === 1) {
      return { suitable: true, confidence: 0.7 }; // Challenging but manageable
    } else {
      return { suitable: false, confidence: 0.3 }; // Too advanced
    }
  }

  private generateSuggestionReason(
    indicator: TechnicalIndicator,
    strategyType: string,
    marketCondition?: string,
    timeframe?: string
  ): string {
    const reasons: string[] = [];
    
    reasons.push(`${indicator.name} is excellent for ${strategyType} strategies`);
    
    if (marketCondition && indicator.marketConditions.includes(marketCondition)) {
      reasons.push(`performs well in ${marketCondition} markets`);
    }
    
    if (timeframe && indicator.bestTimeframes.includes(timeframe)) {
      reasons.push(`optimized for ${timeframe} timeframe`);
    }
    
    reasons.push(`popularity score: ${indicator.popularity}/10`);
    
    return reasons.join(', ');
  }

  private getOptimizedParameters(
    indicator: TechnicalIndicator,
    strategyType: string,
    marketCondition?: string,
    timeframe?: string
  ): Record<string, unknown> {
    const optimized: Record<string, unknown> = {};
    
    indicator.parameters.forEach(param => {
      let value = param.defaultValue;
      
      // Apply strategy-specific optimizations
      if (param.name === 'period') {
        if (strategyType === 'scalping') {
          value = Math.max(5, Number(param.defaultValue) * 0.7); // Shorter periods for scalping
        } else if (strategyType === 'trend-following') {
          value = Math.min(50, Number(param.defaultValue) * 1.5); // Longer periods for trend following
        }
      }
      
      // Apply timeframe-specific optimizations
      if (timeframe && param.name === 'period') {
        const timeframeMultipliers: Record<string, number> = {
          '1m': 0.5, '5m': 0.7, '15m': 0.8, '1h': 1.0, '4h': 1.2, '1d': 1.5
        };
        const multiplier = timeframeMultipliers[timeframe] || 1.0;
        value = Math.round(Number(value) * multiplier);
      }
      
      // Apply market condition optimizations
      if (marketCondition === 'volatile' && param.name === 'stdDev') {
        value = Math.min(3.0, Number(param.defaultValue) * 1.2); // Wider bands for volatile markets
      }
      
      optimized[param.name] = value;
    });
    
    return optimized;
  }

  private getExpectedOutcome(indicator: TechnicalIndicator, strategyType: string): string {
    const outcomes: Record<string, string> = {
      'trend-following': 'Better trend identification and entry timing',
      'mean-reversion': 'Improved overbought/oversold detection',
      'breakout': 'Enhanced breakout confirmation and false signal reduction',
      'momentum': 'Stronger momentum signal validation',
      'scalping': 'More precise short-term entry and exit points'
    };
    
    return outcomes[strategyType] || `Enhanced ${indicator.useCases[0]}`;
  }

  private calculateParameterOptimization(
    param: IndicatorParameter,
    currentValue: unknown,
    strategyType: string,
    marketCondition?: string,
    timeframe?: string
  ): ParameterOptimization | null {
    if (param.type !== 'int' && param.type !== 'float') {
      return null; // Only optimize numeric parameters
    }
    
    const currentNum = Number(currentValue);
    let optimizedValue = currentNum;
    let reason = '';
    let impact: 'low' | 'medium' | 'high' = param.impact;
    let confidence = 0.7;
    
    // Strategy-based optimizations
    if (param.name === 'period') {
      if (strategyType === 'scalping') {
        optimizedValue = Math.max(5, Math.round(currentNum * 0.7));
        reason = 'Shorter period for faster signals in scalping strategy';
        confidence = 0.8;
      } else if (strategyType === 'trend-following') {
        optimizedValue = Math.min(50, Math.round(currentNum * 1.3));
        reason = 'Longer period for smoother trend identification';
        confidence = 0.8;
      }
    }
    
    // Market condition optimizations
    if (marketCondition === 'volatile' && param.name === 'stdDev') {
      optimizedValue = Math.min(3.0, currentNum * 1.2);
      reason = 'Wider standard deviation for volatile market conditions';
      confidence = 0.75;
    } else if (marketCondition === 'ranging' && param.name === 'period') {
      optimizedValue = Math.max(10, Math.round(currentNum * 0.8));
      reason = 'Shorter period for better responsiveness in ranging markets';
      confidence = 0.7;
    }
    
    // Timeframe optimizations
    if (timeframe && param.name === 'period') {
      const timeframeMultipliers: Record<string, number> = {
        '1m': 0.5, '5m': 0.7, '15m': 0.9, '1h': 1.0, '4h': 1.2, '1d': 1.5
      };
      const multiplier = timeframeMultipliers[timeframe];
      if (multiplier && multiplier !== 1.0) {
        optimizedValue = Math.round(currentNum * multiplier);
        reason = `Adjusted period for ${timeframe} timeframe characteristics`;
        confidence = 0.75;
      }
    }
    
    // Only return optimization if there's a meaningful change
    if (Math.abs(optimizedValue - currentNum) < 0.1) {
      return null;
    }
    
    return {
      parameterId: param.name,
      parameterName: param.name,
      currentValue,
      optimizedValue,
      reason,
      impact,
      marketCondition: marketCondition || 'general',
      confidence
    };
  }
}