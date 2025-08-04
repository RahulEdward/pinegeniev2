/**
 * Explanation Generation System for PineGenie AI
 * 
 * This module generates contextual explanations for each construction step,
 * providing educational content and reasoning for AI decisions during strategy building.
 * 
 * SAFE INTEGRATION: Uses existing knowledge systems without modification
 * PROTECTION: No changes to existing explanation or educational systems
 * 
 * Requirements: 3.2, 3.3, 3.4
 */

export interface ExplanationConfig {
  /** Content generation settings */
  content: {
    maxLength: number;
    minLength: number;
    complexityLevel: 'beginner' | 'intermediate' | 'advanced' | 'adaptive';
    includeReasons: boolean;
    includeTips: boolean;
    includeWarnings: boolean;
    includeExamples: boolean;
  };
  
  /** Language and tone settings */
  language: {
    tone: 'formal' | 'casual' | 'educational' | 'conversational';
    vocabulary: 'simple' | 'technical' | 'mixed' | 'adaptive';
    personalization: boolean;
    useAnalogies: boolean;
    useMetaphors: boolean;
  };
  
  /** Educational features */
  education: {
    showLearningObjectives: boolean;
    includeQuizQuestions: boolean;
    providePracticeExercises: boolean;
    trackProgress: boolean;
    adaptToDifficulty: boolean;
  };
  
  /** Multimedia support */
  multimedia: {
    enableDiagrams: boolean;
    enableAnimations: boolean;
    enableAudio: boolean;
    enableInteractivity: boolean;
  };
  
  /** Accessibility */
  accessibility: {
    screenReaderSupport: boolean;
    highContrastMode: boolean;
    largeTextMode: boolean;
    simplifiedLanguage: boolean;
  };
}

export interface ExplanationContext {
  /** Current step information */
  step: {
    id: string;
    type: 'node-placement' | 'connection-creation' | 'parameter-setting' | 'validation' | 'completion';
    title: string;
    description: string;
    complexity: 'simple' | 'moderate' | 'complex';
  };
  
  /** Strategy context */
  strategy: {
    name: string;
    type: string;
    components: string[];
    currentProgress: number;
    totalSteps: number;
  };
  
  /** User context */
  user: {
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    previousKnowledge: string[];
    currentFocus: string[];
  };
  
  /** Technical context */
  technical: {
    nodeType?: string;
    indicatorName?: string;
    parameters?: Record<string, unknown>;
    connections?: string[];
    dataFlow?: string;
  };
}

export interface GeneratedExplanation {
  id: string;
  title: string;
  content: ExplanationContent;
  metadata: ExplanationMetadata;
  interactive: InteractiveElements;
  accessibility: AccessibilityFeatures;
}

export interface ExplanationContent {
  /** Main explanation text */
  primary: string;
  
  /** Supporting information */
  secondary?: string;
  
  /** Technical details */
  technical?: string;
  
  /** Reasoning behind the action */
  reasoning: string;
  
  /** Helpful tips */
  tips: string[];
  
  /** Warnings or cautions */
  warnings: string[];
  
  /** Related concepts */
  relatedConcepts: string[];
  
  /** Examples */
  examples: Array<{
    title: string;
    description: string;
    code?: string;
  }>;
  
  /** Learning objectives */
  learningObjectives?: string[];
}

export interface ExplanationMetadata {
  generatedAt: Date;
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedReadTime: number;
  targetAudience: string[];
  prerequisites: string[];
  tags: string[];
  confidence: number;
}

export interface InteractiveElements {
  /** Quiz questions */
  quizzes?: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;
  
  /** Interactive demonstrations */
  demonstrations?: Array<{
    title: string;
    description: string;
    action: string;
    expectedResult: string;
  }>;
  
  /** Practice exercises */
  exercises?: Array<{
    title: string;
    instructions: string;
    hints: string[];
    solution: string;
  }>;
  
  /** Clickable elements */
  clickableElements?: Array<{
    selector: string;
    tooltip: string;
    action: string;
  }>;
}

export interface AccessibilityFeatures {
  screenReaderText: string;
  altText: Record<string, string>;
  keyboardShortcuts: Record<string, string>;
  highContrastVersion?: string;
  simplifiedVersion?: string;
}

export interface ExplanationTemplate {
  id: string;
  name: string;
  category: string;
  applicableSteps: string[];
  template: string;
  variables: string[];
  examples: string[];
}

/**
 * Default explanation configuration
 */
export const DEFAULT_EXPLANATION_CONFIG: ExplanationConfig = {
  content: {
    maxLength: 500,
    minLength: 50,
    complexityLevel: 'adaptive',
    includeReasons: true,
    includeTips: true,
    includeWarnings: true,
    includeExamples: true
  },
  language: {
    tone: 'educational',
    vocabulary: 'mixed',
    personalization: true,
    useAnalogies: true,
    useMetaphors: false
  },
  education: {
    showLearningObjectives: true,
    includeQuizQuestions: false,
    providePracticeExercises: false,
    trackProgress: true,
    adaptToDifficulty: true
  },
  multimedia: {
    enableDiagrams: true,
    enableAnimations: true,
    enableAudio: false,
    enableInteractivity: true
  },
  accessibility: {
    screenReaderSupport: true,
    highContrastMode: false,
    largeTextMode: false,
    simplifiedLanguage: false
  }
};

/**
 * Explanation Generator Class
 * 
 * Generates contextual explanations for educational animations
 */
export class ExplanationGenerator {
  private config: ExplanationConfig;
  private templates: Map<string, ExplanationTemplate> = new Map();
  private knowledgeBase: Map<string, any> = new Map();
  private userProfile: any = null;
  private explanationHistory: GeneratedExplanation[] = [];

  constructor(config: ExplanationConfig = DEFAULT_EXPLANATION_CONFIG) {
    this.config = { ...config };
    this.initializeTemplates();
    this.initializeKnowledgeBase();
  }

  /**
   * Generate explanation for a specific step
   */
  generateExplanation(context: ExplanationContext): GeneratedExplanation {
    const explanationId = `explanation_${context.step.id}_${Date.now()}`;
    
    // Select appropriate template
    const template = this.selectTemplate(context);
    
    // Generate content
    const content = this.generateContent(context, template);
    
    // Generate metadata
    const metadata = this.generateMetadata(context, content);
    
    // Generate interactive elements
    const interactive = this.generateInteractiveElements(context);
    
    // Generate accessibility features
    const accessibility = this.generateAccessibilityFeatures(content);
    
    const explanation: GeneratedExplanation = {
      id: explanationId,
      title: this.generateTitle(context),
      content,
      metadata,
      interactive,
      accessibility
    };
    
    // Store in history
    this.explanationHistory.push(explanation);
    
    return explanation;
  }

  /**
   * Generate explanation for node placement
   */
  generateNodePlacementExplanation(
    nodeType: string,
    nodeName: string,
    reasoning: string,
    position: { x: number; y: number },
    context: Partial<ExplanationContext> = {}
  ): GeneratedExplanation {
    const fullContext: ExplanationContext = {
      step: {
        id: `node_${nodeType}_${Date.now()}`,
        type: 'node-placement',
        title: `Adding ${nodeName}`,
        description: `Placing ${nodeType} node on the canvas`,
        complexity: this.assessComplexity(nodeType)
      },
      strategy: context.strategy || {
        name: 'Trading Strategy',
        type: 'custom',
        components: [nodeType],
        currentProgress: 0.5,
        totalSteps: 10
      },
      user: context.user || {
        experienceLevel: 'intermediate',
        preferredLearningStyle: 'visual',
        previousKnowledge: [],
        currentFocus: [nodeType]
      },
      technical: {
        nodeType,
        indicatorName: nodeName,
        ...context.technical
      }
    };

    return this.generateExplanation(fullContext);
  }

  /**
   * Generate explanation for connection creation
   */
  generateConnectionExplanation(
    sourceNode: string,
    targetNode: string,
    dataFlow: string,
    reasoning: string,
    context: Partial<ExplanationContext> = {}
  ): GeneratedExplanation {
    const fullContext: ExplanationContext = {
      step: {
        id: `connection_${sourceNode}_${targetNode}_${Date.now()}`,
        type: 'connection-creation',
        title: `Connecting ${sourceNode} to ${targetNode}`,
        description: `Creating data flow connection`,
        complexity: 'moderate'
      },
      strategy: context.strategy || {
        name: 'Trading Strategy',
        type: 'custom',
        components: [sourceNode, targetNode],
        currentProgress: 0.7,
        totalSteps: 10
      },
      user: context.user || {
        experienceLevel: 'intermediate',
        preferredLearningStyle: 'visual',
        previousKnowledge: [],
        currentFocus: ['connections', 'data-flow']
      },
      technical: {
        connections: [sourceNode, targetNode],
        dataFlow,
        ...context.technical
      }
    };

    return this.generateExplanation(fullContext);
  }

  /**
   * Generate explanation for parameter setting
   */
  generateParameterExplanation(
    nodeType: string,
    parameterName: string,
    value: unknown,
    reasoning: string,
    context: Partial<ExplanationContext> = {}
  ): GeneratedExplanation {
    const fullContext: ExplanationContext = {
      step: {
        id: `parameter_${nodeType}_${parameterName}_${Date.now()}`,
        type: 'parameter-setting',
        title: `Setting ${parameterName}`,
        description: `Configuring ${parameterName} parameter for ${nodeType}`,
        complexity: this.assessParameterComplexity(parameterName)
      },
      strategy: context.strategy || {
        name: 'Trading Strategy',
        type: 'custom',
        components: [nodeType],
        currentProgress: 0.8,
        totalSteps: 10
      },
      user: context.user || {
        experienceLevel: 'intermediate',
        preferredLearningStyle: 'visual',
        previousKnowledge: [],
        currentFocus: ['parameters', 'optimization']
      },
      technical: {
        nodeType,
        parameters: { [parameterName]: value },
        ...context.technical
      }
    };

    return this.generateExplanation(fullContext);
  }

  /**
   * Generate batch explanations for multiple steps
   */
  generateBatchExplanations(contexts: ExplanationContext[]): GeneratedExplanation[] {
    return contexts.map(context => this.generateExplanation(context));
  }

  /**
   * Generate contextual tips
   */
  generateTips(context: ExplanationContext): string[] {
    const tips: string[] = [];
    const { step, technical, user } = context;

    switch (step.type) {
      case 'node-placement':
        tips.push(...this.generateNodeTips(technical.nodeType || ''));
        break;
      case 'connection-creation':
        tips.push(...this.generateConnectionTips(technical.dataFlow || ''));
        break;
      case 'parameter-setting':
        tips.push(...this.generateParameterTips(technical.parameters || {}));
        break;
    }

    // Add experience-level specific tips
    if (user.experienceLevel === 'beginner') {
      tips.push(...this.getBeginnerTips(step.type));
    }

    return tips.slice(0, 3); // Limit to 3 tips
  }

  /**
   * Generate warnings and cautions
   */
  generateWarnings(context: ExplanationContext): string[] {
    const warnings: string[] = [];
    const { step, technical } = context;

    switch (step.type) {
      case 'node-placement':
        warnings.push(...this.getNodeWarnings(technical.nodeType || ''));
        break;
      case 'connection-creation':
        warnings.push(...this.getConnectionWarnings(technical.connections || []));
        break;
      case 'parameter-setting':
        warnings.push(...this.getParameterWarnings(technical.parameters || {}));
        break;
    }

    return warnings;
  }

  /**
   * Generate related concepts
   */
  generateRelatedConcepts(context: ExplanationContext): string[] {
    const concepts: string[] = [];
    const { step, technical } = context;

    const conceptMap: Record<string, string[]> = {
      'rsi': ['momentum', 'oscillators', 'overbought-oversold', 'divergence'],
      'sma': ['trend-following', 'moving-averages', 'smoothing', 'crossovers'],
      'macd': ['momentum', 'convergence-divergence', 'signal-line', 'histogram'],
      'bollinger-bands': ['volatility', 'standard-deviation', 'mean-reversion', 'squeeze'],
      'condition': ['logic-gates', 'boolean-operations', 'signal-generation', 'thresholds'],
      'action': ['trade-execution', 'order-types', 'position-sizing', 'risk-management']
    };

    if (technical.nodeType && conceptMap[technical.nodeType]) {
      concepts.push(...conceptMap[technical.nodeType]);
    }

    // Add step-type specific concepts
    switch (step.type) {
      case 'connection-creation':
        concepts.push('data-flow', 'signal-processing', 'pipeline-architecture');
        break;
      case 'parameter-setting':
        concepts.push('optimization', 'backtesting', 'sensitivity-analysis');
        break;
    }

    return [...new Set(concepts)]; // Remove duplicates
  }

  /**
   * Generate examples
   */
  generateExamples(context: ExplanationContext): Array<{ title: string; description: string; code?: string }> {
    const examples: Array<{ title: string; description: string; code?: string }> = [];
    const { technical } = context;

    if (technical.nodeType) {
      const nodeExamples = this.getNodeExamples(technical.nodeType);
      examples.push(...nodeExamples);
    }

    return examples.slice(0, 2); // Limit to 2 examples
  }

  /**
   * Select appropriate template
   */
  private selectTemplate(context: ExplanationContext): ExplanationTemplate {
    const { step } = context;
    
    // Find templates applicable to this step type
    const applicableTemplates = Array.from(this.templates.values())
      .filter(template => template.applicableSteps.includes(step.type));
    
    if (applicableTemplates.length === 0) {
      return this.getDefaultTemplate(step.type);
    }
    
    // Select best template based on context
    return applicableTemplates[0]; // For now, just return the first one
  }

  /**
   * Generate content using template
   */
  private generateContent(context: ExplanationContext, template: ExplanationTemplate): ExplanationContent {
    const { step, technical, user } = context;
    
    // Generate primary explanation
    const primary = this.generatePrimaryExplanation(context, template);
    
    // Generate reasoning
    const reasoning = this.generateReasoning(context);
    
    // Generate tips, warnings, and related concepts
    const tips = this.generateTips(context);
    const warnings = this.generateWarnings(context);
    const relatedConcepts = this.generateRelatedConcepts(context);
    const examples = this.generateExamples(context);
    
    // Generate learning objectives if enabled
    const learningObjectives = this.config.education.showLearningObjectives
      ? this.generateLearningObjectives(context)
      : undefined;

    return {
      primary,
      reasoning,
      tips,
      warnings,
      relatedConcepts,
      examples,
      learningObjectives
    };
  }

  /**
   * Generate primary explanation text
   */
  private generatePrimaryExplanation(context: ExplanationContext, template: ExplanationTemplate): string {
    const { step, technical, strategy } = context;
    
    let explanation = '';
    
    switch (step.type) {
      case 'node-placement':
        explanation = this.generateNodePlacementText(technical.nodeType || '', technical.indicatorName || '');
        break;
      case 'connection-creation':
        explanation = this.generateConnectionText(technical.connections || [], technical.dataFlow || '');
        break;
      case 'parameter-setting':
        explanation = this.generateParameterText(technical.nodeType || '', technical.parameters || {});
        break;
      default:
        explanation = step.description;
    }
    
    // Add strategy context
    if (strategy.currentProgress > 0) {
      const progressPercent = Math.round(strategy.currentProgress * 100);
      explanation += ` This is step ${Math.round(strategy.currentProgress * strategy.totalSteps)} of ${strategy.totalSteps} in building your ${strategy.name} (${progressPercent}% complete).`;
    }
    
    return explanation;
  }

  /**
   * Generate reasoning explanation
   */
  private generateReasoning(context: ExplanationContext): string {
    const { step, technical } = context;
    
    const reasoningMap: Record<string, string> = {
      'rsi': 'RSI helps identify overbought and oversold conditions, making it essential for mean-reversion strategies.',
      'sma': 'Simple Moving Average smooths price data to reveal the underlying trend direction.',
      'macd': 'MACD shows the relationship between two moving averages, helping identify momentum changes.',
      'bollinger-bands': 'Bollinger Bands adapt to market volatility, providing dynamic support and resistance levels.',
      'condition': 'Conditions evaluate indicator values to generate precise trading signals.',
      'action': 'Actions execute trades when conditions are met, implementing your strategy logic.'
    };
    
    return reasoningMap[technical.nodeType || ''] || 'This component contributes to the overall strategy logic.';
  }

  /**
   * Generate metadata
   */
  private generateMetadata(context: ExplanationContext, content: ExplanationContent): ExplanationMetadata {
    const wordCount = content.primary.split(' ').length;
    const estimatedReadTime = Math.ceil(wordCount / 200); // 200 words per minute
    
    return {
      generatedAt: new Date(),
      complexity: context.step.complexity,
      estimatedReadTime,
      targetAudience: [context.user.experienceLevel],
      prerequisites: this.getPrerequisites(context),
      tags: this.generateTags(context),
      confidence: this.calculateConfidence(context)
    };
  }

  /**
   * Generate interactive elements
   */
  private generateInteractiveElements(context: ExplanationContext): InteractiveElements {
    const interactive: InteractiveElements = {};
    
    if (this.config.education.includeQuizQuestions) {
      interactive.quizzes = this.generateQuizQuestions(context);
    }
    
    if (this.config.education.providePracticeExercises) {
      interactive.exercises = this.generatePracticeExercises(context);
    }
    
    if (this.config.multimedia.enableInteractivity) {
      interactive.demonstrations = this.generateDemonstrations(context);
      interactive.clickableElements = this.generateClickableElements(context);
    }
    
    return interactive;
  }

  /**
   * Generate accessibility features
   */
  private generateAccessibilityFeatures(content: ExplanationContent): AccessibilityFeatures {
    return {
      screenReaderText: this.generateScreenReaderText(content),
      altText: this.generateAltText(content),
      keyboardShortcuts: this.generateKeyboardShortcuts(),
      highContrastVersion: this.config.accessibility.highContrastMode ? this.generateHighContrastVersion(content) : undefined,
      simplifiedVersion: this.config.accessibility.simplifiedLanguage ? this.generateSimplifiedVersion(content) : undefined
    };
  }

  /**
   * Initialize explanation templates
   */
  private initializeTemplates(): void {
    const templates: ExplanationTemplate[] = [
      {
        id: 'node-placement',
        name: 'Node Placement Template',
        category: 'construction',
        applicableSteps: ['node-placement'],
        template: 'Adding {nodeType} to analyze {dataType} and generate {signalType} signals.',
        variables: ['nodeType', 'dataType', 'signalType'],
        examples: ['Adding RSI to analyze momentum and generate overbought/oversold signals.']
      },
      {
        id: 'connection-creation',
        name: 'Connection Creation Template',
        category: 'construction',
        applicableSteps: ['connection-creation'],
        template: 'Connecting {sourceNode} to {targetNode} to pass {dataType} data.',
        variables: ['sourceNode', 'targetNode', 'dataType'],
        examples: ['Connecting RSI to Condition to pass momentum data.']
      },
      {
        id: 'parameter-setting',
        name: 'Parameter Setting Template',
        category: 'configuration',
        applicableSteps: ['parameter-setting'],
        template: 'Setting {parameterName} to {value} for optimal {purpose}.',
        variables: ['parameterName', 'value', 'purpose'],
        examples: ['Setting RSI period to 14 for optimal momentum detection.']
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * Initialize knowledge base
   */
  private initializeKnowledgeBase(): void {
    // This would be populated with trading knowledge
    // For now, we'll add some basic entries
    this.knowledgeBase.set('rsi', {
      name: 'Relative Strength Index',
      category: 'momentum',
      description: 'Measures the speed and change of price movements',
      parameters: ['period', 'overbought', 'oversold'],
      useCases: ['mean-reversion', 'divergence-analysis']
    });
    
    this.knowledgeBase.set('sma', {
      name: 'Simple Moving Average',
      category: 'trend',
      description: 'Average price over a specific number of periods',
      parameters: ['period', 'source'],
      useCases: ['trend-identification', 'support-resistance']
    });
  }

  /**
   * Helper methods for generating specific content types
   */
  private generateTitle(context: ExplanationContext): string {
    const { step } = context;
    return step.title || `Step: ${step.type}`;
  }

  private generateNodePlacementText(nodeType: string, nodeName: string): string {
    const descriptions: Record<string, string> = {
      'rsi': `Adding RSI (Relative Strength Index) to measure momentum. RSI oscillates between 0 and 100, helping identify when an asset might be overbought (above 70) or oversold (below 30).`,
      'sma': `Adding Simple Moving Average to smooth price data and identify trend direction. The SMA calculates the average price over a specified period, filtering out short-term noise.`,
      'macd': `Adding MACD (Moving Average Convergence Divergence) to detect trend changes. MACD shows the relationship between two moving averages and helps identify momentum shifts.`,
      'bollinger-bands': `Adding Bollinger Bands to measure volatility and identify potential reversal points. The bands expand and contract based on market volatility.`,
      'condition': `Adding a condition node to evaluate indicator values and generate trading signals. Conditions act as decision points in your strategy.`,
      'action': `Adding an action node to execute trades when conditions are met. Actions implement the actual buy/sell logic of your strategy.`
    };

    return descriptions[nodeType] || `Adding ${nodeName} to the strategy.`;
  }

  private generateConnectionText(connections: string[], dataFlow: string): string {
    if (connections.length >= 2) {
      return `Connecting ${connections[0]} to ${connections[1]} to establish data flow. This connection passes ${dataFlow} data, allowing the target node to process information from the source node.`;
    }
    return 'Creating a connection to establish data flow between components.';
  }

  private generateParameterText(nodeType: string, parameters: Record<string, unknown>): string {
    const parameterName = Object.keys(parameters)[0];
    const value = parameters[parameterName];
    
    const descriptions: Record<string, Record<string, string>> = {
      'rsi': {
        'period': `Setting RSI period to ${value}. This determines how many price periods are used to calculate the RSI value. A period of 14 is standard and provides a good balance between sensitivity and reliability.`,
        'overbought': `Setting overbought threshold to ${value}. Values above this level suggest the asset may be overbought and due for a pullback.`,
        'oversold': `Setting oversold threshold to ${value}. Values below this level suggest the asset may be oversold and due for a bounce.`
      },
      'sma': {
        'period': `Setting SMA period to ${value}. This determines how many price periods are averaged. Longer periods create smoother but slower-responding averages.`,
        'source': `Setting price source to ${value}. This determines which price data (open, high, low, close) is used for the calculation.`
      }
    };

    return descriptions[nodeType]?.[parameterName] || `Setting ${parameterName} to ${value}.`;
  }

  private generateNodeTips(nodeType: string): string[] {
    const tips: Record<string, string[]> = {
      'rsi': [
        'RSI values above 70 typically indicate overbought conditions',
        'Look for divergences between price and RSI for stronger signals',
        'Consider using different periods for different timeframes'
      ],
      'sma': [
        'Longer periods create smoother but slower signals',
        'Price above SMA suggests uptrend, below suggests downtrend',
        'SMA crossovers can generate entry and exit signals'
      ],
      'macd': [
        'MACD line crossing above signal line suggests bullish momentum',
        'Histogram shows the strength of the momentum',
        'Zero line crossovers indicate trend changes'
      ]
    };

    return tips[nodeType] || ['This component contributes to the strategy logic'];
  }

  private generateConnectionTips(dataFlow: string): string[] {
    return [
      'Data flows from source to target node',
      'Each connection represents a specific data type',
      'Proper connections ensure accurate signal processing'
    ];
  }

  private generateParameterTips(parameters: Record<string, unknown>): string[] {
    return [
      'Parameters can be optimized for different market conditions',
      'Test different values to find optimal settings',
      'Consider the trade-off between sensitivity and reliability'
    ];
  }

  private getBeginnerTips(stepType: string): string[] {
    const tips: Record<string, string[]> = {
      'node-placement': ['Take your time to understand each component', 'Don\'t worry about perfect placement initially'],
      'connection-creation': ['Think about how data flows logically', 'Each connection has a specific purpose'],
      'parameter-setting': ['Start with default values', 'Make small adjustments and test the results']
    };

    return tips[stepType] || [];
  }

  private getNodeWarnings(nodeType: string): string[] {
    const warnings: Record<string, string[]> = {
      'rsi': ['RSI can give false signals in trending markets', 'Avoid using RSI alone for trading decisions'],
      'sma': ['SMAs lag behind price action', 'May generate late signals in fast-moving markets'],
      'macd': ['MACD can be choppy in sideways markets', 'Consider using additional confirmation']
    };

    return warnings[nodeType] || [];
  }

  private getConnectionWarnings(connections: string[]): string[] {
    return ['Ensure data types are compatible', 'Avoid creating circular dependencies'];
  }

  private getParameterWarnings(parameters: Record<string, unknown>): string[] {
    return ['Extreme parameter values may cause unreliable signals', 'Always backtest parameter changes'];
  }

  private getNodeExamples(nodeType: string): Array<{ title: string; description: string; code?: string }> {
    const examples: Record<string, Array<{ title: string; description: string; code?: string }>> = {
      'rsi': [
        {
          title: 'Basic RSI Setup',
          description: 'Standard RSI with 14-period calculation',
          code: 'rsi_value = ta.rsi(close, 14)'
        },
        {
          title: 'RSI Overbought/Oversold',
          description: 'Using RSI levels for mean reversion signals',
          code: 'overbought = rsi_value > 70\noversold = rsi_value < 30'
        }
      ]
    };

    return examples[nodeType] || [];
  }

  private generateLearningObjectives(context: ExplanationContext): string[] {
    const { step, technical } = context;
    
    const objectives: string[] = [];
    
    switch (step.type) {
      case 'node-placement':
        objectives.push(`Understand the purpose of ${technical.nodeType} in trading strategies`);
        objectives.push(`Learn how ${technical.nodeType} processes market data`);
        break;
      case 'connection-creation':
        objectives.push('Understand data flow between strategy components');
        objectives.push('Learn how connections enable signal processing');
        break;
      case 'parameter-setting':
        objectives.push('Understand the impact of parameter values');
        objectives.push('Learn optimization techniques for parameters');
        break;
    }
    
    return objectives;
  }

  private getDefaultTemplate(stepType: string): ExplanationTemplate {
    return {
      id: 'default',
      name: 'Default Template',
      category: 'general',
      applicableSteps: [stepType],
      template: 'Performing {stepType} operation.',
      variables: ['stepType'],
      examples: []
    };
  }

  private assessComplexity(nodeType: string): 'simple' | 'moderate' | 'complex' {
    const complexityMap: Record<string, 'simple' | 'moderate' | 'complex'> = {
      'sma': 'simple',
      'rsi': 'simple',
      'macd': 'moderate',
      'bollinger-bands': 'moderate',
      'condition': 'moderate',
      'action': 'complex'
    };

    return complexityMap[nodeType] || 'moderate';
  }

  private assessParameterComplexity(parameterName: string): 'simple' | 'moderate' | 'complex' {
    const simpleParams = ['period', 'length', 'source'];
    const complexParams = ['multiplier', 'deviation', 'smoothing'];

    if (simpleParams.includes(parameterName)) return 'simple';
    if (complexParams.includes(parameterName)) return 'complex';
    return 'moderate';
  }

  private getPrerequisites(context: ExplanationContext): string[] {
    const { technical } = context;
    
    const prerequisites: Record<string, string[]> = {
      'rsi': ['basic-technical-analysis', 'momentum-concepts'],
      'sma': ['price-action-basics', 'trend-concepts'],
      'macd': ['moving-averages', 'momentum-analysis'],
      'condition': ['boolean-logic', 'signal-generation'],
      'action': ['order-types', 'risk-management']
    };

    return prerequisites[technical.nodeType || ''] || [];
  }

  private generateTags(context: ExplanationContext): string[] {
    const tags: string[] = [];
    const { step, technical } = context;

    tags.push(step.type);
    if (technical.nodeType) tags.push(technical.nodeType);
    tags.push(context.user.experienceLevel);
    tags.push(step.complexity);

    return tags;
  }

  private calculateConfidence(context: ExplanationContext): number {
    // Simple confidence calculation based on available context
    let confidence = 0.5;

    if (context.technical.nodeType) confidence += 0.2;
    if (context.strategy.name) confidence += 0.1;
    if (context.user.experienceLevel) confidence += 0.1;
    if (context.step.description) confidence += 0.1;

    return Math.min(1.0, confidence);
  }

  // Additional helper methods for interactive elements
  private generateQuizQuestions(context: ExplanationContext): Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }> {
    // Implementation would generate quiz questions based on context
    return [];
  }

  private generatePracticeExercises(context: ExplanationContext): Array<{
    title: string;
    instructions: string;
    hints: string[];
    solution: string;
  }> {
    // Implementation would generate practice exercises
    return [];
  }

  private generateDemonstrations(context: ExplanationContext): Array<{
    title: string;
    description: string;
    action: string;
    expectedResult: string;
  }> {
    // Implementation would generate interactive demonstrations
    return [];
  }

  private generateClickableElements(context: ExplanationContext): Array<{
    selector: string;
    tooltip: string;
    action: string;
  }> {
    // Implementation would generate clickable elements
    return [];
  }

  private generateScreenReaderText(content: ExplanationContent): string {
    return `${content.primary} ${content.reasoning}`;
  }

  private generateAltText(content: ExplanationContent): Record<string, string> {
    return {
      'main-diagram': content.primary,
      'example-chart': content.examples[0]?.description || 'Example chart'
    };
  }

  private generateKeyboardShortcuts(): Record<string, string> {
    return {
      'next': 'Press N for next explanation',
      'previous': 'Press P for previous explanation',
      'replay': 'Press R to replay animation'
    };
  }

  private generateHighContrastVersion(content: ExplanationContent): string {
    // Generate high contrast version of the explanation
    return content.primary;
  }

  private generateSimplifiedVersion(content: ExplanationContent): string {
    // Generate simplified language version
    return content.primary.replace(/\b\w{10,}\b/g, match => {
      // Replace long words with simpler alternatives
      const simplifications: Record<string, string> = {
        'convergence': 'coming together',
        'divergence': 'moving apart',
        'oscillator': 'indicator',
        'overbought': 'too high',
        'oversold': 'too low'
      };
      return simplifications[match.toLowerCase()] || match;
    });
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ExplanationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): ExplanationConfig {
    return { ...this.config };
  }

  /**
   * Get explanation history
   */
  getHistory(): GeneratedExplanation[] {
    return [...this.explanationHistory];
  }

  /**
   * Clear explanation history
   */
  clearHistory(): void {
    this.explanationHistory = [];
  }

  /**
   * Set user profile for personalization
   */
  setUserProfile(profile: any): void {
    this.userProfile = profile;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.explanationHistory = [];
    this.userProfile = null;
  }
}

/**
 * Create explanation generator instance
 */
export function createExplanationGenerator(config?: Partial<ExplanationConfig>): ExplanationGenerator {
  const fullConfig = config ? { ...DEFAULT_EXPLANATION_CONFIG, ...config } : DEFAULT_EXPLANATION_CONFIG;
  return new ExplanationGenerator(fullConfig);
}

/**
 * Explanation utilities
 */
export const ExplanationUtils = {
  /**
   * Estimate reading time
   */
  estimateReadingTime(text: string, wordsPerMinute: number = 200): number {
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  },

  /**
   * Simplify technical language
   */
  simplifyLanguage(text: string): string {
    const simplifications: Record<string, string> = {
      'algorithm': 'method',
      'parameter': 'setting',
      'optimization': 'improvement',
      'configuration': 'setup',
      'implementation': 'creation',
      'initialization': 'setup',
      'instantiation': 'creation'
    };

    let simplified = text;
    Object.entries(simplifications).forEach(([complex, simple]) => {
      const regex = new RegExp(`\\b${complex}\\b`, 'gi');
      simplified = simplified.replace(regex, simple);
    });

    return simplified;
  },

  /**
   * Extract key concepts from text
   */
  extractKeyConcepts(text: string): string[] {
    const concepts: string[] = [];
    const conceptPatterns = [
      /\b(RSI|MACD|SMA|EMA|Bollinger Bands)\b/gi,
      /\b(momentum|trend|volatility|signal)\b/gi,
      /\b(overbought|oversold|crossover|divergence)\b/gi
    ];

    conceptPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        concepts.push(...matches.map(m => m.toLowerCase()));
      }
    });

    return [...new Set(concepts)];
  },

  /**
   * Format explanation for accessibility
   */
  formatForAccessibility(explanation: GeneratedExplanation): string {
    const { content, accessibility } = explanation;
    
    let formatted = `Title: ${explanation.title}\n\n`;
    formatted += `Main explanation: ${content.primary}\n\n`;
    
    if (content.reasoning) {
      formatted += `Reasoning: ${content.reasoning}\n\n`;
    }
    
    if (content.tips.length > 0) {
      formatted += `Tips: ${content.tips.join('. ')}\n\n`;
    }
    
    if (accessibility.keyboardShortcuts) {
      formatted += `Keyboard shortcuts: ${Object.values(accessibility.keyboardShortcuts).join('. ')}\n`;
    }
    
    return formatted;
  }
};