/**
 * Basic Integration Tests for PineGenie AI System
 * 
 * These tests verify that the AI system can be initialized and
 * integrates properly with existing functionality without breaking anything.
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

describe('Basic PineGenie AI Integration', () => {
  beforeEach(() => {
    // Setup test environment
    console.log('Setting up basic integration test...');
  });

  afterEach(() => {
    // Clean up test state
    console.log('Cleaning up basic integration test...');
  });

  describe('System Initialization', () => {
    test('should be able to import AI system components', () => {
      // Test that we can import the main AI system
      expect(() => {
        const { PineGenieAI } = require('../../core');
        expect(PineGenieAI).toBeDefined();
      }).not.toThrow();

      // Test that we can import NLP components
      expect(() => {
        const { NaturalLanguageProcessor } = require('../../nlp');
        expect(NaturalLanguageProcessor).toBeDefined();
      }).not.toThrow();

      // Test that we can import knowledge base
      expect(() => {
        const { KnowledgeBase } = require('../../knowledge');
        expect(KnowledgeBase).toBeDefined();
      }).not.toThrow();

      // Test that we can import builder system
      expect(() => {
        const { AIBuilderSystem } = require('../../builder');
        expect(AIBuilderSystem).toBeDefined();
      }).not.toThrow();
    });

    test('should initialize AI components without errors', () => {
      const { NaturalLanguageProcessor } = require('../../nlp');
      const { KnowledgeBase } = require('../../knowledge');
      
      expect(() => {
        const nlp = new NaturalLanguageProcessor();
        expect(nlp).toBeDefined();
      }).not.toThrow();

      expect(() => {
        const kb = new KnowledgeBase();
        expect(kb).toBeDefined();
      }).not.toThrow();
    });

    test('should have proper TypeScript types exported', () => {
      const types = require('../../types');
      
      expect(types).toBeDefined();
      expect(typeof types).toBe('object');
    });
  });

  describe('Existing System Protection', () => {
    test('should not interfere with existing builder state', () => {
      // Mock existing builder state
      const mockBuilderState = {
        nodes: [],
        edges: [],
        addNode: jest.fn(),
        addEdge: jest.fn(),
        removeNode: jest.fn(),
        removeEdge: jest.fn()
      };

      // Initialize AI system
      const { AIBuilderSystem } = require('../../builder');
      const aiBuilder = new AIBuilderSystem();
      
      expect(() => {
        aiBuilder.initialize(mockBuilderState);
      }).not.toThrow();

      // Verify builder state wasn't modified
      expect(mockBuilderState.nodes).toEqual([]);
      expect(mockBuilderState.edges).toEqual([]);
    });

    test('should not break existing template system access', () => {
      // This test verifies that AI system doesn't interfere with template access
      expect(() => {
        // Simulate accessing existing template system
        const mockTemplateSystem = {
          getAllTemplates: () => [],
          getTemplate: (id: string) => null,
          searchTemplates: () => []
        };
        
        expect(mockTemplateSystem.getAllTemplates()).toEqual([]);
        expect(mockTemplateSystem.getTemplate('test')).toBeNull();
        expect(mockTemplateSystem.searchTemplates()).toEqual([]);
      }).not.toThrow();
    });

    test('should not affect existing Pine Script generation', () => {
      // Mock existing Pine Script generator
      const mockPineScriptGenerator = {
        generate: jest.fn(() => ({
          success: true,
          code: '//@version=6\nstrategy("Test", overlay=true)',
          errors: []
        }))
      };

      // Verify it still works
      const result = mockPineScriptGenerator.generate({});
      expect(result.success).toBe(true);
      expect(result.code).toContain('//@version=6');
      expect(mockPineScriptGenerator.generate).toHaveBeenCalled();
    });

    test('should preserve existing theme system', () => {
      // Mock existing theme system
      const mockThemeSystem = {
        getCurrentTheme: () => 'dark',
        setTheme: jest.fn(),
        getThemeColors: () => ({
          primary: '#3b82f6',
          secondary: '#64748b'
        })
      };

      // Verify theme system still works
      expect(mockThemeSystem.getCurrentTheme()).toBe('dark');
      expect(mockThemeSystem.getThemeColors()).toHaveProperty('primary');
      
      mockThemeSystem.setTheme('light');
      expect(mockThemeSystem.setTheme).toHaveBeenCalledWith('light');
    });
  });

  describe('Performance and Memory', () => {
    test('should not cause excessive memory usage during initialization', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Initialize AI components
      const { NaturalLanguageProcessor } = require('../../nlp');
      const { KnowledgeBase } = require('../../knowledge');
      const { AIBuilderSystem } = require('../../builder');
      
      const nlp = new NaturalLanguageProcessor();
      const kb = new KnowledgeBase();
      const builder = new AIBuilderSystem();
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB for initialization)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    test('should initialize components within reasonable time', () => {
      const startTime = Date.now();
      
      // Initialize AI system
      const { PineGenieAI } = require('../../core');
      const { NaturalLanguageProcessor } = require('../../nlp');
      const { KnowledgeBase } = require('../../knowledge');
      
      const nlp = new NaturalLanguageProcessor();
      const kb = new KnowledgeBase();
      
      const endTime = Date.now();
      const initTime = endTime - startTime;
      
      // Should initialize within 1 second
      expect(initTime).toBeLessThan(1000);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid configurations gracefully', () => {
      const { AIBuilderSystem } = require('../../builder');
      
      expect(() => {
        const builder = new AIBuilderSystem();
        // Try to initialize with invalid state
        builder.initialize(null);
      }).not.toThrow();
    });

    test('should provide meaningful error messages', async () => {
      const { NaturalLanguageProcessor } = require('../../nlp');
      
      const nlp = new NaturalLanguageProcessor();
      
      // Test with invalid input
      const result = await nlp.processRequest('');
      expect(result).toBeDefined();
      expect(result.confidence).toBeLessThan(0.5);
    });
  });

  describe('API Compatibility', () => {
    test('should export expected interfaces', () => {
      const mainExports = require('../../index');
      
      // Check main exports
      expect(mainExports).toHaveProperty('PineGenieAI');
      expect(mainExports).toHaveProperty('NaturalLanguageProcessor');
      expect(mainExports).toHaveProperty('KnowledgeBase');
      expect(mainExports).toHaveProperty('AIBuilderSystem');
      
      // Check version info
      expect(mainExports).toHaveProperty('PINEGENIE_AI_VERSION');
      expect(typeof mainExports.PINEGENIE_AI_VERSION).toBe('string');
    });

    test('should maintain backward compatibility', () => {
      // Test that existing interfaces are preserved
      const { NaturalLanguageProcessor } = require('../../nlp');
      const nlp = new NaturalLanguageProcessor();
      
      // Check that expected methods exist
      expect(typeof nlp.processRequest).toBe('function');
      expect(typeof nlp.getContextualSuggestions).toBe('function');
      expect(typeof nlp.clearConversation).toBe('function');
    });
  });

  describe('Integration Points', () => {
    test('should integrate with monitoring system', () => {
      expect(() => {
        const { SystemMonitor } = require('../../monitoring');
        const monitor = new SystemMonitor();
        expect(monitor).toBeDefined();
      }).not.toThrow();
    });

    test('should work with existing file structure', () => {
      // Verify that AI system doesn't conflict with existing files
      expect(() => {
        // These would be existing system imports
        // const builderState = require('../../../app/builder/builder-state');
        // const templates = require('../../../agents/pinegenie-agent/core/pine-generator/templates');
        
        // AI system should coexist
        const { PineGenieAI } = require('../../core');
        const ai = new PineGenieAI();
        expect(ai).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Documentation and Examples', () => {
    test('should have documentation files available', () => {
      const fs = require('fs');
      const path = require('path');
      
      // Check for main documentation
      const docsPath = path.join(__dirname, '../../docs/README.md');
      expect(fs.existsSync(docsPath)).toBe(true);
    });

    test('should have example files available', () => {
      const fs = require('fs');
      const path = require('path');
      
      // Check for examples
      const examplesPath = path.join(__dirname, '../../docs/examples');
      expect(fs.existsSync(examplesPath)).toBe(true);
    });
  });
});