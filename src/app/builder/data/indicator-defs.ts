/**
* Indicator Definitions - Complete Library of Technical Indicators
* 
* This file contains:
* - Comprehensive indicator definitions with parameters
* - Categorized indicator library (Trend, Momentum, Volatility, Volume)
* - Parameter specifications with validation rules
* - Pine Script function mapping
* - Input/output definitions for each indicator
* - Category-based organization and filtering
*/

export interface IndicatorParameter {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'select';
  default: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  description?: string;
  group?: string;
}

export interface IndicatorDefinition {
  id: string;
  name: string;
  fullName: string;
  description: string;
  category: 'Trend' | 'Momentum' | 'Volatility' | 'Volume' | 'Support/Resistance' | 'Custom';
  type: 'indicator' | 'oscillator' | 'overlay' | 'utility';
  parameters: IndicatorParameter[];
  inputs: string[];
  outputs: string[];
  pineFunction: string;
  range?: { min: number; max: number };
  levels?: { [key: string]: number };
  defaultParams: Record<string, string | number | boolean>;
  examples?: string[];
  tags?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const indicatorDefinitions: IndicatorDefinition[] = [
  // =============================================================================
  // TREND INDICATORS
  // =============================================================================
  {
    id: 'sma',
    name: 'SMA',
    fullName: 'Simple Moving Average',
    description: 'Average price over a specified number of periods. Most basic trend-following indicator.',
    category: 'Trend',
    type: 'overlay',
    parameters: [
      {
        name: 'period',
        type: 'number',
        default: 20,
        min: 1,
        max: 500,
        description: 'Number of periods for calculation'
      },
      {
        name: 'source',
        type: 'select',
        default: 'close',
        options: ['open', 'high', 'low', 'close', 'hl2', 'hlc3', 'ohlc4'],
        description: 'Price source for calculation'
      }
    ],
    inputs: ['source'],
    outputs: ['sma'],
    pineFunction: 'ta.sma(source, period)',
    defaultParams: { period: 20, source: 'close' },
    examples: ['SMA(20) for trend direction', 'SMA(50) vs SMA(200) golden cross'],
    tags: ['moving average', 'trend', 'basic'],
    difficulty: 'beginner'
  },

  {
    id: 'ema',
    name: 'EMA',
    fullName: 'Exponential Moving Average',
    description: 'Moving average that gives more weight to recent prices, responding faster to price changes.',
    category: 'Trend',
    type: 'overlay',
    parameters: [
      {
        name: 'period',
        type: 'number',
        default: 20,
        min: 1,
        max: 500,
        description: 'Number of periods for calculation'
      },
      {
        name: 'source',
        type: 'select',
        default: 'close',
        options: ['open', 'high', 'low', 'close', 'hl2', 'hlc3', 'ohlc4'],
        description: 'Price source for calculation'
      }
    ],
    inputs: ['source'],
    outputs: ['ema'],
    pineFunction: 'ta.ema(source, period)',
    defaultParams: { period: 20, source: 'close' },
    examples: ['EMA(12) vs EMA(26) crossover', 'EMA(21) dynamic support/resistance'],
    tags: ['moving average', 'trend', 'responsive'],
    difficulty: 'beginner'
  },

  {
    id: 'wma',
    name: 'WMA',
    fullName: 'Weighted Moving Average',
    description: 'Moving average that assigns more weight to recent data points in a linear fashion.',
    category: 'Trend',
    type: 'overlay',
    parameters: [
      {
        name: 'period',
        type: 'number',
        default: 20,
        min: 1,
        max: 500,
        description: 'Number of periods for calculation'
      },
      {
        name: 'source',
        type: 'select',
        default: 'close',
        options: ['open', 'high', 'low', 'close', 'hl2', 'hlc3', 'ohlc4'],
        description: 'Price source for calculation'
      }
    ],
    inputs: ['source'],
    outputs: ['wma'],
    pineFunction: 'ta.wma(source, period)',
    defaultParams: { period: 20, source: 'close' },
    examples: ['WMA(14) for trend confirmation'],
    tags: ['moving average', 'trend', 'weighted'],
    difficulty: 'intermediate'
  },

  // =============================================================================
  // MOMENTUM INDICATORS
  // =============================================================================
  {
    id: 'rsi',
    name: 'RSI',
    fullName: 'Relative Strength Index',
    description: 'Momentum oscillator measuring speed and change of price movements to identify overbought/oversold conditions.',
    category: 'Momentum',
    type: 'oscillator',
    parameters: [
      {
        name: 'period',
        type: 'number',
        default: 14,
        min: 2,
        max: 100,
        description: 'Number of periods for RSI calculation'
      },
      {
        name: 'source',
        type: 'select',
        default: 'close',
        options: ['open', 'high', 'low', 'close', 'hl2', 'hlc3', 'ohlc4'],
        description: 'Price source for calculation'
      },
      {
        name: 'overboughtLevel',
        type: 'number',
        default: 70,
        min: 50,
        max: 95,
        description: 'Overbought threshold level'
      },
      {
        name: 'oversoldLevel',
        type: 'number',
        default: 30,
        min: 5,
        max: 50,
        description: 'Oversold threshold level'
      }
    ],
    inputs: ['source'],
    outputs: ['rsi'],
    pineFunction: 'ta.rsi(source, period)',
    range: { min: 0, max: 100 },
    levels: { overbought: 70, oversold: 30, neutral: 50 },
    defaultParams: { period: 14, source: 'close', overboughtLevel: 70, oversoldLevel: 30 },
    examples: ['RSI(14) < 30 = oversold', 'RSI(14) > 70 = overbought', 'RSI divergence signals'],
    tags: ['momentum', 'oscillator', 'overbought', 'oversold'],
    difficulty: 'beginner'
  },

  {
    id: 'macd',
    name: 'MACD',
    fullName: 'Moving Average Convergence Divergence',
    description: 'Trend-following momentum indicator showing relationship between two moving averages.',
    category: 'Momentum',
    type: 'oscillator',
    parameters: [
      {
        name: 'fastPeriod',
        type: 'number',
        default: 12,
        min: 1,
        max: 50,
        description: 'Fast EMA period'
      },
      {
        name: 'slowPeriod',
        type: 'number',
        default: 26,
        min: 1,
        max: 100,
        description: 'Slow EMA period'
      },
      {
        name: 'signalPeriod',
        type: 'number',
        default: 9,
        min: 1,
        max: 50,
        description: 'Signal line EMA period'
      },
      {
        name: 'source',
        type: 'select',
        default: 'close',
        options: ['open', 'high', 'low', 'close', 'hl2', 'hlc3', 'ohlc4'],
        description: 'Price source for calculation'
      }
    ],
    inputs: ['source'],
    outputs: ['macd', 'signal', 'histogram'],
    pineFunction: 'ta.macd(source, fastPeriod, slowPeriod, signalPeriod)',
    levels: { zero: 0 },
    defaultParams: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, source: 'close' },
    examples: ['MACD line crosses signal line', 'MACD histogram momentum', 'Zero line crossover'],
    tags: ['momentum', 'trend', 'crossover', 'histogram'],
    difficulty: 'intermediate'
  },

  {
    id: 'stoch',
    name: 'Stochastic',
    fullName: 'Stochastic Oscillator',
    description: 'Momentum indicator comparing closing price to price range over a specific period.',
    category: 'Momentum',
    type: 'oscillator',
    parameters: [
      {
        name: 'kPeriod',
        type: 'number',
        default: 14,
        min: 1,
        max: 100,
        description: '%K period'
      },
      {
        name: 'dPeriod',
        type: 'number',
        default: 3,
        min: 1,
        max: 50,
        description: '%D smoothing period'
      },
      {
        name: 'smooth',
        type: 'number',
        default: 3,
        min: 1,
        max: 50,
        description: 'Smoothing period'
      }
    ],
    inputs: ['high', 'low', 'close'],
    outputs: ['k', 'd'],
    pineFunction: 'ta.stoch(close, high, low, kPeriod)',
    range: { min: 0, max: 100 },
    levels: { overbought: 80, oversold: 20 },
    defaultParams: { kPeriod: 14, dPeriod: 3, smooth: 3 },
    examples: ['Stoch %K crosses %D', 'Stoch < 20 oversold', 'Stoch > 80 overbought'],
    tags: ['momentum', 'oscillator', 'overbought', 'oversold'],
    difficulty: 'intermediate'
  },

  // =============================================================================
  // VOLATILITY INDICATORS
  // =============================================================================
  {
    id: 'bb',
    name: 'Bollinger Bands',
    fullName: 'Bollinger Bands',
    description: 'Volatility bands plotted at standard deviations above and below a moving average.',
    category: 'Volatility',
    type: 'overlay',
    parameters: [
      {
        name: 'period',
        type: 'number',
        default: 20,
        min: 2,
        max: 100,
        description: 'Moving average period'
      },
      {
        name: 'stddev',
        type: 'number',
        default: 2,
        min: 0.1,
        max: 5,
        step: 0.1,
        description: 'Standard deviation multiplier'
      },
      {
        name: 'source',
        type: 'select',
        default: 'close',
        options: ['open', 'high', 'low', 'close', 'hl2', 'hlc3', 'ohlc4'],
        description: 'Price source for calculation'
      }
    ],
    inputs: ['source'],
    outputs: ['basis', 'upper', 'lower'],
    pineFunction: 'ta.bb(source, period, stddev)',
    defaultParams: { period: 20, stddev: 2, source: 'close' },
    examples: ['Price touches upper band = overbought', 'Bollinger Band squeeze', 'Band width expansion'],
    tags: ['volatility', 'bands', 'support', 'resistance'],
    difficulty: 'intermediate'
  },

  {
    id: 'atr',
    name: 'ATR',
    fullName: 'Average True Range',
    description: 'Volatility indicator measuring the degree of price movement over a specified period.',
    category: 'Volatility',
    type: 'indicator',
    parameters: [
      {
        name: 'period',
        type: 'number',
        default: 14,
        min: 1,
        max: 100,
        description: 'Number of periods for ATR calculation'
      }
    ],
    inputs: ['high', 'low', 'close'],
    outputs: ['atr'],
    pineFunction: 'ta.atr(period)',
    defaultParams: { period: 14 },
    examples: ['ATR for stop loss placement', 'ATR-based position sizing', 'Volatility breakout signals'],
    tags: ['volatility', 'true range', 'stop loss'],
    difficulty: 'intermediate'
  },

  // =============================================================================
  // VOLUME INDICATORS
  // =============================================================================
  {
    id: 'obv',
    name: 'OBV',
    fullName: 'On-Balance Volume',
    description: 'Volume-based indicator using volume flow to predict changes in stock price.',
    category: 'Volume',
    type: 'indicator',
    parameters: [
      {
        name: 'source',
        type: 'select',
        default: 'close',
        options: ['open', 'high', 'low', 'close', 'hl2', 'hlc3', 'ohlc4'],
        description: 'Price source for comparison'
      }
    ],
    inputs: ['close', 'volume'],
    outputs: ['obv'],
    pineFunction: 'ta.obv',
    defaultParams: { source: 'close' },
    examples: ['OBV divergence with price', 'OBV trend confirmation'],
    tags: ['volume', 'flow', 'divergence'],
    difficulty: 'intermediate'
  },

  {
    id: 'mfi',
    name: 'MFI',
    fullName: 'Money Flow Index',
    description: 'Volume-weighted RSI that incorporates both price and volume data.',
    category: 'Volume',
    type: 'oscillator',
    parameters: [
      {
        name: 'period',
        type: 'number',
        default: 14,
        min: 1,
        max: 100,
        description: 'Number of periods for MFI calculation'
      }
    ],
    inputs: ['high', 'low', 'close', 'volume'],
    outputs: ['mfi'],
    pineFunction: 'ta.mfi(hlc3, period)',
    range: { min: 0, max: 100 },
    levels: { overbought: 80, oversold: 20 },
    defaultParams: { period: 14 },
    examples: ['MFI > 80 = overbought', 'MFI < 20 = oversold', 'MFI divergence'],
    tags: ['volume', 'momentum', 'money flow'],
    difficulty: 'intermediate'
  },

  // =============================================================================
  // ADVANCED INDICATORS
  // =============================================================================
  {
    id: 'adx',
    name: 'ADX',
    fullName: 'Average Directional Index',
    description: 'Trend strength indicator measuring the strength of a trend regardless of direction.',
    category: 'Trend',
    type: 'indicator',
    parameters: [
      {
        name: 'period',
        type: 'number',
        default: 14,
        min: 1,
        max: 100,
        description: 'DI smoothing period'
      },
      {
        name: 'adxPeriod',
        type: 'number',
        default: 14,
        min: 1,
        max: 100,
        description: 'ADX smoothing period'
      }
    ],
    inputs: ['high', 'low', 'close'],
    outputs: ['adx', 'di_plus', 'di_minus'],
    pineFunction: 'ta.adx(period)',
    range: { min: 0, max: 100 },
    levels: { strong: 25, weak: 20 },
    defaultParams: { period: 14, adxPeriod: 14 },
    examples: ['ADX > 25 = strong trend', 'DI+ > DI- = uptrend', 'ADX declining = weakening trend'],
    tags: ['trend', 'strength', 'directional'],
    difficulty: 'advanced'
  },

  {
    id: 'cci',
    name: 'CCI',
    fullName: 'Commodity Channel Index',
    description: 'Oscillator identifying cyclical trends and measuring deviation from statistical mean.',
    category: 'Momentum',
    type: 'oscillator',
    parameters: [
      {
        name: 'period',
        type: 'number',
        default: 20,
        min: 1,
        max: 100,
        description: 'Number of periods for CCI calculation'
      },
      {
        name: 'source',
        type: 'select',
        default: 'hlc3',
        options: ['open', 'high', 'low', 'close', 'hl2', 'hlc3', 'ohlc4'],
        description: 'Price source for calculation'
      }
    ],
    inputs: ['source'],
    outputs: ['cci'],
    pineFunction: 'ta.cci(source, period)',
    levels: { overbought: 100, oversold: -100, zero: 0 },
    defaultParams: { period: 20, source: 'hlc3' },
    examples: ['CCI > 100 = overbought', 'CCI < -100 = oversold', 'Zero line crossover'],
    tags: ['momentum', 'cyclical', 'commodity'],
    difficulty: 'advanced'
  },

  {
    id: 'williams_r',
    name: 'Williams %R',
    fullName: 'Williams Percent Range',
    description: 'Momentum indicator measuring overbought/oversold levels, similar to Stochastic.',
    category: 'Momentum',
    type: 'oscillator',
    parameters: [
      {
        name: 'period',
        type: 'number',
        default: 14,
        min: 1,
        max: 100,
        description: 'Lookback period'
      }
    ],
    inputs: ['high', 'low', 'close'],
    outputs: ['williams_r'],
    pineFunction: '(ta.highest(high, period) - close) / (ta.highest(high, period) - ta.lowest(low, period)) * -100',
    range: { min: -100, max: 0 },
    levels: { overbought: -20, oversold: -80 },
    defaultParams: { period: 14 },
    examples: ['%R > -20 = overbought', '%R < -80 = oversold'],
    tags: ['momentum', 'overbought', 'oversold'],
    difficulty: 'intermediate'
  },

  // =============================================================================
  // ADDITIONAL TREND INDICATORS
  // =============================================================================
  {
    id: 'vwma',
    name: 'VWMA',
    fullName: 'Volume Weighted Moving Average',
    description: 'Moving average that weights price by volume, giving more importance to high-volume periods.',
    category: 'Trend',
    type: 'overlay',
    parameters: [
      {
        name: 'period',
        type: 'number',
        default: 20,
        min: 1,
        max: 500,
        description: 'Number of periods for calculation'
      },
      {
        name: 'source',
        type: 'select',
        default: 'close',
        options: ['open', 'high', 'low', 'close', 'hl2', 'hlc3', 'ohlc4'],
        description: 'Price source for calculation'
      }
    ],
    inputs: ['source', 'volume'],
    outputs: ['vwma'],
    pineFunction: 'ta.vwma(source, period)',
    defaultParams: { period: 20, source: 'close' },
    examples: ['VWMA for volume-weighted trend', 'VWMA vs SMA comparison'],
    tags: ['moving average', 'volume', 'weighted'],
    difficulty: 'intermediate'
  },

  {
    id: 'hma',
    name: 'HMA',
    fullName: 'Hull Moving Average',
    description: 'Fast and smooth moving average that reduces lag while maintaining smoothness.',
    category: 'Trend',
    type: 'overlay',
    parameters: [
      {
        name: 'period',
        type: 'number',
        default: 20,
        min: 1,
        max: 500,
        description: 'Number of periods for calculation'
      },
      {
        name: 'source',
        type: 'select',
        default: 'close',
        options: ['open', 'high', 'low', 'close', 'hl2', 'hlc3', 'ohlc4'],
        description: 'Price source for calculation'
      }
    ],
    inputs: ['source'],
    outputs: ['hma'],
    pineFunction: 'ta.hma(source, period)',
    defaultParams: { period: 20, source: 'close' },
    examples: ['HMA for reduced lag signals', 'HMA color change for trend'],
    tags: ['moving average', 'hull', 'fast', 'smooth'],
    difficulty: 'advanced'
  },

  {
    id: 'keltner',
    name: 'Keltner Channels',
    fullName: 'Keltner Channels',
    description: 'Volatility-based envelope indicator using ATR to set channel width.',
    category: 'Volatility',
    type: 'overlay',
    parameters: [
      {
        name: 'period',
        type: 'number',
        default: 20,
        min: 1,
        max: 100,
        description: 'EMA period for center line'
      },
      {
        name: 'atrPeriod',
        type: 'number',
        default: 10,
        min: 1,
        max: 100,
        description: 'ATR period for channel width'
      },
      {
        name: 'multiplier',
        type: 'number',
        default: 2,
        min: 0.1,
        max: 10,
        step: 0.1,
        description: 'ATR multiplier for channel width'
      }
    ],
    inputs: ['high', 'low', 'close'],
    outputs: ['basis', 'upper', 'lower'],
    pineFunction: 'ta.kc(close, period, multiplier)',
    defaultParams: { period: 20, atrPeriod: 10, multiplier: 2 },
    examples: ['Price breakout above upper channel', 'Keltner squeeze patterns'],
    tags: ['volatility', 'channels', 'atr', 'breakout'],
    difficulty: 'intermediate'
  },

  {
    id: 'donchian',
    name: 'Donchian Channels',
    fullName: 'Donchian Channels',
    description: 'Price channel indicator showing highest high and lowest low over a period.',
    category: 'Support/Resistance',
    type: 'overlay',
    parameters: [
      {
        name: 'period',
        type: 'number',
        default: 20,
        min: 1,
        max: 100,
        description: 'Lookback period for high/low'
      }
    ],
    inputs: ['high', 'low'],
    outputs: ['upper', 'lower', 'basis'],
    pineFunction: 'ta.donchian(period)',
    defaultParams: { period: 20 },
    examples: ['Donchian breakout strategy', 'Support/resistance levels'],
    tags: ['channels', 'breakout', 'support', 'resistance'],
    difficulty: 'beginner'
  },

  // =============================================================================
  // ADDITIONAL MOMENTUM INDICATORS
  // =============================================================================
  {
    id: 'roc',
    name: 'ROC',
    fullName: 'Rate of Change',
    description: 'Momentum indicator measuring percentage change in price over a specified period.',
    category: 'Momentum',
    type: 'oscillator',
    parameters: [
      {
        name: 'period',
        type: 'number',
        default: 12,
        min: 1,
        max: 100,
        description: 'Number of periods for ROC calculation'
      },
      {
        name: 'source',
        type: 'select',
        default: 'close',
        options: ['open', 'high', 'low', 'close', 'hl2', 'hlc3', 'ohlc4'],
        description: 'Price source for calculation'
      }
    ],
    inputs: ['source'],
    outputs: ['roc'],
    pineFunction: 'ta.roc(source, period)',
    levels: { zero: 0 },
    defaultParams: { period: 12, source: 'close' },
    examples: ['ROC > 0 = upward momentum', 'ROC divergence signals'],
    tags: ['momentum', 'rate of change', 'percentage'],
    difficulty: 'beginner'
  },

  {
    id: 'tsi',
    name: 'TSI',
    fullName: 'True Strength Index',
    description: 'Double-smoothed momentum indicator that filters out price noise.',
    category: 'Momentum',
    type: 'oscillator',
    parameters: [
      {
        name: 'longPeriod',
        type: 'number',
        default: 25,
        min: 1,
        max: 100,
        description: 'Long smoothing period'
      },
      {
        name: 'shortPeriod',
        type: 'number',
        default: 13,
        min: 1,
        max: 50,
        description: 'Short smoothing period'
      },
      {
        name: 'signalPeriod',
        type: 'number',
        default: 7,
        min: 1,
        max: 50,
        description: 'Signal line period'
      }
    ],
    inputs: ['close'],
    outputs: ['tsi', 'signal'],
    pineFunction: 'ta.tsi(close, longPeriod, shortPeriod)',
    range: { min: -100, max: 100 },
    levels: { zero: 0, overbought: 25, oversold: -25 },
    defaultParams: { longPeriod: 25, shortPeriod: 13, signalPeriod: 7 },
    examples: ['TSI crosses signal line', 'TSI zero line crossover'],
    tags: ['momentum', 'smoothed', 'true strength'],
    difficulty: 'advanced'
  },

  {
    id: 'awesome',
    name: 'AO',
    fullName: 'Awesome Oscillator',
    description: 'Momentum indicator comparing recent momentum to longer-term momentum.',
    category: 'Momentum',
    type: 'oscillator',
    parameters: [
      {
        name: 'fastPeriod',
        type: 'number',
        default: 5,
        min: 1,
        max: 50,
        description: 'Fast SMA period'
      },
      {
        name: 'slowPeriod',
        type: 'number',
        default: 34,
        min: 1,
        max: 100,
        description: 'Slow SMA period'
      }
    ],
    inputs: ['high', 'low'],
    outputs: ['ao'],
    pineFunction: 'ta.sma(hl2, fastPeriod) - ta.sma(hl2, slowPeriod)',
    levels: { zero: 0 },
    defaultParams: { fastPeriod: 5, slowPeriod: 34 },
    examples: ['AO crosses zero line', 'AO saucer pattern', 'AO twin peaks'],
    tags: ['momentum', 'awesome', 'bill williams'],
    difficulty: 'intermediate'
  },

  // =============================================================================
  // ADDITIONAL VOLUME INDICATORS
  // =============================================================================
  {
    id: 'ad',
    name: 'A/D Line',
    fullName: 'Accumulation/Distribution Line',
    description: 'Volume indicator that measures cumulative flow of money into and out of a security.',
    category: 'Volume',
    type: 'indicator',
    parameters: [
      {
        name: 'source',
        type: 'select',
        default: 'close',
        options: ['close', 'hlc3'],
        description: 'Price source for calculation'
      }
    ],
    inputs: ['high', 'low', 'close', 'volume'],
    outputs: ['ad'],
    pineFunction: 'ta.ad',
    defaultParams: { source: 'close' },
    examples: ['A/D line divergence', 'Volume confirmation'],
    tags: ['volume', 'accumulation', 'distribution'],
    difficulty: 'intermediate'
  },

  {
    id: 'cmf',
    name: 'CMF',
    fullName: 'Chaikin Money Flow',
    description: 'Volume-weighted average of accumulation/distribution over a specified period.',
    category: 'Volume',
    type: 'oscillator',
    parameters: [
      {
        name: 'period',
        type: 'number',
        default: 20,
        min: 1,
        max: 100,
        description: 'Number of periods for CMF calculation'
      }
    ],
    inputs: ['high', 'low', 'close', 'volume'],
    outputs: ['cmf'],
    pineFunction: 'ta.cmf(period)',
    range: { min: -1, max: 1 },
    levels: { zero: 0, strong_buying: 0.25, strong_selling: -0.25 },
    defaultParams: { period: 20 },
    examples: ['CMF > 0 = buying pressure', 'CMF < 0 = selling pressure'],
    tags: ['volume', 'money flow', 'chaikin'],
    difficulty: 'intermediate'
  },

  {
    id: 'vwap',
    name: 'VWAP',
    fullName: 'Volume Weighted Average Price',
    description: 'Trading benchmark that gives average price weighted by volume.',
    category: 'Volume',
    type: 'overlay',
    parameters: [
      {
        name: 'source',
        type: 'select',
        default: 'hlc3',
        options: ['open', 'high', 'low', 'close', 'hl2', 'hlc3', 'ohlc4'],
        description: 'Price source for calculation'
      },
      {
        name: 'anchor',
        type: 'select',
        default: 'session',
        options: ['session', 'week', 'month'],
        description: 'VWAP reset period'
      }
    ],
    inputs: ['source', 'volume'],
    outputs: ['vwap'],
    pineFunction: 'ta.vwap(source)',
    defaultParams: { source: 'hlc3', anchor: 'session' },
    examples: ['Price above VWAP = bullish', 'VWAP as support/resistance'],
    tags: ['volume', 'weighted', 'average', 'benchmark'],
    difficulty: 'beginner'
  },

  // =============================================================================
  // ADDITIONAL VOLATILITY INDICATORS
  // =============================================================================
  {
    id: 'dch',
    name: 'DCH',
    fullName: 'Donchian Channel High/Low',
    description: 'Highest high and lowest low over a specified period for breakout strategies.',
    category: 'Volatility',
    type: 'overlay',
    parameters: [
      {
        name: 'period',
        type: 'number',
        default: 20,
        min: 1,
        max: 100,
        description: 'Lookback period'
      }
    ],
    inputs: ['high', 'low'],
    outputs: ['upper', 'lower'],
    pineFunction: 'ta.highest(high, period), ta.lowest(low, period)',
    defaultParams: { period: 20 },
    examples: ['Breakout above DCH upper', 'Support at DCH lower'],
    tags: ['volatility', 'breakout', 'channels'],
    difficulty: 'beginner'
  },

  {
    id: 'stddev',
    name: 'StdDev',
    fullName: 'Standard Deviation',
    description: 'Statistical measure of price volatility and dispersion from the mean.',
    category: 'Volatility',
    type: 'indicator',
    parameters: [
      {
        name: 'period',
        type: 'number',
        default: 20,
        min: 1,
        max: 100,
        description: 'Number of periods for calculation'
      },
      {
        name: 'source',
        type: 'select',
        default: 'close',
        options: ['open', 'high', 'low', 'close', 'hl2', 'hlc3', 'ohlc4'],
        description: 'Price source for calculation'
      }
    ],
    inputs: ['source'],
    outputs: ['stddev'],
    pineFunction: 'ta.stdev(source, period)',
    defaultParams: { period: 20, source: 'close' },
    examples: ['High StdDev = high volatility', 'Low StdDev = consolidation'],
    tags: ['volatility', 'standard deviation', 'statistical'],
    difficulty: 'intermediate'
  },

  // =============================================================================
  // SUPPORT/RESISTANCE INDICATORS
  // =============================================================================
  {
    id: 'pivot',
    name: 'Pivot Points',
    fullName: 'Pivot Points',
    description: 'Support and resistance levels calculated from previous period high, low, and close.',
    category: 'Support/Resistance',
    type: 'overlay',
    parameters: [
      {
        name: 'type',
        type: 'select',
        default: 'traditional',
        options: ['traditional', 'fibonacci', 'woodie', 'camarilla'],
        description: 'Pivot calculation method'
      },
      {
        name: 'timeframe',
        type: 'select',
        default: 'daily',
        options: ['daily', 'weekly', 'monthly'],
        description: 'Pivot timeframe'
      }
    ],
    inputs: ['high', 'low', 'close'],
    outputs: ['pp', 'r1', 'r2', 'r3', 's1', 's2', 's3'],
    pineFunction: 'request.security(syminfo.tickerid, "1D", [high[1], low[1], close[1]])',
    defaultParams: { type: 'traditional', timeframe: 'daily' },
    examples: ['Price bounces off S1', 'Breakout above R1', 'PP as support/resistance'],
    tags: ['pivot', 'support', 'resistance', 'levels'],
    difficulty: 'intermediate'
  },

  {
    id: 'sar',
    name: 'SAR',
    fullName: 'Parabolic SAR',
    description: 'Trend-following indicator that provides stop and reverse points.',
    category: 'Support/Resistance',
    type: 'overlay',
    parameters: [
      {
        name: 'start',
        type: 'number',
        default: 0.02,
        min: 0.001,
        max: 0.1,
        step: 0.001,
        description: 'Starting acceleration factor'
      },
      {
        name: 'increment',
        type: 'number',
        default: 0.02,
        min: 0.001,
        max: 0.1,
        step: 0.001,
        description: 'Acceleration increment'
      },
      {
        name: 'maximum',
        type: 'number',
        default: 0.2,
        min: 0.01,
        max: 1,
        step: 0.01,
        description: 'Maximum acceleration factor'
      }
    ],
    inputs: ['high', 'low'],
    outputs: ['sar'],
    pineFunction: 'ta.sar(start, increment, maximum)',
    defaultParams: { start: 0.02, increment: 0.02, maximum: 0.2 },
    examples: ['SAR below price = uptrend', 'SAR above price = downtrend', 'SAR flip = trend change'],
    tags: ['parabolic', 'stop', 'reverse', 'trend'],
    difficulty: 'intermediate'
  },

  // =============================================================================
  // CUSTOM/UTILITY INDICATORS
  // =============================================================================
  {
    id: 'zigzag',
    name: 'ZigZag',
    fullName: 'ZigZag Indicator',
    description: 'Filters out price movements below a specified percentage to identify trends.',
    category: 'Custom',
    type: 'overlay',
    parameters: [
      {
        name: 'deviation',
        type: 'number',
        default: 5,
        min: 0.1,
        max: 50,
        step: 0.1,
        description: 'Minimum percentage change'
      },
      {
        name: 'depth',
        type: 'number',
        default: 12,
        min: 1,
        max: 100,
        description: 'Minimum number of bars'
      }
    ],
    inputs: ['high', 'low'],
    outputs: ['zigzag'],
    pineFunction: 'ta.pivothigh(high, depth, depth) or ta.pivotlow(low, depth, depth)',
    defaultParams: { deviation: 5, depth: 12 },
    examples: ['ZigZag trend identification', 'Support/resistance levels'],
    tags: ['zigzag', 'trend', 'filter', 'swing'],
    difficulty: 'advanced'
  },

  {
    id: 'supertrend',
    name: 'SuperTrend',
    fullName: 'SuperTrend Indicator',
    description: 'Trend-following indicator based on ATR that provides buy/sell signals.',
    category: 'Custom',
    type: 'overlay',
    parameters: [
      {
        name: 'period',
        type: 'number',
        default: 10,
        min: 1,
        max: 100,
        description: 'ATR period'
      },
      {
        name: 'multiplier',
        type: 'number',
        default: 3,
        min: 0.1,
        max: 10,
        step: 0.1,
        description: 'ATR multiplier'
      }
    ],
    inputs: ['high', 'low', 'close'],
    outputs: ['supertrend', 'direction'],
    pineFunction: 'supertrend(multiplier, period)',
    defaultParams: { period: 10, multiplier: 3 },
    examples: ['Price above SuperTrend = buy', 'Price below SuperTrend = sell'],
    tags: ['supertrend', 'atr', 'trend', 'signals'],
    difficulty: 'intermediate'
  }
];

// Utility functions
export const getIndicatorById = (id: string): IndicatorDefinition | undefined => {
  return indicatorDefinitions.find(indicator => indicator.id === id);
};

export const getIndicatorsByCategory = (): Record<string, IndicatorDefinition[]> => {
  return indicatorDefinitions.reduce((acc, indicator) => {
    if (!acc[indicator.category]) {
      acc[indicator.category] = [];
    }
    acc[indicator.category].push(indicator);
    return acc;
  }, {} as Record<string, IndicatorDefinition[]>);
};

export const getIndicatorsByType = (type: string): IndicatorDefinition[] => {
  return indicatorDefinitions.filter(indicator => indicator.type === type);
};

export const getIndicatorsByDifficulty = (difficulty: string): IndicatorDefinition[] => {
  return indicatorDefinitions.filter(indicator => indicator.difficulty === difficulty);
};

export const searchIndicators = (query: string): IndicatorDefinition[] => {
  const searchTerm = query.toLowerCase();
  return indicatorDefinitions.filter(indicator =>
    indicator.name.toLowerCase().includes(searchTerm) ||
    indicator.fullName.toLowerCase().includes(searchTerm) ||
    indicator.description.toLowerCase().includes(searchTerm) ||
    indicator.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
  );
};

export const getPopularIndicators = (): IndicatorDefinition[] => {
  const popularIds = ['rsi', 'sma', 'ema', 'macd', 'bb', 'vwap', 'sar', 'supertrend', 'stoch', 'adx'];
  return popularIds.map(id => getIndicatorById(id)).filter(Boolean) as IndicatorDefinition[];
};

export const validateIndicatorParameters = (
  indicatorId: string,
  parameters: Record<string, string | number | boolean>
): { isValid: boolean; errors: string[] } => {
  const indicator = getIndicatorById(indicatorId);
  if (!indicator) {
    return { isValid: false, errors: ['Indicator not found'] };
  }

  const errors: string[] = [];

  indicator.parameters.forEach(param => {
    const value = parameters[param.name];

    if (value === undefined || value === null) {
      errors.push(`Parameter '${param.name}' is required`);
      return;
    }

    if (param.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errors.push(`Parameter '${param.name}' must be a number`);
        return;
      }

      if (param.min !== undefined && numValue < param.min) {
        errors.push(`Parameter '${param.name}' must be >= ${param.min}`);
      }

      if (param.max !== undefined && numValue > param.max) {
        errors.push(`Parameter '${param.name}' must be <= ${param.max}`);
      }
    }

    if (param.type === 'select' && param.options) {
      if (!param.options.includes(String(value))) {
        errors.push(`Parameter '${param.name}' must be one of: ${param.options.join(', ')}`);
      }
    }
  });

  return { isValid: errors.length === 0, errors };
};

export const getIndicatorPineScript = (
  indicatorId: string,
  parameters: Record<string, string | number | boolean>
): string => {
  const indicator = getIndicatorById(indicatorId);
  if (!indicator) return '';

  let pineFunction = indicator.pineFunction;

  // Replace parameter placeholders
  Object.entries(parameters).forEach(([key, value]) => {
    pineFunction = pineFunction.replace(new RegExp(key, 'g'), value.toString());
  });

  return pineFunction;
};

// Export categories for easy access
export const INDICATOR_CATEGORIES = [
  'Trend',
  'Momentum',
  'Volatility',
  'Volume',
  'Support/Resistance',
  'Custom'
] as const;

export const INDICATOR_TYPES = [
  'indicator',
  'oscillator',
  'overlay',
  'utility'
] as const;

export const DIFFICULTY_LEVELS = [
  'beginner',
  'intermediate',
  'advanced'
] as const;