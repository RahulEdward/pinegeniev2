// Strategy-related TypeScript types matching the Prisma schema

export interface StrategyNode {
  id: string;
  type: 'indicator' | 'condition' | 'action' | 'data';
  position: { x: number; y: number };
  config: NodeConfiguration;
}

export interface NodeConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface NodeConfiguration {
  [key: string]: unknown;
}

export interface TradingStrategy {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category?: string;
  nodes: StrategyNode[];
  connections: NodeConnection[];
  pineScriptCode?: string;
  isPublic: boolean;
  tags?: string[];
  version: number;
  folderId?: string;
  templateId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StrategyVersion {
  id: string;
  strategyId: string;
  version: number;
  name: string;
  description?: string;
  nodes: StrategyNode[];
  connections: NodeConnection[];
  pineScriptCode?: string;
  changeLog?: string;
  createdAt: Date;
}

export interface StrategyFolder {
  id: string;
  userId: string;
  name: string;
  description?: string;
  parentId?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
  children?: StrategyFolder[];
  strategies?: TradingStrategy[];
}

export interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: StrategyNode[];
  connections: NodeConnection[];
  tags?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isOfficial: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BacktestConfig {
  symbol: string;
  timeframe: string;
  startDate: Date;
  endDate: Date;
  initialCapital: number;
  commission: number;
}

export interface BacktestResult {
  id: string;
  strategyId: string;
  config: BacktestConfig;
  results: Record<string, unknown>; // Raw backtest results
  performanceMetrics: PerformanceMetrics;
  status: 'pending' | 'running' | 'completed' | 'failed';
  errorMessage?: string;
  startedAt: Date;
  completedAt?: Date;
}

export interface PerformanceMetrics {
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  averageTrade: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  largestWin: number;
  largestLoss: number;
  averageWin: number;
  averageLoss: number;
  consecutiveWins: number;
  consecutiveLosses: number;
}

export interface SharedStrategy {
  id: string;
  strategyId: string;
  sharedBy: string;
  sharedWith?: string;
  permission: 'READ' | 'WRITE' | 'ADMIN';
  expiresAt?: Date;
  createdAt: Date;
}

export type StrategyCategory = 
  | 'trend-following'
  | 'mean-reversion'
  | 'breakout'
  | 'scalping'
  | 'swing-trading'
  | 'position-trading'
  | 'arbitrage'
  | 'custom';

export interface StrategySearchFilters {
  category?: StrategyCategory;
  tags?: string[];
  isPublic?: boolean;
  folderId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'version';
  sortOrder?: 'asc' | 'desc';
}

export interface StrategyExportData {
  strategy: TradingStrategy;
  versions?: StrategyVersion[];
  backtestResults?: BacktestResult[];
}

export interface StrategyImportData {
  name: string;
  description?: string;
  category?: string;
  nodes: StrategyNode[];
  connections: NodeConnection[];
  pineScriptCode?: string;
  tags?: string[];
}