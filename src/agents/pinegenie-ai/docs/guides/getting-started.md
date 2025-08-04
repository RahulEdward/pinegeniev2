# Getting Started with PineGenie AI System

This guide will help you get up and running with the PineGenie AI System quickly. Follow these steps to integrate AI-powered strategy building into your application.

## 🚀 **Quick Start**

### 1. Basic Setup

```typescript
import { PineGenieAI } from '@/agents/pinegenie-ai';

// Initialize the AI system
const ai = new PineGenieAI({
  enableAnimations: true,
  enableEducationalMode: true,
  performanceMode: 'optimized'
});

// Process user input and build strategy
const result = await ai.processUserInput(
  "Create an RSI strategy that buys when RSI is below 30"
);

console.log('Generated strategy:', result.strategy);
```

### 2. Integration with Existing Builder

```typescript
import { AIStrategyBuilder } from '@/agents/pinegenie-ai/builder';
import { useBuilderStore } from '@/app/builder/store/builder-state';

const aiBuilder = new AIStrategyBuilder();
const builderStore = useBuilderStore.getState();

// Build strategy and integrate with existing builder
const buildResult = await aiBuilder.buildStrategy(blueprint);

// Add nodes to existing builder
buildResult.nodes.forEach(node => {
  builderStore.addNode(node);
});

// Add connections to existing builder
buildResult.edges.forEach(edge => {
  builderStore.addEdge(edge);
});
```

### 3. Add Chat Interface

```typescript
import { ChatInterface } from '@/agents/pinegenie-ai/chat';

const MyTradingAssistant = () => {
  const handleStrategyGenerated = (strategy) => {
    console.log('New strategy generated:', strategy);
    // Integrate with your builder
  };

  return (
    <ChatInterface
      onStrategyGenerated={handleStrategyGenerated}
      enableAnimations={true}
      maxMessages={50}
    />
  );
};
```

## 📖 **Core Concepts**

### Strategy Blueprint
A blueprint is the AI's plan for building a strategy:

```typescript
interface StrategyBlueprint {
  id: string;
  name: string;
  components: StrategyComponent[];
  flow: ComponentFlow[];
  parameters: BlueprintParameters;
  riskProfile: RiskProfile;
}
```

### AI Builder Integration
The AI system integrates safely with existing builder:

- ✅ Uses existing APIs only
- ✅ No modifications to core builder files
- ✅ Preserves all existing functionality
- ✅ Adds AI capabilities as enhancement layer

## 🎯 **Common Use Cases**

### 1. Natural Language Strategy Creation

```typescript
const examples = [
  "Create a simple RSI strategy",
  "Build a MACD crossover with stop loss",
  "Make a Bollinger Bands breakout strategy",
  "I want a scalping strategy for crypto"
];

for (const request of examples) {
  const result = await ai.processUserInput(request);
  console.log(`${request} -> ${result.strategy.name}`);
}
```

### 2. Educational Mode

```typescript
// Enable step-by-step learning
const ai = new PineGenieAI({
  enableEducationalMode: true,
  enableAnimations: true
});

const result = await ai.buildWithAnimation(blueprint);

// Control animation playback
await result.controls.play();
await result.controls.pause();
result.controls.setSpeed(0.5); // Slow motion
```

### 3. Strategy Optimization

```typescript
import { StrategyAnalyzer, ParameterOptimizer } from '@/agents/pinegenie-ai/optimization';

const analyzer = new StrategyAnalyzer();
const optimizer = new ParameterOptimizer();

// Analyze existing strategy
const analysis = await analyzer.analyzeStrategy(strategy);
console.log(`Strategy score: ${analysis.overallScore}/100`);

// Optimize parameters
const optimized = await optimizer.optimizeParameters(strategy, {
  name: 'Maximize Sharpe Ratio',
  type: 'maximize',
  evaluator: calculateSharpeRatio
});

console.log('Optimized parameters:', optimized.optimizedParameters);
```

## ⚙️ **Configuration**

### Environment Variables

```bash
# AI System Configuration
PINEGENIE_AI_ENABLED=true
PINEGENIE_AI_PERFORMANCE_MODE=optimized
PINEGENIE_AI_ANIMATIONS_ENABLED=true

# NLP Configuration
PINEGENIE_NLP_CONFIDENCE_THRESHOLD=0.7
PINEGENIE_NLP_MAX_TOKENS=1000

# Performance Configuration
PINEGENIE_CACHE_TTL=3600
PINEGENIE_MAX_CONCURRENT_REQUESTS=10
```

### TypeScript Configuration

```typescript
const config: PineGenieAIConfig = {
  enableAnimations: true,
  enableEducationalMode: true,
  performanceMode: 'optimized',
  nlpConfidenceThreshold: 0.7,
  maxConcurrentRequests: 10,
  cacheConfig: {
    ttl: 3600,
    maxSize: 1000
  }
};

const ai = new PineGenieAI(config);
```

## 🔧 **Next Steps**

1. **Explore the APIs**: Check out the detailed API documentation for each module
2. **Try Examples**: Run the code examples in the `examples/` directory
3. **Customize**: Adapt the system to your specific needs
4. **Extend**: Add custom patterns, templates, or optimization algorithms

## 📚 **Additional Resources**

- [API Documentation](../api/README.md)
- [Code Examples](../examples/)
- [Best Practices](./best-practices.md)
- [Debugging Guide](./debugging.md)