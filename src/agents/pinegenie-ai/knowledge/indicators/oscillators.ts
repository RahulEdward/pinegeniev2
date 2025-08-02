/**
 * Oscillator Indicators Knowledge Base
 * 
 * Specialized oscillator indicators with advanced analysis capabilities
 */

import { TechnicalIndicator, IndicatorParameter, IndicatorOutput, IndicatorInterpretation } from './technical';

export const OSCILLATOR_INDICATORS: TechnicalIndicator[] = [
  {
    id: 'williams_r',
    name: 'Williams %R',
    category: 'oscillator',
    description: 'Momentum oscillator that measures overbought and oversold levels',
    formula: '%R = (Highest High - Close) / (Highest High - Lowest Low) * -100',
    parameters: [
      {
        name: 'period',
        type: 'int',
        defaultValue: 14,
        range: [5, 50],
        description: 'Lookback period for highest high and lowest low',
        impact: 'high'
      }
    ],
    outputs: [
      {
        name: 'williams_r',
        type: 'line',
        description: 'Williams %R oscillator line',
        range: [-100, 0]
      }
    ],
    interpretation: {
      bullishSignals: [
        'Williams %R crosses above -80 from oversold',
        'Bullish divergence with price',
        'Williams %R breaks above -50'
      ],
      bearishSignals: [
        'Williams %R crosses below -20 from overbought',
        'Bearish divergence with price',
        'Williams %R breaks below -50'
      ],
      neutralSignals: [
        'Williams %R between -60 and -40',
        'Sideways movement around -50'
      ],
      divergenceSignals: [
        'Price makes new high but Williams %R doesn\'t',
        'Price makes new low but Williams %R doesn\'t'
      ],
      extremeLevels: {
        overbought: -20,
        oversold: -80
      }
    },
    useCases: [
      'Identify overbought/oversold conditions',
      'Momentum divergence analysis',
      'Short-term reversal signals',
      'Confirm trend exhaustion'
    ],
    bestTimeframes: ['5m', '15m', '1h', '4h'],
    marketConditions: ['ranging', 'volatile', 'sideways'],
    combinations: ['rsi', 'stochastic', 'bollinger_bands'],
    strengths: [
      'Very sensitive to price changes',
      'Good for short-term trading',
      'Clear overbought/oversold levels',
      'Works well with other oscillators'
    ],
    weaknesses: [
      'Very noisy and prone to false signals',
      'Can stay extreme for extended periods',
      'Poor performance in strong trends',
      'Requires confirmation from other indicators'
    ],
    difficulty: 'intermediate',
    popularity: 6
  },
  {
    id: 'cci',
    name: 'Commodity Channel Index',
    category: 'oscillator',
    description: 'Momentum oscillator that identifies cyclical trends and overbought/oversold conditions',
    formula: 'CCI = (Typical Price - SMA) / (0.015 * Mean Deviation)',
    parameters: [
      {
        name: 'period',
        type: 'int',
        defaultValue: 20,
        range: [10, 50],
        description: 'Period for CCI calculation',
        impact: 'high'
      }
    ],
    outputs: [
      {
        name: 'cci',
        type: 'line',
        description: 'CCI oscillator line'
      }
    ],
    interpretation: {
      bullishSignals: [
        'CCI crosses above +100',
        'CCI crosses above 0 from negative territory',
        'Bullish divergence with price'
      ],
      bearishSignals: [
        'CCI crosses below -100',
        'CCI crosses below 0 from positive territory',
        'Bearish divergence with price'
      ],
      neutralSignals: [
        'CCI oscillating between -100 and +100',
        'CCI near zero line'
      ],
      divergenceSignals: [
        'Price trends don\'t match CCI direction',
        'Multiple divergence patterns'
      ],
      extremeLevels: {
        overbought: 100,
        oversold: -100
      }
    },
    useCases: [
      'Identify cyclical turning points',
      'Overbought/oversold analysis',
      'Trend strength measurement',
      'Divergence detection'
    ],
    bestTimeframes: ['15m', '1h', '4h', '1d'],
    marketConditions: ['trending', 'cyclical', 'volatile'],
    combinations: ['rsi', 'macd', 'bollinger_bands'],
    strengths: [
      'Good for cyclical markets',
      'Unbounded oscillator',
      'Effective divergence tool',
      'Works across different timeframes'
    ],
    weaknesses: [
      'Can be very volatile',
      'Difficult to interpret extreme readings',
      'Prone to false breakouts',
      'Requires experience to use effectively'
    ],
    difficulty: 'advanced',
    popularity: 5
  },
  {
    id: 'roc',
    name: 'Rate of Change',
    category: 'momentum',
    description: 'Momentum oscillator that measures the percentage change in price over a specified period',
    formula: 'ROC = ((Close - Close_n) / Close_n) * 100',
    parameters: [
      {
        name: 'period',
        type: 'int',
        defaultValue: 12,
        range: [5, 50],
        description: 'Period for rate of change calculation',
        impact: 'high'
      }
    ],
    outputs: [
      {
        name: 'roc',
        type: 'line',
        description: 'Rate of Change line'
      }
    ],
    interpretation: {
      bullishSignals: [
        'ROC crosses above zero line',
        'ROC making higher highs',
        'Positive ROC acceleration'
      ],
      bearishSignals: [
        'ROC crosses below zero line',
        'ROC making lower lows',
        'Negative ROC acceleration'
      ],
      neutralSignals: [
        'ROC oscillating around zero',
        'ROC showing no clear direction'
      ],
      divergenceSignals: [
        'Price trends opposite to ROC direction',
        'ROC momentum weakening while price continues'
      ]
    },
    useCases: [
      'Momentum analysis',
      'Trend strength measurement',
      'Identify momentum shifts',
      'Compare relative performance'
    ],
    bestTimeframes: ['1h', '4h', '1d', '1w'],
    marketConditions: ['trending', 'momentum'],
    combinations: ['macd', 'rsi', 'moving_averages'],
    strengths: [
      'Simple and intuitive',
      'Good momentum indicator',
      'Effective for trend analysis',
      'Works well with moving averages'
    ],
    weaknesses: [
      'Can be volatile',
      'Prone to whipsaws',
      'No defined overbought/oversold levels',
      'Requires trend confirmation'
    ],
    difficulty: 'beginner',
    popularity: 6
  }
];

export class OscillatorDatabase {
  private oscillators: Map<string, TechnicalIndicator>;

  constructor() {
    this.oscillators = new Map();
    this.buildOscillatorMap();
  }

  private buildOscillatorMap(): void {
    OSCILLATOR_INDICATORS.forEach(oscillator => {
      this.oscillators.set(oscillator.id, oscillator);
    });
  }

  /**
   * Get oscillator by ID
   */
  public getOscillator(id: string): TechnicalIndicator | null {
    return this.oscillators.get(id) || null;
  }

  /**
   * Get all oscillators
   */
  public getAllOscillators(): TechnicalIndicator[] {
    return [...OSCILLATOR_INDICATORS];
  }

  /**
   * Get oscillators by sensitivity level
   */
  public getOscillatorsBySensitivity(sensitivity: 'high' | 'medium' | 'low'): TechnicalIndicator[] {
    const sensitivityMap: Record<string, string[]> = {
      high: ['williams_r', 'stochastic'],
      medium: ['rsi', 'cci'],
      low: ['roc', 'macd']
    };

    const targetIds = sensitivityMap[sensitivity] || [];
    return OSCILLATOR_INDICATORS.filter(osc => targetIds.includes(osc.id));
  }

  /**
   * Get complementary oscillator pairs
   */
  public getComplementaryPairs(): Array<{
    primary: TechnicalIndicator;
    secondary: TechnicalIndicator;
    synergy: string;
    effectiveness: number;
  }> {
    return [
      {
        primary: this.getOscillator('rsi')!,
        secondary: this.getOscillator('williams_r')!,
        synergy: 'RSI provides broader momentum view while Williams %R gives precise timing',
        effectiveness: 0.75
      },
      {
        primary: this.getOscillator('cci')!,
        secondary: this.getOscillator('roc')!,
        synergy: 'CCI identifies cyclical extremes while ROC confirms momentum direction',
        effectiveness: 0.70
      }
    ];
  }

  /**
   * Analyze oscillator divergences
   */
  public analyzeDivergences(
    oscillatorId: string,
    priceData: Array<{ high: number; low: number; close: number; timestamp: number }>,
    oscillatorValues: number[]
  ): Array<{
    type: 'bullish' | 'bearish';
    strength: 'weak' | 'moderate' | 'strong';
    startIndex: number;
    endIndex: number;
    description: string;
  }> {
    // This would implement actual divergence detection logic
    // For now, return a placeholder structure
    return [
      {
        type: 'bullish',
        strength: 'moderate',
        startIndex: 10,
        endIndex: 20,
        description: 'Price made lower low while oscillator made higher low'
      }
    ];
  }

  /**
   * Get oscillator statistics
   */
  public getStatistics(): {
    totalOscillators: number;
    byDifficulty: Record<string, number>;
    averagePopularity: number;
  } {
    const byDifficulty: Record<string, number> = {};
    let totalPopularity = 0;

    OSCILLATOR_INDICATORS.forEach(oscillator => {
      byDifficulty[oscillator.difficulty] = (byDifficulty[oscillator.difficulty] || 0) + 1;
      totalPopularity += oscillator.popularity;
    });

    return {
      totalOscillators: OSCILLATOR_INDICATORS.length,
      byDifficulty,
      averagePopularity: totalPopularity / OSCILLATOR_INDICATORS.length
    };
  }
}