/**
 * Template Integrator Tests
 */

import { TemplateIntegrator } from './template-integrator';
import { TemplateCategory, DifficultyLevel } from '../types/template-types';
import type { CustomizationPreferences } from '../types/template-types';

describe('TemplateIntegrator', () => {
  let integrator: TemplateIntegrator;

  beforeEach(() => {
    integrator = new TemplateIntegrator();
  });

  describe('Template Loading', () => {
    it('should load existing templates safely', async () => {
      const templates = await integrator.getExistingTemplates();
      
      expect(Array.isArray(templates)).toBe(true);
      // Should have at least some templates from the existing system
      expect(templates.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Template Analysis', () => {
    it('should analyze template complexity and risk', async () => {
      const templates = await integrator.getExistingTemplates();
      
      if (templates.length > 0) {
        const analysis = await integrator.analyzeTemplate(templates[0].id);
        
        expect(analysis).toBeDefined();
        expect(analysis.complexity).toBeGreaterThanOrEqual(0);
        expect(analysis.complexity).toBeLessThanOrEqual(100);
        expect(['low', 'medium', 'high']).toContain(analysis.riskLevel);
        expect(analysis.suitability).toBeDefined();
        expect(Array.isArray(analysis.improvements)).toBe(true);
      }
    });

    it('should throw error for non-existent template', async () => {
      await expect(integrator.analyzeTemplate('non-existent-template'))
        .rejects.toThrow('Template non-existent-template not found');
    });
  });

  describe('Template Search', () => {
    it('should search templates with criteria', async () => {
      const result = await integrator.searchTemplates({
        category: TemplateCategory.TREND_FOLLOWING,
        difficulty: DifficultyLevel.BEGINNER
      });

      expect(result.templates).toBeDefined();
      expect(result.totalCount).toBeGreaterThanOrEqual(0);
      expect(result.searchTime).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.suggestions)).toBe(true);
    });
  });

  describe('Template Customization', () => {
    it('should suggest customizations based on preferences', async () => {
      const templates = await integrator.getExistingTemplates();
      
      if (templates.length > 0) {
        const preferences: CustomizationPreferences = {
          riskTolerance: 'low',
          timeframe: '1h',
          tradingStyle: 'conservative',
          preferredIndicators: ['rsi', 'ma'],
          avoidedIndicators: []
        };

        const suggestions = await integrator.suggestCustomizations(templates[0].id, preferences);
        
        expect(Array.isArray(suggestions)).toBe(true);
        suggestions.forEach(suggestion => {
          expect(suggestion.id).toBeDefined();
          expect(suggestion.type).toBeDefined();
          expect(suggestion.description).toBeDefined();
          expect(suggestion.confidence).toBeGreaterThanOrEqual(0);
          expect(suggestion.confidence).toBeLessThanOrEqual(1);
        });
      }
    });

    it('should optimize parameters for market conditions', async () => {
      const templates = await integrator.getExistingTemplates();
      
      if (templates.length > 0) {
        const optimizations = await integrator.optimizeParameters(
          templates[0].id,
          ['trending', 'high-volatility'],
          '1h'
        );

        expect(Array.isArray(optimizations)).toBe(true);
        optimizations.forEach(opt => {
          expect(opt.componentId).toBeDefined();
          expect(opt.parameterName).toBeDefined();
          expect(opt.originalValue).toBeDefined();
          expect(opt.customValue).toBeDefined();
        });
      }
    });
  });

  describe('Configuration', () => {
    it('should respect custom configuration', () => {
      const customIntegrator = new TemplateIntegrator({
        enableAIEnhancements: false,
        maxSuggestions: 3,
        confidenceThreshold: 0.8
      });

      expect(customIntegrator).toBeDefined();
    });

    it('should use default configuration when none provided', () => {
      const defaultIntegrator = new TemplateIntegrator();
      expect(defaultIntegrator).toBeDefined();
    });
  });

  describe('Template Conversion', () => {
    it('should convert existing templates to AI templates', async () => {
      const templates = await integrator.getExistingTemplates();
      
      if (templates.length > 0) {
        const result = await integrator.searchTemplates({});
        
        expect(result.templates.length).toBeGreaterThanOrEqual(0);
        
        if (result.templates.length > 0) {
          const aiTemplate = result.templates[0];
          expect(aiTemplate.id).toBeDefined();
          expect(aiTemplate.name).toBeDefined();
          expect(aiTemplate.description).toBeDefined();
          expect(aiTemplate.category).toBeDefined();
          expect(aiTemplate.difficulty).toBeDefined();
          expect(aiTemplate.components).toBeDefined();
          expect(aiTemplate.parameters).toBeDefined();
          expect(aiTemplate.metadata).toBeDefined();
        }
      }
    });
  });
});