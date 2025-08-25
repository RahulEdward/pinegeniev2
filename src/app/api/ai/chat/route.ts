import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { aiService } from '@/lib/ai-service';


// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, conversationId, modelId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: user.id,
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
          model: true,
        },
      });
    }

    if (!conversation) {
      // Get model (use provided modelId or default)
      let model;
      if (modelId) {
        model = await prisma.lLMModel.findUnique({
          where: { id: modelId, isActive: true },
        });
      } else {
        model = await aiService.getDefaultModel();
      }

      if (!model) {
        return NextResponse.json({ error: 'No available model' }, { status: 400 });
      }

      // Create new conversation
      conversation = await prisma.conversation.create({
        data: {
          userId: user.id,
          modelId: model.id,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        },
        include: {
          messages: true,
          model: true,
        },
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: message,
      },
    });

    // Prepare messages for AI
    const messages = [
      {
        role: 'system' as const,
        content: 'You are PineGenie AI, an expert assistant for creating TradingView Pine Script strategies. Help users build, optimize, and understand trading strategies.',
      },
      ...conversation.messages.map(msg => ({
        role: msg.role.toLowerCase() as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: message,
      },
    ];

    // Generate AI response
    const aiResponse = await aiService.generateResponse(
      conversation.model.id,
      messages,
      conversation.model.maxTokens || undefined
    );

    // Save AI response
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: aiResponse.content,
      },
    });

    return NextResponse.json({
      response: aiResponse.content,
      conversationId: conversation.id,
      usage: aiResponse.usage,
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}