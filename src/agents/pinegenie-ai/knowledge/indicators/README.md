# Indicator Knowledge System

## Overview

The Indicator Knowledge System is a comprehensive database and analysis engine for technical indicators used in trading strategies. It provides intelligent suggestions, compatibility analysis, parameter optimization, and suitability assessment for indicators based on strategy types, market conditions, and user experience levels.

## Architecture

### Core Components

1. **TechnicalIndicatorDatabase** - Main database of technical indicators with advanced analysis capabilities
2. **OscillatorDatabase** - Specialized database for oscillator indicators
3. **UnifiedIndicatorSystem** - Combines both databases into a single interface

### Key Features

- **Indicator Suggestions**: Get personalized indicator recommendations based on strategy type and context
- **Compatibility Analysis**: Analyze how indicators work together and identify conflicts
- **Parameter Optimization**: Get optimized parameter values for different market conditions
- **Suitability Assessment**: Evaluate how well an indicator fits specific trading contexts

## Usage Examples

### Basic Indicator Lookup

```typescript
import { indicatorSystem } from './indicators';

// Get a specific indicator
const rsi = indicatorSystem.getIndicator('rsi');
console.log(rsi?.name); // "Relative Strength Index"

// Get all indicators
const allIndicators = indicatorSystem.getAllIndicators();
console.log(`Total indicators: ${allIndicators.length}`);
```

### Strategy-Based Suggestions

```typescript
import { TechnicalIndicatorDatabase } from './indicators';

const technicalDb = new TechnicalIndicatorDatabase();

// Get suggestions for a trend-following strategy
const suggestions = technicalDb.getIndicatorSuggestions(
  'trend-following',
  [], // no existing indicators
  'beginner', // user level
  'trending', // market condition
  '1h' // timeframe
);

suggestions.forEach(suggestion => {
  console.log(`${suggestion.indicator.name}: ${suggestion.reason}`);
  console.log(`Confidence: ${(suggestion.confidence * 100).toFixed(0)}%`);
  console.log(`Priority: ${suggestion.priority}`);
});
```

### Compatibility Analysis

```typescript
// Analyze compatibility between RSI and Bollinger Bands
const compatibility = technicalDb.getCompatibilityAnalysis(['rsi', 'bollinger_bands']);

console.log('Compatible combinations:');
compatibility.compatible.forEach(combo => {
  console.log(`${combo.indicators.join(' + ')}: ${combo.synergy}`);
  console.log(`Effectiveness: ${(combo.effectiveness * 100).toFixed(0)}%`);
});

console.log('Additional suggestions:');
compatibility.suggestions.forEach(suggestion => {
  console.log(`${suggestion.indicator.name}: ${suggestion.reason}`);
});
```

### Parameter Optimization

```typescript
// Get optimized parameters for RSI in a scalping strategy
const optimizations = technicalDb.getParameterOptimizations(
  'rsi',
  'scalping',
  'volatile',
  '5m',
  { period: 14, source: 'close' }
);

optimizations.forEach(opt => {
  console.log(`Parameter: ${opt.parameterName}`);
  console.log(`Current: ${opt.currentValue} → Optimized: ${opt.optimizedValue}`);
  console.log(`Reason: ${opt.reason}`);
  console.log(`Impact: ${opt.impact}`);
});
```

### Suitability Analysis

```typescript
// Analyze how suitable RSI is for a specific context
const analysis = technicalDb.analyzeIndicatorSuitability('rsi', {
  strategyType: 'mean-reversion',
  marketCondition: 'ranging',
  timeframe: '1h',
  userLevel: 'beginner',
  existingIndicators: ['bollinger_bands']
});

console.log(`Suitability Score: ${(analysis.suitability * 100).toFixed(0)}%`);
console.log('Strengths:', analysis.strengths);
console.log('Weaknesses:', analysis.weaknesses);
console.log('Recommendations:', analysis.recommendations);
```

## Available Indicators

### Technical Indicators

| Indicator | Category | Difficulty | Popularity | Best For |
|-----------|----------|------------|------------|----------|
| RSI | Oscillator | Beginner | 9/10 | Mean reversion, overbought/oversold |
| SMA | Trend | Beginner | 10/10 | Trend identification, support/resistance |
| EMA | Trend | Beginner | 9/10 | Trend following, dynamic support/resistance |
| MACD | Momentum | Intermediate | 8/10 | Trend changes, momentum analysis |
| Bollinger Bands | Volatility | Intermediate | 8/10 | Volatility analysis, mean reversion |
| Stochastic | Oscillator | Intermediate | 7/10 | Momentum, short-term timing |
| ATR | Volatility | Intermediate | 6/10 | Risk management, position sizing |

### Oscillator Indicators

| Indicator | Category | Difficulty | Popularity | Best For |
|-----------|----------|------------|------------|----------|
| Williams %R | Oscillator | Intermediate | 6/10 | Short-term reversals, overbought/oversold |
| CCI | Oscillator | Advanced | 5/10 | Cyclical trends, extreme conditions |
| ROC | Momentum | Beginner | 6/10 | Momentum analysis, trend strength |

## Strategy Type Mappings

### Trend Following
- **Primary**: EMA, SMA, MACD, ROC
- **Best Combinations**: EMA + MACD, SMA + ROC
- **Market Conditions**: Trending, momentum

### Mean Reversion
- **Primary**: RSI, Bollinger Bands, Stochastic, Williams %R
- **Best Combinations**: RSI + Bollinger Bands, Stochastic + SMA
- **Market Conditions**: Ranging, sideways, volatile

### Breakout
- **Primary**: Bollinger Bands, ATR, EMA, CCI
- **Best Combinations**: Bollinger Bands + ATR, EMA + CCI
- **Market Conditions**: Volatile, trending

### Momentum
- **Primary**: MACD, RSI, Stochastic, ROC
- **Best Combinations**: MACD + RSI, ROC + Stochastic
- **Market Conditions**: Trending, momentum

### Scalping
- **Primary**: Stochastic, Williams %R, EMA, ATR
- **Best Combinations**: Stochastic + EMA, Williams %R + ATR
- **Market Conditions**: Volatile, high-frequency

## Compatibility Rules

### High Synergy Combinations

1. **RSI + Bollinger Bands** (85% effectiveness)
   - RSI provides momentum confirmation while BB shows volatility extremes
   - Best for mean reversion in ranging markets

2. **MACD + EMA** (80% effectiveness)
   - MACD provides momentum signals while EMA confirms trend direction
   - Best for trend following with momentum confirmation

3. **ATR + Any Indicator** (90% effectiveness)
   - ATR enhances any strategy by providing volatility-based risk management
   - Universal compatibility for risk management

### Incompatible Combinations

1. **RSI + MACD**
   - Both provide momentum signals but can conflict in ranging markets
   - RSI better for mean reversion, MACD better for trend following

2. **Multiple Oscillators**
   - Using too many oscillators (RSI + Stochastic + Williams %R) creates noise
   - Stick to one primary oscillator with trend confirmation

## Parameter Optimization Guidelines

### Strategy-Based Optimizations

- **Scalping**: Shorter periods (0.7x default) for faster signals
- **Trend Following**: Longer periods (1.3x default) for smoother trends
- **Mean Reversion**: Standard periods with tighter thresholds

### Market Condition Optimizations

- **Volatile Markets**: Wider bands/thresholds (1.2x default)
- **Ranging Markets**: Shorter periods (0.8x default) for responsiveness
- **Trending Markets**: Longer periods for trend confirmation

### Timeframe Optimizations

| Timeframe | Period Multiplier | Rationale |
|-----------|------------------|-----------|
| 1m | 0.5x | Very short-term, need fast signals |
| 5m | 0.7x | Short-term trading |
| 15m | 0.9x | Intraday trading |
| 1h | 1.0x | Standard reference |
| 4h | 1.2x | Swing trading |
| 1d | 1.5x | Position trading |

## Performance Considerations

### Caching Strategy
- Indicator definitions are cached in memory
- Compatibility rules are pre-computed
- Search results use intelligent caching

### Query Optimization
- Use specific filters to reduce search space
- Batch multiple queries when possible
- Leverage the unified system for cross-database searches

### Memory Usage
- Indicators are loaded once at initialization
- Compatibility rules are computed on-demand
- Statistics are cached and updated incrementally

## Extension Points

### Adding New Indicators

1. Add indicator definition to `TECHNICAL_INDICATORS` or `OSCILLATOR_INDICATORS`
2. Update compatibility rules if needed
3. Add strategy type mappings
4. Update tests and documentation

### Custom Compatibility Rules

```typescript
const customRule: IndicatorCompatibilityRule = {
  id: 'custom_rule',
  primaryIndicator: 'my_indicator',
  compatibleIndicators: ['rsi', 'ema'],
  incompatibleIndicators: ['macd'],
  synergy: 'Custom synergy explanation',
  effectiveness: 0.75,
  difficulty: 'intermediate',
  bestUseCase: 'Custom use case'
};
```

### Custom Parameter Optimizations

Override the `calculateParameterOptimization` method to add custom optimization logic for specific indicators or market conditions.

## API Reference

### TechnicalIndicatorDatabase

#### Methods

- `getIndicatorSuggestions(strategyType, existingIndicators, userLevel, marketCondition?, timeframe?)` - Get personalized suggestions
- `getCompatibilityAnalysis(indicatorIds)` - Analyze indicator compatibility
- `getParameterOptimizations(indicatorId, strategyType, marketCondition?, timeframe?, currentParameters?)` - Get optimized parameters
- `analyzeIndicatorSuitability(indicatorId, context)` - Comprehensive suitability analysis
- `getIndicator(id)` - Get specific indicator
- `getAllIndicators()` - Get all indicators
- `searchIndicators(keywords)` - Search by keywords
- `getIndicatorsByCategory(category)` - Filter by category
- `getIndicatorsByDifficulty(difficulty)` - Filter by difficulty
- `getCompatibleIndicators(indicatorId)` - Get compatible indicators

### UnifiedIndicatorSystem

#### Methods

- `getIndicator(id)` - Get any indicator by ID
- `getAllIndicators()` - Get all indicators from both databases
- `searchAllIndicators(keywords)` - Search across all indicators
- `getIndicatorsByCategory(category)` - Get indicators by category
- `getTechnicalDatabase()` - Access technical database
- `getOscillatorDatabase()` - Access oscillator database
- `getComprehensiveStatistics()` - Get system-wide statistics

## Testing

The system includes comprehensive tests covering:

- Basic functionality for all databases
- Integration between systems
- Performance benchmarks
- Edge case handling
- Strategy-specific behavior

Run tests with:
```bash
npm test -- src/agents/pinegenie-ai/knowledge/indicators/__tests__/indicator-knowledge-system.test.ts
```

## Future Enhancements

1. **Machine Learning Integration**: Use ML to improve parameter optimization
2. **Historical Performance**: Track indicator performance across different market conditions
3. **User Feedback Loop**: Learn from user preferences and outcomes
4. **Advanced Divergence Detection**: Implement sophisticated divergence analysis
5. **Multi-Timeframe Analysis**: Analyze indicators across multiple timeframes
6. **Custom Indicator Builder**: Allow users to create custom indicators
7. **Backtesting Integration**: Integrate with backtesting systems for validation