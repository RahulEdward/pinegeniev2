/**
 * Pine Script Template System Examples
 * Demonstrates various ways to use the template system
 */

import { templateManager, type TemplateSearchOptions } from './templates';

// Example 1: Basic Template Usage
console.log('=== Example 1: Basic Template Usage ===');

// Get a specific template
const smaTemplate = templateManager.getTemplate('sma-crossover');
if (smaTemplate) {
  console.log(`Template: ${smaTemplate.name}`);
  console.log(`Category: ${smaTemplate.category}`);
  console.log(`Difficulty: ${smaTemplate.difficulty}`);
  console.log(`Parameters: ${smaTemplate.parameters.length}`);
}

// Generate code with default parameters
const defaultCode = templateManager.generateCode('sma-crossover', {});
console.log('\nGenerated code with defaults:');
console.log(defaultCode.substring(0, 200) + '...');

// Example 2: Custom Parameter Configuration
console.log('\n=== Example 2: Custom Parameters ===');

const customParameters = {
  fastLength: 8,
  slowLength: 21,
  source: 'hlc3',
  stopLossPercent: 1.5,
  takeProfitPercent: 3.0
};

const customCode = templateManager.generateCode('sma-crossover', customParameters);
console.log('Generated code with custom parameters:');
console.log(customCode.substring(0, 300) + '...');

// Example 3: Advanced Search
console.log('\n=== Example 3: Advanced Search ===');

// Search for beginner-friendly templates
const beginnerTemplates = templateManager.searchTemplates({
  difficulty: 'beginner'
});
console.log(`Found ${beginnerTemplates.length} beginner templates:`);
beginnerTemplates.forEach(t => console.log(`- ${t.name}`));

// Search for forex-suitable templates
const forexTemplates = templateManager.searchTemplates({
  markets: ['forex']
});
console.log(`\nFound ${forexTemplates.length} forex-suitable templates:`);
forexTemplates.forEach(t => console.log(`- ${t.name}`));

// Multi-criteria search
const scalping1mTemplates = templateManager.searchTemplates({
  category: 'scalping',
  timeframes: ['1m'],
  difficulty: 'advanced'
});
console.log(`\nFound ${scalping1mTemplates.length} advanced 1m scalping templates:`);
scalping1mTemplates.forEach(t => console.log(`- ${t.name}`));

// Example 4: Template Categories
console.log('\n=== Example 4: Template Categories ===');

const categories = templateManager.getAllCategories();
console.log('Available categories:');
categories.forEach(category => {
  const templates = templateManager.getTemplatesByCategory(category.id);
  console.log(`${category.icon} ${category.name}: ${templates.length} templates`);
  console.log(`  Description: ${category.description}`);
});

// Example 5: Parameter Validation
console.log('\n=== Example 5: Parameter Validation ===');

// Valid parameters
try {
  const validCode = templateManager.generateCode('rsi-oversold-overbought', {
    rsiLength: 21,
    oversoldLevel: 25,
    overboughtLevel: 75,
    useConfirmation: true,
    riskRewardRatio: 2.5
  });
  console.log('✅ Valid parameters accepted');
} catch (error) {
  console.log(`❌ Unexpected error: ${error}`);
}

// Invalid parameter type
try {
  templateManager.generateCode('rsi-oversold-overbought', {
    rsiLength: 'invalid'
  });
  console.log('❌ Should have rejected invalid type');
} catch (error) {
  console.log(`✅ Invalid type rejected: ${error}`);
}

// Out of range parameter
try {
  templateManager.generateCode('rsi-oversold-overbought', {
    rsiLength: 100 // max is 50
  });
  console.log('❌ Should have rejected out of range value');
} catch (error) {
  console.log(`✅ Out of range value rejected: ${error}`);
}

// Example 6: Template Validation
console.log('\n=== Example 6: Template Validation ===');

const templates = ['sma-crossover', 'rsi-oversold-overbought', 'macd-signal'];
templates.forEach(templateId => {
  const validation = templateManager.validateTemplate(templateId);
  console.log(`${templateId}: ${validation.isValid ? '✅ Valid' : '❌ Invalid'}`);
  if (!validation.isValid) {
    console.log(`  Errors: ${validation.errors.join(', ')}`);
  }
  if (validation.warnings.length > 0) {
    console.log(`  Warnings: ${validation.warnings.join(', ')}`);
  }
});

// Example 7: Template Statistics
console.log('\n=== Example 7: Template Statistics ===');

const stats = templateManager.getTemplateStats();
console.log('Template Statistics:');
console.log(`- Total templates: ${stats.totalTemplates}`);
console.log(`- Average parameters per template: ${stats.averageParameters.toFixed(1)}`);

console.log('\nTemplates by category:');
Object.entries(stats.categoryCounts).forEach(([category, count]) => {
  console.log(`- ${category}: ${count}`);
});

console.log('\nTemplates by difficulty:');
Object.entries(stats.difficultyCounts).forEach(([difficulty, count]) => {
  console.log(`- ${difficulty}: ${count}`);
});

// Example 8: Complex Strategy Generation
console.log('\n=== Example 8: Complex Strategy Generation ===');

// Generate a comprehensive Bollinger Bands strategy
const bbParameters = {
  bbLength: 20,
  bbStdDev: 2.0,
  useVolumeFilter: true,
  volumeThreshold: 1.5,
  exitStrategy: 'trailing_stop'
};

const bbCode = templateManager.generateCode('bollinger-bands-breakout', bbParameters);
console.log('Generated Bollinger Bands Breakout Strategy:');
console.log('Strategy features:');
console.log('- Volume confirmation filter');
console.log('- Volatility expansion detection');
console.log('- Dynamic exit strategies');
console.log('- ATR-based stop losses');

// Example 9: Template Comparison
console.log('\n=== Example 9: Template Comparison ===');

const compareTemplates = ['sma-crossover', 'rsi-oversold-overbought', 'scalping-ema-stoch'];
console.log('Template Comparison:');
console.log('Template'.padEnd(25) + 'Category'.padEnd(15) + 'Difficulty'.padEnd(12) + 'Parameters');
console.log('-'.repeat(70));

compareTemplates.forEach(templateId => {
  const template = templateManager.getTemplate(templateId);
  if (template) {
    console.log(
      template.name.substring(0, 24).padEnd(25) +
      template.category.padEnd(15) +
      template.difficulty.padEnd(12) +
      template.parameters.length
    );
  }
});

// Example 10: Real-world Usage Scenarios
console.log('\n=== Example 10: Real-world Usage Scenarios ===');

// Scenario 1: New trader wants a simple strategy
console.log('Scenario 1: New trader needs a simple strategy');
const beginnerStrategy = templateManager.searchTemplates({
  difficulty: 'beginner',
  category: 'trend-following'
});
if (beginnerStrategy.length > 0) {
  const strategy = beginnerStrategy[0];
  console.log(`Recommended: ${strategy.name}`);
  console.log(`Why: ${strategy.description}`);
  console.log(`Suitable for: ${strategy.markets.join(', ')} markets`);
  console.log(`Timeframes: ${strategy.timeframes.join(', ')}`);
}

// Scenario 2: Experienced trader wants scalping strategy
console.log('\nScenario 2: Experienced trader wants scalping strategy');
const scalpingStrategy = templateManager.searchTemplates({
  category: 'scalping',
  timeframes: ['1m', '3m', '5m']
});
if (scalpingStrategy.length > 0) {
  const strategy = scalpingStrategy[0];
  console.log(`Recommended: ${strategy.name}`);
  console.log(`Features: ${strategy.tags.join(', ')}`);
  console.log(`Complexity: ${strategy.difficulty}`);
}

// Scenario 3: Forex trader needs breakout strategy
console.log('\nScenario 3: Forex trader needs breakout strategy');
const forexBreakout = templateManager.searchTemplates({
  category: 'breakout',
  markets: ['forex'],
  timeframes: ['15m', '1h', '4h']
});
if (forexBreakout.length > 0) {
  const strategy = forexBreakout[0];
  console.log(`Recommended: ${strategy.name}`);
  console.log(`Forex-optimized features available`);
  console.log(`Parameters: ${strategy.parameters.length} customizable settings`);
}

console.log('\n=== Examples Complete ===');
console.log('The template system provides flexible, validated Pine Script generation');
console.log('with comprehensive search, parameter validation, and extensibility.');