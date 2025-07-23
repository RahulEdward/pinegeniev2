/**
 * Responsive Performance Testing Utilities
 * 
 * Utilities for measuring and validating performance across different devices
 * and screen sizes for the PineGenie agent interface.
 */

// Performance thresholds for different device types
export const PERFORMANCE_THRESHOLDS = {
  mobile: {
    renderTime: 100, // ms
    layoutShift: 0.1,
    memoryUsage: 50, // MB
    frameRate: 30, // fps
  },
  tablet: {
    renderTime: 80,
    layoutShift: 0.05,
    memoryUsage: 75,
    frameRate: 45,
  },
  desktop: {
    renderTime: 50,
    layoutShift: 0.02,
    memoryUsage: 100,
    frameRate: 60,
  },
};

// Device categories based on viewport width
export const getDeviceCategory = (width: number): 'mobile' | 'tablet' | 'desktop' => {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Performance metrics interface
export interface PerformanceMetrics {
  renderTime: number;
  layoutShift: number;
  memoryUsage: number;
  frameRate: number;
  reflows: number;
  repaints: number;
  timestamp: number;
}

// Performance monitor class
export class ResponsivePerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private observer: PerformanceObserver | null = null;
  private frameCount = 0;
  private lastFrameTime = 0;
  private animationId: number | null = null;

  constructor() {
    this.setupPerformanceObserver();
    this.startFrameRateMonitoring();
  }

  private setupPerformanceObserver() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        this.processPerformanceEntries(entries);
      });

      this.observer.observe({ 
        entryTypes: ['measure', 'navigation', 'layout-shift', 'paint'] 
      });
    }
  }

  private processPerformanceEntries(entries: PerformanceEntry[]) {
    entries.forEach(entry => {
      if (entry.entryType === 'layout-shift') {
        const layoutShiftEntry = entry as any;
        this.recordLayoutShift(layoutShiftEntry.value);
      }
    });
  }

  private startFrameRateMonitoring() {
    const measureFrameRate = (timestamp: number) => {
      if (this.lastFrameTime) {
        this.frameCount++;
      }
      this.lastFrameTime = timestamp;
      this.animationId = requestAnimationFrame(measureFrameRate);
    };

    this.animationId = requestAnimationFrame(measureFrameRate);
  }

  // Measure component render time
  public async measureRenderTime(
    renderFunction: () => Promise<void> | void
  ): Promise<number> {
    const startTime = performance.now();
    
    await renderFunction();
    
    // Wait for next frame to ensure rendering is complete
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    const endTime = performance.now();
    return endTime - startTime;
  }

  // Record layout shift
  private recordLayoutShift(value: number) {
    const currentMetrics = this.getCurrentMetrics();
    currentMetrics.layoutShift += value;
  }

  // Get current performance metrics
  public getCurrentMetrics(): PerformanceMetrics {
    const memoryInfo = (performance as any).memory;
    const currentTime = performance.now();
    
    // Calculate frame rate over last second
    const frameRate = this.frameCount;
    this.frameCount = 0; // Reset for next measurement
    
    const metrics: PerformanceMetrics = {
      renderTime: 0, // Will be set by measureRenderTime
      layoutShift: 0,
      memoryUsage: memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0,
      frameRate,
      reflows: 0,
      repaints: 0,
      timestamp: currentTime,
    };

    this.metrics.push(metrics);
    return metrics;
  }

  // Test responsive performance across viewports
  public async testResponsivePerformance(
    component: HTMLElement,
    viewports: Array<{ width: number; height: number; name: string }>
  ): Promise<Map<string, PerformanceMetrics>> {
    const results = new Map<string, PerformanceMetrics>();

    for (const viewport of viewports) {
      const metrics = await this.testViewportPerformance(
        component,
        viewport.width,
        viewport.height
      );
      results.set(viewport.name, metrics);
    }

    return results;
  }

  // Test performance for specific viewport
  private async testViewportPerformance(
    component: HTMLElement,
    width: number,
    height: number
  ): Promise<PerformanceMetrics> {
    // Set viewport size
    const originalWidth = component.style.width;
    const originalHeight = component.style.height;
    
    component.style.width = `${width}px`;
    component.style.height = `${height}px`;

    // Measure render time
    const renderTime = await this.measureRenderTime(async () => {
      // Force reflow
      component.offsetHeight;
      
      // Wait for any animations to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Get metrics
    const metrics = this.getCurrentMetrics();
    metrics.renderTime = renderTime;

    // Restore original size
    component.style.width = originalWidth;
    component.style.height = originalHeight;

    return metrics;
  }

  // Validate performance against thresholds
  public validatePerformance(
    metrics: PerformanceMetrics,
    deviceCategory: 'mobile' | 'tablet' | 'desktop'
  ): {
    passed: boolean;
    failures: string[];
    score: number;
  } {
    const thresholds = PERFORMANCE_THRESHOLDS[deviceCategory];
    const failures: string[] = [];
    let score = 100;

    if (metrics.renderTime > thresholds.renderTime) {
      failures.push(`Render time ${metrics.renderTime.toFixed(2)}ms exceeds ${thresholds.renderTime}ms threshold`);
      score -= 20;
    }

    if (metrics.layoutShift > thresholds.layoutShift) {
      failures.push(`Layout shift ${metrics.layoutShift.toFixed(3)} exceeds ${thresholds.layoutShift} threshold`);
      score -= 15;
    }

    if (metrics.memoryUsage > thresholds.memoryUsage) {
      failures.push(`Memory usage ${metrics.memoryUsage.toFixed(1)}MB exceeds ${thresholds.memoryUsage}MB threshold`);
      score -= 10;
    }

    if (metrics.frameRate < thresholds.frameRate) {
      failures.push(`Frame rate ${metrics.frameRate}fps below ${thresholds.frameRate}fps threshold`);
      score -= 15;
    }

    return {
      passed: failures.length === 0,
      failures,
      score: Math.max(0, score),
    };
  }

  // Generate performance report
  public generateReport(
    testResults: Map<string, PerformanceMetrics>
  ): {
    summary: {
      totalTests: number;
      passed: number;
      failed: number;
      averageScore: number;
    };
    details: Array<{
      viewport: string;
      metrics: PerformanceMetrics;
      validation: ReturnType<typeof this.validatePerformance>;
    }>;
  } {
    const details: Array<{
      viewport: string;
      metrics: PerformanceMetrics;
      validation: ReturnType<typeof this.validatePerformance>;
    }> = [];

    let totalScore = 0;
    let passedCount = 0;

    testResults.forEach((metrics, viewport) => {
      const deviceCategory = getDeviceCategory(
        parseInt(viewport.split('×')[0]) || 1920
      );
      const validation = this.validatePerformance(metrics, deviceCategory);
      
      details.push({
        viewport,
        metrics,
        validation,
      });

      totalScore += validation.score;
      if (validation.passed) passedCount++;
    });

    return {
      summary: {
        totalTests: testResults.size,
        passed: passedCount,
        failed: testResults.size - passedCount,
        averageScore: totalScore / testResults.size,
      },
      details,
    };
  }

  // Cleanup
  public destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Touch interaction testing utilities
export class TouchInteractionTester {
  private element: HTMLElement;
  private touchEvents: TouchEvent[] = [];

  constructor(element: HTMLElement) {
    this.element = element;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach(eventType => {
      this.element.addEventListener(eventType, (e) => {
        this.touchEvents.push(e as TouchEvent);
      });
    });
  }

  // Simulate touch interaction
  public simulateTouch(
    x: number,
    y: number,
    type: 'tap' | 'long-press' | 'swipe' = 'tap'
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const touch = new Touch({
        identifier: Date.now(),
        target: this.element,
        clientX: x,
        clientY: y,
        radiusX: 10,
        radiusY: 10,
        rotationAngle: 0,
        force: 1,
      });

      const touchStart = new TouchEvent('touchstart', {
        touches: [touch],
        targetTouches: [touch],
        changedTouches: [touch],
        bubbles: true,
        cancelable: true,
      });

      this.element.dispatchEvent(touchStart);

      if (type === 'long-press') {
        setTimeout(() => {
          const touchEnd = new TouchEvent('touchend', {
            touches: [],
            targetTouches: [],
            changedTouches: [touch],
            bubbles: true,
            cancelable: true,
          });
          this.element.dispatchEvent(touchEnd);
          resolve(true);
        }, 500);
      } else {
        const touchEnd = new TouchEvent('touchend', {
          touches: [],
          targetTouches: [],
          changedTouches: [touch],
          bubbles: true,
          cancelable: true,
        });
        this.element.dispatchEvent(touchEnd);
        resolve(true);
      }
    });
  }

  // Test touch target size
  public validateTouchTargets(): {
    passed: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    const interactiveElements = this.element.querySelectorAll(
      'button, a, input, textarea, [role="button"], [tabindex]'
    );

    interactiveElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const minSize = 44; // Minimum touch target size in pixels

      if (rect.width < minSize || rect.height < minSize) {
        issues.push(
          `Element ${index + 1} has touch target size ${rect.width}×${rect.height}px, minimum is ${minSize}×${minSize}px`
        );
      }
    });

    return {
      passed: issues.length === 0,
      issues,
    };
  }

  // Get touch event statistics
  public getTouchEventStats(): {
    totalEvents: number;
    eventTypes: Record<string, number>;
    averageResponseTime: number;
  } {
    const eventTypes: Record<string, number> = {};
    let totalResponseTime = 0;

    this.touchEvents.forEach((event, index) => {
      eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
      
      if (index > 0) {
        totalResponseTime += event.timeStamp - this.touchEvents[index - 1].timeStamp;
      }
    });

    return {
      totalEvents: this.touchEvents.length,
      eventTypes,
      averageResponseTime: totalResponseTime / Math.max(1, this.touchEvents.length - 1),
    };
  }
}

// Viewport testing utilities
export const COMMON_VIEWPORTS = [
  { width: 320, height: 568, name: 'iPhone SE' },
  { width: 375, height: 667, name: 'iPhone 8' },
  { width: 390, height: 844, name: 'iPhone 12' },
  { width: 428, height: 926, name: 'iPhone 12 Pro Max' },
  { width: 768, height: 1024, name: 'iPad' },
  { width: 1024, height: 1366, name: 'iPad Pro' },
  { width: 1440, height: 900, name: 'MacBook Air' },
  { width: 1920, height: 1080, name: 'Desktop 1080p' },
];

// Utility function to run comprehensive responsive tests
export async function runResponsiveTests(
  component: HTMLElement
): Promise<{
  performance: ReturnType<ResponsivePerformanceMonitor['generateReport']>;
  touchInteraction: ReturnType<TouchInteractionTester['validateTouchTargets']>;
  viewportCompatibility: boolean;
}> {
  const performanceMonitor = new ResponsivePerformanceMonitor();
  const touchTester = new TouchInteractionTester(component);

  try {
    // Test performance across viewports
    const performanceResults = await performanceMonitor.testResponsivePerformance(
      component,
      COMMON_VIEWPORTS
    );
    const performanceReport = performanceMonitor.generateReport(performanceResults);

    // Test touch interactions
    const touchValidation = touchTester.validateTouchTargets();

    // Test viewport compatibility
    let viewportCompatibility = true;
    for (const viewport of COMMON_VIEWPORTS) {
      component.style.width = `${viewport.width}px`;
      component.style.height = `${viewport.height}px`;
      
      // Check for overflow
      if (component.scrollWidth > viewport.width || component.scrollHeight > viewport.height) {
        viewportCompatibility = false;
        break;
      }
    }

    return {
      performance: performanceReport,
      touchInteraction: touchValidation,
      viewportCompatibility,
    };
  } finally {
    performanceMonitor.destroy();
  }
}