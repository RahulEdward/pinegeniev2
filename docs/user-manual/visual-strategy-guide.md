# PineGenie AI - Visual Strategy Building Guide

## Understanding Node-Based Strategy Construction

### What Are Nodes?

Nodes are visual building blocks that represent different components of your trading strategy. Each node has:
- **Inputs**: Data or signals coming into the node
- **Processing**: The logic or calculation performed
- **Outputs**: Results sent to other nodes

---

## Node Types and Visual Representation

### 📊 Data Source Nodes
```
┌─────────────────┐
│   Market Data   │
│   BTCUSDT 1h    │
├─────────────────┤
│ Outputs:        │
│ • Open          │
│ • High          │
│ • Low           │
│ • Close         │
│ • Volume        │
└─────────────────┘
```

### 📈 Indicator Nodes

#### RSI Indicator
```
┌─────────────────┐
│   RSI (14)      │
│   Momentum      │
├─────────────────┤
│ Input: Close    │
│ Output: 0-100   │
│ Current: 45.2   │
└─────────────────┘
```

#### MACD Indicator
```
┌─────────────────┐
│   MACD          │
│   (12,26,9)     │
├─────────────────┤
│ Input: Close    │
│ Outputs:        │
│ • MACD Line     │
│ • Signal Line   │
│ • Histogram     │
└─────────────────┘
```

#### Bollinger Bands
```
┌─────────────────┐
│ Bollinger Bands │
│   (20, 2.0)     │
├─────────────────┤
│ Input: Close    │
│ Outputs:        │
│ • Upper Band    │
│ • Middle (SMA)  │
│ • Lower Band    │
└─────────────────┘
```

### ⚖️ Condition Nodes

#### Comparison Condition
```
┌─────────────────┐
│   RSI < 30      │
│   Oversold      │
├─────────────────┤
│ Input: RSI      │
│ Threshold: 30   │
│ Output: Boolean │
│ Status: FALSE   │
└─────────────────┘
```

#### Crossover Condition
```
┌─────────────────┐
│  MACD Crossover │
│  Above Signal   │
├─────────────────┤
│ Input A: MACD   │
│ Input B: Signal │
│ Output: Boolean │
│ Status: TRUE    │
└─────────────────┘
```

#### Logic Gate (AND)
```
┌─────────────────┐
│   AND Gate      │
│   All True      │
├─────────────────┤
│ Input A: RSI<30 │
│ Input B: Vol>Avg│
│ Output: Boolean │
│ Status: FALSE   │
└─────────────────┘
```

### 🎯 Action Nodes

#### Buy Order
```
┌─────────────────┐
│   Buy Market    │
│   Long Entry    │
├─────────────────┤
│ Trigger: Signal │
│ Size: 2% Equity │
│ Type: Market    │
│ Status: Ready   │
└─────────────────┘
```

#### Sell Order
```
┌─────────────────┐
│   Sell Market   │
│   Long Exit     │
├─────────────────┤
│ Trigger: Signal │
│ Size: 100% Pos  │
│ Type: Market    │
│ Status: Ready   │
└─────────────────┘
```

### 🛡️ Risk Management Nodes

#### Stop Loss
```
┌─────────────────┐
│   Stop Loss     │
│   2% Risk       │
├─────────────────┤
│ Type: Percentage│
│ Value: 2%       │
│ Trail: No       │
│ Status: Active  │
└─────────────────┘
```

#### Take Profit
```
┌─────────────────┐
│  Take Profit    │
│  1.5:1 Ratio    │
├─────────────────┤
│ Type: R:R Ratio │
│ Value: 1.5      │
│ Partial: No     │
│ Status: Active  │
└─────────────────┘
```

---

## Complete Strategy Examples

### 1. Simple RSI Mean Reversion Strategy

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Market Data │───▶│ RSI (14)    │───▶│ RSI < 30    │───▶│ Buy Market  │
│ BTCUSDT 1h  │    │ Momentum    │    │ Oversold    │    │ 2% Position │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                      ┌─────────────┐    ┌─────────────┐
                                      │ RSI > 70    │───▶│ Sell Market │
                                      │ Overbought  │    │ Close All   │
                                      └─────────────┘    └─────────────┘
                                                         
                   ┌─────────────┐    ┌─────────────┐
                   │ Stop Loss   │    │Take Profit  │
                   │ 2% Risk     │    │ 1.5:1 Ratio │
                   └─────────────┘    └─────────────┘
```

**AI Command**: `"Create RSI strategy with 14 period, buy below 30, sell above 70, with 2% stop loss"`

### 2. MACD Crossover with Trend Filter

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Market Data │───▶│ MACD        │───▶│ MACD Cross  │
│ BTCUSDT 4h  │    │ (12,26,9)   │    │ Above Signal│
└─────────────┘    └─────────────┘    └─────────────┘
                   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
                   │ SMA (200)   │───▶│ Price >     │───▶│ AND Gate    │───▶│ Buy Market  │
                   │ Trend Filter│    │ SMA 200     │    │ Confirm     │    │ 3% Position │
                   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

                                      ┌─────────────┐    ┌─────────────┐
                                      │ MACD Cross  │───▶│ Sell Market │
                                      │ Below Signal│    │ Close All   │
                                      └─────────────┘    └─────────────┘
```

**AI Command**: `"MACD crossover strategy with 200 SMA trend filter"`

### 3. Multi-Indicator Confirmation Strategy

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Market Data │───▶│ RSI (14)    │───▶│ RSI < 30    │
│ BTCUSDT 1h  │    │ Momentum    │    │ Oversold    │
└─────────────┘    └─────────────┘    └─────────────┘
                   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
                   │ MACD        │───▶│ MACD > 0    │───▶│ AND Gate    │───▶│ Buy Market  │
                   │ (12,26,9)   │    │ Bullish     │    │ Triple      │    │ 2% Position │
                   └─────────────┘    └─────────────┘    │ Confirm     │    └─────────────┘
                   ┌─────────────┐    ┌─────────────┐    └─────────────┘
                   │ Volume SMA  │───▶│ Vol > Avg   │
                   │ (20)        │    │ High Volume │
                   └─────────────┘    └─────────────┘
```

**AI Command**: `"Strategy with RSI oversold, MACD bullish, and volume confirmation"`

---

## Node Connection Rules

### ✅ Valid Connections

#### Data Flow
```
Market Data → Indicator → Condition → Action
     ↓
   Volume → Volume Filter → Logic Gate
```

#### Signal Combination
```
Indicator A ──┐
              ├─→ AND Gate → Action
Indicator B ──┘
```

#### Risk Management
```
Action Node → Stop Loss
     ↓
Take Profit
```

### ❌ Invalid Connections

#### Circular Dependencies
```
❌ Indicator A → Condition → Indicator A (Creates loop)
```

#### Type Mismatches
```
❌ Boolean Output → Numeric Input (Wrong data type)
```

#### Missing Inputs
```
❌ Condition Node with no input source
```

---

## Visual Strategy Building Process

### Step 1: Start with Data
```
User: "Create RSI strategy"

AI Creates:
┌─────────────┐
│ Market Data │
│ BTCUSDT 1h  │
└─────────────┘
```

### Step 2: Add Indicators
```
AI Adds:
┌─────────────┐    ┌─────────────┐
│ Market Data │───▶│ RSI (14)    │
│ BTCUSDT 1h  │    │ Momentum    │
└─────────────┘    └─────────────┘
```

### Step 3: Add Conditions
```
AI Adds:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Market Data │───▶│ RSI (14)    │───▶│ RSI < 30    │
│ BTCUSDT 1h  │    │ Momentum    │    │ Oversold    │
└─────────────┘    └─────────────┘    └─────────────┘
                                      ┌─────────────┐
                                      │ RSI > 70    │
                                      │ Overbought  │
                                      └─────────────┘
```

### Step 4: Add Actions
```
AI Completes:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Market Data │───▶│ RSI (14)    │───▶│ RSI < 30    │───▶│ Buy Market  │
│ BTCUSDT 1h  │    │ Momentum    │    │ Oversold    │    │ 2% Position │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                      ┌─────────────┐    ┌─────────────┐
                                      │ RSI > 70    │───▶│ Sell Market │
                                      │ Overbought  │    │ Close All   │
                                      └─────────────┘    └─────────────┘
```

### Step 5: Add Risk Management (Optional)
```
User: "Add risk management"

AI Adds:
                   ┌─────────────┐    ┌─────────────┐
                   │ Stop Loss   │    │Take Profit  │
                   │ 2% Risk     │    │ 1.5:1 Ratio │
                   └─────────────┘    └─────────────┘
```

---

## Interactive Node Features

### Node Status Indicators

#### 🟢 Active Node
```
┌─────────────────┐
│ 🟢 RSI (14)     │  ← Green: Currently processing
│   Value: 45.2   │
└─────────────────┘
```

#### 🔴 Triggered Node
```
┌─────────────────┐
│ 🔴 RSI < 30     │  ← Red: Condition met
│   Status: TRUE  │
└─────────────────┘
```

#### 🟡 Waiting Node
```
┌─────────────────┐
│ 🟡 Buy Market   │  ← Yellow: Waiting for trigger
│   Status: Ready │
└─────────────────┘
```

#### ⚪ Inactive Node
```
┌─────────────────┐
│ ⚪ Take Profit  │  ← Gray: No position
│   Status: N/A   │
└─────────────────┘
```

### Node Interaction

#### Click to Configure
```
User clicks RSI node:

┌─────────────────────────────┐
│ RSI Configuration           │
├─────────────────────────────┤
│ Period: [14] ←→             │
│ Source: [Close] ▼           │
│ Oversold: [30] ←→           │
│ Overbought: [70] ←→         │
├─────────────────────────────┤
│ [Apply] [Cancel] [Reset]    │
└─────────────────────────────┘
```

#### Hover for Details
```
User hovers over MACD node:

┌─────────────────────────────┐
│ MACD (Moving Average        │
│ Convergence Divergence)     │
├─────────────────────────────┤
│ Current Values:             │
│ • MACD Line: 0.0045         │
│ • Signal Line: 0.0032       │
│ • Histogram: 0.0013         │
├─────────────────────────────┤
│ Status: Bullish crossover   │
│ Last Signal: 2 bars ago     │
└─────────────────────────────┘
```

---

## Strategy Validation Visual Feedback

### ✅ Valid Strategy
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Market Data │───▶│ RSI (14)    │───▶│ RSI < 30    │───▶│ Buy Market  │
│ ✅ Connected│    │ ✅ Valid    │    │ ✅ Logic OK │    │ ✅ Ready    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### ❌ Invalid Strategy
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Market Data │ ╱╱▶│ RSI (14)    │───▶│ RSI < 30    │ ╱╱▶│ Buy Market  │
│ ✅ Connected│    │ ❌ No Input │    │ ✅ Logic OK │    │ ❌ No Trigger│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                         
Error: Missing connection between condition and action
```

---

## Real-Time Strategy Monitoring

### Live Strategy Execution View
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Market Data │───▶│ RSI (14)    │───▶│ RSI < 30    │───▶│ Buy Market  │
│ 🟢 Live     │    │ 🟢 45.2     │    │ 🔴 FALSE    │    │ 🟡 Waiting  │
│ $42,150     │    │ Neutral     │    │ Not Oversold│    │ No Signal   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

Current Status: Monitoring - No signals
Last Signal: 2 hours ago (RSI oversold at 28.5)
Position: None
```

### Signal Alert
```
🚨 SIGNAL ALERT 🚨

┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Market Data │───▶│ RSI (14)    │───▶│ RSI < 30    │───▶│ Buy Market  │
│ 🟢 Live     │    │ 🔴 28.5     │    │ 🟢 TRUE     │    │ 🟢 EXECUTE  │
│ $41,850     │    │ OVERSOLD!   │    │ TRIGGERED!  │    │ BUYING NOW  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

Action: Executing buy order for 2% of portfolio
Entry Price: $41,850
Stop Loss: $40,813 (-2.5%)
Take Profit: $44,423 (+6.1%)
```

---

## Customization and Themes

### Node Appearance Options

#### Compact View
```
┌─────────┐    ┌─────────┐    ┌─────────┐
│ Data    │───▶│ RSI(14) │───▶│ <30     │
└─────────┘    └─────────┘    └─────────┘
```

#### Detailed View
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Market Data   │───▶│   RSI (14)      │───▶│   RSI < 30      │
│   BTCUSDT 1h    │    │   Current: 45.2 │    │   Oversold      │
│   $42,150       │    │   Status: OK    │    │   Status: FALSE │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### Color Themes

**Dark Theme**
```
┌─────────────────┐
│ 🌙 RSI (14)     │  ← Dark background, light text
│   Value: 45.2   │
└─────────────────┘
```

**Light Theme**
```
┌─────────────────┐
│ ☀️ RSI (14)     │  ← Light background, dark text
│   Value: 45.2   │
└─────────────────┘
```

**High Contrast**
```
┌─────────────────┐
│ ⚡ RSI (14)     │  ← High contrast for accessibility
│   Value: 45.2   │
└─────────────────┘
```

---

This visual guide helps you understand how PineGenie AI transforms your natural language descriptions into visual, node-based trading strategies. Each node represents a specific function, and the connections show how data flows through your strategy logic.

*For more detailed information, refer to the complete User Manual.*