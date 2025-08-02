/**
 * AI Chat Interface Module
 * 
 * This module provides the conversational interface for interacting
 * with the AI system.
 */

// Main chat interface (to be implemented in task 6)
export { AIChatInterface } from './ai-chat-interface';

// Chat components (to be implemented in task 6)
export { ResponseGenerator } from './services/response-generator';
export { ConversationManager } from './services/conversation-manager';

// React components (to be implemented in task 6)
export { ChatInterface } from './components/ChatInterface';
export { MessageBubble } from './components/MessageBubble';
export { ActionButtons } from './components/ActionButtons';
export { StrategyPreview } from './components/StrategyPreview';

// Hooks (to be implemented in task 6)
export { useAIChat } from './hooks/useAIChat';
export { useConversation } from './hooks/useConversation';

// Types
export type {
  AIResponse,
  ChatMessage,
  AIAction,
  StrategyPreview as StrategyPreviewType
} from '../types/chat-types';