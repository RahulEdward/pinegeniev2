import { 
  ConversationState, 
  ConversationContext, 
  ChatMessage, 
  UserChatPreferences 
} from '../../types/chat-types';

/**
 * Conversation Management Service
 * Handles conversation persistence, context tracking, and state management
 */
export class ConversationManager {
  private static readonly STORAGE_KEY = 'pinegenie-conversations';
  private static readonly MAX_CONVERSATIONS = 10;
  private static readonly MAX_MESSAGES_PER_CONVERSATION = 100;

  /**
   * Create a new conversation
   */
  createConversation(id?: string): ConversationState {
    const conversationId = id || this.generateConversationId();
    
    const conversation: ConversationState = {
      id: conversationId,
      messages: [],
      context: this.createDefaultContext(),
      isActive: true,
      lastActivity: new Date()
    };

    return conversation;
  }

  /**
   * Get conversation by ID
   */
  getConversation(id: string): ConversationState | null {
    const conversations = this.loadConversations();
    return conversations.find(conv => conv.id === id) || null;
  }

  /**
   * Save conversation to storage
   */
  saveConversation(conversation: ConversationState): void {
    const conversations = this.loadConversations();
    const existingIndex = conversations.findIndex(conv => conv.id === conversation.id);

    if (existingIndex >= 0) {
      conversations[existingIndex] = conversation;
    } else {
      conversations.push(conversation);
    }

    // Limit number of conversations
    if (conversations.length > ConversationManager.MAX_CONVERSATIONS) {
      conversations.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
      conversations.splice(ConversationManager.MAX_CONVERSATIONS);
    }

    // Limit messages per conversation
    conversations.forEach(conv => {
      if (conv.messages.length > ConversationManager.MAX_MESSAGES_PER_CONVERSATION) {
        conv.messages = conv.messages.slice(-ConversationManager.MAX_MESSAGES_PER_CONVERSATION);
      }
    });

    this.saveConversations(conversations);
  }

  /**
   * Delete conversation
   */
  deleteConversation(id: string): void {
    const conversations = this.loadConversations();
    const filteredConversations = conversations.filter(conv => conv.id !== id);
    this.saveConversations(filteredConversations);
  }

  /**
   * Get all conversations
   */
  getAllConversations(): ConversationState[] {
    return this.loadConversations();
  }

  /**
   * Get recent conversations
   */
  getRecentConversations(limit: number = 5): ConversationState[] {
    const conversations = this.loadConversations();
    return conversations
      .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
      .slice(0, limit);
  }

  /**
   * Clear all conversations
   */
  clearAllConversations(): void {
    this.saveConversations([]);
  }

  /**
   * Update conversation context
   */
  updateConversationContext(id: string, contextUpdates: Partial<ConversationContext>): void {
    const conversation = this.getConversation(id);
    if (conversation) {
      conversation.context = {
        ...conversation.context,
        ...contextUpdates
      };
      conversation.lastActivity = new Date();
      this.saveConversation(conversation);
    }
  }

  /**
   * Add message to conversation
   */
  addMessageToConversation(conversationId: string, message: ChatMessage): void {
    const conversation = this.getConversation(conversationId);
    if (conversation) {
      conversation.messages.push(message);
      conversation.lastActivity = new Date();
      this.saveConversation(conversation);
    }
  }

  /**
   * Get conversation summary for display
   */
  getConversationSummary(id: string): { title: string; preview: string; messageCount: number } | null {
    const conversation = this.getConversation(id);
    if (!conversation) return null;

    const firstUserMessage = conversation.messages.find(msg => msg.type === 'user-input');
    const title = firstUserMessage ? 
      this.truncateText(firstUserMessage.content, 50) : 
      'New Conversation';

    const lastMessage = conversation.messages[conversation.messages.length - 1];
    const preview = lastMessage ? 
      this.truncateText(lastMessage.content, 100) : 
      'No messages yet';

    return {
      title,
      preview,
      messageCount: conversation.messages.length
    };
  }

  /**
   * Search conversations by content
   */
  searchConversations(query: string): ConversationState[] {
    const conversations = this.loadConversations();
    const lowercaseQuery = query.toLowerCase();

    return conversations.filter(conversation => 
      conversation.messages.some(message => 
        message.content.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  /**
   * Export conversation data
   */
  exportConversation(id: string): string | null {
    const conversation = this.getConversation(id);
    if (!conversation) return null;

    const exportData = {
      id: conversation.id,
      messages: conversation.messages,
      lastActivity: conversation.lastActivity,
      exportedAt: new Date()
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import conversation data
   */
  importConversation(data: string): boolean {
    try {
      const importedData = JSON.parse(data);
      
      if (!importedData.id || !importedData.messages) {
        return false;
      }

      const conversation: ConversationState = {
        id: importedData.id,
        messages: importedData.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })),
        context: this.createDefaultContext(),
        isActive: true,
        lastActivity: new Date(importedData.lastActivity || Date.now())
      };

      this.saveConversation(conversation);
      return true;
    } catch (error) {
      console.error('Error importing conversation:', error);
      return false;
    }
  }

  // Private helper methods

  private generateConversationId(): string {
    return `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private createDefaultContext(): ConversationContext {
    return {
      activeNodes: [],
      pendingActions: [],
      preferences: this.getDefaultPreferences()
    };
  }

  private getDefaultPreferences(): UserChatPreferences {
    return {
      verboseExplanations: true,
      showAnimations: true,
      autoApplyOptimizations: false,
      preferredResponseLength: 'medium',
      enableSuggestions: true
    };
  }

  private loadConversations(): ConversationState[] {
    try {
      if (typeof window === 'undefined') return [];
      
      const stored = localStorage.getItem(ConversationManager.STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      
      // Convert date strings back to Date objects
      return parsed.map((conv: any) => ({
        ...conv,
        lastActivity: new Date(conv.lastActivity),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    }
  }

  private saveConversations(conversations: ConversationState[]): void {
    try {
      if (typeof window === 'undefined') return;
      
      localStorage.setItem(
        ConversationManager.STORAGE_KEY, 
        JSON.stringify(conversations)
      );
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
}