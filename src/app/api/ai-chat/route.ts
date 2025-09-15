import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { aiService } from '@/lib/ai-service';
import { subscriptionPlanManager } from '@/services/subscription';


// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check AI access based on subscription
    const hasAIAccess = await subscriptionPlanManager.checkAIChatAccess(session.user.id);
    
    if (!hasAIAccess) {
      return NextResponse.json({
        error: 'AI chat requires a paid subscription plan',
        upgradeRequired: true,
        message: 'Upgrade to Pro or Premium to access AI chat features'
      }, { status: 403 });
    }

    const body = await request.json();
    const { messages, modelId = 'gpt-4' } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Generate response using our AI service
    const response = await aiService.generateResponse(messages, modelId);

    return NextResponse.json({
      success: true,
      content: response.content,
      model: response.model,
      usage: response.usage
    });

  } catch (error) {
    console.error('AI Chat API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}