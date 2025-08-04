import { AIResponse, ConversationContext, ChatMessage } from '../types/chat-types';
import { ResponseGenerator } from './services/response-generator';
import { ConversationManager } from './services/conversation-manager';

/**
 * Main AI Chat Interface
 * Provides programmatic access to the AI chat system
 */
export class AIChatInterface {
  private responseGenerator: ResponseGenerator;
  private conversationManager: ConversationManager;

  constructor() {
    this.responseGenerator = new ResponseGenerator();
    this.conversationManager = new ConversationManager();
  }

  /**
   * Send a message and get AI response
   */
  async sendMessage(
    message: string, 
    conversationId?: string,
    context?: ConversationContext
  ): Promise<AIResponse> {
    // Get or create conversation
    let conversation = conversationId ? 
      this.conversationManager.getConversation(conversationId) : 
      null;

    if (!conversation) {
      conversation = this.conversationManager.createConversation(conversationId);
    }

    // Use conversation context if not provided
    const effectiveContext = context || conversation.context;

    // Generate AI response
    const response = await this.responseGenerator.generateResponse(message, effectiveContext);

    // Add messages to conversation
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user-input' as const,
      content: message,
      timestamp: new Date()
    };

    const aiMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      type: 'ai-response' as const,
      content: response.message,
      timestamp: new Date(),
      metadata: {
        confidence: response.metadata?.confidence,
        actions: response.actions,
        strategyId: response.strategyPreview?.id
      }
    };

    this.conversationManager.addMessageToConversation(conversation.id, userMessage);
    this.conversationManager.addMessageToConversation(conversation.id, aiMessage);

    return response;
  }

  /**
   * Get conversation history
   */
  getConversationHistory(conversationId: string): ChatMessage[] {
    const conversation = this.conversationManager.getConversation(conversationId);
    return conversation ? conversation.messages : [];
  }

  /**
   * Create new conversation
   */
  createConversation(): string {
    const conversation = this.conversationManager.createConversation();
    return conversation.id;
  }

  /**
   * Delete conversation
   */
  deleteConversation(conversationId: string): void {
    this.conversationManager.deleteConversation(conversationId);
  }

  /**
   * Get all conversations
   */
  getAllConversations() {
    return this.conversationManager.getAllConversations();
  }

  /**
   * Update conversation context
   */
  updateContext(conversationId: string, context: Partial<ConversationContext>): void {
    this.conversationManager.updateConversationContext(conversationId, context);
  }
}