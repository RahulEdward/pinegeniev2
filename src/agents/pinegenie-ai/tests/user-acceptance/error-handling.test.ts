/**
 * Error Handling - User Acceptance Tests
 * Tests graceful error recovery and user-friendly error handling
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { errorScenarios } from '../fixtures/user-scenarios';
import { createTestUtils } from '../helpers/test-utils';

describe('Error Handling - User Acceptance Tests', () => {
  let testUtils: ReturnType<typeof createTestUtils>;

  beforeEach(() => {
    testUtils = createTestUtils();
    jest.clearAllMocks();
  });

  afterEach(() => {
    testUtils.cleanup();
  });

  describe('Network and Connectivity Issues', () => {
    test('should handle API timeouts gracefully', async () => {
      // Simulate slow API response
      testUtils.simulateSlowNetwork(10000); // 10 second delay
      
      const result = await testUtils.simulateUserInput('Create RSI strategy');
      
      // Should show timeout message
      expect(result.error).toBeDefined();
      expect(result.error.type).toBe('timeout');
      expect(result.error.message).toContain('taking longer than expected');
      
      // Should provide retry option
      expect(result.retryOptions).toBeDefined();
      expect(result.retryOptions.automatic).toBe(true);
      expect(result.retryOptions.manual).toBe(true);
      
      // Should maintain user's input
      expect(result.preservedInput).toBe('Create RSI strategy');
    });

    test('should handle complete network failure', async () => {
      testUtils.simulateNetworkFailure();
      
      const result = await testUtils.simulateUserInput('Create MACD strategy');
      
      // Should detect offline state
      expect(result.offline).toBe(true);
      
      // Should provide offline functionality
      expect(result.offlineMode).toBeDefined();
      expect(result.offlineMode.available).toBe(true);
      expect(result.offlineMode.features).toContain('template-browsing');
      expect(result.offlineMode.features).toContain('local-storage');
      
      // Should queue requests for when online
      expect(result.queuedRequest).toBeDefined();
      expect(result.queuedRequest.input).toBe('Create MACD strategy');
    });

    test('should recover when connection is restored', async () => {
      // Start offline
      testUtils.simulateNetworkFailure();
      const result1 = await testUtils.simulateUserInput('Create strategy');
      expect(result1.offline).toBe(true);
      
      // Restore connection
      testUtils.restoreNetwork();
      
      // Should automatically retry queued requests
      await testUtils.waitForNetworkRecovery();
      const result2 = await testUtils.getQueuedRequestResult();
      
      expect(result2.success).toBe(true);
      expect(result2.strategy).toBeDefined();
      
      // Should notify user of recovery
      expect(result2.notification).toContain('connection restored');
    });

    test('should handle intermittent connectivity', async () => {
      // Simulate unstable connection
      testUtils.simulateIntermittentConnection(0.3); // 30% failure rate
      
      const results = [];
      for (let i = 0; i < 10; i++) {
        const result = await testUtils.simulateUserInput(`Create strategy ${i}`);
        results.push(result);
      }
      
      // Should have some successes and some failures
      const successes = results.filter(r => r.success).length;
      const failures = results.filter(r => r.error).length;
      
      expect(successes).toBeGreaterThan(0);
      expect(failures).toBeGreaterThan(0);
      
      // Failed requests should be retried automatically
      const retriedResults = await testUtils.waitForRetries();
      const finalSuccesses = retriedResults.filter(r => r.success).length;
      expect(finalSuccesses).toBeGreaterThan(successes);
    });
  });

  describe('Invalid User Input Handling', () => {
    test('should validate and provide helpful feedback for empty input', async () => {
      const result = await testUtils.simulateUserInput('');
      
      expect(result.error).toBeDefined();
      expect(result.error.type).toBe('validation-error');
      expect(result.error.message).toContain('Please enter a strategy request');
      
      // Should provide suggestions
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions.length).toBeGreaterThan(3);
      expect(result.suggestions).toContain('Create RSI strategy');
    });

    test('should handle invalid parameter values', async () => {
      const invalidInputs = [
        'Create RSI strategy with period -5', // Negative period
        'Create MA crossover with RSI > 150', // RSI out of range
        'Create strategy with stop loss 200%', // Invalid percentage
        'Create MACD strategy with timeframe 0.5m', // Invalid timeframe
      ];
      
      for (const input of invalidInputs) {
        const result = await testUtils.simulateUserInput(input);
        
        expect(result.error).toBeDefined();
        expect(result.error.type).toBe('parameter-validation-error');
        
        // Should identify specific parameter issue
        expect(result.error.invalidParameters).toBeDefined();
        expect(result.error.invalidParameters.length).toBeGreaterThan(0);
        
        // Should suggest corrections
        expect(result.corrections).toBeDefined();
        result.corrections.forEach(correction => {
          expect(correction.parameter).toBeDefined();
          expect(correction.suggestedValue).toBeDefined();
          expect(correction.reason).toBeDefined();
        });
      }
    });

    test('should handle conflicting requirements', async () => {
      const result = await testUtils.simulateUserInput(
        'Create a conservative high-risk scalping strategy for long-term investment'
      );
      
      expect(result.error).toBeDefined();
      expect(result.error.type).toBe('conflicting-requirements');
      
      // Should identify conflicts
      expect(result.conflicts).toBeDefined();
      expect(result.conflicts.length).toBeGreaterThan(0);
      
      const conflict = result.conflicts[0];
      expect(conflict.conflictingTerms).toContain('conservative');
      expect(conflict.conflictingTerms).toContain('high-risk');
      
      // Should ask for clarification
      expect(result.clarificationQuestions).toBeDefined();
      expect(result.clarificationQuestions.length).toBeGreaterThan(0);
    });

    test('should handle extremely long input gracefully', async () => {
      const longInput = 'Create strategy '.repeat(1000); // Very long input
      
      const result = await testUtils.simulateUserInput(longInput);
      
      expect(result.error).toBeDefined();
      expect(result.error.type).toBe('input-too-long');
      expect(result.error.message).toContain('too long');
      
      // Should suggest shortening
      expect(result.suggestions).toContain('Please provide a shorter description');
      
      // Should extract key information if possible
      if (result.extractedIntent) {
        expect(result.extractedIntent).toBe('create-strategy');
      }
    });
  });

  describe('System Resource and Performance Issues', () => {
    test('should handle memory constraints', async () => {
      // Simulate low memory condition
      testUtils.simulateLowMemory();
      
      const result = await testUtils.simulateUserInput('Create complex multi-indicator strategy');
      
      // Should detect memory constraints
      expect(result.memoryWarning).toBe(true);
      
      // Should offer simplified alternatives
      expect(result.alternatives).toBeDefined();
      expect(result.alternatives.length).toBeGreaterThan(0);
      expect(result.alternatives[0].complexity).toBe('simplified');
      
      // Should provide memory optimization tips
      expect(result.optimizationTips).toBeDefined();
      expect(result.optimizationTips).toContain('reduce complexity');
    });

    test('should handle high CPU usage', async () => {
      testUtils.simulateHighCPUUsage();
      
      const result = await testUtils.simulateUserInput('Create strategy with animations');
      
      // Should disable performance-intensive features
      expect(result.performanceMode).toBe('reduced');
      expect(result.animationsDisabled).toBe(true);
      
      // Should notify user
      expect(result.notification).toContain('performance mode');
      
      // Should offer to re-enable when resources available
      expect(result.reEnableOption).toBe(true);
    });

    test('should handle concurrent user limits', async () => {
      // Simulate system at capacity
      testUtils.simulateSystemAtCapacity();
      
      const result = await testUtils.simulateUserInput('Create RSI strategy');
      
      expect(result.error).toBeDefined();
      expect(result.error.type).toBe('system-busy');
      expect(result.error.message).toContain('high demand');
      
      // Should provide queue position
      expect(result.queuePosition).toBeDefined();
      expect(result.estimatedWaitTime).toBeDefined();
      
      // Should offer alternatives
      expect(result.alternatives).toContain('browse-templates');
      expect(result.alternatives).toContain('offline-mode');
    });
  });

  describe('AI Service Failures', () => {
    test('should handle NLP service unavailability', async () => {
      testUtils.simulateServiceFailure('nlp');
      
      const result = await testUtils.simulateUserInput('Create moving average strategy');
      
      // Should fall back to template matching
      expect(result.fallbackMode).toBe('template-matching');
      expect(result.service).toBe('template-service');
      
      // Should still provide useful results
      expect(result.templateSuggestions).toBeDefined();
      expect(result.templateSuggestions.length).toBeGreaterThan(0);
      
      // Should explain limitation
      expect(result.explanation).toContain('limited functionality');
    });

    test('should handle strategy generation service failure', async () => {
      testUtils.simulateServiceFailure('strategy-generator');
      
      const result = await testUtils.simulateUserInput('Create custom RSI strategy');
      
      // Should offer manual building option
      expect(result.manualBuildingOption).toBe(true);
      expect(result.guidedMode).toBe(true);
      
      // Should provide step-by-step instructions
      expect(result.instructions).toBeDefined();
      expect(result.instructions.length).toBeGreaterThan(3);
      
      // Should offer template alternatives
      expect(result.templateAlternatives).toBeDefined();
    });

    test('should handle partial service degradation', async () => {
      testUtils.simulatePartialServiceDegradation({
        nlp: 0.5, // 50% success rate
        generator: 0.8, // 80% success rate
        optimizer: 0.3, // 30% success rate
      });
      
      const result = await testUtils.simulateUserInput('Create optimized MACD strategy');
      
      // Should work with available services
      expect(result.success).toBe(true);
      
      // Should warn about unavailable features
      expect(result.warnings).toContain('optimization temporarily unavailable');
      
      // Should offer to retry optimization later
      expect(result.retryLaterOptions).toContain('optimization');
    });
  });

  describe('Data Validation and Integrity', () => {
    test('should handle corrupted strategy data', async () => {
      const corruptedStrategy = {
        nodes: [{ id: 'invalid', type: null }], // Invalid node
        connections: [{ from: 'nonexistent', to: 'also-nonexistent' }], // Invalid connections
      };
      
      const result = await testUtils.loadStrategy(corruptedStrategy);
      
      expect(result.error).toBeDefined();
      expect(result.error.type).toBe('data-corruption');
      
      // Should attempt to repair if possible
      expect(result.repairAttempted).toBe(true);
      
      if (result.repaired) {
        expect(result.repairedStrategy).toBeDefined();
        expect(result.repairLog).toBeDefined();
      } else {
        // Should offer to start fresh
        expect(result.startFreshOption).toBe(true);
      }
    });

    test('should validate Pine Script generation integrity', async () => {
      const result = await testUtils.simulateUserInput('Create RSI strategy');
      
      // Should validate generated Pine Script
      expect(result.pineScriptValidation).toBeDefined();
      expect(result.pineScriptValidation.syntaxValid).toBe(true);
      expect(result.pineScriptValidation.semanticValid).toBe(true);
      
      // Should handle validation failures
      if (!result.pineScriptValidation.valid) {
        expect(result.error.type).toBe('pine-script-generation-error');
        expect(result.fallbackOptions).toBeDefined();
      }
    });
  });

  describe('User Experience During Errors', () => {
    test('should maintain user context during error recovery', async () => {
      // Start a conversation
      const result1 = await testUtils.simulateUserInput('Create RSI strategy');
      const conversationId = result1.conversationId;
      
      // Simulate error in follow-up
      testUtils.simulateServiceFailure('nlp');
      const result2 = await testUtils.simulateUserInput(
        'Change the period to 21',
        conversationId
      );
      
      expect(result2.error).toBeDefined();
      
      // Should maintain conversation context
      expect(result2.conversationId).toBe(conversationId);
      expect(result2.contextPreserved).toBe(true);
      
      // Should remember previous strategy
      expect(result2.previousStrategy).toBeDefined();
      expect(result2.previousStrategy.type).toBe('rsi-strategy');
    });

    test('should provide progressive error disclosure', async () => {
      testUtils.simulateComplexError();
      
      const result = await testUtils.simulateUserInput('Create complex strategy');
      
      // Should show simple error first
      expect(result.error.level).toBe('user-friendly');
      expect(result.error.message).not.toContain('stack trace');
      
      // Should offer more details if requested
      expect(result.moreDetailsAvailable).toBe(true);
      
      const detailedError = await testUtils.requestErrorDetails(result.errorId);
      expect(detailedError.level).toBe('technical');
      expect(detailedError.details).toBeDefined();
    });

    test('should provide helpful recovery suggestions', async () => {
      const errorTypes = [
        'network-timeout',
        'invalid-parameters',
        'service-unavailable',
        'memory-limit',
      ];
      
      for (const errorType of errorTypes) {
        testUtils.simulateSpecificError(errorType);
        const result = await testUtils.simulateUserInput('Create strategy');
        
        expect(result.error).toBeDefined();
        expect(result.recoverySuggestions).toBeDefined();
        expect(result.recoverySuggestions.length).toBeGreaterThan(0);
        
        // Suggestions should be specific to error type
        const suggestion = result.recoverySuggestions[0];
        expect(suggestion.action).toBeDefined();
        expect(suggestion.description).toBeDefined();
        expect(suggestion.automated).toBeDefined();
      }
    });

    test('should track error patterns and improve handling', async () => {
      // Simulate repeated similar errors
      const errorPattern = 'invalid-rsi-period';
      
      for (let i = 0; i < 5; i++) {
        testUtils.simulateSpecificError(errorPattern);
        await testUtils.simulateUserInput('Create RSI strategy with period 0');
      }
      
      // Should recognize pattern
      const patternAnalysis = await testUtils.getErrorPatternAnalysis();
      expect(patternAnalysis.patterns).toContain(errorPattern);
      expect(patternAnalysis.frequency[errorPattern]).toBe(5);
      
      // Should improve error handling
      const improvedResult = await testUtils.simulateUserInput('Create RSI strategy with period 0');
      expect(improvedResult.error.improved).toBe(true);
      expect(improvedResult.error.message).toContain('common mistake');
    });
  });
});