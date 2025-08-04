# PineGenie AI Strategy Builder - User Manual

## Table of Contents
1. [Getting Started](#getting-started)
2. [Understanding the AI Interface](#understanding-the-ai-interface)
3. [Building Strategies with Natural Language](#building-strategies-with-natural-language)
4. [Working with Nodes and Indicators](#working-with-nodes-and-indicators)
5. [Advanced Strategy Building](#advanced-strategy-building)
6. [Optimization and Fine-tuning](#optimization-and-fine-tuning)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## Getting Started

### What is PineGenie AI?

PineGenie AI is an intelligent strategy builder that transforms your natural language descriptions into visual, node-based trading strategies. Instead of writing complex Pine Script code, you simply describe what you want your strategy to do, and the AI creates it for you.

### Key Features

- **Natural Language Processing**: Describe strategies in plain English
- **Visual Node Builder**: See your strategy as connected nodes
- **Intelligent Suggestions**: AI recommends optimizations and improvements
- **Real-time Validation**: Instant feedback on strategy logic
- **Pine Script Generation**: Automatic code generation for TradingView

---

## Understanding the AI Interface

### Chat Interface

The PineGenie AI chat interface is your primary tool for strategy creation. It features:

- **Message Input**: Type your strategy descriptions naturally
- **AI Responses**: Intelligent replies with suggestions and clarifications
- **Action Buttons**: Quick actions like "Build Strategy" or "Show Preview"
- **Strategy Previews**: Visual cards showing strategy components

### Example Conversation

```
You: "Create a RSI strategy that buys when oversold"

AI: "I'll help you create an RSI mean reversion strategy. Here's what I understand:
- Use RSI indicator for momentum analysis
- Buy when RSI indicates oversold conditions (typically below 30)
- This will be a mean reversion strategy

Would you like me to:
[Build Strategy] [Add Risk Management] [Show Preview]"
```

---

## Building Strategies with Natural Language

### Basic Strategy Requests

#### Simple RSI Strategy
```
"Create a RSI strategy with 14 period that buys when RSI is below 30 and sells when above 70"
```

**AI Response**: Creates a complete strategy with:
- Market data source node
- RSI indicator node (period: 14)
- Two condition nodes (< 30, > 70)
- Buy and sell action nodes

#### MACD Crossover Strategy
```
"Build a MACD crossover strategy for trend following with stop loss"
```

**AI Response**: Generates:
- Market data source
- MACD indicator with standard parameters (12, 26, 9)
- Crossover detection nodes
- Buy/sell actions
- Stop loss risk management

#### Bollinger Bands Breakout
```
"I want a Bollinger Bands breakout strategy with 2% stop loss and 4% take profit"
```

**AI Response**: Creates:
- Market data source
- Bollinger Bands indicator (20 period, 2 standard deviations)
- Breakout condition nodes
- Entry actions
- Risk management nodes (2% SL, 4% TP)

### Advanced Strategy Descriptions

#### Multi-Indicator Confirmation
```
"Create a strategy that uses RSI below 30 AND MACD bullish crossover for buy signals, with position sizing based on volatility"
```

**AI Response**: Builds:
- Multiple indicator nodes (RSI, MACD)
- Confirmation logic nodes (AND condition)
- Volatility-based position sizing
- Complex entry conditions

#### Time-Filtered Strategy
```
"Build a scalping strategy using EMA crossover that only trades during market hours 9:30-16:00 EST"
```

**AI Response**: Creates:
- EMA indicators
- Crossover detection
- Time filter nodes
- Market hours validation

---

## Working with Nodes and Indicators

### Understanding Node Types

#### 1. Data Source Nodes
- **Purpose**: Provide market data (OHLCV)
- **Configuration**: Symbol, timeframe
- **Outputs**: Open, High, Low, Close, Volume

#### 2. Indicator Nodes
Available indicators include:

**Trend Indicators**:
- Simple Moving Average (SMA)
- Exponential Moving Average (EMA)
- Weighted Moving Average (WMA)
- MACD (Moving Average Convergence Divergence)
- Parabolic SAR

**Momentum Indicators**:
- RSI (Relative Strength Index)
- Stochastic Oscillator
- Williams %R
- Commodity Channel Index (CCI)

**Volatility Indicators**:
- Bollinger Bands
- Average True Range (ATR)
- Keltner Channels

**Volume Indicators**:
- Volume SMA
- Volume Weighted Average Price (VWAP)
- On-Balance Volume (OBV)

#### 3. Condition Nodes
- **Comparison**: Greater than, less than, equal to
- **Crossover**: Crosses above, crosses below
- **Range**: Within range, outside range
- **Logic**: AND, OR, NOT operations

#### 4. Action Nodes
- **Entry**: Buy (long), Sell (short)
- **Exit**: Close position, partial close
- **Order Types**: Market, limit, stop orders

#### 5. Risk Management Nodes
- **Stop Loss**: Fixed percentage, ATR-based, trailing
- **Take Profit**: Fixed target, multiple targets
- **Position Sizing**: Fixed size, percentage of equity, volatility-based

### Node Configuration Examples

#### RSI Indicator Node
```
AI Input: "RSI with 21 period using close price"

Generated Node:
- Type: Indicator
- Indicator: RSI
- Parameters:
  - Period: 21
  - Source: Close
- Outputs: RSI Value (0-100)
```

#### Condition Node
```
AI Input: "Buy when RSI is below 25"

Generated Node:
- Type: Condition
- Condition: Less Than
- Parameters:
  - Input: RSI Value
  - Threshold: 25
- Output: Boolean (True/False)
```

#### Action Node
```
AI Input: "Market buy order with 1% position size"

Generated Node:
- Type: Action
- Action: Buy
- Parameters:
  - Order Type: Market
  - Position Size: 1%
  - Quantity: Percentage of equity
```

---

## Advanced Strategy Building

### Multi-Timeframe Strategies

```
"Create a strategy that uses daily RSI for trend direction and hourly MACD for entry timing"
```

**AI Response**: 
- Creates separate data sources for different timeframes
- Implements higher timeframe analysis
- Combines signals from multiple timeframes

### Complex Logic Strategies

```
"Build a strategy that buys when:
- RSI is oversold (below 30)
- AND price is above 200 SMA (uptrend)
- AND volume is above average
- BUT NOT if we're in the last hour of trading"
```

**AI Response**:
- Creates multiple condition nodes
- Implements complex AND/OR logic
- Adds time-based filters
- Combines multiple confirmation signals

### Dynamic Parameter Strategies

```
"Create an adaptive RSI strategy where the oversold/overbought levels adjust based on market volatility"
```

**AI Response**:
- Implements volatility measurement (ATR)
- Creates dynamic threshold calculation
- Adjusts RSI levels based on market conditions

---

## Optimization and Fine-tuning

### AI-Powered Optimization

The AI continuously analyzes your strategy and provides optimization suggestions:

#### Parameter Optimization
```
AI Suggestion: "I notice your RSI period is set to 14. Based on your 1-hour timeframe, 
consider testing periods between 10-21 for better signal quality."

[Optimize Parameters] [Test Different Periods] [Keep Current]
```

#### Risk Management Improvements
```
AI Suggestion: "Your strategy lacks risk management. I recommend adding:
- 2% stop loss for downside protection
- 1.5:1 risk-reward ratio for take profit
- Maximum 3 concurrent positions"

[Add Risk Management] [Customize Settings] [Skip]
```

#### Performance Enhancements
```
AI Suggestion: "To reduce false signals, consider adding:
- Volume confirmation (volume > 20-period average)
- Trend filter (price above 50 EMA)
- Time filter (avoid first/last 30 minutes)"

[Add Filters] [Show Details] [Ignore]
```

### Manual Fine-tuning

You can also manually adjust parameters:

```
"Change the RSI period from 14 to 21 and make the oversold level 25 instead of 30"
```

**AI Response**: Updates the strategy nodes with new parameters and explains the impact.

---

## Strategy Examples by Type

### 1. Mean Reversion Strategies

#### Basic RSI Mean Reversion
```
Input: "RSI mean reversion strategy with 14 period, buy below 30, sell above 70"

Generated Strategy:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Market Data │───▶│ RSI (14)    │───▶│ RSI < 30    │───▶│ Buy Market  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                      ┌─────────────┐    ┌─────────────┐
                                      │ RSI > 70    │───▶│ Sell Market │
                                      └─────────────┘    └─────────────┘
```

#### Bollinger Bands Mean Reversion
```
Input: "Bollinger Bands mean reversion with 2 standard deviations"

Generated Strategy:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Market Data │───▶│ BB (20,2)   │───▶│ Price < BB  │───▶│ Buy Market  │
└─────────────┘    └─────────────┘    │ Lower Band  │    └─────────────┘
                                      └─────────────┘
                                      ┌─────────────┐    ┌─────────────┐
                                      │ Price > BB  │───▶│ Sell Market │
                                      │ Upper Band  │    └─────────────┘
                                      └─────────────┘
```

### 2. Trend Following Strategies

#### MACD Crossover
```
Input: "MACD crossover strategy with standard settings"

Generated Strategy:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Market Data │───▶│ MACD        │───▶│ MACD Cross  │───▶│ Buy Market  │
└─────────────┘    │ (12,26,9)   │    │ Above Signal│    └─────────────┘
                   └─────────────┘    └─────────────┘
                                      ┌─────────────┐    ┌─────────────┐
                                      │ MACD Cross  │───▶│ Sell Market │
                                      │ Below Signal│    └─────────────┘
                                      └─────────────┘
```

#### Moving Average Crossover
```
Input: "EMA crossover strategy with 20 and 50 periods"

Generated Strategy:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Market Data │───▶│ EMA (20)    │───▶│ EMA20 Cross │───▶│ Buy Market  │
└─────────────┘    └─────────────┘    │ Above EMA50 │    └─────────────┘
                   ┌─────────────┐    └─────────────┘
                   │ EMA (50)    │
                   └─────────────┘    ┌─────────────┐    ┌─────────────┐
                                      │ EMA20 Cross │───▶│ Sell Market │
                                      │ Below EMA50 │    └─────────────┘
                                      └─────────────┘
```

### 3. Breakout Strategies

#### Bollinger Bands Breakout
```
Input: "Bollinger Bands breakout strategy with volume confirmation"

Generated Strategy:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Market Data │───▶│ BB (20,2)   │───▶│ Price Break │───▶│ Volume >    │
└─────────────┘    └─────────────┘    │ Upper Band  │    │ Average     │
                                      └─────────────┘    └─────────────┘
                                                                │
                                                                ▼
                                                         ┌─────────────┐
                                                         │ Buy Market  │
                                                         └─────────────┘
```

### 4. Multi-Indicator Strategies

#### RSI + MACD Confirmation
```
Input: "Strategy using RSI oversold and MACD bullish crossover for confirmation"

Generated Strategy:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Market Data │───▶│ RSI (14)    │───▶│ RSI < 30    │
└─────────────┘    └─────────────┘    └─────────────┘
                   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
                   │ MACD        │───▶│ MACD Cross  │───▶│ AND Logic   │───▶│ Buy Market  │
                   │ (12,26,9)   │    │ Above Signal│    │ Gate        │    └─────────────┘
                   └─────────────┘    └─────────────┘    └─────────────┘
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: "Strategy has no entry signals"
**Cause**: Conditions are too restrictive or conflicting
**Solution**: 
```
"My strategy isn't generating any signals. Can you help?"

AI Response: "I see the issue. Your RSI threshold of 15 is too extreme. 
Let me adjust it to 25 for more frequent signals."
```

#### Issue: "Too many false signals"
**Cause**: Lack of confirmation or filtering
**Solution**:
```
"The strategy is generating too many false signals"

AI Response: "I'll add a trend filter using the 200 SMA to reduce 
counter-trend signals and improve signal quality."
```

#### Issue: "Strategy is too risky"
**Cause**: Missing risk management
**Solution**:
```
"This strategy seems too risky"

AI Response: "You're right. Let me add proper risk management:
- 2% stop loss on all positions
- Maximum 3 concurrent trades
- Position sizing based on account equity"
```

### Error Messages and Fixes

#### "Invalid parameter range"
```
Error: RSI period cannot be negative or zero

Fix: "Change the RSI period to 14" (AI automatically validates and corrects)
```

#### "Circular dependency detected"
```
Error: Node connections create a loop

Fix: AI automatically reorganizes the strategy flow to eliminate circular references
```

#### "Missing required input"
```
Error: Condition node has no input source

Fix: AI identifies missing connections and suggests appropriate indicator nodes
```

---

## Best Practices

### 1. Start Simple
Begin with basic strategies and gradually add complexity:

```
Step 1: "Create a simple RSI strategy"
Step 2: "Add volume confirmation to the RSI strategy"
Step 3: "Include trend filter using 200 SMA"
Step 4: "Add proper risk management with stop loss"
```

### 2. Use Clear Descriptions
Be specific about your requirements:

**Good**: "RSI strategy with 21 period, buy below 25, sell above 75, with 2% stop loss"
**Poor**: "Make an RSI thing that trades"

### 3. Iterate and Refine
Use the AI's suggestions to improve your strategy:

```
You: "Create a MACD strategy"
AI: "Here's your MACD strategy. Would you like me to add trend filtering to reduce false signals?"
You: "Yes, add a 200 SMA trend filter"
AI: "Perfect! I've added the trend filter. Now the strategy only takes long signals when price is above the 200 SMA."
```

### 4. Test Different Timeframes
Ask the AI about timeframe suitability:

```
"Is this RSI strategy better for 1-hour or 4-hour timeframes?"

AI Response: "For RSI mean reversion, I recommend 1-hour timeframes for more frequent signals, 
or 4-hour for more reliable but less frequent signals. Would you like me to optimize 
the parameters for your chosen timeframe?"
```

### 5. Always Include Risk Management
Never deploy a strategy without proper risk controls:

```
"Add comprehensive risk management to this strategy"

AI Response: "I'll add:
- 2% stop loss (adjustable based on ATR)
- 1.5:1 minimum risk-reward ratio
- Maximum 5% total portfolio risk
- Position sizing based on volatility"
```

### 6. Understand Your Strategy
Ask the AI to explain the logic:

```
"Explain how this strategy works"

AI Response: "This is a mean reversion strategy that:
1. Uses RSI to identify oversold conditions (RSI < 30)
2. Confirms with volume (above 20-period average)
3. Enters long positions with market orders
4. Exits when RSI reaches overbought (RSI > 70)
5. Protects with 2% stop loss if trade goes against you"
```

---

## Advanced Tips

### 1. Combining Multiple Strategies
```
"Create a portfolio approach with both trend following and mean reversion strategies"

AI Response: "I'll create a multi-strategy system:
- Strategy 1: MACD trend following (60% allocation)
- Strategy 2: RSI mean reversion (40% allocation)
- Risk management applied to the combined portfolio"
```

### 2. Market Condition Adaptation
```
"Make the strategy adapt to different market conditions"

AI Response: "I'll add market regime detection:
- High volatility: Wider stops, smaller positions
- Low volatility: Tighter stops, larger positions
- Trending markets: Favor trend-following signals
- Ranging markets: Favor mean reversion signals"
```

### 3. Advanced Order Types
```
"Use limit orders instead of market orders with smart pricing"

AI Response: "I'll implement intelligent limit orders:
- Buy limits: 0.1% below current price
- Sell limits: 0.1% above current price
- Automatic conversion to market if not filled within 5 minutes"
```

---

## Getting Help

### In-Chat Help
- Type "help" for general assistance
- Type "explain [strategy name]" for strategy explanations
- Type "optimize" for improvement suggestions

### Common Help Commands
```
"help with RSI" - Get RSI-specific guidance
"explain MACD" - Learn about MACD indicators
"show examples" - See strategy examples
"optimize parameters" - Get optimization suggestions
"add risk management" - Include risk controls
```

### AI Assistance Features
- **Real-time suggestions**: AI proactively suggests improvements
- **Error detection**: Automatic identification of strategy issues
- **Performance insights**: Analysis of strategy characteristics
- **Educational content**: Learn while you build

---

## Conclusion

PineGenie AI makes strategy building accessible to everyone, regardless of coding experience. By describing your trading ideas in natural language, you can create sophisticated, node-based strategies that are automatically converted to Pine Script for TradingView.

Remember:
- Start simple and iterate
- Always include risk management
- Use the AI's suggestions to improve your strategies
- Test thoroughly before live trading

The AI is your partner in strategy development - don't hesitate to ask questions, request explanations, or seek optimization suggestions. Happy trading!

---

*For technical support or advanced features, please refer to the developer documentation or contact the PineGenie support team.*