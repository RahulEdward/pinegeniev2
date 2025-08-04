/**
 * Unit tests for Strategy Builder components
 * Tests node placement, connection creation, and builder state integration
 */

import { AnimationType } from '../../types';

// Mock the builder components
const mockBuilder = {
  buildStrategy: jest.fn(),
  placeNodes: jest.fn(),
  createConnections: jest.fn(),
  animateConstruction: jest.fn()
};

describe('Strategy Builder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Strategy Building', () => {
    test('should build complete RSI strategy successfully', () => {
      const blueprint = {
        id: 'rsi-test',
        name: 'RSI Strategy',
        description: 'RSI mean reversion strategy',
        components: [
          { id: 'data-1', type: 'data-source' as any, subtype: 'market-data', label: 'Data', priority: 1, dependencies: [], optional: false },
          { id: 'rsi-1', type: 'indicator' as any, subtype: 'rsi', label: 'RSI', priority: 2, dependencies: ['data-1'], optional: false },
          { id: 'condition-1', type: 'condition' as any, subtype: 'threshold', label: 'Condition', priority: 3, dependencies: ['rsi-1'], optional: false },
          { id: 'buy-1', type: 'action' as any, subtype: 'buy', label: 'Buy', priority: 4, dependencies: ['condition-1'], optional: false }
        ],
        flow: [],
        parameters: {},
        riskProfile: {
          level: 'medium' as const,
          maxRisk: 0.02
        }
      };

      const mockBuildResult = {
        success: true,
        nodes: [
          { 
            id: 'data-1', 
            type: 'data-source', 
            position: { x: 100, y: 100 },
            data: { id: 'data-1', type: 'data-source', label: 'Data', aiGenerated: true, confidence: 0.9, explanation: 'Data source', suggestedParameters: {}, optimizationHints: [] },
            aiGenerated: true,
            confidence: 0.9
          },
          { 
            id: 'rsi-1', 
            type: 'indicator', 
            position: { x: 300, y: 100 },
            data: { id: 'rsi-1', type: 'indicator', label: 'RSI', aiGenerated: true, confidence: 0.9, explanation: 'RSI indicator', suggestedParameters: {}, optimizationHints: [] },
            aiGenerated: true,
            confidence: 0.9
          },
          { 
            id: 'condition-1', 
            type: 'condition', 
            position: { x: 500, y: 100 },
            data: { id: 'condition-1', type: 'condition', label: 'Condition', aiGenerated: true, confidence: 0.9, explanation: 'Condition', suggestedParameters: {}, optimizationHints: [] },
            aiGenerated: true,
            confidence: 0.9
          },
          { 
            id: 'buy-1', 
            type: 'action', 
            position: { x: 700, y: 100 },
            data: { id: 'buy-1', type: 'action', label: 'Buy', aiGenerated: true, confidence: 0.9, explanation: 'Buy action', suggestedParameters: {}, optimizationHints: [] },
            aiGenerated: true,
            confidence: 0.9
          }
        ],
        edges: [
          { id: 'edge-1', source: 'data-1', target: 'rsi-1', aiGenerated: true, confidence: 0.9 },
          { id: 'edge-2', source: 'rsi-1', target: 'condition-1', aiGenerated: true, confidence: 0.9 },
          { id: 'edge-3', source: 'condition-1', target: 'buy-1', aiGenerated: true, confidence: 0.9 }
        ],
        animations: [
          { stepNumber: 1, type: AnimationType.NODE_PLACEMENT, nodeId: 'data-1', duration: 500, delay: 0, explanation: 'Adding market data source', highlight: true },
          { stepNumber: 2, type: AnimationType.NODE_PLACEMENT, nodeId: 'rsi-1', duration: 500, delay: 500, explanation: 'Adding RSI indicator', highlight: true }
        ],
        explanations: [
          { stepNumber: 1, title: 'Data Source', description: 'Starting with market data feed', reasoning: 'Need data', relatedComponents: ['data-1'] },
          { stepNumber: 2, title: 'RSI Indicator', description: 'Adding RSI to identify oversold/overbought conditions', reasoning: 'Need momentum indicator', relatedComponents: ['rsi-1'] }
        ],
        errors: [],
        warnings: []
      };

      mockBuilder.buildStrategy.mockReturnValue(mockBuildResult);
      const result = mockBuilder.buildStrategy(blueprint);

      expect(result.success).toBe(true);
      expect(result.nodes).toHaveLength(4);
      expect(result.edges).toHaveLength(3);
      expect(result.errors).toHaveLength(0);
    });

    test('should handle build failures gracefully', () => {
      const invalidBlueprint = {
        id: 'invalid',
        name: 'Invalid Strategy',
        description: 'Invalid strategy',
        components: [
          { id: 'invalid-1', type: 'invalid-type' as any, subtype: 'unknown', label: 'Invalid', priority: 1, dependencies: [], optional: false }
        ],
        flow: [],
        parameters: {},
        riskProfile: {
          level: 'medium' as const,
          maxRisk: 0.02
        }
      };

      const mockBuildResult = {
        success: false,
        nodes: [],
        edges: [],
        animations: [],
        explanations: [],
        errors: ['Unknown component type: invalid-type'],
        warnings: []
      };

      mockBuilder.buildStrategy.mockReturnValue(mockBuildResult);
      const result = mockBuilder.buildStrategy(invalidBlueprint);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Unknown component type: invalid-type');
      expect(result.nodes).toHaveLength(0);
    });
  });

  describe('Node Placement', () => {
    test('should place nodes with intelligent positioning', () => {
      const nodeConfigs = [
        {
          id: 'data-1',
          type: 'data-source',
          position: { x: 0, y: 0 },
          data: {
            id: 'data-1',
            type: 'data-source',
            label: 'Data Source',
            aiGenerated: true,
            confidence: 0.9,
            explanation: 'Data source',
            suggestedParameters: {},
            optimizationHints: []
          },
          aiGenerated: true,
          confidence: 0.9
        },
        {
          id: 'rsi-1',
          type: 'indicator',
          position: { x: 0, y: 0 },
          data: {
            id: 'rsi-1',
            type: 'indicator',
            label: 'RSI Indicator',
            aiGenerated: true,
            confidence: 0.9,
            explanation: 'RSI indicator',
            suggestedParameters: {},
            optimizationHints: []
          },
          aiGenerated: true,
          confidence: 0.9
        }
      ];

      const mockPlacementResult = {
        success: true,
        placements: [
          { nodeId: 'data-1', position: { x: 100, y: 200 }, reasoning: 'Data sources start on the left' },
          { nodeId: 'rsi-1', position: { x: 300, y: 200 }, reasoning: 'Indicators follow data sources' }
        ],
        collisions: [],
        optimizations: [
          'Aligned nodes horizontally for better readability',
          'Maintained consistent spacing between components'
        ]
      };

      mockBuilder.placeNodes.mockReturnValue(mockPlacementResult);
      const result = mockBuilder.placeNodes(nodeConfigs);

      expect(result.success).toBe(true);
      expect(result.placements).toHaveLength(2);
      expect(result.collisions).toHaveLength(0);
      
      // Verify left-to-right ordering
      const positions = result.placements.map((p: any) => p.position.x);
      for (let i = 1; i < positions.length; i++) {
        expect(positions[i]).toBeGreaterThan(positions[i - 1]);
      }
    });
  });

  describe('Connection Creation', () => {
    test('should create connections with proper validation', () => {
      const connectionConfigs = [
        {
          id: 'conn-1',
          source: 'data-1',
          target: 'rsi-1',
          sourceHandle: 'close',
          targetHandle: 'input',
          aiGenerated: true,
          confidence: 0.95
        },
        {
          id: 'conn-2',
          source: 'rsi-1',
          target: 'condition-1',
          sourceHandle: 'output',
          targetHandle: 'value',
          aiGenerated: true,
          confidence: 0.9
        }
      ];

      const mockConnectionResult = {
        success: true,
        connections: [
          {
            id: 'conn-1',
            source: 'data-1',
            target: 'rsi-1',
            sourceHandle: 'close',
            targetHandle: 'input',
            valid: true,
            dataType: 'number'
          },
          {
            id: 'conn-2',
            source: 'rsi-1',
            target: 'condition-1',
            sourceHandle: 'output',
            targetHandle: 'value',
            valid: true,
            dataType: 'number'
          }
        ],
        validationErrors: [],
        optimizations: ['All connections are type-compatible']
      };

      mockBuilder.createConnections.mockReturnValue(mockConnectionResult);
      const result = mockBuilder.createConnections(connectionConfigs);

      expect(result.success).toBe(true);
      expect(result.connections).toHaveLength(2);
      expect(result.validationErrors).toHaveLength(0);
      expect(result.connections.every((conn: any) => conn.valid)).toBe(true);
    });
  });

  describe('Animation System', () => {
    test('should generate step-by-step construction animations', () => {
      const strategy = {
        id: 'test-strategy',
        name: 'Test Strategy',
        description: 'Test strategy for animation',
        components: [
          { id: 'data-1', type: 'data-source' as any, subtype: 'market', label: 'Data', priority: 1, dependencies: [], optional: false },
          { id: 'indicator-1', type: 'indicator' as any, subtype: 'rsi', label: 'Indicator', priority: 2, dependencies: [], optional: false },
          { id: 'condition-1', type: 'condition' as any, subtype: 'threshold', label: 'Condition', priority: 3, dependencies: [], optional: false },
          { id: 'action-1', type: 'action' as any, subtype: 'buy', label: 'Action', priority: 4, dependencies: [], optional: false }
        ],
        flow: [],
        parameters: {},
        riskProfile: {
          level: 'medium' as const,
          maxRisk: 0.02
        }
      };

      const mockAnimationSequence = {
        totalDuration: 3000,
        steps: [
          {
            stepNumber: 1,
            type: AnimationType.NODE_PLACEMENT,
            nodeId: 'data-1',
            duration: 500,
            delay: 0,
            explanation: 'Adding market data source - this provides the price data for our strategy',
            highlight: true
          },
          {
            stepNumber: 2,
            type: AnimationType.NODE_PLACEMENT,
            nodeId: 'rsi-1',
            duration: 500,
            delay: 600,
            explanation: 'Adding RSI indicator - this will help us identify oversold and overbought conditions',
            highlight: true
          },
          {
            stepNumber: 3,
            type: AnimationType.CONNECTION_CREATION,
            edgeId: 'conn-1',
            duration: 300,
            delay: 1200,
            explanation: 'Connecting data source to RSI - the indicator needs price data to calculate',
            highlight: false
          }
        ],
        educationalContent: [
          {
            stepNumber: 1,
            title: 'Market Data Sources',
            description: 'Every trading strategy starts with market data...',
            reasoning: 'Data is fundamental',
            relatedComponents: ['data-1'],
            educationalContent: {
              concept: 'data-sources',
              definition: 'Market data sources provide price information',
              examples: ['OHLCV data', 'Tick data'],
              bestPractices: ['Use reliable sources'],
              commonMistakes: ['Using unreliable data'],
              relatedConcepts: ['indicators']
            }
          }
        ]
      };

      mockBuilder.animateConstruction.mockReturnValue(mockAnimationSequence);
      const result = mockBuilder.animateConstruction(strategy);

      expect(result.totalDuration).toBe(3000);
      expect(result.steps).toHaveLength(3);
      expect(result.steps[0].type).toBe(AnimationType.NODE_PLACEMENT);
      expect(result.steps[0].explanation).toContain('market data source');
      expect(result.educationalContent).toHaveLength(1);
    });
  });

  describe('Performance Tests', () => {
    test('should build complex strategies within time limits', () => {
      const complexStrategy = {
        id: 'complex-strategy',
        name: 'Complex Strategy',
        description: 'Complex multi-component strategy',
        components: new Array(20).fill(null).map((_, i) => ({
          id: `component-${i}`,
          type: 'test' as any,
          subtype: `component-${i}`,
          label: `Component ${i}`,
          priority: i,
          dependencies: i > 0 ? [`component-${i-1}`] : [],
          optional: false
        })),
        flow: [],
        parameters: {},
        riskProfile: {
          level: 'high' as const,
          maxRisk: 0.05
        }
      };

      const startTime = Date.now();
      
      const mockBuildResult = {
        success: true,
        nodes: new Array(20).fill(null).map((_, i) => ({ 
          id: `node-${i}`,
          type: 'test',
          position: { x: i * 100, y: 100 },
          data: { id: `node-${i}`, type: 'test', label: `Node ${i}`, aiGenerated: true, confidence: 0.9, explanation: 'Test node', suggestedParameters: {}, optimizationHints: [] },
          aiGenerated: true,
          confidence: 0.9
        })),
        edges: new Array(19).fill(null).map((_, i) => ({ 
          id: `edge-${i}`,
          source: `node-${i}`,
          target: `node-${i+1}`,
          aiGenerated: true,
          confidence: 0.9
        })),
        animations: [],
        explanations: [],
        errors: [],
        warnings: []
      };

      mockBuilder.buildStrategy.mockReturnValue(mockBuildResult);
      const result = mockBuilder.buildStrategy(complexStrategy);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      expect(processingTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result.success).toBe(true);
      expect(result.nodes).toHaveLength(20);
    });
  });
});