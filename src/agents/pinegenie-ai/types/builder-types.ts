/**
 * AI Builder Type Definitions
 */

export interface BuildResult {
  success: boolean;
  nodes: AIBuilderNode[];
  edges: AIBuilderEdge[];
  animations: AnimationStep[];
  explanations: ExplanationStep[];
  errors: string[];
  warnings: string[];
  metadata?: BuildMetadata;
}

export interface AIBuilderNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: AINodeData;
  aiGenerated: boolean;
  confidence: number;
}

export interface AINodeData {
  id: string;
  type: string;
  label: string;
  description?: string;
  config?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
  aiGenerated: boolean;
  confidence: number;
  explanation: string;
  suggestedParameters: Record<string, unknown>;
  optimizationHints: string[];
}

export interface AIBuilderEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  animated?: boolean;
  style?: React.CSSProperties;
  type?: string;
  aiGenerated: boolean;
  confidence: number;
}

export interface AnimationStep {
  stepNumber: number;
  type: AnimationType;
  nodeId?: string;
  edgeId?: string;
  duration: number;
  delay: number;
  explanation: string;
  highlight: boolean;
  data?: Record<string, unknown>;
}

export enum AnimationType {
  NODE_PLACEMENT = 'node-placement',
  CONNECTION_CREATION = 'connection-creation',
  PARAMETER_SETTING = 'parameter-setting',
  VALIDATION = 'validation',
  OPTIMIZATION = 'optimization',
  EXPLANATION = 'explanation',
}

export interface ExplanationStep {
  stepNumber: number;
  title: string;
  description: string;
  reasoning: string;
  relatedComponents: string[];
  educationalContent?: EducationalContent;
}

export interface EducationalContent {
  concept: string;
  definition: string;
  examples: string[];
  bestPractices: string[];
  commonMistakes: string[];
  relatedConcepts: string[];
}

export interface BuildMetadata {
  buildTime: number;
  totalSteps: number;
  complexity: number;
  confidence: number;
  optimizationApplied: boolean;
  validationPassed: boolean;
}

export interface PlacementOptions {
  avoidOverlap: boolean;
  optimizeLayout: boolean;
  groupRelated: boolean;
  maintainFlow: boolean;
  respectConstraints: boolean;
}

export interface ConnectionOptions {
  validateConnections: boolean;
  optimizeRouting: boolean;
  avoidCrossings: boolean;
  maintainHierarchy: boolean;
}