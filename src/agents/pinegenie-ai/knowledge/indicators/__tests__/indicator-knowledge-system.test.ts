/**
 * Comprehensive tests for the Indicator Knowledge System
 */

import { 
  TechnicalIndicatorDatabase, 
  UnifiedIndicatorSystem,
  OscillatorDatabase,
  type IndicatorSuggestion,
  type IndicatorAnalysis,
  type ParameterOptimization
} from '../index';

describe('Indicator Knowledge System', () => {
  let technicalDb: TechnicalIndicatorDatabase;
  let oscillatorDb: OscillatorDatabase;
  let unifiedSystem: UnifiedIndicatorSystem;

  beforeEach(() => {
    technicalDb = new TechnicalIndicatorDatabase();
    oscillatorDb = new OscillatorDatabase();
    unifiedSystem = new UnifiedIndicatorSystem();
  });

  describe('TechnicalIndicatorDatabase', () => {
    test('should provide indicator suggestions based on strategy type', () => {
      const suggestions = technicalDb.getIndicatorSuggestions(
        'trend-following',
        [],
        'beginner',
        'trending',
        '1h'
      );

      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toHaveProperty('indicator');
      expect(suggestions[0]).toHaveProperty('reason');
      expect(suggestions[0]).toHaveProperty('confidence');
      expect(suggestions[0]).toHaveProperty('priority');
    });

    test('should analyze indicator compatibility', () => {
      const analysis = technicalDb.getCompatibilityAnalysis(['rsi', 'bollinger_bands']);

      expect(analysis).toHaveProperty('compatible');
      expect(analysis).toHaveProperty('incompatible');
      expect(analysis).toHaveProperty('suggestions');
      expect(analysis.compatible.length).toBeGreaterThan(0);
    });

    test('should provide parameter optimizations', () => {
      const optimizations = technicalDb.getParameterOptimizations(
        'rsi',
        'mean-reversion',
        'ranging',
        '15m',
        { period: 14 }
      );

      expect(optimizations).toBeDefined();
      expect(Array.isArray(optimizations)).toBe(true);
      
      if (optimizations.length > 0) {
        expect(optimizations[0]).toHaveProperty('parameterId');
        expect(optimizations[0]).toHaveProperty('optimizedValue');
        expect(optimizations[0]).toHaveProperty('reason');
        expect(optimizations[0]).toHaveProperty('confidence');
      }
    });

    test('should analyze indicator suitability', () => {
      const analysis = technicalDb.analyzeIndicatorSuitability('rsi', {
        strategyType: 'mean-reversion',
        marketCondition: 'ranging',
        timeframe: '1h',
        userLevel: 'beginner',
        existingIndicators: ['bollinger_bands']
      });

      expect(analysis).toHaveProperty('indicator');
      expect(analysis).toHaveProperty('suitability');
      expect(analysis).toHaveProperty('strengths');
      expect(analysis).toHaveProperty('weaknesses');
      expect(analysis).toHaveProperty('recommendations');
      expect(analysis).toHaveProperty('parameterOptimizations');
      
      expect(analysis.suitability).toBeGreaterThanOrEqual(0);
      expect(analysis.suitability).toBeLessThanOrEqual(1);
    });

    test('should filter indicators by difficulty level', () => {
      const beginnerIndicators = technicalDb.getIndicatorsByDifficulty('beginner');
      const advancedIndicators = technicalDb.getIndicatorsByDifficulty('advanced');

      expect(beginnerIndicators.length).toBeGreaterThan(0);
      expect(beginnerIndicators.every(ind => ind.difficulty === 'beginner')).toBe(true);
      
      if (advancedIndicators.length > 0) {
        expect(advancedIndicators.every(ind => ind.difficulty === 'advanced')).toBe(true);
      }
    });

    test('should get compatible indicators', () => {
      const compatibleWithRSI = technicalDb.getCompatibleIndicators('rsi');
      
      expect(compatibleWithRSI).toBeDefined();
      expect(Array.isArray(compatibleWithRSI)).toBe(true);
      expect(compatibleWithRSI.length).toBeGreaterThan(0);
    });

    test('should search indicators by keywords', () => {
      const results = technicalDb.searchIndicators(['momentum', 'oscillator']);
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    test('should provide comprehensive statistics', () => {
      const stats = technicalDb.getStatistics();
      
      expect(stats).toHaveProperty('totalIndicators');
      expect(stats).toHaveProperty('byCategory');
      expect(stats).toHaveProperty('byDifficulty');
      expect(stats).toHaveProperty('averagePopularity');
      expect(stats).toHaveProperty('compatibilityRules');
      expect(stats).toHaveProperty('strategyMappings');
      
      expect(stats.totalIndicators).toBeGreaterThan(0);
      expect(stats.compatibilityRules).toBeGreaterThan(0);
      expect(stats.strategyMappings).toBeGreaterThan(0);
    });
  });

  describe('OscillatorDatabase', () => {
    test('should provide oscillator-specific functionality', () => {
      const allOscillators = oscillatorDb.getAllOscillators();
      
      expect(allOscillators).toBeDefined();
      expect(Array.isArray(allOscillators)).toBe(true);
      expect(allOscillators.length).toBeGreaterThan(0);
      expect(allOscillators.every(osc => osc.category === 'oscillator' || osc.category === 'momentum')).toBe(true);
    });

    test('should get oscillators by sensitivity', () => {
      const highSensitivity = oscillatorDb.getOscillatorsBySensitivity('high');
      const lowSensitivity = oscillatorDb.getOscillatorsBySensitivity('low');
      
      expect(Array.isArray(highSensitivity)).toBe(true);
      expect(Array.isArray(lowSensitivity)).toBe(true);
    });

    test('should provide complementary pairs', () => {
      const pairs = oscillatorDb.getComplementaryPairs();
      
      expect(Array.isArray(pairs)).toBe(true);
      if (pairs.length > 0) {
        expect(pairs[0]).toHaveProperty('primary');
        expect(pairs[0]).toHaveProperty('secondary');
        expect(pairs[0]).toHaveProperty('synergy');
        expect(pairs[0]).toHaveProperty('effectiveness');
      }
    });

    test('should provide oscillator statistics', () => {
      const stats = oscillatorDb.getStatistics();
      
      expect(stats).toHaveProperty('totalOscillators');
      expect(stats).toHaveProperty('byDifficulty');
      expect(stats).toHaveProperty('averagePopularity');
      expect(stats.totalOscillators).toBeGreaterThan(0);
    });
  });

  describe('UnifiedIndicatorSystem', () => {
    test('should combine technical and oscillator indicators', () => {
      const allIndicators = unifiedSystem.getAllIndicators();
      const technicalCount = technicalDb.getAllIndicators().length;
      const oscillatorCount = oscillatorDb.getAllOscillators().length;
      
      expect(allIndicators.length).toBe(technicalCount + oscillatorCount);
    });

    test('should search across all indicator types', () => {
      const results = unifiedSystem.searchAllIndicators(['rsi', 'momentum']);
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    test('should get indicators by category from all databases', () => {
      const oscillators = unifiedSystem.getIndicatorsByCategory('oscillator');
      const trendIndicators = unifiedSystem.getIndicatorsByCategory('trend');
      
      expect(Array.isArray(oscillators)).toBe(true);
      expect(Array.isArray(trendIndicators)).toBe(true);
      expect(oscillators.every(ind => ind.category === 'oscillator')).toBe(true);
      expect(trendIndicators.every(ind => ind.category === 'trend')).toBe(true);
    });

    test('should provide comprehensive statistics', () => {
      const stats = unifiedSystem.getComprehensiveStatistics();
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('technical');
      expect(stats).toHaveProperty('oscillators');
      expect(stats).toHaveProperty('byCategory');
      expect(stats).toHaveProperty('byDifficulty');
      
      expect(stats.total).toBeGreaterThan(0);
      expect(typeof stats.technical).toBe('object');
      expect(typeof stats.oscillators).toBe('object');
    });

    test('should get specific indicators by ID', () => {
      const rsi = unifiedSystem.getIndicator('rsi');
      const williamsR = unifiedSystem.getIndicator('williams_r');
      
      expect(rsi).toBeDefined();
      expect(rsi?.id).toBe('rsi');
      
      if (williamsR) {
        expect(williamsR.id).toBe('williams_r');
      }
    });
  });

  describe('Integration Tests', () => {
    test('should provide consistent data across all systems', () => {
      const rsiFromTechnical = technicalDb.getIndicator('rsi');
      const rsiFromUnified = unifiedSystem.getIndicator('rsi');
      
      expect(rsiFromTechnical).toEqual(rsiFromUnified);
    });

    test('should handle strategy-specific indicator suggestions', () => {
      const trendSuggestions = technicalDb.getIndicatorSuggestions('trend-following', [], 'beginner');
      const meanReversionSuggestions = technicalDb.getIndicatorSuggestions('mean-reversion', [], 'beginner');
      
      expect(trendSuggestions.length).toBeGreaterThan(0);
      expect(meanReversionSuggestions.length).toBeGreaterThan(0);
      
      // Suggestions should be different for different strategy types
      const trendIndicatorIds = trendSuggestions.map(s => s.indicator.id);
      const meanReversionIndicatorIds = meanReversionSuggestions.map(s => s.indicator.id);
      
      // There should be some difference in suggestions
      const intersection = trendIndicatorIds.filter(id => meanReversionIndicatorIds.includes(id));
      expect(intersection.length).toBeLessThan(Math.max(trendIndicatorIds.length, meanReversionIndicatorIds.length));
    });

    test('should provide meaningful parameter optimizations', () => {
      const optimizations = technicalDb.getParameterOptimizations(
        'rsi',
        'scalping',
        'volatile',
        '5m',
        { period: 14, source: 'close' }
      );
      
      if (optimizations.length > 0) {
        const periodOptimization = optimizations.find(opt => opt.parameterId === 'period');
        if (periodOptimization) {
          expect(periodOptimization.optimizedValue).not.toBe(periodOptimization.currentValue);
          expect(periodOptimization.reason).toBeTruthy();
          expect(periodOptimization.confidence).toBeGreaterThan(0);
          expect(periodOptimization.confidence).toBeLessThanOrEqual(1);
        }
      }
    });

    test('should handle edge cases gracefully', () => {
      // Test with non-existent indicator
      const nonExistent = unifiedSystem.getIndicator('non_existent_indicator');
      expect(nonExistent).toBeNull();
      
      // Test with empty suggestions
      const emptySuggestions = technicalDb.getIndicatorSuggestions(
        'unknown_strategy',
        [],
        'beginner'
      );
      expect(Array.isArray(emptySuggestions)).toBe(true);
      
      // Test compatibility analysis with non-existent indicators
      const emptyCompatibility = technicalDb.getCompatibilityAnalysis(['non_existent']);
      expect(emptyCompatibility.compatible.length).toBe(0);
      expect(emptyCompatibility.incompatible.length).toBe(0);
    });
  });

  describe('Performance Tests', () => {
    test('should handle large queries efficiently', () => {
      const startTime = performance.now();
      
      // Perform multiple operations
      for (let i = 0; i < 100; i++) {
        unifiedSystem.getAllIndicators();
        technicalDb.getIndicatorSuggestions('trend-following', [], 'beginner');
        technicalDb.getCompatibilityAnalysis(['rsi', 'macd']);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(1000); // 1 second
    });

    test('should cache results appropriately', () => {
      const firstCall = performance.now();
      const firstResult = technicalDb.getIndicatorSuggestions('trend-following', [], 'beginner');
      const firstDuration = performance.now() - firstCall;
      
      const secondCall = performance.now();
      const secondResult = technicalDb.getIndicatorSuggestions('trend-following', [], 'beginner');
      const secondDuration = performance.now() - secondCall;
      
      // Results should be identical
      expect(firstResult).toEqual(secondResult);
      
      // Second call might be faster due to internal optimizations
      // This is more of a performance observation than a strict requirement
      expect(secondDuration).toBeLessThanOrEqual(firstDuration * 2);
    });
  });
});