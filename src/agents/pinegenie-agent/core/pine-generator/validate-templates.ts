/**
 * Template Validation Script
 * Manual validation of the template system
 */

import { templateManager, strategyTemplates } from './templates';

console.log('🔍 Validating Pine Script Template System...\n');

// Test 1: Basic template loading
console.log('1. Testing template loading...');
const allTemplates = templateManager.getAllTemplates();
console.log(`✅ Loaded ${allTemplates.length} templates`);

// Test 2: Template structure validation
console.log('\n2. Validating template structure...');
let structureErrors = 0;
strategyTemplates.forEach(template => {
  try {
    if (!template.id || !template.name || !template.template) {
      throw new Error(`Template ${template.id} missing required fields`);
    }
    if (!template.template.includes('//@version=6')) {
      throw new Error(`Template ${template.id} missing Pine Script v6 version`);
    }
    console.log(`✅ ${template.name} - structure valid`);
  } catch (error) {
    console.log(`❌ ${template.name} - ${error}`);
    structureErrors++;
  }
});

if (structureErrors === 0) {
  console.log('✅ All templates have valid structure');
} else {
  console.log(`❌ ${structureErrors} templates have structure issues`);
}

// Test 3: Code generation
console.log('\n3. Testing code generation...');
let generationErrors = 0;
strategyTemplates.forEach(template => {
  try {
    const code = templateManager.generateCode(template.id, {});
    if (!code.includes('//@version=6') || !code.includes('strategy(')) {
      throw new Error('Generated code missing required elements');
    }
    console.log(`✅ ${template.name} - code generation successful`);
  } catch (error) {
    console.log(`❌ ${template.name} - ${error}`);
    generationErrors++;
  }
});

if (generationErrors === 0) {
  console.log('✅ All templates generate valid code');
} else {
  console.log(`❌ ${generationErrors} templates have generation issues`);
}

// Test 4: Search functionality
console.log('\n4. Testing search functionality...');
const searchTests = [
  { query: 'moving average', expectedMin: 1 },
  { category: 'trend-following', expectedMin: 1 },
  { difficulty: 'beginner', expectedMin: 1 },
  { timeframes: ['1h'], expectedMin: 1 },
  { markets: ['forex'], expectedMin: 1 }
];

let searchErrors = 0;
searchTests.forEach(test => {
  try {
    const results = templateManager.searchTemplates(test);
    if (results.length < test.expectedMin) {
      throw new Error(`Expected at least ${test.expectedMin} results, got ${results.length}`);
    }
    console.log(`✅ Search test passed: ${JSON.stringify(test)} - ${results.length} results`);
  } catch (error) {
    console.log(`❌ Search test failed: ${JSON.stringify(test)} - ${error}`);
    searchErrors++;
  }
});

if (searchErrors === 0) {
  console.log('✅ All search tests passed');
} else {
  console.log(`❌ ${searchErrors} search tests failed`);
}

// Test 5: Parameter validation
console.log('\n5. Testing parameter validation...');
let paramErrors = 0;
try {
  // Test valid parameters
  templateManager.generateCode('sma-crossover', {
    fastLength: 10,
    slowLength: 30,
    source: 'close'
  });
  console.log('✅ Valid parameters accepted');

  // Test invalid parameter type
  try {
    templateManager.generateCode('sma-crossover', { fastLength: 'invalid' });
    throw new Error('Should have rejected invalid parameter type');
  } catch (error) {
    if (error instanceof Error && error.message.includes('must be an integer')) {
      console.log('✅ Invalid parameter type rejected');
    } else {
      throw error;
    }
  }

  // Test parameter range validation
  try {
    templateManager.generateCode('sma-crossover', { fastLength: 0 });
    throw new Error('Should have rejected out-of-range parameter');
  } catch (error) {
    if (error instanceof Error && error.message.includes('must be >=')) {
      console.log('✅ Out-of-range parameter rejected');
    } else {
      throw error;
    }
  }

} catch (error) {
  console.log(`❌ Parameter validation failed: ${error}`);
  paramErrors++;
}

if (paramErrors === 0) {
  console.log('✅ All parameter validation tests passed');
} else {
  console.log(`❌ ${paramErrors} parameter validation tests failed`);
}

// Test 6: Template statistics
console.log('\n6. Testing template statistics...');
try {
  const stats = templateManager.getTemplateStats();
  console.log(`✅ Template statistics:
  - Total templates: ${stats.totalTemplates}
  - Categories: ${Object.keys(stats.categoryCounts).join(', ')}
  - Difficulties: ${Object.keys(stats.difficultyCounts).join(', ')}
  - Average parameters per template: ${stats.averageParameters.toFixed(1)}`);
} catch (error) {
  console.log(`❌ Template statistics failed: ${error}`);
}

// Summary
console.log('\n📊 Validation Summary:');
const totalErrors = structureErrors + generationErrors + searchErrors + paramErrors;
if (totalErrors === 0) {
  console.log('🎉 All tests passed! Template system is working correctly.');
} else {
  console.log(`⚠️  ${totalErrors} issues found. Please review the errors above.`);
}

// Display available templates
console.log('\n📋 Available Templates:');
templateManager.getAllCategories().forEach(category => {
  console.log(`\n${category.icon} ${category.name}:`);
  const categoryTemplates = templateManager.getTemplatesByCategory(category.id);
  categoryTemplates.forEach(template => {
    console.log(`  - ${template.name} (${template.difficulty}) - ${template.description}`);
  });
});