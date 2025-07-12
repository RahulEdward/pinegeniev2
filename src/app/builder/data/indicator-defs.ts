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
  const popularIds = ['rsi', 'sma', 'ema', 'macd', 'bb'];
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