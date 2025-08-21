import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { aiService } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message, conversationHistory, modelId = 'pine-genie' } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Convert conversation history to proper format
    const messages = [
      ...(conversationHistory || []).map((msg: any) => ({
        role: msg.role || (msg.type === 'user' ? 'user' : 'assistant'),
        content: msg.content || msg.message
      })),
      {
        role: 'user' as const,
        content: message
      }
    ];

    // Generate AI response using the AI service
    const aiResponse = await aiService.generateResponse(messages, modelId);

    return NextResponse.json({
      success: true,
      data: {
        response: aiResponse.content,
        model: aiResponse.model,
        usage: aiResponse.usage,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Add available models endpoint
export async function GET(request: NextRequest) {
  try {
    const availableModels = aiService.getAvailableModels();
    
    return NextResponse.json({
      success: true,
      data: {
        models: availableModels,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting available models:', error);
    return NextResponse.json(
      { error: 'Failed to get available models' },
      { status: 500 }
    );
  }
}