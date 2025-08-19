/**
 * Test fixtures and sample data for PineGenie AI testing
 * Contains realistic test data for various trading scenarios
 */

export const sampleTradingRequests = {
  // Simple requests
  simple: {
    rsi: "Create a RSI strategy that buys when RSI is below 30",
    sma: "Build a simple moving average crossover strategy",
    macd: "Make a MACD strategy with buy and sell signals",
    bollinger: "Create Bollinger Bands strategy for breakouts"
  },

  // Complex requests
  complex: {
    multiIndicator: "Create a strategy using RSI below 30, MACD bullish crossover, and SMA 20 above SMA 50 for buy signals with 2% stop loss",
    riskManagement: "Build a scalping strategy with RSI and Stochastic, include stop loss at 1% and take profit at 2%",
    timeFiltered: "Create a day trading strategy using EMA crossover only during market hours 9:30-16:00 EST",
    multiTimeframe: "Build a strategy that uses daily RSI for trend and hourly MACD for entry signals"
  },

  // Ambiguous requests
  ambiguous: {
    vague: "Make me money with moving averages",
    incomplete: "Create a strategy with RSI",
    conflicting: "Build a trend following mean reversion strategy",
    unclear: "Use some indicators to trade Bitcoin"
  },

  // Edge cases
  edge: {
    noIndicators: "Create a strategy without any indicators",
    onlyRisk: "Just add stop loss and take profit",
    invalidParams: "RSI with period -5 and threshold 150",
    tooComplex: "Create a strategy with RSI, MACD, Bollinger Bands, Stochastic, Williams %R, CCI, ADX, ATR, Volume, OBV, and Fibonacci retracements"
  }
};

export const sampleStrategyBlueprints = {
  rsiMeanReversion: {
    id: 'rsi-mean-reversion',
    name: 'RSI Mean Reversion Strategy',
    description: 'Buy when RSI oversold, sell when overbought',
    components: [
      {
        type: 'data-source',
        subtype: 'market_data',
        parameters: { symbol: 'BTCUSDT', timeframe: '1h' },
        priority: 1,
        dependencies: []
      },
      {
        type: 'indicator',
        subtype: 'rsi',
        parameters: { period: 14, source: 'close' },
        priority: 2,
        dependencies: ['market_data']
      },
      {
        type: 'condition',
        subtype: 'less_than',
        parameters: { threshold: 30 },
        priority: 3,
        dependencies: ['rsi']
      },
      {
        type: 'condition',
        subtype: 'greater_than',
        parameters: { threshold: 70 },
        priority: 3,
        dependencies: ['rsi']
      },
      {
        type: 'action',
        subtype: 'buy',
        parameters: { quantity: 1, order_type: 'market' },
        priority: 4,
        dependencies: ['less_than']
      },
      {
        type: 'action',
        subtype: 'sell',
        parameters: { quantity: 1, order_type: 'market' },
        priority: 4,
        dependencies: ['greater_than']
      }
    ],
    flow: [
      { from: 'market_data', to: 'rsi', type: 'data' },
      { from: 'rsi', to: 'less_than', type: 'signal' },
      { from: 'rsi', to: 'greater_than', type: 'signal' },
      { from: 'less_than', to: 'buy', type: 'trigger' },
      { from: 'greater_than', to: 'sell', type: 'trigger' }
    ],
    parameters: {
      rsi_period: { value: 14, type: 'int', range: [2, 50] },
      oversold_threshold: { value: 30, type: 'float', range: [10, 40] },
      overbought_threshold: { value: 70, type: 'float', range: [60, 90] }
    },
    riskProfile: {
      level: 'medium',
      maxDrawdown: 0.15,
      riskRewardRatio: 2.0,
      stopLoss: 0.05,
      takeProfit: 0.10
    }
  },

  macdCrossover: {
    id: 'macd-crossover',
    name: 'MACD Crossover Strategy',
    description: 'Buy on bullish MACD crossover, sell on bearish crossover',
    components: [
      {
        type: 'data-source',
        subtype: 'market_data',
        parameters: { symbol: 'BTCUSDT', timeframe: '4h' },
        priority: 1,
        dependencies: []
      },
      {
        type: 'indicator',
        subtype: 'macd',
        parameters: { fast: 12, slow: 26, signal: 9 },
        priority: 2,
        dependencies: ['market_data']
      },
      {
        type: 'condition',
        subtype: 'crossover_above',
        parameters: {},
        priority: 3,
        dependencies: ['macd']
      },
      {
        type: 'condition',
        subtype: 'crossover_below',
        parameters: {},
        priority: 3,
        dependencies: ['macd']
      },
      {
        type: 'action',
        subtype: 'buy',
        parameters: { quantity: 1, order_type: 'market' },
        priority: 4,
        dependencies: ['crossover_above']
      },
      {
        type: 'action',
        subtype: 'sell',
        parameters: { quantity: 1, order_type: 'market' },
        priority: 4,
        dependencies: ['crossover_below']
      },
      {
        type: 'risk',
        subtype: 'stop_loss',
        parameters: { percentage: 0.02 },
        priority: 5,
        dependencies: ['buy']
      }
    ],
    flow: [
      { from: 'market_data', to: 'macd', type: 'data' },
      { from: 'macd', to: 'crossover_above', type: 'signal' },
      { from: 'macd', to: 'crossover_below', type: 'signal' },
      { from: 'crossover_above', to: 'buy', type: 'trigger' },
      { from: 'crossover_below', to: 'sell', type: 'trigger' },
      { from: 'buy', to: 'stop_loss', type: 'risk' }
    ],
    parameters: {
      macd_fast: { value: 12, type: 'int', range: [5, 20] },
      macd_slow: { value: 26, type: 'int', range: [20, 50] },
      macd_signal: { value: 9, type: 'int', range: [5, 15] },
      stop_loss_pct: { value: 0.02, type: 'float', range: [0.01, 0.05] }
    },
    riskProfile: {
      level: 'medium',
      maxDrawdown: 0.12,
      riskRewardRatio: 2.5,
      stopLoss: 0.02,
      takeProfit: 0.05
    }
  }
};

export const sampleNodeConfigurations = {
  dataSource: {
    id: 'data-source-1',
    type: 'data-source',
    subtype: 'market_data',
    position: { x: 100, y: 100 },
    parameters: { symbol: 'BTCUSDT', timeframe: '1h' },
    inputs: [],
    outputs: ['open', 'high', 'low', 'close', 'volume'],
    aiGenerated: true,
    confidence: 0.95,
    explanation: 'Market data source for BTCUSDT 1-hour timeframe'
  },

  rsiIndicator: {
    id: 'rsi-indicator-1',
    type: 'indicator',
    subtype: 'rsi',
    position: { x: 300, y: 100 },
    parameters: { period: 14, source: 'close' },
    inputs: ['price_data'],
    outputs: ['rsi_value'],
    aiGenerated: true,
    confidence: 0.9,
    explanation: 'RSI indicator with 14-period for momentum analysis'
  },

  condition: {
    id: 'condition-1',
    type: 'condition',
    subtype: 'less_than',
    position: { x: 500, y: 100 },
    parameters: { threshold: 30 },
    inputs: ['indicator_value'],
    outputs: ['signal'],
    aiGenerated: true,
    confidence: 0.85,
    explanation: 'Condition to check if RSI is below oversold threshold'
  },

  buyAction: {
    id: 'buy-action-1',
    type: 'action',
    subtype: 'buy',
    position: { x: 700, y: 100 },
    parameters: { quantity: 1, order_type: 'market' },
    inputs: ['trigger'],
    outputs: ['order'],
    aiGenerated: true,
    confidence: 0.9,
    explanation: 'Market buy order when conditions are met'
  }
};

export const sampleConnections = {
  dataToIndicator: {
    id: 'connection-1',
    source: 'data-source-1',
    target: 'rsi-indicator-1',
    sourceHandle: 'close',
    targetHandle: 'input',
    type: 'data',
    aiGenerated: true,
    confidence: 0.95,
    explanation: 'Connects close price to RSI calculation'
  },

  indicatorToCondition: {
    id: 'connection-2',
    source: 'rsi-indicator-1',
    target: 'condition-1',
    sourceHandle: 'rsi_value',
    targetHandle: 'input',
    type: 'signal',
    aiGenerated: true,
    confidence: 0.9,
    explanation: 'Connects RSI value to threshold condition'
  },

  conditionToAction: {
    id: 'connection-3',
    source: 'condition-1',
    target: 'buy-action-1',
    sourceHandle: 'signal',
    targetHandle: 'trigger',
    type: 'trigger',
    aiGenerated: true,
    confidence: 0.85,
    explanation: 'Triggers buy action when condition is met'
  }
};

export const sampleAnimationSequences = {
  rsiStrategy: [
    {
      type: 'node-placement',
      nodeId: 'data-source-1',
      duration: 500,
      explanation: 'Placing market data source for BTCUSDT',
      highlight: true
    },
    {
      type: 'node-placement',
      nodeId: 'rsi-indicator-1',
      duration: 500,
      explanation: 'Adding RSI indicator for momentum analysis',
      highlight: true
    },
    {
      type: 'connection-creation',
      nodeId: 'connection-1',
      duration: 300,
      explanation: 'Connecting price data to RSI calculation',
      highlight: true
    },
    {
      type: 'node-placement',
      nodeId: 'condition-1',
      duration: 500,
      explanation: 'Adding oversold condition (RSI < 30)',
      highlight: true
    },
    {
      type: 'connection-creation',
      nodeId: 'connection-2',
      duration: 300,
      explanation: 'Connecting RSI to condition check',
      highlight: true
    },
    {
      type: 'node-placement',
      nodeId: 'buy-action-1',
      duration: 500,
      explanation: 'Adding buy action for entry signal',
      highlight: true
    },
    {
      type: 'connection-creation',
      nodeId: 'connection-3',
      duration: 300,
      explanation: 'Connecting condition to buy action',
      highlight: true
    }
  ]
};

export const sampleErrorScenarios = {
  parsingErrors: [
    {
      input: "Create a strategy with XYZ indicator",
      expectedError: "Unknown indicator 'XYZ'",
      errorType: "UNKNOWN_INDICATOR"
    },
    {
      input: "Buy when price is purple",
      expectedError: "Invalid condition 'purple'",
      errorType: "INVALID_CONDITION"
    }
  ],

  buildErrors: [
    {
      blueprint: { components: [] },
      expectedError: "Strategy blueprint is empty",
      errorType: "EMPTY_STRATEGY"
    },
    {
      blueprint: { components: [{ type: 'action', dependencies: ['missing'] }] },
      expectedError: "Missing dependency 'missing'",
      errorType: "MISSING_DEPENDENCY"
    }
  ],

  validationErrors: [
    {
      strategy: { nodes: [], edges: [] },
      expectedError: "Strategy has no nodes",
      errorType: "NO_NODES"
    },
    {
      strategy: { nodes: [{ type: 'action' }], edges: [] },
      expectedError: "Action node has no trigger",
      errorType: "MISSING_TRIGGER"
    }
  ]
};

export const performanceBenchmarks = {
  parsing: {
    simple: { maxTime: 50, description: "Simple request parsing" },
    complex: { maxTime: 200, description: "Complex request parsing" },
    batch: { maxTime: 500, description: "Batch request processing" }
  },

  building: {
    simple: { maxTime: 100, description: "Simple strategy building" },
    complex: { maxTime: 500, description: "Complex strategy building" },
    large: { maxTime: 1000, description: "Large strategy building" }
  },

  optimization: {
    parameters: { maxTime: 200, description: "Parameter optimization" },
    layout: { maxTime: 300, description: "Layout optimization" },
    connections: { maxTime: 150, description: "Connection optimization" }
  }
};

const testData = {
  sampleTradingRequests,
  sampleStrategyBlueprints,
  sampleNodeConfigurations,
  sampleConnections,
  sampleAnimationSequences,
  sampleErrorScenarios,
  performanceBenchmarks
};

export default testData;