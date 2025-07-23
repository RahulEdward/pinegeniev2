# Pine Script Template System

A comprehensive template system for generating Pine Script v6 trading strategies with built-in validation, parameter injection, and advanced search capabilities.

## Overview

The template system provides:
- **6 Pre-built Templates** covering major trading strategy categories
- **Advanced Parameter System** with validation and type checking
- **Comprehensive Search** with multiple filter options
- **Pine Script v6 Validation** ensuring code compatibility
- **Category Organization** for easy template discovery
- **Extensible Architecture** for adding custom templates

## Template Categories

### 📈 Trend Following
- **Simple Moving Average Crossover** (Beginner)
  - Classic dual MA crossover with risk management
  - Customizable periods and stop loss/take profit

### 🔄 Mean Reversion
- **RSI Oversold/Overbought** (Beginner)
  - RSI-based mean reversion with dynamic thresholds
  - Optional price confirmation and risk/reward ratios

### 💥 Breakout
- **Bollinger Bands Breakout** (Intermediate)
  - Advanced BB breakout with volume confirmation
  - Multiple exit strategies and volatility filtering

- **Support/Resistance Breakout** (Advanced)
  - Dynamic S/R level detection with retest entries
  - Volume confirmation and multiple exit options

### 🚀 Momentum
- **MACD Signal Strategy** (Intermediate)
  - MACD crossovers with histogram confirmation
  - Trend filtering and multiple exit strategies

### ⚡ Scalping
- **EMA Stochastic Scalping** (Advanced)
  - High-frequency scalping with tight stops
  - Time-based exits and quick signal processing

## Usage Examples

### Basic Template Usage

```typescript
import { templateManager } from './templates';

// Get all available templates
const templates = templateManager.getAllTemplates();

// Get template by ID
const smaTemplate = templateManager.getTemplate('sma-crossover');

// Generate code with default parameters
const code = templateManager.generateCode('sma-crossover', {});

// Generate code with custom parameters
const customCode = templateManager.generateCode('sma-crossover', {
  fastLength: 5,
  slowLength: 20,
  stopLossPercent: 1.5,
  takeProfitPercent: 3.0
});
```

### Advanced Search

```typescript
// Search by text query
const maTemplates = templateManager.searchTemplates({
  query: 'moving average'
});

// Filter by category and difficulty
const beginnerTrend = templateManager.searchTemplates({
  category: 'trend-following',
  difficulty: 'beginner'
});

// Multi-criteria search
const forexScalping = templateManager.searchTemplates({
  category: 'scalping',
  markets: ['forex'],
  timeframes: ['1m', '5m']
});
```

### Template Validation

```typescript
// Validate template with default parameters
const validation = templateManager.validateTemplate('rsi-oversold-overbought');
console.log(validation.isValid); // true/false
console.log(validation.errors);  // Array of error messages

// Validate with custom parameters
const customValidation = templateManager.validateTemplate('macd-signal', {
  fastLength: 12,
  slowLength: 26,
  signalLength: 9
});
```

### Category Management

```typescript
// Get all categories
const categories = templateManager.getAllCategories();

// Get templates by category
const breakoutTemplates = templateManager.getTemplatesByCategory('breakout');

// Get category information
const trendCategory = templateManager.getCategory('trend-following');
```

## Template Structure

Each template includes:

```typescript
interface StrategyTemplate {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  description: string;           // Detailed description
  category: string;              // Strategy category
  difficulty: string;            // beginner/intermediate/advanced
  timeframes: string[];          // Recommended timeframes
  markets: string[];             // Suitable markets
  tags: string[];               // Search tags
  version: string;               // Template version
  author: string;                // Template author
  created: Date;                 // Creation date
  updated: Date;                 // Last update
  parameters: StrategyParameter[]; // Configurable parameters
  template: string;              // Pine Script template with placeholders
}
```

## Parameter System

Parameters support multiple types with validation:

```typescript
interface StrategyParameter {
  name: string;           // Parameter name
  type: 'int' | 'float' | 'bool' | 'string' | 'source' | 'color';
  defaultValue: any;      // Default value
  min?: number;          // Minimum value (for numbers)
  max?: number;          // Maximum value (for numbers)
  step?: number;         // Step size (for numbers)
  description: string;   // Parameter description
  group?: string;        // Parameter group for UI
  tooltip?: string;      // Help text
  options?: string[];    // Valid options (for dropdowns)
}
```

### Parameter Types

- **int**: Integer values with range validation
- **float**: Decimal values with range validation
- **bool**: Boolean true/false values
- **string**: Text values with optional validation
- **source**: Pine Script price sources (open, high, low, close, etc.)
- **color**: Pine Script color values

## Template Placeholders

Templates use `{{parameterName}}` placeholders that are replaced during code generation:

```pinescript
// Template example
fastLength = input.int({{fastLength}}, title="Fast MA Length", minval={{min}}, maxval={{max}})
slowLength = input.int({{slowLength}}, title="Slow MA Length")
useStopLoss = input.bool({{useStopLoss}}, title="Use Stop Loss")
```

## Validation System

The template system includes comprehensive validation:

### Template Structure Validation
- Required fields presence
- Pine Script v6 version declaration
- Parameter structure validation

### Parameter Validation
- Type checking (int, float, bool, string)
- Range validation (min/max values)
- Options validation (dropdown selections)

### Pine Script Validation
- Syntax checking using built-in validator
- Version compatibility verification
- Common error detection

## Adding Custom Templates

```typescript
// Create custom template
const customTemplate: StrategyTemplate = {
  id: 'my-custom-strategy',
  name: 'My Custom Strategy',
  description: 'A custom trading strategy',
  category: 'custom',
  difficulty: 'intermediate',
  timeframes: ['1h', '4h'],
  markets: ['stocks'],
  tags: ['custom', 'experimental'],
  version: '1.0',
  author: 'Your Name',
  created: new Date(),
  updated: new Date(),
  parameters: [
    {
      name: 'period',
      type: 'int',
      defaultValue: 20,
      min: 5,
      max: 100,
      description: 'Calculation period'
    }
  ],
  template: `
//@version=6
strategy("My Strategy", overlay=true)
period = input.int({{period}}, title="Period", minval=5, maxval=100)
// Your strategy logic here
`
};

// Add to template manager
templateManager.addCustomTemplate(customTemplate);
```

## Template Statistics

Get insights about your template collection:

```typescript
const stats = templateManager.getTemplateStats();
console.log(stats);
// {
//   totalTemplates: 6,
//   categoryCounts: { 'trend-following': 1, 'mean-reversion': 1, ... },
//   difficultyCounts: { 'beginner': 2, 'intermediate': 2, 'advanced': 2 },
//   averageParameters: 5.5
// }
```

## Error Handling

The template system provides detailed error messages:

```typescript
try {
  const code = templateManager.generateCode('template-id', parameters);
} catch (error) {
  // Possible errors:
  // - Template not found
  // - Parameter validation failed
  // - Parameter type mismatch
  // - Parameter out of range
  // - Invalid parameter options
}
```

## Best Practices

### Template Design
1. Always include Pine Script v6 version declaration
2. Use descriptive parameter names and tooltips
3. Set appropriate min/max ranges for parameters
4. Include comprehensive risk management
5. Add clear comments and documentation

### Parameter Configuration
1. Provide sensible default values
2. Use appropriate parameter types
3. Group related parameters together
4. Include helpful tooltips and descriptions
5. Validate parameter ranges and options

### Code Generation
1. Always validate parameters before generation
2. Handle errors gracefully
3. Test generated code with various parameter combinations
4. Ensure Pine Script v6 compatibility

## Testing

Run the validation script to test the template system:

```bash
npx tsx src/agents/pinegenie-agent/core/pine-generator/validate-templates.ts
```

This will test:
- Template loading and structure
- Code generation with default parameters
- Search functionality
- Parameter validation
- Template statistics

## Future Enhancements

Planned improvements:
- Template versioning and migration
- Template marketplace integration
- Advanced parameter types (arrays, objects)
- Template performance analytics
- Visual template builder
- Template sharing and collaboration
- Automated backtesting integration