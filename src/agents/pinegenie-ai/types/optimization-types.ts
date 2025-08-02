/**
 * Optimization System Type Definitions
 */

export interface Optimization {
  id: string;
  type: OptimizationType;
  description: string;
  impact: ImpactLevel;
  recommendation: string;
  autoApply: boolean;
  parameters?: OptimizationParameters;
  metadata?: OptimizationMetadata;
}

export enum OptimizationType {
  PARAMETER = 'parameter',
  STRUCTURE = 'structure',
  RISK = 'risk',
  PERFORMANCE = 'performance',
  LAYOUT = 'layout',
  CONNECTION = 'connection',
}

export enum ImpactLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface OptimizationParameters {
  [key: string]: OptimizationParameter;
}

export interface OptimizationParameter {
  currentValue: unknown;
  suggestedValue: unknown;
  range?: [number, number];
  confidence: number;
  reasoning: string;
}

export interface OptimizationMetadata {
  createdAt: Date;
  confidence: number;
  backtestImprovement?: number;
  riskImpact: ImpactLevel;
  complexity: number;
}

export interface RiskAssessment {
  overallRisk: RiskLevel;
  riskFactors: RiskFactor[];
  recommendations: RiskRecommendation[];
  score: number; // 0-100
  metadata?: RiskMetadata;
}

export enum RiskLevel {
  VERY_LOW = 'very-low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very-high',
}

export interface RiskFactor {
  id: string;
  type: RiskFactorType;
  description: string;
  severity: ImpactLevel;
  likelihood: number; // 0-1
  impact: number; // 0-1
  mitigation?: string;
}

export enum RiskFactorType {
  OVER_OPTIMIZATION = 'over-optimization',
  INSUFFICIENT_DIVERSIFICATION = 'insufficient-diversification',
  HIGH_CORRELATION = 'high-correlation',
  EXCESSIVE_LEVERAGE = 'excessive-leverage',
  POOR_RISK_REWARD = 'poor-risk-reward',
  MARKET_TIMING = 'market-timing',
  LIQUIDITY = 'liquidity',
}

export interface RiskRecommendation {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  implementation: string;
  expectedImpact: ImpactLevel;
}

export interface RiskMetadata {
  assessmentDate: Date;
  marketConditions: string;
  timeframe: string;
  confidence: number;
}

export interface PerformanceMetrics {
  processingSpeed: number; // operations per second
  memoryUsage: number; // MB
  cacheHitRate: number; // 0-1
  errorRate: number; // 0-1
  averageResponseTime: number; // milliseconds
  throughput: number; // requests per minute
}

export interface OptimizationResult {
  success: boolean;
  optimizations: Optimization[];
  riskAssessment: RiskAssessment;
  performanceImprovement?: number;
  errors?: string[];
  warnings?: string[];
  metadata?: OptimizationResultMetadata;
}

export interface OptimizationResultMetadata {
  processingTime: number;
  optimizationsApplied: number;
  optimizationsSkipped: number;
  confidence: number;
  backtestRequired: boolean;
}