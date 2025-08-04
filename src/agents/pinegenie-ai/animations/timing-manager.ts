/**
 * Animation Timing Manager for PineGenie AI
 * 
 * This module manages timing, sequencing, and synchronization for educational animations,
 * ensuring smooth and coordinated visual feedback during strategy building.
 * 
 * SAFE INTEGRATION: Uses existing timing systems without modification
 * PROTECTION: No changes to existing animation or timing files
 * 
 * Requirements: 3.1, 3.2, 3.4
 */

export interface TimingConfig {
  /** Base timing settings */
  base: {
    defaultDuration: number;
    minDuration: number;
    maxDuration: number;
    defaultDelay: number;
    minDelay: number;
    maxDelay: number;
  };
  
  /** Animation type specific timings */
  animations: {
    nodeAppear: number;
    nodeDisappear: number;
    connectionDraw: number;
    connectionErase: number;
    highlight: number;
    focus: number;
    explanation: number;
    transition: number;
  };
  
  /** Easing and smoothing */
  easing: {
    defaultEasing: string;
    nodeEasing: string;
    connectionEasing: string;
    highlightEasing: string;
    transitionEasing: string;
  };
  
  /** Synchronization settings */
  sync: {
    maxConcurrentAnimations: number;
    staggerDelay: number;
    groupDelay: number;
    sequenceDelay: number;
    batchSize: number;
  };
  
  /** Performance settings */
  performance: {
    enableRAF: boolean;
    enableThrottling: boolean;
    throttleInterval: number;
    maxFrameTime: number;
    enableOptimizations: boolean;
  };
}

export interface TimingEvent {
  id: string;
  type: 'start' | 'end' | 'pause' | 'resume' | 'cancel';
  timestamp: number;
  duration: number;
  delay: number;
  target?: string;
  data?: Record<string, unknown>;
}

export interface TimingSchedule {
  id: string;
  name: string;
  events: TimingEvent[];
  totalDuration: number;
  startTime: number;
  endTime: number;
  isActive: boolean;
  isPaused: boolean;
}

export interface TimingState {
  currentTime: number;
  startTime: number;
  pausedTime: number;
  elapsedTime: number;
  playbackSpeed: number;
  isPlaying: boolean;
  isPaused: boolean;
  activeSchedules: Map<string, TimingSchedule>;
  activeEvents: Map<string, TimingEvent>;
}

export interface TimingControls {
  play(): void;
  pause(): void;
  resume(): void;
  stop(): void;
  setSpeed(speed: number): void;
  seek(time: number): void;
  getCurrentTime(): number;
  getTotalDuration(): number;
}

export type TimingEventListener = (event: TimingEvent) => void;

/**
 * Default timing configuration
 */
export const DEFAULT_TIMING_CONFIG: TimingConfig = {
  base: {
    defaultDuration: 800,
    minDuration: 100,
    maxDuration: 5000,
    defaultDelay: 200,
    minDelay: 0,
    maxDelay: 2000
  },
  animations: {
    nodeAppear: 800,
    nodeDisappear: 400,
    connectionDraw: 1200,
    connectionErase: 600,
    highlight: 1000,
    focus: 600,
    explanation: 3000,
    transition: 300
  },
  easing: {
    defaultEasing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    nodeEasing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    connectionEasing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    highlightEasing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    transitionEasing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
  },
  sync: {
    maxConcurrentAnimations: 5,
    staggerDelay: 150,
    groupDelay: 300,
    sequenceDelay: 500,
    batchSize: 3
  },
  performance: {
    enableRAF: true,
    enableThrottling: false,
    throttleInterval: 16, // ~60fps
    maxFrameTime: 16.67,
    enableOptimizations: true
  }
};

/**
 * Animation Timing Manager
 * 
 * Manages timing, sequencing, and synchronization for educational animations
 */
export class TimingManager {
  private config: TimingConfig;
  private state: TimingState;
  private listeners: Set<TimingEventListener> = new Set();
  private animationFrame: number | null = null;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private performanceMetrics: {
    averageFrameTime: number;
    droppedFrames: number;
    totalFrames: number;
  } = {
    averageFrameTime: 0,
    droppedFrames: 0,
    totalFrames: 0
  };

  constructor(config: TimingConfig = DEFAULT_TIMING_CONFIG) {
    this.config = { ...config };
    this.state = {
      currentTime: 0,
      startTime: 0,
      pausedTime: 0,
      elapsedTime: 0,
      playbackSpeed: 1.0,
      isPlaying: false,
      isPaused: false,
      activeSchedules: new Map(),
      activeEvents: new Map()
    };
  }

  /**
   * Create timing schedule for animation sequence
   */
  createSchedule(
    id: string,
    name: string,
    events: Array<{
      id: string;
      type: 'animation' | 'highlight' | 'explanation' | 'pause';
      startTime: number;
      duration: number;
      target?: string;
      data?: Record<string, unknown>;
    }>
  ): TimingSchedule {
    const timingEvents: TimingEvent[] = [];
    let totalDuration = 0;

    events.forEach(event => {
      // Create start event
      timingEvents.push({
        id: `${event.id}_start`,
        type: 'start',
        timestamp: event.startTime,
        duration: event.duration,
        delay: 0,
        target: event.target,
        data: { ...event.data, originalId: event.id, eventType: event.type }
      });

      // Create end event
      timingEvents.push({
        id: `${event.id}_end`,
        type: 'end',
        timestamp: event.startTime + event.duration,
        duration: 0,
        delay: 0,
        target: event.target,
        data: { ...event.data, originalId: event.id, eventType: event.type }
      });

      totalDuration = Math.max(totalDuration, event.startTime + event.duration);
    });

    // Sort events by timestamp
    timingEvents.sort((a, b) => a.timestamp - b.timestamp);

    return {
      id,
      name,
      events: timingEvents,
      totalDuration,
      startTime: 0,
      endTime: totalDuration,
      isActive: false,
      isPaused: false
    };
  }

  /**
   * Create staggered timing schedule
   */
  createStaggeredSchedule(
    id: string,
    name: string,
    items: Array<{
      id: string;
      type: 'node' | 'connection' | 'highlight';
      duration?: number;
      data?: Record<string, unknown>;
    }>,
    staggerDelay: number = this.config.sync.staggerDelay
  ): TimingSchedule {
    const events: Array<{
      id: string;
      type: 'animation' | 'highlight' | 'explanation' | 'pause';
      startTime: number;
      duration: number;
      target?: string;
      data?: Record<string, unknown>;
    }> = [];

    items.forEach((item, index) => {
      const duration = item.duration || this.getDefaultDuration(item.type);
      const startTime = index * staggerDelay;

      events.push({
        id: item.id,
        type: 'animation',
        startTime,
        duration,
        target: item.id,
        data: { ...item.data, itemType: item.type, staggerIndex: index }
      });
    });

    return this.createSchedule(id, name, events);
  }

  /**
   * Create synchronized timing schedule
   */
  createSynchronizedSchedule(
    id: string,
    name: string,
    groups: Array<{
      id: string;
      items: Array<{
        id: string;
        type: 'node' | 'connection' | 'highlight';
        duration?: number;
        data?: Record<string, unknown>;
      }>;
      delay?: number;
    }>
  ): TimingSchedule {
    const events: Array<{
      id: string;
      type: 'animation' | 'highlight' | 'explanation' | 'pause';
      startTime: number;
      duration: number;
      target?: string;
      data?: Record<string, unknown>;
    }> = [];

    let currentTime = 0;

    groups.forEach((group, groupIndex) => {
      const groupStartTime = currentTime + (group.delay || this.config.sync.groupDelay);
      let maxDuration = 0;

      // Add all items in the group to start simultaneously
      group.items.forEach((item, itemIndex) => {
        const duration = item.duration || this.getDefaultDuration(item.type);
        maxDuration = Math.max(maxDuration, duration);

        events.push({
          id: item.id,
          type: 'animation',
          startTime: groupStartTime,
          duration,
          target: item.id,
          data: { 
            ...item.data, 
            itemType: item.type, 
            groupId: group.id,
            groupIndex,
            itemIndex 
          }
        });
      });

      currentTime = groupStartTime + maxDuration;
    });

    return this.createSchedule(id, name, events);
  }

  /**
   * Create sequential timing schedule
   */
  createSequentialSchedule(
    id: string,
    name: string,
    items: Array<{
      id: string;
      type: 'node' | 'connection' | 'highlight' | 'explanation';
      duration?: number;
      delay?: number;
      data?: Record<string, unknown>;
    }>
  ): TimingSchedule {
    const events: Array<{
      id: string;
      type: 'animation' | 'highlight' | 'explanation' | 'pause';
      startTime: number;
      duration: number;
      target?: string;
      data?: Record<string, unknown>;
    }> = [];

    let currentTime = 0;

    items.forEach((item, index) => {
      const duration = item.duration || this.getDefaultDuration(item.type);
      const delay = item.delay || this.config.sync.sequenceDelay;
      
      events.push({
        id: item.id,
        type: item.type === 'explanation' ? 'explanation' : 'animation',
        startTime: currentTime,
        duration,
        target: item.id,
        data: { ...item.data, itemType: item.type, sequenceIndex: index }
      });

      currentTime += duration + delay;
    });

    return this.createSchedule(id, name, events);
  }

  /**
   * Add schedule to timing manager
   */
  addSchedule(schedule: TimingSchedule): void {
    this.state.activeSchedules.set(schedule.id, schedule);
  }

  /**
   * Remove schedule from timing manager
   */
  removeSchedule(scheduleId: string): void {
    const schedule = this.state.activeSchedules.get(scheduleId);
    if (schedule) {
      schedule.isActive = false;
      this.state.activeSchedules.delete(scheduleId);
    }
  }

  /**
   * Start timing manager
   */
  play(): void {
    if (this.state.isPlaying) return;

    this.state.isPlaying = true;
    this.state.isPaused = false;
    this.state.startTime = performance.now();
    this.state.currentTime = 0;

    // Activate all schedules
    this.state.activeSchedules.forEach(schedule => {
      schedule.isActive = true;
      schedule.startTime = this.state.startTime;
    });

    if (this.config.performance.enableRAF) {
      this.startAnimationLoop();
    } else {
      this.startTimerLoop();
    }
  }

  /**
   * Pause timing manager
   */
  pause(): void {
    if (!this.state.isPlaying || this.state.isPaused) return;

    this.state.isPaused = true;
    this.state.pausedTime = performance.now();

    // Pause all active schedules
    this.state.activeSchedules.forEach(schedule => {
      if (schedule.isActive) {
        schedule.isPaused = true;
      }
    });

    this.stopAnimationLoop();
  }

  /**
   * Resume timing manager
   */
  resume(): void {
    if (!this.state.isPlaying || !this.state.isPaused) return;

    const pauseDuration = performance.now() - this.state.pausedTime;
    this.state.startTime += pauseDuration;
    this.state.isPaused = false;

    // Resume all paused schedules
    this.state.activeSchedules.forEach(schedule => {
      if (schedule.isPaused) {
        schedule.isPaused = false;
        schedule.startTime += pauseDuration;
      }
    });

    if (this.config.performance.enableRAF) {
      this.startAnimationLoop();
    } else {
      this.startTimerLoop();
    }
  }

  /**
   * Stop timing manager
   */
  stop(): void {
    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.state.currentTime = 0;
    this.state.elapsedTime = 0;

    // Deactivate all schedules
    this.state.activeSchedules.forEach(schedule => {
      schedule.isActive = false;
      schedule.isPaused = false;
    });

    this.state.activeEvents.clear();
    this.stopAnimationLoop();
  }

  /**
   * Set playback speed
   */
  setSpeed(speed: number): void {
    const wasPlaying = this.state.isPlaying && !this.state.isPaused;
    
    if (wasPlaying) {
      // Adjust timing to maintain current position
      const currentRealTime = performance.now();
      const currentAnimationTime = this.state.elapsedTime;
      this.state.playbackSpeed = Math.max(0.1, Math.min(5.0, speed));
      this.state.startTime = currentRealTime - currentAnimationTime / this.state.playbackSpeed;
    } else {
      this.state.playbackSpeed = Math.max(0.1, Math.min(5.0, speed));
    }
  }

  /**
   * Seek to specific time
   */
  seek(time: number): void {
    const wasPlaying = this.state.isPlaying && !this.state.isPaused;
    
    this.state.currentTime = Math.max(0, time);
    this.state.elapsedTime = this.state.currentTime;
    
    if (wasPlaying) {
      this.state.startTime = performance.now() - this.state.elapsedTime / this.state.playbackSpeed;
    }

    // Update all active schedules
    this.state.activeSchedules.forEach(schedule => {
      if (schedule.isActive) {
        this.processScheduleAtTime(schedule, this.state.currentTime);
      }
    });
  }

  /**
   * Get timing controls
   */
  getControls(): TimingControls {
    return {
      play: () => this.play(),
      pause: () => this.pause(),
      resume: () => this.resume(),
      stop: () => this.stop(),
      setSpeed: (speed: number) => this.setSpeed(speed),
      seek: (time: number) => this.seek(time),
      getCurrentTime: () => this.state.currentTime,
      getTotalDuration: () => this.getTotalDuration()
    };
  }

  /**
   * Get total duration of all schedules
   */
  getTotalDuration(): number {
    let maxDuration = 0;
    this.state.activeSchedules.forEach(schedule => {
      maxDuration = Math.max(maxDuration, schedule.totalDuration);
    });
    return maxDuration;
  }

  /**
   * Subscribe to timing events
   */
  subscribe(listener: TimingEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Start animation loop using requestAnimationFrame
   */
  private startAnimationLoop(): void {
    const animate = (currentTime: number) => {
      if (!this.state.isPlaying || this.state.isPaused) {
        return;
      }

      // Calculate frame time
      const frameTime = currentTime - this.lastFrameTime;
      this.lastFrameTime = currentTime;
      this.frameCount++;

      // Update performance metrics
      this.updatePerformanceMetrics(frameTime);

      // Skip frame if performance is poor
      if (this.config.performance.enableOptimizations && frameTime > this.config.performance.maxFrameTime * 2) {
        this.performanceMetrics.droppedFrames++;
        this.animationFrame = requestAnimationFrame(animate);
        return;
      }

      // Update timing state
      this.updateTimingState(currentTime);

      // Process all active schedules
      this.processActiveSchedules();

      // Continue animation loop
      this.animationFrame = requestAnimationFrame(animate);
    };

    this.lastFrameTime = performance.now();
    this.animationFrame = requestAnimationFrame(animate);
  }

  /**
   * Start timer loop using setTimeout
   */
  private startTimerLoop(): void {
    const interval = this.config.performance.throttleInterval;
    
    const tick = () => {
      if (!this.state.isPlaying || this.state.isPaused) {
        return;
      }

      const currentTime = performance.now();
      this.updateTimingState(currentTime);
      this.processActiveSchedules();

      setTimeout(tick, interval);
    };

    setTimeout(tick, interval);
  }

  /**
   * Stop animation loop
   */
  private stopAnimationLoop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Update timing state
   */
  private updateTimingState(currentTime: number): void {
    this.state.elapsedTime = (currentTime - this.state.startTime) * this.state.playbackSpeed;
    this.state.currentTime = this.state.elapsedTime;
  }

  /**
   * Process all active schedules
   */
  private processActiveSchedules(): void {
    this.state.activeSchedules.forEach(schedule => {
      if (schedule.isActive && !schedule.isPaused) {
        this.processScheduleAtTime(schedule, this.state.currentTime);
      }
    });
  }

  /**
   * Process schedule at specific time
   */
  private processScheduleAtTime(schedule: TimingSchedule, time: number): void {
    schedule.events.forEach(event => {
      const eventKey = `${schedule.id}_${event.id}`;
      const isEventActive = this.state.activeEvents.has(eventKey);

      if (event.timestamp <= time && event.timestamp + event.duration > time) {
        // Event should be active
        if (!isEventActive) {
          this.state.activeEvents.set(eventKey, event);
          this.notifyListeners(event);
        }
      } else if (isEventActive && event.timestamp + event.duration <= time) {
        // Event should end
        this.state.activeEvents.delete(eventKey);
        
        // Create end event
        const endEvent: TimingEvent = {
          ...event,
          id: `${event.id}_end`,
          type: 'end',
          timestamp: time
        };
        this.notifyListeners(endEvent);
      }
    });
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(frameTime: number): void {
    this.performanceMetrics.totalFrames++;
    
    // Calculate rolling average
    const alpha = 0.1; // Smoothing factor
    this.performanceMetrics.averageFrameTime = 
      this.performanceMetrics.averageFrameTime * (1 - alpha) + frameTime * alpha;
  }

  /**
   * Get default duration for animation type
   */
  private getDefaultDuration(type: string): number {
    switch (type) {
      case 'node':
        return this.config.animations.nodeAppear;
      case 'connection':
        return this.config.animations.connectionDraw;
      case 'highlight':
        return this.config.animations.highlight;
      case 'explanation':
        return this.config.animations.explanation;
      default:
        return this.config.base.defaultDuration;
    }
  }

  /**
   * Notify listeners
   */
  private notifyListeners(event: TimingEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Timing event listener error:', error);
      }
    });
  }

  /**
   * Get current state
   */
  getState(): TimingState {
    return { ...this.state };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): {
    averageFrameTime: number;
    droppedFrames: number;
    totalFrames: number;
    fps: number;
  } {
    return {
      ...this.performanceMetrics,
      fps: this.performanceMetrics.averageFrameTime > 0 ? 1000 / this.performanceMetrics.averageFrameTime : 0
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<TimingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): TimingConfig {
    return { ...this.config };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stop();
    this.listeners.clear();
    this.state.activeSchedules.clear();
    this.state.activeEvents.clear();
  }
}

/**
 * Create timing manager instance
 */
export function createTimingManager(config?: Partial<TimingConfig>): TimingManager {
  const fullConfig = config ? { ...DEFAULT_TIMING_CONFIG, ...config } : DEFAULT_TIMING_CONFIG;
  return new TimingManager(fullConfig);
}

/**
 * Timing utilities
 */
export const TimingUtils = {
  /**
   * Calculate optimal stagger delay
   */
  calculateStaggerDelay(itemCount: number, totalDuration: number): number {
    const minDelay = 50;
    const maxDelay = 500;
    const calculatedDelay = totalDuration / (itemCount * 2);
    return Math.max(minDelay, Math.min(maxDelay, calculatedDelay));
  },

  /**
   * Create easing function
   */
  createEasingFunction(type: string): (t: number) => number {
    switch (type) {
      case 'linear':
        return (t: number) => t;
      case 'ease-in':
        return (t: number) => t * t;
      case 'ease-out':
        return (t: number) => 1 - Math.pow(1 - t, 2);
      case 'ease-in-out':
        return (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      case 'bounce':
        return (t: number) => {
          const n1 = 7.5625;
          const d1 = 2.75;
          if (t < 1 / d1) {
            return n1 * t * t;
          } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
          } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
          } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
          }
        };
      default:
        return (t: number) => t;
    }
  },

  /**
   * Validate timing schedule
   */
  validateSchedule(schedule: TimingSchedule): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!schedule.id) {
      errors.push('Schedule must have an ID');
    }

    if (!schedule.name) {
      warnings.push('Schedule should have a name');
    }

    if (schedule.events.length === 0) {
      errors.push('Schedule must have at least one event');
    }

    // Check event timing
    schedule.events.forEach((event, index) => {
      if (event.timestamp < 0) {
        errors.push(`Event ${index} has negative timestamp`);
      }

      if (event.duration < 0) {
        errors.push(`Event ${index} has negative duration`);
      }

      if (event.timestamp + event.duration > schedule.totalDuration) {
        warnings.push(`Event ${index} extends beyond schedule duration`);
      }
    });

    // Check for overlapping events with same target
    const eventsByTarget = new Map<string, TimingEvent[]>();
    schedule.events.forEach(event => {
      if (event.target) {
        if (!eventsByTarget.has(event.target)) {
          eventsByTarget.set(event.target, []);
        }
        eventsByTarget.get(event.target)!.push(event);
      }
    });

    eventsByTarget.forEach((events, target) => {
      for (let i = 0; i < events.length - 1; i++) {
        const current = events[i];
        const next = events[i + 1];
        
        if (current.timestamp + current.duration > next.timestamp) {
          warnings.push(`Overlapping events for target ${target}`);
          break;
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  /**
   * Optimize timing schedule
   */
  optimizeSchedule(schedule: TimingSchedule): TimingSchedule {
    // Sort events by timestamp
    const sortedEvents = [...schedule.events].sort((a, b) => a.timestamp - b.timestamp);

    // Remove overlapping events
    const optimizedEvents: TimingEvent[] = [];
    const activeEvents = new Map<string, TimingEvent>();

    sortedEvents.forEach(event => {
      const target = event.target || 'global';
      const activeEvent = activeEvents.get(target);

      if (activeEvent && activeEvent.timestamp + activeEvent.duration > event.timestamp) {
        // Skip overlapping event
        return;
      }

      optimizedEvents.push(event);
      activeEvents.set(target, event);
    });

    return {
      ...schedule,
      events: optimizedEvents,
      totalDuration: Math.max(...optimizedEvents.map(e => e.timestamp + e.duration))
    };
  }
};