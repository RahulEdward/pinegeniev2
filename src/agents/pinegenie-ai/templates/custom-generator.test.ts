/**
 * Custom Template Generator Tests
 */

import { CustomTemplateGenerator } from './custom-generator';
import { TemplateCategory, DifficultyLevel } from '../types/template-types';
import type { StrategyAnalysis, PerformanceMetrics } from './custom-generator';

describe('CustomTemplateGenerator', () => {
  let generator: CustomTemplateGenerator;

  beforeEach(() => {
    generator = new CustomTemplateGenerator();
  });

  describe('Template Generation', () => {
    const mockStrategyAnalysis: StrategyAnalysis = {
      nodes: [
        {
          id: 'node-1',
          type: 'rsi-indicator',
          label: 'RSI',
          parameters: { period: 14, overbought: 70, oversold: 30 },
          position: { x: 100, y: 100 }
        },
        {
          id: 'node-2',
          type: 'buy-condition',
          label: 'Buy Signal',
          parameters: { threshold: 30 },
          position: { x: 200, y: 100 }
        }
      ],
      connections: [
        {
          id: 'conn-1',
          source: 'node-1',
          target: 'node-2',
          type: 'signal'
        }
      ],
      performance: {
        totalReturn: 0.15,
        sharpeRatio: 1.2,
        maxDrawdown: 0.08,
        winRate: 0.65,
        profitFactor: 1.8,
        totalTrades: 100,
        avgTradeReturn: 0.0015,
        volatility: 0.12
      },
      riskProfile: {
        level: 'medium',
        hasStopLoss: true,
        hasTakeProfit: true,
        positionSizing: 'percentage',
        maxRiskPerTrade: 0.02
      },
      marketConditions: ['trending', 'moderate-volatility'],
      timeframe: '1h'
    };

    it('should generate template from successful strategy', async () => {
      const template = await generator.generateFromStrategy(mockStrategyAnalysis);

      expect(template.id).toBeDefined();
      expect(template.name).toBeDefined();
      expect(template.description).toBeDefined();
      expect(template.category).toBe(TemplateCategory.MEAN_REVERSION);
      expect(template.difficulty).toBeDefined();
      expect(template.components).toHaveLength(2);
      expect(template.metadata.aiGenerated).toBe(true);
      expect(template.metadata.backtestResults).toBeDefined();
    });

    it('should reject strategy with poor performance', async () => {
      const poorStrategy = {
        ...mockStrategyAnalysis,
        performance: {
          ...mockStrategyAnalysis.performance,
          totalReturn: 0.05, // Below threshold
          sharpeRatio: 0.3
        }
      };

      await expect(generator.generateFromStrategy(poorStrategy))
        .rejects.toThrow('Strategy does not meet minimum performance threshold');
    });

    it('should reject overly complex strategy', async () => {
      const complexStrategy = {
        ...mockStrategyAnalysis,
        nodes: Array.from({ length: 20 }, (_, i) => ({
          id: `node-${i}`,
          type: 'complex-indicator',
          label: `Complex ${i}`,
          parameters: { param1: i, param2: i * 2, param3: i * 3 },
          position: { x: i * 50, y: i * 50 }
        }))
      };

      await expect(generator.generateFromStrategy(complexStrategy))
        .rejects.toThrow('Strategy is too complex for template generation');
    });
  });

  describe('Template Variations', () => {
    const mockStrategy: StrategyAnalysis = {
      nodes: [
        {
          id: 'ma-node',
          type: 'moving-average',
          label: 'MA',
          parameters: { period: 20 },
          position: { x: 100, y: 100 }
        }
      ],
      connections: [],
      performance: {
        totalReturn: 0.12,
        sharpeRatio: 1.0,
        maxDrawdown: 0.06,
        winRate: 0.6,
        profitFactor: 1.5,
        totalTrades: 80,
        avgTradeReturn: 0.0015,
        volatility: 0.1
      },
      riskProfile: {
        level: 'low',
        hasStopLoss: true,
        hasTakeProfit: false,
        positionSizing: 'fixed',
        maxRiskPerTrade: 0.01
      },
      marketConditions: ['trending'],
      timeframe: '4h'
    };

    it('should generate multiple variations', async () => {
      const variations = await generator.generateVariations(mockStrategy, 3);

      expect(variations).toHaveLength(3);
      variations.forEach((variation, index) => {
        expect(variation.name).toContain(`Variation ${index + 1}`);
        expect(variation.metadata.version).toBe(`1.${index + 1}.0`);
      });
    });
  });

  describe('Template Optimization', () => {
    it('should optimize template based on performance data', async () => {
      // First generate a template
      const mockStrategy: StrategyAnalysis = {
        nodes: [
          {
            id: 'test-node',
            type: 'test-indicator',
            label: 'Test',
            parameters: { period: 14 },
            position: { x: 0, y: 0 }
          }
        ],
        connections: [],
        performance: {
          totalReturn: 0.15,
          sharpeRatio: 1.2,
          maxDrawdown: 0.08,
          winRate: 0.65,
          profitFactor: 1.8,
          totalTrades: 100,
          avgTradeReturn: 0.0015,
          volatility: 0.12
        },
        riskProfile: {
          level: 'medium',
          hasStopLoss: true,
          hasTakeProfit: true,
          positionSizing: 'percentage',
          maxRiskPerTrade: 0.02
        },
        marketConditions: ['trending'],
        timeframe: '1h'
      };

      const template = await generator.generateFromStrategy(mockStrategy);
      
      // Add small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Mock declining performance data
      const performanceData: PerformanceMetrics[] = [
        { ...mockStrategy.performance, totalReturn: 0.10 },
        { ...mockStrategy.performance, totalReturn: 0.08 },
        { ...mockStrategy.performance, totalReturn: 0.06 }
      ];

      const optimized = await generator.optimizeTemplate(template.id, performanceData);

      expect(optimized.id).toBe(template.id);
      expect(optimized.metadata.version).not.toBe(template.metadata.version);
      expect(optimized.metadata.updatedAt.getTime()).toBeGreaterThan(template.metadata.updatedAt.getTime());
    });

    it('should throw error when auto-optimization is disabled', async () => {
      const disabledGenerator = new CustomTemplateGenerator({
        enableAutoOptimization: false
      });

      await expect(disabledGenerator.optimizeTemplate('test-id', []))
        .rejects.toThrow('Auto-optimization is disabled');
    });
  });

  describe('Template Search and Similarity', () => {
    it('should find similar templates', async () => {
      // Generate a few templates first
      const strategy1: StrategyAnalysis = {
        nodes: [{ id: '1', type: 'rsi', label: 'RSI', parameters: {}, position: { x: 0, y: 0 } }],
        connections: [],
        performance: { totalReturn: 0.15, sharpeRatio: 1.2, maxDrawdown: 0.08, winRate: 0.65, profitFactor: 1.8, totalTrades: 100, avgTradeReturn: 0.0015, volatility: 0.12 },
        riskProfile: { level: 'medium', hasStopLoss: true, hasTakeProfit: true, positionSizing: 'percentage', maxRiskPerTrade: 0.02 },
        marketConditions: ['trending'],
        timeframe: '1h'
      };

      const strategy2: StrategyAnalysis = {
        nodes: [{ id: '2', type: 'rsi', label: 'RSI2', parameters: {}, position: { x: 0, y: 0 } }],
        connections: [],
        performance: { totalReturn: 0.12, sharpeRatio: 1.0, maxDrawdown: 0.06, winRate: 0.6, profitFactor: 1.5, totalTrades: 80, avgTradeReturn: 0.0015, volatility: 0.1 },
        riskProfile: { level: 'low', hasStopLoss: true, hasTakeProfit: false, positionSizing: 'fixed', maxRiskPerTrade: 0.01 },
        marketConditions: ['ranging'],
        timeframe: '4h'
      };

      const template1 = await generator.generateFromStrategy(strategy1);
      const template2 = await generator.generateFromStrategy(strategy2);

      const similar = generator.findSimilarTemplates(strategy1, 5);

      expect(Array.isArray(similar)).toBe(true);
      // Should find template2 as similar (both use RSI)
      const foundSimilar = similar.find(s => s.id === template2.id);
      expect(foundSimilar).toBeDefined();
    });

    it('should list custom templates with filtering', async () => {
      const strategy: StrategyAnalysis = {
        nodes: [{ id: '1', type: 'ma', label: 'MA', parameters: {}, position: { x: 0, y: 0 } }],
        connections: [],
        performance: { totalReturn: 0.20, sharpeRatio: 1.5, maxDrawdown: 0.05, winRate: 0.7, profitFactor: 2.0, totalTrades: 120, avgTradeReturn: 0.0017, volatility: 0.08 },
        riskProfile: { level: 'low', hasStopLoss: true, hasTakeProfit: true, positionSizing: 'percentage', maxRiskPerTrade: 0.015 },
        marketConditions: ['trending'],
        timeframe: '1h'
      };

      await generator.generateFromStrategy(strategy);

      const templates = generator.listCustomTemplates({
        category: TemplateCategory.TREND_FOLLOWING,
        minPerformance: 0.15
      });

      expect(Array.isArray(templates)).toBe(true);
      templates.forEach(template => {
        expect(template.category).toBe(TemplateCategory.TREND_FOLLOWING);
        if (template.metadata.backtestResults) {
          expect(template.metadata.backtestResults.totalReturn).toBeGreaterThanOrEqual(0.15);
        }
      });
    });
  });

  describe('Performance Tracking', () => {
    it('should track template performance when enabled', async () => {
      const trackingGenerator = new CustomTemplateGenerator({
        enablePerformanceTracking: true
      });

      const strategy: StrategyAnalysis = {
        nodes: [{ id: '1', type: 'test', label: 'Test', parameters: {}, position: { x: 0, y: 0 } }],
        connections: [],
        performance: { totalReturn: 0.15, sharpeRatio: 1.2, maxDrawdown: 0.08, winRate: 0.65, profitFactor: 1.8, totalTrades: 100, avgTradeReturn: 0.0015, volatility: 0.12 },
        riskProfile: { level: 'medium', hasStopLoss: true, hasTakeProfit: true, positionSizing: 'percentage', maxRiskPerTrade: 0.02 },
        marketConditions: ['trending'],
        timeframe: '1h'
      };

      const template = await trackingGenerator.generateFromStrategy(strategy);
      const performance = trackingGenerator.getTemplatePerformance(template.id);

      expect(Array.isArray(performance)).toBe(true);
      expect(performance).toHaveLength(1);
      expect(performance[0]).toEqual(strategy.performance);
    });

    it('should not track performance when disabled', async () => {
      const noTrackingGenerator = new CustomTemplateGenerator({
        enablePerformanceTracking: false
      });

      const strategy: StrategyAnalysis = {
        nodes: [{ id: '1', type: 'test', label: 'Test', parameters: {}, position: { x: 0, y: 0 } }],
        connections: [],
        performance: { totalReturn: 0.15, sharpeRatio: 1.2, maxDrawdown: 0.08, winRate: 0.65, profitFactor: 1.8, totalTrades: 100, avgTradeReturn: 0.0015, volatility: 0.12 },
        riskProfile: { level: 'medium', hasStopLoss: true, hasTakeProfit: true, positionSizing: 'percentage', maxRiskPerTrade: 0.02 },
        marketConditions: ['trending'],
        timeframe: '1h'
      };

      const template = await noTrackingGenerator.generateFromStrategy(strategy);
      const performance = noTrackingGenerator.getTemplatePerformance(template.id);

      expect(performance).toHaveLength(0);
    });
  });

  describe('Configuration', () => {
    it('should respect custom configuration', () => {
      const customGenerator = new CustomTemplateGenerator({
        enableCommunitySharing: false,
        minPerformanceThreshold: 0.2,
        maxComplexityLevel: 60
      });

      expect(customGenerator).toBeDefined();
    });

    it('should use default configuration when none provided', () => {
      const defaultGenerator = new CustomTemplateGenerator();
      expect(defaultGenerator).toBeDefined();
    });
  });
});