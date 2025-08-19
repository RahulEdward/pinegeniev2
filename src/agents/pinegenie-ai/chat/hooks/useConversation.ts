'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { ChatMessage, ConversationContext, ConversationState, UserChatPreferences } from '../../types/chat-types';
import { ConversationManager } from '../services/conversation-manager';

interface UseConversationReturn {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  removeMessage: (messageId: string) => void;
  clearMessages: () => void;
  getConversationContext: () => ConversationContext;
  updateContext: (updates: Partial<ConversationContext>) => void;
  conversationId: string;
  isActive: boolean;
}

/**
 * Custom hook for conversation management
 * Handles message history, context tracking, and conversation state
 */
export const useConversation = (initialConversationId?: string): UseConversationReturn => {
  const [conversationState, setConversationState] = useState<ConversationState>(() => {
    const conversationManager = new ConversationManager();
    return conversationManager.createConversation(initialConversationId);
  });

  const conversationManager = useMemo(() => new ConversationManager(), []);

  // Load conversation from storage on mount
  useEffect(() => {
    if (initialConversationId) {
      const existingConversation = conversationManager.getConversation(initialConversationId);
      if (existingConversation) {
        setConversationState(existingConversation);
      }
    }
  }, [initialConversationId, conversationManager]);

  // Save conversation state changes
  useEffect(() => {
    conversationManager.saveConversation(conversationState);
  }, [conversationState, conversationManager]);

  // Add message to conversation
  const addMessage = useCallback((message: ChatMessage) => {
    setConversationState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
      lastActivity: new Date()
    }));
  }, []);

  // Remove message from conversation
  const removeMessage = useCallback((messageId: string) => {
    setConversationState(prev => ({
      ...prev,
      messages: prev.messages.filter(msg => msg.id !== messageId),
      lastActivity: new Date()
    }));
  }, []);

  // Clear all messages
  const clearMessages = useCallback(() => {
    setConversationState(prev => ({
      ...prev,
      messages: [],
      context: {
        ...prev.context,
        currentStrategy: undefined,
        activeNodes: [],
        userIntent: undefined,
        pendingActions: []
      },
      lastActivity: new Date()
    }));
  }, []);

  // Get current conversation context
  const getConversationContext = useCallback((): ConversationContext => {
    return conversationState.context;
  }, [conversationState.context]);

  // Update conversation context
  const updateContext = useCallback((updates: Partial<ConversationContext>) => {
    setConversationState(prev => ({
      ...prev,
      context: {
        ...prev.context,
        ...updates
      },
      lastActivity: new Date()
    }));
  }, []);

  return {
    messages: conversationState.messages,
    addMessage,
    removeMessage,
    clearMessages,
    getConversationContext,
    updateContext,
    conversationId: conversationState.id,
    isActive: conversationState.isActive
  };
};