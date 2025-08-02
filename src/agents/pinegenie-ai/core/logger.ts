/**
 * PineGenie AI Logging System
 * 
 * Isolated logging system for AI operations that doesn't interfere
 * with existing application logging.
 */

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  component: string;
  message: string;
  data?: Record<string, unknown>;
  duration?: number;
}

export class AILogger {
  private static instance: AILogger;
  private logs: LogEntry[] = [];
  private maxLogSize = 1000;
  private logLevel: LogLevel = 'info';

  private constructor() {}

  public static getInstance(): AILogger {
    if (!AILogger.instance) {
      AILogger.instance = new AILogger();
    }
    return AILogger.instance;
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  public error(component: string, message: string, data?: Record<string, unknown>): void {
    this.log('error', component, message, data);
  }

  public warn(component: string, message: string, data?: Record<string, unknown>): void {
    this.log('warn', component, message, data);
  }

  public info(component: string, message: string, data?: Record<string, unknown>): void {
    this.log('info', component, message, data);
  }

  public debug(component: string, message: string, data?: Record<string, unknown>): void {
    this.log('debug', component, message, data);
  }

  public startTimer(component: string, operation: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.info(component, `${operation} completed`, { duration: `${duration.toFixed(2)}ms` });
    };
  }

  public logPerformance(component: string, operation: string, duration: number): void {
    this.info(component, `Performance: ${operation}`, { 
      duration: `${duration.toFixed(2)}ms`,
      performance: true 
    });
  }

  public getLogs(component?: string, level?: LogLevel): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (component) {
      filteredLogs = filteredLogs.filter(log => log.component === component);
    }

    if (level) {
      const levelPriority = this.getLevelPriority(level);
      filteredLogs = filteredLogs.filter(log => 
        this.getLevelPriority(log.level) <= levelPriority
      );
    }

    return filteredLogs;
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  private log(level: LogLevel, component: string, message: string, data?: Record<string, unknown>): void {
    // Check if this log level should be recorded
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      component,
      message,
      data,
    };

    this.logs.push(logEntry);

    // Keep log size manageable
    if (this.logs.length > this.maxLogSize) {
      this.logs.shift();
    }

    // Also log to console for development
    this.logToConsole(logEntry);
  }

  private shouldLog(level: LogLevel): boolean {
    const currentLevelPriority = this.getLevelPriority(this.logLevel);
    const messageLevelPriority = this.getLevelPriority(level);
    
    return messageLevelPriority <= currentLevelPriority;
  }

  private getLevelPriority(level: LogLevel): number {
    const priorities = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };
    return priorities[level];
  }

  private logToConsole(entry: LogEntry): void {
    const prefix = `[PineGenie AI - ${entry.component}]`;
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case 'error':
        console.error(message, entry.data);
        break;
      case 'warn':
        console.warn(message, entry.data);
        break;
      case 'info':
        console.info(message, entry.data);
        break;
      case 'debug':
        console.debug(message, entry.data);
        break;
    }
  }
}