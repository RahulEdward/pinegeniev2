/**
 * Risk Management Engine Tests
 * 
 * Comprehensive test suite for the risk management rule engine
 */

import { RiskManagementEngine, STRATEGY_RISK_PROFILES } from '../risk-rules';
import { StrategyType } from '../../types/nlp-types';

describe('RiskManagementEngine', () => {
  let riskEngine: RiskManagementEngine;

  beforeEach(() => {
    riskEngine = new RiskManagementEngine();
  });

  describe('Risk Assessment', () => {
    test('should assess risk for trend following strategy', () => {
      const assessment = riskEngine.assessRisk(StrategyType.TREND_FOLLOWING, {
        accountBalance: 10000,
        proposedPositionSize: 500,
        stopLossDistance: 2,
        currentDrawdown: 5,
        marketVolatility: 1.2,
        existingPositions: 2,
        correlationLevel: 0.3
      });

      expect(assessment).toBeDefined();
      expect(assessment.overallRisk).toMatch(/^(very_low|low|medium|high|very_high)$/);
      expect(assessment.riskScore).toBeGreaterThanOrEqual(0);
      expect(assessment.riskScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(assessment.riskFactors)).toBe(true);
      expect(Array.isArray(assessment.recommendations)).toBe(true);
      expect(Array.isArray(assessment.appliedRules)).toBe(true);
      expect(Array.isArray(assessment.warnings)).toBe(true);
    });

    test('should identify high risk for excessive position size', () => {
      const assessment = riskEngine.assessRisk(StrategyType.TREND_FOLLOWING, {
        accountBalance: 10000,
        proposedPositionSize: 3000, // 30% of account - very high
        stopLossDistance: 5,
        currentDrawdown: 0,
        marketVolatility: 1.0
      });

      expect(assessment.overallRisk).toMatch(/^(high|very_high)$/);
      expect(assessment.riskScore).toBeGreaterThan(60);
      expect(assessment.appliedRules.length).toBeGreaterThan(0);
      expect(assessment.warnings.length).toBeGreaterThan(0);
    });

    test('should handle scalping strategy with appropriate risk assessment', () => {
      const assessment = riskEngine.assessRisk(StrategyType.SCALPING, {
        accountBalance: 10000,
        proposedPositionSize: 100,
        stopLossDistance: 0.5,
        currentDrawdown: 2,
        marketVolatility: 0.8
      });

      expect(assessment).toBeDefined();
      expect(assessment.overallRisk).toBeDefined();
      expect(assessment.riskScore).toBeGreaterThanOrEqual(0);
      
      // Scalping should have specific rules applied
      const scalpingRules = riskEngine.getRulesForStrategy(StrategyType.SCALPING);
      expect(scalpingRules.length).toBeGreaterThan(0);
    });
  });

  describe('Position Sizing', () => {
    test('should calculate optimal position size', () => {
      const result = riskEngine.calculatePositionSize({
        accountBalance: 10000,
        riskPerTrade: 2,
        stopLossDistance: 2,
        volatility: 1.0,
        confidence: 0.8,
        correlationFactor: 0.2
      });

      expect(result.recommendedSize).toBeGreaterThan(0);
      expect(result.maxSize).toBeGreaterThan(0);
      expect(result.recommendedSize).toBeLessThanOrEqual(result.maxSize);
      expect(Array.isArray(result.reasoning)).toBe(true);
      expect(Array.isArray(result.adjustments)).toBe(true);
      expect(result.reasoning.length).toBeGreaterThan(0);
    });

    test('should reduce position size for high volatility', () => {
      const normalVolatility = riskEngine.calculatePositionSize({
        accountBalance: 10000,
        riskPerTrade: 2,
        stopLossDistance: 2,
        volatility: 1.0,
        confidence: 0.8,
        correlationFactor: 0.2
      });

      const highVolatility = riskEngine.calculatePositionSize({
        accountBalance: 10000,
        riskPerTrade: 2,
        stopLossDistance: 2,
        volatility: 2.5,
        confidence: 0.8,
        correlationFactor: 0.2
      });

      expect(highVolatility.recommendedSize).toBeLessThan(normalVolatility.recommendedSize);
      expect(highVolatility.adjustments.some(adj => 
        adj.toLowerCase().includes('volatility')
      )).toBe(true);
    });

    test('should adjust for low confidence', () => {
      const highConfidence = riskEngine.calculatePositionSize({
        accountBalance: 10000,
        riskPerTrade: 2,
        stopLossDistance: 2,
        volatility: 1.0,
        confidence: 0.9,
        correlationFactor: 0.2
      });

      const lowConfidence = riskEngine.calculatePositionSize({
        accountBalance: 10000,
        riskPerTrade: 2,
        stopLossDistance: 2,
        volatility: 1.0,
        confidence: 0.5,
        correlationFactor: 0.2
      });

      expect(lowConfidence.recommendedSize).toBeLessThan(highConfidence.recommendedSize);
      expect(lowConfidence.adjustments.some(adj => 
        adj.toLowerCase().includes('confidence')
      )).toBe(true);
    });
  });

  describe('Risk-Reward Ratio Calculation', () => {
    test('should calculate risk-reward ratio correctly', () => {
      const rrRatio = riskEngine.calculateRiskRewardRatio(100, 98, 104);

      expect(rrRatio.ratio).toBe(2); // (104-100)/(100-98) = 4/2 = 2
      expect(rrRatio.riskAmount).toBe(2);
      expect(rrRatio.rewardAmount).toBe(4);
      expect(rrRatio.probability).toBeGreaterThan(0);
      expect(rrRatio.probability).toBeLessThanOrEqual(1);
      expect(rrRatio.recommendation).toMatch(/^(excellent|good|acceptable|poor|unacceptable)$/);
    });

    test('should recommend excellent for high risk-reward ratios', () => {
      const rrRatio = riskEngine.calculateRiskRewardRatio(100, 99, 103);

      expect(rrRatio.ratio).toBe(3);
      expect(rrRatio.recommendation).toBe('excellent');
    });

    test('should recommend unacceptable for poor risk-reward ratios', () => {
      const rrRatio = riskEngine.calculateRiskRewardRatio(100, 99, 100.5);

      expect(rrRatio.ratio).toBe(0.5);
      expect(rrRatio.recommendation).toBe('unacceptable');
    });
  });

  describe('Risk Component Suggestions', () => {
    test('should suggest missing required components', () => {
      const suggestions = riskEngine.suggestRiskComponents(
        StrategyType.TREND_FOLLOWING,
        ['data_source', 'trend_indicator']
      );

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      
      const criticalSuggestions = suggestions.filter(s => s.priority === 'critical');
      expect(criticalSuggestions.length).toBeGreaterThan(0);
      
      const stopLossSuggestion = suggestions.find(s => 
        s.nodeType === 'stop_loss' || s.description.toLowerCase().includes('stop')
      );
      expect(stopLossSuggestion).toBeDefined();
    });

    test('should suggest strategy-specific components for mean reversion', () => {
      const suggestions = riskEngine.suggestRiskComponents(
        StrategyType.MEAN_REVERSION,
        ['data_source', 'oscillator']
      );

      expect(suggestions.length).toBeGreaterThan(0);
      
      const trendFilterSuggestion = suggestions.find(s => 
        s.nodeType === 'trend_filter' || s.description.toLowerCase().includes('trend')
      );
      expect(trendFilterSuggestion).toBeDefined();
      expect(trendFilterSuggestion?.priority).toBe('critical');
    });

    test('should suggest volume confirmation for breakout strategies', () => {
      const suggestions = riskEngine.suggestRiskComponents(
        StrategyType.BREAKOUT,
        ['data_source', 'support_resistance', 'breakout_condition']
      );

      const volumeSuggestion = suggestions.find(s => 
        s.nodeType === 'volume_confirmation' || s.description.toLowerCase().includes('volume')
      );
      expect(volumeSuggestion).toBeDefined();
    });
  });

  describe('Strategy Risk Profiles', () => {
    test('should have risk profiles for all strategy types', () => {
      const strategyTypes = Object.values(StrategyType);
      
      strategyTypes.forEach(strategyType => {
        const profile = STRATEGY_RISK_PROFILES[strategyType];
        expect(profile).toBeDefined();
        expect(profile.strategyType).toBe(strategyType);
        expect(Array.isArray(profile.requiredComponents)).toBe(true);
        expect(Array.isArray(profile.recommendedComponents)).toBe(true);
        expect(Array.isArray(profile.riskFactors)).toBe(true);
        expect(Array.isArray(profile.mitigationStrategies)).toBe(true);
        expect(profile.optimalRiskReward).toBeGreaterThan(0);
      });
    });

    test('should return correct risk profile for strategy type', () => {
      const profile = riskEngine.getStrategyRiskProfile(StrategyType.SCALPING);
      
      expect(profile.strategyType).toBe(StrategyType.SCALPING);
      expect(profile.baseRiskLevel).toBe('very_high');
      expect(profile.requiredComponents).toContain('tight_stop');
      expect(profile.riskFactors).toContain('spread_widening');
      expect(profile.optimalRiskReward).toBeLessThan(2); // Scalping typically has lower R:R
    });
  });

  describe('Strategy Completeness Assessment', () => {
    test('should assess complete strategy as high completeness', () => {
      const profile = STRATEGY_RISK_PROFILES[StrategyType.TREND_FOLLOWING];
      const assessment = riskEngine.assessStrategyCompleteness(
        StrategyType.TREND_FOLLOWING,
        [...profile.requiredComponents, ...profile.recommendedComponents]
      );

      expect(assessment.completeness).toBeGreaterThan(90);
      expect(assessment.missingRequired).toHaveLength(0);
      expect(assessment.missingRecommended).toHaveLength(0);
      expect(assessment.warnings).toHaveLength(0);
    });

    test('should assess incomplete strategy as low completeness', () => {
      const assessment = riskEngine.assessStrategyCompleteness(
        StrategyType.TREND_FOLLOWING,
        ['data_source'] // Only one component
      );

      expect(assessment.completeness).toBeLessThan(50);
      expect(assessment.missingRequired.length).toBeGreaterThan(0);
      expect(assessment.missingRecommended.length).toBeGreaterThan(0);
      expect(assessment.warnings.length).toBeGreaterThan(0);
      expect(assessment.riskLevel).toMatch(/^(high|very_high)$/);
    });

    test('should increase risk level for missing required components', () => {
      const completeAssessment = riskEngine.assessStrategyCompleteness(
        StrategyType.MEAN_REVERSION,
        STRATEGY_RISK_PROFILES[StrategyType.MEAN_REVERSION].requiredComponents
      );

      const incompleteAssessment = riskEngine.assessStrategyCompleteness(
        StrategyType.MEAN_REVERSION,
        ['data_source'] // Missing most required components
      );

      const riskLevels = ['very_low', 'low', 'medium', 'high', 'very_high'];
      const completeRiskIndex = riskLevels.indexOf(completeAssessment.riskLevel);
      const incompleteRiskIndex = riskLevels.indexOf(incompleteAssessment.riskLevel);

      expect(incompleteRiskIndex).toBeGreaterThan(completeRiskIndex);
    });
  });

  describe('Risk Warning Generation', () => {
    test('should generate warnings for high position size', () => {
      const warnings = riskEngine.generateRiskWarnings(
        StrategyType.TREND_FOLLOWING,
        {
          accountBalance: 10000,
          proposedPositionSize: 1500 // 15% of account
        }
      );

      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings.some(warning => 
        warning.toLowerCase().includes('position size')
      )).toBe(true);
    });

    test('should generate warnings for missing stop loss', () => {
      const warnings = riskEngine.generateRiskWarnings(
        StrategyType.TREND_FOLLOWING,
        {
          accountBalance: 10000,
          proposedPositionSize: 500
          // No stopLoss parameter
        }
      );

      expect(warnings.some(warning => 
        warning.toLowerCase().includes('stop loss')
      )).toBe(true);
    });

    test('should generate warnings for poor risk-reward ratio', () => {
      const warnings = riskEngine.generateRiskWarnings(
        StrategyType.TREND_FOLLOWING,
        {
          accountBalance: 10000,
          proposedPositionSize: 500,
          entryPrice: 100,
          stopLoss: 98,
          takeProfit: 100.5 // Poor 0.25:1 risk-reward ratio
        }
      );

      expect(warnings.some(warning => 
        warning.toLowerCase().includes('risk-reward')
      )).toBe(true);
    });
  });

  describe('Rule Management', () => {
    test('should get rules for specific strategy type', () => {
      const rules = riskEngine.getRulesForStrategy(StrategyType.SCALPING);
      
      expect(Array.isArray(rules)).toBe(true);
      expect(rules.length).toBeGreaterThan(0);
      
      rules.forEach(rule => {
        expect(rule.applicableStrategies).toContain(StrategyType.SCALPING);
      });
    });

    test('should enable and disable rules', () => {
      const ruleId = 'max_risk_per_trade';
      
      expect(riskEngine.setRuleEnabled(ruleId, false)).toBe(true);
      expect(riskEngine.setRuleEnabled(ruleId, true)).toBe(true);
      expect(riskEngine.setRuleEnabled('nonexistent_rule', false)).toBe(false);
    });

    test('should add custom rules', () => {
      const customRule = {
        id: 'custom_test_rule',
        name: 'Custom Test Rule',
        description: 'A test rule for unit testing',
        category: 'position_sizing' as const,
        applicableStrategies: [StrategyType.CUSTOM],
        riskLevel: 'moderate' as const,
        conditions: [],
        actions: [],
        priority: 5,
        enabled: true
      };

      riskEngine.addCustomRule(customRule);
      
      const rules = riskEngine.getRulesForStrategy(StrategyType.CUSTOM);
      const addedRule = rules.find(rule => rule.id === 'custom_test_rule');
      expect(addedRule).toBeDefined();
      expect(addedRule?.name).toBe('Custom Test Rule');
    });

    test('should provide statistics', () => {
      const stats = riskEngine.getStatistics();
      
      expect(typeof stats.totalRules).toBe('number');
      expect(typeof stats.enabledRules).toBe('number');
      expect(typeof stats.rulesByCategory).toBe('object');
      expect(typeof stats.rulesByRiskLevel).toBe('object');
      expect(stats.totalRules).toBeGreaterThan(0);
      expect(stats.enabledRules).toBeGreaterThan(0);
      expect(stats.enabledRules).toBeLessThanOrEqual(stats.totalRules);
    });
  });

  describe('Performance', () => {
    test('should complete risk assessment within reasonable time', () => {
      const startTime = performance.now();
      
      riskEngine.assessRisk(StrategyType.TREND_FOLLOWING, {
        accountBalance: 10000,
        proposedPositionSize: 500,
        stopLossDistance: 2,
        currentDrawdown: 5,
        marketVolatility: 1.2
      });
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      expect(processingTime).toBeLessThan(100); // Should complete within 100ms
    });

    test('should handle multiple concurrent assessments', () => {
      const assessments = [];
      const startTime = performance.now();
      
      for (let i = 0; i < 10; i++) {
        assessments.push(riskEngine.assessRisk(StrategyType.TREND_FOLLOWING, {
          accountBalance: 10000 + i * 1000,
          proposedPositionSize: 500 + i * 50,
          stopLossDistance: 2,
          currentDrawdown: i,
          marketVolatility: 1.0 + i * 0.1
        }));
      }
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      expect(assessments).toHaveLength(10);
      expect(processingTime).toBeLessThan(500); // Should complete all within 500ms
      assessments.forEach(assessment => {
        expect(assessment).toBeDefined();
        expect(assessment.overallRisk).toBeDefined();
      });
    });
  });
});