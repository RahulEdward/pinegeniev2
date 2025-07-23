/**
 * Context Manager
 * 
 * Manages conversation context and persistence for the Kiro-Style Pine Script Agent.
 */

import { ConversationRepository } from '../../services/database/conversation-repository';
import type { ConversationContext } from '../../types/agent';

/**
 * Context Manager class that maintains conversation state
 */
export class ContextManager {
  private conversationRepository: ConversationRepository;
  private contextCache: Map<string, ConversationContext>;
  
  /**
   * Creates a new instance of the ContextManager
   */
  constructor() {
    this.conversationRepository = new ConversationRepository();
    this.contextCache = new Map();
  }

  /**
   * Gets the conversation context for a session
   * 
   * @param sessionId - The session ID
   * @returns A promise that resolves to the conversation context or undefined
   */
  public async getContext(sessionId: string): Promise<ConversationContext | undefined> {
    try {
      // Check cache first
      if (this.contextCache.has(sessionId)) {
        return this.contextCache.get(sessionId);
      }
      
      // If not in cache, try to retrieve from database
      const conversation = await this.conversationRepository.getConversationBySessionId(sessionId);
      if (!conversation) {
        return undefined;
      }
      
      // Convert database model to context
      const context: ConversationContext = {
        sessionId: conversation.sessionId,
        userId: conversation.userId,
        conversationHistory: conversation.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.createdAt
        })),
        preferences: conversation.context?.preferences || {
          voiceEnabled: false,
          theme: 'light',
          codePreviewEnabled: true
        },
        progressSteps: conversation.context?.progressSteps || []
      };
      
      // Cache the context
      this.contextCache.set(sessionId, context);
      
      return context;
    } catch (error) {
      console.error('Error getting context:', error);
      throw error;
    }
  }

  /**
   * Updates the conversation context for a session
   * 
   * @param sessionId - The session ID
   * @param context - The conversation context
   * @returns A promise that resolves when the context is updated
   */
  public async updateContext(sessionId: string, context: ConversationContext): Promise<void> {
    try {
      // Update cache
      this.contextCache.set(sessionId, context);
      
      // Persist to database
      await this.persistContext(sessionId);
    } catch (error) {
      console.error('Error updating context:', error);
      throw error;
    }
  }

  /**
   * Persists the conversation context to the database
   * 
   * @param sessionId - The session ID
   * @returns A promise that resolves when the context is persisted
   */
  public async persistContext(sessionId: string): Promise<void> {
    try {
      const context = this.contextCache.get(sessionId);
      if (!context) {
        throw new Error(`Context not found for session ${sessionId}`);
      }
      
      // Save to database
      await this.conversationRepository.saveConversation({
        sessionId: context.sessionId,
        userId: context.userId,
        context: {
          preferences: context.preferences,
          progressSteps: context.progressSteps
        }
      });
    } catch (error) {
      console.error('Error persisting context:', error);
      throw error;
    }
  }

  /**
   * Summarizes the conversation context for efficient storage
   * 
   * @param context - The conversation context
   * @returns A promise that resolves to the summarized context
   */
  public async summarizeContext(context: ConversationContext): Promise<any> {
    try {
      // Implementation will depend on the specific requirements
      // This is a placeholder implementation
      
      // In a real implementation, this would use an LLM to summarize
      // the conversation history and extract key information
      
      return {
        summary: 'Conversation summary would go here',
        keyPoints: [
          'Key point 1',
          'Key point 2',
          'Key point 3'
        ],
        currentTopic: 'Current topic would go here',
        userIntent: 'User intent would go here'
      };
    } catch (error) {
      console.error('Error summarizing context:', error);
      throw error;
    }
  }

  /**
   * Cleans up old contexts from the cache
   */
  public cleanupCache(): void {
    try {
      // Implementation will depend on the specific requirements
      // This is a placeholder implementation
      
      const now = Date.now();
      const maxAge = 30 * 60 * 1000; // 30 minutes
      
      for (const [sessionId, context] of this.contextCache.entries()) {
        const lastMessage = context.conversationHistory[context.conversationHistory.length - 1];
        if (lastMessage && (now - lastMessage.timestamp.getTime() > maxAge)) {
          this.contextCache.delete(sessionId);
        }
      }
    } catch (error) {
      console.error('Error cleaning up cache:', error);
    }
  }
}