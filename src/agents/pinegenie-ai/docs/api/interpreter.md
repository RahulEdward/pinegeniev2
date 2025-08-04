# Strategy Interpreter API

The Strategy Interpreter module converts trading intents and parameters into executable strategy blueprints. It handles the translation from natural language understanding to concrete strategy components.

## 📋 **Table of Contents**

- [Core Classes](#core-classes)
- [Interfaces](#interfaces)
- [Methods](#methods)
- [Usage Examples](#usage-examples)
- [Blueprint Structure](#blueprint-structure)
- [Validation](#validation)

## 🏗 **Core Classes**

### `StrategyInterpreter`

Main class for converting intents to strategy blueprints.

```typescript
class StrategyInterpreter {
  constructor(config?: InterpreterConfig);
  
  // Core interpretation methods
  async interpretIntent(intent: TradingIntent, parameters: StrategyParameters): Promise<StrategyBlueprint>;
  async validateBlueprint(blueprint: StrategyBlueprint): Promise<ValidationResult>;
  async optimizeBlueprint(blueprint: StrategyBlueprint): Promise<StrategyBlueprint>;
  
  // Component mapping
  async mapToNodes(blueprint: StrategyBlueprint): Promise<NodeConfiguration[]>;
  async createConnections(nodes: NodeConfiguration[]): Promise<ConnectionConfiguration[]>;
  
  // Blueprint management
  saveBlueprint(blueprint: StrategyBlueprint): Promise<string>;
  loadBlueprint(id: string): Promise<StrategyBlueprint>;
  cloneBlueprint(blueprint: StrategyBlueprint): StrategyBlueprint;
}
```

### `BlueprintGenerator`

Generates strategy blueprints from trading intents.

```typescript
class BlueprintGenerator {
  constructor(knowledgeBase?: TradingKnowledgeBase);
  
  // Blueprint generation
  generateBlueprint(intent: TradingIntent, parameters: StrategyParameters): Promise<StrategyBlueprint>;
  addComponent(blueprint: StrategyBlueprint, component: StrategyComponent): StrategyBlueprint;
  removeComponent(blueprint: StrategyBlueprint, componentId: string): StrategyBlueprint;
  
  // Component resolution
  resolveComponents(intent: TradingIntent): StrategyComponent[];
  resolveDependencies(components: StrategyComponent[]): ComponentFlow[];
  
  // Optimization
  optimizeComponentOrder(components: StrategyComponent[]): StrategyComponent[];
  validateComponentCompatibility(components: StrategyComponent[]): ValidationResult;
}
```

### `NodeMapper`

Maps strategy components to visual builder nodes.

```typescript
class NodeMapper {
  constructor(nodeRegistry?: NodeRegistry);
  
  // Node mapping
  mapComponentToNode(component: StrategyComponent): NodeConfiguration;
  mapParametersToNodeData(parameters: StrategyParameters, nodeType: string): NodeData;
  
  // Node configuration
  getNodeConfiguration(nodeType: string): NodeTypeConfiguration;
  validateNodeConfiguration(config: NodeConfiguration): ValidationResult;
  
  // Position calculation
  calculateNodePosition(node: NodeConfiguration, existingNodes: NodeConfiguration[]): Position;
  optimizeNodeLayout(nodes: NodeConfiguration[]): NodeConfiguration[];
}
```

### `ConnectionLogic`

Handles automatic connection generation between nodes.

```typescript
class ConnectionLogic {
  constructor(connectionRules?: ConnectionRule[]);
  
  // Connection generation
  generateConnections(nodes: NodeConfiguration[]): ConnectionConfiguration[];
  validateConnection(source: NodeConfiguration, target: NodeConfiguration): boolean;
  
  // Connection optimization
  optimizeConnections(connections: ConnectionConfiguration[]): ConnectionConfiguration[];
  detectConnectionConflicts(connections: ConnectionConfiguration[]): ConflictReport[];
  
  // Data flow analysis
  analyzeDataFlow(nodes: NodeConfiguration[], connections: ConnectionConfiguration[]): DataFlowAnalysis;
  validateDataFlow(analysis: DataFlowAnalysis): ValidationResult;
}
```

### `ValidationEngine`

Validates strategy blueprints and configurations.

```typescript
class ValidationEngine {
  constructor(validationRules?: ValidationRule[]);
  
  // Blueprint validation
  validateBlueprint(blueprint: StrategyBlueprint): ValidationResult;
  validateComponents(components: StrategyComponent[]): ValidationResult;
  validateFlow(flow: ComponentFlow[]): ValidationResult;
  
  // Parameter validation
  validateParameters(parameters: StrategyParameters, strategyType: StrategyType): ValidationResult;
  validateParameterRanges(parameters: StrategyParameters): ValidationResult;
  
  // Completeness validation
  validateCompleteness(blueprint: StrategyBlueprint): CompletenessReport;
  suggestMissingComponents(blueprint: StrategyBlueprint): ComponentSuggestion[];
}
```

## 🔧 **Interfaces**

### Core Types

```typescript
interface StrategyBlueprint {
  id: string;
  name: string;
  description: string;
  strategyType: StrategyType;
  components: StrategyComponent[];
  flow: ComponentFlow[];
  parameters: BlueprintParameters;
  riskProfile: RiskProfile;
  metadata: BlueprintMetadata;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

interface StrategyComponent {
  id: string;
  type: ComponentType;
  subtype: string;
  label: string;
  description?: string;
  parameters: ComponentParameters;
  dependencies: string[];
  optional: boolean;
  priority: number;
  category: ComponentCategory;
}

interface ComponentFlow {
  id: string;
  from: string;
  to: string;
  type: FlowType;
  label?: string;
  conditions?: FlowCondition[];
  priority: number;
}

interface NodeConfiguration {
  id: string;
  type: string;
  position: Position;
  data: NodeData;
  style?: NodeStyle;
  aiGenerated: boolean;
  confidence: number;
  metadata: NodeMetadata;
}

interface ConnectionConfiguration {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type: ConnectionType;
  style?: ConnectionStyle;
  aiGenerated: boolean;
  confidence: number;
}
```

### Configuration Types

```typescript
interface InterpreterConfig {
  enableOptimization: boolean;
  enableValidation: boolean;
  confidenceThreshold: number;
  maxComponents: number;
  defaultRiskProfile: RiskProfile;
  customRules?: ValidationRule[];
  debugMode?: boolean;
}

interface BlueprintParameters {
  [componentId: string]: {
    [parameterName: string]: {
      value: any;
      type: ParameterType;
      range?: [number, number];
      description: string;
      optimizable: boolean;
      source: 'user' | 'default' | 'inferred';
    };
  };
}

interface RiskProfile {
  level: 'low' | 'medium' | 'high';
  maxRisk: number;
  stopLoss: number;
  takeProfit: number;
  maxDrawdown: number;
  positionSizing: 'fixed' | 'percentage' | 'kelly';
  riskRewardRatio: number;
}
```

### Validation Types

```typescript
interface ValidationResult {
  valid: boolean;
  score: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
  metadata: ValidationMetadata;
}

interface CompletenessReport {
  complete: boolean;
  completionScore: number;
  missingComponents: ComponentSuggestion[];
  optionalComponents: ComponentSuggestion[];
  recommendations: string[];
}

interface ComponentSuggestion {
  type: ComponentType;
  subtype: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  parameters?: ComponentParameters;
}
```

## 📖 **Methods**

### `interpretIntent(intent: TradingIntent, parameters: StrategyParameters): Promise<StrategyBlueprint>`

Converts a trading intent and parameters into a complete strategy blueprint.

**Parameters:**
- `intent` (TradingIntent): The trading intent from NLP processing
- `parameters` (StrategyParameters): Extracted strategy parameters

**Returns:**
- `Promise<StrategyBlueprint>`: Complete strategy blueprint

**Example:**
```typescript
const interpreter = new StrategyInterpreter();

const intent: TradingIntent = {
  strategyType: StrategyType.MEAN_REVERSION,
  indicators: ['rsi'],
  conditions: ['less_than'],
  actions: ['buy'],
  riskManagement: ['stop_loss'],
  confidence: 0.9
};

const parameters: StrategyParameters = {
  rsiPeriod: { value: 14, type: 'number', confidence: 0.8, source: 'extracted' },
  threshold: { value: 30, type: 'number', confidence: 0.9, source: 'extracted' }
};

const blueprint = await interpreter.interpretIntent(intent, parameters);
console.log(blueprint.components); // Array of strategy components
console.log(blueprint.flow); // Component flow connections
```

### `mapToNodes(blueprint: StrategyBlueprint): Promise<NodeConfiguration[]>`

Maps strategy blueprint components to visual builder nodes.

**Parameters:**
- `blueprint` (StrategyBlueprint): Strategy blueprint to map

**Returns:**
- `Promise<NodeConfiguration[]>`: Array of node configurations

**Example:**
```typescript
const nodes = await interpreter.mapToNodes(blueprint);

nodes.forEach(node => {
  console.log(`Node: ${node.type} at position (${node.position.x}, ${node.position.y})`);
  console.log(`Data:`, node.data);
  console.log(`AI Generated: ${node.aiGenerated}`);
});
```

### `createConnections(nodes: NodeConfiguration[]): Promise<ConnectionConfiguration[]>`

Creates connections between nodes based on data flow requirements.

**Parameters:**
- `nodes` (NodeConfiguration[]): Array of node configurations

**Returns:**
- `Promise<ConnectionConfiguration[]>`: Array of connection configurations

**Example:**
```typescript
const connections = await interpreter.createConnections(nodes);

connections.forEach(conn => {
  console.log(`Connection: ${conn.source} -> ${conn.target}`);
  console.log(`Type: ${conn.type}`);
  console.log(`Confidence: ${conn.confidence}`);
});
```

### `validateBlueprint(blueprint: StrategyBlueprint): Promise<ValidationResult>`

Validates a strategy blueprint for completeness and correctness.

**Parameters:**
- `blueprint` (StrategyBlueprint): Blueprint to validate

**Returns:**
- `Promise<ValidationResult>`: Validation results with errors and suggestions

**Example:**
```typescript
const validation = await interpreter.validateBlueprint(blueprint);

if (!validation.valid) {
  console.log('Validation errors:');
  validation.errors.forEach(error => {
    console.log(`- ${error.message} (${error.severity})`);
  });
  
  console.log('Suggestions:');
  validation.suggestions.forEach(suggestion => {
    console.log(`- ${suggestion.message}`);
  });
}
```

## 💡 **Usage Examples**

### Basic Blueprint Generation

```typescript
import { StrategyInterpreter, TradingIntent, StrategyParameters } from '@/agents/pinegenie-ai/interpreter';

const interpreter = new StrategyInterpreter({
  enableOptimization: true,
  enableValidation: true,
  confidenceThreshold: 0.7
});

async function createStrategy(intent: TradingIntent, parameters: StrategyParameters) {
  try {
    // Generate blueprint
    const blueprint = await interpreter.interpretIntent(intent, parameters);
    
    // Validate blueprint
    const validation = await interpreter.validateBlueprint(blueprint);
    
    if (!validation.valid) {
      console.warn('Blueprint validation failed:', validation.errors);
      // Handle validation errors
    }
    
    // Map to visual nodes
    const nodes = await interpreter.mapToNodes(blueprint);
    const connections = await interpreter.createConnections(nodes);
    
    return {
      blueprint,
      nodes,
      connections,
      validation
    };
  } catch (error) {
    console.error('Strategy creation failed:', error);
    throw error;
  }
}
```

### Advanced Blueprint Customization

```typescript
import { StrategyInterpreter, BlueprintGenerator } from '@/agents/pinegenie-ai/interpreter';

const interpreter = new StrategyInterpreter();
const generator = new BlueprintGenerator();

async function createCustomStrategy(intent: TradingIntent, parameters: StrategyParameters) {
  // Generate base blueprint
  let blueprint = await interpreter.interpretIntent(intent, parameters);
  
  // Add custom risk management
  const riskComponent = {
    id: 'custom-risk-1',
    type: ComponentType.RISK_MANAGEMENT,
    subtype: 'trailing_stop',
    label: 'Trailing Stop Loss',
    parameters: {
      trailAmount: { value: 0.02, type: 'percentage' },
      activationLevel: { value: 0.01, type: 'percentage' }
    },
    dependencies: [],
    optional: false,
    priority: 5,
    category: ComponentCategory.RISK_MANAGEMENT
  };
  
  blueprint = generator.addComponent(blueprint, riskComponent);
  
  // Optimize component order
  blueprint.components = generator.optimizeComponentOrder(blueprint.components);
  
  // Validate final blueprint
  const validation = await interpreter.validateBlueprint(blueprint);
  
  return { blueprint, validation };
}
```

### Blueprint Analysis and Optimization

```typescript
import { StrategyInterpreter, ValidationEngine } from '@/agents/pinegenie-ai/interpreter';

const interpreter = new StrategyInterpreter();
const validator = new ValidationEngine();

async function analyzeAndOptimizeStrategy(blueprint: StrategyBlueprint) {
  // Validate completeness
  const completeness = validator.validateCompleteness(blueprint);
  
  if (!completeness.complete) {
    console.log(`Strategy is ${completeness.completionScore * 100}% complete`);
    
    // Add missing components
    for (const suggestion of completeness.missingComponents) {
      if (suggestion.priority === 'high') {
        console.log(`Adding missing component: ${suggestion.type}`);
        // Add component logic here
      }
    }
  }
  
  // Optimize blueprint
  const optimizedBlueprint = await interpreter.optimizeBlueprint(blueprint);
  
  // Compare original vs optimized
  const originalValidation = await interpreter.validateBlueprint(blueprint);
  const optimizedValidation = await interpreter.validateBlueprint(optimizedBlueprint);
  
  console.log(`Original score: ${originalValidation.score}`);
  console.log(`Optimized score: ${optimizedValidation.score}`);
  
  return optimizedBlueprint;
}
```

### Node Layout Optimization

```typescript
import { NodeMapper, ConnectionLogic } from '@/agents/pinegenie-ai/interpreter';

const nodeMapper = new NodeMapper();
const connectionLogic = new ConnectionLogic();

async function optimizeVisualLayout(blueprint: StrategyBlueprint) {
  // Map to nodes
  let nodes = await Promise.all(
    blueprint.components.map(component => 
      nodeMapper.mapComponentToNode(component)
    )
  );
  
  // Optimize node positions
  nodes = nodeMapper.optimizeNodeLayout(nodes);
  
  // Generate optimized connections
  let connections = connectionLogic.generateConnections(nodes);
  connections = connectionLogic.optimizeConnections(connections);
  
  // Analyze data flow
  const dataFlow = connectionLogic.analyzeDataFlow(nodes, connections);
  const flowValidation = connectionLogic.validateDataFlow(dataFlow);
  
  if (!flowValidation.valid) {
    console.warn('Data flow issues detected:', flowValidation.errors);
  }
  
  return {
    nodes,
    connections,
    dataFlow,
    validation: flowValidation
  };
}
```

## 🏗 **Blueprint Structure**

### Component Types

```typescript
enum ComponentType {
  DATA_SOURCE = 'data-source',
  INDICATOR = 'indicator',
  CONDITION = 'condition',
  ACTION = 'action',
  RISK_MANAGEMENT = 'risk-management',
  UTILITY = 'utility'
}

enum ComponentCategory {
  INPUT = 'input',
  PROCESSING = 'processing',
  LOGIC = 'logic',
  OUTPUT = 'output',
  RISK_MANAGEMENT = 'risk-management'
}
```

### Flow Types

```typescript
enum FlowType {
  DATA = 'data',
  SIGNAL = 'signal',
  TRIGGER = 'trigger',
  CONTROL = 'control'
}

interface FlowCondition {
  type: 'value' | 'state' | 'time';
  condition: string;
  value?: any;
}
```

### Example Blueprint Structure

```typescript
const exampleBlueprint: StrategyBlueprint = {
  id: 'rsi-mean-reversion-001',
  name: 'RSI Mean Reversion Strategy',
  description: 'Buy when RSI is oversold, sell when overbought',
  strategyType: StrategyType.MEAN_REVERSION,
  components: [
    {
      id: 'data-source-1',
      type: ComponentType.DATA_SOURCE,
      subtype: 'market_data',
      label: 'Market Data',
      parameters: {
        symbol: { value: 'BTCUSDT', type: 'string' },
        timeframe: { value: '1h', type: 'string' }
      },
      dependencies: [],
      optional: false,
      priority: 1,
      category: ComponentCategory.INPUT
    },
    {
      id: 'rsi-1',
      type: ComponentType.INDICATOR,
      subtype: 'rsi',
      label: 'RSI Indicator',
      parameters: {
        period: { value: 14, type: 'number', range: [2, 50] },
        source: { value: 'close', type: 'string' }
      },
      dependencies: ['data-source-1'],
      optional: false,
      priority: 2,
      category: ComponentCategory.PROCESSING
    },
    {
      id: 'condition-oversold',
      type: ComponentType.CONDITION,
      subtype: 'less_than',
      label: 'RSI Oversold',
      parameters: {
        threshold: { value: 30, type: 'number', range: [10, 40] }
      },
      dependencies: ['rsi-1'],
      optional: false,
      priority: 3,
      category: ComponentCategory.LOGIC
    },
    {
      id: 'buy-action',
      type: ComponentType.ACTION,
      subtype: 'buy',
      label: 'Buy Order',
      parameters: {
        quantity: { value: 1, type: 'number' },
        orderType: { value: 'market', type: 'string' }
      },
      dependencies: ['condition-oversold'],
      optional: false,
      priority: 4,
      category: ComponentCategory.OUTPUT
    }
  ],
  flow: [
    {
      id: 'flow-1',
      from: 'data-source-1',
      to: 'rsi-1',
      type: FlowType.DATA,
      priority: 1
    },
    {
      id: 'flow-2',
      from: 'rsi-1',
      to: 'condition-oversold',
      type: FlowType.SIGNAL,
      priority: 2
    },
    {
      id: 'flow-3',
      from: 'condition-oversold',
      to: 'buy-action',
      type: FlowType.TRIGGER,
      priority: 3
    }
  ],
  parameters: {
    'rsi-1': {
      period: {
        value: 14,
        type: 'number',
        range: [2, 50],
        description: 'RSI calculation period',
        optimizable: true,
        source: 'user'
      }
    }
  },
  riskProfile: {
    level: 'medium',
    maxRisk: 0.02,
    stopLoss: 0.05,
    takeProfit: 0.10,
    maxDrawdown: 0.15,
    positionSizing: 'percentage',
    riskRewardRatio: 2.0
  },
  metadata: {
    tags: ['rsi', 'mean-reversion', 'momentum'],
    difficulty: 'beginner',
    estimatedPerformance: {
      winRate: 0.65,
      avgReturn: 0.08,
      maxDrawdown: 0.12
    }
  },
  version: '1.0.0',
  createdAt: new Date(),
  updatedAt: new Date()
};
```

## ✅ **Validation**

### Validation Rules

```typescript
interface ValidationRule {
  id: string;
  name: string;
  description: string;
  category: 'structure' | 'parameters' | 'flow' | 'risk';
  severity: 'error' | 'warning' | 'info';
  validator: (blueprint: StrategyBlueprint) => ValidationResult;
}

// Example validation rules
const validationRules: ValidationRule[] = [
  {
    id: 'require-data-source',
    name: 'Data Source Required',
    description: 'Strategy must have at least one data source',
    category: 'structure',
    severity: 'error',
    validator: (blueprint) => {
      const hasDataSource = blueprint.components.some(
        c => c.type === ComponentType.DATA_SOURCE
      );
      return {
        valid: hasDataSource,
        score: hasDataSource ? 1 : 0,
        errors: hasDataSource ? [] : [{
          type: 'structure',
          message: 'Strategy requires at least one data source',
          severity: 'error'
        }],
        warnings: [],
        suggestions: hasDataSource ? [] : [{
          message: 'Add a market data source component',
          priority: 'high'
        }]
      };
    }
  }
];
```

### Custom Validation

```typescript
import { ValidationEngine, ValidationRule } from '@/agents/pinegenie-ai/interpreter';

// Create custom validation rule
const customRule: ValidationRule = {
  id: 'risk-reward-ratio',
  name: 'Risk-Reward Ratio Check',
  description: 'Ensure risk-reward ratio is at least 1:2',
  category: 'risk',
  severity: 'warning',
  validator: (blueprint) => {
    const ratio = blueprint.riskProfile.riskRewardRatio;
    const valid = ratio >= 2.0;
    
    return {
      valid,
      score: valid ? 1 : 0.5,
      errors: [],
      warnings: valid ? [] : [{
        type: 'risk',
        message: `Risk-reward ratio ${ratio} is below recommended 2.0`,
        severity: 'warning'
      }],
      suggestions: valid ? [] : [{
        message: 'Consider increasing take profit or reducing stop loss',
        priority: 'medium'
      }]
    };
  }
};

// Use custom validation
const validator = new ValidationEngine([customRule]);
const result = await validator.validateBlueprint(blueprint);
```

---

**Next**: [AI Builder Integration API](./builder.md)  
**Previous**: [Natural Language Processing API](./nlp.md)