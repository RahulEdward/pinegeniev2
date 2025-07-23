/**
 * Template System Tests
 * Comprehensive tests for the Pine Script template system
 */

import { 
  StrategyTemplateManager, 
  templateManager, 
  strategyTemplates,
  templateCategories,
  type StrategyTemplate,
  type TemplateSearchOptions
} from '../templates';

describe('StrategyTemplateManager', () => {
  let manager: StrategyTemplateManager;

  beforeEach(() => {
    manager = new StrategyTemplateManager();
  });

  describe('Template Retrieval', () => {
    test('should get template by ID', () => {
      const template = manager.getTemplate('sma-crossover');
      expect(template).toBeDefined();
      expect(template?.name).toBe('Simple Moving Average Crossover');
    });

    test('should return undefined for non-existent template', () => {
      const template = manager.getTemplate('non-existent');
      expect(template).toBeUndefined();
    });

    test('should get all templates', () => {
      const templates = manager.getAllTemplates();
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.every(t => t.id && t.name && t.template)).toBe(true);
    });

    test('should get templates by category', () => {
      const trendTemplates = manager.getTemplatesByCategory('trend-following');
      expect(trendTemplates.length).toBeGreaterThan(0);
      expect(trendTemplates.every(t => t.category === 'trend-following')).toBe(true);
    });

    test('should get templates by difficulty', () => {
      const beginnerTemplates = manager.getTemplatesByDifficulty('beginner');
      expect(beginnerTemplates.length).toBeGreaterThan(0);
      expect(beginnerTemplates.every(t => t.difficulty === 'beginner')).toBe(true);
    });

    test('should get templates by timeframe', () => {
      const hourlyTemplates = manager.getTemplatesByTimeframe('1h');
      expect(hourlyTemplates.length).toBeGreaterThan(0);
      expect(hourlyTemplates.every(t => t.timeframes.includes('1h'))).toBe(true);
    });

    test('should get templates by market', () => {
      const forexTemplates = manager.getTemplatesByMarket('forex');
      expect(forexTemplates.length).toBeGreaterThan(0);
      expect(forexTemplates.every(t => t.markets.includes('forex'))).toBe(true);
    });
  });

  describe('Category Management', () => {
    test('should get all categories', () => {
      const categories = manager.getAllCategories();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories.every(c => c.id && c.name && c.description)).toBe(true);
    });

    test('should get category by ID', () => {
      const category = manager.getCategory('trend-following');
      expect(category).toBeDefined();
      expect(category?.name).toBe('Trend Following');
    });
  });

  describe('Search Functionality', () => {
    test('should search templates by query', () => {
      const results = manager.searchTemplates({ query: 'moving average' });
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(t => t.name.toLowerCase().includes('moving average'))).toBe(true);
    });

    test('should search templates by category', () => {
      const results = manager.searchTemplates({ category: 'mean-reversion' });
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(t => t.category === 'mean-reversion')).toBe(true);
    });

    test('should search templates by multiple criteria', () => {
      const options: TemplateSearchOptions = {
        category: 'trend-following',
        difficulty: 'beginner',
        timeframes: ['1h']
      };
      const results = manager.searchTemplates(options);
      expect(results.every(t => 
        t.category === 'trend-following' && 
        t.difficulty === 'beginner' && 
        t.timeframes.includes('1h')
      )).toBe(true);
    });

    test('should return empty array for no matches', () => {
      const results = manager.searchTemplates({ query: 'nonexistent strategy' });
      expect(results).toEqual([]);
    });
  });

  describe('Code Generation', () => {
    test('should generate code with default parameters', () => {
      const code = manager.generateCode('sma-crossover', {});
      expect(code).toContain('//@version=6');
      expect(code).toContain('strategy(');
      expect(code).toContain('ta.sma(');
      expect(code).toContain('10'); // default fastLength
      expect(code).toContain('30'); // default slowLength
    });

    test('should generate code with custom parameters', () => {
      const parameters = {
        fastLength: 5,
        slowLength: 20,
        source: 'hl2'
      };
      const code = manager.generateCode('sma-crossover', parameters);
      expect(code).toContain('5'); // custom fastLength
      expect(code).toContain('20'); // custom slowLength
      expect(code).toContain('hl2'); // custom source
    });

    test('should throw error for non-existent template', () => {
      expect(() => {
        manager.generateCode('non-existent', {});
      }).toThrow('Template not found: non-existent');
    });

    test('should validate parameter types', () => {
      expect(() => {
        manager.generateCode('sma-crossover', { fastLength: 'invalid' });
      }).toThrow('Parameter fastLength must be an integer');
    });

    test('should validate parameter ranges', () => {
      expect(() => {
        manager.generateCode('sma-crossover', { fastLength: 0 });
      }).toThrow('Parameter fastLength must be >= 1');
    });
  });

  describe('Template Validation', () => {
    test('should validate existing templates', () => {
      const validation = manager.validateTemplate('sma-crossover');
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    test('should validate template with custom parameters', () => {
      const validation = manager.validateTemplate('rsi-oversold-overbought', {
        rsiLength: 21,
        oversoldLevel: 25,
        overboughtLevel: 75
      });
      expect(validation.isValid).toBe(true);
    });

    test('should return validation errors for invalid template', () => {
      const validation = manager.validateTemplate('non-existent');
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Template Management', () => {
    test('should add custom template', () => {
      const customTemplate: StrategyTemplate = {
        id: 'test-template',
        name: 'Test Template',
        description: 'A test template',
        category: 'custom',
        difficulty: 'beginner',
        timeframes: ['1h'],
        markets: ['stocks'],
        tags: ['test'],
        version: '1.0',
        author: 'Test',
        created: new Date(),
        updated: new Date(),
        parameters: [
          {
            name: 'testParam',
            type: 'int',
            defaultValue: 10,
            description: 'Test parameter'
          }
        ],
        template: `//@version=6
strategy("Test", overlay=true)
testParam = input.int({{testParam}}, title="Test Param")
plot(close)`
      };

      manager.addCustomTemplate(customTemplate);
      const retrieved = manager.getTemplate('test-template');
      expect(retrieved).toEqual(customTemplate);
    });

    test('should remove template', () => {
      const removed = manager.removeTemplate('sma-crossover');
      expect(removed).toBe(true);
      expect(manager.getTemplate('sma-crossover')).toBeUndefined();
    });

    test('should update template', () => {
      const updated = manager.updateTemplate('sma-crossover', {
        description: 'Updated description'
      });
      expect(updated).toBe(true);
      const template = manager.getTemplate('sma-crossover');
      expect(template?.description).toBe('Updated description');
    });
  });

  describe('Template Statistics', () => {
    test('should return template statistics', () => {
      const stats = manager.getTemplateStats();
      expect(stats.totalTemplates).toBeGreaterThan(0);
      expect(typeof stats.categoryCounts).toBe('object');
      expect(typeof stats.difficultyCounts).toBe('object');
      expect(typeof stats.averageParameters).toBe('number');
    });
  });
});

describe('Template Data Validation', () => {
  test('all templates should have required fields', () => {
    strategyTemplates.forEach(template => {
      expect(template.id).toBeDefined();
      expect(template.name).toBeDefined();
      expect(template.description).toBeDefined();
      expect(template.category).toBeDefined();
      expect(template.template).toBeDefined();
      expect(template.parameters).toBeDefined();
      expect(Array.isArray(template.parameters)).toBe(true);
      expect(template.tags).toBeDefined();
      expect(Array.isArray(template.tags)).toBe(true);
    });
  });

  test('all templates should have Pine Script v6 version', () => {
    strategyTemplates.forEach(template => {
      expect(template.template).toContain('//@version=6');
    });
  });

  test('all template parameters should have required fields', () => {
    strategyTemplates.forEach(template => {
      template.parameters.forEach(param => {
        expect(param.name).toBeDefined();
        expect(param.type).toBeDefined();
        expect(param.defaultValue).toBeDefined();
        expect(param.description).toBeDefined();
      });
    });
  });

  test('all categories should have required fields', () => {
    templateCategories.forEach(category => {
      expect(category.id).toBeDefined();
      expect(category.name).toBeDefined();
      expect(category.description).toBeDefined();
      expect(category.icon).toBeDefined();
      expect(category.templates).toBeDefined();
      expect(Array.isArray(category.templates)).toBe(true);
    });
  });
});

describe('Global Template Manager', () => {
  test('should be properly initialized', () => {
    expect(templateManager).toBeDefined();
    expect(templateManager.getAllTemplates().length).toBeGreaterThan(0);
    expect(templateManager.getAllCategories().length).toBeGreaterThan(0);
  });

  test('should generate valid Pine Script code', () => {
    const templates = templateManager.getAllTemplates();
    templates.forEach(template => {
      const code = templateManager.generateCode(template.id, {});
      expect(code).toContain('//@version=6');
      expect(code).toContain('strategy(');
    });
  });
});