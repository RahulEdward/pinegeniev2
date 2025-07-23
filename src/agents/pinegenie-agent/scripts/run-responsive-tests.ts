/**
 * Responsive Design Test Execution Script
 * 
 * Automated script to run comprehensive responsive design tests
 * for the PineGenie agent interface across all device types.
 */

import { ResponsiveTestRunner } from '../utils/responsive-test-runner';
import { runResponsiveTests } from '../utils/responsive-performance';

// Test configuration
const TEST_CONFIG = {
  components: ['chat', 'welcome-cards', 'both'] as const,
  devices: {
    mobile: [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'iPhone 12 Pro Max', width: 428, height: 926 },
      { name: 'Samsung Galaxy S21', width: 384, height: 854 },
    ],
    tablet: [
      { name: 'iPad Mini', width: 768, height: 1024 },
      { name: 'iPad Pro', width: 1024, height: 1366 },
      { name: 'Surface Pro', width: 912, height: 1368 },
    ],
    desktop: [
      { name: 'MacBook Air', width: 1440, height: 900 },
      { name: 'Desktop 1080p', width: 1920, height: 1080 },
      { name: 'Desktop 4K', width: 3840, height: 2160 },
    ],
  },
  orientations: ['portrait', 'landscape'] as const,
  testModes: ['visual', 'interaction', 'performance'] as const,
};

// Test results interface
interface TestExecutionResult {
  timestamp: string;
  duration: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  score: number;
  componentResults: ComponentTestResult[];
  recommendations: string[];
  detailedReport: any;
}

interface ComponentTestResult {
  component: string;
  deviceCategory: string;
  device: string;
  orientation: string;
  testMode: string;
  passed: boolean;
  issues: string[];
  performance?: {
    renderTime: number;
    memoryUsage: number;
    layoutShift: number;
  };
}

/**
 * Main test execution function
 */
export async function executeResponsiveTests(): Promise<TestExecutionResult> {
  console.log('🚀 Starting comprehensive responsive design tests...');
  const startTime = Date.now();
  
  const results: ComponentTestResult[] = [];
  let totalTests = 0;
  let passedTests = 0;

  // Test each component type
  for (const component of TEST_CONFIG.components) {
    console.log(`\n📱 Testing ${component} component...`);
    
    // Create test element for the component
    const testElement = await createTestElement(component);
    
    if (!testElement) {
      console.error(`❌ Failed to create test element for ${component}`);
      continue;
    }

    // Test across all device categories
    for (const [deviceCategory, devices] of Object.entries(TEST_CONFIG.devices)) {
      console.log(`  📊 Testing on ${deviceCategory} devices...`);
      
      for (const device of devices) {
        // Test both orientations for mobile and tablet
        const orientations = deviceCategory === 'desktop' 
          ? ['landscape'] 
          : TEST_CONFIG.orientations;
        
        for (const orientation of orientations) {
          for (const testMode of TEST_CONFIG.testModes) {
            totalTests++;
            
            const testResult = await runSingleTest({
              component,
              deviceCategory,
              device,
              orientation,
              testMode,
              element: testElement,
            });
            
            results.push(testResult);
            
            if (testResult.passed) {
              passedTests++;
              console.log(`    ✅ ${device.name} (${orientation}, ${testMode})`);
            } else {
              console.log(`    ❌ ${device.name} (${orientation}, ${testMode}): ${testResult.issues.join(', ')}`);
            }
          }
        }
      }
    }
    
    // Cleanup test element
    testElement.remove();
  }

  const endTime = Date.now();
  const duration = endTime - startTime;
  const score = Math.round((passedTests / totalTests) * 100);

  // Generate recommendations
  const recommendations = generateRecommendations(results);

  const finalResult: TestExecutionResult = {
    timestamp: new Date().toISOString(),
    duration,
    totalTests,
    passedTests,
    failedTests: totalTests - passedTests,
    score,
    componentResults: results,
    recommendations,
    detailedReport: generateDetailedReport(results),
  };

  // Log summary
  console.log('\n📊 Test Execution Summary:');
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   Passed: ${passedTests}`);
  console.log(`   Failed: ${totalTests - passedTests}`);
  console.log(`   Score: ${score}%`);
  console.log(`   Duration: ${(duration / 1000).toFixed(2)}s`);

  if (recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    recommendations.forEach(rec => console.log(`   • ${rec}`));
  }

  return finalResult;
}

/**
 * Create test element for a specific component
 */
async function createTestElement(component: string): Promise<HTMLElement | null> {
  try {
    // Create container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    container.style.visibility = 'hidden';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);

    // Dynamically import and render component
    switch (component) {
      case 'chat':
        // Simulate chat interface
        container.innerHTML = `
          <div class="flex flex-col h-full rounded-lg shadow-lg overflow-hidden" style="width: 100%; height: 100%; background: #1a1a1a; border: 1px solid #334155;">
            <div class="flex items-center gap-3 p-4 border-b" style="border-color: #334155;">
              <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: #0ea5e9;">
                <span style="color: white;">🤖</span>
              </div>
              <div>
                <h3 class="font-semibold text-lg" style="color: #ededed;">PineGenie AI</h3>
                <p class="text-sm" style="color: #cbd5e1;">Test Mode</p>
              </div>
            </div>
            <div class="flex-1 overflow-y-auto p-4" style="background: #0a0a0a;">
              <div class="space-y-4">
                <div class="flex gap-3 justify-start">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center" style="background: #0ea5e9;">
                    <span style="color: white; font-size: 12px;">🤖</span>
                  </div>
                  <div class="rounded-2xl p-3 max-w-[70%]" style="background: #1e293b; color: #ededed;">
                    <p class="text-sm">Hello! I'm PineGenie AI, ready to help with Pine Script.</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="p-4 border-t" style="border-color: #334155;">
              <div class="flex gap-2 items-end">
                <textarea class="flex-1 resize-none rounded-lg border px-4 py-3 text-sm" style="background: #1a1a1a; border-color: #334155; color: #ededed; min-height: 50px;" placeholder="Ask about Pine Script..."></textarea>
                <button class="rounded-full p-3" style="background: #0ea5e9; color: white;">
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        `;
        break;

      case 'welcome-cards':
        // Simulate welcome cards
        container.innerHTML = `
          <div class="welcome-cards-container p-4">
            <div class="text-center mb-6">
              <div class="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style="background: rgba(14, 165, 233, 0.2);">
                <span style="color: #0ea5e9; font-size: 24px;">🤖</span>
              </div>
              <h3 class="text-2xl font-medium mb-2" style="color: #ededed;">Welcome to PineGenie AI</h3>
              <p class="text-base" style="color: #cbd5e1;">Your TradingView Pine Script assistant</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div class="rounded-xl p-4 cursor-pointer transition-all duration-300" style="background: #1a1a1a; color: #ededed; border: 1px solid #334155;">
                <div class="flex items-start gap-3">
                  <div class="p-2 rounded-lg" style="background: #1e293b;">
                    <span style="color: #0ea5e9;">📈</span>
                  </div>
                  <div class="flex-1">
                    <h4 class="font-medium text-base mb-1">Create Trading Strategy</h4>
                    <p class="text-sm" style="color: #cbd5e1;">Generate Pine Script code for your trading ideas</p>
                  </div>
                  <div>→</div>
                </div>
              </div>
              <div class="rounded-xl p-4 cursor-pointer transition-all duration-300" style="background: #1a1a1a; color: #ededed; border: 1px solid #334155;">
                <div class="flex items-start gap-3">
                  <div class="p-2 rounded-lg" style="background: #1e293b;">
                    <span style="color: #cbd5e1;">📚</span>
                  </div>
                  <div class="flex-1">
                    <h4 class="font-medium text-base mb-1">Learn Pine Script</h4>
                    <p class="text-sm" style="color: #cbd5e1;">Get explanations and examples</p>
                  </div>
                  <div>→</div>
                </div>
              </div>
            </div>
          </div>
        `;
        break;

      case 'both':
        // Simulate full interface
        container.innerHTML = `
          <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
            <div class="flex-1" style="min-height: 400px;">
              ${container.innerHTML || ''}
            </div>
          </div>
        `;
        break;
    }

    return container;
  } catch (error) {
    console.error('Error creating test element:', error);
    return null;
  }
}

/**
 * Run a single test configuration
 */
async function runSingleTest(config: {
  component: string;
  deviceCategory: string;
  device: any;
  orientation: string;
  testMode: string;
  element: HTMLElement;
}): Promise<ComponentTestResult> {
  const { component, deviceCategory, device, orientation, testMode, element } = config;
  
  try {
    // Set viewport dimensions
    const width = orientation === 'landscape' ? device.height : device.width;
    const height = orientation === 'landscape' ? device.width : device.height;
    
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    element.style.maxWidth = `${width}px`;
    element.style.maxHeight = `${height}px`;
    
    // Force reflow
    element.offsetHeight;
    
    const issues: string[] = [];
    let performance: ComponentTestResult['performance'];

    // Run tests based on mode
    switch (testMode) {
      case 'visual':
        await runVisualTests(element, device, issues);
        break;
      case 'interaction':
        await runInteractionTests(element, device, issues);
        break;
      case 'performance':
        performance = await runPerformanceTests(element, device, issues);
        break;
    }

    return {
      component,
      deviceCategory,
      device: device.name,
      orientation,
      testMode,
      passed: issues.length === 0,
      issues,
      performance,
    };
  } catch (error) {
    return {
      component,
      deviceCategory,
      device: device.name,
      orientation,
      testMode,
      passed: false,
      issues: [`Test execution error: ${error}`],
    };
  }
}

/**
 * Run visual tests
 */
async function runVisualTests(element: HTMLElement, device: any, issues: string[]): Promise<void> {
  // Check for overflow
  if (element.scrollWidth > device.width || element.scrollHeight > device.height) {
    issues.push('Content overflows viewport');
  }

  // Check text readability
  const textElements = element.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, button, a');
  const minFontSize = device.width < 768 ? 14 : 12;

  for (const textEl of textElements) {
    const styles = window.getComputedStyle(textEl);
    const fontSize = parseFloat(styles.fontSize);
    
    if (fontSize < minFontSize && textEl.textContent?.trim()) {
      issues.push(`Text too small: ${fontSize}px (minimum: ${minFontSize}px)`);
      break;
    }
  }

  // Check layout integrity
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    issues.push('Element has zero dimensions');
  }
}

/**
 * Run interaction tests
 */
async function runInteractionTests(element: HTMLElement, device: any, issues: string[]): Promise<void> {
  const interactiveElements = element.querySelectorAll(
    'button, a, input, textarea, select, [role="button"], [tabindex]'
  );

  const minTouchTarget = 44;

  for (const interactive of interactiveElements) {
    const rect = interactive.getBoundingClientRect();
    
    if (device.width < 768) { // Mobile devices
      if (rect.width < minTouchTarget || rect.height < minTouchTarget) {
        issues.push(`Touch target too small: ${rect.width}x${rect.height}px`);
        break;
      }
    }
  }
}

/**
 * Run performance tests
 */
async function runPerformanceTests(element: HTMLElement, device: any, issues: string[]): Promise<ComponentTestResult['performance']> {
  const startTime = performance.now();
  
  // Force re-render
  element.style.display = 'none';
  element.offsetHeight;
  element.style.display = '';
  
  const renderTime = performance.now() - startTime;
  
  // Get memory usage (if available)
  const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
  
  // Performance thresholds
  const thresholds = {
    mobile: { renderTime: 100, memoryUsage: 50 * 1024 * 1024 },
    tablet: { renderTime: 80, memoryUsage: 75 * 1024 * 1024 },
    desktop: { renderTime: 50, memoryUsage: 100 * 1024 * 1024 },
  };
  
  const deviceCategory = device.width < 768 ? 'mobile' : device.width < 1024 ? 'tablet' : 'desktop';
  const threshold = thresholds[deviceCategory];
  
  if (renderTime > threshold.renderTime) {
    issues.push(`Render time ${renderTime.toFixed(2)}ms exceeds ${threshold.renderTime}ms threshold`);
  }
  
  if (memoryUsage > threshold.memoryUsage) {
    issues.push(`Memory usage ${(memoryUsage / 1024 / 1024).toFixed(1)}MB exceeds ${(threshold.memoryUsage / 1024 / 1024).toFixed(1)}MB threshold`);
  }

  return {
    renderTime,
    memoryUsage: memoryUsage / 1024 / 1024, // Convert to MB
    layoutShift: 0, // Would need more complex measurement
  };
}

/**
 * Generate recommendations based on test results
 */
function generateRecommendations(results: ComponentTestResult[]): string[] {
  const recommendations: string[] = [];
  const failedResults = results.filter(r => !r.passed);
  
  if (failedResults.some(r => r.issues.some(i => i.includes('Touch target too small')))) {
    recommendations.push('Increase touch target sizes to minimum 44x44px for mobile devices');
  }
  
  if (failedResults.some(r => r.issues.some(i => i.includes('Text too small')))) {
    recommendations.push('Increase font sizes for better readability on mobile devices');
  }
  
  if (failedResults.some(r => r.issues.some(i => i.includes('overflows viewport')))) {
    recommendations.push('Implement proper responsive breakpoints and container queries');
  }
  
  if (failedResults.some(r => r.issues.some(i => i.includes('Render time')))) {
    recommendations.push('Optimize rendering performance for better user experience');
  }

  if (failedResults.some(r => r.issues.some(i => i.includes('Memory usage')))) {
    recommendations.push('Reduce memory usage by optimizing component rendering');
  }

  return recommendations;
}

/**
 * Generate detailed report
 */
function generateDetailedReport(results: ComponentTestResult[]): any {
  const report = {
    summary: {
      byComponent: {} as Record<string, { total: number; passed: number; failed: number }>,
      byDevice: {} as Record<string, { total: number; passed: number; failed: number }>,
      byTestMode: {} as Record<string, { total: number; passed: number; failed: number }>,
    },
    failures: results.filter(r => !r.passed),
    performance: results.filter(r => r.performance).map(r => ({
      device: r.device,
      component: r.component,
      performance: r.performance,
    })),
  };

  // Calculate summaries
  for (const result of results) {
    // By component
    if (!report.summary.byComponent[result.component]) {
      report.summary.byComponent[result.component] = { total: 0, passed: 0, failed: 0 };
    }
    report.summary.byComponent[result.component].total++;
    if (result.passed) {
      report.summary.byComponent[result.component].passed++;
    } else {
      report.summary.byComponent[result.component].failed++;
    }

    // By device
    if (!report.summary.byDevice[result.device]) {
      report.summary.byDevice[result.device] = { total: 0, passed: 0, failed: 0 };
    }
    report.summary.byDevice[result.device].total++;
    if (result.passed) {
      report.summary.byDevice[result.device].passed++;
    } else {
      report.summary.byDevice[result.device].failed++;
    }

    // By test mode
    if (!report.summary.byTestMode[result.testMode]) {
      report.summary.byTestMode[result.testMode] = { total: 0, passed: 0, failed: 0 };
    }
    report.summary.byTestMode[result.testMode].total++;
    if (result.passed) {
      report.summary.byTestMode[result.testMode].passed++;
    } else {
      report.summary.byTestMode[result.testMode].failed++;
    }
  }

  return report;
}

/**
 * Save test results to file
 */
export function saveTestResults(results: TestExecutionResult, filename?: string): void {
  const fileName = filename || `responsive-test-results-${Date.now()}.json`;
  const jsonResults = JSON.stringify(results, null, 2);
  
  try {
    // In a browser environment, we can't directly write files
    // Instead, we'll create a downloadable blob
    const blob = new Blob([jsonResults], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`📄 Test results saved as ${fileName}`);
  } catch (error) {
    console.error('Error saving test results:', error);
  }
}

// Export for use in other modules
export { TEST_CONFIG, type TestExecutionResult, type ComponentTestResult };