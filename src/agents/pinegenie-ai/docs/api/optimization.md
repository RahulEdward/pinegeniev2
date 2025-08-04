# Strategy Optimization API

The Strategy Optimization module provides intelligent analysis, parameter optimization, and real-time feedback for trading strategies. It helps users improve their strategies through AI-powered suggestions and performance analysis.

## 📋 **Table of Contents**

- [Core Classes](#core-classes)
- [Interfaces](#interfaces)
- [Methods](#methods)
- [Usage Examples](#usage-examples)
- [Optimization Algorithms](#optimization-algorithms)
- [Performance Metrics](#performance-metrics)

## 🏗 **Core Classes**

### `StrategyAnalyzer`

Main class for analyzing existing strategies and identifying improvement opportunities.

```typescript
class StrategyAnalyzer {
  constructor(config?: AnalyzerConfig);
  
  // Strategy analysis
  async analyzeStrategy(strategy: Strategy): Promise<AnalysisResult>;
  async compareStrategies(strategies: Strategy[]): Promise<ComparisonResult>;
  async identifyWeaknesses(strategy: Strategy): Promise<WeaknessReport>;
  
  // Gap analysis
  async detectMissingComponents(strategy: Strategy): Promise<ComponentSuggestion[]>;
  async validateStrategyCompleteness(strategy: Strategy): Promise<CompletenessReport>;
  
  // Performance analysis
  async analyzePerformance(strategy: Strategy, marketData: MarketData[]): Promise<PerformanceReport>;
  async calculateRiskMetrics(strategy: Strategy): Promise<RiskMetrics>;
  
  // Improvement suggestions
  async suggestImprovements(strategy: Strategy): Promise<ImprovementSuggestion[]>;
  async generateOptimizationPlan(strategy: Strategy): Promise<OptimizationPlan>;
}
```

### `ParameterOptimizer`

Optimizes strategy parameters using various algorithms and market conditions.

```typescript
class ParameterOptimizer {
  constructor(config?: OptimizerConfig);
  
  // Parameter optimization
  async optimizeParameters(strategy: Strategy, objective: OptimizationObjective): Promise<OptimizationResult>;
  async optimizeForMarketConditions(strategy: Strategy, conditions: MarketCondition[]): Promise<OptimizationResult>;
  
  // Multi-objective optimization
  async multiObjectiveOptimization(strategy: Strategy, objectives: OptimizationObjective[]): Promise<ParetoFront>;
  
  // Sensitivity analysis
  async performSensitivityAnalysis(strategy: Strategy, parameters: string[]): Promise<SensitivityReport>;
  async identifyRobustParameters(strategy: Strategy): Promise<RobustnessReport>;
  
  // Backtesting integration
  async optimizeWithBacktesting(strategy: Strategy, historicalData: MarketData[]): Promise<BacktestOptimizationResult>;
  
  // Real-time optimization
  startRealTimeOptimization(strategy: Strategy, callback: OptimizationCallback): void;
  stopRealTimeOptimization(strategyId: string): void;
}
```

### `FeedbackSystem`

Provides real-time feedback and suggestions as users build strategies.

```typescript
class FeedbackSystem {
  constructor(config?: FeedbackConfig);
  
  // Real-time feedback
  async provideFeedback(strategy: Strategy, context: BuildingContext): Promise<Feedback>;
  async validateChanges(oldStrategy: Strategy, newStrategy: Strategy): Promise<ValidationFeedback>;
  
  // Contextual suggestions
  async suggestNextComponent(strategy: Strategy): Promise<ComponentSuggestion[]>;
  async suggestParameterValues(component: StrategyComponent): Promise<ParameterSuggestion[]>;
  
  // Best practices
  async checkBestPractices(strategy: Strategy): Promise<BestPracticeReport>;
  async suggestRiskManagement(strategy: Strategy): Promise<RiskManagementSuggestion[]>;
  
  // Learning integration
  async adaptToUserBehavior(userId: string, interactions: UserInteraction[]): Promise<void>;
  async personalizeRecommendations(userId: string, strategy: Strategy): Promise<PersonalizedFeedback>;
}
```

### `ImprovementSuggester`

Generates specific improvement suggestions based on strategy analysis.

```typescript
class ImprovementSuggester {
  constructor(knowledgeBase?: TradingKnowledgeBase);
  
  // Improvement generation
  async generateImprovements(analysis: AnalysisResult): Promise<ImprovementSuggestion[]>;
  async prioritizeImprovements(suggestions: ImprovementSuggestion[]): Promise<PrioritizedSuggestion[]>;
  
  // Category-specific improvements
  async suggestIndicatorImprovements(strategy: Strategy): Promise<IndicatorSuggestion[]>;
  async suggestRiskImprovements(strategy: Strategy): Promise<RiskSuggestion[]>;
  async suggestEntryExitImprovements(strategy: Strategy): Promise<EntryExitSuggestion[]>;
  
  // Market-specific improvements
  async suggestForMarketType(strategy: Strategy, marketType: MarketType): Promise<MarketSpecificSuggestion[]>;
  async suggestForTimeframe(strategy: Strategy, timeframe: string): Promise<TimeframeSuggestion[]>;
  
  // Implementation assistance
  async generateImplementationSteps(suggestion: ImprovementSuggestion): Promise<ImplementationStep[]>;
  async estimateImpact(suggestion: ImprovementSuggestion, strategy: Strategy): Promise<ImpactEstimate>;
}
```

## 🔧 **Interfaces**

### Core Types

```typescript
interface AnalysisResult {
  strategyId: string;
  overallScore: number;
  strengths: StrengthPoint[];
  weaknesses: WeaknessPoint[];
  opportunities: OpportunityPoint[];
  threats: ThreatPoint[];
  recommendations: Recommendation[];
  metrics: AnalysisMetrics;
  timestamp: Date;
}

interface OptimizationResult {
  originalParameters: ParameterSet;
  optimizedParameters: ParameterSet;
  improvement: ImprovementMetrics;
  confidence: number;
  iterations: number;
  convergenceData: ConvergencePoint[];
  validationResults: ValidationResult[];
}

interface Feedback {
  type: FeedbackType;
  severity: FeedbackSeverity;
  message: string;
  suggestions: string[];
  affectedComponents: string[];
  actionRequired: boolean;
  learnMoreUrl?: string;
  examples?: FeedbackExample[];
}

interface ImprovementSuggestion {
  id: string;
  type: ImprovementType;
  title: string;
  description: string;
  rationale: string;
  priority: Priority;
  difficulty: Difficulty;
  estimatedImpact: ImpactEstimate;
  implementation: ImplementationGuide;
  prerequisites: string[];
  alternatives: AlternativeSuggestion[];
}
```

### Configuration Types

```typescript
interface AnalyzerConfig {
  enableDeepAnalysis: boolean;
  includeMarketAnalysis: boolean;
  riskTolerance: RiskTolerance;
  analysisDepth: AnalysisDepth;
  customMetrics: CustomMetric[];
  benchmarkStrategies: Strategy[];
}

interface OptimizerConfig {
  algorithm: OptimizationAlgorithm;
  maxIterations: number;
  convergenceThreshold: number;
  populationSize: number;
  mutationRate: number;
  crossoverRate: number;
  elitismRate: number;
  constraints: OptimizationConstraint[];
}

interface FeedbackConfig {
  enableRealTime: boolean;
  feedbackFrequency: number;
  severityThreshold: FeedbackSeverity;
  includeExamples: boolean;
  personalizeToUser: boolean;
  learningEnabled: boolean;
}
```

### Metrics Types

```typescript
interface PerformanceMetrics {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  totalTrades: number;
}

interface RiskMetrics {
  valueAtRisk: number;
  conditionalVaR: number;
  beta: number;
  alpha: number;
  informationRatio: number;
  trackingError: number;
  downside_deviation: number;
  calmarRatio: number;
}

interface OptimizationObjective {
  name: string;
  type: ObjectiveType;
  weight: number;
  target?: number;
  constraint?: ObjectiveConstraint;
  evaluator: (strategy: Strategy, data: MarketData[]) => number;
}
```

## 📖 **Methods**

### `analyzeStrategy(strategy: Strategy): Promise<AnalysisResult>`

Performs comprehensive analysis of a trading strategy.

**Parameters:**
- `strategy` (Strategy): Strategy to analyze

**Returns:**
- `Promise<AnalysisResult>`: Detailed analysis results

**Example:**
```typescript
const analyzer = new StrategyAnalyzer({
  enableDeepAnalysis: true,
  includeMarketAnalysis: true,
  analysisDepth: AnalysisDepth.COMPREHENSIVE
});

const strategy = await loadStrategy('rsi-mean-reversion');
const analysis = await analyzer.analyzeStrategy(strategy);

console.log(`Overall Score: ${analysis.overallScore}/100`);
console.log(`Strengths: ${analysis.strengths.length}`);
console.log(`Weaknesses: ${analysis.weaknesses.length}`);

// Review specific findings
analysis.weaknesses.forEach(weakness => {
  console.log(`⚠️ ${weakness.category}: ${weakness.description}`);
  console.log(`Impact: ${weakness.impact}`);
  console.log(`Suggestions: ${weakness.suggestions.join(', ')}`);
});

analysis.recommendations.forEach(rec => {
  console.log(`💡 ${rec.title}: ${rec.description}`);
  console.log(`Priority: ${rec.priority}`);
});
```

### `optimizeParameters(strategy: Strategy, objective: OptimizationObjective): Promise<OptimizationResult>`

Optimizes strategy parameters for a specific objective.

**Parameters:**
- `strategy` (Strategy): Strategy to optimize
- `objective` (OptimizationObjective): Optimization objective

**Returns:**
- `Promise<OptimizationResult>`: Optimization results with improved parameters

**Example:**
```typescript
const optimizer = new ParameterOptimizer({
  algorithm: OptimizationAlgorithm.GENETIC_ALGORITHM,
  maxIterations: 100,
  populationSize: 50
});

// Define optimization objective
const objective: OptimizationObjective = {
  name: 'Maximize Sharpe Ratio',
  type: ObjectiveType.MAXIMIZE,
  weight: 1.0,
  evaluator: (strategy, data) => calculateSharpeRatio(strategy, data)
};

const result = await optimizer.optimizeParameters(strategy, objective);

console.log('Original Parameters:');
Object.entries(result.originalParameters).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});

console.log('Optimized Parameters:');
Object.entries(result.optimizedParameters).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});

console.log(`Improvement: ${result.improvement.percentageGain}%`);
console.log(`Confidence: ${result.confidence}`);
console.log(`Iterations: ${result.iterations}`);

// Apply optimized parameters
await applyParametersToStrategy(strategy, result.optimizedParameters);
```

### `provideFeedback(strategy: Strategy, context: BuildingContext): Promise<Feedback>`

Provides real-time feedback during strategy building.

**Parameters:**
- `strategy` (Strategy): Current strategy state
- `context` (BuildingContext): Building context information

**Returns:**
- `Promise<Feedback>`: Real-time feedback and suggestions

**Example:**
```typescript
const feedbackSystem = new FeedbackSystem({
  enableRealTime: true,
  feedbackFrequency: 1000, // 1 second
  includeExamples: true
});

// Set up real-time feedback during strategy building
const setupRealTimeFeedback = (strategyBuilder: StrategyBuilder) => {
  strategyBuilder.onStrategyChange = async (strategy, context) => {
    const feedback = await feedbackSystem.provideFeedback(strategy, context);
    
    // Display feedback based on severity
    switch (feedback.severity) {
      case FeedbackSeverity.ERROR:
        showErrorFeedback(feedback);
        break;
      case FeedbackSeverity.WARNING:
        showWarningFeedback(feedback);
        break;
      case FeedbackSeverity.INFO:
        showInfoFeedback(feedback);
        break;
      case FeedbackSeverity.SUCCESS:
        showSuccessFeedback(feedback);
        break;
    }
    
    // Show suggestions if available
    if (feedback.suggestions.length > 0) {
      showSuggestions(feedback.suggestions);
    }
  };
};

const showErrorFeedback = (feedback: Feedback) => {
  console.error(`❌ ${feedback.message}`);
  if (feedback.actionRequired) {
    console.log('Action required to continue');
  }
};

const showSuggestions = (suggestions: string[]) => {
  console.log('💡 Suggestions:');
  suggestions.forEach(suggestion => {
    console.log(`  • ${suggestion}`);
  });
};
```

## 💡 **Usage Examples**

### Comprehensive Strategy Analysis

```typescript
import { StrategyAnalyzer, ImprovementSuggester } from '@/agents/pinegenie-ai/optimization';

const performComprehensiveAnalysis = async (strategy: Strategy) => {
  const analyzer = new StrategyAnalyzer({
    enableDeepAnalysis: true,
    includeMarketAnalysis: true,
    riskTolerance: RiskTolerance.MODERATE
  });

  const suggester = new ImprovementSuggester();

  try {
    // Analyze the strategy
    const analysis = await analyzer.analyzeStrategy(strategy);
    
    // Generate improvement suggestions
    const improvements = await suggester.generateImprovements(analysis);
    const prioritizedImprovements = await suggester.prioritizeImprovements(improvements);
    
    // Create analysis report
    const report = {
      strategy: {
        name: strategy.name,
        type: strategy.type,
        overallScore: analysis.overallScore
      },
      strengths: analysis.strengths.map(s => ({
        category: s.category,
        description: s.description,
        impact: s.impact
      })),
      weaknesses: analysis.weaknesses.map(w => ({
        category: w.category,
        description: w.description,
        severity: w.severity,
        suggestions: w.suggestions
      })),
      topImprovements: prioritizedImprovements.slice(0, 5).map(imp => ({
        title: imp.title,
        description: imp.description,
        priority: imp.priority,
        estimatedImpact: imp.estimatedImpact,
        difficulty: imp.difficulty
      })),
      metrics: analysis.metrics
    };
    
    // Display results
    console.log('📊 Strategy Analysis Report');
    console.log('=' .repeat(50));
    console.log(`Strategy: ${report.strategy.name}`);
    console.log(`Overall Score: ${report.strategy.overallScore}/100`);
    
    console.log('\n✅ Strengths:');
    report.strengths.forEach(strength => {
      console.log(`  • ${strength.description} (Impact: ${strength.impact})`);
    });
    
    console.log('\n⚠️ Areas for Improvement:');
    report.weaknesses.forEach(weakness => {
      console.log(`  • ${weakness.description} (${weakness.severity})`);
    });
    
    console.log('\n💡 Top Improvement Recommendations:');
    report.topImprovements.forEach((imp, index) => {
      console.log(`  ${index + 1}. ${imp.title}`);
      console.log(`     ${imp.description}`);
      console.log(`     Priority: ${imp.priority}, Difficulty: ${imp.difficulty}`);
      console.log(`     Estimated Impact: ${imp.estimatedImpact.description}`);
    });
    
    return report;
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
};
```

### Multi-Objective Parameter Optimization

```typescript
import { ParameterOptimizer, OptimizationObjective } from '@/agents/pinegenie-ai/optimization';

const optimizeForMultipleObjectives = async (strategy: Strategy, marketData: MarketData[]) => {
  const optimizer = new ParameterOptimizer({
    algorithm: OptimizationAlgorithm.NSGA_II, // Multi-objective genetic algorithm
    maxIterations: 200,
    populationSize: 100
  });

  // Define multiple objectives
  const objectives: OptimizationObjective[] = [
    {
      name: 'Maximize Returns',
      type: ObjectiveType.MAXIMIZE,
      weight: 0.4,
      evaluator: (strategy, data) => calculateTotalReturn(strategy, data)
    },
    {
      name: 'Minimize Risk',
      type: ObjectiveType.MINIMIZE,
      weight: 0.3,
      evaluator: (strategy, data) => calculateMaxDrawdown(strategy, data)
    },
    {
      name: 'Maximize Sharpe Ratio',
      type: ObjectiveType.MAXIMIZE,
      weight: 0.3,
      evaluator: (strategy, data) => calculateSharpeRatio(strategy, data)
    }
  ];

  try {
    // Perform multi-objective optimization
    const paretoFront = await optimizer.multiObjectiveOptimization(strategy, objectives);
    
    console.log(`Found ${paretoFront.solutions.length} Pareto-optimal solutions`);
    
    // Analyze solutions
    const solutions = paretoFront.solutions.map((solution, index) => ({
      id: index + 1,
      parameters: solution.parameters,
      objectives: solution.objectiveValues,
      dominationRank: solution.dominationRank,
      crowdingDistance: solution.crowdingDistance
    }));
    
    // Sort by dominance and crowding distance
    solutions.sort((a, b) => {
      if (a.dominationRank !== b.dominationRank) {
        return a.dominationRank - b.dominationRank;
      }
      return b.crowdingDistance - a.crowdingDistance;
    });
    
    // Display top solutions
    console.log('\n🏆 Top Pareto-Optimal Solutions:');
    solutions.slice(0, 5).forEach(solution => {
      console.log(`\nSolution ${solution.id}:`);
      console.log(`  Parameters: ${JSON.stringify(solution.parameters, null, 2)}`);
      console.log(`  Returns: ${solution.objectives[0].toFixed(2)}%`);
      console.log(`  Max Drawdown: ${solution.objectives[1].toFixed(2)}%`);
      console.log(`  Sharpe Ratio: ${solution.objectives[2].toFixed(2)}`);
      console.log(`  Rank: ${solution.dominationRank}, Distance: ${solution.crowdingDistance.toFixed(4)}`);
    });
    
    // Let user choose solution or provide recommendation
    const recommendedSolution = solutions[0]; // Best overall solution
    console.log(`\n💡 Recommended Solution: Solution ${recommendedSolution.id}`);
    
    return {
      paretoFront,
      solutions,
      recommended: recommendedSolution
    };
  } catch (error) {
    console.error('Multi-objective optimization failed:', error);
    throw error;
  }
};
```

### Real-Time Strategy Feedback

```typescript
import { FeedbackSystem, StrategyBuilder } from '@/agents/pinegenie-ai/optimization';

const setupIntelligentFeedback = (strategyBuilder: StrategyBuilder, userId: string) => {
  const feedbackSystem = new FeedbackSystem({
    enableRealTime: true,
    personalizeToUser: true,
    learningEnabled: true
  });

  // Track user interactions for learning
  const userInteractions: UserInteraction[] = [];

  // Set up event handlers
  strategyBuilder.onComponentAdded = async (component, strategy) => {
    // Record interaction
    userInteractions.push({
      type: 'component-added',
      componentType: component.type,
      timestamp: new Date(),
      context: { strategyType: strategy.type, componentCount: strategy.components.length }
    });

    // Provide immediate feedback
    const feedback = await feedbackSystem.provideFeedback(strategy, {
      action: 'component-added',
      component,
      userId
    });

    displayFeedback(feedback);

    // Suggest next components
    const suggestions = await feedbackSystem.suggestNextComponent(strategy);
    displayComponentSuggestions(suggestions);
  };

  strategyBuilder.onParameterChanged = async (componentId, parameter, value, strategy) => {
    // Record interaction
    userInteractions.push({
      type: 'parameter-changed',
      componentId,
      parameter,
      oldValue: strategy.getComponent(componentId).parameters[parameter],
      newValue: value,
      timestamp: new Date()
    });

    // Validate parameter change
    const validation = await feedbackSystem.validateChanges(
      strategy.getPreviousState(),
      strategy
    );

    if (!validation.valid) {
      displayValidationErrors(validation.errors);
    } else {
      displayValidationSuccess(validation.improvements);
    }

    // Suggest parameter optimizations
    const paramSuggestions = await feedbackSystem.suggestParameterValues(
      strategy.getComponent(componentId)
    );
    displayParameterSuggestions(paramSuggestions);
  };

  strategyBuilder.onStrategyComplete = async (strategy) => {
    // Perform final analysis
    const bestPractices = await feedbackSystem.checkBestPractices(strategy);
    displayBestPracticesReport(bestPractices);

    // Suggest risk management improvements
    const riskSuggestions = await feedbackSystem.suggestRiskManagement(strategy);
    displayRiskManagementSuggestions(riskSuggestions);

    // Update learning model
    await feedbackSystem.adaptToUserBehavior(userId, userInteractions);

    // Generate personalized recommendations for future strategies
    const personalizedFeedback = await feedbackSystem.personalizeRecommendations(userId, strategy);
    displayPersonalizedRecommendations(personalizedFeedback);
  };

  // Feedback display functions
  const displayFeedback = (feedback: Feedback) => {
    const feedbackElement = document.createElement('div');
    feedbackElement.className = `feedback feedback-${feedback.severity}`;
    feedbackElement.innerHTML = `
      <div class="feedback-header">
        <span class="feedback-icon">${getFeedbackIcon(feedback.type)}</span>
        <span class="feedback-message">${feedback.message}</span>
      </div>
      ${feedback.suggestions.length > 0 ? `
        <div class="feedback-suggestions">
          <strong>Suggestions:</strong>
          <ul>${feedback.suggestions.map(s => `<li>${s}</li>`).join('')}</ul>
        </div>
      ` : ''}
      ${feedback.examples && feedback.examples.length > 0 ? `
        <div class="feedback-examples">
          <strong>Examples:</strong>
          ${feedback.examples.map(ex => `<div class="example">${ex.description}</div>`).join('')}
        </div>
      ` : ''}
    `;
    
    // Add to feedback panel
    const feedbackPanel = document.getElementById('feedback-panel');
    feedbackPanel?.appendChild(feedbackElement);
    
    // Auto-remove after delay for non-critical feedback
    if (feedback.severity === FeedbackSeverity.INFO) {
      setTimeout(() => {
        feedbackElement.remove();
      }, 5000);
    }
  };

  const displayComponentSuggestions = (suggestions: ComponentSuggestion[]) => {
    const suggestionsPanel = document.getElementById('component-suggestions');
    if (suggestionsPanel) {
      suggestionsPanel.innerHTML = suggestions.map(suggestion => `
        <div class="component-suggestion" data-component-type="${suggestion.type}">
          <div class="suggestion-header">
            <span class="suggestion-icon">${getComponentIcon(suggestion.type)}</span>
            <span class="suggestion-title">${suggestion.label}</span>
            <span class="suggestion-priority priority-${suggestion.priority}">${suggestion.priority}</span>
          </div>
          <div class="suggestion-description">${suggestion.description}</div>
          <div class="suggestion-reason">${suggestion.reason}</div>
          <button class="add-component-btn" onclick="addSuggestedComponent('${suggestion.type}')">
            Add Component
          </button>
        </div>
      `).join('');
    }
  };

  return {
    feedbackSystem,
    getUserInteractions: () => userInteractions,
    getPersonalizedRecommendations: () => feedbackSystem.personalizeRecommendations(userId, strategyBuilder.getCurrentStrategy())
  };
};

// Utility functions
const getFeedbackIcon = (type: FeedbackType): string => {
  const icons = {
    [FeedbackType.VALIDATION]: '✅',
    [FeedbackType.WARNING]: '⚠️',
    [FeedbackType.ERROR]: '❌',
    [FeedbackType.SUGGESTION]: '💡',
    [FeedbackType.BEST_PRACTICE]: '🏆',
    [FeedbackType.OPTIMIZATION]: '⚡'
  };
  return icons[type] || 'ℹ️';
};

const getComponentIcon = (type: string): string => {
  const icons = {
    'data-source': '📊',
    'indicator': '📈',
    'condition': '🔍',
    'action': '⚡',
    'risk-management': '🛡️'
  };
  return icons[type] || '🔧';
};
```

## ⚡ **Optimization Algorithms**

### Genetic Algorithm Implementation

```typescript
enum OptimizationAlgorithm {
  GENETIC_ALGORITHM = 'genetic-algorithm',
  PARTICLE_SWARM = 'particle-swarm',
  SIMULATED_ANNEALING = 'simulated-annealing',
  DIFFERENTIAL_EVOLUTION = 'differential-evolution',
  NSGA_II = 'nsga-ii', // Multi-objective
  BAYESIAN_OPTIMIZATION = 'bayesian-optimization'
}

interface GeneticAlgorithmConfig {
  populationSize: number;
  maxGenerations: number;
  mutationRate: number;
  crossoverRate: number;
  elitismRate: number;
  selectionMethod: SelectionMethod;
  crossoverMethod: CrossoverMethod;
  mutationMethod: MutationMethod;
}

// Example genetic algorithm configuration
const gaConfig: GeneticAlgorithmConfig = {
  populationSize: 100,
  maxGenerations: 200,
  mutationRate: 0.1,
  crossoverRate: 0.8,
  elitismRate: 0.1,
  selectionMethod: SelectionMethod.TOURNAMENT,
  crossoverMethod: CrossoverMethod.UNIFORM,
  mutationMethod: MutationMethod.GAUSSIAN
};
```

## 📊 **Performance Metrics**

### Standard Trading Metrics

```typescript
interface TradingMetrics {
  // Return metrics
  totalReturn: number;
  annualizedReturn: number;
  compoundAnnualGrowthRate: number;
  
  // Risk metrics
  volatility: number;
  maxDrawdown: number;
  valueAtRisk: number;
  conditionalVaR: number;
  
  // Risk-adjusted returns
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  informationRatio: number;
  
  // Trade statistics
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  
  // Advanced metrics
  beta: number;
  alpha: number;
  trackingError: number;
  treynorRatio: number;
  jensenAlpha: number;
}

// Metric calculation functions
const calculateSharpeRatio = (returns: number[], riskFreeRate: number = 0): number => {
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance);
  return (avgReturn - riskFreeRate) / volatility;
};

const calculateMaxDrawdown = (equity: number[]): number => {
  let maxDrawdown = 0;
  let peak = equity[0];
  
  for (let i = 1; i < equity.length; i++) {
    if (equity[i] > peak) {
      peak = equity[i];
    } else {
      const drawdown = (peak - equity[i]) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
  }
  
  return maxDrawdown;
};
```

---

**Next**: [Template Integration API](./templates.md)  
**Previous**: [Educational Animations API](./animations.md)