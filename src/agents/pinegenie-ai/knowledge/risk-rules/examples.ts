/**
 * Risk Management Engine Usage Examples
 * 
 * This file demonstrates how to use the risk management engine
 * in various scenarios within the PineGenie AI system.
 */

import { RiskManagementEngine, StrategyType } from '../risk-rules';

// Initialize the risk management engine
const riskEngine = new RiskManagementEngine();

/**
 * Example 1: Basic Risk Assessment for a Trend Following Strategy
 */
export function basicRiskAssessmentExample() {
  console.log('=== Basic Risk Assessment Example ===');
  
  const assessment = riskEngine.assessRisk(StrategyType.TREND_FOLLOWING, {
    accountBalance: 10000,
    proposedPositionSize: 500, // 5% of account
    stopLossDistance: 2, // 2% stop loss
    currentDrawdown: 3, // 3% current drawdown
    marketVolatility: 1.2, // 20% above normal volatility
    existingPositions: 2,
    correlationLevel: 0.4
  });

  console.log('Overall Risk Level:', assessment.overallRisk);
  console.log('Risk Score (0-100):', assessment.riskScore);
  console.log('Applied Rules:', assessment.appliedRules.length);
  console.log('Risk Factors:', assessment.riskFactors.length);
  console.log('Recommendations:', assessment.recommendations.length);
  
  if (assessment.warnings.length > 0) {
    console.log('Warnings:');
    assessment.warnings.forEach(warning => console.log(`  - ${warning}`));
  }

  return assessment;
}

/**
 * Example 2: Position Sizing for Different Market Conditions
 */
export function positionSizingExample() {
  console.log('\n=== Position Sizing Example ===');
  
  const baseParameters = {
    accountBalance: 10000,
    riskPerTrade: 2, // 2% risk per trade
    stopLossDistance: 2, // 2% stop loss
    confidence: 0.8,
    correlationFactor: 0.2
  };

  // Normal market conditions
  const normalMarket = riskEngine.calculatePositionSize({
    ...baseParameters,
    volatility: 1.0
  });

  // High volatility market
  const volatileMarket = riskEngine.calculatePositionSize({
    ...baseParameters,
    volatility: 2.5
  });

  // Low confidence trade
  const lowConfidence = riskEngine.calculatePositionSize({
    ...baseParameters,
    volatility: 1.0,
    confidence: 0.5
  });

  console.log('Normal Market - Recommended Size:', normalMarket.recommendedSize);
  console.log('Volatile Market - Recommended Size:', volatileMarket.recommendedSize);
  console.log('Low Confidence - Recommended Size:', lowConfidence.recommendedSize);
  
  console.log('\nVolatile Market Adjustments:');
  volatileMarket.adjustments.forEach(adj => console.log(`  - ${adj}`));

  return { normalMarket, volatileMarket, lowConfidence };
}

/**
 * Example 3: Risk-Reward Ratio Analysis
 */
export function riskRewardAnalysisExample() {
  console.log('\n=== Risk-Reward Ratio Analysis Example ===');
  
  const scenarios = [
    { name: 'Excellent Setup', entry: 100, stop: 98, target: 106 }, // 3:1 R:R
    { name: 'Good Setup', entry: 100, stop: 98, target: 104 },     // 2:1 R:R
    { name: 'Poor Setup', entry: 100, stop: 98, target: 101 },     // 0.5:1 R:R
  ];

  scenarios.forEach(scenario => {
    const rrRatio = riskEngine.calculateRiskRewardRatio(
      scenario.entry,
      scenario.stop,
      scenario.target
    );

    console.log(`\n${scenario.name}:`);
    console.log(`  Risk-Reward Ratio: ${rrRatio.ratio.toFixed(2)}:1`);
    console.log(`  Risk Amount: ${rrRatio.riskAmount}`);
    console.log(`  Reward Amount: ${rrRatio.rewardAmount}`);
    console.log(`  Probability: ${(rrRatio.probability * 100).toFixed(1)}%`);
    console.log(`  Expected Value: ${rrRatio.expectedValue.toFixed(2)}`);
    console.log(`  Recommendation: ${rrRatio.recommendation}`);
  });
}

/**
 * Example 4: Strategy Component Suggestions
 */
export function componentSuggestionsExample() {
  console.log('\n=== Component Suggestions Example ===');
  
  const strategies = [
    {
      type: StrategyType.MEAN_REVERSION,
      existing: ['data_source', 'oscillator'],
      name: 'Basic Mean Reversion'
    },
    {
      type: StrategyType.BREAKOUT,
      existing: ['data_source', 'support_resistance'],
      name: 'Simple Breakout'
    },
    {
      type: StrategyType.SCALPING,
      existing: ['data_source', 'fast_indicator'],
      name: 'Basic Scalping'
    }
  ];

  strategies.forEach(strategy => {
    console.log(`\n${strategy.name} Strategy:`);
    
    const suggestions = riskEngine.suggestRiskComponents(
      strategy.type,
      strategy.existing
    );

    const critical = suggestions.filter(s => s.priority === 'critical');
    const high = suggestions.filter(s => s.priority === 'high');
    const medium = suggestions.filter(s => s.priority === 'medium');

    if (critical.length > 0) {
      console.log('  Critical Missing Components:');
      critical.forEach(s => console.log(`    - ${s.description}`));
    }

    if (high.length > 0) {
      console.log('  High Priority Recommendations:');
      high.forEach(s => console.log(`    - ${s.description}`));
    }

    if (medium.length > 0) {
      console.log('  Medium Priority Recommendations:');
      medium.forEach(s => console.log(`    - ${s.description}`));
    }
  });
}

/**
 * Example 5: Strategy Completeness Assessment
 */
export function completenessAssessmentExample() {
  console.log('\n=== Strategy Completeness Assessment Example ===');
  
  const strategies = [
    {
      type: StrategyType.TREND_FOLLOWING,
      components: ['data_source', 'trend_indicator', 'entry_condition', 'exit_condition', 'stop_loss', 'take_profit'],
      name: 'Complete Trend Following'
    },
    {
      type: StrategyType.TREND_FOLLOWING,
      components: ['data_source', 'trend_indicator'],
      name: 'Incomplete Trend Following'
    }
  ];

  strategies.forEach(strategy => {
    const assessment = riskEngine.assessStrategyCompleteness(
      strategy.type,
      strategy.components
    );

    console.log(`\n${strategy.name}:`);
    console.log(`  Completeness: ${assessment.completeness}%`);
    console.log(`  Risk Level: ${assessment.riskLevel}`);
    console.log(`  Missing Required: ${assessment.missingRequired.length}`);
    console.log(`  Missing Recommended: ${assessment.missingRecommended.length}`);
    
    if (assessment.warnings.length > 0) {
      console.log('  Warnings:');
      assessment.warnings.forEach(warning => console.log(`    - ${warning}`));
    }
  });
}

/**
 * Example 6: Risk Warning Generation
 */
export function riskWarningExample() {
  console.log('\n=== Risk Warning Generation Example ===');
  
  const scenarios = [
    {
      name: 'High Position Size',
      params: {
        accountBalance: 10000,
        proposedPositionSize: 1500, // 15% of account
        stopLoss: 98,
        entryPrice: 100
      }
    },
    {
      name: 'No Stop Loss',
      params: {
        accountBalance: 10000,
        proposedPositionSize: 500,
        entryPrice: 100,
        takeProfit: 102
        // No stopLoss parameter
      }
    },
    {
      name: 'Poor Risk-Reward',
      params: {
        accountBalance: 10000,
        proposedPositionSize: 500,
        entryPrice: 100,
        stopLoss: 98,
        takeProfit: 100.5 // 0.25:1 R:R
      }
    }
  ];

  scenarios.forEach(scenario => {
    const warnings = riskEngine.generateRiskWarnings(
      StrategyType.TREND_FOLLOWING,
      scenario.params
    );

    console.log(`\n${scenario.name}:`);
    if (warnings.length > 0) {
      warnings.forEach(warning => console.log(`  - ${warning}`));
    } else {
      console.log('  No warnings generated');
    }
  });
}

/**
 * Example 7: Performance Monitoring
 */
export function performanceMonitoringExample() {
  console.log('\n=== Performance Monitoring Example ===');
  
  const startTime = performance.now();
  
  // Perform multiple risk assessments
  const assessments = [];
  for (let i = 0; i < 100; i++) {
    assessments.push(riskEngine.assessRisk(StrategyType.TREND_FOLLOWING, {
      accountBalance: 10000 + i * 100,
      proposedPositionSize: 500 + i * 10,
      stopLossDistance: 2,
      currentDrawdown: i % 10,
      marketVolatility: 1.0 + (i % 5) * 0.2
    }));
  }
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  const averageTime = totalTime / 100;
  
  console.log(`Processed 100 risk assessments in ${totalTime.toFixed(2)}ms`);
  console.log(`Average time per assessment: ${averageTime.toFixed(2)}ms`);
  
  // Get engine statistics
  const stats = riskEngine.getStatistics();
  console.log('\nEngine Statistics:');
  console.log(`  Total Rules: ${stats.totalRules}`);
  console.log(`  Enabled Rules: ${stats.enabledRules}`);
  console.log('  Rules by Category:', stats.rulesByCategory);
  console.log('  Rules by Risk Level:', stats.rulesByRiskLevel);
}

/**
 * Run all examples
 */
export function runAllExamples() {
  console.log('PineGenie AI Risk Management Engine Examples\n');
  
  basicRiskAssessmentExample();
  positionSizingExample();
  riskRewardAnalysisExample();
  componentSuggestionsExample();
  completenessAssessmentExample();
  riskWarningExample();
  performanceMonitoringExample();
  
  console.log('\n=== All Examples Completed ===');
}

// Export individual examples for selective usage
export {
  basicRiskAssessmentExample,
  positionSizingExample,
  riskRewardAnalysisExample,
  componentSuggestionsExample,
  completenessAssessmentExample,
  riskWarningExample,
  performanceMonitoringExample
};