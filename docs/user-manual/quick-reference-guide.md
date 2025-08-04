# PineGenie AI - Quick Reference Guide

## Common Strategy Patterns

### 🎯 Mean Reversion Strategies

#### RSI Oversold/Overbought
```
"Create RSI strategy, buy when RSI below 30, sell when above 70"
```
**Generates**: Data → RSI → Conditions → Buy/Sell Actions

#### Bollinger Bands Mean Reversion
```
"Bollinger Bands mean reversion, buy at lower band, sell at upper band"
```
**Generates**: Data → BB → Price Comparison → Actions

#### Stochastic Mean Reversion
```
"Stochastic strategy, buy when %K below 20, sell when above 80"
```
**Generates**: Data → Stochastic → Threshold Conditions → Actions

---

### 📈 Trend Following Strategies

#### MACD Crossover
```
"MACD crossover strategy with standard settings"
```
**Generates**: Data → MACD → Crossover Detection → Actions

#### Moving Average Crossover
```
"EMA crossover with 20 and 50 periods"
```
**Generates**: Data → EMA(20) + EMA(50) → Crossover → Actions

#### Parabolic SAR Trend
```
"Parabolic SAR trend following strategy"
```
**Generates**: Data → PSAR → Price vs PSAR → Actions

---

### 💥 Breakout Strategies

#### Bollinger Bands Breakout
```
"Bollinger Bands breakout with volume confirmation"
```
**Generates**: Data → BB + Volume → Breakout + Volume Filter → Actions

#### Support/Resistance Breakout
```
"Price breakout above 20-period high with volume"
```
**Generates**: Data → Highest/Lowest + Volume → Breakout Conditions → Actions

---

### 🔄 Multi-Indicator Strategies

#### RSI + MACD Confirmation
```
"RSI oversold AND MACD bullish crossover for buy signals"
```
**Generates**: Data → RSI + MACD → AND Logic → Actions

#### Triple Confirmation
```
"Buy when RSI oversold, MACD bullish, and price above 200 SMA"
```
**Generates**: Data → RSI + MACD + SMA → Triple AND Logic → Actions

---

## Quick Commands

### Strategy Building
- `"Create [indicator] strategy"` - Basic strategy
- `"Build [indicator] with [parameters]"` - Custom parameters
- `"Make [strategy type] using [indicators]"` - Multi-indicator

### Risk Management
- `"Add 2% stop loss"` - Fixed stop loss
- `"Include take profit at 1.5:1 ratio"` - Risk-reward ratio
- `"Add position sizing based on volatility"` - Dynamic sizing

### Optimization
- `"Optimize parameters"` - AI parameter tuning
- `"Add filters to reduce false signals"` - Signal filtering
- `"Make strategy more conservative"` - Risk reduction

### Modifications
- `"Change RSI period to 21"` - Parameter adjustment
- `"Add volume confirmation"` - Additional filter
- `"Remove stop loss"` - Component removal

---

## Parameter Quick Reference

### RSI Parameters
- **Period**: 14 (standard), 21 (less sensitive), 9 (more sensitive)
- **Oversold**: 30 (standard), 25 (more signals), 20 (fewer signals)
- **Overbought**: 70 (standard), 75 (fewer signals), 80 (less signals)

### MACD Parameters
- **Fast EMA**: 12 (standard)
- **Slow EMA**: 26 (standard)
- **Signal**: 9 (standard)

### Bollinger Bands Parameters
- **Period**: 20 (standard)
- **Standard Deviations**: 2.0 (standard), 1.5 (tighter), 2.5 (wider)

### Moving Averages
- **Short-term**: 10, 20, 50
- **Medium-term**: 100, 200
- **Long-term**: 200, 500

---

## Risk Management Templates

### Conservative (Low Risk)
```
"Add conservative risk management: 1% stop loss, 2:1 reward ratio, max 2% portfolio risk"
```

### Moderate (Medium Risk)
```
"Add moderate risk management: 2% stop loss, 1.5:1 reward ratio, max 5% portfolio risk"
```

### Aggressive (High Risk)
```
"Add aggressive risk management: 3% stop loss, 1:1 reward ratio, max 10% portfolio risk"
```

---

## Timeframe Recommendations

### Scalping (1m - 5m)
- Use fast indicators (RSI 9, EMA 5/10)
- Tight stops (0.5-1%)
- High frequency signals

### Day Trading (15m - 1h)
- Standard indicators (RSI 14, EMA 20/50)
- Moderate stops (1-2%)
- Balanced signal frequency

### Swing Trading (4h - 1d)
- Slower indicators (RSI 21, EMA 50/200)
- Wider stops (2-5%)
- Lower frequency, higher quality signals

---

## Common Fixes

### "Too many false signals"
```
"Add trend filter using 200 SMA"
"Include volume confirmation"
"Increase RSI thresholds to 25/75"
```

### "Not enough signals"
```
"Reduce RSI thresholds to 35/65"
"Use shorter moving averages"
"Remove restrictive filters"
```

### "Strategy too risky"
```
"Add 2% stop loss"
"Reduce position size to 1%"
"Add maximum drawdown limit"
```

### "Signals too late"
```
"Use faster indicators (shorter periods)"
"Add momentum confirmation"
"Use limit orders instead of market"
```

---

## Example Conversations

### Building a Complete Strategy
```
You: "Create RSI strategy"
AI: "Basic RSI strategy created. Add risk management?"
You: "Yes, add 2% stop loss and take profit"
AI: "Added risk management. Add trend filter?"
You: "Add 200 SMA trend filter"
AI: "Perfect! Strategy complete with trend filtering."
```

### Optimizing Performance
```
You: "This strategy has too many false signals"
AI: "I'll add volume confirmation and trend filtering"
You: "Still getting whipsaws"
AI: "Let me increase the RSI thresholds to 25/75 for better signals"
```

---

## Troubleshooting Quick Fixes

| Problem | Quick Fix Command |
|---------|------------------|
| No signals | `"Make strategy more sensitive"` |
| Too many signals | `"Add filters to reduce noise"` |
| Poor win rate | `"Add confirmation indicators"` |
| Large losses | `"Add stop loss protection"` |
| Late entries | `"Use faster indicators"` |
| Overtrading | `"Add time filters"` |

---

## Pro Tips

1. **Start Simple**: Begin with single indicator, add complexity gradually
2. **Always Test**: Use `"show backtest results"` before live trading
3. **Risk First**: Add risk management before optimizing entries
4. **Context Matters**: Consider market conditions and timeframes
5. **Iterate**: Use AI suggestions to continuously improve

---

*This quick reference covers the most common patterns. For detailed explanations, see the full User Manual.*