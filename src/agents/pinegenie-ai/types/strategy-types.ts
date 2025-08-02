/**
 * Strategy Type Definitions
 */

export interface StrategyBlueprint {
  id: string;
  name: string;
  description: string;
  components: StrategyComponent[];
  flow: StrategyFlow[];
  parameters: ParameterSet;
  riskProfile: RiskProfile;
  metadata?: StrategyMetadata;
}

export interface StrategyComponent {
  id: string;
  type: ComponentType;
  subtype: string;
  label: string;
  parameters: Record<string, unknown>;
  position?: { x: number; y: number };
  priority: number;
  dependencies: string[];
  optional: boolean;
}

export enum ComponentType {
  DATA_SOURCE = 'data-source',
  INDICATOR = 'indicator',
  CONDITION = 'condition',
  ACTION = 'action',
  RISK_MANAGEMENT = 'risk',
  TIMING = 'timing',
  MATH = 'math',
  LOGIC = 'logic',
}

export interface StrategyFlow {
  from: string;
  to: string;
  type: FlowType;
  condition?: string;
  weight?: number;
}

export enum FlowType {
  DATA = 'data',
  SIGNAL = 'signal',
  TRIGGER = 'trigger',
  CONTROL = 'control',
}

export interface ParameterSet {
  [componentId: string]: ComponentParameters;
}

export interface ComponentParameters {
  [parameterName: string]: ParameterDefinition;
}

export interface ParameterDefinition {
  value: unknown;
  type: 'int' | 'float' | 'bool' | 'string' | 'source' | 'color';
  range?: [number, number];
  options?: unknown[];
  description: string;
  optimizable: boolean;
}

export interface RiskProfile {
  level: 'low' | 'medium' | 'high';
  maxRisk: number;
  stopLoss?: number;
  takeProfit?: number;
  positionSize?: number;
  maxDrawdown?: number;
}

export interface StrategyMetadata {
  createdAt: Date;
  updatedAt: Date;
  version: string;
  author: string;
  tags: string[];
  category: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  backtestResults?: BacktestResults;
}

export interface BacktestResults {
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  period: {
    start: Date;
    end: Date;
  };
}