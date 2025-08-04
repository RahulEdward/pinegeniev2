# AI Builder Integration API

The AI Builder Integration module provides seamless integration between the AI system and the visual strategy builder. It handles node placement, connection creation, and state management while preserving existing builder functionality.

## 📋 **Table of Contents**

- [Core Classes](#core-classes)
- [Interfaces](#interfaces)
- [Methods](#methods)
- [Usage Examples](#usage-examples)
- [Integration Patterns](#integration-patterns)
- [Performance Optimization](#performance-optimization)

## 🏗 **Core Classes**

### `AIStrategyBuilder`

Main class for AI-powered strategy building integration.

```typescript
class AIStrategyBuilder {
  constructor(config?: AIBuilderConfig);
  
  // Core building methods
  async buildStrategy(blueprint: StrategyBlueprint): Promise<BuildResult>;
  async updateStrategy(strategyId: string, changes: StrategyChanges): Promise<BuildResult>;
  async validateStrategy(nodes: AIBuilderNode[], edges: AIBuilderEdge[]): Promise<ValidationResult>;
  
  // Animation and visualization
  async buildWithAnimation(blueprint: StrategyBlueprint, options?: AnimationOptions): Promise<AnimatedBuildResult>;
  async replayConstruction(buildResult: BuildResult): Promise<void>;
  
  // State management
  getBuilderState(): AIBuilderState;
  updateBuilderState(updates: Partial<AIBuilderState>): void;
  resetBuilderState(): void;
}
```

### `NodePlacer`

Handles intelligent node placement and layout optimization.

```typescript
class NodePlacer {
  constructor(config?: NodePlacementConfig);
  
  // Node placement
  async placeNodes(components: StrategyComponent[]): Promise<PlacementResult>;
  calculateOptimalPosition(node: AIBuilderNode, existingNodes: AIBuilderNode[]): Position;
  
  // Layout optimization
  optimizeLayout(nodes: AIBuilderNode[]): Promise<AIBuilderNode[]>;
  detectCollisions(nodes: AIBuilderNode[]): CollisionReport[];
  resolveCollisions(nodes: AIBuilderNode[], collisions: CollisionReport[]): AIBuilderNode[];
  
  // Grid and alignment
  snapToGrid(position: Position, gridSize?: number): Position;
  alignNodes(nodes: AIBuilderNode[], alignment: AlignmentType): AIBuilderNode[];
  distributeNodes(nodes: AIBuilderNode[], distribution: DistributionType): AIBuilderNode[];
}
```

### `ConnectionCreator`

Manages automatic connection creation between nodes.

```typescript
class ConnectionCreator {
  constructor(config?: ConnectionConfig);
  
  // Connection creation
  async createConnections(nodes: AIBuilderNode[]): Promise<AIBuilderEdge[]>;
  validateConnection(source: AIBuilderNode, target: AIBuilderNode): ConnectionValidation;
  
  // Connection optimization
  optimizeConnections(edges: AIBuilderEdge[]): AIBuilderEdge[];
  detectConnectionConflicts(edges: AIBuilderEdge[]): ConflictReport[];
  
  // Path finding
  calculateConnectionPath(source: Position, target: Position, obstacles: Position[]): Position[];
  optimizeConnectionRouting(edges: AIBuilderEdge[]): AIBuilderEdge[];
}
```

### `StateIntegrator`

Integrates AI-generated components with existing builder state.

```typescript
class StateIntegrator {
  constructor(builderStore: BuilderStore);
  
  // State integration
  async integrateNodes(nodes: AIBuilderNode[]): Promise<IntegrationResult>;
  async integrateEdges(edges: AIBuilderEdge[]): Promise<IntegrationResult>;
  
  // State synchronization
  syncWithBuilderState(): Promise<void>;
  validateStateConsistency(): ValidationResult;
  
  // Undo/Redo support
  createStateSnapshot(): StateSnapshot;
  restoreStateSnapshot(snapshot: StateSnapshot): Promise<void>;
  
  // Change tracking
  trackChanges(changes: StateChange[]): void;
  getChangeHistory(): StateChange[];
}
```

### `LayoutOptimizer`

Optimizes canvas layout for better visual presentation.

```typescript
class LayoutOptimizer {
  constructor(config?: LayoutConfig);
  
  // Layout algorithms
  applyForceDirectedLayout(nodes: AIBuilderNode[], edges: AIBuilderEdge[]): Promise<AIBuilderNode[]>;
  applyHierarchicalLayout(nodes: AIBuilderNode[], edges: AIBuilderEdge[]): Promise<AIBuilderNode[]>;
  applyGridLayout(nodes: AIBuilderNode[]): Promise<AIBuilderNode[]>;
  
  // Layout analysis
  analyzeLayout(nodes: AIBuilderNode[], edges: AIBuilderEdge[]): LayoutAnalysis;
  calculateLayoutScore(nodes: AIBuilderNode[], edges: AIBuilderEdge[]): number;
  
  // Layout constraints
  addConstraint(constraint: LayoutConstraint): void;
  removeConstraint(constraintId: string): void;
  validateConstraints(nodes: AIBuilderNode[]): ConstraintValidation[];
}
```

## 🔧 **Interfaces**

### Core Types

```typescript
interface AIBuilderNode {
  id: string;
  type: string;
  position: Position;
  data: NodeData;
  style?: NodeStyle;
  aiGenerated: boolean;
  confidence: number;
  metadata: NodeMetadata;
}

interface AIBuilderEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  style?: EdgeStyle;
  aiGenerated: boolean;
  confidence: number;
  metadata: EdgeMetadata;
}

interface BuildResult {
  success: boolean;
  nodes: AIBuilderNode[];
  edges: AIBuilderEdge[];
  animations: AnimationStep[];
  explanations: BuildExplanation[];
  errors: BuildError[];
  warnings: BuildWarning[];
  metadata: BuildMetadata;
}

interface NodeData {
  id: string;
  type: string;
  label: string;
  description?: string;
  parameters: Record<string, any>;
  aiGenerated: boolean;
  confidence: number;
  explanation?: string;
  suggestedParameters?: Record<string, any>;
  optimizationHints?: string[];
}
```

### Configuration Types

```typescript
interface AIBuilderConfig {
  enableAnimations: boolean;
  enableOptimization: boolean;
  animationSpeed: number;
  layoutAlgorithm: LayoutAlgorithm;
  gridSize: number;
  snapToGrid: boolean;
  autoConnect: boolean;
  validateConnections: boolean;
  maxNodes: number;
  debugMode: boolean;
}

interface NodePlacementConfig {
  algorithm: PlacementAlgorithm;
  spacing: {
    horizontal: number;
    vertical: number;
  };
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  avoidOverlaps: boolean;
  respectConstraints: boolean;
}

interface AnimationOptions {
  duration: number;
  delay: number;
  easing: EasingFunction;
  showExplanations: boolean;
  pauseBetweenSteps: boolean;
  highlightActiveNode: boolean;
}
```

### Result Types

```typescript
interface PlacementResult {
  success: boolean;
  placements: NodePlacement[];
  collisions: CollisionReport[];
  optimizationApplied: boolean;
  layoutScore: number;
}

interface NodePlacement {
  nodeId: string;
  position: Position;
  confidence: number;
  reasoning: string;
  alternatives: Position[];
}

interface AnimatedBuildResult extends BuildResult {
  animationSteps: AnimationStep[];
  totalDuration: number;
  explanations: StepExplanation[];
  controls: AnimationControls;
}

interface AnimationStep {
  stepNumber: number;
  type: AnimationType;
  nodeId?: string;
  edgeId?: string;
  duration: number;
  delay: number;
  explanation: string;
  highlight: boolean;
}
```

## 📖 **Methods**

### `buildStrategy(blueprint: StrategyBlueprint): Promise<BuildResult>`

Builds a complete strategy from a blueprint with AI-optimized placement and connections.

**Parameters:**
- `blueprint` (StrategyBlueprint): Strategy blueprint to build

**Returns:**
- `Promise<BuildResult>`: Complete build result with nodes, edges, and metadata

**Example:**
```typescript
const aiBuilder = new AIStrategyBuilder({
  enableAnimations: true,
  enableOptimization: true,
  layoutAlgorithm: LayoutAlgorithm.HIERARCHICAL
});

const result = await aiBuilder.buildStrategy(blueprint);

if (result.success) {
  console.log(`Built strategy with ${result.nodes.length} nodes and ${result.edges.length} connections`);
  
  // Access generated nodes
  result.nodes.forEach(node => {
    console.log(`Node: ${node.type} at (${node.position.x}, ${node.position.y})`);
    console.log(`Confidence: ${node.confidence}`);
  });
  
  // Access explanations
  result.explanations.forEach(explanation => {
    console.log(`Step ${explanation.stepNumber}: ${explanation.description}`);
  });
} else {
  console.error('Build failed:', result.errors);
}
```

### `buildWithAnimation(blueprint: StrategyBlueprint, options?: AnimationOptions): Promise<AnimatedBuildResult>`

Builds a strategy with step-by-step animations for educational purposes.

**Parameters:**
- `blueprint` (StrategyBlueprint): Strategy blueprint to build
- `options` (AnimationOptions, optional): Animation configuration

**Returns:**
- `Promise<AnimatedBuildResult>`: Build result with animation steps and controls

**Example:**
```typescript
const animationOptions: AnimationOptions = {
  duration: 1000,
  delay: 500,
  easing: 'ease-in-out',
  showExplanations: true,
  pauseBetweenSteps: true,
  highlightActiveNode: true
};

const result = await aiBuilder.buildWithAnimation(blueprint, animationOptions);

// Control animation playback
await result.controls.play();
await result.controls.pause();
await result.controls.replay();
result.controls.setSpeed(2.0); // 2x speed

// Access animation steps
result.animationSteps.forEach(step => {
  console.log(`Step ${step.stepNumber}: ${step.type} - ${step.explanation}`);
});
```

### `placeNodes(components: StrategyComponent[]): Promise<PlacementResult>`

Intelligently places nodes on the canvas with collision avoidance and optimization.

**Parameters:**
- `components` (StrategyComponent[]): Strategy components to place

**Returns:**
- `Promise<PlacementResult>`: Placement results with positions and analysis

**Example:**
```typescript
const nodePlacer = new NodePlacer({
  algorithm: PlacementAlgorithm.FORCE_DIRECTED,
  spacing: { horizontal: 200, vertical: 150 },
  avoidOverlaps: true
});

const placementResult = await nodePlacer.placeNodes(blueprint.components);

if (placementResult.success) {
  placementResult.placements.forEach(placement => {
    console.log(`${placement.nodeId}: (${placement.position.x}, ${placement.position.y})`);
    console.log(`Confidence: ${placement.confidence}`);
    console.log(`Reasoning: ${placement.reasoning}`);
  });
  
  if (placementResult.collisions.length > 0) {
    console.warn('Collisions detected:', placementResult.collisions);
  }
}
```

### `createConnections(nodes: AIBuilderNode[]): Promise<AIBuilderEdge[]>`

Creates optimized connections between nodes based on data flow requirements.

**Parameters:**
- `nodes` (AIBuilderNode[]): Nodes to connect

**Returns:**
- `Promise<AIBuilderEdge[]>`: Array of connection configurations

**Example:**
```typescript
const connectionCreator = new ConnectionCreator({
  autoRoute: true,
  avoidOverlaps: true,
  optimizeAngles: true
});

const connections = await connectionCreator.createConnections(nodes);

connections.forEach(edge => {
  console.log(`Connection: ${edge.source} -> ${edge.target}`);
  console.log(`Type: ${edge.type}`);
  console.log(`Confidence: ${edge.confidence}`);
  
  if (edge.style?.path) {
    console.log(`Custom path: ${edge.style.path}`);
  }
});

// Validate connections
const validation = connectionCreator.validateConnection(sourceNode, targetNode);
if (!validation.valid) {
  console.warn('Invalid connection:', validation.reason);
  console.log('Suggestions:', validation.suggestions);
}
```

## 💡 **Usage Examples**

### Basic Strategy Building

```typescript
import { AIStrategyBuilder, StrategyBlueprint } from '@/agents/pinegenie-ai/builder';

const aiBuilder = new AIStrategyBuilder({
  enableAnimations: false,
  enableOptimization: true,
  layoutAlgorithm: LayoutAlgorithm.HIERARCHICAL,
  snapToGrid: true,
  gridSize: 20
});

async function buildStrategyFromBlueprint(blueprint: StrategyBlueprint) {
  try {
    // Build the strategy
    const result = await aiBuilder.buildStrategy(blueprint);
    
    if (!result.success) {
      throw new Error(`Build failed: ${result.errors.map(e => e.message).join(', ')}`);
    }
    
    // Integrate with existing builder state
    const stateIntegrator = new StateIntegrator(useBuilderStore.getState());
    
    await stateIntegrator.integrateNodes(result.nodes);
    await stateIntegrator.integrateEdges(result.edges);
    
    // Validate final state
    const validation = stateIntegrator.validateStateConsistency();
    
    if (!validation.valid) {
      console.warn('State consistency issues:', validation.warnings);
    }
    
    return result;
  } catch (error) {
    console.error('Strategy building failed:', error);
    throw error;
  }
}
```

### Animated Strategy Construction

```typescript
import { AIStrategyBuilder, AnimationOptions } from '@/agents/pinegenie-ai/builder';

const aiBuilder = new AIStrategyBuilder({
  enableAnimations: true,
  animationSpeed: 1.0
});

async function buildWithEducationalAnimation(blueprint: StrategyBlueprint) {
  const animationOptions: AnimationOptions = {
    duration: 800,
    delay: 300,
    easing: 'ease-out',
    showExplanations: true,
    pauseBetweenSteps: false,
    highlightActiveNode: true
  };
  
  const result = await aiBuilder.buildWithAnimation(blueprint, animationOptions);
  
  // Set up animation event handlers
  result.controls.onStepStart = (step: AnimationStep) => {
    console.log(`Starting step ${step.stepNumber}: ${step.explanation}`);
    
    // Show explanation in UI
    showExplanationTooltip(step.explanation);
  };
  
  result.controls.onStepComplete = (step: AnimationStep) => {
    console.log(`Completed step ${step.stepNumber}`);
    
    // Update progress indicator
    updateProgressBar(step.stepNumber, result.animationSteps.length);
  };
  
  result.controls.onAnimationComplete = () => {
    console.log('Animation completed');
    showCompletionMessage();
  };
  
  // Start the animation
  await result.controls.play();
  
  return result;
}
```

### Custom Node Placement

```typescript
import { NodePlacer, PlacementAlgorithm } from '@/agents/pinegenie-ai/builder';

const nodePlacer = new NodePlacer({
  algorithm: PlacementAlgorithm.CUSTOM,
  spacing: { horizontal: 250, vertical: 200 },
  margins: { top: 50, right: 50, bottom: 50, left: 50 },
  avoidOverlaps: true,
  respectConstraints: true
});

// Add custom placement constraints
nodePlacer.addConstraint({
  id: 'data-source-top',
  type: 'position',
  nodeTypes: ['data-source'],
  constraint: (node, allNodes) => {
    // Data sources should be at the top
    return { ...node.position, y: Math.min(100, node.position.y) };
  }
});

nodePlacer.addConstraint({
  id: 'actions-bottom',
  type: 'position',
  nodeTypes: ['buy-action', 'sell-action'],
  constraint: (node, allNodes) => {
    // Actions should be at the bottom
    const maxY = Math.max(...allNodes.map(n => n.position.y));
    return { ...node.position, y: Math.max(maxY + 100, node.position.y) };
  }
});

async function placeNodesWithConstraints(components: StrategyComponent[]) {
  const result = await nodePlacer.placeNodes(components);
  
  if (result.collisions.length > 0) {
    console.log('Resolving collisions...');
    const resolvedNodes = nodePlacer.resolveCollisions(
      result.placements.map(p => ({ ...p, position: p.position })),
      result.collisions
    );
    
    return resolvedNodes;
  }
  
  return result.placements;
}
```

### Advanced Layout Optimization

```typescript
import { LayoutOptimizer, LayoutAlgorithm } from '@/agents/pinegenie-ai/builder';

const layoutOptimizer = new LayoutOptimizer({
  algorithm: LayoutAlgorithm.FORCE_DIRECTED,
  iterations: 100,
  springLength: 200,
  springStrength: 0.1,
  repulsionStrength: 1000
});

async function optimizeStrategyLayout(nodes: AIBuilderNode[], edges: AIBuilderEdge[]) {
  // Analyze current layout
  const analysis = layoutOptimizer.analyzeLayout(nodes, edges);
  console.log(`Current layout score: ${analysis.score}`);
  console.log(`Issues found: ${analysis.issues.length}`);
  
  // Apply different layout algorithms and compare
  const algorithms = [
    LayoutAlgorithm.FORCE_DIRECTED,
    LayoutAlgorithm.HIERARCHICAL,
    LayoutAlgorithm.CIRCULAR
  ];
  
  const results = await Promise.all(
    algorithms.map(async (algorithm) => {
      layoutOptimizer.setAlgorithm(algorithm);
      const optimizedNodes = await layoutOptimizer.applyLayout(nodes, edges);
      const score = layoutOptimizer.calculateLayoutScore(optimizedNodes, edges);
      
      return {
        algorithm,
        nodes: optimizedNodes,
        score
      };
    })
  );
  
  // Select best layout
  const bestResult = results.reduce((best, current) => 
    current.score > best.score ? current : best
  );
  
  console.log(`Best layout: ${bestResult.algorithm} (score: ${bestResult.score})`);
  
  return bestResult.nodes;
}
```

### State Integration with Undo/Redo

```typescript
import { StateIntegrator, StateSnapshot } from '@/agents/pinegenie-ai/builder';

const stateIntegrator = new StateIntegrator(useBuilderStore.getState());

async function buildStrategyWithUndoSupport(blueprint: StrategyBlueprint) {
  // Create snapshot before changes
  const snapshot = stateIntegrator.createStateSnapshot();
  
  try {
    // Build strategy
    const aiBuilder = new AIStrategyBuilder();
    const result = await aiBuilder.buildStrategy(blueprint);
    
    // Integrate with builder state
    await stateIntegrator.integrateNodes(result.nodes);
    await stateIntegrator.integrateEdges(result.edges);
    
    // Validate integration
    const validation = stateIntegrator.validateStateConsistency();
    
    if (!validation.valid) {
      throw new Error('State integration failed');
    }
    
    // Track changes for undo/redo
    stateIntegrator.trackChanges([
      { type: 'nodes-added', data: result.nodes },
      { type: 'edges-added', data: result.edges }
    ]);
    
    return result;
  } catch (error) {
    // Restore previous state on error
    console.error('Build failed, restoring previous state:', error);
    await stateIntegrator.restoreStateSnapshot(snapshot);
    throw error;
  }
}

// Undo last AI operation
async function undoLastAIOperation() {
  const history = stateIntegrator.getChangeHistory();
  const lastAIChange = history.reverse().find(change => change.source === 'ai');
  
  if (lastAIChange && lastAIChange.snapshot) {
    await stateIntegrator.restoreStateSnapshot(lastAIChange.snapshot);
    console.log('Undid last AI operation');
  } else {
    console.log('No AI operations to undo');
  }
}
```

## 🔗 **Integration Patterns**

### Safe Integration with Existing Builder

```typescript
// Always use existing builder APIs
import { useBuilderStore } from '@/app/builder/store/builder-state';

class SafeBuilderIntegration {
  private builderStore = useBuilderStore.getState();
  
  async addAIGeneratedNodes(nodes: AIBuilderNode[]) {
    // Use existing addNode method
    nodes.forEach(node => {
      this.builderStore.addNode({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data
      });
    });
  }
  
  async addAIGeneratedEdges(edges: AIBuilderEdge[]) {
    // Use existing addEdge method
    edges.forEach(edge => {
      this.builderStore.addEdge({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle
      });
    });
  }
}
```

### Theme Integration

```typescript
// Respect existing theme system
import { useTheme } from '@/app/theme/theme-context';

class ThemedAIBuilder extends AIStrategyBuilder {
  private theme = useTheme();
  
  protected applyThemeToNodes(nodes: AIBuilderNode[]): AIBuilderNode[] {
    return nodes.map(node => ({
      ...node,
      style: {
        ...node.style,
        backgroundColor: this.theme.colors.nodeBackground,
        borderColor: this.theme.colors.nodeBorder,
        color: this.theme.colors.nodeText
      }
    }));
  }
  
  protected applyThemeToEdges(edges: AIBuilderEdge[]): AIBuilderEdge[] {
    return edges.map(edge => ({
      ...edge,
      style: {
        ...edge.style,
        stroke: this.theme.colors.edgeStroke,
        strokeWidth: this.theme.sizes.edgeWidth
      }
    }));
  }
}
```

## ⚡ **Performance Optimization**

### Lazy Loading and Virtualization

```typescript
class OptimizedAIBuilder extends AIStrategyBuilder {
  private nodeCache = new Map<string, AIBuilderNode>();
  private edgeCache = new Map<string, AIBuilderEdge>();
  
  async buildLargeStrategy(blueprint: StrategyBlueprint): Promise<BuildResult> {
    // Build in chunks for large strategies
    const chunks = this.chunkComponents(blueprint.components, 10);
    const results: BuildResult[] = [];
    
    for (const chunk of chunks) {
      const chunkBlueprint = { ...blueprint, components: chunk };
      const result = await this.buildStrategy(chunkBlueprint);
      results.push(result);
      
      // Cache results
      result.nodes.forEach(node => this.nodeCache.set(node.id, node));
      result.edges.forEach(edge => this.edgeCache.set(edge.id, edge));
    }
    
    // Combine results
    return this.combineResults(results);
  }
  
  private chunkComponents(components: StrategyComponent[], size: number): StrategyComponent[][] {
    const chunks: StrategyComponent[][] = [];
    for (let i = 0; i < components.length; i += size) {
      chunks.push(components.slice(i, i + size));
    }
    return chunks;
  }
}
```

### Memory Management

```typescript
class MemoryEfficientBuilder extends AIStrategyBuilder {
  private maxCacheSize = 100;
  private buildCache = new LRUCache<string, BuildResult>(this.maxCacheSize);
  
  async buildStrategy(blueprint: StrategyBlueprint): Promise<BuildResult> {
    const cacheKey = this.generateCacheKey(blueprint);
    
    // Check cache first
    const cached = this.buildCache.get(cacheKey);
    if (cached) {
      return this.cloneBuildResult(cached);
    }
    
    // Build and cache result
    const result = await super.buildStrategy(blueprint);
    this.buildCache.set(cacheKey, result);
    
    return result;
  }
  
  private generateCacheKey(blueprint: StrategyBlueprint): string {
    return `${blueprint.strategyType}-${JSON.stringify(blueprint.components)}`;
  }
  
  clearCache(): void {
    this.buildCache.clear();
  }
}
```

---

**Next**: [Chat Interface API](./chat.md)  
**Previous**: [Strategy Interpreter API](./interpreter.md)