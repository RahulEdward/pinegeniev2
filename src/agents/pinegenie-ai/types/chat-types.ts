/**
 * AI Chat Interface Type Definitions
 */

export interface AIResponse {
  message: string;
  actions?: AIAction[];
  suggestions?: string[];
  needsConfirmation?: boolean;
  strategyPreview?: StrategyPreview;
  metadata?: ResponseMetadata;
}

export interface AIAction {
  id: string;
  type: ActionType;
  label: string;
  description: string;
  payload: Record<string, unknown>;
  primary?: boolean;
  destructive?: boolean;
}

export enum ActionType {
  BUILD_STRATEGY = 'build-strategy',
  MODIFY_STRATEGY = 'modify-strategy',
  OPTIMIZE_PARAMETERS = 'optimize-parameters',
  EXPLAIN_CONCEPT = 'explain-concept',
  SHOW_TEMPLATE = 'show-template',
  ANALYZE_STRATEGY = 'analyze-strategy',
  EXPORT_STRATEGY = 'export-strategy',
  RESET_CONVERSATION = 'reset-conversation',
}

export interface StrategyPreview {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  components: ComponentSummary[];
  estimatedComplexity: 'low' | 'medium' | 'high';
  estimatedTime: number; // in seconds
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ComponentSummary {
  type: string;
  label: string;
  description: string;
  essential: boolean;
}

export interface ResponseMetadata {
  processingTime: number;
  confidence: number;
  sources: string[];
  relatedTopics: string[];
  followUpQuestions: string[];
}

export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

export enum MessageType {
  USER_INPUT = 'user-input',
  AI_RESPONSE = 'ai-response',
  SYSTEM_MESSAGE = 'system-message',
  ERROR_MESSAGE = 'error-message',
  ACTION_RESULT = 'action-result',
}

export interface MessageMetadata {
  processingTime?: number;
  confidence?: number;
  actions?: AIAction[];
  strategyId?: string;
  relatedNodes?: string[];
}

export interface ConversationState {
  id: string;
  messages: ChatMessage[];
  context: ConversationContext;
  isActive: boolean;
  lastActivity: Date;
}

export interface ConversationContext {
  currentStrategy?: string;
  activeNodes: string[];
  userIntent?: string;
  pendingActions: AIAction[];
  preferences: UserChatPreferences;
}

export interface UserChatPreferences {
  verboseExplanations: boolean;
  showAnimations: boolean;
  autoApplyOptimizations: boolean;
  preferredResponseLength: 'short' | 'medium' | 'detailed';
  enableSuggestions: boolean;
}