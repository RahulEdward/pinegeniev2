/**
 * Pine Script Indicator Generation System
 * Comprehensive library of technical indicators with parameter validation and chaining
 */

export interface IndicatorParameter {
  name: string;
  type: 'int' | 'float' | 'bool' | 'string' | 'source' | 'color';
  defaultValue: any;
  min?: number;
  max?: number;
  step?: number;
  description: string;
  tooltip?: string;
  options?: string[]; // For dropdown/select parameters
  group?: string;
}

export interface IndicatorDefinition {
  id: string;
  name: string;
  description: string;
  category: 'trend' | 'momentum' | 'volatility' | 'volume' | 'support_resistance' | 'custom';
  parameters: IndicatorParameter[];
  outputs: IndicatorOutput[];
  pineScriptFunction: string;
  plotConfig?: PlotConfiguration[];
  dependencies?: string[]; // Other indicators this depends on
  version: string;
  author: string;
  tags: string[];
}

export interface IndicatorOutput {
  name: string;
  type: 'line' | 'histogram' | 'area' | 'circles' | 'arrows' | 'background';
  description: string;
  defaultColor?: string;
  defaultStyle?: string;
}

export interface PlotConfiguration {
  outputName: string;
  plotType: 'plot' | 'plotshape' | 'plotchar' | 'bgcolor' | 'hline';
  color: string;
  style?: string;
  linewidth?: number;
  location?: string;
  size?: string;
}

export interface IndicatorChain {
  id: string;
  name: string;
  description: string;
  indicators: ChainedIndicator[];
  combinationLogic: CombinationLogic;
}

export interface ChainedIndicator {
  indicatorId: string;
  parameters: Record<string, any>;
  alias: string; // Used for referencing in combinations
  weight?: number; // For weighted combinations
}

export interface CombinationLogic {
  type: 'and' | 'or' | 'weighted_average' | 'custom';
  customLogic?: string; // Pine Script expression
  threshold?: number; // For weighted combinations
}

export interface IndicatorValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface CustomIndicatorBuilder {
  name: string;
  description: string;
  inputs: IndicatorParameter[];
  calculation: string; // Pine Script calculation logic
  outputs: IndicatorOutput[];
}

// Comprehensive indicator library
export const technicalIndicators: IndicatorDefinition[] = [
  // TREND INDICATORS
  {
    id: 'sma',
    name: 'Simple Moving Average',
    description: 'Simple Moving Average - arithmetic mean of prices over a specified period',
    category: 'trend',
    version: '1.0',
    author: 'PineGenie',
    tags: ['moving-average', 'trend', 'basic'],
    parameters: [
      {
        name: 'length',
        type: 'int',
        defaultValue: 20,
        min: 1,
        max: 500,
        step: 1,
        description: 'Period length',
        tooltip: 'Number of periods for calculation',
        group: 'Settings'
      },
      {
        name: 'source',
        type: 'source',
        defaultValue: 'close',
        description: 'Price source',
        tooltip: 'Price data to use for calculation',
        options: ['open', 'high', 'low', 'close', 'hl2', 'hlc3', 'ohlc4'],
        group: 'Settings'
      }
    ],
    outputs: [
      {
        name: 'sma',
        type: 'line',
        description: 'Simple moving average line'
      }
    ],
    pineScriptFunction: 'ta.sma({{source}}, {{length}})',
    plotConfig: [
      {
        outputName: 'sma',
        plotType: 'plot',
        color: 'color.blue',
        linewidth: 2
      }
    ]
  },

  {
    id: 'ema',
    name: 'Exponential Moving Average',
    description: 'Exponential Moving Average - gives more weight to recent prices',
    category: 'trend',
    version: '1.0',
    author: 'PineGenie',
    tags: ['moving-average', 'trend', 'exponential'],
    parameters: [
      {
        name: 'length',
        type: 'int',
        defaultValue: 20,
        min: 1,
        max: 500,
        step: 1,
        description: 'Period length',
        tooltip: 'Number of periods for calculation',
        group: 'Settings'
      },
      {
        name: 'source',
        type: 'source',
        defaultValue: 'close',
        description: 'Price source',
        tooltip: 'Price data to use for calculation',
        options: ['open', 'high', 'low', 'close', 'hl2', 'hlc3', 'ohlc4'],
        group: 'Settings'
      }
    ],
    outputs: [
      {
        name: 'ema',
        type: 'line',
        description: 'Exponential moving average line'
      }
    ],
    pineScriptFunction: 'ta.ema({{source}}, {{length}})',
    plotConfig: [
      {
        outputName: 'ema',
        plotType: 'plot',
        color: 'color.orange',
        linewidth: 2
      }
    ]
  },

  // MOMENTUM INDICATORS
  {
    id: 'rsi',
    name: 'Relative Strength Index',
    description: 'RSI - momentum oscillator measuring speed and change of price movements',
    category: 'momentum',
    version: '1.0',
    author: 'PineGenie',
    tags: ['rsi', 'momentum', 'oscillator', 'overbought', 'oversold'],
    parameters: [
      {
        name: 'length',
        type: 'int',
        defaultValue: 14,
        min: 2,
        max: 100,
        step: 1,
        description: 'RSI period',
        tooltip: 'Number of periods for RSI calculation',
        group: 'Settings'
      },
      {
        name: 'source',
        type: 'source',
        defaultValue: 'close',
        description: 'Price source',
        tooltip: 'Price data to use for calculation',
        options: ['open', 'high', 'low', 'close', 'hl2', 'hlc3', 'ohlc4'],
        group: 'Settings'
      },
      {
        name: 'overbought',
        type: 'int',
        defaultValue: 70,
        min: 50,
        max: 90,
        step: 1,
        description: 'Overbought level',
        tooltip: 'RSI level considered overbought',
        group: 'Levels'
      },
      {
        name: 'oversold',
        type: 'int',
        defaultValue: 30,
        min: 10,
        max: 50,
        step: 1,
        description: 'Oversold level',
        tooltip: 'RSI level considered oversold',
        group: 'Levels'
      }
    ],
    outputs: [
      {
        name: 'rsi',
        type: 'line',
        description: 'RSI oscillator line'
      }
    ],
    pineScriptFunction: 'ta.rsi({{source}}, {{length}})',
    plotConfig: [
      {
        outputName: 'rsi',
        plotType: 'plot',
        color: 'color.purple',
        linewidth: 2
      }
    ]
  },

  {
    id: 'macd',
    name: 'MACD',
    description: 'Moving Average Convergence Divergence - trend-following momentum indicator',
    category: 'momentum',
    version: '1.0',
    author: 'PineGenie',
    tags: ['macd', 'momentum', 'convergence', 'divergence'],
    parameters: [
      {
        name: 'fastLength',
        type: 'int',
        defaultValue: 12,
        min: 1,
        max: 50,
        step: 1,
        description: 'Fast EMA length',
        tooltip: 'Fast exponential moving average period',
        group: 'Settings'
      },
      {
        name: 'slowLength',
        type: 'int',
        defaultValue: 26,
        min: 1,
        max: 100,
        step: 1,
        description: 'Slow EMA length',
        tooltip: 'Slow exponential moving average period',
        group: 'Settings'
      },
      {
        name: 'signalLength',
        type: 'int',
        defaultValue: 9,
        min: 1,
        max: 50,
        step: 1,
        description: 'Signal line length',
        tooltip: 'Signal line smoothing period',
        group: 'Settings'
      },
      {
        name: 'source',
        type: 'source',
        defaultValue: 'close',
        description: 'Price source',
        tooltip: 'Price data to use for calculation',
        options: ['open', 'high', 'low', 'close', 'hl2', 'hlc3', 'ohlc4'],
        group: 'Settings'
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
    pineScriptFunction: 'ta.macd({{source}}, {{fastLength}}, {{slowLength}}, {{signalLength}})',
    plotConfig: [
      {
        outputName: 'macd',
        plotType: 'plot',
        color: 'color.blue',
        linewidth: 2
      },
      {
        outputName: 'signal',
        plotType: 'plot',
        color: 'color.red',
        linewidth: 2
      },
      {
        outputName: 'histogram',
        plotType: 'plot',
        color: 'color.gray',
        style: 'plot.style_histogram'
      }
    ]
  },

  // VOLATILITY INDICATORS
  {
    id: 'bollinger_bands',
    name: 'Bollinger Bands',
    description: 'Bollinger Bands - volatility indicator with upper and lower bands',
    category: 'volatility',
    version: '1.0',
    author: 'PineGenie',
    tags: ['bollinger', 'bands', 'volatility', 'standard-deviation'],
    parameters: [
      {
        name: 'length',
        type: 'int',
        defaultValue: 20,
        min: 2,
        max: 100,
        step: 1,
        description: 'Period length',
        tooltip: 'Number of periods for calculation',
        group: 'Settings'
      },
      {
        name: 'mult',
        type: 'float',
        defaultValue: 2.0,
        min: 0.1,
        max: 5.0,
        step: 0.1,
        description: 'Standard deviation multiplier',
        tooltip: 'Multiplier for standard deviation bands',
        group: 'Settings'
      },
      {
        name: 'source',
        type: 'source',
        defaultValue: 'close',
        description: 'Price source',
        tooltip: 'Price data to use for calculation',
        options: ['open', 'high', 'low', 'close', 'hl2', 'hlc3', 'ohlc4'],
        group: 'Settings'
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
    pineScriptFunction: 'ta.bb({{source}}, {{length}}, {{mult}})',
    plotConfig: [
      {
        outputName: 'upper',
        plotType: 'plot',
        color: 'color.red',
        linewidth: 1
      },
      {
        outputName: 'middle',
        plotType: 'plot',
        color: 'color.blue',
        linewidth: 2
      },
      {
        outputName: 'lower',
        plotType: 'plot',
        color: 'color.green',
        linewidth: 1
      }
    ]
  },

  {
    id: 'atr',
    name: 'Average True Range',
    description: 'ATR - measures market volatility by calculating average of true ranges',
    category: 'volatility',
    version: '1.0',
    author: 'PineGenie',
    tags: ['atr', 'volatility', 'true-range'],
    parameters: [
      {
        name: 'length',
        type: 'int',
        defaultValue: 14,
        min: 1,
        max: 100,
        step: 1,
        description: 'ATR period',
        tooltip: 'Number of periods for ATR calculation',
        group: 'Settings'
      }
    ],
    outputs: [
      {
        name: 'atr',
        type: 'line',
        description: 'Average True Range line'
      }
    ],
    pineScriptFunction: 'ta.atr({{length}})',
    plotConfig: [
      {
        outputName: 'atr',
        plotType: 'plot',
        color: 'color.yellow',
        linewidth: 2
      }
    ]
  }
];

// Additional indicators continue...  // VOLUME 
INDICATORS
  {
    id: 'volume_sma',
    name: 'Volume SMA',
    description: 'Simple Moving Average of Volume - smoothed volume indicator',
    category: 'volume',
    version: '1.0',
    author: 'PineGenie',
    tags: ['volume', 'sma', 'moving-average'],
    parameters: [
      {
        name: 'length',
        type: 'int',
        defaultValue: 20,
        min: 1,
        max: 200,
        step: 1,
        description: 'Volume SMA period',
        tooltip: 'Number of periods for volume average',
        group: 'Settings'
      }
    ],
    outputs: [
      {
        name: 'volume_sma',
        type: 'line',
        description: 'Volume moving average line'
      }
    ],
    pineScriptFunction: 'ta.sma(volume, {{length}})',
    plotConfig: [
      {
        outputName: 'volume_sma',
        plotType: 'plot',
        color: 'color.blue',
        linewidth: 2
      }
    ]
  },

  {
    id: 'vwap',
    name: 'Volume Weighted Average Price',
    description: 'VWAP - average price weighted by volume',
    category: 'volume',
    version: '1.0',
    author: 'PineGenie',
    tags: ['vwap', 'volume', 'weighted', 'average'],
    parameters: [
      {
        name: 'anchor',
        type: 'string',
        defaultValue: 'session',
        description: 'VWAP anchor',
        tooltip: 'Time period to anchor VWAP calculation',
        options: ['session', 'week', 'month', 'year'],
        group: 'Settings'
      }
    ],
    outputs: [
      {
        name: 'vwap',
        type: 'line',
        description: 'VWAP line'
      }
    ],
    pineScriptFunction: 'ta.vwap({{anchor}})',
    plotConfig: [
      {
        outputName: 'vwap',
        plotType: 'plot',
        color: 'color.purple',
        linewidth: 2
      }
    ]
  },

  // SUPPORT/RESISTANCE INDICATORS
  {
    id: 'pivot_points',
    name: 'Pivot Points',
    description: 'Classic Pivot Points - support and resistance levels',
    category: 'support_resistance',
    version: '1.0',
    author: 'PineGenie',
    tags: ['pivot', 'support', 'resistance', 'levels'],
    parameters: [
      {
        name: 'type',
        type: 'string',
        defaultValue: 'traditional',
        description: 'Pivot calculation method',
        tooltip: 'Method for calculating pivot points',
        options: ['traditional', 'fibonacci', 'woodie', 'camarilla'],
        group: 'Settings'
      },
      {
        name: 'timeframe',
        type: 'string',
        defaultValue: 'daily',
        description: 'Pivot timeframe',
        tooltip: 'Timeframe for pivot calculation',
        options: ['daily', 'weekly', 'monthly'],
        group: 'Settings'
      }
    ],
    outputs: [
      {
        name: 'pivot',
        type: 'line',
        description: 'Pivot point'
      },
      {
        name: 'r1',
        type: 'line',
        description: 'Resistance 1'
      },
      {
        name: 'r2',
        type: 'line',
        description: 'Resistance 2'
      },
      {
        name: 's1',
        type: 'line',
        description: 'Support 1'
      },
      {
        name: 's2',
        type: 'line',
        description: 'Support 2'
      }
    ],
    pineScriptFunction: 'request.security(syminfo.tickerid, "1D", [high[1], low[1], close[1]])',
    plotConfig: [
      {
        outputName: 'pivot',
        plotType: 'plot',
        color: 'color.yellow',
        linewidth: 2
      },
      {
        outputName: 'r1',
        plotType: 'plot',
        color: 'color.red',
        linewidth: 1
      },
      {
        outputName: 'r2',
        plotType: 'plot',
        color: 'color.red',
        linewidth: 1
      },
      {
        outputName: 's1',
        plotType: 'plot',
        color: 'color.green',
        linewidth: 1
      },
      {
        outputName: 's2',
        plotType: 'plot',
        color: 'color.green',
        linewidth: 1
      }
    ]
  },

  // ADDITIONAL MOMENTUM INDICATORS
  {
    id: 'stochastic',
    name: 'Stochastic Oscillator',
    description: 'Stochastic - momentum oscillator comparing closing price to price range',
    category: 'momentum',
    version: '1.0',
    author: 'PineGenie',
    tags: ['stochastic', 'momentum', 'oscillator', '%k', '%d'],
    parameters: [
      {
        name: 'k',
        type: 'int',
        defaultValue: 14,
        min: 1,
        max: 100,
        step: 1,
        description: '%K period',
        tooltip: 'Number of periods for %K calculation',
        group: 'Settings'
      },
      {
        name: 'd',
        type: 'int',
        defaultValue: 3,
        min: 1,
        max: 20,
        step: 1,
        description: '%D smoothing',
        tooltip: 'Smoothing period for %D line',
        group: 'Settings'
      },
      {
        name: 'smooth',
        type: 'int',
        defaultValue: 3,
        min: 1,
        max: 20,
        step: 1,
        description: '%K smoothing',
        tooltip: 'Smoothing period for %K line',
        group: 'Settings'
      },
      {
        name: 'overbought',
        type: 'int',
        defaultValue: 80,
        min: 50,
        max: 95,
        step: 1,
        description: 'Overbought level',
        tooltip: 'Stochastic level considered overbought',
        group: 'Levels'
      },
      {
        name: 'oversold',
        type: 'int',
        defaultValue: 20,
        min: 5,
        max: 50,
        step: 1,
        description: 'Oversold level',
        tooltip: 'Stochastic level considered oversold',
        group: 'Levels'
      }
    ],
    outputs: [
      {
        name: 'k',
        type: 'line',
        description: '%K line'
      },
      {
        name: 'd',
        type: 'line',
        description: '%D line'
      }
    ],
    pineScriptFunction: 'ta.stoch(close, high, low, {{k}})',
    plotConfig: [
      {
        outputName: 'k',
        plotType: 'plot',
        color: 'color.blue',
        linewidth: 2
      },
      {
        outputName: 'd',
        plotType: 'plot',
        color: 'color.red',
        linewidth: 2
      }
    ]
  },

  {
    id: 'williams_r',
    name: 'Williams %R',
    description: 'Williams %R - momentum oscillator measuring overbought/oversold levels',
    category: 'momentum',
    version: '1.0',
    author: 'PineGenie',
    tags: ['williams', 'momentum', 'oscillator', 'overbought', 'oversold'],
    parameters: [
      {
        name: 'length',
        type: 'int',
        defaultValue: 14,
        min: 1,
        max: 100,
        step: 1,
        description: 'Williams %R period',
        tooltip: 'Number of periods for calculation',
        group: 'Settings'
      },
      {
        name: 'overbought',
        type: 'int',
        defaultValue: -20,
        min: -50,
        max: -10,
        step: 1,
        description: 'Overbought level',
        tooltip: 'Williams %R level considered overbought',
        group: 'Levels'
      },
      {
        name: 'oversold',
        type: 'int',
        defaultValue: -80,
        min: -95,
        max: -50,
        step: 1,
        description: 'Oversold level',
        tooltip: 'Williams %R level considered oversold',
        group: 'Levels'
      }
    ],
    outputs: [
      {
        name: 'williams_r',
        type: 'line',
        description: 'Williams %R line'
      }
    ],
    pineScriptFunction: '(ta.highest(high, {{length}}) - close) / (ta.highest(high, {{length}}) - ta.lowest(low, {{length}})) * -100',
    plotConfig: [
      {
        outputName: 'williams_r',
        plotType: 'plot',
        color: 'color.orange',
        linewidth: 2
      }
    ]
  },

  // ADDITIONAL TREND INDICATORS
  {
    id: 'parabolic_sar',
    name: 'Parabolic SAR',
    description: 'Parabolic SAR - trend-following indicator showing potential reversal points',
    category: 'trend',
    version: '1.0',
    author: 'PineGenie',
    tags: ['parabolic', 'sar', 'trend', 'reversal'],
    parameters: [
      {
        name: 'start',
        type: 'float',
        defaultValue: 0.02,
        min: 0.01,
        max: 0.1,
        step: 0.01,
        description: 'Start acceleration',
        tooltip: 'Initial acceleration factor',
        group: 'Settings'
      },
      {
        name: 'increment',
        type: 'float',
        defaultValue: 0.02,
        min: 0.01,
        max: 0.1,
        step: 0.01,
        description: 'Increment',
        tooltip: 'Acceleration increment',
        group: 'Settings'
      },
      {
        name: 'maximum',
        type: 'float',
        defaultValue: 0.2,
        min: 0.1,
        max: 1.0,
        step: 0.1,
        description: 'Maximum acceleration',
        tooltip: 'Maximum acceleration factor',
        group: 'Settings'
      }
    ],
    outputs: [
      {
        name: 'sar',
        type: 'circles',
        description: 'Parabolic SAR points'
      }
    ],
    pineScriptFunction: 'ta.sar({{start}}, {{increment}}, {{maximum}})',
    plotConfig: [
      {
        outputName: 'sar',
        plotType: 'plot',
        color: 'color.red',
        style: 'plot.style_circles'
      }
    ]
  }
];

/**
 * Indicator Generation and Management Class
 */
export class IndicatorGenerator {
  private indicators: Map<string, IndicatorDefinition>;
  private customIndicators: Map<string, CustomIndicatorBuilder>;
  private indicatorChains: Map<string, IndicatorChain>;

  constructor() {
    this.indicators = new Map();
    this.customIndicators = new Map();
    this.indicatorChains = new Map();
    
    // Initialize with built-in indicators
    technicalIndicators.forEach(indicator => {
      this.indicators.set(indicator.id, indicator);
    });
  }

  /**
   * Get all available indicators
   */
  getAllIndicators(): IndicatorDefinition[] {
    return Array.from(this.indicators.values());
  }

  /**
   * Get indicators by category
   */
  getIndicatorsByCategory(category: string): IndicatorDefinition[] {
    return Array.from(this.indicators.values()).filter(
      indicator => indicator.category === category
    );
  }

  /**
   * Get indicator by ID
   */
  getIndicator(id: string): IndicatorDefinition | undefined {
    return this.indicators.get(id);
  }

  /**
   * Search indicators by name, description, or tags
   */
  searchIndicators(query: string): IndicatorDefinition[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.indicators.values()).filter(indicator =>
      indicator.name.toLowerCase().includes(searchTerm) ||
      indicator.description.toLowerCase().includes(searchTerm) ||
      indicator.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Validate indicator parameters
   */
  validateIndicatorParameters(
    indicatorId: string, 
    parameters: Record<string, any>
  ): IndicatorValidationResult {
    const indicator = this.indicators.get(indicatorId);
    if (!indicator) {
      return {
        isValid: false,
        errors: [`Indicator '${indicatorId}' not found`],
        warnings: [],
        suggestions: []
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validate each parameter
    indicator.parameters.forEach(param => {
      const value = parameters[param.name];
      
      if (value === undefined || value === null) {
        if (param.defaultValue === undefined) {
          errors.push(`Required parameter '${param.name}' is missing`);
        } else {
          warnings.push(`Parameter '${param.name}' not provided, using default: ${param.defaultValue}`);
        }
        return;
      }

      // Type validation
      if (param.type === 'int' && !Number.isInteger(value)) {
        errors.push(`Parameter '${param.name}' must be an integer`);
      } else if (param.type === 'float' && typeof value !== 'number') {
        errors.push(`Parameter '${param.name}' must be a number`);
      } else if (param.type === 'bool' && typeof value !== 'boolean') {
        errors.push(`Parameter '${param.name}' must be a boolean`);
      } else if (param.type === 'string' && typeof value !== 'string') {
        errors.push(`Parameter '${param.name}' must be a string`);
      }

      // Range validation
      if (typeof value === 'number') {
        if (param.min !== undefined && value < param.min) {
          errors.push(`Parameter '${param.name}' must be >= ${param.min}`);
        }
        if (param.max !== undefined && value > param.max) {
          errors.push(`Parameter '${param.name}' must be <= ${param.max}`);
        }
      }

      // Options validation
      if (param.options && !param.options.includes(value)) {
        errors.push(`Parameter '${param.name}' must be one of: ${param.options.join(', ')}`);
      }
    });

    // Performance suggestions
    if (parameters.length && parameters.length > 100) {
      suggestions.push('Consider using shorter periods for better performance');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Generate Pine Script code for an indicator
   */
  generateIndicatorCode(
    indicatorId: string,
    parameters: Record<string, any>,
    alias?: string
  ): string {
    const indicator = this.indicators.get(indicatorId);
    if (!indicator) {
      throw new Error(`Indicator '${indicatorId}' not found`);
    }

    // Validate parameters first
    const validation = this.validateIndicatorParameters(indicatorId, parameters);
    if (!validation.isValid) {
      throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`);
    }

    // Merge with defaults
    const finalParams = { ...parameters };
    indicator.parameters.forEach(param => {
      if (finalParams[param.name] === undefined) {
        finalParams[param.name] = param.defaultValue;
      }
    });

    // Replace template variables
    let code = indicator.pineScriptFunction;
    Object.entries(finalParams).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      code = code.replace(new RegExp(placeholder, 'g'), String(value));
    });

    // Generate variable assignment
    const varName = alias || indicator.id;
    
    if (indicator.outputs.length === 1) {
      return `${varName} = ${code}`;
    } else {
      // Multiple outputs (like MACD)
      const outputNames = indicator.outputs.map(output => `${varName}_${output.name}`);
      return `[${outputNames.join(', ')}] = ${code}`;
    }
  }

  /**
   * Generate plot code for an indicator
   */
  generatePlotCode(
    indicatorId: string,
    alias?: string,
    customColors?: Record<string, string>
  ): string[] {
    const indicator = this.indicators.get(indicatorId);
    if (!indicator || !indicator.plotConfig) {
      return [];
    }

    const varName = alias || indicator.id;
    const plotLines: string[] = [];

    indicator.plotConfig.forEach(plotConfig => {
      const outputVar = indicator.outputs.length === 1 
        ? varName 
        : `${varName}_${plotConfig.outputName}`;
      
      const color = customColors?.[plotConfig.outputName] || plotConfig.color;
      
      let plotLine = '';
      switch (plotConfig.plotType) {
        case 'plot':
          plotLine = `plot(${outputVar}, color=${color}`;
          if (plotConfig.linewidth) plotLine += `, linewidth=${plotConfig.linewidth}`;
          if (plotConfig.style) plotLine += `, style=${plotConfig.style}`;
          plotLine += `, title="${indicator.name} - ${plotConfig.outputName}")`;
          break;
          
        case 'hline':
          plotLine = `hline(${outputVar}, "${indicator.name}", color=${color})`;
          break;
          
        case 'plotshape':
          plotLine = `plotshape(${outputVar}, title="${indicator.name}", color=${color}`;
          if (plotConfig.location) plotLine += `, location=${plotConfig.location}`;
          if (plotConfig.size) plotLine += `, size=${plotConfig.size}`;
          plotLine += ')';
          break;
      }
      
      if (plotLine) plotLines.push(plotLine);
    });

    return plotLines;
  }

  /**
   * Create a custom indicator
   */
  createCustomIndicator(builder: CustomIndicatorBuilder): string {
    const id = `custom_${Date.now()}`;
    this.customIndicators.set(id, builder);
    
    // Convert to IndicatorDefinition format
    const indicator: IndicatorDefinition = {
      id,
      name: builder.name,
      description: builder.description,
      category: 'custom',
      parameters: builder.inputs,
      outputs: builder.outputs,
      pineScriptFunction: builder.calculation,
      version: '1.0',
      author: 'User',
      tags: ['custom']
    };
    
    this.indicators.set(id, indicator);
    return id;
  }

  /**
   * Create an indicator chain
   */
  createIndicatorChain(chain: Omit<IndicatorChain, 'id'>): string {
    const id = `chain_${Date.now()}`;
    const fullChain: IndicatorChain = { id, ...chain };
    this.indicatorChains.set(id, fullChain);
    return id;
  }

  /**
   * Generate code for an indicator chain
   */
  generateChainCode(chainId: string, parameters?: Record<string, Record<string, any>>): string {
    const chain = this.indicatorChains.get(chainId);
    if (!chain) {
      throw new Error(`Indicator chain '${chainId}' not found`);
    }

    const codeLines: string[] = [];
    const plotLines: string[] = [];

    // Generate code for each indicator in the chain
    chain.indicators.forEach(chainedIndicator => {
      const indicatorParams = parameters?.[chainedIndicator.alias] || {};
      
      // Generate indicator code
      const indicatorCode = this.generateIndicatorCode(
        chainedIndicator.indicatorId,
        { ...chainedIndicator.parameters, ...indicatorParams },
        chainedIndicator.alias
      );
      codeLines.push(indicatorCode);

      // Generate plot code
      const plots = this.generatePlotCode(chainedIndicator.indicatorId, chainedIndicator.alias);
      plotLines.push(...plots);
    });

    // Generate combination logic
    const combinationCode = this.generateCombinationCode(chain);
    if (combinationCode) {
      codeLines.push(combinationCode);
    }

    return [...codeLines, '', '// Plots', ...plotLines].join('\n');
  }

  /**
   * Generate combination logic code
   */
  private generateCombinationCode(chain: IndicatorChain): string {
    const { combinationLogic } = chain;
    
    switch (combinationLogic.type) {
      case 'and':
        const andConditions = chain.indicators.map(ind => `${ind.alias}_signal`);
        return `${chain.name}_signal = ${andConditions.join(' and ')}`;
        
      case 'or':
        const orConditions = chain.indicators.map(ind => `${ind.alias}_signal`);
        return `${chain.name}_signal = ${orConditions.join(' or ')}`;
        
      case 'weighted_average':
        const weightedTerms = chain.indicators.map(ind => 
          `${ind.alias}_value * ${ind.weight || 1}`
        );
        const totalWeight = chain.indicators.reduce((sum, ind) => sum + (ind.weight || 1), 0);
        return `${chain.name}_value = (${weightedTerms.join(' + ')}) / ${totalWeight}`;
        
      case 'custom':
        return combinationLogic.customLogic || '';
        
      default:
        return '';
    }
  }

  /**
   * Get indicator categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    this.indicators.forEach(indicator => {
      categories.add(indicator.category);
    });
    return Array.from(categories);
  }

  /**
   * Get popular indicators (by usage or rating)
   */
  getPopularIndicators(limit: number = 10): IndicatorDefinition[] {
    return Array.from(this.indicators.values())
      .sort((a, b) => b.tags.length - a.tags.length) // Simple popularity metric
      .slice(0, limit);
  }

  /**
   * Get compatible indicators for chaining
   */
  getCompatibleIndicators(baseIndicatorId: string): IndicatorDefinition[] {
    const baseIndicator = this.indicators.get(baseIndicatorId);
    if (!baseIndicator) {
      return [];
    }

    return Array.from(this.indicators.values()).filter(indicator => {
      // Same category indicators are usually compatible
      if (indicator.category === baseIndicator.category) {
        return true;
      }
      
      // Trend indicators work well with momentum
      if (baseIndicator.category === 'trend' && indicator.category === 'momentum') {
        return true;
      }
      
      // Volume indicators complement most others
      if (indicator.category === 'volume') {
        return true;
      }
      
      return false;
    });
  }

  /**
   * Generate indicator documentation
   */
  generateDocumentation(indicatorId: string): string {
    const indicator = this.indicators.get(indicatorId);
    if (!indicator) {
      throw new Error(`Indicator '${indicatorId}' not found`);
    }

    const doc = [
      `# ${indicator.name}`,
      '',
      `**Category**: ${indicator.category}`,
      `**Version**: ${indicator.version}`,
      `**Author**: ${indicator.author}`,
      '',
      `## Description`,
      indicator.description,
      '',
      `## Parameters`,
      ''
    ];

    indicator.parameters.forEach(param => {
      doc.push(`### ${param.name}`);
      doc.push(`- **Type**: ${param.type}`);
      doc.push(`- **Default**: ${param.defaultValue}`);
      if (param.min !== undefined) doc.push(`- **Min**: ${param.min}`);
      if (param.max !== undefined) doc.push(`- **Max**: ${param.max}`);
      doc.push(`- **Description**: ${param.description}`);
      if (param.tooltip) doc.push(`- **Tooltip**: ${param.tooltip}`);
      doc.push('');
    });

    doc.push(`## Outputs`);
    doc.push('');
    indicator.outputs.forEach(output => {
      doc.push(`### ${output.name}`);
      doc.push(`- **Type**: ${output.type}`);
      doc.push(`- **Description**: ${output.description}`);
      doc.push('');
    });

    doc.push(`## Usage Example`);
    doc.push('```pinescript');
    doc.push(this.generateIndicatorCode(indicatorId, {}, indicator.id));
    doc.push('```');

    return doc.join('\n');
  }

  /**
   * Bulk validate multiple indicators
   */
  bulkValidate(configurations: Array<{id: string, parameters: Record<string, any>}>): Record<string, IndicatorValidationResult> {
    const results: Record<string, IndicatorValidationResult> = {};
    
    configurations.forEach(config => {
      try {
        results[config.id] = this.validateIndicatorParameters(config.id, config.parameters);
      } catch (error) {
        results[config.id] = {
          isValid: false,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          warnings: [],
          suggestions: []
        };
      }
    });

    return results;
  }
}

// Export singleton instance
export const indicatorGenerator = new IndicatorGenerator();indicatorParams = parameters?.[chainedIndicator.alias] || chainedIndicator.parameters;
      
      const indicatorCode = this.generateIndicatorCode(
        chainedIndicator.indicatorId,
        indicatorParams,
        chainedIndicator.alias
      );
      codeLines.push(indicatorCode);

      const plots = this.generatePlotCode(chainedIndicator.indicatorId, chainedIndicator.alias);
      plotLines.push(...plots);
    });

    // Generate combination logic
    if (chain.combinationLogic.type !== 'custom') {
      const combinationCode = this.generateCombinationLogic(chain);
      if (combinationCode) {
        codeLines.push(combinationCode);
      }
    } else if (chain.combinationLogic.customLogic) {
      codeLines.push(`// Custom combination logic`);
      codeLines.push(chain.combinationLogic.customLogic);
    }

    return [...codeLines, '', '// Plots', ...plotLines].join('\n');
  }

  /**
   * Generate combination logic for indicator chains
   */
  private generateCombinationLogic(chain: IndicatorChain): string {
    const { combinationLogic, indicators } = chain;
    
    switch (combinationLogic.type) {
      case 'and':
        const andConditions = indicators.map(ind => `${ind.alias} > 0`).join(' and ');
        return `combined_signal = ${andConditions}`;
        
      case 'or':
        const orConditions = indicators.map(ind => `${ind.alias} > 0`).join(' or ');
        return `combined_signal = ${orConditions}`;
        
      case 'weighted_average':
        const weightedSum = indicators
          .map(ind => `${ind.alias} * ${ind.weight || 1}`)
          .join(' + ');
        const totalWeight = indicators.reduce((sum, ind) => sum + (ind.weight || 1), 0);
        return `combined_signal = (${weightedSum}) / ${totalWeight}`;
        
      default:
        return '';
    }
  }

  /**
   * Get indicator categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    this.indicators.forEach(indicator => {
      categories.add(indicator.category);
    });
    return Array.from(categories);
  }

  /**
   * Export indicator configuration
   */
  exportIndicatorConfig(indicatorId: string): object {
    const indicator = this.indicators.get(indicatorId);
    if (!indicator) {
      throw new Error(`Indicator '${indicatorId}' not found`);
    }
    
    return {
      id: indicator.id,
      name: indicator.name,
      parameters: indicator.parameters.reduce((acc, param) => {
        acc[param.name] = param.defaultValue;
        return acc;
      }, {} as Record<string, any>)
    };
  }
}

// Export singleton instance
export const indicatorGenerator = new IndicatorGenerator();

// Export utility functions
export function getIndicatorsByTags(tags: string[]): IndicatorDefinition[] {
  return indicatorGenerator.getAllIndicators().filter(indicator =>
    tags.some(tag => indicator.tags.includes(tag))
  );
}

export function validateIndicatorChain(chain: IndicatorChain): IndicatorValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check if all indicators exist
  chain.indicators.forEach(chainedIndicator => {
    const indicator = indicatorGenerator.getIndicator(chainedIndicator.indicatorId);
    if (!indicator) {
      errors.push(`Indicator '${chainedIndicator.indicatorId}' not found`);
    }
  });

  // Check for duplicate aliases
  const aliases = chain.indicators.map(ind => ind.alias);
  const duplicates = aliases.filter((alias, index) => aliases.indexOf(alias) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate aliases found: ${duplicates.join(', ')}`);
  }

  // Performance warnings
  if (chain.indicators.length > 5) {
    warnings.push('Large number of indicators may impact performance');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}