import { ResponseGenerator } from '../response-generator';
import { ActionType } from '../../../types/chat-types';

describe('ResponseGenerator', () => {
  let responseGenerator: ResponseGenerator;

  beforeEach(() => {
    responseGenerator = new ResponseGenerator();
  });

  describe('Enhanced Response Generation', () => {
    test('should generate enhanced RSI strategy response with formatting', async () => {
      const response = await responseGenerator.generateResponse('Create a RSI strategy');
      
      expect(response.message).toContain('🎯 **RSI Mean Reversion Strategy**');
      expect(response.message).toContain('**📊 Strategy Logic:**');
      expect(response.message).toContain('**🔧 Key Components:**');
      expect(response.message).toContain('**📈 Performance Expectations:**');
      expect(response.message).toContain('**💡 Why This Works:**');
      expect(response.needsConfirmation).toBe(true);
      expect(response.actions).toBeDefined();
      expect(response.actions?.length).toBeGreaterThan(0);
      expect(response.suggestions).toBeDefined();
      expect(response.suggestions?.length).toBeGreaterThan(0);
    });

    test('should generate enhanced MACD strategy response with formatting', async () => {
      const response = await responseGenerator.generateResponse('Build a MACD crossover strategy');
      
      expect(response.message).toContain('📈 **MACD Crossover Strategy**');
      expect(response.message).toContain('**🎯 Strategy Logic:**');
      expect(response.message).toContain('**🚀 Pro Tips:**');
      expect(response.needsConfirmation).toBe(true);
      expect(response.strategyPreview).toBeDefined();
      expect(response.strategyPreview?.name).toBe('MACD Crossover Strategy');
    });

    test('should generate enhanced Bollinger Bands response with warnings', async () => {
      const response = await responseGenerator.generateResponse('Create a Bollinger Bands breakout strategy');
      
      expect(response.message).toContain('⚡ **Bollinger Bands Breakout Strategy**');
      expect(response.message).toContain('**⚠️ Important Notes:**');
      expect(response.message).toContain('**🚀 Pro Enhancement Ideas:**');
      expect(response.needsConfirmation).toBe(true);
      expect(response.strategyPreview?.riskLevel).toBe('high');
    });

    test('should generate enhanced help response with comprehensive information', async () => {
      const response = await responseGenerator.generateResponse('help');
      
      expect(response.message).toContain('👋 **Welcome to PineGenie AI!**');
      expect(response.message).toContain('**🚀 What I Can Do:**');
      expect(response.message).toContain('**💡 Getting Started Examples:**');
      expect(response.message).toContain('**🎯 Popular Strategy Types:**');
      expect(response.message).toContain('**🛡️ Risk Management:**');
      expect(response.actions).toBeDefined();
      expect(response.suggestions).toBeDefined();
    });

    test('should generate clarification response for ambiguous requests', async () => {
      const response = await responseGenerator.generateResponse('make me money');
      
      expect(response.message).toContain('🤔 **I\'d love to help you build that strategy!**');
      expect(response.message).toContain('**Strategy Type:**');
      expect(response.message).toContain('**Indicators:**');
      expect(response.message).toContain('**Timeframe:**');
      expect(response.message).toContain('**Risk Level:**');
      expect(response.suggestions).toBeDefined();
      expect(response.suggestions?.length).toBeGreaterThan(0);
    });

    test('should include metadata in responses', async () => {
      const response = await responseGenerator.generateResponse('Create RSI strategy');
      
      expect(response.metadata).toBeDefined();
      expect(response.metadata?.confidence).toBeGreaterThan(0);
      expect(response.metadata?.sources).toContain('response-generator');
      expect(response.metadata?.relatedTopics).toBeDefined();
      expect(response.metadata?.followUpQuestions).toBeDefined();
    });

    test('should handle confirmation responses', async () => {
      const context = {
        currentStrategy: undefined,
        activeNodes: [],
        userIntent: 'build-rsi',
        pendingActions: [{
          id: 'build-rsi-strategy',
          type: ActionType.BUILD_STRATEGY,
          label: 'Build RSI Strategy',
          description: 'Build RSI strategy on canvas',
          payload: { strategyType: 'rsi' }
        }],
        preferences: {
          verboseExplanations: true,
          showAnimations: true,
          autoApplyOptimizations: false,
          preferredResponseLength: 'medium' as const,
          enableSuggestions: true
        }
      };

      const response = await responseGenerator.generateResponse('yes', context);
      
      expect(response.message).toContain('✅ **Action Confirmed**');
      expect(response.actions).toBeDefined();
      expect(response.actions?.length).toBeGreaterThan(0);
    });

    test('should handle cancellation responses', async () => {
      const context = {
        currentStrategy: undefined,
        activeNodes: [],
        userIntent: 'build-rsi',
        pendingActions: [{
          id: 'build-rsi-strategy',
          type: ActionType.BUILD_STRATEGY,
          label: 'Build RSI Strategy',
          description: 'Build RSI strategy on canvas',
          payload: { strategyType: 'rsi' }
        }],
        preferences: {
          verboseExplanations: true,
          showAnimations: true,
          autoApplyOptimizations: false,
          preferredResponseLength: 'medium' as const,
          enableSuggestions: true
        }
      };

      const response = await responseGenerator.generateResponse('no', context);
      
      expect(response.message).toContain('❌ **Action Cancelled**');
      expect(response.suggestions).toBeDefined();
      expect(response.suggestions?.length).toBeGreaterThan(0);
    });

    test('should generate enhanced error responses with recovery options', async () => {
      // Mock an error by calling generateErrorResponse directly
      const errorResponse = (responseGenerator as any).generateErrorResponse('Parsing failed');
      
      expect(errorResponse.message).toContain('❌ **Oops! Something went wrong**');
      expect(errorResponse.message).toContain('Try using simpler language');
      expect(errorResponse.actions).toBeDefined();
      expect(errorResponse.actions.length).toBeGreaterThan(0);
      expect(errorResponse.suggestions).toBeDefined();
      expect(errorResponse.metadata).toBeDefined();
    });

    test('should generate strategy analysis response', async () => {
      const context = {
        currentStrategy: 'my-rsi-strategy',
        activeNodes: ['rsi-node', 'condition-node'],
        userIntent: undefined,
        pendingActions: [],
        preferences: {
          verboseExplanations: true,
          showAnimations: true,
          autoApplyOptimizations: false,
          preferredResponseLength: 'medium' as const,
          enableSuggestions: true
        }
      };

      const response = await responseGenerator.generateResponse('analyze my strategy', context);
      
      expect(response.message).toContain('🔍 **Strategy Analysis Complete**');
      expect(response.message).toContain('**Strengths:**');
      expect(response.message).toContain('**Improvement Opportunities:**');
      expect(response.actions).toBeDefined();
      expect(response.actions?.some(action => action.type === ActionType.OPTIMIZE_PARAMETERS)).toBe(true);
    });

    test('should generate optimization response', async () => {
      const response = await responseGenerator.generateResponse('optimize my strategy parameters');
      
      expect(response.message).toContain('⚡ **Strategy Optimization**');
      expect(response.message).toContain('**Parameter Optimization:**');
      expect(response.message).toContain('**Structure Optimization:**');
      expect(response.actions).toBeDefined();
      expect(response.actions?.some(action => action.type === ActionType.OPTIMIZE_PARAMETERS)).toBe(true);
    });
  });

  describe('Intent Analysis', () => {
    test('should correctly analyze RSI intent', async () => {
      const response = await responseGenerator.generateResponse('RSI oversold strategy');
      expect(response.strategyPreview?.name).toContain('RSI');
    });

    test('should correctly analyze MACD intent', async () => {
      const response = await responseGenerator.generateResponse('MACD crossover signals');
      expect(response.strategyPreview?.name).toContain('MACD');
    });

    test('should correctly analyze Bollinger intent', async () => {
      const response = await responseGenerator.generateResponse('Bollinger bands breakout');
      expect(response.strategyPreview?.name).toContain('Bollinger');
    });

    test('should handle mixed intents with clarification', async () => {
      const response = await responseGenerator.generateResponse('RSI MACD strategy');
      // Should ask for clarification when multiple indicators mentioned
      expect(response.message).toContain('more information') || 
      expect(response.strategyPreview).toBeDefined();
    });
  });

  describe('Suggestion Engine', () => {
    test('should generate contextual suggestions for RSI', async () => {
      const response = await responseGenerator.generateResponse('RSI strategy');
      expect(response.suggestions).toContain('Add volume confirmation to reduce false signals') ||
      expect(response.suggestions?.some(s => s.includes('volume'))).toBe(true);
    });

    test('should generate contextual suggestions for MACD', async () => {
      const response = await responseGenerator.generateResponse('MACD strategy');
      expect(response.suggestions?.some(s => s.includes('histogram') || s.includes('trend'))).toBe(true);
    });

    test('should generate contextual suggestions for Bollinger', async () => {
      const response = await responseGenerator.generateResponse('Bollinger strategy');
      expect(response.suggestions?.some(s => s.includes('volume') || s.includes('squeeze'))).toBe(true);
    });
  });
});