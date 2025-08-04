/**
 * Node Configuration Mapper
 * 
 * Maps strategy components to visual builder nodes with proper configurations,
 * parameters, and positioning for the drag-and-drop interface.
 */

import { 
  StrategyComponent, 
  ComponentType, 
  StrategyBlueprint 
} from '../types/strategy-types';

import { 
  BuilderNode, 
  NodeData, 
  NodePosition 
} from '../types/builder-types';

// Note: These types are imported conceptually from the builder system
// In actual implementation, we would import from the correct path
interface NodeType {
  // This represents the node types from the builder system
}

interface NodeConfig {
  // This represents the node configuration from the builder system
  [key: string]: unknown;
}

interface CustomNodeData {
  // This represents the custom node data from the builder system
  id: string;
  label: string;
  type: string;
  description?: string;
  config?: NodeConfig;
  parameters?: Record<string, unknown>;
  category?: string;
  icon?: string;
  color?: string;
}

import { KnowledgeBase } from '../knowledge/knowledge-base';
import { AILogger } from '../core/logger';
import { AIError, AIErrorType } from '../core/error-handler';

export interface NodeMappingOptions {
  autoPosition?: boolean;
  gridSpacing?: number;
  startPosition?: NodePosition;
  optimizeLayout?: boolean;
  preserveExistingNodes?: boolean;
}

export interface NodeMappingResult {
  nodes: BuilderNode[];
  mappings: ComponentNodeMapping[];
  warnings: string[];
  suggestions: string[];
  layoutInfo: LayoutInfo;
}

export interface ComponentNodeMapping {
  componentId: string;
  nodeId: string;
  component: StrategyComponent;
  node: BuilderNode;
  mappingConfidence: number;
  alternativeNodes?: BuilderNode[];
}

export interface LayoutInfo {
  totalWidth: number;
  totalHeight: number;
  levels: NodeLevel[];
  connections: ConnectionInfo[];
}

export interface NodeLevel {
  level: number;
  nodes: string[];
  yPosition: number;
}

export interface ConnectionInfo {
  from: string;
  to: string;
  type: 'data' | 'signal' | 'trigger' | 'control';
  weight: number;
}

export class NodeMapper {
  private knowledgeBase: KnowledgeBase;
  private logger: AILogger;

  // Node type mapping rules
  private componentToNodeTypeMap: Map<ComponentType, NodeType[]> = new Map();
  
  // Parameter mapping rules
  private parameterMappingRules: Map<string, ParameterMappingRule[]> = new Map();
  
  // Layout configuration
  private layoutConfig = {
    gridSpacing: 200,
    levelSpacing: 150,
    nodeWidth: 180,
    nodeHeight: 80,
    marginX: 50,
    marginY: 50
  };

  constructor() {
    this.knowledgeBase = new KnowledgeBase();
    this.logger = AILogger.getInstance();
    
    this.initializeNodeTypeMappings();
    this.initializeParameterMappings();
    
    this.logger.info('NodeMapper', 'Node mapper initialized', {
      componentTypeMappings: this.componentToNodeTypeMap.size,
      parameterMappingRules: Array.from(this.parameterMappingRules.values()).reduce((sum, rules) => sum + rules.length, 0)
    });
  }

  /**
   * Map strategy components to builder nodes
   */
  public mapComponentsToNodes(
    components: StrategyComponent[],
    blueprint: StrategyBlueprint,
    options: NodeMappingOptions = {}
  ): NodeMappingResult {
    const startTime = performance.now();
    
    try {
      this.logger.debug('NodeMapper', 'Starting node mapping', {
        componentCount: components.length,
        options
      });

      const mappings: ComponentNodeMapping[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];

      // Map each component to a node
      for (const component of components) {
        const mapping = this.mapComponentToNode(component, options);
        mappings.push(mapping);
        
        if (mapping.mappingConfidence < 0.8) {
          warnings.push(`Low confidence mapping for component: ${component.label}`);
        }
        
        if (mapping.alternativeNodes && mapping.alternativeNodes.length > 0) {
          suggestions.push(`Alternative node types available for: ${component.label}`);
        }
      }

      // Calculate positions if auto-positioning is enabled
      if (options.autoPosition !== false) {
        this.calculateNodePositions(mappings, blueprint, options);
      }

      // Generate layout information
      const layoutInfo = this.generateLayoutInfo(mappings, blueprint);

      // Extract nodes from mappings
      const nodes = mappings.map(mapping => mapping.node);

      const processingTime = performance.now() - startTime;
      
      this.logger.info('NodeMapper', 'Node mapping completed', {
        componentCount: components.length,
        nodeCount: nodes.length,
        averageConfidence: mappings.reduce((sum, m) => sum + m.mappingConfidence, 0) / mappings.length,
        processingTime: `${processingTime.toFixed(2)}ms`
      });

      return {
        nodes,
        mappings,
        warnings,
        suggestions,
        layoutInfo
      };

    } catch (error) {
      this.logger.error('NodeMapper', 'Node mapping failed', { error, components });
      
      if (error instanceof AIError) {
        throw error;
      }
      
      throw new AIError(
        AIErrorType.NODE_MAPPING_FAILED,
        'Failed to map components to nodes',
        { originalError: error, components }
      );
    }
  }

  /**
   * Map a single component to a builder node
   */
  private mapComponentToNode(
    component: StrategyComponent,
    options: NodeMappingOptions
  ): ComponentNodeMapping {
    // Get possible node types for this component
    const possibleNodeTypes = this.componentToNodeTypeMap.get(component.type) || [];
    
    if (possibleNodeTypes.length === 0) {
      throw new AIError(
        AIErrorType.NODE_MAPPING_FAILED,
        `No node type mapping found for component type: ${component.type}`,
        { component }
      );
    }

    // Select best node type
    const bestNodeType = this.selectBestNodeType(component, possibleNodeTypes);
    
    // Create node configuration
    const nodeConfig = this.createNodeConfiguration(component, bestNodeType);
    
    // Create node data
    const nodeData = this.createNodeData(component, nodeConfig);
    
    // Create builder node
    const node = this.createBuilderNode(component, nodeData, bestNodeType);
    
    // Calculate mapping confidence
    const mappingConfidence = this.calculateMappingConfidence(component, node);
    
    // Generate alternative nodes if confidence is low
    const alternativeNodes = mappingConfidence < 0.8 ? 
      this.generateAlternativeNodes(component, possibleNodeTypes.filter(t => t !== bestNodeType)) : 
      undefined;

    return {
      componentId: component.id,
      nodeId: node.id,
      component,
      node,
      mappingConfidence,
      alternativeNodes
    };
  }

  /**
   * Select the best node type for a component
   */
  private selectBestNodeType(
    component: StrategyComponent,
    possibleTypes: NodeType[]
  ): NodeType {
    if (possibleTypes.length === 1) {
      return possibleTypes[0];
    }

    // Score each possible type
    const scoredTypes = possibleTypes.map(nodeType => ({
      nodeType,
      score: this.calculateNodeTypeScore(component, nodeType)
    }));

    // Sort by score (highest first)
    scoredTypes.sort((a, b) => b.score - a.score);

    return scoredTypes[0].nodeType;
  }

  /**
   * Calculate score for a node type given a component
   */
  private calculateNodeTypeScore(component: StrategyComponent, nodeType: NodeType): number {
    let score = 0;

    // Direct type mapping bonus
    const directMapping = this.getDirectTypeMapping(component.type);
    if (directMapping === nodeType) {
      score += 10;
    }

    // Subtype compatibility bonus
    const subtypeCompatibility = this.calculateSubtypeCompatibility(component.subtype, nodeType);
    score += subtypeCompatibility * 5;

    // Parameter compatibility bonus
    const parameterCompatibility = this.calculateParameterCompatibility(component.parameters, nodeType);
    score += parameterCompatibility * 3;

    // Template availability bonus
    const hasTemplate = this.hasNodeTemplate(nodeType, component.subtype);
    if (hasTemplate) {
      score += 2;
    }

    return score;
  }

  /**
   * Create node configuration from component
   */
  private createNodeConfiguration(component: StrategyComponent, nodeType: NodeType): NodeConfig {
    const config: NodeConfig = {};

    // Map component parameters to node config
    switch (component.type) {
      case ComponentType.DATA_SOURCE:
        config.symbol = component.parameters.symbol as string || 'BTCUSDT';
        config.timeframe = component.parameters.timeframe as string || '1h';
        config.source = component.parameters.source as string || 'binance';
        break;

      case ComponentType.INDICATOR:
        config.indicatorId = component.subtype;
        config.parameters = { ...component.parameters };
        break;

      case ComponentType.CONDITION:
        config.operator = this.mapConditionOperator(component.subtype);
        config.threshold = component.parameters.threshold as number || 0;
        break;

      case ComponentType.ACTION:
        config.orderType = this.mapActionOrderType(component.subtype);
        config.quantity = component.parameters.quantity as string || '25%';
        break;

      case ComponentType.RISK_MANAGEMENT:
        if (component.subtype === 'stop_loss') {
          config.stopLoss = component.parameters.stopLoss as number || 2;
        } else if (component.subtype === 'take_profit') {
          config.takeProfit = component.parameters.takeProfit as number || 5;
        }
        config.maxRisk = component.parameters.maxRisk as number || 1;
        break;

      case ComponentType.TIMING:
        config.startTime = component.parameters.startTime as string || '09:00';
        config.endTime = component.parameters.endTime as string || '16:00';
        config.timezone = component.parameters.timezone as string || 'UTC';
        break;

      case ComponentType.MATH:
        config.operation = this.mapMathOperation(component.subtype);
        config.value = component.parameters.value as number || 0;
        break;
    }

    // Add common properties
    config.enabled = true;

    return config;
  }

  /**
   * Create node data from component and config
   */
  private createNodeData(component: StrategyComponent, config: NodeConfig): CustomNodeData {
    return {
      id: component.id,
      label: component.label,
      type: this.mapComponentTypeToNodeType(component.type),
      description: this.generateNodeDescription(component),
      config,
      parameters: { ...component.parameters },
      category: this.getNodeCategory(component.type),
      icon: this.getNodeIcon(component.type, component.subtype),
      color: this.getNodeColor(component.type)
    };
  }

  /**
   * Create builder node from component and data
   */
  private createBuilderNode(
    component: StrategyComponent,
    nodeData: CustomNodeData,
    nodeType: NodeType
  ): BuilderNode {
    return {
      id: component.id,
      type: nodeType,
      position: component.position || { x: 0, y: 0 },
      data: nodeData,
      selected: false,
      dragging: false,
      width: this.layoutConfig.nodeWidth,
      height: this.layoutConfig.nodeHeight
    };
  }

  /**
   * Calculate positions for nodes based on blueprint structure
   */
  private calculateNodePositions(
    mappings: ComponentNodeMapping[],
    blueprint: StrategyBlueprint,
    options: NodeMappingOptions
  ): void {
    const startPosition = options.startPosition || { x: this.layoutConfig.marginX, y: this.layoutConfig.marginY };
    const gridSpacing = options.gridSpacing || this.layoutConfig.gridSpacing;

    // Group components by dependency level
    const levels = this.groupComponentsByLevel(mappings, blueprint);

    // Position nodes level by level
    let currentY = startPosition.y;
    
    for (const level of levels) {
      let currentX = startPosition.x;
      
      for (const mapping of level.mappings) {
        mapping.node.position = {
          x: currentX,
          y: currentY
        };
        
        // Update component position as well
        mapping.component.position = { ...mapping.node.position };
        
        currentX += gridSpacing;
      }
      
      currentY += this.layoutConfig.levelSpacing;
    }
  }

  /**
   * Group components by dependency level for layout
   */
  private groupComponentsByLevel(
    mappings: ComponentNodeMapping[],
    blueprint: StrategyBlueprint
  ): LevelGroup[] {
    const levels: LevelGroup[] = [];
    const componentLevels = new Map<string, number>();

    // Calculate levels based on dependencies
    const calculateLevel = (componentId: string, visited: Set<string> = new Set()): number => {
      if (visited.has(componentId)) {
        return 0; // Circular dependency, place at level 0
      }
      
      if (componentLevels.has(componentId)) {
        return componentLevels.get(componentId)!;
      }

      visited.add(componentId);
      
      const component = mappings.find(m => m.componentId === componentId)?.component;
      if (!component) return 0;

      let maxDepLevel = -1;
      for (const depId of component.dependencies) {
        const depLevel = calculateLevel(depId, new Set(visited));
        maxDepLevel = Math.max(maxDepLevel, depLevel);
      }

      const level = maxDepLevel + 1;
      componentLevels.set(componentId, level);
      visited.delete(componentId);
      
      return level;
    };

    // Calculate levels for all components
    for (const mapping of mappings) {
      calculateLevel(mapping.componentId);
    }

    // Group mappings by level
    const levelGroups = new Map<number, ComponentNodeMapping[]>();
    for (const mapping of mappings) {
      const level = componentLevels.get(mapping.componentId) || 0;
      
      if (!levelGroups.has(level)) {
        levelGroups.set(level, []);
      }
      
      levelGroups.get(level)!.push(mapping);
    }

    // Convert to level groups
    for (const [level, levelMappings] of levelGroups) {
      levels.push({
        level,
        mappings: levelMappings.sort((a, b) => a.component.priority - b.component.priority)
      });
    }

    // Sort levels
    levels.sort((a, b) => a.level - b.level);

    return levels;
  }

  /**
   * Generate layout information
   */
  private generateLayoutInfo(
    mappings: ComponentNodeMapping[],
    blueprint: StrategyBlueprint
  ): LayoutInfo {
    const nodes = mappings.map(m => m.node);
    
    // Calculate total dimensions
    const positions = nodes.map(n => n.position);
    const minX = Math.min(...positions.map(p => p.x));
    const maxX = Math.max(...positions.map(p => p.x));
    const minY = Math.min(...positions.map(p => p.y));
    const maxY = Math.max(...positions.map(p => p.y));

    const totalWidth = maxX - minX + this.layoutConfig.nodeWidth + this.layoutConfig.marginX;
    const totalHeight = maxY - minY + this.layoutConfig.nodeHeight + this.layoutConfig.marginY;

    // Generate level information
    const levelMap = new Map<number, string[]>();
    for (const mapping of mappings) {
      const level = Math.floor((mapping.node.position.y - this.layoutConfig.marginY) / this.layoutConfig.levelSpacing);
      
      if (!levelMap.has(level)) {
        levelMap.set(level, []);
      }
      
      levelMap.get(level)!.push(mapping.nodeId);
    }

    const levels: NodeLevel[] = Array.from(levelMap.entries()).map(([level, nodeIds]) => ({
      level,
      nodes: nodeIds,
      yPosition: this.layoutConfig.marginY + level * this.layoutConfig.levelSpacing
    }));

    // Generate connection information
    const connections: ConnectionInfo[] = blueprint.flow.map(flow => ({
      from: flow.from,
      to: flow.to,
      type: this.mapFlowTypeToConnectionType(flow.type),
      weight: flow.weight || 1.0
    }));

    return {
      totalWidth,
      totalHeight,
      levels,
      connections
    };
  }

  /**
   * Calculate mapping confidence
   */
  private calculateMappingConfidence(component: StrategyComponent, node: BuilderNode): number {
    let confidence = 0.5; // Base confidence

    // Type mapping confidence
    const directMapping = this.getDirectTypeMapping(component.type);
    if (directMapping === node.type) {
      confidence += 0.3;
    }

    // Parameter mapping confidence
    const parameterMatch = this.calculateParameterMappingConfidence(component.parameters, node.data.config || {});
    confidence += parameterMatch * 0.2;

    // Template availability confidence
    if (this.hasNodeTemplate(node.type, component.subtype)) {
      confidence += 0.1;
    }

    return Math.min(1.0, confidence);
  }

  /**
   * Generate alternative nodes for low confidence mappings
   */
  private generateAlternativeNodes(
    component: StrategyComponent,
    alternativeTypes: NodeType[]
  ): BuilderNode[] {
    const alternatives: BuilderNode[] = [];

    for (const nodeType of alternativeTypes) {
      const config = this.createNodeConfiguration(component, nodeType);
      const nodeData = this.createNodeData(component, config);
      const node = this.createBuilderNode(component, nodeData, nodeType);
      
      // Use different ID for alternative
      node.id = `${component.id}_alt_${nodeType}`;
      
      alternatives.push(node);
    }

    return alternatives;
  }

  // Helper methods for mapping

  private getDirectTypeMapping(componentType: ComponentType): NodeType {
    const mapping: Record<ComponentType, NodeType> = {
      [ComponentType.DATA_SOURCE]: 'data-source',
      [ComponentType.INDICATOR]: 'indicator',
      [ComponentType.CONDITION]: 'condition',
      [ComponentType.ACTION]: 'action',
      [ComponentType.RISK_MANAGEMENT]: 'risk',
      [ComponentType.TIMING]: 'timing',
      [ComponentType.MATH]: 'math',
      [ComponentType.LOGIC]: 'condition' // Logic maps to condition
    };

    return mapping[componentType] || 'indicator';
  }

  private mapComponentTypeToNodeType(componentType: ComponentType): NodeType {
    return this.getDirectTypeMapping(componentType);
  }

  private calculateSubtypeCompatibility(componentSubtype: string, nodeType: NodeType): number {
    // Simple compatibility scoring - can be enhanced
    const compatibilityMap: Record<NodeType, string[]> = {
      'data-source': ['market_data', 'custom_data'],
      'indicator': ['rsi', 'sma', 'macd', 'bb', 'stoch'],
      'condition': ['greater_than', 'less_than', 'crosses_above', 'crosses_below'],
      'action': ['buy_order', 'sell_order', 'close_position'],
      'risk': ['stop_loss', 'take_profit'],
      'timing': ['time_filter'],
      'math': ['add', 'subtract', 'multiply', 'divide'],
      'input': [],
      'output': []
    };

    const compatibleSubtypes = compatibilityMap[nodeType] || [];
    return compatibleSubtypes.includes(componentSubtype) ? 1.0 : 0.5;
  }

  private calculateParameterCompatibility(
    componentParams: Record<string, unknown>,
    nodeType: NodeType
  ): number {
    // Simple parameter compatibility check
    const componentParamKeys = Object.keys(componentParams);
    if (componentParamKeys.length === 0) return 0.5;

    // Get expected parameters for node type
    const expectedParams = this.getExpectedParametersForNodeType(nodeType);
    const matchingParams = componentParamKeys.filter(key => expectedParams.includes(key));

    return matchingParams.length / Math.max(componentParamKeys.length, expectedParams.length);
  }

  private calculateParameterMappingConfidence(
    componentParams: Record<string, unknown>,
    nodeConfig: Record<string, unknown>
  ): number {
    const componentKeys = Object.keys(componentParams);
    const configKeys = Object.keys(nodeConfig);
    
    if (componentKeys.length === 0 && configKeys.length === 0) return 1.0;
    if (componentKeys.length === 0 || configKeys.length === 0) return 0.5;

    const matchingKeys = componentKeys.filter(key => configKeys.includes(key));
    return matchingKeys.length / Math.max(componentKeys.length, configKeys.length);
  }

  private hasNodeTemplate(nodeType: NodeType, subtype: string): boolean {
    // Check if there's a template available for this node type and subtype
    for (const [category, templates] of Object.entries(NODE_TEMPLATES)) {
      for (const template of templates) {
        if (template.type === nodeType) {
          return true;
        }
      }
    }
    return false;
  }

  private getExpectedParametersForNodeType(nodeType: NodeType): string[] {
    const parameterMap: Record<NodeType, string[]> = {
      'data-source': ['symbol', 'timeframe', 'source'],
      'indicator': ['indicatorId', 'parameters'],
      'condition': ['operator', 'threshold'],
      'action': ['orderType', 'quantity'],
      'risk': ['stopLoss', 'takeProfit', 'maxRisk'],
      'timing': ['startTime', 'endTime', 'timezone'],
      'math': ['operation', 'value'],
      'input': [],
      'output': []
    };

    return parameterMap[nodeType] || [];
  }

  private mapConditionOperator(subtype: string): 'greater_than' | 'less_than' | 'equal_to' | 'crosses_above' | 'crosses_below' {
    const mapping: Record<string, any> = {
      'greater_than': 'greater_than',
      'less_than': 'less_than',
      'equal_to': 'equal_to',
      'crosses_above': 'crosses_above',
      'crosses_below': 'crosses_below'
    };

    return mapping[subtype] || 'greater_than';
  }

  private mapActionOrderType(subtype: string): 'market' | 'limit' | 'stop' {
    const mapping: Record<string, any> = {
      'buy_order': 'market',
      'sell_order': 'market',
      'close_position': 'market'
    };

    return mapping[subtype] || 'market';
  }

  private mapMathOperation(subtype: string): 'add' | 'subtract' | 'multiply' | 'divide' | 'abs' | 'max' | 'min' {
    const mapping: Record<string, any> = {
      'add': 'add',
      'subtract': 'subtract',
      'multiply': 'multiply',
      'divide': 'divide',
      'abs': 'abs',
      'max': 'max',
      'min': 'min'
    };

    return mapping[subtype] || 'add';
  }

  private generateNodeDescription(component: StrategyComponent): string {
    const baseDescription = component.label;
    
    switch (component.type) {
      case ComponentType.INDICATOR:
        return `${baseDescription} technical indicator`;
      case ComponentType.CONDITION:
        return `${baseDescription} trading condition`;
      case ComponentType.ACTION:
        return `${baseDescription} trading action`;
      case ComponentType.RISK_MANAGEMENT:
        return `${baseDescription} risk management`;
      default:
        return baseDescription;
    }
  }

  private getNodeCategory(componentType: ComponentType): string {
    const categoryMap: Record<ComponentType, string> = {
      [ComponentType.DATA_SOURCE]: 'Data Sources',
      [ComponentType.INDICATOR]: 'Technical Indicators',
      [ComponentType.CONDITION]: 'Conditions',
      [ComponentType.ACTION]: 'Actions',
      [ComponentType.RISK_MANAGEMENT]: 'Risk Management',
      [ComponentType.TIMING]: 'Timing',
      [ComponentType.MATH]: 'Math & Logic',
      [ComponentType.LOGIC]: 'Math & Logic'
    };

    return categoryMap[componentType] || 'Unknown';
  }

  private getNodeIcon(componentType: ComponentType, subtype: string): string {
    // Return appropriate icon based on component type and subtype
    const iconMap: Record<ComponentType, string> = {
      [ComponentType.DATA_SOURCE]: '📊',
      [ComponentType.INDICATOR]: '📈',
      [ComponentType.CONDITION]: '🔍',
      [ComponentType.ACTION]: '⚡',
      [ComponentType.RISK_MANAGEMENT]: '🛡️',
      [ComponentType.TIMING]: '⏰',
      [ComponentType.MATH]: '🧮',
      [ComponentType.LOGIC]: '🔗'
    };

    return iconMap[componentType] || '❓';
  }

  private getNodeColor(componentType: ComponentType): string {
    const colorMap: Record<ComponentType, string> = {
      [ComponentType.DATA_SOURCE]: '#3b82f6',
      [ComponentType.INDICATOR]: '#10b981',
      [ComponentType.CONDITION]: '#f59e0b',
      [ComponentType.ACTION]: '#ef4444',
      [ComponentType.RISK_MANAGEMENT]: '#f97316',
      [ComponentType.TIMING]: '#14b8a6',
      [ComponentType.MATH]: '#8b5cf6',
      [ComponentType.LOGIC]: '#6366f1'
    };

    return colorMap[componentType] || '#6b7280';
  }

  private mapFlowTypeToConnectionType(flowType: any): 'data' | 'signal' | 'trigger' | 'control' {
    const mapping: Record<string, any> = {
      'data': 'data',
      'signal': 'signal',
      'trigger': 'trigger',
      'control': 'control'
    };

    return mapping[flowType] || 'data';
  }

  private initializeNodeTypeMappings(): void {
    this.componentToNodeTypeMap.set(ComponentType.DATA_SOURCE, ['data-source']);
    this.componentToNodeTypeMap.set(ComponentType.INDICATOR, ['indicator']);
    this.componentToNodeTypeMap.set(ComponentType.CONDITION, ['condition']);
    this.componentToNodeTypeMap.set(ComponentType.ACTION, ['action']);
    this.componentToNodeTypeMap.set(ComponentType.RISK_MANAGEMENT, ['risk']);
    this.componentToNodeTypeMap.set(ComponentType.TIMING, ['timing']);
    this.componentToNodeTypeMap.set(ComponentType.MATH, ['math']);
    this.componentToNodeTypeMap.set(ComponentType.LOGIC, ['condition', 'math']);
  }

  private initializeParameterMappings(): void {
    // Initialize parameter mapping rules
    // This would contain detailed rules for mapping component parameters to node configurations
  }
}

// Supporting interfaces

interface LevelGroup {
  level: number;
  mappings: ComponentNodeMapping[];
}

interface ParameterMappingRule {
  componentParameter: string;
  nodeParameter: string;
  transformation?: (value: unknown) => unknown;
  required: boolean;
}