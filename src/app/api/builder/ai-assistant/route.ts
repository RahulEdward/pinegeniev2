import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { aiService } from '@/lib/ai-service';
import { availableModels } from '@/lib/ai-models';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface BuilderAIRequest {
  messages: ChatMessage[];
  modelId?: string;
  context?: {
    currentNodes?: any[];
    currentConnections?: any[];
    strategyType?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body: BuilderAIRequest = await request.json();
    const { messages, modelId = 'gpt-4', context } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Enhanced system prompt for builder AI assistant
    const builderSystemPrompt: ChatMessage = {
      role: 'system',
      content: `You are PineGenie AI, a specialized assistant for the Pine Script Strategy Builder.

IMPORTANT: First determine if the user wants to:
1. **Create a trading strategy** - Generate strategy components and code
2. **General conversation** - Just chat normally without generating strategies

STRATEGY KEYWORDS: Look for these words to identify strategy requests:
- "create", "build", "make", "generate", "strategy", "trading"
- Indicator names: "RSI", "MACD", "SMA", "EMA", "Bollinger", "Stochastic"
- Trading terms: "buy", "sell", "entry", "exit", "signal", "crossover"

RESPONSE FORMATS:

**For STRATEGY requests, respond with JSON:**
{
  "message": "I'll create that strategy for you!",
  "strategy": {
    "name": "Strategy Name",
    "nodes": [...], // Array of node configurations
    "connections": [...], // Array of connection configurations
    "pineScript": "// Complete Pine Script v6 code"
  },
  "suggestions": ["suggestion1", "suggestion2"]
}

**For GENERAL conversation, respond with JSON:**
{
  "message": "Your conversational response here",
  "strategy": null,
  "suggestions": []
}

EXAMPLES:
- "hello" → General conversation, no strategy
- "how are you" → General conversation, no strategy  
- "create RSI strategy" → Strategy request, generate components
- "build MACD crossover" → Strategy request, generate components

PINE SCRIPT V6 REQUIREMENTS (only for strategy requests):
- Always use //@version=6
- Use ta.rsi(), ta.sma(), ta.ema(), ta.macd(), etc.
- Use strategy.entry(), strategy.exit(), strategy.close()
- Include proper input parameters and plotting

Be conversational for general chat, strategic for trading requests.`
    };

    // Combine system prompt with user messages
    const enhancedMessages = [builderSystemPrompt, ...messages];

    // Generate AI response using the selected model
    const aiResponse = await aiService.generateResponse(enhancedMessages, modelId);

    // Try to parse the response as JSON for structured data
    let structuredResponse;
    try {
      // Look for JSON in the response
      const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        structuredResponse = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // If JSON parsing fails, create a structured response from the text
      structuredResponse = {
        message: aiResponse.content,
        strategy: null,
        suggestions: []
      };
    }

    return NextResponse.json({
      success: true,
      response: structuredResponse || {
        message: aiResponse.content,
        strategy: null,
        suggestions: []
      },
      model: aiResponse.model,
      usage: aiResponse.usage
    });

  } catch (error) {
    console.error('Builder AI Assistant Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate AI response',
      fallback: {
        message: "I'm having trouble processing your request right now. Please try describing your strategy in simpler terms, like 'Create an RSI strategy' or 'Build a moving average crossover'.",
        strategy: null,
        suggestions: [
          "Try using specific indicator names (RSI, MACD, Bollinger Bands)",
          "Describe entry and exit conditions clearly",
          "Mention timeframes and risk management preferences"
        ]
      }
    }, { status: 500 });
  }
}

// GET endpoint to retrieve available models for the builder
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Filter models available for builder AI - only PineGenie and ChatGPT-4
    const builderModels = availableModels.filter(model => 
      model.id === 'pine-genie' || 
      model.id === 'gpt-4'
    );

    return NextResponse.json({
      success: true,
      models: builderModels
    });

  } catch (error) {
    console.error('Error fetching builder AI models:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch available models'
    }, { status: 500 });
  }
}