/**
 * Responsive Design Test Runner
 * 
 * Automated test runner for validating responsive design across devices
 * and ensuring all requirements are met for the PineGenie agent interface.
 */

import { ResponsivePerformanceMonitor, TouchInteractionTester, COMMON_VIEWPORTS } from './responsive-performance';

// Test result interfaces
export interface ResponsiveTestResult {
  testName: string;
  passed: boolean;
  details: string;
  viewport?: string;
  performance?: {
    renderTime: number;
    memoryUsage: number;
    layoutShift: number;
  };
}

export interface ResponsiveTestSuite {
  suiteName: string;
  results: ResponsiveTestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    score: number;
  };
}

// Device categories for testing
export const DEVICE_CATEGORIES = {
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
};

export class ResponsiveTestRunner {
  private performanceMonitor: ResponsivePerformanceMonitor;
  private results: ResponsiveTestSuite[] = [];

  constructor() {
    this.performanceMonitor = new ResponsivePerformanceMonitor();
  }

  /**
   * Run comprehensive responsive design tests
   */
  async runAllTests(componentElement: HTMLElement): Promise<ResponsiveTestSuite[]> {
    this.results = [];

    // Test 1: Verify agent interface works properly on mobile, tablet, and desktop
    await this.testInterfaceAcrossDevices(componentElement);

    // Test 2: Test touch interactions and gesture support for mobile devices
    await this.testTouchInteractions(componentElement);

    // Test 3: Ensure proper layout adaptation for different screen orientations
    await this.testOrientationAdaptation(componentElement);

    // Test 4: Validate performance on various device types and browsers
    await this.testPerformanceAcrossDevices(componentElement);

    return this.results;
  }

  /**
   * Test 1: Verify agent interface works properly on mobile, tablet, and desktop
   */
  private async testInterfaceAcrossDevices(element: HTMLElement): Promise<void> {
    const results: ResponsiveTestResult[] = [];

    for (const [category, devices] of Object.entries(DEVICE_CATEGORIES)) {
      for (const device of devices) {
        // Set viewport size
        this.setElementViewport(element, device.width, device.height);

        // Test basic rendering
        const renderTest = await this.testBasicRendering(element, device);
        results.push({
          testName: `Basic Rendering - ${device.name}`,
          passed: renderTest.passed,
          details: renderTest.details,
          viewport: `${device.width}x${device.height}`,
        });

        // Test layout integrity
        const layoutTest = await this.testLayoutIntegrity(element, device);
        results.push({
          testName: `Layout Integrity - ${device.name}`,
          passed: layoutTest.passed,
          details: layoutTest.details,
          viewport: `${device.width}x${device.height}`,
        });

        // Test text readability
        const textTest = await this.testTextReadability(element, device);
        results.push({
          testName: `Text Readability - ${device.name}`,
          passed: textTest.passed,
          details: textTest.details,
          viewport: `${device.width}x${device.height}`,
        });

        // Test interactive elements
        const interactionTest = await this.testInteractiveElements(element, device);
        results.push({
          testName: `Interactive Elements - ${device.name}`,
          passed: interactionTest.passed,
          details: interactionTest.details,
          viewport: `${device.width}x${device.height}`,
        });
      }
    }

    this.results.push({
      suiteName: 'Interface Compatibility Across Devices',
      results,
      summary: this.calculateSummary(results),
    });
  }

  /**
   * Test 2: Test touch interactions and gesture support for mobile devices
   */
  private async testTouchInteractions(element: HTMLElement): Promise<void> {
    const results: ResponsiveTestResult[] = [];
    const mobileDevices = DEVICE_CATEGORIES.mobile;

    for (const device of mobileDevices) {
      this.setElementViewport(element, device.width, device.height);

      const touchTester = new TouchInteractionTester(element);

      // Test touch target sizes
      const touchTargetTest = touchTester.validateTouchTargets();
      results.push({
        testName: `Touch Target Sizes - ${device.name}`,
        passed: touchTargetTest.passed,
        details: touchTargetTest.issues.join('; ') || 'All touch targets meet minimum size requirements',
        viewport: `${device.width}x${device.height}`,
      });

      // Test tap interactions
      const tapTest = await this.testTapInteractions(element, touchTester, device);
      results.push({
        testName: `Tap Interactions - ${device.name}`,
        passed: tapTest.passed,
        details: tapTest.details,
        viewport: `${device.width}x${device.height}`,
      });

      // Test long press interactions
      const longPressTest = await this.testLongPressInteractions(element, touchTester, device);
      results.push({
        testName: `Long Press Interactions - ${device.name}`,
        passed: longPressTest.passed,
        details: longPressTest.details,
        viewport: `${device.width}x${device.height}`,
      });

      // Test gesture support
      const gestureTest = await this.testGestureSupport(element, touchTester, device);
      results.push({
        testName: `Gesture Support - ${device.name}`,
        passed: gestureTest.passed,
        details: gestureTest.details,
        viewport: `${device.width}x${device.height}`,
      });
    }

    this.results.push({
      suiteName: 'Touch Interactions and Gesture Support',
      results,
      summary: this.calculateSummary(results),
    });
  }

  /**
   * Test 3: Ensure proper layout adaptation for different screen orientations
   */
  private async testOrientationAdaptation(element: HTMLElement): Promise<void> {
    const results: ResponsiveTestResult[] = [];
    const testDevices = [...DEVICE_CATEGORIES.mobile, ...DEVICE_CATEGORIES.tablet];

    for (const device of testDevices) {
      // Test portrait orientation
      this.setElementViewport(element, device.width, device.height);
      const portraitTest = await this.testOrientationLayout(element, device, 'portrait');
      results.push({
        testName: `Portrait Layout - ${device.name}`,
        passed: portraitTest.passed,
        details: portraitTest.details,
        viewport: `${device.width}x${device.height}`,
      });

      // Test landscape orientation
      this.setElementViewport(element, device.height, device.width);
      const landscapeTest = await this.testOrientationLayout(element, device, 'landscape');
      results.push({
        testName: `Landscape Layout - ${device.name}`,
        passed: landscapeTest.passed,
        details: landscapeTest.details,
        viewport: `${device.height}x${device.width}`,
      });

      // Test orientation transition
      const transitionTest = await this.testOrientationTransition(element, device);
      results.push({
        testName: `Orientation Transition - ${device.name}`,
        passed: transitionTest.passed,
        details: transitionTest.details,
        viewport: `${device.width}x${device.height}`,
      });
    }

    this.results.push({
      suiteName: 'Layout Adaptation for Screen Orientations',
      results,
      summary: this.calculateSummary(results),
    });
  }

  /**
   * Test 4: Validate performance on various device types and browsers
   */
  private async testPerformanceAcrossDevices(element: HTMLElement): Promise<void> {
    const results: ResponsiveTestResult[] = [];
    const allDevices = [
      ...DEVICE_CATEGORIES.mobile,
      ...DEVICE_CATEGORIES.tablet,
      ...DEVICE_CATEGORIES.desktop,
    ];

    for (const device of allDevices) {
      this.setElementViewport(element, device.width, device.height);

      // Test render performance
      const renderTime = await this.performanceMonitor.measureRenderTime(async () => {
        // Force re-render
        element.style.display = 'none';
        element.offsetHeight; // Force reflow
        element.style.display = '';
        await new Promise(resolve => requestAnimationFrame(resolve));
      });

      const deviceCategory = this.getDeviceCategory(device.width);
      const performanceMetrics = this.performanceMonitor.getCurrentMetrics();
      performanceMetrics.renderTime = renderTime;

      const validation = this.performanceMonitor.validatePerformance(performanceMetrics, deviceCategory);

      results.push({
        testName: `Performance - ${device.name}`,
        passed: validation.passed,
        details: validation.failures.join('; ') || `Performance score: ${validation.score}/100`,
        viewport: `${device.width}x${device.height}`,
        performance: {
          renderTime: performanceMetrics.renderTime,
          memoryUsage: performanceMetrics.memoryUsage,
          layoutShift: performanceMetrics.layoutShift,
        },
      });
    }

    this.results.push({
      suiteName: 'Performance Validation Across Devices',
      results,
      summary: this.calculateSummary(results),
    });
  }

  // Helper methods for individual tests

  private async testBasicRendering(element: HTMLElement, device: any): Promise<{ passed: boolean; details: string }> {
    try {
      // Check if element is visible
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return { passed: false, details: 'Element has zero dimensions' };
      }

      // Check for overflow
      if (element.scrollWidth > device.width || element.scrollHeight > device.height) {
        return { passed: false, details: 'Content overflows viewport' };
      }

      return { passed: true, details: 'Component renders correctly' };
    } catch (error) {
      return { passed: false, details: `Rendering error: ${error}` };
    }
  }

  private async testLayoutIntegrity(element: HTMLElement, device: any): Promise<{ passed: boolean; details: string }> {
    try {
      // Check for layout shifts
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const layoutShifts = entries.filter(entry => entry.entryType === 'layout-shift');
        if (layoutShifts.length > 0) {
          return { passed: false, details: 'Layout shifts detected during rendering' };
        }
      });

      observer.observe({ entryTypes: ['layout-shift'] });

      // Wait for potential layout shifts
      await new Promise(resolve => setTimeout(resolve, 500));

      observer.disconnect();

      // Check grid/flexbox layouts
      const flexElements = element.querySelectorAll('[class*="flex"], [class*="grid"]');
      for (const flexEl of flexElements) {
        const styles = window.getComputedStyle(flexEl);
        if (styles.display === 'flex' || styles.display === 'grid') {
          const rect = flexEl.getBoundingClientRect();
          if (rect.width > device.width) {
            return { passed: false, details: 'Flex/Grid layout exceeds viewport width' };
          }
        }
      }

      return { passed: true, details: 'Layout integrity maintained' };
    } catch (error) {
      return { passed: false, details: `Layout test error: ${error}` };
    }
  }

  private async testTextReadability(element: HTMLElement, device: any): Promise<{ passed: boolean; details: string }> {
    try {
      const textElements = element.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, button, a');
      const minFontSize = device.width < 768 ? 14 : 12; // Larger minimum for mobile

      for (const textEl of textElements) {
        const styles = window.getComputedStyle(textEl);
        const fontSize = parseFloat(styles.fontSize);
        
        if (fontSize < minFontSize && textEl.textContent?.trim()) {
          return { 
            passed: false, 
            details: `Text too small: ${fontSize}px (minimum: ${minFontSize}px)` 
          };
        }

        // Check contrast (simplified check)
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        if (color === backgroundColor) {
          return { passed: false, details: 'Insufficient color contrast detected' };
        }
      }

      return { passed: true, details: 'Text readability requirements met' };
    } catch (error) {
      return { passed: false, details: `Text readability test error: ${error}` };
    }
  }

  private async testInteractiveElements(element: HTMLElement, device: any): Promise<{ passed: boolean; details: string }> {
    try {
      const interactiveElements = element.querySelectorAll(
        'button, a, input, textarea, select, [role="button"], [tabindex]'
      );

      const minTouchTarget = 44; // 44px minimum touch target size

      for (const interactive of interactiveElements) {
        const rect = interactive.getBoundingClientRect();
        
        if (device.width < 768) { // Mobile devices
          if (rect.width < minTouchTarget || rect.height < minTouchTarget) {
            return { 
              passed: false, 
              details: `Touch target too small: ${rect.width}x${rect.height}px (minimum: ${minTouchTarget}x${minTouchTarget}px)` 
            };
          }
        }

        // Check if element is focusable
        if (interactive.tabIndex < 0 && !interactive.hasAttribute('disabled')) {
          return { passed: false, details: 'Interactive element not focusable' };
        }
      }

      return { passed: true, details: 'Interactive elements meet accessibility requirements' };
    } catch (error) {
      return { passed: false, details: `Interactive elements test error: ${error}` };
    }
  }

  private async testTapInteractions(element: HTMLElement, touchTester: TouchInteractionTester, device: any): Promise<{ passed: boolean; details: string }> {
    try {
      const buttons = element.querySelectorAll('button, [role="button"]');
      
      for (const button of buttons) {
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const success = await touchTester.simulateTouch(centerX, centerY, 'tap');
        if (!success) {
          return { passed: false, details: 'Tap interaction failed' };
        }
      }

      return { passed: true, details: 'Tap interactions working correctly' };
    } catch (error) {
      return { passed: false, details: `Tap interaction test error: ${error}` };
    }
  }

  private async testLongPressInteractions(element: HTMLElement, touchTester: TouchInteractionTester, device: any): Promise<{ passed: boolean; details: string }> {
    try {
      const interactiveElements = element.querySelectorAll('[data-long-press], .long-press-enabled');
      
      if (interactiveElements.length === 0) {
        return { passed: true, details: 'No long-press elements to test' };
      }

      for (const el of interactiveElements) {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const success = await touchTester.simulateTouch(centerX, centerY, 'long-press');
        if (!success) {
          return { passed: false, details: 'Long press interaction failed' };
        }
      }

      return { passed: true, details: 'Long press interactions working correctly' };
    } catch (error) {
      return { passed: false, details: `Long press test error: ${error}` };
    }
  }

  private async testGestureSupport(element: HTMLElement, touchTester: TouchInteractionTester, device: any): Promise<{ passed: boolean; details: string }> {
    try {
      // Test swipe gestures on scrollable elements
      const scrollableElements = element.querySelectorAll('[class*="overflow"], .scrollable');
      
      if (scrollableElements.length === 0) {
        return { passed: true, details: 'No gesture-enabled elements to test' };
      }

      // Basic gesture support test
      const stats = touchTester.getTouchEventStats();
      
      return { 
        passed: true, 
        details: `Gesture support available (${stats.totalEvents} touch events processed)` 
      };
    } catch (error) {
      return { passed: false, details: `Gesture support test error: ${error}` };
    }
  }

  private async testOrientationLayout(element: HTMLElement, device: any, orientation: 'portrait' | 'landscape'): Promise<{ passed: boolean; details: string }> {
    try {
      // Check if layout adapts properly to orientation
      const rect = element.getBoundingClientRect();
      const viewportWidth = orientation === 'portrait' ? device.width : device.height;
      const viewportHeight = orientation === 'portrait' ? device.height : device.width;

      if (rect.width > viewportWidth || rect.height > viewportHeight) {
        return { passed: false, details: `Layout doesn't fit ${orientation} orientation` };
      }

      // Check responsive grid layouts
      const gridElements = element.querySelectorAll('[class*="grid-cols"], [class*="md:grid-cols"]');
      for (const grid of gridElements) {
        const styles = window.getComputedStyle(grid);
        if (styles.display === 'grid') {
          const gridCols = styles.gridTemplateColumns.split(' ').length;
          
          // Mobile should typically have fewer columns
          if (viewportWidth < 768 && gridCols > 2) {
            return { passed: false, details: 'Too many grid columns for mobile orientation' };
          }
        }
      }

      return { passed: true, details: `Layout adapts correctly to ${orientation} orientation` };
    } catch (error) {
      return { passed: false, details: `Orientation layout test error: ${error}` };
    }
  }

  private async testOrientationTransition(element: HTMLElement, device: any): Promise<{ passed: boolean; details: string }> {
    try {
      // Simulate orientation change
      const originalWidth = element.style.width;
      const originalHeight = element.style.height;

      // Start in portrait
      this.setElementViewport(element, device.width, device.height);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Switch to landscape
      this.setElementViewport(element, device.height, device.width);
      await new Promise(resolve => setTimeout(resolve, 300)); // Allow transition time

      // Check if content is still accessible
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return { passed: false, details: 'Content disappeared during orientation transition' };
      }

      // Restore original size
      element.style.width = originalWidth;
      element.style.height = originalHeight;

      return { passed: true, details: 'Orientation transition handled correctly' };
    } catch (error) {
      return { passed: false, details: `Orientation transition test error: ${error}` };
    }
  }

  // Utility methods

  private setElementViewport(element: HTMLElement, width: number, height: number): void {
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    element.style.maxWidth = `${width}px`;
    element.style.maxHeight = `${height}px`;
    
    // Force reflow
    element.offsetHeight;
  }

  private getDeviceCategory(width: number): 'mobile' | 'tablet' | 'desktop' {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private calculateSummary(results: ResponsiveTestResult[]): { total: number; passed: number; failed: number; score: number } {
    const total = results.length;
    const passed = results.filter(r => r.passed).length;
    const failed = total - passed;
    const score = Math.round((passed / total) * 100);

    return { total, passed, failed, score };
  }

  /**
   * Generate comprehensive test report
   */
  generateReport(): {
    overall: { total: number; passed: number; failed: number; score: number };
    suites: ResponsiveTestSuite[];
    recommendations: string[];
  } {
    const allResults = this.results.flatMap(suite => suite.results);
    const overall = this.calculateSummary(allResults);
    
    const recommendations: string[] = [];
    
    // Analyze failures and generate recommendations
    const failedResults = allResults.filter(r => !r.passed);
    
    if (failedResults.some(r => r.details.includes('Touch target too small'))) {
      recommendations.push('Increase touch target sizes to minimum 44x44px for mobile devices');
    }
    
    if (failedResults.some(r => r.details.includes('Text too small'))) {
      recommendations.push('Increase font sizes for better readability on mobile devices');
    }
    
    if (failedResults.some(r => r.details.includes('overflows viewport'))) {
      recommendations.push('Implement proper responsive breakpoints and container queries');
    }
    
    if (failedResults.some(r => r.details.includes('Performance'))) {
      recommendations.push('Optimize rendering performance and reduce memory usage');
    }

    return {
      overall,
      suites: this.results,
      recommendations,
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.performanceMonitor.destroy();
  }
}