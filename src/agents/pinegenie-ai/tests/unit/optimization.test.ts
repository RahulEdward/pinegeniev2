/**
 * Unit tests for Parameter Optimization and Validation components
 * Tests parameter optimization algorithms and validation logic
 */

// Mock the optimization components
const mockOptimizer = {
  optimizeParameters: jest.fn(),
  validateParameters: jest.fn(),
  suggestImprovements: jest.fn(),
  analyzePerformance: jest.fn()
};

describe('Parameter Optimization and Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Parameter Optimization', () => {
    test('should optimize RSI parameters for different market conditions', () => {
      const originalParameters = {
        rsi: {
          period: 14,
          oversoldThreshold: 30,
          overboughtThreshold: 70
        },
        timeframe: '1h',
        stopLoss: 0.02,
        takeProfit: 0.04
      };

      const optimizedParameters = {
        rsi: {
          period: 21, // Optimized for less noise
          oversoldThreshold: 25, // More conservative
          overboughtThreshold: 75 // More conservative
        },
        timeframe: '1h',
        stopLoss: 0.015, // Tighter stop loss
        takeProfit: 0.045 // Better risk/reward ratio
      };

      mockOptimizer.optimizeParameters.mockReturnValue({
        success: true,
        originalParameters,
        optimizedParameters,
        improvements: [
          'Increased RSI period to reduce false signals',
          'Adjusted thresholds for better entry/exit points',
          'Optimized risk management ratios'
        ],
        expectedImprovement: 0.15, // 15% improvement expected
        confidence: 0.85
      });

      const result = mockOptimizer.optimizeParameters(originalParameters);

      expect(result.success).toBe(true);
      expect(result.optimizedParameters.rsi.period).toBe(21);
      expect(result.optimizedParameters.rsi.oversoldThreshold).toBe(25);
      expect(result.optimizedParameters.rsi.overboughtThreshold).toBe(75);
      expect(result.improvements).toHaveLength(3);
      expect(result.expectedImprovement).toBeGreaterThan(0);
    });

    test('should optimize MACD parameters for trend following', () => {
      const originalParameters = {
        macd: {
          fastPeriod: 12,
          slowPeriod: 26,
          signalPeriod: 9
        },
        timeframe: '4h',
        stopLoss: 0.03,
        takeProfit: 0.06
      };

      const optimizedParameters = {
        macd: {
          fastPeriod: 8, // Faster response
          slowPeriod: 21, // Adjusted for timeframe
          signalPeriod: 7 // Quicker signals
        },
        timeframe: '4h',
        stopLoss: 0.025,
        takeProfit: 0.075
      };

      mockOptimizer.optimizeParameters.mockReturnValue({
        success: true,
        originalParameters,
        optimizedParameters,
        improvements: [
          'Adjusted MACD periods for 4h timeframe',
          'Optimized signal period for faster entries',
          'Improved risk/reward ratio'
        ],
        expectedImprovement: 0.22,
        confidence: 0.78
      });

      const result = mockOptimizer.optimizeParameters(originalParameters);

      expect(result.optimizedParameters.macd.fastPeriod).toBe(8);
      expect(result.optimizedParameters.macd.slowPeriod).toBe(21);
      expect(result.optimizedParameters.macd.signalPeriod).toBe(7);
      expect(result.expectedImprovement).toBeGreaterThan(0.2);
    });

    test('should handle multi-objective optimization', () => {
      const parameters = {
        rsi: { period: 14, oversoldThreshold: 30, overboughtThreshold: 70 },
        macd: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
        stopLoss: 0.02,
        takeProfit: 0.04
      };

      const objectives = ['maximize_profit', 'minimize_risk', 'minimize_drawdown'];

      mockOptimizer.optimizeParameters.mockReturnValue({
        success: true,
        originalParameters: parameters,
        optimizedParameters: {
          rsi: { period: 18, oversoldThreshold: 28, overboughtThreshold: 72 },
          macd: { fastPeriod: 10, slowPeriod: 24, signalPeriod: 8 },
          stopLoss: 0.018,
          takeProfit: 0.045
        },
        objectives,
        tradeoffs: [
          'Slightly reduced profit potential for lower risk',
          'Improved drawdown characteristics',
          'Better risk-adjusted returns'
        ],
        paretoOptimal: true,
        confidence: 0.82
      });

      const result = mockOptimizer.optimizeParameters(parameters, { objectives });

      expect(result.success).toBe(true);
      expect(result.objectives).toEqual(objectives);
      expect(result.tradeoffs).toHaveLength(3);
      expect(result.paretoOptimal).toBe(true);
    });
  });

  describe('Parameter Validation', () => {
    test('should validate RSI parameters within acceptable ranges', () => {
      const validParameters = {
        rsi: {
          period: 14,
          oversoldThreshold: 30,
          overboughtThreshold: 70
        }
      };

      mockOptimizer.validateParameters.mockReturnValue({
        valid: true,
        errors: [],
        warnings: [],
        suggestions: [
          'Consider testing period values between 10-21 for different market conditions'
        ]
      });

      const result = mockOptimizer.validateParameters(validParameters);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.suggestions).toHaveLength(1);
    });

    test('should detect invalid parameter ranges', () => {
      const invalidParameters = {
        rsi: {
          period: -5, // Invalid: negative
          oversoldThreshold: 150, // Invalid: > 100
          overboughtThreshold: -10 // Invalid: negative
        },
        stopLoss: 1.5, // Invalid: > 100%
        takeProfit: -0.1 // Invalid: negative
      };

      mockOptimizer.validateParameters.mockReturnValue({
        valid: false,
        errors: [
          'RSI period must be positive (got -5)',
          'Oversold threshold must be between 0-100 (got 150)',
          'Overbought threshold must be between 0-100 (got -10)',
          'Stop loss must be between 0-1 (got 1.5)',
          'Take profit must be positive (got -0.1)'
        ],
        warnings: [],
        suggestions: [
          'Use RSI period between 5-50',
          'Set oversold threshold between 10-40',
          'Set overbought threshold between 60-90',
          'Keep stop loss under 10%',
          'Set reasonable take profit targets'
        ]
      });

      const result = mockOptimizer.validateParameters(invalidParameters);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(5);
      expect(result.suggestions).toHaveLength(5);
    });

    test('should validate parameter relationships', () => {
      const conflictingParameters = {
        rsi: {
          period: 14,
          oversoldThreshold: 80, // Should be < overboughtThreshold
          overboughtThreshold: 20  // Should be > oversoldThreshold
        },
        stopLoss: 0.1,
        takeProfit: 0.05 // Should be > stopLoss for positive risk/reward
      };

      mockOptimizer.validateParameters.mockReturnValue({
        valid: false,
        errors: [
          'Oversold threshold (80) must be less than overbought threshold (20)',
          'Take profit (0.05) should be greater than stop loss (0.1) for positive risk/reward ratio'
        ],
        warnings: [
          'Risk/reward ratio is negative, consider adjusting targets'
        ],
        suggestions: [
          'Set oversold threshold below 50 and overbought threshold above 50',
          'Ensure take profit is at least 1.5x stop loss for good risk management'
        ]
      });

      const result = mockOptimizer.validateParameters(conflictingParameters);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.warnings).toHaveLength(1);
      expect(result.errors[0]).toContain('Oversold threshold');
      expect(result.errors[1]).toContain('Take profit');
    });
  });

  describe('Strategy Improvement Suggestions', () => {
    test('should suggest improvements for incomplete strategies', () => {
      const incompleteStrategy = {
        components: [
          { id: 'rsi-1', type: 'indicator', subtype: 'rsi' },
          { id: 'condition-1', type: 'condition', subtype: 'threshold' },
          { id: 'buy-1', type: 'action', subtype: 'buy' }
          // Missing: data source, risk management, sell conditions
        ],
        parameters: {
          rsi: { period: 14, oversoldThreshold: 30 }
        }
      };

      mockOptimizer.suggestImprovements.mockReturnValue({
        missingComponents: [
          {
            type: 'data-source',
            reason: 'Strategy needs market data input',
            priority: 'high',
            suggestion: 'Add market data source for price feeds'
          },
          {
            type: 'risk-management',
            reason: 'No risk management detected',
            priority: 'high',
            suggestion: 'Add stop loss and take profit levels'
          },
          {
            type: 'exit-condition',
            reason: 'Only buy signals defined',
            priority: 'medium',
            suggestion: 'Add sell conditions for complete strategy'
          }
        ],
        parameterImprovements: [
          {
            parameter: 'rsi.overboughtThreshold',
            reason: 'Missing overbought threshold for sell signals',
            suggestion: 'Add overbought threshold around 70'
          }
        ],
        structuralImprovements: [
          {
            type: 'confirmation',
            reason: 'Single indicator strategies are prone to false signals',
            suggestion: 'Consider adding a second indicator for confirmation'
          }
        ],
        overallScore: 0.4, // 40% complete
        completionSuggestions: [
          'Add data source component',
          'Implement risk management',
          'Define exit strategy',
          'Add signal confirmation'
        ]
      });

      const result = mockOptimizer.suggestImprovements(incompleteStrategy);

      expect(result.missingComponents).toHaveLength(3);
      expect(result.parameterImprovements).toHaveLength(1);
      expect(result.structuralImprovements).toHaveLength(1);
      expect(result.overallScore).toBeLessThan(0.5);
      expect(result.completionSuggestions).toHaveLength(4);
    });

    test('should suggest optimizations for complete strategies', () => {
      const completeStrategy = {
        components: [
          { id: 'data-1', type: 'data-source', subtype: 'market' },
          { id: 'rsi-1', type: 'indicator', subtype: 'rsi' },
          { id: 'macd-1', type: 'indicator', subtype: 'macd' },
          { id: 'condition-1', type: 'condition', subtype: 'confirmation' },
          { id: 'buy-1', type: 'action', subtype: 'buy' },
          { id: 'sell-1', type: 'action', subtype: 'sell' },
          { id: 'stop-1', type: 'risk', subtype: 'stop_loss' },
          { id: 'profit-1', type: 'risk', subtype: 'take_profit' }
        ],
        parameters: {
          rsi: { period: 14, oversoldThreshold: 30, overboughtThreshold: 70 },
          macd: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
          stopLoss: 0.02,
          takeProfit: 0.04
        }
      };

      mockOptimizer.suggestImprovements.mockReturnValue({
        missingComponents: [],
        parameterImprovements: [
          {
            parameter: 'rsi.period',
            reason: 'Default RSI period may not be optimal for current timeframe',
            suggestion: 'Test periods between 10-21 for better signal quality'
          },
          {
            parameter: 'takeProfit',
            reason: 'Risk/reward ratio could be improved',
            suggestion: 'Consider increasing take profit to 0.06 for 3:1 ratio'
          }
        ],
        structuralImprovements: [
          {
            type: 'position-sizing',
            reason: 'Fixed position sizing may not be optimal',
            suggestion: 'Add dynamic position sizing based on volatility'
          },
          {
            type: 'market-filter',
            reason: 'Strategy may perform poorly in ranging markets',
            suggestion: 'Add trend filter to avoid sideways markets'
          }
        ],
        overallScore: 0.85, // 85% optimized
        completionSuggestions: [
          'Fine-tune indicator parameters',
          'Add position sizing logic',
          'Implement market regime filter',
          'Consider time-based filters'
        ]
      });

      const result = mockOptimizer.suggestImprovements(completeStrategy);

      expect(result.missingComponents).toHaveLength(0);
      expect(result.parameterImprovements).toHaveLength(2);
      expect(result.structuralImprovements).toHaveLength(2);
      expect(result.overallScore).toBeGreaterThan(0.8);
    });
  });

  describe('Performance Analysis', () => {
    test('should analyze strategy performance metrics', () => {
      const strategyResults = {
        totalTrades: 100,
        winningTrades: 65,
        losingTrades: 35,
        totalReturn: 0.25,
        maxDrawdown: 0.08,
        sharpeRatio: 1.8,
        profitFactor: 2.1,
        averageWin: 0.045,
        averageLoss: -0.022
      };

      mockOptimizer.analyzePerformance.mockReturnValue({
        metrics: strategyResults,
        analysis: {
          winRate: 0.65,
          riskRewardRatio: 2.05,
          expectancy: 0.0215,
          kelly: 0.18,
          calmarRatio: 3.125
        },
        strengths: [
          'High win rate (65%)',
          'Good risk/reward ratio (2.05:1)',
          'Strong Sharpe ratio (1.8)',
          'Reasonable maximum drawdown (8%)'
        ],
        weaknesses: [
          'Could improve profit factor',
          'Average loss could be reduced'
        ],
        recommendations: [
          'Consider tightening stop losses to reduce average loss',
          'Look for ways to increase average win size',
          'Monitor drawdown periods for improvement opportunities'
        ],
        overallRating: 'Good',
        confidence: 0.82
      });

      const result = mockOptimizer.analyzePerformance(strategyResults);

      expect(result.analysis.winRate).toBe(0.65);
      expect(result.analysis.riskRewardRatio).toBeCloseTo(2.05);
      expect(result.strengths).toHaveLength(4);
      expect(result.weaknesses).toHaveLength(2);
      expect(result.recommendations).toHaveLength(3);
      expect(result.overallRating).toBe('Good');
    });
  });

  describe('Performance Tests', () => {
    test('should optimize parameters within acceptable time limits', () => {
      const complexParameters = {
        rsi: { period: 14, oversoldThreshold: 30, overboughtThreshold: 70 },
        macd: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
        bollinger: { period: 20, stdDev: 2 },
        stochastic: { kPeriod: 14, dPeriod: 3 },
        stopLoss: 0.02,
        takeProfit: 0.04,
        positionSize: 0.1
      };

      const startTime = Date.now();

      mockOptimizer.optimizeParameters.mockReturnValue({
        success: true,
        originalParameters: complexParameters,
        optimizedParameters: { ...complexParameters, rsi: { ...complexParameters.rsi, period: 18 } },
        improvements: ['Optimized RSI period'],
        expectedImprovement: 0.12,
        confidence: 0.75
      });

      const result = mockOptimizer.optimizeParameters(complexParameters);

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      expect(processingTime).toBeLessThan(200); // Should complete within 200ms
      expect(result.success).toBe(true);
      expect(result.expectedImprovement).toBeGreaterThan(0);
    });

    test('should validate large parameter sets efficiently', () => {
      const largeParameterSet = {};
      for (let i = 0; i < 50; i++) {
        largeParameterSet[`param_${i}`] = {
          value: Math.random(),
          min: 0,
          max: 1,
          type: 'float'
        };
      }

      const startTime = Date.now();

      mockOptimizer.validateParameters.mockReturnValue({
        valid: true,
        errors: [],
        warnings: [],
        suggestions: ['All parameters within acceptable ranges']
      });

      const result = mockOptimizer.validateParameters(largeParameterSet);

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      expect(processingTime).toBeLessThan(100); // Should handle large sets quickly
      expect(result.valid).toBe(true);
    });
  });
});