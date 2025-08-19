'use client';

import { useState, useCallback, useMemo } from 'react';
import { AIResponse, ConversationContext } from '../../types/chat-types';
import { ResponseGenerator } from '../services/response-generator';

interface UseAIChatReturn {
  sendMessage: (message: string, context?: ConversationContext) => Promise<AIResponse>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Custom hook for AI chat functionality
 * Handles message sending, loading states, and error management
 */
export const useAIChat = (): UseAIChatReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize response generator
  const responseGenerator = useMemo(() => new ResponseGenerator(), []);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Send message to AI and get response
  const sendMessage = useCallback(async (
    message: string, 
    context?: ConversationContext
  ): Promise<AIResponse> => {
    if (!message.trim()) {
      throw new Error('Message cannot be empty');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Process message through AI system
      const response = await responseGenerator.generateResponse(message, context);
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [responseGenerator]);

  return {
    sendMessage,
    isLoading,
    error,
    clearError
  };
};