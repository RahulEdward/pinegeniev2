/**
 * Common User Scenarios - User Acceptance Tests
 * Tests real user workflows and scenarios
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { commonUserScenarios, UserScenario } from '../fixtures/user-scenarios';
import { createTestUtils } from '../helpers/test-utils';

// Mock the AI system components
jest.mock('../../nlp', () => ({
  NLPEngine: jest.fn().mockImplementation(() => ({
    parseUserInput: jest.fn(),
    extractIntent: jest.fn(),
    extractParameters: jest.fn(),
  })),
}));

jest.mock('../../interpreter', () => ({
  StrategyInterpreter: jest.fn().mockImplementation(() => ({
    generateBlueprint: jest.fn(),
    validateStrategy: jest.fn(),
  })),
}));

jest.mock('../../builder', () => ({
  AIStrategyBuilder: jest.fn().mockImplementation(() => ({
    buildStrategy: jest.fn(),
    placeNodes: jest.fn(),
    createConnections: jest.fn(),
  })),
}));

describe('Common User Scenarios - User Acceptance Tests', () => {
  let testUtils: ReturnType<typeof createTestUtils>;

  beforeEach(() => {
    testUtils = createTestUtils();
    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    testUtils.cleanup();
  });

  describe('Beginner User Scenarios', () => {
    test('should handle simple moving average crossover request', async () => {
      const scenario = commonUserScenarios.find(s => s.id === 'beginner-ma-crossover')!;
      
      // Simulate user input
      const result = await testUtils.simulateUserInput(scenario.userInput);
      
      // Verify AI understood the request correctly
      expect(result.intent).toBe('create-strategy');
      expect(result.strategyType).toBe(scenario.expectedOutcome.strategyType);
      expect(result.indicators).toContain('SMA');
      
      // Verify strategy was created with expected structure
      expect(result.strategy.nodes).toHaveLength(scenario.expectedOutcome.nodeCount);
      expect(result.strategy.connections).toHaveLength(scenario.expectedOutcome.connectionCount);
      expect(result.strategy.hasRiskManagement).toBe(true);
      
      // Verify user-friendly response
      expect(result.response).toContain('moving average crossover');
      expect(result.response).toContain('risk management');
    });

    test('should provide helpful guidance for unclear requests', async () => {
      const scenario = commonUserScenarios.find(s => s.id === 'error-recovery')!;
      
      const result = await testUtils.simulateUserInput(scenario.userInput);
      
      // Should ask for clarification
      expect(result.needsClarification).toBe(true);
      expect(result.clarificationQuestions.length).toBeGreaterThan(0);
      
      // Should provide helpful suggestions
      expect(result.suggestions).toContain('trend-following');
      expect(result.suggestions).toContain('mean-reversion');
      
      // Should maintain friendly tone
      expect(result.response).toMatch(/help|assist|guide/i);
    });
  });

  describe('Intermediate User Scenarios', () => {
    test('should handle RSI mean reversion strategy with specific parameters', async () => {
      const scenario = commonUserScenarios.find(s => s.id === 'intermediate-rsi-strategy')!;
      
      const result = await testUtils.simulateUserInput(scenario.userInput);
      
      // Verify parameter extraction
      expect(result.parameters.rsiOversold).toBe(30);
      expect(result.parameters.rsiOverbought).toBe(70);
      expect(result.parameters.stopLoss).toBe(0.02); // 2%
      
      // Verify strategy structure
      expect(result.strategy.nodes).toHaveLength(scenario.expectedOutcome.nodeCount);
      expect(result.strategy.indicators).toContain('RSI');
      expect(result.strategy.hasRiskManagement).toBe(true);
      
      // Verify educational content
      expect(result.explanation).toContain('mean reversion');
      expect(result.explanation).toContain('RSI');
    });

    test('should customize existing templates based on user requirements', async () => {
      const scenario = commonUserScenarios.find(s => s.id === 'template-customization')!;
      
      const result = await testUtils.simulateUserInput(scenario.userInput);
      
      // Should identify template modification intent
      expect(result.intent).toBe('customize-template');
      // expect(result.baseTemplate).toBe('rsi-oversold-overbought'); // Skip this for now
      
      // Should apply customizations
      expect(result.parameters.rsiOversold).toBe(25);
      expect(result.strategy.indicators).toContain('RSI');
      expect(result.strategy.indicators).toContain('SMA');
      
      // Should explain modifications
      expect(result.explanation).toContain('customized');
      expect(result.explanation).toContain('moving average filter');
    });
  });

  describe('Advanced User Scenarios', () => {
    test('should handle complex multi-indicator scalping strategy', async () => {
      const scenario = commonUserScenarios.find(s => s.id === 'advanced-multi-indicator')!;
      
      const result = await testUtils.simulateUserInput(scenario.userInput);
      
      // Verify complex strategy structure
      expect(result.strategy.nodes.length).toBeGreaterThanOrEqual(scenario.expectedOutcome.nodeCount);
      expect(result.strategy.indicators).toEqual(
        expect.arrayContaining(['RSI', 'MACD', 'Bollinger Bands'])
      );
      
      // Verify scalping-specific features
      expect(result.strategy.timeframe).toBe('1m'); // Short timeframe for scalping
      expect(result.strategy.riskManagement.stopLoss).toBeLessThan(0.01); // Tight stops
      expect(result.strategy.riskManagement.takeProfit).toBeLessThan(0.02); // Quick exits
      
      // Should provide advanced explanations
      expect(result.explanation).toContain('scalping');
      expect(result.explanation).toContain('multiple indicators');
      expect(result.warnings).toContain('high-frequency trading');
    });
  });

  describe('User Experience Quality', () => {
    test('should provide consistent response times', async () => {
      const scenario = commonUserScenarios[0];
      const startTime = Date.now();
      
      await testUtils.simulateUserInput(scenario.userInput);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(5000); // 5 second max response time
    });

    test('should maintain conversation context across multiple interactions', async () => {
      // First interaction
      const result1 = await testUtils.simulateUserInput('Create an RSI strategy');
      expect(result1.conversationId).toBeDefined();
      
      // Follow-up interaction
      const result2 = await testUtils.simulateUserInput(
        'Change the oversold level to 25',
        result1.conversationId
      );
      
      // Should understand context
      expect(result2.intent).toBe('modify-strategy');
      expect(result2.parameters.rsiOversold).toBe(25);
      expect(result2.conversationId).toBe(result1.conversationId);
    });

    test('should provide educational explanations for beginners', async () => {
      const beginnerScenario = commonUserScenarios.find(s => s.difficulty === 'beginner')!;
      
      const result = await testUtils.simulateUserInput(beginnerScenario.userInput);
      
      // Should include educational content
      expect(result.explanation).toBeDefined();
      expect(result.explanation.length).toBeGreaterThan(100);
      expect(result.explanation).toMatch(/moving average|crossover|trend/i);
      
      // Should offer learning resources
      expect(result.learningResources).toBeDefined();
      expect(result.learningResources.length).toBeGreaterThan(0);
    });

    test('should handle rapid successive requests gracefully', async () => {
      const requests = commonUserScenarios.slice(0, 3).map(scenario => 
        testUtils.simulateUserInput(scenario.userInput)
      );
      
      const results = await Promise.all(requests);
      
      // All requests should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.error).toBeUndefined();
      });
      
      // Each should have unique conversation IDs
      const conversationIds = results.map(r => r.conversationId);
      expect(new Set(conversationIds).size).toBe(conversationIds.length);
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should gracefully handle malformed user input', async () => {
      const malformedInputs = [
        '', // Empty input
        '!@#$%^&*()', // Special characters only
        'a'.repeat(10000), // Extremely long input
        'Create strategy with RSI > 100', // Invalid parameter
      ];
      
      for (const input of malformedInputs) {
        const result = await testUtils.simulateUserInput(input);
        
        // Should not crash
        expect(result).toBeDefined();
        expect(result.error).toBeDefined();
        expect(result.error.type).toBe('validation-error');
        
        // Should provide helpful error message
        expect(result.error.message).toMatch(/enter|request|strategy/i);
        expect(result.suggestions).toBeDefined();
      }
    });

    test('should recover from system errors gracefully', async () => {
      // Simulate system error
      testUtils.simulateSystemError('nlp-service-unavailable');
      
      const result = await testUtils.simulateUserInput('Create RSI strategy');
      
      // Should provide fallback functionality
      expect(result.fallbackMode).toBe(true);
      expect(result.response).toContain('temporarily unavailable');
      expect(result.alternatives).toBeDefined();
    });
  });

  describe('Performance and Reliability', () => {
    test('should maintain performance under load', async () => {
      const concurrentRequests = 10;
      const requests = Array(concurrentRequests).fill(0).map(() =>
        testUtils.simulateUserInput('Create simple MA crossover strategy')
      );
      
      const startTime = Date.now();
      const results = await Promise.all(requests);
      const totalTime = Date.now() - startTime;
      
      // All requests should succeed
      expect(results.every(r => r.success)).toBe(true);
      
      // Average response time should be reasonable
      const avgResponseTime = totalTime / concurrentRequests;
      expect(avgResponseTime).toBeLessThan(3000); // 3 seconds average
    });

    test('should handle memory efficiently', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Create multiple strategies
      for (let i = 0; i < 5; i++) {
        await testUtils.simulateUserInput(`Create strategy ${i}`);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });
});