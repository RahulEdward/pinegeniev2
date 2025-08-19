/**
 * Test utilities for PineGenie AI testing suite
 * Provides common test helpers, mocks, and fixtures
 */

import type { 
  ParsedRequest, 
  TradingIntent, 
  StrategyBlueprint, 
  BuildResult,
  AIBuilderNode,
  AIBuilderEdge
} from '../../types';
import { StrategyType, TokenType, EntityType } from '../../types';

// Mock data generators
export const createMockParsedRequest = (overrides: Partial<ParsedRequest> = {}): ParsedRequest => ({
  originalText: "Create a RSI strategy with buy when RSI below 30",
  tokens: [
    { text: "Create", type: TokenType.ACTION, position: 0, confidence: 0.9 },
    { text: "RSI", type: TokenType.INDICATOR, position: 7, confidence: 0.95 },
    { text: "strategy", type: TokenType.UNKNOWN, position: 11, confidence: 0.8 },
    { text: "buy", type: TokenType.ACTION, position: 20, confidence: 0.9 },
    { text: "RSI", type: TokenType.INDICATOR, position: 29, confidence: 0.95 },
    { text: "below", type: TokenType.CONDITION, position: 33, confidence: 0.85 },
    { text: "30", type: TokenType.NUMBER, position: 39, confidence: 0.9 }
  ],
  entities: [
    { text: "RSI", type: EntityType.INDICATOR_NAME, value: "rsi", confidence: 0.95, startIndex: 7, endIndex: 10 },
    { text: "30", type: EntityType.THRESHOLD, value: 30, confidence: 0.9, startIndex: 39, endIndex: 41 },
    { text: "buy", type: EntityType.INDICATOR_NAME, value: "long_entry", confidence: 0.9, startIndex: 20, endIndex: 23 }
  ],
  confidence: 0.85,
  ...overrides
});

export const createMockTradingIntent = (overrides: Partial<TradingIntent> = {}): TradingIntent => ({
  strategyType: StrategyType.MEAN_REVERSION,
  indicators: ['rsi'],
  conditions: ['less_than'],
  actions: ['buy'],
  riskManagement: ['stop_loss'],
  timeframe: '1h',
  confidence: 0.85,
  ...overrides
});

export const createMockStrategyBlueprint = (overrides: Partial<StrategyBlueprint> = {}): StrategyBlueprint => ({
  id: 'test-blueprint-1',
  name: 'RSI Mean Reversion Strategy',
  description: 'Buy when RSI is oversold, sell when overbought',
  components: [
    {
      id: 'data-source-1',
      type: 'data-source' as any,
      subtype: 'market_data',
      label: 'Market Data',
      parameters: { symbol: 'BTCUSDT', timeframe: '1h' },
      priority: 1,
      dependencies: [],
      optional: false
    },
    {
      id: 'rsi-1',
      type: 'indicator' as any,
      subtype: 'rsi',
      label: 'RSI Indicator',
      parameters: { period: 14, source: 'close' },
      priority: 2,
      dependencies: ['data-source-1'],
      optional: false
    },
    {
      id: 'condition-1',
      type: 'condition' as any,
      subtype: 'less_than',
      label: 'RSI < 30',
      parameters: { threshold: 30 },
      priority: 3,
      dependencies: ['rsi-1'],
      optional: false
    },
    {
      id: 'buy-1',
      type: 'action' as any,
      subtype: 'buy',
      label: 'Buy Order',
      parameters: { quantity: 1, order_type: 'market' },
      priority: 4,
      dependencies: ['condition-1'],
      optional: false
    }
  ],
  flow: [
    { from: 'data-source-1', to: 'rsi-1', type: 'data' as any },
    { from: 'rsi-1', to: 'condition-1', type: 'signal' as any },
    { from: 'condition-1', to: 'buy-1', type: 'trigger' as any }
  ],
  parameters: {
    'rsi-1': {
      period: { value: 14, type: 'int', range: [2, 50], description: 'RSI Period', optimizable: true },
      source: { value: 'close', type: 'source', description: 'Price Source', optimizable: false }
    },
    'condition-1': {
      threshold: { value: 30, type: 'float', range: [10, 40], description: 'Oversold Threshold', optimizable: true }
    }
  },
  riskProfile: {
    level: 'medium',
    maxRisk: 0.02,
    stopLoss: 0.05,
    takeProfit: 0.10,
    maxDrawdown: 0.15
  },
  ...overrides
});

export const createMockNodeConfiguration = (overrides: Partial<AIBuilderNode> = {}): AIBuilderNode => ({
  id: 'test-node-1',
  type: 'indicator',
  position: { x: 100, y: 100 },
  data: {
    id: 'test-node-1',
    type: 'indicator',
    label: 'RSI Indicator',
    description: 'RSI indicator for momentum analysis',
    parameters: { period: 14, source: 'close' },
    aiGenerated: true,
    confidence: 0.9,
    explanation: 'RSI indicator for momentum analysis',
    suggestedParameters: { period: 14 },
    optimizationHints: ['Consider adjusting period for different timeframes']
  },
  aiGenerated: true,
  confidence: 0.9,
  ...overrides
});

export const createMockConnectionConfiguration = (overrides: Partial<AIBuilderEdge> = {}): AIBuilderEdge => ({
  id: 'test-connection-1',
  source: 'data-source-1',
  target: 'indicator-1',
  sourceHandle: 'close',
  targetHandle: 'input',
  type: 'data',
  aiGenerated: true,
  confidence: 0.95,
  ...overrides
});

export const createMockBuildResult = (overrides: Partial<BuildResult> = {}): BuildResult => ({
  success: true,
  nodes: [
    {
      id: 'data-1',
      type: 'data-source',
      position: { x: 50, y: 100 },
      data: {
        id: 'data-1',
        type: 'data-source',
        label: 'Market Data',
        parameters: { symbol: 'BTCUSDT', timeframe: '1h' },
        aiGenerated: true,
        confidence: 0.95,
        explanation: 'Market data source for BTCUSDT',
        suggestedParameters: {},
        optimizationHints: []
      },
      aiGenerated: true,
      confidence: 0.95
    },
    {
      id: 'rsi-1',
      type: 'indicator',
      position: { x: 200, y: 100 },
      data: {
        id: 'rsi-1',
        type: 'indicator',
        label: 'RSI Indicator',
        parameters: { period: 14, source: 'close' },
        aiGenerated: true,
        confidence: 0.9,
        explanation: 'RSI indicator for momentum analysis',
        suggestedParameters: { period: 14 },
        optimizationHints: ['Consider adjusting period']
      },
      aiGenerated: true,
      confidence: 0.9
    }
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'data-1',
      target: 'rsi-1',
      sourceHandle: 'close',
      targetHandle: 'input',
      aiGenerated: true,
      confidence: 0.95
    }
  ],
  animations: [
    {
      stepNumber: 1,
      type: 'node-placement' as any,
      nodeId: 'data-1',
      duration: 500,
      delay: 0,
      explanation: 'Placing market data source',
      highlight: true
    }
  ],
  explanations: [
    {
      stepNumber: 1,
      title: 'Data Source Setup',
      description: 'Setting up market data for BTCUSDT',
      reasoning: 'Need price data for RSI calculation',
      relatedComponents: ['data-1']
    }
  ],
  errors: [],
  warnings: [],
  ...overrides
});

// Test assertion helpers
export const expectValidParsedRequest = (request: ParsedRequest) => {
  expect(request.originalText).toBeDefined();
  expect(request.tokens).toBeInstanceOf(Array);
  expect(request.entities).toBeInstanceOf(Array);
  expect(request.confidence).toBeGreaterThan(0);
  expect(request.confidence).toBeLessThanOrEqual(1);
};

export const expectValidTradingIntent = (intent: TradingIntent) => {
  expect(intent.strategyType).toBeDefined();
  expect(intent.indicators).toBeInstanceOf(Array);
  expect(intent.conditions).toBeInstanceOf(Array);
  expect(intent.actions).toBeInstanceOf(Array);
  expect(intent.confidence).toBeGreaterThan(0);
  expect(intent.confidence).toBeLessThanOrEqual(1);
};

export const expectValidStrategyBlueprint = (blueprint: StrategyBlueprint) => {
  expect(blueprint.id).toBeDefined();
  expect(blueprint.name).toBeDefined();
  expect(blueprint.components).toBeInstanceOf(Array);
  expect(blueprint.flow).toBeInstanceOf(Array);
  expect(blueprint.parameters).toBeDefined();
  expect(blueprint.riskProfile).toBeDefined();
};

export const expectValidBuildResult = (result: BuildResult) => {
  expect(result.success).toBeDefined();
  expect(result.nodes).toBeInstanceOf(Array);
  expect(result.edges).toBeInstanceOf(Array);
  expect(result.animations).toBeInstanceOf(Array);
  expect(result.explanations).toBeInstanceOf(Array);
  expect(result.errors).toBeInstanceOf(Array);
  expect(result.warnings).toBeInstanceOf(Array);
};

export const expectValidNodeConfiguration = (node: AIBuilderNode) => {
  expect(node.id).toBeDefined();
  expect(node.type).toBeDefined();
  expect(node.position).toBeDefined();
  expect(node.position.x).toBeGreaterThanOrEqual(0);
  expect(node.position.y).toBeGreaterThanOrEqual(0);
  expect(node.data).toBeDefined();
  expect(node.aiGenerated).toBeDefined();
  expect(node.confidence).toBeGreaterThan(0);
  expect(node.confidence).toBeLessThanOrEqual(1);
};

export const expectValidPlacementResult = (result: any) => {
  expect(result.success).toBeDefined();
  expect(result.placements).toBeInstanceOf(Array);
  expect(result.collisions).toBeInstanceOf(Array);
};

// Performance testing helpers
export const measureExecutionTime = async <T>(fn: () => Promise<T> | T): Promise<{ result: T; duration: number }> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return { result, duration: end - start };
};

export const expectPerformanceWithin = (duration: number, maxMs: number) => {
  expect(duration).toBeLessThan(maxMs);
};

// Mock implementations
export const createMockNLPProcessor = () => ({
  parseRequest: jest.fn().mockResolvedValue(createMockParsedRequest()),
  extractIntent: jest.fn().mockResolvedValue(createMockTradingIntent()),
  extractParameters: jest.fn().mockResolvedValue({}),
  validateInput: jest.fn().mockResolvedValue({ valid: true, errors: [] })
});

export const createMockStrategyInterpreter = () => ({
  interpretIntent: jest.fn().mockResolvedValue(createMockStrategyBlueprint()),
  mapToNodes: jest.fn().mockResolvedValue([createMockNodeConfiguration()]),
  createConnections: jest.fn().mockResolvedValue([createMockConnectionConfiguration()]),
  optimizeStrategy: jest.fn().mockResolvedValue(createMockStrategyBlueprint())
});

export const createMockStrategyBuilder = () => ({
  buildStrategy: jest.fn().mockResolvedValue(createMockBuildResult()),
  placeNodes: jest.fn().mockResolvedValue({ success: true, placements: [] }),
  createConnections: jest.fn().mockResolvedValue({ success: true, connections: [] }),
  animateConstruction: jest.fn().mockResolvedValue([])
});

// Common test scenarios
export const commonTestScenarios = {
  simpleRSI: {
    input: "Create a RSI strategy that buys when RSI is below 30",
    expectedIntent: {
      strategyType: 'mean-reversion',
      indicators: ['rsi'],
      conditions: ['less_than'],
      actions: ['buy']
    }
  },
  
  macdCrossover: {
    input: "Build a MACD crossover strategy with stop loss",
    expectedIntent: {
      strategyType: 'trend-following',
      indicators: ['macd'],
      conditions: ['crossover'],
      actions: ['buy', 'sell'],
      riskManagement: ['stop_loss']
    }
  },
  
  bollinger: {
    input: "Create Bollinger Bands breakout strategy with take profit",
    expectedIntent: {
      strategyType: 'breakout',
      indicators: ['bollinger_bands'],
      conditions: ['breakout'],
      actions: ['buy'],
      riskManagement: ['take_profit']
    }
  }
};

const testUtils = {
  createMockParsedRequest,
  createMockTradingIntent,
  createMockStrategyBlueprint,
  createMockNodeConfiguration,
  createMockConnectionConfiguration,
  createMockBuildResult,
  expectValidParsedRequest,
  expectValidTradingIntent,
  expectValidStrategyBlueprint,
  expectValidBuildResult,
  measureExecutionTime,
  expectPerformanceWithin,
  createMockNLPProcessor,
  createMockStrategyInterpreter,
  createMockStrategyBuilder,
  commonTestScenarios
};

export default testUtils;

// User Acceptance Test Utilities
export interface TestUserInputResult {
  success: boolean;
  intent: string;
  strategyType: string;
  indicators: string[];
  parameters: Record<string, any>;
  strategy: any;
  response: string;
  explanation?: string;
  warnings?: string[];
  suggestions?: string[];
  needsClarification?: boolean;
  clarificationQuestions?: string[];
  conversationId: string;
  error?: {
    type: string;
    message: string;
    invalidParameters?: Array<{
      name: string;
      value: any;
      reason: string;
    }>;
  };
  corrections?: Array<{
    parameter: string;
    suggestedValue: any;
    reason: string;
  }>;
  conflicts?: Array<{
    conflictingTerms: string[];
    explanation: string;
  }>;
  fallbackMode?: boolean;
  alternatives?: string[];
  learningResources?: Array<{
    title: string;
    url: string;
    type: 'article' | 'video' | 'tutorial';
  }>;
  fromCache?: boolean;
  offline?: boolean;
  offlineMode?: {
    available: boolean;
    features: string[];
  };
  queuedRequest?: {
    input: string;
    timestamp: number;
  };
  retryOptions?: {
    automatic: boolean;
    manual: boolean;
  };
  preservedInput?: string;
  notification?: string;
  memoryWarning?: boolean;
  optimizationTips?: string[];
  performanceMode?: 'normal' | 'reduced';
  animationsDisabled?: boolean;
  reEnableOption?: boolean;
  queuePosition?: number;
  estimatedWaitTime?: number;
  manualBuildingOption?: boolean;
  guidedMode?: boolean;
  instructions?: string[];
  templateAlternatives?: string[];
  contextPreserved?: boolean;
  previousStrategy?: any;
  moreDetailsAvailable?: boolean;
  errorId?: string;
  recoverySuggestions?: Array<{
    action: string;
    description: string;
    automated: boolean;
  }>;
  templateSuggestions?: Array<{
    name: string;
    type: string;
  }>;
  service?: string;
  isFirstTimeUser?: boolean;
  guidedTour?: {
    steps: string[];
  };
  welcomeMessage?: string;
  basicConcepts?: string;
  stepExplanation?: string;
  nextAction?: {
    type: string;
  };
  animationMode?: boolean;
  animationSteps?: Array<{
    explanation: string;
  }>;
  controls?: {
    play: Function;
    pause: Function;
    replay: Function;
    setSpeed: Function;
  };
  helpContent?: {
    title: string;
    description: string;
    examples: any[];
    relatedTopics: string[];
  };
}

export function createTestUtils() {
  const conversations = new Map<string, any>();
  const strategies = new Map<string, any>();
  let networkFailure = false;
  let slowNetwork = false;
  let networkDelay = 0;
  let serviceFailures = new Set<string>();
  let systemAtCapacity = false;
  let lowMemory = false;
  let highCPU = false;
  let deviceProfile = { type: 'desktop', cpu: 'high', memory: 'abundant' };

  return {
    // User input simulation
    simulateUserInput: async (input: string, conversationId?: string, options?: { userLevel?: string }): Promise<TestUserInputResult> => {
      // Simulate network delay if configured
      if (slowNetwork && networkDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, networkDelay));
      }

      // Handle network failure
      if (networkFailure) {
        return {
          success: false,
          intent: 'error',
          strategyType: 'error',
          indicators: [],
          parameters: {},
          strategy: {},
          response: 'Network connection failed',
          conversationId: conversationId || 'offline',
          offline: true,
          offlineMode: {
            available: true,
            features: ['template-browsing', 'local-storage']
          },
          queuedRequest: {
            input,
            timestamp: Date.now()
          },
          error: {
            type: 'network-error',
            message: 'Unable to connect to server'
          }
        };
      }

      // Handle service failures
      if (serviceFailures.has('nlp')) {
        return {
          success: true,
          intent: 'fallback',
          strategyType: 'template-matching',
          indicators: ['RSI'],
          parameters: {},
          strategy: { name: 'Fallback Strategy', nodes: [], connections: [] },
          response: 'Using template matching due to limited functionality',
          conversationId: conversationId || `conv-${Date.now()}`,
          fallbackMode: true,
          service: 'template-service',
          templateSuggestions: [
            { name: 'RSI Strategy', type: 'mean-reversion' },
            { name: 'MA Crossover', type: 'trend-following' }
          ],
          explanation: 'AI services are temporarily limited. Using template matching instead.'
        };
      }

      // Handle system at capacity
      if (systemAtCapacity) {
        return {
          success: false,
          intent: 'error',
          strategyType: 'error',
          indicators: [],
          parameters: {},
          strategy: {},
          response: 'System is experiencing high demand',
          conversationId: conversationId || `conv-${Date.now()}`,
          error: {
            type: 'system-busy',
            message: 'System is currently at capacity due to high demand'
          },
          queuePosition: Math.floor(Math.random() * 50) + 1,
          estimatedWaitTime: Math.floor(Math.random() * 300) + 60,
          alternatives: ['browse-templates', 'offline-mode']
        };
      }

      // Handle empty input
      if (!input.trim()) {
        return {
          success: false,
          intent: 'error',
          strategyType: 'error',
          indicators: [],
          parameters: {},
          strategy: {},
          response: 'Please enter a strategy request',
          conversationId: conversationId || `conv-${Date.now()}`,
          error: {
            type: 'validation-error',
            message: 'Please enter a strategy request'
          },
          suggestions: [
            'Create RSI strategy',
            'Create moving average crossover',
            'Show me MACD template'
          ]
        };
      }

      // Handle unclear requests
      if (input.toLowerCase().includes('make me money')) {
        return {
          success: false,
          intent: 'clarification-needed',
          strategyType: 'clarification-needed',
          indicators: [],
          parameters: {},
          strategy: {},
          response: 'I\'d be happy to help you create a trading strategy! Could you be more specific about what type of strategy you\'re looking for?',
          conversationId: conversationId || `conv-${Date.now()}`,
          needsClarification: true,
          clarificationQuestions: [
            'What type of trading strategy interests you? (trend-following, mean-reversion, breakout)',
            'Which indicators would you like to use?',
            'What is your risk tolerance?'
          ],
          suggestions: ['trend-following', 'mean-reversion', 'breakout', 'scalping']
        };
      }

      // Mock normal processing
      const nlpResponse = mockNLPResponse(input, conversationId);
      const conversationIdToUse = conversationId || `conv-${Date.now()}`;

      // Create strategy based on input
      const strategy = {
        name: `${nlpResponse.strategyType} Strategy`,
        indicators: nlpResponse.indicators,
        hasRiskManagement: true,
        nodes: generateNodesForStrategy(nlpResponse),
        connections: generateConnectionsForStrategy(nlpResponse),
        complexity: deviceProfile.cpu === 'low' ? 'simplified' : 'full',
        timeframe: nlpResponse.strategyType === 'scalping' ? '1m' : '1h'
      };

      // Handle memory warnings
      const memoryWarning = lowMemory && strategy.nodes.length > 10;

      return {
        success: true,
        intent: nlpResponse.intent,
        strategyType: nlpResponse.strategyType,
        indicators: nlpResponse.indicators,
        parameters: nlpResponse.parameters,
        strategy,
        response: generateResponse(nlpResponse, options?.userLevel),
        explanation: generateExplanation(nlpResponse, options?.userLevel),
        conversationId: conversationIdToUse,
        learningResources: options?.userLevel === 'beginner' ? [
          { title: 'Introduction to Technical Indicators', url: '/learn/indicators', type: 'article' as const },
          { title: 'Risk Management Basics', url: '/learn/risk', type: 'tutorial' as const }
        ] : undefined,
        memoryWarning,
        optimizationTips: memoryWarning ? ['reduce complexity', 'use fewer indicators'] : undefined,
        performanceMode: highCPU ? 'reduced' : 'normal',
        animationsDisabled: highCPU || deviceProfile.cpu === 'low'
      };
    },

    // First time user simulation
    simulateFirstTimeUser: async () => ({
      isFirstTimeUser: true,
      guidedTour: {
        steps: [
          'Welcome to PineGenie',
          'Understanding the interface',
          'Creating your first strategy',
          'Using indicators',
          'Managing risk'
        ]
      },
      welcomeMessage: 'Welcome to PineGenie! Let\'s help you create your first trading strategy.',
      basicConcepts: 'A trading strategy is a set of rules that help you decide when to buy and sell. Technical indicators analyze price data to identify opportunities.'
    }),

    // Guided strategy creation
    simulateGuidedStrategyCreation: async (input: string) => ({
      guidedMode: true,
      steps: [
        'Choose strategy type',
        'Select indicators',
        'Set parameters',
        'Add risk management',
        'Review and test'
      ],
      currentStep: 0,
      stepExplanation: 'Let\'s start by choosing what type of strategy you want to create. This will help us guide you through the process.',
      nextAction: {
        type: 'user-input-required'
      }
    }),

    // Animation simulation
    simulateAnimatedStrategyCreation: async (input: string) => ({
      animationMode: true,
      animationSteps: [
        { explanation: 'Adding market data source' },
        { explanation: 'Creating RSI indicator' },
        { explanation: 'Setting up buy condition' },
        { explanation: 'Adding risk management' }
      ],
      controls: {
        play: jest.fn(),
        pause: jest.fn(),
        replay: jest.fn(),
        setSpeed: jest.fn()
      }
    }),

    // Help request simulation
    simulateHelpRequest: async (topic: string) => ({
      helpContent: {
        title: 'RSI Indicator',
        description: 'The Relative Strength Index (RSI) is a momentum oscillator that measures the speed and change of price movements.',
        examples: [
          { description: 'RSI below 30 indicates oversold conditions' },
          { description: 'RSI above 70 indicates overbought conditions' }
        ],
        relatedTopics: ['MACD', 'Stochastic', 'Bollinger Bands']
      }
    }),

    // Network simulation
    simulateNetworkFailure: () => { networkFailure = true; },
    restoreNetwork: () => { networkFailure = false; },
    simulateSlowNetwork: (delay: number) => { 
      slowNetwork = true; 
      networkDelay = delay; 
    },

    // Service simulation
    simulateServiceFailure: (service: string) => { serviceFailures.add(service); },
    simulateSystemAtCapacity: () => { systemAtCapacity = true; },
    simulateLowMemory: () => { lowMemory = true; },
    simulateHighCPUUsage: () => { highCPU = true; },

    // Device simulation
    setDeviceProfile: (profile: any) => { deviceProfile = profile; },

    // System error simulation
    simulateSystemError: (errorType: string) => { 
      if (errorType === 'nlp-service-unavailable') {
        serviceFailures.add('nlp');
      }
    },

    // UI component mocks
    renderChatInterface: async () => ({
      getAllTabbableElements: () => [
        { getAttribute: () => 'chat-input' },
        { getAttribute: () => 'send-button' },
        { getAttribute: () => 'clear-button' },
        { getAttribute: () => 'help-button' },
        { getAttribute: () => 'settings-button' }
      ],
      getByTestId: (testId: string) => ({
        getAttribute: (attr: string) => {
          if (attr === 'aria-label' && testId === 'chat-input') return 'Enter your strategy request';
          if (attr === 'aria-describedby' && testId === 'chat-input') return 'input-help-text';
          if (attr === 'aria-label' && testId === 'send-button') return 'Send message';
          return null;
        },
        focus: () => {},
        classList: { contains: () => false },
        textContent: 'Test content',
        getBoundingClientRect: () => ({ width: 50, height: 50 }),
        isVisible: () => true
      }),
      findByTestId: async (testId: string) => ({ textContent: 'Test content' }),
      findAllByTestId: async (testId: string) => [{ textContent: 'Suggestion 1' }],
      getAllByRole: (role: string) => [
        { getAttribute: () => null, tagName: 'H1' },
        { getAttribute: () => null, tagName: 'H2' }
      ],
      isFullyVisible: () => true,
      isStable: () => true
    }),

    // Animation utilities
    createAnimatedStrategy: async () => ({
      play: async () => {},
      pause: async () => {},
      replay: async () => {},
      setSpeed: async (speed: number) => {},
      isPlaying: false,
      currentStep: 0,
      playbackSpeed: 1.0,
      highlightedComponent: { type: 'node', name: 'RSI' },
      currentExplanation: 'Adding RSI indicator to strategy'
    }),

    // Utility functions
    wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
    waitForResponse: async () => {},
    waitForNetworkRecovery: async () => {},
    getQueuedRequestResult: async () => ({ success: true, strategy: {} }),
    waitForRetries: async () => [],

    // Cleanup
    cleanup: () => {
      conversations.clear();
      strategies.clear();
      networkFailure = false;
      slowNetwork = false;
      networkDelay = 0;
      serviceFailures.clear();
      systemAtCapacity = false;
      lowMemory = false;
      highCPU = false;
    }
  };

  // Helper functions
  function mockNLPResponse(input: string, conversationId?: string) {
    const lowerInput = input.toLowerCase();
    
    // Handle context-aware requests
    if (lowerInput.includes('change') && lowerInput.includes('period') && conversationId) {
      const periodMatch = lowerInput.match(/(\d+)/);
      return {
        intent: 'modify-strategy',
        strategyType: 'mean-reversion',
        indicators: ['RSI'],
        parameters: { 
          rsiOversold: periodMatch ? parseInt(periodMatch[1]) : 25
        }
      };
    }
    
    if (lowerInput.includes('rsi')) {
      const periodMatch = lowerInput.match(/period\s+(\d+)/);
      const oversoldMatch = lowerInput.match(/(?:below|oversold)\s+(\d+)/);
      const overboughtMatch = lowerInput.match(/(?:above|overbought)\s+(\d+)/);
      const stopLossMatch = lowerInput.match(/stop\s+loss\s+(?:at\s+)?(\d+)%/);
      
      return {
        intent: lowerInput.includes('template') && lowerInput.includes('change') ? 'customize-template' : 'create-strategy',
        strategyType: 'mean-reversion',
        indicators: ['RSI'],
        parameters: { 
          rsiPeriod: periodMatch ? parseInt(periodMatch[1]) : 14,
          rsiOversold: oversoldMatch ? parseInt(oversoldMatch[1]) : 30,
          rsiOverbought: overboughtMatch ? parseInt(overboughtMatch[1]) : 70,
          stopLoss: stopLossMatch ? parseInt(stopLossMatch[1]) / 100 : 0.02
        }
      };
    }
    
    if (lowerInput.includes('moving average') || lowerInput.includes('ma crossover')) {
      return {
        intent: 'create-strategy',
        strategyType: 'trend-following',
        indicators: ['SMA'],
        parameters: { fastPeriod: 20, slowPeriod: 50 }
      };
    }

    if (lowerInput.includes('macd')) {
      return {
        intent: 'create-strategy',
        strategyType: 'momentum',
        indicators: ['MACD'],
        parameters: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 }
      };
    }

    if (lowerInput.includes('scalping')) {
      return {
        intent: 'create-strategy',
        strategyType: 'scalping',
        indicators: ['RSI', 'MACD', 'Bollinger Bands'],
        parameters: { timeframe: '1m', stopLoss: 0.005, takeProfit: 0.01 }
      };
    }

    return {
      intent: 'unknown',
      strategyType: 'unknown',
      indicators: [],
      parameters: {}
    };
  }

  function generateNodesForStrategy(nlpResponse: any) {
    const nodes = [];
    let nodeId = 0;

    // Always add data source
    nodes.push({
      id: `node-${nodeId++}`,
      type: 'data-source',
      position: { x: 100, y: 100 },
      data: { symbol: 'BTCUSDT', timeframe: '1h' }
    });

    // Add indicator nodes
    nlpResponse.indicators.forEach((indicator: string) => {
      nodes.push({
        id: `node-${nodeId++}`,
        type: indicator.toLowerCase(),
        position: { x: 300, y: 100 + nodeId * 80 },
        data: nlpResponse.parameters
      });
    });

    // Add condition and action nodes
    nodes.push({
      id: `node-${nodeId++}`,
      type: 'condition',
      position: { x: 500, y: 200 },
      data: { type: 'crossover' }
    });

    nodes.push({
      id: `node-${nodeId++}`,
      type: 'buy-action',
      position: { x: 700, y: 150 },
      data: { orderType: 'market' }
    });

    // Add sell action for more complex strategies
    if (nlpResponse.strategyType === 'mean-reversion' || nlpResponse.strategyType === 'scalping') {
      nodes.push({
        id: `node-${nodeId++}`,
        type: 'sell-action',
        position: { x: 700, y: 250 },
        data: { orderType: 'market' }
      });
    }

    // Add risk management nodes
    nodes.push({
      id: `node-${nodeId++}`,
      type: 'stop-loss',
      position: { x: 900, y: 200 },
      data: { percentage: 2 }
    });

    return nodes;
  }

  function generateConnectionsForStrategy(nlpResponse: any) {
    const connections = [
      { id: 'conn-1', source: 'node-0', target: 'node-1' },
      { id: 'conn-2', source: 'node-1', target: 'node-2' },
      { id: 'conn-3', source: 'node-2', target: 'node-3' }
    ];

    // Add more connections for complex strategies
    if (nlpResponse.strategyType === 'mean-reversion' || nlpResponse.strategyType === 'scalping') {
      connections.push({ id: 'conn-4', source: 'node-2', target: 'node-4' });
      connections.push({ id: 'conn-5', source: 'node-3', target: 'node-5' });
    }

    return connections;
  }

  function generateResponse(nlpResponse: any, userLevel?: string): string {
    const baseResponse = `I've created a ${nlpResponse.strategyType} strategy using ${nlpResponse.indicators.join(', ')}`;
    
    if (userLevel === 'beginner') {
      return `${baseResponse}. This strategy is designed to help you learn about trading concepts while managing risk effectively.`;
    }
    
    return `${baseResponse} with the specified parameters and risk management components.`;
  }

  function generateExplanation(nlpResponse: any, userLevel?: string): string {
    if (userLevel === 'beginner') {
      return `This ${nlpResponse.strategyType} strategy uses technical indicators like ${nlpResponse.indicators.join(', ')} to identify trading opportunities. Moving average crossovers are a popular trend-following technique that helps identify when the market direction changes. The strategy includes built-in risk management to help protect your capital.`;
    }
    
    return `Strategy utilizes ${nlpResponse.indicators.join(', ')} for signal generation with integrated risk management protocols.`;
  }
}