/**
 * Responsive Design Validation Script
 * 
 * Comprehensive validation script that verifies all responsive design requirements
 * for task 3.4 are met across the PineGenie agent interface.
 */

import { executeResponsiveTests, saveTestResults } from './run-responsive-tests';

// Validation criteria based on task requirements
const VALIDATION_CRITERIA = {
  // Requirement 1.3: Agent interface works properly on mobile, tablet, and desktop
  interfaceCompatibility: {
    minScore: 90, // 90% of tests must pass
    requiredDevices: ['iPhone SE', 'iPhone 12', 'iPad Mini', 'iPad Pro', 'Desktop 1080p'],
    requiredComponents: ['chat', 'welcome-cards', 'both'],
  },
  
  // Requirement 1.5: Touch interactions and gesture support for mobile devices
  touchInteractions: {
    minScore: 95, // 95% of touch tests must pass
    requiredTests: ['touch-targets', 'tap-interactions', 'gesture-support'],
    minTouchTargetSize: 44, // pixels
  },
  
  // Layout adaptation for different screen orientations
  orientationSupport: {
    minScore: 85, // 85% of orientation tests must pass
    requiredOrientations: ['portrait', 'landscape'],
    requiredDeviceTypes: ['mobile', 'tablet'],
  },
  
  // Performance validation on various device types
  performanceRequirements: {
    mobile: { maxRenderTime: 100, maxMemoryUsage: 50 }, // ms, MB
    tablet: { maxRenderTime: 80, maxMemoryUsage: 75 },
    desktop: { maxRenderTime: 50, maxMemoryUsage: 100 },
    minPerformanceScore: 80, // 80% of performance tests must pass
  },
};

// Validation result interface
interface ValidationResult {
  taskCompleted: boolean;
  overallScore: number;
  criteriaResults: {
    interfaceCompatibility: CriteriaResult;
    touchInteractions: CriteriaResult;
    orientationSupport: CriteriaResult;
    performanceRequirements: CriteriaResult;
  };
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    criticalIssues: string[];
    recommendations: string[];
  };
  detailedResults: any;
}

interface CriteriaResult {
  passed: boolean;
  score: number;
  details: string;
  issues: string[];
}

/**
 * Main validation function
 */
export async function validateResponsiveDesign(): Promise<ValidationResult> {
  console.log('🔍 Starting responsive design validation for task 3.4...\n');
  
  // Execute comprehensive tests
  const testResults = await executeResponsiveTests();
  
  // Validate against criteria
  const validation: ValidationResult = {
    taskCompleted: false,
    overallScore: 0,
    criteriaResults: {
      interfaceCompatibility: validateInterfaceCompatibility(testResults),
      touchInteractions: validateTouchInteractions(testResults),
      orientationSupport: validateOrientationSupport(testResults),
      performanceRequirements: validatePerformanceRequirements(testResults),
    },
    summary: {
      totalTests: testResults.totalTests,
      passedTests: testResults.passedTests,
      failedTests: testResults.failedTests,
      criticalIssues: [],
      recommendations: testResults.recommendations,
    },
    detailedResults: testResults,
  };

  // Calculate overall score and task completion
  const criteriaScores = Object.values(validation.criteriaResults).map(c => c.score);
  validation.overallScore = Math.round(criteriaScores.reduce((a, b) => a + b, 0) / criteriaScores.length);
  
  // Task is completed if all criteria pass and overall score is above threshold
  const allCriteriaPassed = Object.values(validation.criteriaResults).every(c => c.passed);
  validation.taskCompleted = allCriteriaPassed && validation.overallScore >= 85;

  // Collect critical issues
  validation.summary.criticalIssues = Object.values(validation.criteriaResults)
    .filter(c => !c.passed)
    .flatMap(c => c.issues);

  // Generate final report
  generateValidationReport(validation);
  
  return validation;
}

/**
 * Validate interface compatibility across devices
 */
function validateInterfaceCompatibility(testResults: any): CriteriaResult {
  const criteria = VALIDATION_CRITERIA.interfaceCompatibility;
  const relevantResults = testResults.componentResults.filter((r: any) => 
    criteria.requiredDevices.includes(r.device) && 
    criteria.requiredComponents.includes(r.component)
  );
  
  const passedTests = relevantResults.filter((r: any) => r.passed).length;
  const score = Math.round((passedTests / relevantResults.length) * 100);
  const passed = score >= criteria.minScore;
  
  const issues: string[] = [];
  if (!passed) {
    const failedDevices = relevantResults
      .filter((r: any) => !r.passed)
      .map((r: any) => r.device);
    issues.push(`Interface compatibility failed on: ${[...new Set(failedDevices)].join(', ')}`);
  }

  return {
    passed,
    score,
    details: `Interface compatibility: ${score}% (required: ${criteria.minScore}%)`,
    issues,
  };
}

/**
 * Validate touch interactions and gesture support
 */
function validateTouchInteractions(testResults: any): CriteriaResult {
  const criteria = VALIDATION_CRITERIA.touchInteractions;
  const touchResults = testResults.componentResults.filter((r: any) => 
    r.testMode === 'interaction' && 
    ['mobile'].includes(r.deviceCategory)
  );
  
  const passedTests = touchResults.filter((r: any) => r.passed).length;
  const score = touchResults.length > 0 ? Math.round((passedTests / touchResults.length) * 100) : 0;
  const passed = score >= criteria.minScore;
  
  const issues: string[] = [];
  if (!passed) {
    const touchIssues = touchResults
      .filter((r: any) => !r.passed)
      .flatMap((r: any) => r.issues)
      .filter((issue: string) => issue.includes('touch') || issue.includes('Touch'));
    issues.push(...touchIssues);
  }

  return {
    passed,
    score,
    details: `Touch interactions: ${score}% (required: ${criteria.minScore}%)`,
    issues,
  };
}

/**
 * Validate orientation support
 */
function validateOrientationSupport(testResults: any): CriteriaResult {
  const criteria = VALIDATION_CRITERIA.orientationSupport;
  const orientationResults = testResults.componentResults.filter((r: any) => 
    criteria.requiredDeviceTypes.includes(r.deviceCategory) &&
    criteria.requiredOrientations.includes(r.orientation)
  );
  
  const passedTests = orientationResults.filter((r: any) => r.passed).length;
  const score = orientationResults.length > 0 ? Math.round((passedTests / orientationResults.length) * 100) : 0;
  const passed = score >= criteria.minScore;
  
  const issues: string[] = [];
  if (!passed) {
    const orientationIssues = orientationResults
      .filter((r: any) => !r.passed)
      .map((r: any) => `${r.device} (${r.orientation}): ${r.issues.join(', ')}`);
    issues.push(...orientationIssues);
  }

  return {
    passed,
    score,
    details: `Orientation support: ${score}% (required: ${criteria.minScore}%)`,
    issues,
  };
}

/**
 * Validate performance requirements
 */
function validatePerformanceRequirements(testResults: any): CriteriaResult {
  const criteria = VALIDATION_CRITERIA.performanceRequirements;
  const performanceResults = testResults.componentResults.filter((r: any) => 
    r.testMode === 'performance' && r.performance
  );
  
  let passedTests = 0;
  const issues: string[] = [];
  
  for (const result of performanceResults) {
    const deviceCategory = result.deviceCategory as keyof typeof criteria;
    if (deviceCategory === 'minPerformanceScore') continue;
    
    const requirements = criteria[deviceCategory];
    if (!requirements) continue;
    
    const { renderTime, memoryUsage } = result.performance;
    let testPassed = true;
    
    if (renderTime > requirements.maxRenderTime) {
      testPassed = false;
      issues.push(`${result.device}: Render time ${renderTime.toFixed(2)}ms exceeds ${requirements.maxRenderTime}ms`);
    }
    
    if (memoryUsage > requirements.maxMemoryUsage) {
      testPassed = false;
      issues.push(`${result.device}: Memory usage ${memoryUsage.toFixed(1)}MB exceeds ${requirements.maxMemoryUsage}MB`);
    }
    
    if (testPassed) passedTests++;
  }
  
  const score = performanceResults.length > 0 ? Math.round((passedTests / performanceResults.length) * 100) : 0;
  const passed = score >= criteria.minPerformanceScore;

  return {
    passed,
    score,
    details: `Performance: ${score}% (required: ${criteria.minPerformanceScore}%)`,
    issues,
  };
}

/**
 * Generate comprehensive validation report
 */
function generateValidationReport(validation: ValidationResult): void {
  console.log('\n📋 RESPONSIVE DESIGN VALIDATION REPORT');
  console.log('=====================================\n');
  
  // Task completion status
  const statusIcon = validation.taskCompleted ? '✅' : '❌';
  const statusText = validation.taskCompleted ? 'COMPLETED' : 'INCOMPLETE';
  console.log(`${statusIcon} Task 3.4 Status: ${statusText}`);
  console.log(`📊 Overall Score: ${validation.overallScore}%\n`);
  
  // Criteria breakdown
  console.log('📋 Criteria Results:');
  console.log('-------------------');
  
  Object.entries(validation.criteriaResults).forEach(([criterion, result]) => {
    const icon = result.passed ? '✅' : '❌';
    const name = criterion.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${icon} ${name}: ${result.score}%`);
    console.log(`   ${result.details}`);
    
    if (result.issues.length > 0) {
      console.log('   Issues:');
      result.issues.forEach(issue => console.log(`   • ${issue}`));
    }
    console.log('');
  });
  
  // Test summary
  console.log('📊 Test Summary:');
  console.log('---------------');
  console.log(`Total Tests: ${validation.summary.totalTests}`);
  console.log(`Passed: ${validation.summary.passedTests}`);
  console.log(`Failed: ${validation.summary.failedTests}`);
  console.log(`Success Rate: ${Math.round((validation.summary.passedTests / validation.summary.totalTests) * 100)}%\n`);
  
  // Critical issues
  if (validation.summary.criticalIssues.length > 0) {
    console.log('🚨 Critical Issues:');
    console.log('------------------');
    validation.summary.criticalIssues.forEach(issue => console.log(`• ${issue}`));
    console.log('');
  }
  
  // Recommendations
  if (validation.summary.recommendations.length > 0) {
    console.log('💡 Recommendations:');
    console.log('------------------');
    validation.summary.recommendations.forEach(rec => console.log(`• ${rec}`));
    console.log('');
  }
  
  // Task requirements verification
  console.log('✅ Task Requirements Verification:');
  console.log('--------------------------------');
  console.log(`• Agent interface works on mobile, tablet, desktop: ${validation.criteriaResults.interfaceCompatibility.passed ? '✅' : '❌'}`);
  console.log(`• Touch interactions and gesture support: ${validation.criteriaResults.touchInteractions.passed ? '✅' : '❌'}`);
  console.log(`• Layout adaptation for orientations: ${validation.criteriaResults.orientationSupport.passed ? '✅' : '❌'}`);
  console.log(`• Performance validation across devices: ${validation.criteriaResults.performanceRequirements.passed ? '✅' : '❌'}`);
  
  console.log('\n=====================================');
  
  if (validation.taskCompleted) {
    console.log('🎉 Task 3.4 "Test responsive design across devices" has been successfully completed!');
    console.log('All responsive design requirements have been validated and are working correctly.');
  } else {
    console.log('⚠️  Task 3.4 requires additional work to meet all requirements.');
    console.log('Please address the issues listed above and re-run the validation.');
  }
  
  console.log('=====================================\n');
}

/**
 * Run validation and save results
 */
export async function runValidation(): Promise<void> {
  try {
    const validation = await validateResponsiveDesign();
    
    // Save detailed results
    saveTestResults(validation.detailedResults, `responsive-validation-${Date.now()}.json`);
    
    // Exit with appropriate code
    if (validation.taskCompleted) {
      console.log('✅ Validation completed successfully!');
      process.exit(0);
    } else {
      console.log('❌ Validation failed. Please address the issues and try again.');
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Validation failed with error:', error);
    process.exit(1);
  }
}

// Export validation functions
export { VALIDATION_CRITERIA, type ValidationResult, type CriteriaResult };

// Run validation if this script is executed directly
if (typeof window === 'undefined' && require.main === module) {
  runValidation();
}