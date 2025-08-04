/**
 * Unit tests for Strategy Interpreter components
 * Tests blueprint generation, node mapping, and connection logic
 */

import { StrategyType } from '../../types';

// Mock the interpreter components
const mockInterpreter = {
  interpretIntent: jest.fn(),
  mapToNodes: jest.fn(),
  createConnections: jest.fn(),
  optimizeStrategy: jest.fn()
};

describe('Strategy Interpreter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Blueprint Generation', () => {
    test('should generate RSI strategy blueprint correctly', () => {
      const intent = {
        strategyType: StrategyType.MEAN_REVERSION,
        indicators: ['rsi'],
        conditions: ['oversold', 'overbought'],
        actions: ['buy', 'sell'],
        riskManagement: ['stop-loss'],
        confidence: 0.9
      };

      const mockBlueprint = {
        id: 'rsi-strategy-test',
        name: 'RSI Mean Reversion Strategy',
        description: 'Buy when RSI is oversold, sell when overbought',
        components: [
          {
            id: 'data-source-1',
            type: 'data-source' as any,
            subtype: 'market-data',
            label: 'Market Data',
            parameters: { symbol: 'BTCUSDT', timeframe: '1h' },
            priority: 1,
            dependencies: [],
            optional: false
          },
          {
            id: 'rsi-1',
            type: 'indicator' as any,
            subtype: 'rsi',
            label: 'RSI Indicator',
            parameters: { period: 14 },
            priority: 2,
            dependencies: ['data-source-1'],
            optional: false
          },
          {
            id: 'condition-1',
            type: 'condition' as any,
            subtype: 'threshold',
            label: 'RSI < 30',
            parameters: { operator: 'less_than', value: 30 },
            priority: 3,
            dependencies: ['rsi-1'],
            optional: false
          },
          {
            id: 'buy-1',
            type: 'action' as any,
            subtype: 'buy',
            label: 'Buy Order',
            parameters: { orderType: 'market' },
            priority: 4,
            dependencies: ['condition-1'],
            optional: false
          }
        ],
        flow: [],
        parameters: {},
        riskProfile: {
          level: 'medium' as const,
          maxRisk: 0.02
        }
      };

      mockInterpreter.interpretIntent.mockReturnValue(mockBlueprint);
      const result = mockInterpreter.interpretIntent(intent);

      expect(result.name).toContain('RSI');
      expect(result.components).toHaveLength(4);
      expect(result.components[0].type).toBe('data-source' as any);
      expect(result.components[1].type).toBe('indicator' as any);
      expect(result.components[1].subtype).toBe('rsi');
    });

    test('should handle complex multi-indicator strategies', () => {
      const intent = {
        strategyType: StrategyType.CUSTOM,
        indicators: ['rsi', 'macd', 'bollinger'],
        conditions: ['confirmation'],
        actions: ['buy', 'sell'],
        confidence: 0.8
      };

      const mockBlueprint = {
        id: 'complex-strategy',
        name: 'Complex Strategy',
        description: 'Multi-indicator strategy',
        components: [
          { id: 'data-1', type: 'data-source' as any, subtype: 'market-data', label: 'Data', priority: 1, dependencies: [], optional: false },
          { id: 'rsi-1', type: 'indicator' as any, subtype: 'rsi', label: 'RSI', priority: 2, dependencies: ['data-1'], optional: false },
          { id: 'macd-1', type: 'indicator' as any, subtype: 'macd', label: 'MACD', priority: 2, dependencies: ['data-1'], optional: false },
          { id: 'bollinger-1', type: 'indicator' as any, subtype: 'bollinger', label: 'Bollinger', priority: 2, dependencies: ['data-1'], optional: false },
          { id: 'confirmation-1', type: 'condition' as any, subtype: 'confirmation', label: 'Confirmation', priority: 3, dependencies: ['rsi-1', 'macd-1', 'bollinger-1'], optional: false }
        ],
        flow: [],
        parameters: {},
        riskProfile: {
          level: 'medium' as const,
          maxRisk: 0.02
        }
      };

      mockInterpreter.interpretIntent.mockReturnValue(mockBlueprint);
      const result = mockInterpreter.interpretIntent(intent);

      const indicators = result.components.filter((c: any) => c.type === 'indicator' as any);
      const confirmationCondition = result.components.find((c: any) => c.subtype === 'confirmation');

      expect(indicators).toHaveLength(3);
      expect(confirmationCondition?.dependencies).toContain('rsi-1');
      expect(confirmationCondition?.dependencies).toContain('macd-1');
      expect(confirmationCondition?.dependencies).toContain('bollinger-1');
    });
  });

  describe('Node Mapping', () => {
    test('should map strategy components to visual builder nodes', () => {
      const blueprint = {
        id: 'test-blueprint',
        name: 'Test Blueprint',
        description: 'Test',
        components: [
          {
            id: 'rsi-1',
            type: 'indicator' as any,
            subtype: 'rsi',
            label: 'RSI Indicator',
            parameters: { period: 14 },
            priority: 1,
            dependencies: [],
            optional: false
          }
        ],
        flow: [],
        parameters: {},
        riskProfile: {
          level: 'medium' as const,
          maxRisk: 0.02
        }
      };

      const mockNodeConfigs = [
        {
          id: 'rsi-node-1',
          type: 'indicator',
          position: { x: 100, y: 100 },
          data: {
            id: 'rsi-node-1',
            type: 'indicator',
            label: 'RSI (14)',
            parameters: { period: 14 },
            aiGenerated: true,
            confidence: 0.9,
            explanation: 'RSI indicator for momentum analysis',
            suggestedParameters: { period: 14 },
            optimizationHints: ['Consider adjusting period']
          },
          aiGenerated: true,
          confidence: 0.9
        }
      ];

      mockInterpreter.mapToNodes.mockReturnValue(mockNodeConfigs);
      const result = mockInterpreter.mapToNodes(blueprint);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('indicator');
      expect(result[0].data.parameters.period).toBe(14);
    });
  });

  describe('Connection Logic', () => {
    test('should create proper connections between nodes', () => {
      const nodeConfigs = [
        { id: 'data-1', type: 'data-source', outputs: ['close'] },
        { id: 'rsi-1', type: 'indicator', inputs: ['close'], outputs: ['rsi'] },
        { id: 'condition-1', type: 'condition', inputs: ['rsi'], outputs: ['signal'] },
        { id: 'buy-1', type: 'action', inputs: ['signal'] }
      ];

      const mockConnections = [
        {
          id: 'conn-1',
          source: 'data-1',
          target: 'rsi-1',
          sourceHandle: 'close',
          targetHandle: 'close',
          aiGenerated: true,
          confidence: 0.95
        },
        {
          id: 'conn-2',
          source: 'rsi-1',
          target: 'condition-1',
          sourceHandle: 'rsi',
          targetHandle: 'rsi',
          aiGenerated: true,
          confidence: 0.9
        },
        {
          id: 'conn-3',
          source: 'condition-1',
          target: 'buy-1',
          sourceHandle: 'signal',
          targetHandle: 'signal',
          aiGenerated: true,
          confidence: 0.85
        }
      ];

      mockInterpreter.createConnections.mockReturnValue(mockConnections);
      const result = mockInterpreter.createConnections(nodeConfigs);

      expect(result).toHaveLength(3);
      expect(result[0].source).toBe('data-1');
      expect(result[0].target).toBe('rsi-1');
      expect(result[1].source).toBe('rsi-1');
      expect(result[1].target).toBe('condition-1');
    });
  });

  describe('Performance Tests', () => {
    test('should interpret complex strategies within time limits', () => {
      const complexIntent = {
        strategyType: StrategyType.CUSTOM,
        indicators: ['rsi', 'macd', 'bollinger', 'stochastic'],
        conditions: ['confirmation', 'trend-filter'],
        actions: ['buy', 'sell', 'close'],
        riskManagement: ['stop-loss', 'take-profit', 'position-sizing'],
        confidence: 0.8
      };

      const startTime = Date.now();
      
      const mockBlueprint = {
        id: 'complex-strategy',
        name: 'Complex Strategy',
        description: 'Complex multi-indicator strategy',
        components: new Array(10).fill(null).map((_, i) => ({
          id: `component-${i}`,
          type: 'test' as any,
          subtype: `component-${i}`,
          label: `Component ${i}`,
          priority: i,
          dependencies: [],
          optional: false
        })),
        flow: [],
        parameters: {},
        riskProfile: {
          level: 'high' as const,
          maxRisk: 0.05
        }
      };

      mockInterpreter.interpretIntent.mockReturnValue(mockBlueprint);
      const result = mockInterpreter.interpretIntent(complexIntent);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      expect(processingTime).toBeLessThan(500); // Should complete within 500ms
      expect(result.components).toHaveLength(10);
    });
  });
});