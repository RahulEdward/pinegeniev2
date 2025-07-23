/**
 * Pine Script Strategy Templates
 * Comprehensive template system for common trading strategies
 */

import { pineValidator } from './validator';

export interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  category: 'trend-following' | 'mean-reversion' | 'breakout' | 'momentum' | 'scalping' | 'custom';
  parameters: StrategyParameter[];
  template: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeframes: string[];
  markets: string[];
  version: string;
  author: string;
  created: Date;
  updated: Date;
}

export interface StrategyParameter {
  name: string;
  type: 'int' | 'float' | 'bool' | 'string' | 'source' | 'color';
  defaultValue: any;
  min?: number;
  max?: number;
  step?: number;
  description: string;
  group?: string;
  tooltip?: string;
  options?: string[]; // For dropdown/select parameters
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  templates: string[]; // Template IDs
}

export interface TemplateSearchOptions {
  query?: string;
  category?: string;
  difficulty?: string;
  tags?: string[];
  timeframes?: string[];
  markets?: string[];
}

export interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  pineScriptVersion: string;
}

export const strategyTemplates: StrategyTemplate[] = [
  {
    id: 'sma-crossover',
    name: 'Simple Moving Average Crossover',
    description: 'Classic trend-following strategy using two moving averages with customizable periods',
    category: 'trend-following',
    difficulty: 'beginner',
    timeframes: ['5m', '15m', '1h', '4h', '1d'],
    markets: ['stocks', 'forex', 'crypto'],
    tags: ['moving-average', 'crossover', 'trend-following', 'beginner'],
    version: '1.0',
    author: 'PineGenie',
    created: new Date('2024-01-01'),
    updated: new Date('2024-01-01'),
    parameters: [
      {
        name: 'fastLength',
        type: 'int',
        defaultValue: 10,
        min: 1,
        max: 100,
        step: 1,
        description: 'Fast moving average period',
        group: 'Moving Averages',
        tooltip: 'Shorter period for faster signals'
      },
      {
        name: 'slowLength',
        type: 'int',
        defaultValue: 30,
        min: 1,
        max: 200,
        step: 1,
        description: 'Slow moving average period',
        group: 'Moving Averages',
        tooltip: 'Longer period for trend confirmation'
      },
      {
        name: 'source',
        type: 'source',
        defaultValue: 'close',
        description: 'Price source for calculations',
        group: 'Moving Averages',
        options: ['open', 'high', 'low', 'close', 'hl2', 'hlc3', 'ohlc4']
      },
      {
        name: 'stopLossPercent',
        type: 'float',
        defaultValue: 2.0,
        min: 0.1,
        max: 10.0,
        step: 0.1,
        description: 'Stop loss percentage',
        group: 'Risk Management',
        tooltip: 'Percentage loss to exit position'
      },
      {
        name: 'takeProfitPercent',
        type: 'float',
        defaultValue: 4.0,
        min: 0.1,
        max: 20.0,
        step: 0.1,
        description: 'Take profit percentage',
        group: 'Risk Management',
        tooltip: 'Percentage gain to exit position'
      }
    ],
    template: `// Simple Moving Average Crossover Strategy
//@version=6
strategy("SMA Crossover", overlay=true, default_qty_type=strategy.percent_of_equity, default_qty_value=10)

// Parameters
fastLength = input.int({{fastLength}}, title="Fast MA Length", minval=1, maxval=100, group="Moving Averages", tooltip="Shorter period for faster signals")
slowLength = input.int({{slowLength}}, title="Slow MA Length", minval=1, maxval=200, group="Moving Averages", tooltip="Longer period for trend confirmation")
source = input.source({{source}}, title="Source", group="Moving Averages")
stopLossPercent = input.float({{stopLossPercent}}, title="Stop Loss %", minval=0.1, maxval=10.0, step=0.1, group="Risk Management")
takeProfitPercent = input.float({{takeProfitPercent}}, title="Take Profit %", minval=0.1, maxval=20.0, step=0.1, group="Risk Management")

// Calculate moving averages
fastMA = ta.sma(source, fastLength)
slowMA = ta.sma(source, slowLength)

// Plot moving averages
plot(fastMA, color=color.blue, title="Fast MA", linewidth=2)
plot(slowMA, color=color.red, title="Slow MA", linewidth=2)

// Entry conditions
longCondition = ta.crossover(fastMA, slowMA)
shortCondition = ta.crossunder(fastMA, slowMA)

// Calculate stop loss and take profit levels
longStopLoss = strategy.position_avg_price * (1 - stopLossPercent / 100)
longTakeProfit = strategy.position_avg_price * (1 + takeProfitPercent / 100)
shortStopLoss = strategy.position_avg_price * (1 + stopLossPercent / 100)
shortTakeProfit = strategy.position_avg_price * (1 - takeProfitPercent / 100)

// Execute trades with risk management
if longCondition
    strategy.entry("Long", strategy.long)
    strategy.exit("Long Exit", "Long", stop=longStopLoss, limit=longTakeProfit)

if shortCondition
    strategy.entry("Short", strategy.short)
    strategy.exit("Short Exit", "Short", stop=shortStopLoss, limit=shortTakeProfit)

// Plot entry signals
plotshape(longCondition, title="Long Signal", location=location.belowbar, color=color.green, style=shape.triangleup, size=size.small)
plotshape(shortCondition, title="Short Signal", location=location.abovebar, color=color.red, style=shape.triangledown, size=size.small)

// Background color for trend
bgcolor(fastMA > slowMA ? color.new(color.green, 95) : color.new(color.red, 95), title="Trend Background")`
  },
  
  {
    id: 'rsi-oversold-overbought',
    name: 'RSI Oversold/Overbought',
    description: 'Mean reversion strategy using RSI indicator with dynamic thresholds and risk management',
    category: 'mean-reversion',
    difficulty: 'beginner',
    timeframes: ['15m', '1h', '4h', '1d'],
    markets: ['stocks', 'forex', 'crypto'],
    tags: ['rsi', 'oversold', 'overbought', 'mean-reversion', 'oscillator'],
    version: '1.1',
    author: 'PineGenie',
    created: new Date('2024-01-01'),
    updated: new Date('2024-01-15'),
    parameters: [
      {
        name: 'rsiLength',
        type: 'int',
        defaultValue: 14,
        min: 2,
        max: 50,
        step: 1,
        description: 'RSI calculation period',
        group: 'RSI Settings',
        tooltip: 'Number of periods for RSI calculation'
      },
      {
        name: 'oversoldLevel',
        type: 'int',
        defaultValue: 30,
        min: 10,
        max: 40,
        step: 1,
        description: 'Oversold threshold',
        group: 'RSI Settings',
        tooltip: 'RSI level considered oversold'
      },
      {
        name: 'overboughtLevel',
        type: 'int',
        defaultValue: 70,
        min: 60,
        max: 90,
        step: 1,
        description: 'Overbought threshold',
        group: 'RSI Settings',
        tooltip: 'RSI level considered overbought'
      },
      {
        name: 'useConfirmation',
        type: 'bool',
        defaultValue: true,
        description: 'Use price confirmation',
        group: 'Entry Settings',
        tooltip: 'Wait for price confirmation before entry'
      },
      {
        name: 'riskRewardRatio',
        type: 'float',
        defaultValue: 2.0,
        min: 1.0,
        max: 5.0,
        step: 0.1,
        description: 'Risk/Reward ratio',
        group: 'Risk Management',
        tooltip: 'Target profit vs maximum loss ratio'
      }
    ],
    template: `// RSI Oversold/Overbought Strategy
//@version=6
strategy("RSI Mean Reversion", overlay=false, default_qty_type=strategy.percent_of_equity, default_qty_value=10)

// Parameters
rsiLength = input.int({{rsiLength}}, title="RSI Length", minval=2, maxval=50, group="RSI Settings", tooltip="Number of periods for RSI calculation")
oversoldLevel = input.int({{oversoldLevel}}, title="Oversold Level", minval=10, maxval=40, group="RSI Settings", tooltip="RSI level considered oversold")
overboughtLevel = input.int({{overboughtLevel}}, title="Overbought Level", minval=60, maxval=90, group="RSI Settings", tooltip="RSI level considered overbought")
useConfirmation = input.bool({{useConfirmation}}, title="Use Price Confirmation", group="Entry Settings", tooltip="Wait for price confirmation before entry")
riskRewardRatio = input.float({{riskRewardRatio}}, title="Risk/Reward Ratio", minval=1.0, maxval=5.0, step=0.1, group="Risk Management", tooltip="Target profit vs maximum loss ratio")

// Calculate RSI
rsi = ta.rsi(close, rsiLength)

// Calculate ATR for dynamic stop loss
atr = ta.atr(14)
atrMultiplier = 2.0

// Plot RSI
plot(rsi, color=color.purple, title="RSI", linewidth=2)
hline(overboughtLevel, "Overbought", color=color.red, linestyle=hline.style_solid)
hline(oversoldLevel, "Oversold", color=color.green, linestyle=hline.style_solid)
hline(50, "Midline", color=color.gray, linestyle=hline.style_dashed)

// Entry conditions with optional confirmation
rsiOversold = rsi < oversoldLevel
rsiOverbought = rsi > overboughtLevel
priceConfirmationLong = useConfirmation ? close > open : true
priceConfirmationShort = useConfirmation ? close < open : true

longCondition = ta.crossover(rsi, oversoldLevel) and priceConfirmationLong
shortCondition = ta.crossunder(rsi, overboughtLevel) and priceConfirmationShort

// Dynamic exit conditions
longExit = rsi > overboughtLevel or ta.crossunder(rsi, 50)
shortExit = rsi < oversoldLevel or ta.crossover(rsi, 50)

// Calculate stop loss and take profit levels
longStopLoss = low - atr * atrMultiplier
longTakeProfit = close + (close - longStopLoss) * riskRewardRatio
shortStopLoss = high + atr * atrMultiplier
shortTakeProfit = close - (shortStopLoss - close) * riskRewardRatio

// Execute trades with risk management
if longCondition
    strategy.entry("Long", strategy.long)
    strategy.exit("Long Exit", "Long", stop=longStopLoss, limit=longTakeProfit)

if shortCondition
    strategy.entry("Short", strategy.short)
    strategy.exit("Short Exit", "Short", stop=shortStopLoss, limit=shortTakeProfit)

// Alternative exit based on RSI levels
if longExit and strategy.position_size > 0
    strategy.close("Long", comment="RSI Exit")
if shortExit and strategy.position_size < 0
    strategy.close("Short", comment="RSI Exit")

// Plot entry signals
plotshape(longCondition, title="Long Signal", location=location.bottom, color=color.green, style=shape.triangleup, size=size.small)
plotshape(shortCondition, title="Short Signal", location=location.top, color=color.red, style=shape.triangledown, size=size.small)

// Background color based on RSI zones
bgcolor(rsi > overboughtLevel ? color.new(color.red, 85) : rsi < oversoldLevel ? color.new(color.green, 85) : na, title="RSI Zones")`
  },

  {
    id: 'bollinger-bands-breakout',
    name: 'Bollinger Bands Breakout',
    description: 'Advanced breakout strategy using Bollinger Bands with volume confirmation and dynamic exits',
    category: 'breakout',
    difficulty: 'intermediate',
    timeframes: ['5m', '15m', '1h', '4h'],
    markets: ['stocks', 'forex', 'crypto'],
    tags: ['bollinger-bands', 'breakout', 'volatility', 'volume'],
    version: '1.2',
    author: 'PineGenie',
    created: new Date('2024-01-01'),
    updated: new Date('2024-01-20'),
    parameters: [
      {
        name: 'bbLength',
        type: 'int',
        defaultValue: 20,
        min: 5,
        max: 50,
        step: 1,
        description: 'Bollinger Bands period',
        group: 'Bollinger Bands',
        tooltip: 'Number of periods for BB calculation'
      },
      {
        name: 'bbStdDev',
        type: 'float',
        defaultValue: 2.0,
        min: 1.0,
        max: 3.0,
        step: 0.1,
        description: 'Standard deviation multiplier',
        group: 'Bollinger Bands',
        tooltip: 'Multiplier for standard deviation'
      },
      {
        name: 'useVolumeFilter',
        type: 'bool',
        defaultValue: true,
        description: 'Use volume confirmation',
        group: 'Entry Filters',
        tooltip: 'Require above-average volume for entries'
      },
      {
        name: 'volumeThreshold',
        type: 'float',
        defaultValue: 1.5,
        min: 1.0,
        max: 3.0,
        step: 0.1,
        description: 'Volume threshold multiplier',
        group: 'Entry Filters',
        tooltip: 'Volume must be X times average'
      },
      {
        name: 'exitStrategy',
        type: 'string',
        defaultValue: 'middle_band',
        description: 'Exit strategy',
        group: 'Exit Settings',
        options: ['middle_band', 'opposite_band', 'trailing_stop']
      }
    ],
    template: `// Bollinger Bands Breakout Strategy
//@version=6
strategy("BB Breakout Advanced", overlay=true, default_qty_type=strategy.percent_of_equity, default_qty_value=10)

// Parameters
bbLength = input.int({{bbLength}}, title="BB Length", minval=5, maxval=50, group="Bollinger Bands", tooltip="Number of periods for BB calculation")
bbStdDev = input.float({{bbStdDev}}, title="BB StdDev", minval=1.0, maxval=3.0, step=0.1, group="Bollinger Bands", tooltip="Multiplier for standard deviation")
useVolumeFilter = input.bool({{useVolumeFilter}}, title="Use Volume Filter", group="Entry Filters", tooltip="Require above-average volume for entries")
volumeThreshold = input.float({{volumeThreshold}}, title="Volume Threshold", minval=1.0, maxval=3.0, step=0.1, group="Entry Filters", tooltip="Volume must be X times average")
exitStrategy = input.string("{{exitStrategy}}", title="Exit Strategy", options=["middle_band", "opposite_band", "trailing_stop"], group="Exit Settings")

// Calculate Bollinger Bands
[bbMiddle, bbUpper, bbLower] = ta.bb(close, bbLength, bbStdDev)

// Calculate volume filter
avgVolume = ta.sma(volume, 20)
volumeCondition = useVolumeFilter ? volume > avgVolume * volumeThreshold : true

// Calculate band width for volatility filter
bandWidth = (bbUpper - bbLower) / bbMiddle * 100
avgBandWidth = ta.sma(bandWidth, 10)
volatilityExpansion = bandWidth > avgBandWidth * 1.2

// Plot Bollinger Bands
plot(bbMiddle, color=color.blue, title="BB Middle", linewidth=2)
plot(bbUpper, color=color.red, title="BB Upper", linewidth=2)
plot(bbLower, color=color.green, title="BB Lower", linewidth=2)
fill(plot(bbUpper), plot(bbLower), color=color.new(color.blue, 95), title="BB Background")

// Entry conditions with filters
longCondition = ta.crossover(close, bbUpper) and volumeCondition and volatilityExpansion
shortCondition = ta.crossunder(close, bbLower) and volumeCondition and volatilityExpansion

// Dynamic exit conditions based on selected strategy
longExit = switch exitStrategy
    "middle_band" => ta.crossunder(close, bbMiddle)
    "opposite_band" => ta.crossunder(close, bbLower)
    "trailing_stop" => ta.crossunder(close, ta.highest(close, 5) * 0.95)
    => false

shortExit = switch exitStrategy
    "middle_band" => ta.crossover(close, bbMiddle)
    "opposite_band" => ta.crossover(close, bbUpper)
    "trailing_stop" => ta.crossover(close, ta.lowest(close, 5) * 1.05)
    => false

// Calculate ATR for stop loss
atr = ta.atr(14)
stopLossDistance = atr * 2

// Execute trades with risk management
if longCondition
    strategy.entry("Long", strategy.long)
    strategy.exit("Long SL", "Long", stop=close - stopLossDistance)

if shortCondition
    strategy.entry("Short", strategy.short)
    strategy.exit("Short SL", "Short", stop=close + stopLossDistance)

// Dynamic exits
if longExit and strategy.position_size > 0
    strategy.close("Long", comment="Dynamic Exit")
if shortExit and strategy.position_size < 0
    strategy.close("Short", comment="Dynamic Exit")

// Plot entry signals with volume confirmation
plotshape(longCondition, title="Long Signal", location=location.belowbar, color=color.green, style=shape.triangleup, size=size.normal)
plotshape(shortCondition, title="Short Signal", location=location.abovebar, color=color.red, style=shape.triangledown, size=size.normal)

// Plot volume bars
plotchar(volumeCondition, title="Volume OK", location=location.bottom, color=color.blue, char="V", size=size.tiny)

// Background color for volatility expansion
bgcolor(volatilityExpansion ? color.new(color.yellow, 95) : na, title="Volatility Expansion")`
  },

  {
    id: 'macd-signal',
    name: 'MACD Signal Strategy',
    description: 'Advanced momentum strategy using MACD crossovers with histogram confirmation and trend filtering',
    category: 'momentum',
    difficulty: 'intermediate',
    timeframes: ['15m', '1h', '4h', '1d'],
    markets: ['stocks', 'forex', 'crypto'],
    tags: ['macd', 'momentum', 'crossover', 'histogram'],
    version: '1.3',
    author: 'PineGenie',
    created: new Date('2024-01-01'),
    updated: new Date('2024-01-25'),
    parameters: [
      {
        name: 'fastLength',
        type: 'int',
        defaultValue: 12,
        min: 5,
        max: 25,
        step: 1,
        description: 'MACD fast EMA length',
        group: 'MACD Settings',
        tooltip: 'Fast EMA period for MACD calculation'
      },
      {
        name: 'slowLength',
        type: 'int',
        defaultValue: 26,
        min: 15,
        max: 50,
        step: 1,
        description: 'MACD slow EMA length',
        group: 'MACD Settings',
        tooltip: 'Slow EMA period for MACD calculation'
      },
      {
        name: 'signalLength',
        type: 'int',
        defaultValue: 9,
        min: 5,
        max: 20,
        step: 1,
        description: 'MACD signal line length',
        group: 'MACD Settings',
        tooltip: 'Signal line EMA period'
      },
      {
        name: 'useHistogramFilter',
        type: 'bool',
        defaultValue: true,
        description: 'Use histogram confirmation',
        group: 'Entry Filters',
        tooltip: 'Require histogram momentum confirmation'
      },
      {
        name: 'useTrendFilter',
        type: 'bool',
        defaultValue: true,
        description: 'Use trend filter',
        group: 'Entry Filters',
        tooltip: 'Only trade in direction of main trend'
      },
      {
        name: 'trendLength',
        type: 'int',
        defaultValue: 50,
        min: 20,
        max: 200,
        step: 1,
        description: 'Trend filter MA length',
        group: 'Entry Filters',
        tooltip: 'Moving average period for trend filter'
      }
    ],
    template: `// MACD Signal Strategy Advanced
//@version=6
strategy("MACD Advanced", overlay=false, default_qty_type=strategy.percent_of_equity, default_qty_value=10)

// Parameters
fastLength = input.int({{fastLength}}, title="Fast Length", minval=5, maxval=25, group="MACD Settings", tooltip="Fast EMA period for MACD calculation")
slowLength = input.int({{slowLength}}, title="Slow Length", minval=15, maxval=50, group="MACD Settings", tooltip="Slow EMA period for MACD calculation")
signalLength = input.int({{signalLength}}, title="Signal Length", minval=5, maxval=20, group="MACD Settings", tooltip="Signal line EMA period")
useHistogramFilter = input.bool({{useHistogramFilter}}, title="Use Histogram Filter", group="Entry Filters", tooltip="Require histogram momentum confirmation")
useTrendFilter = input.bool({{useTrendFilter}}, title="Use Trend Filter", group="Entry Filters", tooltip="Only trade in direction of main trend")
trendLength = input.int({{trendLength}}, title="Trend MA Length", minval=20, maxval=200, group="Entry Filters", tooltip="Moving average period for trend filter")

// Calculate MACD
[macdLine, signalLine, histLine] = ta.macd(close, fastLength, slowLength, signalLength)

// Calculate trend filter
trendMA = ta.ema(close, trendLength)
uptrend = close > trendMA
downtrend = close < trendMA

// Plot MACD on main chart
plot(macdLine, color=color.blue, title="MACD", linewidth=2)
plot(signalLine, color=color.red, title="Signal", linewidth=2)
plot(histLine, color=histLine > 0 ? color.green : color.red, style=plot.style_histogram, title="Histogram", linewidth=2)
hline(0, "Zero Line", color=color.gray, linestyle=hline.style_dashed)

// Entry conditions with filters
macdCrossUp = ta.crossover(macdLine, signalLine)
macdCrossDown = ta.crossunder(macdLine, signalLine)

// Histogram momentum filter
histogramMomentumUp = useHistogramFilter ? histLine > histLine[1] : true
histogramMomentumDown = useHistogramFilter ? histLine < histLine[1] : true

// Trend filter conditions
trendFilterLong = useTrendFilter ? uptrend : true
trendFilterShort = useTrendFilter ? downtrend : true

// Combined entry conditions
longCondition = macdCrossUp and histogramMomentumUp and trendFilterLong and macdLine < 0
shortCondition = macdCrossDown and histogramMomentumDown and trendFilterShort and macdLine > 0

// Exit conditions - multiple options
// 1. Opposite MACD cross
macdExitLong = ta.crossunder(macdLine, signalLine)
macdExitShort = ta.crossover(macdLine, signalLine)

// 2. Zero line cross
zeroLineCrossLong = ta.crossunder(macdLine, 0)
zeroLineCrossShort = ta.crossover(macdLine, 0)

// 3. Histogram divergence
histogramWeakening = math.abs(histLine) < math.abs(histLine[1]) and math.abs(histLine[1]) < math.abs(histLine[2])

// Calculate ATR for stop loss
atr = ta.atr(14)
stopLossMultiplier = 2.5

// Execute trades with multiple exit strategies
if longCondition
    strategy.entry("Long", strategy.long)
    strategy.exit("Long SL", "Long", stop=close - atr * stopLossMultiplier)

if shortCondition
    strategy.entry("Short", strategy.short)
    strategy.exit("Short SL", "Short", stop=close + atr * stopLossMultiplier)

// Dynamic exits
if (macdExitLong or zeroLineCrossLong) and strategy.position_size > 0
    strategy.close("Long", comment="MACD Exit")
if (macdExitShort or zeroLineCrossShort) and strategy.position_size < 0
    strategy.close("Short", comment="MACD Exit")

// Partial exit on histogram weakening
if histogramWeakening and strategy.position_size > 0
    strategy.close("Long", qty_percent=50, comment="Partial Exit")
if histogramWeakening and strategy.position_size < 0
    strategy.close("Short", qty_percent=50, comment="Partial Exit")

// Plot entry signals
plotshape(longCondition, title="Long Signal", location=location.bottom, color=color.green, style=shape.triangleup, size=size.normal)
plotshape(shortCondition, title="Short Signal", location=location.top, color=color.red, style=shape.triangledown, size=size.normal)

// Plot filter status
plotchar(trendFilterLong, title="Uptrend", location=location.bottom, color=color.green, char="↑", size=size.small)
plotchar(trendFilterShort, title="Downtrend", location=location.top, color=color.red, char="↓", size=size.small)

// Background color based on MACD and trend
bgcolor(macdLine > signalLine and uptrend ? color.new(color.green, 90) : 
         macdLine < signalLine and downtrend ? color.new(color.red, 90) : 
         color.new(color.gray, 95), title="MACD Trend Background")`
  },

  // Add new advanced templates
  {
    id: 'scalping-ema-stoch',
    name: 'EMA Stochastic Scalping',
    description: 'High-frequency scalping strategy using EMA and Stochastic oscillator for quick entries and exits',
    category: 'scalping',
    difficulty: 'advanced',
    timeframes: ['1m', '3m', '5m'],
    markets: ['forex', 'crypto'],
    tags: ['scalping', 'ema', 'stochastic', 'high-frequency'],
    version: '1.0',
    author: 'PineGenie',
    created: new Date('2024-01-30'),
    updated: new Date('2024-01-30'),
    parameters: [
      {
        name: 'emaLength',
        type: 'int',
        defaultValue: 21,
        min: 5,
        max: 50,
        step: 1,
        description: 'EMA period',
        group: 'EMA Settings',
        tooltip: 'Exponential moving average period'
      },
      {
        name: 'stochK',
        type: 'int',
        defaultValue: 14,
        min: 5,
        max: 25,
        step: 1,
        description: 'Stochastic %K period',
        group: 'Stochastic Settings',
        tooltip: 'Stochastic %K calculation period'
      },
      {
        name: 'stochD',
        type: 'int',
        defaultValue: 3,
        min: 1,
        max: 10,
        step: 1,
        description: 'Stochastic %D smoothing',
        group: 'Stochastic Settings',
        tooltip: 'Stochastic %D smoothing period'
      },
      {
        name: 'oversoldLevel',
        type: 'int',
        defaultValue: 20,
        min: 10,
        max: 30,
        step: 1,
        description: 'Oversold level',
        group: 'Stochastic Settings',
        tooltip: 'Stochastic oversold threshold'
      },
      {
        name: 'overboughtLevel',
        type: 'int',
        defaultValue: 80,
        min: 70,
        max: 90,
        step: 1,
        description: 'Overbought level',
        group: 'Stochastic Settings',
        tooltip: 'Stochastic overbought threshold'
      },
      {
        name: 'quickExit',
        type: 'bool',
        defaultValue: true,
        description: 'Use quick exit signals',
        group: 'Exit Settings',
        tooltip: 'Exit on opposite stochastic signals'
      },
      {
        name: 'maxBarsInTrade',
        type: 'int',
        defaultValue: 10,
        min: 3,
        max: 50,
        step: 1,
        description: 'Maximum bars in trade',
        group: 'Exit Settings',
        tooltip: 'Force exit after X bars'
      }
    ],
    template: `// EMA Stochastic Scalping Strategy
//@version=6
strategy("EMA Stoch Scalping", overlay=true, default_qty_type=strategy.percent_of_equity, default_qty_value=25, max_bars_back=500)

// Parameters
emaLength = input.int({{emaLength}}, title="EMA Length", minval=5, maxval=50, group="EMA Settings", tooltip="Exponential moving average period")
stochK = input.int({{stochK}}, title="Stochastic %K", minval=5, maxval=25, group="Stochastic Settings", tooltip="Stochastic %K calculation period")
stochD = input.int({{stochD}}, title="Stochastic %D", minval=1, maxval=10, group="Stochastic Settings", tooltip="Stochastic %D smoothing period")
oversoldLevel = input.int({{oversoldLevel}}, title="Oversold Level", minval=10, maxval=30, group="Stochastic Settings", tooltip="Stochastic oversold threshold")
overboughtLevel = input.int({{overboughtLevel}}, title="Overbought Level", minval=70, maxval=90, group="Stochastic Settings", tooltip="Stochastic overbought threshold")
quickExit = input.bool({{quickExit}}, title="Quick Exit", group="Exit Settings", tooltip="Exit on opposite stochastic signals")
maxBarsInTrade = input.int({{maxBarsInTrade}}, title="Max Bars in Trade", minval=3, maxval=50, group="Exit Settings", tooltip="Force exit after X bars")

// Calculate indicators
ema = ta.ema(close, emaLength)
k = ta.stoch(close, high, low, stochK)
d = ta.sma(k, stochD)

// Plot EMA
plot(ema, color=color.blue, title="EMA", linewidth=2)

// Entry conditions
priceAboveEMA = close > ema
priceBelowEMA = close < ema
stochOversold = k < oversoldLevel and d < oversoldLevel
stochOverbought = k > overboughtLevel and d > overboughtLevel
stochCrossUp = ta.crossover(k, d)
stochCrossDown = ta.crossunder(k, d)

longCondition = priceAboveEMA and stochOversold and stochCrossUp
shortCondition = priceBelowEMA and stochOverbought and stochCrossDown

// Exit conditions
longExitQuick = quickExit and (stochCrossDown or k > overboughtLevel)
shortExitQuick = quickExit and (stochCrossUp or k < oversoldLevel)

// Time-based exit
barsInTrade = strategy.position_size != 0 ? bar_index - strategy.opentrades.entry_bar_index(0) : 0
timeExit = barsInTrade >= maxBarsInTrade

// Calculate tight stops for scalping
atr = ta.atr(10)
stopDistance = atr * 1.5
takeProfitDistance = atr * 2.0

// Execute trades
if longCondition
    strategy.entry("Long", strategy.long)
    strategy.exit("Long TP/SL", "Long", stop=close - stopDistance, limit=close + takeProfitDistance)

if shortCondition
    strategy.entry("Short", strategy.short)
    strategy.exit("Short TP/SL", "Short", stop=close + stopDistance, limit=close - takeProfitDistance)

// Quick exits
if longExitQuick and strategy.position_size > 0
    strategy.close("Long", comment="Quick Exit")
if shortExitQuick and strategy.position_size < 0
    strategy.close("Short", comment="Quick Exit")

// Time-based exit
if timeExit
    strategy.close_all(comment="Time Exit")

// Plot signals
plotshape(longCondition, title="Long", location=location.belowbar, color=color.green, style=shape.triangleup, size=size.small)
plotshape(shortCondition, title="Short", location=location.abovebar, color=color.red, style=shape.triangledown, size=size.small)

// Background color for trend
bgcolor(priceAboveEMA ? color.new(color.green, 97) : color.new(color.red, 97), title="EMA Trend")`
  },

  {
    id: 'support-resistance-breakout',
    name: 'Support/Resistance Breakout',
    description: 'Breakout strategy based on dynamic support and resistance levels with volume confirmation',
    category: 'breakout',
    difficulty: 'advanced',
    timeframes: ['15m', '1h', '4h', '1d'],
    markets: ['stocks', 'forex', 'crypto'],
    tags: ['support', 'resistance', 'breakout', 'volume', 'levels'],
    version: '1.0',
    author: 'PineGenie',
    created: new Date('2024-02-01'),
    updated: new Date('2024-02-01'),
    parameters: [
      {
        name: 'lookbackPeriod',
        type: 'int',
        defaultValue: 20,
        min: 10,
        max: 50,
        step: 1,
        description: 'Lookback period for S/R levels',
        group: 'S/R Settings',
        tooltip: 'Number of bars to look back for S/R calculation'
      },
      {
        name: 'minTouches',
        type: 'int',
        defaultValue: 2,
        min: 2,
        max: 5,
        step: 1,
        description: 'Minimum touches for valid level',
        group: 'S/R Settings',
        tooltip: 'Minimum number of touches to confirm S/R level'
      },
      {
        name: 'breakoutThreshold',
        type: 'float',
        defaultValue: 0.1,
        min: 0.05,
        max: 0.5,
        step: 0.01,
        description: 'Breakout threshold %',
        group: 'Breakout Settings',
        tooltip: 'Percentage move required for breakout confirmation'
      },
      {
        name: 'volumeMultiplier',
        type: 'float',
        defaultValue: 1.5,
        min: 1.0,
        max: 3.0,
        step: 0.1,
        description: 'Volume confirmation multiplier',
        group: 'Volume Settings',
        tooltip: 'Volume must be X times average for confirmation'
      },
      {
        name: 'useRetestEntry',
        type: 'bool',
        defaultValue: true,
        description: 'Wait for retest before entry',
        group: 'Entry Settings',
        tooltip: 'Enter on retest of broken level'
      }
    ],
    template: `// Support/Resistance Breakout Strategy
//@version=6
strategy("S/R Breakout", overlay=true, default_qty_type=strategy.percent_of_equity, default_qty_value=15)

// Parameters
lookbackPeriod = input.int({{lookbackPeriod}}, title="Lookback Period", minval=10, maxval=50, group="S/R Settings", tooltip="Number of bars to look back for S/R calculation")
minTouches = input.int({{minTouches}}, title="Min Touches", minval=2, maxval=5, group="S/R Settings", tooltip="Minimum number of touches to confirm S/R level")
breakoutThreshold = input.float({{breakoutThreshold}}, title="Breakout Threshold %", minval=0.05, maxval=0.5, step=0.01, group="Breakout Settings", tooltip="Percentage move required for breakout confirmation")
volumeMultiplier = input.float({{volumeMultiplier}}, title="Volume Multiplier", minval=1.0, maxval=3.0, step=0.1, group="Volume Settings", tooltip="Volume must be X times average for confirmation")
useRetestEntry = input.bool({{useRetestEntry}}, title="Use Retest Entry", group="Entry Settings", tooltip="Enter on retest of broken level")

// Calculate support and resistance levels
var float resistance = na
var float support = na
var int resistanceTouches = 0
var int supportTouches = 0

// Find pivot highs and lows
pivotHigh = ta.pivothigh(high, lookbackPeriod, lookbackPeriod)
pivotLow = ta.pivotlow(low, lookbackPeriod, lookbackPeriod)

// Update resistance level
if not na(pivotHigh)
    if na(resistance) or math.abs(pivotHigh - resistance) / resistance < 0.01
        resistance := pivotHigh
        resistanceTouches := resistanceTouches + 1
    else if pivotHigh > resistance
        resistance := pivotHigh
        resistanceTouches := 1

// Update support level
if not na(pivotLow)
    if na(support) or math.abs(pivotLow - support) / support < 0.01
        support := pivotLow
        supportTouches := supportTouches + 1
    else if pivotLow < support
        support := pivotLow
        supportTouches := 1

// Plot support and resistance levels
plot(resistance, color=resistanceTouches >= minTouches ? color.red : color.gray, style=plot.style_line, linewidth=2, title="Resistance")
plot(support, color=supportTouches >= minTouches ? color.green : color.gray, style=plot.style_line, linewidth=2, title="Support")

// Volume confirmation
avgVolume = ta.sma(volume, 20)
volumeConfirmation = volume > avgVolume * volumeMultiplier

// Breakout conditions
resistanceBreakout = not na(resistance) and resistanceTouches >= minTouches and close > resistance * (1 + breakoutThreshold / 100) and volumeConfirmation
supportBreakout = not na(support) and supportTouches >= minTouches and close < support * (1 - breakoutThreshold / 100) and volumeConfirmation

// Retest conditions
var bool waitingForRetestLong = false
var bool waitingForRetestShort = false

if resistanceBreakout and not waitingForRetestLong
    waitingForRetestLong := useRetestEntry

if supportBreakout and not waitingForRetestShort
    waitingForRetestShort := useRetestEntry

// Retest entry conditions
retestLongEntry = waitingForRetestLong and low <= resistance and close > resistance
retestShortEntry = waitingForRetestShort and high >= support and close < support

// Final entry conditions
longCondition = useRetestEntry ? retestLongEntry : resistanceBreakout
shortCondition = useRetestEntry ? retestShortEntry : supportBreakout

// Reset retest flags
if longCondition
    waitingForRetestLong := false
if shortCondition
    waitingForRetestShort := false

// Calculate stop loss and take profit
atr = ta.atr(14)
longStopLoss = not na(resistance) ? resistance - atr : close - atr * 2
longTakeProfit = close + (close - longStopLoss) * 2
shortStopLoss = not na(support) ? support + atr : close + atr * 2
shortTakeProfit = close - (shortStopLoss - close) * 2

// Execute trades
if longCondition
    strategy.entry("Long", strategy.long)
    strategy.exit("Long Exit", "Long", stop=longStopLoss, limit=longTakeProfit)

if shortCondition
    strategy.entry("Short", strategy.short)
    strategy.exit("Short Exit", "Short", stop=shortStopLoss, limit=shortTakeProfit)

// Plot entry signals
plotshape(longCondition, title="Long Breakout", location=location.belowbar, color=color.green, style=shape.triangleup, size=size.normal)
plotshape(shortCondition, title="Short Breakout", location=location.abovebar, color=color.red, style=shape.triangledown, size=size.normal)

// Plot retest waiting status
plotchar(waitingForRetestLong, title="Waiting Long Retest", location=location.abovebar, color=color.blue, char="L", size=size.small)
plotchar(waitingForRetestShort, title="Waiting Short Retest", location=location.belowbar, color=color.orange, char="S", size=size.small)

// Background color for breakout zones
bgcolor(resistanceBreakout ? color.new(color.green, 90) : supportBreakout ? color.new(color.red, 90) : na, title="Breakout Zones")`
  }
];

// Template categories for organization
export const templateCategories: TemplateCategory[] = [
  {
    id: 'trend-following',
    name: 'Trend Following',
    description: 'Strategies that follow market trends using moving averages and trend indicators',
    icon: '📈',
    templates: ['sma-crossover']
  },
  {
    id: 'mean-reversion',
    name: 'Mean Reversion',
    description: 'Strategies that trade against extreme price movements expecting a return to average',
    icon: '🔄',
    templates: ['rsi-oversold-overbought']
  },
  {
    id: 'breakout',
    name: 'Breakout',
    description: 'Strategies that trade breakouts from support/resistance levels or volatility bands',
    icon: '💥',
    templates: ['bollinger-bands-breakout', 'support-resistance-breakout']
  },
  {
    id: 'momentum',
    name: 'Momentum',
    description: 'Strategies that trade based on price momentum and oscillator signals',
    icon: '🚀',
    templates: ['macd-signal']
  },
  {
    id: 'scalping',
    name: 'Scalping',
    description: 'High-frequency strategies for quick profits on small price movements',
    icon: '⚡',
    templates: ['scalping-ema-stoch']
  }
];

export class StrategyTemplateManager {
  private templates: Map<string, StrategyTemplate> = new Map();
  private categories: Map<string, TemplateCategory> = new Map();

  constructor() {
    // Load templates
    strategyTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });

    // Load categories
    templateCategories.forEach(category => {
      this.categories.set(category.id, category);
    });
  }

  // Template retrieval methods
  getTemplate(id: string): StrategyTemplate | undefined {
    return this.templates.get(id);
  }

  getAllTemplates(): StrategyTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByCategory(category: string): StrategyTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.category === category);
  }

  getTemplatesByDifficulty(difficulty: string): StrategyTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.difficulty === difficulty);
  }

  getTemplatesByTimeframe(timeframe: string): StrategyTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.timeframes.includes(timeframe));
  }

  getTemplatesByMarket(market: string): StrategyTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.markets.includes(market));
  }

  // Category methods
  getAllCategories(): TemplateCategory[] {
    return Array.from(this.categories.values());
  }

  getCategory(id: string): TemplateCategory | undefined {
    return this.categories.get(id);
  }

  // Advanced search functionality
  searchTemplates(options: TemplateSearchOptions): StrategyTemplate[] {
    let results = Array.from(this.templates.values());

    // Text search
    if (options.query) {
      const lowerQuery = options.query.toLowerCase();
      results = results.filter(template => 
        template.name.toLowerCase().includes(lowerQuery) ||
        template.description.toLowerCase().includes(lowerQuery) ||
        template.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        template.author.toLowerCase().includes(lowerQuery)
      );
    }

    // Category filter
    if (options.category) {
      results = results.filter(t => t.category === options.category);
    }

    // Difficulty filter
    if (options.difficulty) {
      results = results.filter(t => t.difficulty === options.difficulty);
    }

    // Tags filter
    if (options.tags && options.tags.length > 0) {
      results = results.filter(t => 
        options.tags!.some(tag => t.tags.includes(tag))
      );
    }

    // Timeframes filter
    if (options.timeframes && options.timeframes.length > 0) {
      results = results.filter(t => 
        options.timeframes!.some(tf => t.timeframes.includes(tf))
      );
    }

    // Markets filter
    if (options.markets && options.markets.length > 0) {
      results = results.filter(t => 
        options.markets!.some(market => t.markets.includes(market))
      );
    }

    return results;
  }

  // Code generation with validation
  generateCode(templateId: string, parameters: Record<string, any>): string {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    let code = template.template;
    
    // Validate parameters
    this.validateParameters(template, parameters);
    
    // Replace parameter placeholders
    template.parameters.forEach(param => {
      const value = parameters[param.name] ?? param.defaultValue;
      const placeholder = new RegExp(`{{${param.name}}}`, 'g');
      code = code.replace(placeholder, this.formatParameterValue(value, param.type));
    });

    return code;
  }

  // Parameter validation
  private validateParameters(template: StrategyTemplate, parameters: Record<string, any>): void {
    template.parameters.forEach(param => {
      const value = parameters[param.name];
      
      if (value !== undefined) {
        // Type validation
        if (param.type === 'int' && !Number.isInteger(Number(value))) {
          throw new Error(`Parameter ${param.name} must be an integer`);
        }
        
        if (param.type === 'float' && isNaN(Number(value))) {
          throw new Error(`Parameter ${param.name} must be a number`);
        }
        
        if (param.type === 'bool' && typeof value !== 'boolean') {
          throw new Error(`Parameter ${param.name} must be a boolean`);
        }

        // Range validation
        if (param.min !== undefined && Number(value) < param.min) {
          throw new Error(`Parameter ${param.name} must be >= ${param.min}`);
        }
        
        if (param.max !== undefined && Number(value) > param.max) {
          throw new Error(`Parameter ${param.name} must be <= ${param.max}`);
        }

        // Options validation
        if (param.options && !param.options.includes(String(value))) {
          throw new Error(`Parameter ${param.name} must be one of: ${param.options.join(', ')}`);
        }
      }
    });
  }

  // Enhanced parameter formatting
  private formatParameterValue(value: any, type: string): string {
    switch (type) {
      case 'string':
      case 'source':
        return String(value);
      case 'bool':
        return value ? 'true' : 'false';
      case 'int':
        return String(Math.round(Number(value)));
      case 'float':
        return String(Number(value));
      case 'color':
        return `color.${value}`;
      default:
        return String(value);
    }
  }

  // Template validation using Pine Script validator
  validateTemplate(templateId: string, parameters?: Record<string, any>): TemplateValidationResult {
    const template = this.getTemplate(templateId);
    if (!template) {
      return {
        isValid: false,
        errors: [`Template not found: ${templateId}`],
        warnings: [],
        suggestions: [],
        pineScriptVersion: 'unknown'
      };
    }

    try {
      const code = this.generateCode(templateId, parameters || {});
      const validationResult = pineValidator.validate(code);
      
      return {
        isValid: validationResult.isValid,
        errors: validationResult.errors.map(e => e.message),
        warnings: validationResult.warnings.map(w => w.message),
        suggestions: validationResult.suggestions.map(s => s.message),
        pineScriptVersion: template.version
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        suggestions: [],
        pineScriptVersion: template.version
      };
    }
  }

  // Template management
  addCustomTemplate(template: StrategyTemplate): void {
    // Validate template structure
    this.validateTemplateStructure(template);
    
    // Validate generated code
    const validation = this.validateTemplate(template.id);
    if (!validation.isValid) {
      throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
    }
    
    this.templates.set(template.id, template);
  }

  removeTemplate(id: string): boolean {
    return this.templates.delete(id);
  }

  updateTemplate(id: string, updates: Partial<StrategyTemplate>): boolean {
    const template = this.templates.get(id);
    if (!template) {
      return false;
    }

    const updatedTemplate = { ...template, ...updates, updated: new Date() };
    this.validateTemplateStructure(updatedTemplate);
    
    this.templates.set(id, updatedTemplate);
    return true;
  }

  // Template structure validation
  private validateTemplateStructure(template: StrategyTemplate): void {
    const requiredFields = ['id', 'name', 'description', 'category', 'template', 'parameters'];
    
    for (const field of requiredFields) {
      if (!(field in template)) {
        throw new Error(`Template missing required field: ${field}`);
      }
    }

    // Validate template contains Pine Script version
    if (!template.template.includes('//@version=6')) {
      throw new Error('Template must include Pine Script v6 version declaration');
    }

    // Validate parameters structure
    template.parameters.forEach((param, index) => {
      if (!param.name || !param.type || param.defaultValue === undefined) {
        throw new Error(`Parameter ${index} missing required fields (name, type, defaultValue)`);
      }
    });
  }

  // Get template statistics
  getTemplateStats(): {
    totalTemplates: number;
    categoryCounts: Record<string, number>;
    difficultyCounts: Record<string, number>;
    averageParameters: number;
  } {
    const templates = this.getAllTemplates();
    
    const categoryCounts: Record<string, number> = {};
    const difficultyCounts: Record<string, number> = {};
    let totalParameters = 0;

    templates.forEach(template => {
      categoryCounts[template.category] = (categoryCounts[template.category] || 0) + 1;
      difficultyCounts[template.difficulty] = (difficultyCounts[template.difficulty] || 0) + 1;
      totalParameters += template.parameters.length;
    });

    return {
      totalTemplates: templates.length,
      categoryCounts,
      difficultyCounts,
      averageParameters: templates.length > 0 ? totalParameters / templates.length : 0
    };
  }
}

export const templateManager = new StrategyTemplateManager();