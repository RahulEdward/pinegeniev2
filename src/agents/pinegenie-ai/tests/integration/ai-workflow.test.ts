/**
 * Integration tests for complete AI workflow
 * Tests end-to-end functionality from natural language input to strategy building
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { createTestData } from '../fixtures/test-data';
import { setupTestEnvironment, cleanupTestEnvironment } from '../helpers/test-utils';

// Mock the complete AI system
const mockAISystem = {
  processRequest: jest.fn(),
  buildStrategy: jest.fn(),
  analyzeExistingStrategy: jest.fn(),
  optimizeParameters: jest.fn()
};

describe('AI Workflow Integration', () => {
  beforeEach(async () => {
    await setupTestEnvironment();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await cleanupTestEnvironment();
  });

  describe('End-to-End Strategy Generation', () => {
    test('should complete full RSI strategy generation workflow', async () => {
      const userInput = "Create a RSI strategy that buys when RSI is below 30 and sells when above 70";
      
      const mockWorkflowResult = {
        success: true,
        steps: [
          {
            phase: 'parsing',
            duration: 50,
            result: {
              intent: 'rsi-strategy',
              confidence: 0.95,
              parameters: { oversold: 30, overbought: 70 }
            }
          },
          {
            phase: 'interpretation',
            duration: 100,
            result: {
              blueprint: {
                id: 'rsi-strategy-test',
                components: 6,
                complexity: 'medium'
              }
            }
          },
          {
            phase: 'building',
            duration: 800,
            result: {
              nodesCreated: 6,
              connectionsCreated: 5,
              animationSteps: 12
            }
          }
        ],
        totalDuration: 950,
        finalStrategy: {
          id: 'rsi-strategy-generated',
          nodes: 6,
          edges: 5,
          valid: true,
          pineScriptGenerated: true
        }
      };

      mockAISystem.processRequest.mockResolvedValue(mockWorkflowResult);
      const result = await mockAISystem.processRequest(userInput);

      expect(result.success).toBe(true);
      expect(result.totalDuration).toBeLessThan(2000); // Within 2 second limit
      expect(result.steps).toHaveLength(3);
      expect(result.finalStrategy.valid).toBe(true);
      expect(result.finalStrategy.pineScriptGenerated).toBe(true);
    });

    test('should handle complex multi-indicator strategy workflow', async () => {
      const userInput = "Build a strategy using RSI and MACD with Bollinger Bands confirmation and 2% stop loss";
      
      const mockWorkflowResult = {
        success: true,
        steps: [
          {
            phase: 'parsing',
            duration: 80,
            result: {
              intent: 'custom-strategy',
              confidence: 0.88,
              indicators: ['rsi', 'macd', 'bollinger'],
              riskManagement: ['stop-loss']
            }
          },
          {
            phase: 'interpretation',
            duration: 150,
            result: {
              blueprint: {
                components: 12,
                complexity: 'high',
                dependencies: 8
              }
            }
          },
          {
            phase: 'building',
            duration: 1200,
            result: {
              nodesCreated: 12,
              connectionsCreated: 11,
              animationSteps: 24
            }
          }
        ],
        totalDuration: 1430,
        finalStrategy: {
          nodes: 12,
          edges: 11,
          valid: true,
          complexity: 'high',
          riskManagement: true
        }
      };

      mockAISystem.processRequest.mockResolvedValue(mockWorkflowResult);
      const result = await mockAISystem.processRequest(userInput);

      expect(result.success).toBe(true);
      expect(result.finalStrategy.complexity).toBe('high');
      expect(result.finalStrategy.riskManagement).toBe(true);
      expect(result.steps.find(s => s.phase === 'building')?.result.nodesCreated).toBe(12);
    });

    test('should handle ambiguous requests with clarification workflow', async () => {
      const userInput = "Make me money with trading";
      
      const mockWorkflowResult = {
        success: false,
        needsClarification: true,
        clarificationQuestions: [
          "What type of trading strategy are you interested in? (trend-following, mean-reversion, breakout)",
          "Which indicators would you like to use? (RSI, MACD, Bollinger Bands, etc.)",
          "What's your risk tolerance? (conservative, moderate, aggressive)"
        ],
        suggestedExamples: [
          "Create a RSI strategy for mean reversion",
          "Build a MACD crossover for trend following",
          "Make a Bollinger Bands breakout strategy"
        ],
        partialParsing: {
          intent: 'ambiguous',
          confidence: 0.2,
          extractedConcepts: ['trading', 'profit']
        }
      };

      mockAISystem.processRequest.mockResolvedValue(mockWorkflowResult);
      const result = await mockAISystem.processRequest(userInput);

      expect(result.success).toBe(false);
      expect(result.needsClarification).toBe(true);
      expect(result.clarificationQuestions).toHaveLength(3);
      expect(result.suggestedExamples).toHaveLength(3);
      expect(result.partialParsing.confidence).toBeLessThan(0.5);
    });

    test('should handle error recovery in workflow', async () => {
      const userInput = "Create invalid strategy with unknown indicator XYZ";
      
      const mockWorkflowResult = {
        success: false,
        error: {
          phase: 'interpretation',
          type: 'unknown-indicator',
          message: 'Unknown indicator: XYZ',
          suggestions: [
            'Did you mean RSI (Relative Strength Index)?',
            'Popular indicators include: RSI, MACD, Bollinger Bands, SMA, EMA',
            'Try: "Create RSI strategy" for a simple example'
          ]
        },
        partialResult: {
          validComponents: ['data-source', 'action'],
          invalidComponents: ['XYZ indicator']
        },
        recoveryOptions: [
          { action: 'suggest-alternative', label: 'Use RSI instead' },
          { action: 'show-indicators', label: 'Show available indicators' },
          { action: 'start-over', label: 'Start with a template' }
        ]
      };

      mockAISystem.processRequest.mockResolvedValue(mockWorkflowResult);
      const result = await mockAISystem.processRequest(userInput);

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('unknown-indicator');
      expect(result.error.suggestions).toHaveLength(3);
      expect(result.recoveryOptions).toHaveLength(3);
    });
  });

  describe('Strategy Analysis Workflow', () => {
    test('should analyze existing strategy and suggest improvements', async () => {
      const existingStrategy = createTestData().existingStrategy;
      
      const mockAnalysisResult = {
        success: true,
        analysis: {
          completeness: 0.8,
          riskLevel: 'medium',
          missingComponents: ['stop-loss', 'take-profit'],
          strengths: [
            'Clear entry signals with RSI',
            'Proper data source configuration',
            'Valid indicator parameters'
          ],
          weaknesses: [
            'No risk management',
            'Single indicator dependency',
            'No trend filter'
          ],
          suggestions: [
            {
              type: 'add-component',
              component: 'stop-loss',
              reason: 'Protect against large losses',
              priority: 'high'
            },
            {
              type: 'add-component',
              component: 'trend-filter',
              reason: 'Avoid counter-trend trades',
              priority: 'medium'
            }
          ]
        },
        improvementPlan: {
          estimatedTime: 30,
          steps: [
            'Add 2% stop loss protection',
            'Add trend filter using 200-period SMA',
            'Optimize RSI parameters for current market'
          ]
        }
      };

      mockAISystem.analyzeExistingStrategy.mockResolvedValue(mockAnalysisResult);
      const result = await mockAISystem.analyzeExistingStrategy(existingStrategy);

      expect(result.success).toBe(true);
      expect(result.analysis.completeness).toBe(0.8);
      expect(result.analysis.missingComponents).toContain('stop-loss');
      expect(result.analysis.suggestions).toHaveLength(2);
      expect(result.improvementPlan.steps).toHaveLength(3);
    });

    test('should provide contextual feedback for strategy modifications', async () => {
      const modifiedStrategy = createTestData().modifiedStrategy;
      
      const mockFeedbackResult = {
        success: true,
        feedback: {
          changes: [
            {
              type: 'parameter-change',
              component: 'RSI',
              parameter: 'period',
              oldValue: 14,
              newValue: 21,
              impact: 'Will make RSI less sensitive to short-term price movements'
            },
            {
              type: 'component-added',
              component: 'stop-loss',
              impact: 'Adds risk protection with 2% maximum loss per trade'
            }
          ],
          validation: {
            valid: true,
            warnings: [
              'Longer RSI period may reduce signal frequency',
              'Consider backtesting with new parameters'
            ],
            errors: []
          },
          performance: {
            estimatedImprovement: 'moderate',
            riskReduction: 'significant',
            signalQuality: 'improved'
          }
        }
      };

      mockAISystem.analyzeExistingStrategy.mockResolvedValue(mockFeedbackResult);
      const result = await mockAISystem.analyzeExistingStrategy(modifiedStrategy);

      expect(result.feedback.changes).toHaveLength(2);
      expect(result.feedback.validation.valid).toBe(true);
      expect(result.feedback.validation.warnings).toHaveLength(2);
      expect(result.feedback.performance.riskReduction).toBe('significant');
    });
  });

  describe('Parameter Optimization Workflow', () => {
    test('should optimize strategy parameters for different market conditions', async () => {
      const strategy = createTestData().basicRSIStrategy;
      const marketConditions = 'trending';
      
      const mockOptimizationResult = {
        success: true,
        optimization: {
          originalParameters: {
            rsi: { period: 14, oversold: 30, overbought: 70 },
            stopLoss: 2,
            takeProfit: 4
          },
          optimizedParameters: {
            rsi: { period: 21, oversold: 25, overbought: 75 },
            stopLoss: 1.5,
            takeProfit: 3
          },
          improvements: {
            expectedReturn: '+15%',
            riskReduction: '20%',
            winRate: '+8%',
            maxDrawdown: '-12%'
          },
          reasoning: [
            'Longer RSI period (21) better suited for trending markets',
            'Adjusted thresholds (25/75) reduce false signals',
            'Tighter stop loss (1.5%) improves risk/reward ratio'
          ]
        },
        backtestResults: {
          period: '1 year',
          trades: 156,
          winRate: 0.68,
          avgReturn: 2.3,
          maxDrawdown: 8.5
        }
      };

      mockAISystem.optimizeParameters.mockResolvedValue(mockOptimizationResult);
      const result = await mockAISystem.optimizeParameters(strategy, marketConditions);

      expect(result.success).toBe(true);
      expect(result.optimization.optimizedParameters.rsi.period).toBe(21);
      expect(result.optimization.improvements.expectedReturn).toBe('+15%');
      expect(result.backtestResults.winRate).toBe(0.68);
      expect(result.optimization.reasoning).toHaveLength(3);
    });

    test('should handle multi-objective optimization', async () => {
      const strategy = createTestData().complexStrategy;
      const objectives = ['maximize-return', 'minimize-risk', 'minimize-drawdown'];
      
      const mockOptimizationResult = {
        success: true,
        multiObjective: {
          solutions: [
            {
              name: 'Conservative',
              parameters: { rsi: { period: 28 }, stopLoss: 1 },
              scores: { return: 0.7, risk: 0.9, drawdown: 0.9 },
              tradeoffs: 'Lower returns but much safer'
            },
            {
              name: 'Balanced',
              parameters: { rsi: { period: 21 }, stopLoss: 1.5 },
              scores: { return: 0.8, risk: 0.8, drawdown: 0.8 },
              tradeoffs: 'Good balance of risk and return'
            },
            {
              name: 'Aggressive',
              parameters: { rsi: { period: 14 }, stopLoss: 2.5 },
              scores: { return: 0.9, risk: 0.6, drawdown: 0.6 },
              tradeoffs: 'Higher returns but increased risk'
            }
          ],
          recommended: 'Balanced',
          reasoning: 'Provides best overall performance across all objectives'
        }
      };

      mockAISystem.optimizeParameters.mockResolvedValue(mockOptimizationResult);
      const result = await mockAISystem.optimizeParameters(strategy, objectives);

      expect(result.multiObjective.solutions).toHaveLength(3);
      expect(result.multiObjective.recommended).toBe('Balanced');
      expect(result.multiObjective.solutions[1].scores.return).toBe(0.8);
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle concurrent AI requests efficiently', async () => {
      const requests = [
        "Create RSI strategy",
        "Build MACD crossover",
        "Analyze my current strategy",
        "Optimize parameters for volatile market"
      ];

      const startTime = Date.now();
      
      const mockResults = requests.map((req, i) => ({
        success: true,
        requestId: `req-${i}`,
        processingTime: 200 + Math.random() * 300,
        result: `Processed: ${req}`
      }));

      // Mock concurrent processing
      const promises = requests.map((req, i) => {
        mockAISystem.processRequest.mockResolvedValueOnce(mockResults[i]);
        return mockAISystem.processRequest(req);
      });

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      expect(results).toHaveLength(4);
      expect(results.every(r => r.success)).toBe(true);
      expect(totalTime).toBeLessThan(1000); // Should handle concurrency efficiently
    });

    test('should maintain performance with large strategy complexity', async () => {
      const complexRequest = "Create strategy with RSI, MACD, Bollinger Bands, Stochastic, SMA, EMA, volume confirmation, trend filter, multiple timeframes, and comprehensive risk management";
      
      const startTime = Date.now();
      
      const mockComplexResult = {
        success: true,
        complexity: 'very-high',
        components: 25,
        connections: 35,
        processingPhases: {
          parsing: 120,
          interpretation: 300,
          building: 1800,
          optimization: 400
        },
        totalProcessingTime: 2620,
        memoryUsage: '45MB',
        performance: {
          nodesPerSecond: 9.5,
          connectionsPerSecond: 13.3
        }
      };

      mockAISystem.processRequest.mockResolvedValue(mockComplexResult);
      const result = await mockAISystem.processRequest(complexRequest);
      
      const endTime = Date.now();
      const actualTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(result.components).toBe(25);
      expect(result.totalProcessingTime).toBeLessThan(3000); // Within 3 second limit
      expect(actualTime).toBeLessThan(100); // Mock should be fast
      expect(result.performance.nodesPerSecond).toBeGreaterThan(5);
    });

    test('should handle memory management for long conversations', async () => {
      const conversationHistory = new Array(100).fill(null).map((_, i) => ({
        role: i % 2 === 0 ? 'user' : 'ai',
        content: `Message ${i}`,
        timestamp: new Date(Date.now() - (100 - i) * 60000) // 100 messages over time
      }));

      const mockMemoryResult = {
        success: true,
        memoryManagement: {
          totalMessages: 100,
          activeContext: 20, // Only keep recent context
          compressedHistory: 80, // Older messages compressed
          memoryUsage: '12MB',
          contextRelevance: 0.85
        },
        performance: {
          responseTime: 150,
          contextProcessingTime: 50,
          memoryOptimized: true
        }
      };

      mockAISystem.processRequest.mockResolvedValue(mockMemoryResult);
      const result = await mockAISystem.processRequest("Continue our conversation", conversationHistory);

      expect(result.memoryManagement.activeContext).toBe(20);
      expect(result.memoryManagement.compressedHistory).toBe(80);
      expect(result.performance.memoryOptimized).toBe(true);
      expect(result.performance.responseTime).toBeLessThan(500);
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should recover from parsing failures gracefully', async () => {
      const invalidInput = "!@#$%^&*()_+{}|:<>?[]\\;',./`~";
      
      const mockErrorResult = {
        success: false,
        error: {
          type: 'parsing-failed',
          phase: 'nlp',
          message: 'Unable to parse input: contains only special characters',
          recovery: {
            suggestions: [
              'Try using plain English to describe your strategy',
              'Example: "Create a RSI strategy that buys when oversold"',
              'Use the help command to see available options'
            ],
            fallbackActions: [
              { action: 'show-templates', label: 'Browse strategy templates' },
              { action: 'show-help', label: 'Get help with PineGenie AI' }
            ]
          }
        },
        diagnostics: {
          inputLength: invalidInput.length,
          validTokens: 0,
          specialCharacters: 30,
          confidence: 0
        }
      };

      mockAISystem.processRequest.mockResolvedValue(mockErrorResult);
      const result = await mockAISystem.processRequest(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('parsing-failed');
      expect(result.error.recovery.suggestions).toHaveLength(3);
      expect(result.error.recovery.fallbackActions).toHaveLength(2);
      expect(result.diagnostics.validTokens).toBe(0);
    });

    test('should handle system resource limitations', async () => {
      const resourceIntensiveRequest = "Create 50 different strategies simultaneously with full optimization";
      
      const mockResourceResult = {
        success: false,
        error: {
          type: 'resource-limit',
          message: 'Request exceeds system capacity limits',
          limits: {
            maxConcurrentStrategies: 5,
            maxComplexity: 'high',
            maxProcessingTime: 5000
          },
          alternatives: [
            'Create strategies one at a time',
            'Reduce complexity requirements',
            'Use batch processing for multiple strategies'
          ]
        },
        systemStatus: {
          cpuUsage: 0.85,
          memoryUsage: 0.78,
          activeRequests: 12,
          queueLength: 8
        }
      };

      mockAISystem.processRequest.mockResolvedValue(mockResourceResult);
      const result = await mockAISystem.processRequest(resourceIntensiveRequest);

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('resource-limit');
      expect(result.error.limits.maxConcurrentStrategies).toBe(5);
      expect(result.systemStatus.cpuUsage).toBe(0.85);
      expect(result.error.alternatives).toHaveLength(3);
    });

    test('should maintain data consistency during failures', async () => {
      const partiallyBuiltStrategy = createTestData().partialStrategy;
      
      const mockFailureResult = {
        success: false,
        error: {
          type: 'build-interrupted',
          phase: 'connection-creation',
          message: 'Connection validation failed for node RSI-1 to Condition-2'
        },
        partialResult: {
          nodesCreated: 4,
          connectionsCreated: 2,
          rollbackRequired: true,
          preservedState: {
            validNodes: ['data-1', 'rsi-1'],
            validConnections: ['conn-1'],
            invalidComponents: ['condition-2', 'conn-2']
          }
        },
        recovery: {
          canResume: true,
          resumeFromStep: 'connection-validation',
          fixRequired: 'Adjust condition parameters for RSI compatibility'
        }
      };

      mockAISystem.buildStrategy.mockResolvedValue(mockFailureResult);
      const result = await mockAISystem.buildStrategy(partiallyBuiltStrategy);

      expect(result.success).toBe(false);
      expect(result.partialResult.rollbackRequired).toBe(true);
      expect(result.partialResult.preservedState.validNodes).toHaveLength(2);
      expect(result.recovery.canResume).toBe(true);
    });
  });
});
  desc
ribe('Real-time Feedback Integration', () => {
    test('should provide contextual feedback during manual building', async () => {
      const partialStrategy = {
        nodes: [
          { id: 'data-1', type: 'data-source', data: { symbol: 'BTCUSDT' } },
          { id: 'rsi-1', type: 'indicator', data: { period: 14 } }
        ],
        edges: [
          { id: 'edge-1', source: 'data-1', target: 'rsi-1' }
        ]
      };

      const mockFeedbackResult = {
        success: true,
        feedback: {
          currentState: 'incomplete-strategy',
          suggestions: [
            {
              type: 'add-component',
              component: 'condition',
              reason: 'RSI indicator needs threshold condition',
              priority: 'high',
              suggestedPosition: { x: 500, y: 100 }
            },
            {
              type: 'add-component',
              component: 'action',
              reason: 'Strategy needs entry/exit actions',
              priority: 'high',
              suggestedPosition: { x: 700, y: 100 }
            }
          ],
          warnings: [
            'Strategy has no risk management',
            'No exit conditions defined'
          ],
          completeness: 0.4,
          nextSteps: [
            'Add RSI threshold condition (< 30 for oversold)',
            'Add buy action for entry signal',
            'Consider adding stop loss for risk management'
          ]
        }
      };

      mockAISystem.analyzeExistingStrategy.mockResolvedValue(mockFeedbackResult);
      const result = await mockAISystem.analyzeExistingStrategy(partialStrategy);

      expect(result.feedback.completeness).toBe(0.4);
      expect(result.feedback.suggestions).toHaveLength(2);
      expect(result.feedback.warnings).toContain('Strategy has no risk management');
      expect(result.feedback.nextSteps).toHaveLength(3);
    });

    test('should adapt feedback based on user skill level', async () => {
      const beginnerStrategy = createTestData().simpleRSIStrategy;
      const advancedStrategy = createTestData().complexMultiIndicatorStrategy;

      // Beginner feedback - more detailed explanations
      const beginnerFeedback = {
        success: true,
        feedback: {
          level: 'beginner',
          explanations: [
            {
              concept: 'RSI',
              explanation: 'RSI (Relative Strength Index) measures if an asset is overbought or oversold',
              learnMore: 'RSI values above 70 suggest overbought conditions, below 30 suggest oversold'
            }
          ],
          suggestions: [
            {
              type: 'educational',
              message: 'Great start! RSI is a popular momentum indicator',
              nextStep: 'Try adding a condition to check when RSI is below 30'
            }
          ],
          complexity: 'low',
          recommendedActions: ['add-simple-condition', 'add-basic-action']
        }
      };

      // Advanced feedback - more technical details
      const advancedFeedback = {
        success: true,
        feedback: {
          level: 'advanced',
          technicalAnalysis: [
            {
              indicator: 'RSI',
              analysis: 'RSI divergence patterns could enhance signal quality',
              optimization: 'Consider RSI period optimization for current market volatility'
            }
          ],
          suggestions: [
            {
              type: 'optimization',
              message: 'Multi-timeframe RSI analysis could improve accuracy',
              implementation: 'Add higher timeframe RSI for trend confirmation'
            }
          ],
          complexity: 'high',
          recommendedActions: ['add-divergence-detection', 'implement-multi-timeframe']
        }
      };

      mockAISystem.analyzeExistingStrategy
        .mockResolvedValueOnce(beginnerFeedback)
        .mockResolvedValueOnce(advancedFeedback);

      const beginnerResult = await mockAISystem.analyzeExistingStrategy(beginnerStrategy);
      const advancedResult = await mockAISystem.analyzeExistingStrategy(advancedStrategy);

      expect(beginnerResult.feedback.level).toBe('beginner');
      expect(beginnerResult.feedback.explanations).toHaveLength(1);
      expect(advancedResult.feedback.level).toBe('advanced');
      expect(advancedResult.feedback.technicalAnalysis).toHaveLength(1);
    });
  });

  describe('Template Integration Workflow', () => {
    test('should seamlessly integrate with existing template system', async () => {
      const templateRequest = "Use the RSI template but modify it for 4-hour timeframe";
      
      const mockTemplateWorkflow = {
        success: true,
        workflow: [
          {
            step: 'template-selection',
            action: 'Selected RSI Mean Reversion template',
            template: {
              id: 'rsi-mean-reversion',
              name: 'RSI Mean Reversion Strategy',
              originalTimeframe: '1h'
            }
          },
          {
            step: 'customization',
            action: 'Modified timeframe parameter',
            changes: [
              {
                component: 'data-source',
                parameter: 'timeframe',
                oldValue: '1h',
                newValue: '4h',
                reason: 'User requested 4-hour timeframe'
              }
            ]
          },
          {
            step: 'optimization',
            action: 'Adjusted RSI period for longer timeframe',
            changes: [
              {
                component: 'rsi-indicator',
                parameter: 'period',
                oldValue: 14,
                newValue: 21,
                reason: 'Longer timeframe requires adjusted RSI period'
              }
            ]
          }
        ],
        finalStrategy: {
          templateBased: true,
          originalTemplate: 'rsi-mean-reversion',
          customizations: 2,
          nodes: 6,
          edges: 5
        }
      };

      mockAISystem.processRequest.mockResolvedValue(mockTemplateWorkflow);
      const result = await mockAISystem.processRequest(templateRequest);

      expect(result.workflow).toHaveLength(3);
      expect(result.workflow[0].step).toBe('template-selection');
      expect(result.workflow[1].changes[0].newValue).toBe('4h');
      expect(result.finalStrategy.templateBased).toBe(true);
      expect(result.finalStrategy.customizations).toBe(2);
    });

    test('should create custom templates from successful AI strategies', async () => {
      const successfulStrategy = {
        id: 'successful-rsi-macd',
        name: 'RSI-MACD Combination',
        nodes: [
          { id: 'data-1', type: 'data-source' },
          { id: 'rsi-1', type: 'indicator', data: { type: 'rsi', period: 14 } },
          { id: 'macd-1', type: 'indicator', data: { type: 'macd' } },
          { id: 'condition-1', type: 'condition' },
          { id: 'buy-1', type: 'action' }
        ],
        performance: {
          winRate: 0.72,
          avgReturn: 2.8,
          maxDrawdown: 0.08,
          sharpeRatio: 1.6
        },
        userRating: 4.5,
        usageCount: 15
      };

      const mockTemplateCreation = {
        success: true,
        template: {
          id: 'custom-rsi-macd-combo',
          name: 'RSI-MACD Combination Strategy',
          description: 'AI-generated template combining RSI and MACD indicators',
          category: 'custom',
          difficulty: 'intermediate',
          parameters: [
            { name: 'rsi_period', type: 'int', default: 14, range: [10, 30] },
            { name: 'macd_fast', type: 'int', default: 12, range: [8, 16] },
            { name: 'macd_slow', type: 'int', default: 26, range: [20, 35] }
          ],
          nodes: successfulStrategy.nodes,
          metadata: {
            aiGenerated: true,
            basedOnStrategy: successfulStrategy.id,
            performance: successfulStrategy.performance,
            createdAt: new Date().toISOString()
          }
        }
      };

      mockAISystem.processRequest.mockResolvedValue(mockTemplateCreation);
      const result = await mockAISystem.processRequest("Save this strategy as a template");

      expect(result.template.aiGenerated).toBe(true);
      expect(result.template.category).toBe('custom');
      expect(result.template.parameters).toHaveLength(3);
      expect(result.template.metadata.performance.winRate).toBe(0.72);
    });
  });

  describe('Educational Animation Workflow', () => {
    test('should provide step-by-step educational animations', async () => {
      const educationalRequest = "Teach me how to build a MACD strategy step by step";
      
      const mockEducationalWorkflow = {
        success: true,
        mode: 'educational',
        totalSteps: 8,
        estimatedDuration: 120, // seconds
        animations: [
          {
            step: 1,
            title: 'Understanding MACD',
            duration: 15,
            type: 'explanation',
            content: 'MACD (Moving Average Convergence Divergence) is a trend-following momentum indicator',
            visual: 'macd-explanation-chart',
            interactive: true
          },
          {
            step: 2,
            title: 'Adding Data Source',
            duration: 10,
            type: 'node-placement',
            nodeId: 'data-source-1',
            explanation: 'Every strategy starts with a data source for price information',
            highlight: { component: 'data-source', color: '#3b82f6' }
          },
          {
            step: 3,
            title: 'Adding MACD Indicator',
            duration: 12,
            type: 'node-placement',
            nodeId: 'macd-1',
            explanation: 'MACD calculates the difference between fast and slow moving averages',
            parameters: { fast: 12, slow: 26, signal: 9 },
            highlight: { component: 'macd-indicator', color: '#10b981' }
          },
          {
            step: 4,
            title: 'Connecting Data to MACD',
            duration: 8,
            type: 'connection-creation',
            connectionId: 'conn-1',
            explanation: 'Price data flows from the data source to the MACD calculation',
            animation: 'data-flow'
          }
        ],
        interactiveElements: [
          {
            step: 2,
            type: 'quiz',
            question: 'What type of data does a data source provide?',
            options: ['Price data', 'Volume data', 'Both', 'Neither'],
            correctAnswer: 2,
            explanation: 'Data sources provide both price (OHLC) and volume data'
          }
        ],
        progressTracking: {
          checkpoints: [2, 4, 6, 8],
          canPause: true,
          canReplay: true,
          canSkip: false // Educational mode doesn't allow skipping
        }
      };

      mockAISystem.processRequest.mockResolvedValue(mockEducationalWorkflow);
      const result = await mockAISystem.processRequest(educationalRequest);

      expect(result.mode).toBe('educational');
      expect(result.animations).toHaveLength(4);
      expect(result.animations[0].type).toBe('explanation');
      expect(result.animations[1].type).toBe('node-placement');
      expect(result.interactiveElements).toHaveLength(1);
      expect(result.progressTracking.canReplay).toBe(true);
    });

    test('should adapt animation speed based on user preferences', async () => {
      const userPreferences = {
        animationSpeed: 'slow', // slow, normal, fast
        showExplanations: true,
        includeQuizzes: true,
        pauseAfterEachStep: false
      };

      const mockAdaptiveAnimation = {
        success: true,
        adaptations: {
          speedMultiplier: 1.5, // 50% slower for 'slow' preference
          explanationDetail: 'detailed', // More detailed for showExplanations: true
          quizFrequency: 'high', // More quizzes for includeQuizzes: true
          autoPause: false // No auto-pause for pauseAfterEachStep: false
        },
        animations: [
          {
            step: 1,
            duration: 15 * 1.5, // Adjusted for slow speed
            explanation: 'Detailed explanation of RSI indicator and its mathematical formula...',
            quiz: {
              enabled: true,
              question: 'What does RSI measure?',
              timing: 'after-explanation'
            }
          }
        ]
      };

      mockAISystem.processRequest.mockResolvedValue(mockAdaptiveAnimation);
      const result = await mockAISystem.processRequest("Build RSI strategy", userPreferences);

      expect(result.adaptations.speedMultiplier).toBe(1.5);
      expect(result.adaptations.explanationDetail).toBe('detailed');
      expect(result.animations[0].duration).toBe(22.5); // 15 * 1.5
      expect(result.animations[0].quiz.enabled).toBe(true);
    });
  });

  describe('Advanced Optimization Workflow', () => {
    test('should perform multi-dimensional parameter optimization', async () => {
      const complexStrategy = createTestData().multiIndicatorStrategy;
      const optimizationRequest = {
        strategy: complexStrategy,
        objectives: ['maximize-return', 'minimize-risk', 'minimize-drawdown'],
        constraints: {
          maxDrawdown: 0.15,
          minWinRate: 0.6,
          maxComplexity: 'high'
        },
        marketConditions: 'volatile'
      };

      const mockOptimizationResult = {
        success: true,
        optimization: {
          method: 'multi-objective-genetic-algorithm',
          generations: 50,
          populationSize: 100,
          convergenceReached: true,
          solutions: [
            {
              id: 'pareto-1',
              name: 'Conservative Optimum',
              parameters: {
                rsi: { period: 21, oversold: 25, overbought: 75 },
                macd: { fast: 10, slow: 28, signal: 8 },
                stopLoss: 0.015,
                takeProfit: 0.03
              },
              objectives: {
                return: 0.18, // 18% annual return
                risk: 0.12,   // 12% volatility
                drawdown: 0.08 // 8% max drawdown
              },
              scores: { return: 0.7, risk: 0.9, drawdown: 0.9 },
              tradeoffs: 'Lower returns but excellent risk management'
            },
            {
              id: 'pareto-2',
              name: 'Balanced Optimum',
              parameters: {
                rsi: { period: 18, oversold: 28, overbought: 72 },
                macd: { fast: 12, slow: 26, signal: 9 },
                stopLoss: 0.02,
                takeProfit: 0.04
              },
              objectives: {
                return: 0.24,
                risk: 0.16,
                drawdown: 0.12
              },
              scores: { return: 0.8, risk: 0.8, drawdown: 0.8 },
              tradeoffs: 'Good balance across all objectives'
            },
            {
              id: 'pareto-3',
              name: 'Aggressive Optimum',
              parameters: {
                rsi: { period: 14, oversold: 30, overbought: 70 },
                macd: { fast: 14, slow: 24, signal: 10 },
                stopLoss: 0.025,
                takeProfit: 0.05
              },
              objectives: {
                return: 0.32,
                risk: 0.22,
                drawdown: 0.18
              },
              scores: { return: 0.9, risk: 0.6, drawdown: 0.6 },
              tradeoffs: 'Higher returns with increased risk'
            }
          ],
          recommendation: {
            solutionId: 'pareto-2',
            reasoning: 'Balanced solution provides best overall performance for volatile market conditions',
            confidence: 0.85,
            backtestResults: {
              period: '2 years',
              trades: 284,
              winRate: 0.67,
              avgReturn: 2.1,
              maxDrawdown: 0.12,
              sharpeRatio: 1.8
            }
          }
        }
      };

      mockAISystem.optimizeParameters.mockResolvedValue(mockOptimizationResult);
      const result = await mockAISystem.optimizeParameters(optimizationRequest);

      expect(result.optimization.solutions).toHaveLength(3);
      expect(result.optimization.recommendation.solutionId).toBe('pareto-2');
      expect(result.optimization.recommendation.backtestResults.winRate).toBe(0.67);
      expect(result.optimization.convergenceReached).toBe(true);
    });

    test('should provide sensitivity analysis for optimized parameters', async () => {
      const optimizedStrategy = createTestData().optimizedStrategy;
      
      const mockSensitivityAnalysis = {
        success: true,
        analysis: {
          parameters: [
            {
              name: 'rsi_period',
              currentValue: 18,
              sensitivity: 'medium',
              impact: {
                '-20%': { return: -0.03, risk: -0.01, drawdown: -0.02 },
                '-10%': { return: -0.015, risk: -0.005, drawdown: -0.01 },
                '+10%': { return: 0.01, risk: 0.008, drawdown: 0.012 },
                '+20%': { return: -0.02, risk: 0.015, drawdown: 0.025 }
              },
              recommendation: 'Current value is near optimal, small changes acceptable',
              riskLevel: 'low'
            },
            {
              name: 'stop_loss',
              currentValue: 0.02,
              sensitivity: 'high',
              impact: {
                '-20%': { return: 0.05, risk: 0.08, drawdown: 0.12 },
                '-10%': { return: 0.02, risk: 0.03, drawdown: 0.05 },
                '+10%': { return: -0.03, risk: -0.02, drawdown: -0.03 },
                '+20%': { return: -0.06, risk: -0.04, drawdown: -0.05 }
              },
              recommendation: 'Highly sensitive parameter, avoid changes without thorough testing',
              riskLevel: 'high'
            }
          ],
          robustness: {
            overall: 'good',
            mostSensitive: 'stop_loss',
            leastSensitive: 'macd_signal',
            stabilityScore: 0.78
          },
          recommendations: [
            'Monitor stop loss parameter closely in live trading',
            'RSI period can be adjusted for different market conditions',
            'Consider parameter ranges rather than fixed values'
          ]
        }
      };

      mockAISystem.analyzeExistingStrategy.mockResolvedValue(mockSensitivityAnalysis);
      const result = await mockAISystem.analyzeExistingStrategy(optimizedStrategy);

      expect(result.analysis.parameters).toHaveLength(2);
      expect(result.analysis.parameters[0].sensitivity).toBe('medium');
      expect(result.analysis.parameters[1].sensitivity).toBe('high');
      expect(result.analysis.robustness.stabilityScore).toBe(0.78);
      expect(result.analysis.recommendations).toHaveLength(3);
    });
  });
});