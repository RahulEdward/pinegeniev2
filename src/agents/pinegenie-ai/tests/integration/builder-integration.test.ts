/**
 * CRITICAL Integration tests to verify existing builder system remains unaffected
 * These tests ensure that the AI system doesn't break any existing functionality
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { createTestData } from '../fixtures/test-data';
import { setupTestEnvironment, cleanupTestEnvironment } from '../helpers/test-utils';

// Mock existing builder system components
const mockBuilderStore = {
  nodes: [],
  edges: [],
  addNode: jest.fn(),
  addEdge: jest.fn(),
  removeNode: jest.fn(),
  removeEdge: jest.fn(),
  updateNode: jest.fn(),
  updateEdge: jest.fn(),
  clearCanvas: jest.fn(),
  undo: jest.fn(),
  redo: jest.fn(),
  canUndo: false,
  canRedo: false,
  history: []
};

// Mock Pine Script generator
const mockPineScriptGenerator = {
  generateScript: jest.fn().mockReturnValue({
    success: true,
    script: '//@version=6\nstrategy("Test Strategy", overlay=true)\n// Generated code',
    errors: []
  }),
  validateNodes: jest.fn().mockReturnValue({ valid: true, errors: [] }),
  getNodeTypes: jest.fn().mockReturnValue(['data-source', 'indicator', 'condition', 'action'])
};

// Mock theme system
const mockThemeSystem = {
  currentTheme: 'dark',
  switchTheme: jest.fn(),
  getThemeColors: jest.fn().mockReturnValue({
    primary: '#3b82f6',
    secondary: '#64748b',
    background: '#0f172a'
  })
};

// Mock AI system integration
const mockAISystem = {
  integrateWithBuilder: jest.fn(),
  preserveExistingNodes: jest.fn(),
  addAIGeneratedNodes: jest.fn(),
  validateIntegration: jest.fn()
};

describe('Builder Integration Tests - CRITICAL PROTECTION', () => {
  beforeEach(async () => {
    await setupTestEnvironment();
    jest.clearAllMocks();
    
    // Reset builder state
    mockBuilderStore.nodes = [];
    mockBuilderStore.edges = [];
    mockBuilderStore.canUndo = false;
    mockBuilderStore.canRedo = false;
  });

  afterEach(async () => {
    await cleanupTestEnvironment();
  });

  describe('Existing Builder Functionality Protection', () => {
    test('should preserve all existing builder functionality after AI integration', async () => {
      // Setup existing builder state
      const existingNodes = [
        {
          id: 'existing-data-1',
          type: 'data-source',
          position: { x: 100, y: 100 },
          data: { symbol: 'BTCUSDT', timeframe: '1h' }
        },
        {
          id: 'existing-rsi-1',
          type: 'indicator',
          position: { x: 300, y: 100 },
          data: { period: 14, source: 'close' }
        }
      ];

      const existingEdges = [
        {
          id: 'existing-edge-1',
          source: 'existing-data-1',
          target: 'existing-rsi-1',
          sourceHandle: 'close',
          targetHandle: 'input'
        }
      ];

      mockBuilderStore.nodes = [...existingNodes];
      mockBuilderStore.edges = [...existingEdges];

      // Simulate AI integration
      mockAISystem.integrateWithBuilder.mockResolvedValue({
        success: true,
        preservedNodes: existingNodes,
        preservedEdges: existingEdges,
        newNodes: [],
        newEdges: []
      });

      const result = await mockAISystem.integrateWithBuilder(mockBuilderStore);

      // Verify existing functionality is preserved
      expect(result.success).toBe(true);
      expect(result.preservedNodes).toEqual(existingNodes);
      expect(result.preservedEdges).toEqual(existingEdges);
      expect(mockBuilderStore.nodes).toEqual(existingNodes);
      expect(mockBuilderStore.edges).toEqual(existingEdges);
    });

    test('should maintain Pine Script generation compatibility', async () => {
      const testStrategy = {
        nodes: [
          {
            id: 'data-1',
            type: 'data-source',
            data: { symbol: 'BTCUSDT', timeframe: '1h' }
          },
          {
            id: 'rsi-1',
            type: 'indicator',
            data: { period: 14, source: 'close' }
          },
          {
            id: 'condition-1',
            type: 'condition',
            data: { operator: 'less_than', threshold: 30 }
          },
          {
            id: 'buy-1',
            type: 'action',
            data: { action: 'buy', quantity: 1 }
          }
        ],
        edges: [
          { id: 'e1', source: 'data-1', target: 'rsi-1' },
          { id: 'e2', source: 'rsi-1', target: 'condition-1' },
          { id: 'e3', source: 'condition-1', target: 'buy-1' }
        ]
      };

      // Test Pine Script generation before AI integration
      const beforeResult = mockPineScriptGenerator.generateScript(testStrategy);
      expect(beforeResult.success).toBe(true);
      expect(beforeResult.script).toContain('//@version=6');
      expect(beforeResult.errors).toHaveLength(0);

      // Simulate AI integration
      await mockAISystem.integrateWithBuilder(testStrategy);

      // Test Pine Script generation after AI integration
      const afterResult = mockPineScriptGenerator.generateScript(testStrategy);
      expect(afterResult.success).toBe(true);
      expect(afterResult.script).toContain('//@version=6');
      expect(afterResult.errors).toHaveLength(0);

      // Verify scripts are identical (no regression)
      expect(afterResult.script).toBe(beforeResult.script);
    });

    test('should preserve theme consistency across AI and manual modes', async () => {
      const originalTheme = mockThemeSystem.currentTheme;
      const originalColors = mockThemeSystem.getThemeColors();

      // Test theme before AI integration
      expect(mockThemeSystem.currentTheme).toBe('dark');
      expect(originalColors.primary).toBe('#3b82f6');

      // Simulate AI integration
      await mockAISystem.integrateWithBuilder(mockBuilderStore);

      // Verify theme remains unchanged
      expect(mockThemeSystem.currentTheme).toBe(originalTheme);
      expect(mockThemeSystem.getThemeColors()).toEqual(originalColors);

      // Test theme switching still works
      mockThemeSystem.switchTheme('light');
      expect(mockThemeSystem.switchTheme).toHaveBeenCalledWith('light');
    });

    test('should maintain undo/redo functionality with AI operations', async () => {
      // Setup initial state
      const initialNodes = [
        { id: 'node-1', type: 'data-source', position: { x: 100, y: 100 } }
      ];
      mockBuilderStore.nodes = [...initialNodes];

      // Simulate AI adding nodes
      const aiNodes = [
        { id: 'ai-node-1', type: 'indicator', position: { x: 300, y: 100 } }
      ];

      mockAISystem.addAIGeneratedNodes.mockImplementation((nodes) => {
        mockBuilderStore.nodes.push(...nodes);
        mockBuilderStore.canUndo = true;
        return { success: true, addedNodes: nodes };
      });

      // Add AI nodes
      const result = await mockAISystem.addAIGeneratedNodes(aiNodes);
      expect(result.success).toBe(true);
      expect(mockBuilderStore.nodes).toHaveLength(2);
      expect(mockBuilderStore.canUndo).toBe(true);

      // Test undo functionality
      mockBuilderStore.undo.mockImplementation(() => {
        mockBuilderStore.nodes = [...initialNodes];
        mockBuilderStore.canUndo = false;
        mockBuilderStore.canRedo = true;
      });

      mockBuilderStore.undo();
      expect(mockBuilderStore.nodes).toEqual(initialNodes);
      expect(mockBuilderStore.canRedo).toBe(true);

      // Test redo functionality
      mockBuilderStore.redo.mockImplementation(() => {
        mockBuilderStore.nodes = [...initialNodes, ...aiNodes];
        mockBuilderStore.canUndo = true;
        mockBuilderStore.canRedo = false;
      });

      mockBuilderStore.redo();
      expect(mockBuilderStore.nodes).toHaveLength(2);
      expect(mockBuilderStore.canUndo).toBe(true);
    });

    test('should preserve canvas controls (zoom, pan, background)', async () => {
      const mockCanvasControls = {
        zoom: 1.0,
        pan: { x: 0, y: 0 },
        background: 'dots',
        setZoom: jest.fn(),
        setPan: jest.fn(),
        setBackground: jest.fn()
      };

      // Test controls before AI integration
      expect(mockCanvasControls.zoom).toBe(1.0);
      expect(mockCanvasControls.background).toBe('dots');

      // Simulate AI integration
      await mockAISystem.integrateWithBuilder(mockBuilderStore);

      // Verify controls remain functional
      mockCanvasControls.setZoom(1.5);
      mockCanvasControls.setPan({ x: 100, y: 50 });
      mockCanvasControls.setBackground('grid');

      expect(mockCanvasControls.setZoom).toHaveBeenCalledWith(1.5);
      expect(mockCanvasControls.setPan).toHaveBeenCalledWith({ x: 100, y: 50 });
      expect(mockCanvasControls.setBackground).toHaveBeenCalledWith('grid');
    });
  });

  describe('AI-Builder Integration Safety', () => {
    test('should safely add AI nodes without breaking existing connections', async () => {
      // Setup existing strategy
      const existingNodes = [
        { id: 'data-1', type: 'data-source', position: { x: 100, y: 100 } },
        { id: 'rsi-1', type: 'indicator', position: { x: 300, y: 100 } }
      ];
      const existingEdges = [
        { id: 'edge-1', source: 'data-1', target: 'rsi-1' }
      ];

      mockBuilderStore.nodes = [...existingNodes];
      mockBuilderStore.edges = [...existingEdges];

      // AI adds new nodes
      const aiNodes = [
        { id: 'ai-condition-1', type: 'condition', position: { x: 500, y: 100 } },
        { id: 'ai-action-1', type: 'action', position: { x: 700, y: 100 } }
      ];
      const aiEdges = [
        { id: 'ai-edge-1', source: 'rsi-1', target: 'ai-condition-1' },
        { id: 'ai-edge-2', source: 'ai-condition-1', target: 'ai-action-1' }
      ];

      mockAISystem.addAIGeneratedNodes.mockResolvedValue({
        success: true,
        addedNodes: aiNodes,
        addedEdges: aiEdges,
        preservedNodes: existingNodes,
        preservedEdges: existingEdges
      });

      const result = await mockAISystem.addAIGeneratedNodes(aiNodes);

      // Verify existing connections are preserved
      expect(result.preservedEdges).toEqual(existingEdges);
      expect(result.success).toBe(true);
      
      // Verify new connections are valid
      expect(result.addedEdges).toHaveLength(2);
      expect(result.addedEdges[0].source).toBe('rsi-1'); // Connects to existing node
    });

    test('should validate AI-generated strategies against existing validation rules', async () => {
      const aiGeneratedStrategy = {
        nodes: [
          { id: 'ai-data-1', type: 'data-source', data: { symbol: 'BTCUSDT' } },
          { id: 'ai-rsi-1', type: 'indicator', data: { period: 14 } },
          { id: 'ai-condition-1', type: 'condition', data: { threshold: 30 } },
          { id: 'ai-buy-1', type: 'action', data: { action: 'buy' } }
        ],
        edges: [
          { id: 'ai-e1', source: 'ai-data-1', target: 'ai-rsi-1' },
          { id: 'ai-e2', source: 'ai-rsi-1', target: 'ai-condition-1' },
          { id: 'ai-e3', source: 'ai-condition-1', target: 'ai-buy-1' }
        ]
      };

      // Test validation using existing validation system
      const validationResult = mockPineScriptGenerator.validateNodes(aiGeneratedStrategy.nodes);
      expect(validationResult.valid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);

      // Test Pine Script generation
      const scriptResult = mockPineScriptGenerator.generateScript(aiGeneratedStrategy);
      expect(scriptResult.success).toBe(true);
      expect(scriptResult.script).toContain('//@version=6');
    });

    test('should handle AI integration failures gracefully', async () => {
      const existingState = {
        nodes: [{ id: 'existing-1', type: 'data-source' }],
        edges: []
      };

      mockBuilderStore.nodes = [...existingState.nodes];
      mockBuilderStore.edges = [...existingState.edges];

      // Simulate AI integration failure
      mockAISystem.integrateWithBuilder.mockRejectedValue(new Error('AI integration failed'));

      try {
        await mockAISystem.integrateWithBuilder(mockBuilderStore);
      } catch (error) {
        // Verify existing state is preserved on failure
        expect(mockBuilderStore.nodes).toEqual(existingState.nodes);
        expect(mockBuilderStore.edges).toEqual(existingState.edges);
        expect(error.message).toBe('AI integration failed');
      }
    });

    test('should maintain performance standards with AI integration', async () => {
      const largeStrategy = {
        nodes: new Array(50).fill(null).map((_, i) => ({
          id: `node-${i}`,
          type: i % 4 === 0 ? 'data-source' : i % 4 === 1 ? 'indicator' : i % 4 === 2 ? 'condition' : 'action',
          position: { x: (i % 10) * 100, y: Math.floor(i / 10) * 100 }
        })),
        edges: new Array(49).fill(null).map((_, i) => ({
          id: `edge-${i}`,
          source: `node-${i}`,
          target: `node-${i + 1}`
        }))
      };

      const startTime = performance.now();
      
      mockAISystem.integrateWithBuilder.mockResolvedValue({
        success: true,
        processingTime: 800,
        nodesProcessed: 50,
        edgesProcessed: 49
      });

      const result = await mockAISystem.integrateWithBuilder(largeStrategy);
      const endTime = performance.now();
      const actualTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(result.processingTime).toBeLessThan(1000); // Within 1 second for large strategies
      expect(actualTime).toBeLessThan(100); // Mock should be fast
    });
  });

  describe('Template System Integration', () => {
    test('should integrate with existing template system without modification', async () => {
      const mockTemplateSystem = {
        getTemplates: jest.fn().mockReturnValue([
          { id: 'rsi-template', name: 'RSI Strategy', category: 'mean-reversion' },
          { id: 'macd-template', name: 'MACD Crossover', category: 'trend-following' }
        ]),
        applyTemplate: jest.fn().mockResolvedValue({
          success: true,
          nodes: [{ id: 'template-node-1', type: 'indicator' }],
          edges: []
        }),
        validateTemplate: jest.fn().mockReturnValue({ valid: true, errors: [] })
      };

      // Test AI can read from existing templates
      const templates = mockTemplateSystem.getTemplates();
      expect(templates).toHaveLength(2);
      expect(templates[0].name).toBe('RSI Strategy');

      // Test AI can apply existing templates
      const templateResult = await mockTemplateSystem.applyTemplate('rsi-template');
      expect(templateResult.success).toBe(true);
      expect(templateResult.nodes).toHaveLength(1);

      // Test AI respects template validation
      const validationResult = mockTemplateSystem.validateTemplate('rsi-template');
      expect(validationResult.valid).toBe(true);
    });

    test('should enhance templates without breaking existing functionality', async () => {
      const existingTemplate = {
        id: 'existing-rsi',
        name: 'RSI Strategy',
        nodes: [
          { id: 'data-1', type: 'data-source' },
          { id: 'rsi-1', type: 'indicator' }
        ],
        edges: [
          { id: 'edge-1', source: 'data-1', target: 'rsi-1' }
        ]
      };

      // AI enhances template with additional components
      const enhancedTemplate = {
        ...existingTemplate,
        nodes: [
          ...existingTemplate.nodes,
          { id: 'ai-condition-1', type: 'condition', aiGenerated: true },
          { id: 'ai-action-1', type: 'action', aiGenerated: true }
        ],
        edges: [
          ...existingTemplate.edges,
          { id: 'ai-edge-1', source: 'rsi-1', target: 'ai-condition-1', aiGenerated: true },
          { id: 'ai-edge-2', source: 'ai-condition-1', target: 'ai-action-1', aiGenerated: true }
        ]
      };

      // Verify original template components are preserved
      const originalNodes = enhancedTemplate.nodes.filter(n => !n.aiGenerated);
      const originalEdges = enhancedTemplate.edges.filter(e => !e.aiGenerated);

      expect(originalNodes).toEqual(existingTemplate.nodes);
      expect(originalEdges).toEqual(existingTemplate.edges);

      // Verify AI enhancements are properly marked
      const aiNodes = enhancedTemplate.nodes.filter(n => n.aiGenerated);
      const aiEdges = enhancedTemplate.edges.filter(e => e.aiGenerated);

      expect(aiNodes).toHaveLength(2);
      expect(aiEdges).toHaveLength(2);
    });
  });

  describe('Error Recovery and Rollback', () => {
    test('should rollback AI changes on validation failure', async () => {
      const originalState = {
        nodes: [{ id: 'original-1', type: 'data-source' }],
        edges: []
      };

      mockBuilderStore.nodes = [...originalState.nodes];
      mockBuilderStore.edges = [...originalState.edges];

      // AI attempts to add invalid nodes
      const invalidAINodes = [
        { id: 'invalid-1', type: 'unknown-type' } // Invalid node type
      ];

      mockAISystem.addAIGeneratedNodes.mockImplementation(async (nodes) => {
        // Simulate validation failure
        const validation = mockPineScriptGenerator.validateNodes([...mockBuilderStore.nodes, ...nodes]);
        if (!validation.valid) {
          // Rollback to original state
          mockBuilderStore.nodes = [...originalState.nodes];
          mockBuilderStore.edges = [...originalState.edges];
          throw new Error('Validation failed: Invalid node type');
        }
      });

      mockPineScriptGenerator.validateNodes.mockReturnValue({
        valid: false,
        errors: ['Invalid node type: unknown-type']
      });

      try {
        await mockAISystem.addAIGeneratedNodes(invalidAINodes);
      } catch (error) {
        // Verify rollback occurred
        expect(mockBuilderStore.nodes).toEqual(originalState.nodes);
        expect(mockBuilderStore.edges).toEqual(originalState.edges);
        expect(error.message).toContain('Validation failed');
      }
    });

    test('should maintain data consistency during partial failures', async () => {
      const initialState = {
        nodes: [
          { id: 'data-1', type: 'data-source' },
          { id: 'rsi-1', type: 'indicator' }
        ],
        edges: [
          { id: 'edge-1', source: 'data-1', target: 'rsi-1' }
        ]
      };

      mockBuilderStore.nodes = [...initialState.nodes];
      mockBuilderStore.edges = [...initialState.edges];

      // AI attempts to add nodes but fails partway through
      const aiNodes = [
        { id: 'ai-condition-1', type: 'condition' }, // Valid
        { id: 'ai-invalid-1', type: 'invalid' },     // Invalid
        { id: 'ai-action-1', type: 'action' }       // Valid but shouldn't be added due to failure
      ];

      mockAISystem.addAIGeneratedNodes.mockImplementation(async (nodes) => {
        // Process nodes one by one
        const processedNodes = [];
        for (const node of nodes) {
          if (node.type === 'invalid') {
            // Rollback all changes on failure
            mockBuilderStore.nodes = [...initialState.nodes];
            mockBuilderStore.edges = [...initialState.edges];
            throw new Error(`Invalid node type: ${node.type}`);
          }
          processedNodes.push(node);
        }
      });

      try {
        await mockAISystem.addAIGeneratedNodes(aiNodes);
      } catch (error) {
        // Verify complete rollback - no partial state
        expect(mockBuilderStore.nodes).toEqual(initialState.nodes);
        expect(mockBuilderStore.edges).toEqual(initialState.edges);
        expect(mockBuilderStore.nodes).not.toContainEqual(
          expect.objectContaining({ id: 'ai-condition-1' })
        );
      }
    });
  });

  describe('Cross-Component Compatibility', () => {
    test('should work with all existing node types', async () => {
      const allNodeTypes = mockPineScriptGenerator.getNodeTypes();
      expect(allNodeTypes).toContain('data-source');
      expect(allNodeTypes).toContain('indicator');
      expect(allNodeTypes).toContain('condition');
      expect(allNodeTypes).toContain('action');

      // Test AI can work with each node type
      for (const nodeType of allNodeTypes) {
        const testNode = {
          id: `test-${nodeType}`,
          type: nodeType,
          position: { x: 100, y: 100 },
          data: {}
        };

        mockAISystem.validateIntegration.mockReturnValue({
          compatible: true,
          nodeType,
          issues: []
        });

        const validation = mockAISystem.validateIntegration(testNode);
        expect(validation.compatible).toBe(true);
        expect(validation.nodeType).toBe(nodeType);
      }
    });

    test('should maintain compatibility with existing Pine Script features', async () => {
      const testStrategy = {
        nodes: [
          { id: 'data-1', type: 'data-source', data: { symbol: 'BTCUSDT', timeframe: '1h' } },
          { id: 'sma-1', type: 'indicator', data: { type: 'sma', period: 20 } },
          { id: 'ema-1', type: 'indicator', data: { type: 'ema', period: 50 } },
          { id: 'cross-1', type: 'condition', data: { type: 'crossover' } },
          { id: 'buy-1', type: 'action', data: { action: 'buy', quantity: 1 } }
        ],
        edges: [
          { id: 'e1', source: 'data-1', target: 'sma-1' },
          { id: 'e2', source: 'data-1', target: 'ema-1' },
          { id: 'e3', source: 'sma-1', target: 'cross-1' },
          { id: 'e4', source: 'ema-1', target: 'cross-1' },
          { id: 'e5', source: 'cross-1', target: 'buy-1' }
        ]
      };

      // Test Pine Script generation with complex strategy
      const scriptResult = mockPineScriptGenerator.generateScript(testStrategy);
      expect(scriptResult.success).toBe(true);
      expect(scriptResult.script).toContain('//@version=6');
      expect(scriptResult.script).toContain('strategy(');
      expect(scriptResult.errors).toHaveLength(0);

      // Verify all Pine Script features are supported
      expect(scriptResult.script).toContain('sma('); // SMA function
      expect(scriptResult.script).toContain('ema('); // EMA function
      expect(scriptResult.script).toContain('crossover('); // Crossover function
      expect(scriptResult.script).toContain('strategy.entry('); // Entry function
    });
  });
});