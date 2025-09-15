import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { subscriptionPlanManager } from '@/services/subscription';


// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check AI access based on subscription
    const hasAIAccess = await subscriptionPlanManager.checkAIChatAccess(session.user.id);
    
    if (!hasAIAccess) {
      return NextResponse.json({
        error: 'AI chat conversations require a paid subscription plan',
        upgradeRequired: true,
        message: 'Upgrade to Pro or Premium to access AI chat features'
      }, { status: 403 });
    }

    // Fetch user's conversations with message count and last message
    const conversations = await prisma.agentConversation.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            content: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Transform conversations to match the expected format
    const formattedConversations = conversations.map(conv => {
      const lastMessage = conv.messages[0];
      
      // Determine category based on context or default to custom
      let category = 'custom';
      if (conv.context && typeof conv.context === 'object') {
        const contextObj = conv.context as any;
        if (contextObj.category) {
          category = contextObj.category;
        } else if (contextObj.strategy_type) {
          // Map strategy types to categories
          const strategyType = contextObj.strategy_type.toLowerCase();
          if (strategyType.includes('trend')) category = 'trend-following';
          else if (strategyType.includes('mean') || strategyType.includes('reversion')) category = 'mean-reversion';
          else if (strategyType.includes('breakout')) category = 'breakout';
          else if (strategyType.includes('momentum')) category = 'momentum';
          else if (strategyType.includes('scalp')) category = 'scalping';
        }
      }

      // Generate title from session ID or first message
      let title = `Chat ${conv.sessionId.slice(-8)}`;
      if (lastMessage && lastMessage.content) {
        const content = lastMessage.content.substring(0, 50);
        if (content.length > 0) {
          title = content.length === 50 ? content + '...' : content;
        }
      }

      return {
        id: conv.id,
        title,
        lastMessage: lastMessage?.content || 'No messages yet',
        timestamp: lastMessage?.createdAt || conv.createdAt,
        category: category as 'trend-following' | 'mean-reversion' | 'breakout' | 'momentum' | 'scalping' | 'custom',
        hasSpec: false, // Could be determined from context if spec planning is implemented
        messageCount: conv._count.messages
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedConversations
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check AI access based on subscription
    const hasAIAccess = await subscriptionPlanManager.checkAIChatAccess(session.user.id);
    
    if (!hasAIAccess) {
      return NextResponse.json({
        error: 'Creating AI chat conversations requires a paid subscription plan',
        upgradeRequired: true,
        message: 'Upgrade to Pro or Premium to access AI chat features'
      }, { status: 403 });
    }

    const body = await request.json();
    const { sessionId, agentType = 'pinescript', context = {} } = body;

    // Create new conversation
    const conversation = await prisma.agentConversation.create({
      data: {
        userId: session.user.id,
        sessionId: sessionId || `chat_${Date.now()}`,
        agentType,
        context
      }
    });

    return NextResponse.json({
      success: true,
      data: conversation
    });

  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('id');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Delete conversation (messages will be deleted due to cascade)
    await prisma.agentConversation.delete({
      where: {
        id: conversationId,
        userId: session.user.id // Ensure user owns the conversation
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Conversation deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}