import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from './prisma';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

class AIService {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private demoMode: boolean = false;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }

    // Enable demo mode if no API keys are available
    this.demoMode = !process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY;
  }

  async generateResponse(
    modelId: string,
    messages: AIMessage[],
    maxTokens?: number
  ): Promise<AIResponse> {
    const model = await prisma.lLMModel.findUnique({
      where: { id: modelId },
    });

    if (!model || !model.isActive) {
      throw new Error('Model not found or inactive');
    }

    // If in demo mode, return mock response
    if (this.demoMode) {
      return this.generateDemoResponse(model, messages);
    }

    if (model.provider === 'openai') {
      return this.generateOpenAIResponse(model.modelId, messages, maxTokens);
    } else if (model.provider === 'claude') {
      return this.generateClaudeResponse(model.modelId, messages, maxTokens);
    }

    throw new Error('Unsupported model provider');
  }

  private async generateOpenAIResponse(
    modelId: string,
    messages: AIMessage[],
    maxTokens?: number
  ): Promise<AIResponse> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const response = await this.openai.chat.completions.create({
      model: modelId,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      max_tokens: maxTokens,
    });

    return {
      content: response.choices[0]?.message?.content || '',
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      } : undefined,
    };
  }

  private async generateClaudeResponse(
    modelId: string,
    messages: AIMessage[],
    maxTokens?: number
  ): Promise<AIResponse> {
    if (!this.anthropic) {
      throw new Error('Anthropic client not initialized');
    }

    // Convert messages format for Claude
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await this.anthropic.messages.create({
      model: modelId,
      max_tokens: maxTokens || 1000,
      system: systemMessage?.content,
      messages: conversationMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
    });

    const content = response.content[0];
    return {
      content: content.type === 'text' ? content.text : '',
      usage: response.usage ? {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      } : undefined,
    };
  }

  async getAvailableModels() {
    return await prisma.lLMModel.findMany({
      where: { isActive: true },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
    });
  }

  async getDefaultModel() {
    return await prisma.lLMModel.findFirst({
      where: { isActive: true, isDefault: true },
    });
  }

  private async generateDemoResponse(
    model: any,
    messages: AIMessage[]
  ): Promise<AIResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage?.content || '';

    // Generate contextual demo responses
    let demoResponse = '';

    if (userMessage.toLowerCase().includes('pine script') || userMessage.toLowerCase().includes('trading')) {
      demoResponse = `🤖 **${model.displayName} Demo Response**

I'd be happy to help you with Pine Script and trading strategies! Here are some key concepts:

**Pine Script Basics:**
- Pine Script is TradingView's programming language for creating custom indicators and strategies
- It uses a declarative syntax and runs on each bar/candle
- Version 5 is the latest and most feature-rich

**Common Trading Indicators:**
- RSI (Relative Strength Index) for momentum
- Moving Averages for trend direction
- MACD for trend changes
- Bollinger Bands for volatility

**Strategy Example:**
\`\`\`pinescript
//@version=5
strategy("Simple MA Cross", overlay=true)

fast_ma = ta.sma(close, 10)
slow_ma = ta.sma(close, 20)

if ta.crossover(fast_ma, slow_ma)
    strategy.entry("Long", strategy.long)
if ta.crossunder(fast_ma, slow_ma)
    strategy.close("Long")
\`\`\`

*Note: This is a demo response. Connect your ${model.provider.toUpperCase()} API key for real AI assistance!*`;
    } else if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      demoResponse = `🤖 **${model.displayName} Demo Response**

Hello! I'm PineGenie AI, your TradingView strategy assistant. I can help you with:

- 📈 Creating Pine Script strategies
- 🔍 Analyzing trading indicators  
- 💡 Strategy optimization tips
- 🛠️ Debugging Pine Script code
- 📊 Market analysis concepts

What would you like to work on today?

*Note: This is a demo response. Connect your ${model.provider.toUpperCase()} API key for real AI assistance!*`;
    } else {
      demoResponse = `🤖 **${model.displayName} Demo Response**

Thank you for your question about: "${userMessage}"

This is a demonstration of how PineGenie AI would respond to your queries. In the full version with API keys connected, I would provide:

- Detailed technical analysis
- Custom Pine Script code generation
- Strategy optimization suggestions
- Real-time market insights
- Step-by-step tutorials

**To enable full AI functionality:**
1. Get an API key from ${model.provider === 'openai' ? 'OpenAI' : 'Anthropic'}
2. Add it to your environment variables
3. Restart the application

*This is a demo response showing the interface functionality.*`;
    }

    return {
      content: demoResponse,
      usage: {
        promptTokens: 50,
        completionTokens: 150,
        totalTokens: 200,
      },
    };
  }
}

export const aiService = new AIService();