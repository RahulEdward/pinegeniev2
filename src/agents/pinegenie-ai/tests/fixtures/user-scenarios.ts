/**
 * User Scenario Test Data
 * Realistic test data for user acceptance testing
 */

export interface UserScenario {
  id: string;
  name: string;
  description: string;
  userInput: string;
  expectedOutcome: {
    strategyType: string;
    nodeCount: number;
    connectionCount: number;
    hasRiskManagement: boolean;
    indicators: string[];
  };
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const commonUserScenarios: UserScenario[] = [
  {
    id: 'beginner-ma-crossover',
    name: 'Beginner MA Crossover',
    description: 'New user wants to create a simple moving average crossover strategy',
    userInput: 'I want to create a simple strategy that buys when the 20-day moving average crosses above the 50-day moving average',
    expectedOutcome: {
      strategyType: 'trend-following',
      nodeCount: 6, // 2 MAs, 1 crossover condition, 1 buy action, 1 data source, 1 risk management
      connectionCount: 5,
      hasRiskManagement: true,
      indicators: ['SMA']
    },
    difficulty: 'beginner'
  },
  {
    id: 'intermediate-rsi-strategy',
    name: 'RSI Mean Reversion',
    description: 'User wants to create an RSI-based mean reversion strategy',
    userInput: 'Create a strategy that buys when RSI is below 30 and sells when RSI is above 70, with stop loss at 2%',
    expectedOutcome: {
      strategyType: 'mean-reversion',
      nodeCount: 8, // RSI, 2 conditions, 2 actions, data source, stop loss, take profit
      connectionCount: 7,
      hasRiskManagement: true,
      indicators: ['RSI']
    },
    difficulty: 'intermediate'
  },
  {
    id: 'advanced-multi-indicator',
    name: 'Advanced Multi-Indicator Strategy',
    description: 'Experienced user wants a complex strategy with multiple indicators',
    userInput: 'I need a scalping strategy using RSI, MACD, and Bollinger Bands with tight stop losses and quick exits',
    expectedOutcome: {
      strategyType: 'scalping',
      nodeCount: 12, // Multiple indicators, conditions, actions, risk management
      connectionCount: 15,
      hasRiskManagement: true,
      indicators: ['RSI', 'MACD', 'Bollinger Bands']
    },
    difficulty: 'advanced'
  },
  {
    id: 'template-customization',
    name: 'Template Customization',
    description: 'User wants to customize an existing template',
    userInput: 'Use the RSI template but change the oversold level to 25 and add a moving average filter',
    expectedOutcome: {
      strategyType: 'mean-reversion',
      nodeCount: 7,
      connectionCount: 6,
      hasRiskManagement: true,
      indicators: ['RSI', 'SMA']
    },
    difficulty: 'intermediate'
  },
  {
    id: 'error-recovery',
    name: 'Error Recovery Scenario',
    description: 'User makes an unclear request and needs guidance',
    userInput: 'Make me money with crypto',
    expectedOutcome: {
      strategyType: 'clarification-needed',
      nodeCount: 0,
      connectionCount: 0,
      hasRiskManagement: false,
      indicators: []
    },
    difficulty: 'beginner'
  }
];

export const educationalScenarios = [
  {
    id: 'first-time-user',
    name: 'First Time User Experience',
    description: 'Complete new user needs full guidance',
    steps: [
      'Welcome and introduction',
      'Basic trading concepts explanation',
      'Simple strategy creation',
      'Understanding the visual builder',
      'Testing and validation'
    ]
  },
  {
    id: 'learning-indicators',
    name: 'Learning About Indicators',
    description: 'User wants to understand different technical indicators',
    steps: [
      'What are technical indicators?',
      'Types of indicators (trend, momentum, volatility)',
      'How to choose the right indicator',
      'Combining multiple indicators',
      'Common mistakes to avoid'
    ]
  }
];

export const accessibilityScenarios = [
  {
    id: 'keyboard-navigation',
    name: 'Keyboard-Only Navigation',
    description: 'User navigates the entire system using only keyboard',
    requirements: [
      'Tab navigation through all interactive elements',
      'Enter/Space activation of buttons',
      'Arrow key navigation in lists',
      'Escape key to close modals',
      'Focus indicators visible'
    ]
  },
  {
    id: 'screen-reader',
    name: 'Screen Reader Compatibility',
    description: 'Visually impaired user uses screen reader',
    requirements: [
      'All images have alt text',
      'Form labels properly associated',
      'ARIA labels for complex components',
      'Logical heading structure',
      'Status updates announced'
    ]
  },
  {
    id: 'mobile-usage',
    name: 'Mobile Device Usage',
    description: 'User accesses system on mobile device',
    requirements: [
      'Touch-friendly interface',
      'Responsive design',
      'Readable text sizes',
      'Accessible tap targets',
      'Horizontal scrolling avoided'
    ]
  }
];

export const errorScenarios = [
  {
    id: 'network-failure',
    name: 'Network Connection Issues',
    description: 'User experiences network connectivity problems',
    triggers: ['API timeout', 'Connection lost', 'Slow network'],
    expectedBehavior: [
      'Graceful error messages',
      'Retry mechanisms',
      'Offline mode if possible',
      'Data preservation',
      'Clear recovery instructions'
    ]
  },
  {
    id: 'invalid-input',
    name: 'Invalid User Input',
    description: 'User provides invalid or incomplete information',
    triggers: ['Empty fields', 'Invalid parameters', 'Conflicting requirements'],
    expectedBehavior: [
      'Clear validation messages',
      'Helpful suggestions',
      'Inline error indicators',
      'Prevention of invalid states',
      'Guided correction process'
    ]
  },
  {
    id: 'system-overload',
    name: 'System Performance Issues',
    description: 'System under heavy load or resource constraints',
    triggers: ['High CPU usage', 'Memory constraints', 'Many concurrent users'],
    expectedBehavior: [
      'Performance degradation warnings',
      'Progressive loading',
      'Essential features remain functional',
      'Clear status indicators',
      'Graceful fallbacks'
    ]
  }
];

export const performanceExpectations = {
  responseTime: {
    aiResponse: 2000, // 2 seconds max for AI responses
    strategyGeneration: 5000, // 5 seconds max for strategy generation
    nodeCreation: 500, // 500ms max for node creation
    connectionCreation: 300, // 300ms max for connection creation
  },
  memory: {
    maxHeapSize: 100 * 1024 * 1024, // 100MB max heap size
    maxStrategySize: 1000, // Max 1000 nodes per strategy
  },
  reliability: {
    successRate: 0.95, // 95% success rate for AI operations
    uptime: 0.99, // 99% uptime requirement
  }
};