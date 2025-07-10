export interface IndicatorDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultParams: Record<string, number | string>;
  inputs: string[];
  outputs: string[];
  type: 'indicator' | 'oscillator' | 'overlay' | 'utility';
}

export const indicatorDefinitions: IndicatorDefinition[] = [
  {
    id: 'rsi',
    name: 'Relative Strength Index (RSI)',
    description: 'Measures the magnitude of recent price changes to evaluate overbought or oversold conditions.',
    category: 'Momentum',
    type: 'oscillator',
    defaultParams: { length: 14, overbought: 70, oversold: 30 },
    inputs: ['close'],
    outputs: ['rsi']
  },
  {
    id: 'sma',
    name: 'Simple Moving Average',
    description: 'The average of the last n periods.',
    category: 'Trend',
    type: 'overlay',
    defaultParams: { length: 20 },
    inputs: ['close'],
    outputs: ['sma']
  },
  {
    id: 'ema',
    name: 'Exponential Moving Average',
    description: 'A type of moving average that places a greater weight on recent data points.',
    category: 'Trend',
    type: 'overlay',
    defaultParams: { length: 20 },
    inputs: ['close'],
    outputs: ['ema']
  },
  {
    id: 'macd',
    name: 'Moving Average Convergence Divergence',
    description: 'Trend-following momentum indicator that shows the relationship between two moving averages.',
    category: 'Momentum',
    type: 'oscillator',
    defaultParams: { fastLength: 12, slowLength: 26, signalLength: 9 },
    inputs: ['close'],
    outputs: ['macd', 'signal', 'histogram']
  },
  {
    id: 'bollinger_bands',
    name: 'Bollinger Bands',
    description: 'A band plotted two standard deviations away from a simple moving average.',
    category: 'Volatility',
    type: 'overlay',
    defaultParams: { length: 20, stdDev: 2 },
    inputs: ['close'],
    outputs: ['basis', 'upper', 'lower']
  }
];

export const getIndicatorById = (id: string) => {
  return indicatorDefinitions.find(ind => ind.id === id);
};

export const getIndicatorsByCategory = () => {
  return indicatorDefinitions.reduce((acc, indicator) => {
    if (!acc[indicator.category]) {
      acc[indicator.category] = [];
    }
    acc[indicator.category].push(indicator);
    return acc;
  }, {} as Record<string, IndicatorDefinition[]>);
};
