import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { aiService } from '@/lib/ai-service';


// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check authentication (skip for development testing)
    const session = await getServerSession(authOptions);
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!session && !isDevelopment) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Log for development
    if (isDevelopment) {
      console.log('🔓 Development mode: Skipping auth check');
    }

    const body = await request.json();
    const { messages, modelId = 'gpt-4' } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    console.log(`🤖 AI Generate API: Using model ${modelId} for ${messages.length} messages`);

    // Generate response using our AI service
    const response = await aiService.generateResponse(messages, modelId);

    console.log(`✅ AI Generate API: Response generated with model ${response.model}`);

    return NextResponse.json({
      success: true,
      content: response.content,
      model: response.model,
      usage: response.usage
    });

  } catch (error) {
    console.error('❌ AI Generate API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}