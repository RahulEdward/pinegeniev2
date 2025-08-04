/**
 * Performance - User Acceptance Tests
 * Tests system performance and responsiveness from user perspective
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { performanceExpectations } from '../fixtures/user-scenarios';
import { createTestUtils } from '../helpers/test-utils';

describe('Performance - User Acceptance Tests', () => {
  let testUtils: ReturnType<typeof createTestUtils>;

  beforeEach(() => {
    testUtils = createTestUtils();
    jest.clearAllMocks();
  });

  afterEach(() => {
    testUtils.cleanup();
  });

  describe('Response Time Performance', () => {
    test('should respond to simple requests within 2 seconds', async () => {
      const simpleRequests = [
        'Create RSI strategy',
        'Create moving average crossover',
        'Show me MACD template',
        'Help with indicators',
      ];
      
      for (const request of simpleRequests) {
        const startTime = performance.now();
        const result = await testUtils.simulateUserInput(request);
        const responseTime = performance.now() - startTime;
        
        expect(responseTime).toBeLessThan(performanceExpectations.responseTime.aiResponse);
        expect(result.success).toBe(true);
      }
    });

    test('should generate strategies within 5 seconds', async () => {
      const strategyRequests = [
        'Create RSI mean reversion strategy with stop loss',
        'Create MACD crossover with Bollinger Bands filter',
        'Create scalping strategy with multiple indicators',
      ];
      
      for (const request of strategyRequests) {
        const startTime = performance.now();
        const result = await testUtils.simulateUserInput(request);
        const generationTime = performance.now() - startTime;
        
        expect(generationTime).toBeLessThan(performanceExpectations.responseTime.strategyGeneration);
        expect(result.strategy).toBeDefined();
      }
    });

    test('should create nodes and connections quickly', async () => {
      const strategy = await testUtils.createTestStrategy();
      
      // Test node creation speed
      const nodeStartTime = performance.now();
      await strategy.addNode('RSI', { period: 14 });
      const nodeTime = performance.now() - nodeStartTime;
      
      expect(nodeTime).toBeLessThan(performanceExpectations.responseTime.nodeCreation);
      
      // Test connection creation speed
      const connectionStartTime = performance.now();
      await strategy.addConnection('data-source', 'rsi-indicator');
      const connectionTime = performance.now() - connectionStartTime;
      
      expect(connectionTime).toBeLessThan(performanceExpectations.responseTime.connectionCreation);
    });

    test('should maintain responsiveness during complex operations', async () => {
      // Start complex operation
      const complexOperation = testUtils.simulateUserInput(
        'Create advanced multi-timeframe strategy with 10 indicators'
      );
      
      // Test that UI remains responsive
      const uiStartTime = performance.now();
      const uiResponse = await testUtils.testUIResponsiveness();
      const uiResponseTime = performance.now() - uiStartTime;
      
      expect(uiResponseTime).toBeLessThan(100); // UI should respond within 100ms
      expect(uiResponse.responsive).toBe(true);
      
      // Wait for complex operation to complete
      const result = await complexOperation;
      expect(result.success).toBe(true);
    });
  });

  describe('Memory Usage Performance', () => {
    test('should manage memory efficiently during normal usage', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Simulate normal user session
      for (let i = 0; i < 10; i++) {
        await testUtils.simulateUserInput(`Create strategy ${i}`);
        await testUtils.simulateUserInput(`Modify strategy ${i}`);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      expect(memoryIncrease).toBeLessThan(performanceExpectations.memory.maxHeapSize);
    });

    test('should handle large strategies without memory leaks', async () => {
      const memorySnapshots = [];
      
      // Create increasingly large strategies
      for (let nodeCount = 10; nodeCount <= 100; nodeCount += 10) {
        const strategy = await testUtils.createLargeStrategy(nodeCount);
        
        // Take memory snapshot
        const memory = process.memoryUsage().heapUsed;
        memorySnapshots.push({ nodeCount, memory });
        
        // Clean up strategy
        await strategy.cleanup();
      }
      
      // Memory growth should be linear, not exponential
      const memoryGrowthRate = testUtils.calculateGrowthRate(memorySnapshots);
      expect(memoryGrowthRate).toBeLessThan(1.5); // Less than 1.5x growth per 10 nodes
    });

    test('should limit strategy complexity to prevent memory issues', async () => {
      const result = await testUtils.simulateUserInput(
        'Create strategy with 2000 indicators and 5000 connections'
      );
      
      // Should reject or limit overly complex strategies
      if (result.success) {
        expect(result.strategy.nodes.length).toBeLessThanOrEqual(
          performanceExpectations.memory.maxStrategySize
        );
      } else {
        expect(result.error.type).toBe('complexity-limit-exceeded');
        expect(result.alternatives).toBeDefined();
      }
    });
  });

  describe('Concurrent User Performance', () => {
    test('should handle multiple simultaneous users', async () => {
      const userCount = 20;
      const userSessions = [];
      
      // Create multiple concurrent user sessions
      for (let i = 0; i < userCount; i++) {
        const session = testUtils.createUserSession(`user-${i}`);
        userSessions.push(session);
      }
      
      // Have all users make requests simultaneously
      const requests = userSessions.map(session =>
        session.simulateUserInput('Create RSI strategy')
      );
      
      const startTime = performance.now();
      const results = await Promise.all(requests);
      const totalTime = performance.now() - startTime;
      
      // All requests should succeed
      expect(results.every(r => r.success)).toBe(true);
      
      // Average response time should be reasonable
      const avgResponseTime = totalTime / userCount;
      expect(avgResponseTime).toBeLessThan(5000); // 5 seconds average under load
    });

    test('should maintain performance under sustained load', async () => {
      const loadTestDuration = 30000; // 30 seconds
      const requestInterval = 1000; // 1 request per second
      const results = [];
      
      const startTime = Date.now();
      
      while (Date.now() - startTime < loadTestDuration) {
        const requestStart = performance.now();
        const result = await testUtils.simulateUserInput('Create simple strategy');
        const requestTime = performance.now() - requestStart;
        
        results.push({
          success: result.success,
          responseTime: requestTime,
          timestamp: Date.now(),
        });
        
        // Wait for next interval
        await testUtils.wait(requestInterval);
      }
      
      // Calculate performance metrics
      const successRate = results.filter(r => r.success).length / results.length;
      const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
      const maxResponseTime = Math.max(...results.map(r => r.responseTime));
      
      expect(successRate).toBeGreaterThanOrEqual(performanceExpectations.reliability.successRate);
      expect(avgResponseTime).toBeLessThan(3000); // 3 seconds average
      expect(maxResponseTime).toBeLessThan(10000); // 10 seconds max
    });

    test('should gracefully degrade under extreme load', async () => {
      // Simulate extreme load
      const extremeUserCount = 100;
      const requests = Array(extremeUserCount).fill(0).map((_, i) =>
        testUtils.simulateUserInput(`Create strategy ${i}`)
      );
      
      const results = await Promise.allSettled(requests);
      
      // Should handle graceful degradation
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      // At least some requests should succeed
      expect(successful).toBeGreaterThan(extremeUserCount * 0.5); // At least 50%
      
      // Failed requests should have appropriate error messages
      const rejectedResults = results.filter(r => r.status === 'rejected');
      rejectedResults.forEach(result => {
        expect(result.reason.message).toMatch(/busy|overloaded|try again/i);
      });
    });
  });

  describe('Real-time Performance', () => {
    test('should provide real-time typing feedback', async () => {
      const chatInterface = await testUtils.renderChatInterface();
      const input = chatInterface.getByTestId('chat-input');
      
      const typingText = 'Create RSI strategy with period 21';
      
      for (let i = 0; i < typingText.length; i++) {
        const startTime = performance.now();
        await testUtils.typeCharacter(input, typingText[i]);
        const responseTime = performance.now() - startTime;
        
        // Each character should be responsive
        expect(responseTime).toBeLessThan(50); // 50ms per character
      }
      
      // Should provide suggestions as user types
      const suggestions = await chatInterface.findAllByTestId('suggestion-item');
      expect(suggestions.length).toBeGreaterThan(0);
    });

    test('should update UI smoothly during strategy building', async () => {
      const builder = await testUtils.renderStrategyBuilder();
      
      // Monitor frame rate during building
      const frameRateMonitor = testUtils.startFrameRateMonitoring();
      
      // Build strategy with animations
      await testUtils.buildAnimatedStrategy('RSI crossover strategy');
      
      const frameRateStats = frameRateMonitor.stop();
      
      // Should maintain smooth frame rate (>30 FPS)
      expect(frameRateStats.averageFPS).toBeGreaterThan(30);
      expect(frameRateStats.minFPS).toBeGreaterThan(20);
    });

    test('should handle rapid user interactions', async () => {
      const chatInterface = await testUtils.renderChatInterface();
      
      // Simulate rapid clicking and typing
      const rapidActions = [
        () => testUtils.clickButton('send-button'),
        () => testUtils.typeText('chat-input', 'RSI'),
        () => testUtils.clickButton('clear-button'),
        () => testUtils.typeText('chat-input', 'MACD'),
        () => testUtils.clickButton('help-button'),
      ];
      
      // Execute actions rapidly
      const results = await Promise.all(
        rapidActions.map(action => action())
      );
      
      // All actions should complete successfully
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
      
      // UI should remain stable
      expect(chatInterface.isStable()).toBe(true);
    });
  });

  describe('Resource Optimization', () => {
    test('should optimize resource usage based on device capabilities', async () => {
      const deviceProfiles = [
        { type: 'mobile', cpu: 'low', memory: 'limited' },
        { type: 'tablet', cpu: 'medium', memory: 'moderate' },
        { type: 'desktop', cpu: 'high', memory: 'abundant' },
      ];
      
      for (const profile of deviceProfiles) {
        testUtils.setDeviceProfile(profile);
        
        const result = await testUtils.simulateUserInput('Create complex strategy');
        
        // Should adapt complexity based on device
        if (profile.cpu === 'low') {
          expect(result.strategy.complexity).toBe('simplified');
          expect(result.animationsEnabled).toBe(false);
        } else if (profile.cpu === 'high') {
          expect(result.strategy.complexity).toBe('full');
          expect(result.animationsEnabled).toBe(true);
        }
      }
    });

    test('should implement efficient caching strategies', async () => {
      // First request should hit the server
      const startTime1 = performance.now();
      const result1 = await testUtils.simulateUserInput('Create RSI strategy');
      const time1 = performance.now() - startTime1;
      
      // Second identical request should use cache
      const startTime2 = performance.now();
      const result2 = await testUtils.simulateUserInput('Create RSI strategy');
      const time2 = performance.now() - startTime2;
      
      // Cached request should be significantly faster
      expect(time2).toBeLessThan(time1 * 0.5); // At least 50% faster
      expect(result2.fromCache).toBe(true);
      expect(result2.strategy).toEqual(result1.strategy);
    });

    test('should clean up resources properly', async () => {
      const initialResources = testUtils.getResourceUsage();
      
      // Create and destroy multiple strategies
      for (let i = 0; i < 10; i++) {
        const strategy = await testUtils.createTestStrategy();
        await strategy.destroy();
      }
      
      // Force cleanup
      await testUtils.forceCleanup();
      
      const finalResources = testUtils.getResourceUsage();
      
      // Resource usage should return to baseline
      expect(finalResources.memory).toBeLessThanOrEqual(initialResources.memory * 1.1); // 10% tolerance
      expect(finalResources.handles).toBeLessThanOrEqual(initialResources.handles + 5); // Small tolerance for handles
    });
  });

  describe('Performance Monitoring and Alerting', () => {
    test('should monitor and report performance metrics', async () => {
      // Enable performance monitoring
      const monitor = testUtils.enablePerformanceMonitoring();
      
      // Perform various operations
      await testUtils.simulateUserInput('Create RSI strategy');
      await testUtils.simulateUserInput('Create MACD strategy');
      await testUtils.simulateUserInput('Create complex strategy');
      
      const metrics = monitor.getMetrics();
      
      // Should collect comprehensive metrics
      expect(metrics.responseTime).toBeDefined();
      expect(metrics.memoryUsage).toBeDefined();
      expect(metrics.cpuUsage).toBeDefined();
      expect(metrics.errorRate).toBeDefined();
      
      // Should identify performance bottlenecks
      expect(metrics.bottlenecks).toBeDefined();
      if (metrics.bottlenecks.length > 0) {
        metrics.bottlenecks.forEach(bottleneck => {
          expect(bottleneck.component).toBeDefined();
          expect(bottleneck.severity).toBeDefined();
          expect(bottleneck.recommendation).toBeDefined();
        });
      }
    });

    test('should alert on performance degradation', async () => {
      const alertSystem = testUtils.setupPerformanceAlerts();
      
      // Simulate performance degradation
      testUtils.simulatePerformanceDegradation({
        responseTime: 10000, // 10 seconds
        memoryUsage: 200 * 1024 * 1024, // 200MB
        errorRate: 0.3, // 30% error rate
      });
      
      await testUtils.simulateUserInput('Create strategy');
      
      const alerts = alertSystem.getAlerts();
      
      // Should generate appropriate alerts
      expect(alerts.length).toBeGreaterThan(0);
      
      const responseTimeAlert = alerts.find(a => a.type === 'response-time');
      expect(responseTimeAlert).toBeDefined();
      expect(responseTimeAlert.severity).toBe('high');
      
      const memoryAlert = alerts.find(a => a.type === 'memory-usage');
      expect(memoryAlert).toBeDefined();
      
      const errorRateAlert = alerts.find(a => a.type === 'error-rate');
      expect(errorRateAlert).toBeDefined();
    });

    test('should provide performance optimization recommendations', async () => {
      // Simulate various performance scenarios
      const scenarios = [
        { type: 'high-memory', memoryUsage: 150 * 1024 * 1024 },
        { type: 'slow-response', responseTime: 8000 },
        { type: 'high-cpu', cpuUsage: 0.9 },
      ];
      
      for (const scenario of scenarios) {
        testUtils.simulatePerformanceScenario(scenario);
        
        const recommendations = await testUtils.getPerformanceRecommendations();
        
        expect(recommendations.length).toBeGreaterThan(0);
        
        const recommendation = recommendations[0];
        expect(recommendation.issue).toBeDefined();
        expect(recommendation.solution).toBeDefined();
        expect(recommendation.impact).toBeDefined();
        expect(recommendation.difficulty).toBeDefined();
      }
    });
  });
});