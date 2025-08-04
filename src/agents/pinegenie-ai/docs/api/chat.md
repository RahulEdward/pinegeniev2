# Chat Interface API

The Chat Interface module provides a conversational UI for interacting with the PineGenie AI system. It handles user input, AI responses, strategy previews, and interactive elements for an intuitive user experience.

## 📋 **Table of Contents**

- [Core Components](#core-components)
- [Hooks](#hooks)
- [Services](#services)
- [Interfaces](#interfaces)
- [Usage Examples](#usage-examples)
- [Customization](#customization)

## 🏗 **Core Components**

### `ChatInterface`

Main chat interface component with message history and input handling.

```typescript
interface ChatInterfaceProps {
  onStrategyGenerated?: (strategy: GeneratedStrategy) => void;
  onError?: (error: ChatError) => void;
  theme?: ChatTheme;
  config?: ChatConfig;
  initialMessages?: ChatMessage[];
  enableAnimations?: boolean;
  enableVoiceInput?: boolean;
  maxMessages?: number;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onStrategyGenerated,
  onError,
  theme,
  config,
  initialMessages = [],
  enableAnimations = true,
  enableVoiceInput = false,
  maxMessages = 100
}) => {
  // Component implementation
};
```

### `MessageBubble`

Individual message component with support for different message types.

```typescript
interface MessageBubbleProps {
  message: ChatMessage;
  isUser: boolean;
  showTimestamp?: boolean;
  showAvatar?: boolean;
  onActionClick?: (action: MessageAction) => void;
  theme?: MessageTheme;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isUser,
  showTimestamp = true,
  showAvatar = true,
  onActionClick,
  theme
}) => {
  // Component implementation
};
```

### `StrategyPreview`

Preview component for AI-generated strategies with interactive elements.

```typescript
interface StrategyPreviewProps {
  strategy: GeneratedStrategy;
  onAccept?: (strategy: GeneratedStrategy) => void;
  onReject?: (strategy: GeneratedStrategy) => void;
  onModify?: (strategy: GeneratedStrategy, modifications: StrategyModification[]) => void;
  showDetails?: boolean;
  enableInteraction?: boolean;
  theme?: PreviewTheme;
}

const StrategyPreview: React.FC<StrategyPreviewProps> = ({
  strategy,
  onAccept,
  onReject,
  onModify,
  showDetails = true,
  enableInteraction = true,
  theme
}) => {
  // Component implementation
};
```

### `ActionButtons`

Interactive action buttons for strategy operations.

```typescript
interface ActionButtonsProps {
  actions: ChatAction[];
  onActionClick: (action: ChatAction) => void;
  disabled?: boolean;
  theme?: ActionTheme;
  layout?: 'horizontal' | 'vertical' | 'grid';
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  actions,
  onActionClick,
  disabled = false,
  theme,
  layout = 'horizontal'
}) => {
  // Component implementation
};
```

## 🎣 **Hooks**

### `useAIChat`

Main hook for AI chat functionality.

```typescript
interface UseAIChatOptions {
  apiEndpoint?: string;
  maxRetries?: number;
  retryDelay?: number;
  enableStreaming?: boolean;
  enableContext?: boolean;
  onError?: (error: ChatError) => void;
  onResponse?: (response: AIResponse) => void;
}

interface UseAIChatReturn {
  // State
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  error: ChatError | null;
  conversationId: string;
  
  // Actions
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  retryLastMessage: () => Promise<void>;
  regenerateResponse: (messageId: string) => Promise<void>;
  
  // Strategy operations
  generateStrategy: (request: StrategyRequest) => Promise<GeneratedStrategy>;
  modifyStrategy: (strategy: GeneratedStrategy, modifications: StrategyModification[]) => Promise<GeneratedStrategy>;
  
  // Conversation management
  saveConversation: () => Promise<string>;
  loadConversation: (conversationId: string) => Promise<void>;
  exportConversation: (format: 'json' | 'markdown' | 'pdf') => Promise<Blob>;
}

const useAIChat = (options?: UseAIChatOptions): UseAIChatReturn => {
  // Hook implementation
};
```

### `useConversation`

Hook for managing conversation state and history.

```typescript
interface UseConversationOptions {
  persistToStorage?: boolean;
  maxHistorySize?: number;
  enableAutoSave?: boolean;
  autoSaveInterval?: number;
}

interface UseConversationReturn {
  // State
  conversation: Conversation;
  history: ConversationHistory[];
  currentIndex: number;
  
  // Navigation
  goToMessage: (messageId: string) => void;
  goToPrevious: () => void;
  goToNext: () => void;
  
  // Management
  addMessage: (message: ChatMessage) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  deleteMessage: (messageId: string) => void;
  
  // Search and filter
  searchMessages: (query: string) => ChatMessage[];
  filterMessages: (filter: MessageFilter) => ChatMessage[];
  
  // Export and import
  exportConversation: () => ConversationExport;
  importConversation: (data: ConversationExport) => void;
}

const useConversation = (options?: UseConversationOptions): UseConversationReturn => {
  // Hook implementation
};
```

### `useTypingIndicator`

Hook for managing typing indicators and animations.

```typescript
interface UseTypingIndicatorOptions {
  duration?: number;
  animationType?: 'dots' | 'pulse' | 'wave';
  showUserTyping?: boolean;
}

interface UseTypingIndicatorReturn {
  isTyping: boolean;
  startTyping: () => void;
  stopTyping: () => void;
  setTypingUser: (userId: string) => void;
  typingUsers: string[];
}

const useTypingIndicator = (options?: UseTypingIndicatorOptions): UseTypingIndicatorReturn => {
  // Hook implementation
};
```

## 🔧 **Services**

### `ResponseGenerator`

Service for generating AI responses and handling different response types.

```typescript
class ResponseGenerator {
  constructor(config?: ResponseConfig);
  
  // Response generation
  async generateResponse(input: string, context?: ConversationContext): Promise<AIResponse>;
  async generateStrategyResponse(request: StrategyRequest): Promise<StrategyResponse>;
  async generateExplanation(topic: string, level: ExplanationLevel): Promise<ExplanationResponse>;
  
  // Response formatting
  formatResponse(response: RawAIResponse): AIResponse;
  formatCodeBlock(code: string, language: string): FormattedCode;
  formatStrategyPreview(strategy: GeneratedStrategy): FormattedPreview;
  
  // Response validation
  validateResponse(response: AIResponse): ValidationResult;
  sanitizeResponse(response: AIResponse): AIResponse;
  
  // Streaming support
  generateStreamingResponse(input: string, onChunk: (chunk: ResponseChunk) => void): Promise<AIResponse>;
  handleStreamingError(error: StreamingError): void;
}
```

### `ConversationManager`

Service for managing conversation state, persistence, and synchronization.

```typescript
class ConversationManager {
  constructor(config?: ConversationConfig);
  
  // Conversation lifecycle
  createConversation(userId: string): Promise<Conversation>;
  loadConversation(conversationId: string): Promise<Conversation>;
  saveConversation(conversation: Conversation): Promise<void>;
  deleteConversation(conversationId: string): Promise<void>;
  
  // Message management
  addMessage(conversationId: string, message: ChatMessage): Promise<void>;
  updateMessage(conversationId: string, messageId: string, updates: Partial<ChatMessage>): Promise<void>;
  deleteMessage(conversationId: string, messageId: string): Promise<void>;
  
  // Context management
  updateContext(conversationId: string, context: ConversationContext): Promise<void>;
  getContext(conversationId: string): Promise<ConversationContext>;
  clearContext(conversationId: string): Promise<void>;
  
  // Search and analytics
  searchConversations(query: string, userId?: string): Promise<Conversation[]>;
  getConversationAnalytics(conversationId: string): Promise<ConversationAnalytics>;
  
  // Export and backup
  exportConversation(conversationId: string, format: ExportFormat): Promise<Blob>;
  backupConversations(userId: string): Promise<Blob>;
  restoreConversations(backup: Blob): Promise<void>;
}
```

## 🔧 **Interfaces**

### Core Types

```typescript
interface ChatMessage {
  id: string;
  content: string;
  type: MessageType;
  sender: MessageSender;
  timestamp: Date;
  metadata: MessageMetadata;
  actions?: MessageAction[];
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
}

interface AIResponse {
  id: string;
  content: string;
  type: ResponseType;
  confidence: number;
  suggestions?: string[];
  strategy?: GeneratedStrategy;
  explanation?: string;
  followUpQuestions?: string[];
  metadata: ResponseMetadata;
}

interface GeneratedStrategy {
  id: string;
  name: string;
  description: string;
  blueprint: StrategyBlueprint;
  preview: StrategyPreview;
  confidence: number;
  explanation: string;
  parameters: StrategyParameters;
  riskAssessment: RiskAssessment;
  alternatives?: GeneratedStrategy[];
}

interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  context: ConversationContext;
  metadata: ConversationMetadata;
  createdAt: Date;
  updatedAt: Date;
}
```

### Configuration Types

```typescript
interface ChatConfig {
  apiEndpoint: string;
  maxMessages: number;
  enableStreaming: boolean;
  enableVoiceInput: boolean;
  enableFileUpload: boolean;
  allowedFileTypes: string[];
  maxFileSize: number;
  retryAttempts: number;
  retryDelay: number;
  typingIndicatorDelay: number;
  autoSaveInterval: number;
}

interface ChatTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      medium: string;
      large: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      bold: number;
    };
  };
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
  borderRadius: string;
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
}
```

### Event Types

```typescript
interface ChatEvents {
  onMessageSent: (message: ChatMessage) => void;
  onMessageReceived: (message: ChatMessage) => void;
  onStrategyGenerated: (strategy: GeneratedStrategy) => void;
  onStrategyAccepted: (strategy: GeneratedStrategy) => void;
  onStrategyRejected: (strategy: GeneratedStrategy) => void;
  onError: (error: ChatError) => void;
  onTypingStart: (userId: string) => void;
  onTypingStop: (userId: string) => void;
  onConversationSaved: (conversationId: string) => void;
  onConversationLoaded: (conversation: Conversation) => void;
}
```

## 💡 **Usage Examples**

### Basic Chat Interface

```typescript
import { ChatInterface, useAIChat } from '@/agents/pinegenie-ai/chat';

const MyTradingAssistant: React.FC = () => {
  const {
    messages,
    isLoading,
    sendMessage,
    generateStrategy,
    clearMessages
  } = useAIChat({
    apiEndpoint: '/api/ai-chat',
    enableStreaming: true,
    enableContext: true
  });

  const handleStrategyGenerated = (strategy: GeneratedStrategy) => {
    console.log('Strategy generated:', strategy);
    
    // Show strategy in builder
    showStrategyInBuilder(strategy);
  };

  const handleError = (error: ChatError) => {
    console.error('Chat error:', error);
    
    // Show user-friendly error message
    showErrorToast(error.message);
  };

  return (
    <div className="trading-assistant">
      <ChatInterface
        onStrategyGenerated={handleStrategyGenerated}
        onError={handleError}
        enableAnimations={true}
        enableVoiceInput={true}
        maxMessages={50}
      />
      
      <div className="chat-controls">
        <button onClick={clearMessages}>Clear Chat</button>
        <button onClick={() => sendMessage("Help me create an RSI strategy")}>
          Quick Start
        </button>
      </div>
    </div>
  );
};
```

### Custom Message Components

```typescript
import { MessageBubble, ChatMessage } from '@/agents/pinegenie-ai/chat';

interface CustomMessageProps {
  message: ChatMessage;
  onActionClick: (action: MessageAction) => void;
}

const CustomMessage: React.FC<CustomMessageProps> = ({ message, onActionClick }) => {
  const renderMessageContent = () => {
    switch (message.type) {
      case 'strategy':
        return (
          <div className="strategy-message">
            <h4>{message.metadata.strategy?.name}</h4>
            <p>{message.content}</p>
            <StrategyPreview 
              strategy={message.metadata.strategy}
              onAccept={(strategy) => onActionClick({ type: 'accept-strategy', data: strategy })}
              onReject={(strategy) => onActionClick({ type: 'reject-strategy', data: strategy })}
            />
          </div>
        );
      
      case 'explanation':
        return (
          <div className="explanation-message">
            <div className="explanation-content">
              {message.content}
            </div>
            {message.metadata.codeExample && (
              <pre className="code-example">
                <code>{message.metadata.codeExample}</code>
              </pre>
            )}
          </div>
        );
      
      default:
        return <p>{message.content}</p>;
    }
  };

  return (
    <MessageBubble
      message={message}
      isUser={message.sender.type === 'user'}
      onActionClick={onActionClick}
      theme={{
        backgroundColor: message.sender.type === 'user' ? '#007bff' : '#f8f9fa',
        textColor: message.sender.type === 'user' ? '#ffffff' : '#333333',
        borderRadius: '12px'
      }}
    >
      {renderMessageContent()}
    </MessageBubble>
  );
};
```

### Advanced Chat with Strategy Building

```typescript
import { useAIChat, useConversation, ConversationManager } from '@/agents/pinegenie-ai/chat';

const AdvancedTradingChat: React.FC = () => {
  const conversationManager = new ConversationManager();
  
  const {
    messages,
    isLoading,
    sendMessage,
    generateStrategy,
    modifyStrategy
  } = useAIChat({
    enableStreaming: true,
    onResponse: (response) => {
      // Log AI responses for analytics
      console.log('AI Response:', response);
    }
  });

  const {
    conversation,
    addMessage,
    searchMessages,
    exportConversation
  } = useConversation({
    persistToStorage: true,
    enableAutoSave: true,
    autoSaveInterval: 30000 // 30 seconds
  });

  const handleComplexStrategyRequest = async (userInput: string) => {
    try {
      // Send initial message
      await sendMessage(userInput);
      
      // Generate strategy with detailed requirements
      const strategy = await generateStrategy({
        description: userInput,
        requirements: {
          riskLevel: 'medium',
          timeframe: '1h',
          indicators: ['RSI', 'MACD'],
          includeRiskManagement: true
        }
      });
      
      // Show strategy preview with modification options
      showStrategyWithModifications(strategy);
      
    } catch (error) {
      console.error('Strategy generation failed:', error);
      handleError(error as ChatError);
    }
  };

  const showStrategyWithModifications = (strategy: GeneratedStrategy) => {
    const modificationOptions = [
      { type: 'change-indicator', label: 'Change Indicators' },
      { type: 'adjust-parameters', label: 'Adjust Parameters' },
      { type: 'modify-risk', label: 'Modify Risk Management' },
      { type: 'change-timeframe', label: 'Change Timeframe' }
    ];

    // Add interactive message with modification options
    addMessage({
      id: generateId(),
      content: `I've created a ${strategy.name} for you. Here's what it does:\n\n${strategy.explanation}`,
      type: 'strategy',
      sender: { type: 'ai', name: 'PineGenie' },
      timestamp: new Date(),
      metadata: { strategy },
      actions: modificationOptions.map(option => ({
        id: option.type,
        label: option.label,
        type: 'button',
        onClick: () => handleStrategyModification(strategy, option.type)
      }))
    });
  };

  const handleStrategyModification = async (strategy: GeneratedStrategy, modificationType: string) => {
    try {
      const modifications = await getModificationDetails(modificationType);
      const modifiedStrategy = await modifyStrategy(strategy, modifications);
      
      // Show updated strategy
      showStrategyWithModifications(modifiedStrategy);
      
    } catch (error) {
      console.error('Strategy modification failed:', error);
    }
  };

  const handleExportConversation = async () => {
    try {
      const exportData = await exportConversation();
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      // Download the conversation
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${conversation.id}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="advanced-trading-chat">
      <div className="chat-header">
        <h2>PineGenie AI Assistant</h2>
        <div className="chat-actions">
          <button onClick={handleExportConversation}>Export Chat</button>
          <button onClick={() => searchMessages('strategy')}>Search Strategies</button>
        </div>
      </div>
      
      <div className="chat-messages">
        {messages.map(message => (
          <CustomMessage
            key={message.id}
            message={message}
            onActionClick={(action) => handleMessageAction(message, action)}
          />
        ))}
      </div>
      
      <div className="chat-input">
        <ChatInput
          onSend={handleComplexStrategyRequest}
          placeholder="Describe the trading strategy you want to create..."
          disabled={isLoading}
          suggestions={[
            "Create an RSI strategy with stop loss",
            "Build a MACD crossover strategy",
            "Make a Bollinger Bands breakout strategy"
          ]}
        />
      </div>
    </div>
  );
};
```

### Voice Input Integration

```typescript
import { useAIChat, VoiceInput } from '@/agents/pinegenie-ai/chat';

const VoiceEnabledChat: React.FC = () => {
  const { sendMessage, isLoading } = useAIChat();
  const [isListening, setIsListening] = useState(false);

  const handleVoiceInput = async (transcript: string) => {
    if (transcript.trim()) {
      await sendMessage(transcript);
    }
  };

  const handleVoiceError = (error: VoiceError) => {
    console.error('Voice input error:', error);
    setIsListening(false);
  };

  return (
    <div className="voice-enabled-chat">
      <ChatInterface
        enableVoiceInput={true}
        onStrategyGenerated={(strategy) => {
          // Announce strategy generation
          speakText(`I've created a ${strategy.name} strategy for you.`);
        }}
      />
      
      <VoiceInput
        onTranscript={handleVoiceInput}
        onError={handleVoiceError}
        onListeningChange={setIsListening}
        language="en-US"
        continuous={false}
        interimResults={true}
      />
      
      <div className="voice-controls">
        <button
          className={`voice-button ${isListening ? 'listening' : ''}`}
          onClick={() => setIsListening(!isListening)}
          disabled={isLoading}
        >
          {isListening ? '🎤 Listening...' : '🎤 Speak'}
        </button>
      </div>
    </div>
  );
};

// Text-to-speech utility
const speakText = (text: string) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    speechSynthesis.speak(utterance);
  }
};
```

## 🎨 **Customization**

### Custom Themes

```typescript
import { ChatTheme } from '@/agents/pinegenie-ai/chat';

const darkTheme: ChatTheme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    background: '#1a1a1a',
    surface: '#2d2d2d',
    text: '#ffffff',
    textSecondary: '#b0b0b0',
    border: '#404040',
    error: '#dc3545',
    success: '#28a745'
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    fontSize: {
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 600
    }
  },
  spacing: {
    small: '0.5rem',
    medium: '1rem',
    large: '1.5rem'
  },
  borderRadius: '8px',
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.3)',
    large: '0 10px 15px rgba(0, 0, 0, 0.3)'
  }
};

// Apply custom theme
<ChatInterface theme={darkTheme} />
```

### Custom Message Types

```typescript
// Register custom message type
const customMessageTypes = {
  'pine-script': {
    component: PineScriptMessage,
    icon: '📊',
    color: '#ff6b35'
  },
  'backtest-result': {
    component: BacktestResultMessage,
    icon: '📈',
    color: '#28a745'
  },
  'risk-warning': {
    component: RiskWarningMessage,
    icon: '⚠️',
    color: '#ffc107'
  }
};

// Custom Pine Script message component
const PineScriptMessage: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.metadata.pineScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pine-script-message">
      <div className="message-header">
        <span className="icon">📊</span>
        <span className="title">Pine Script Generated</span>
      </div>
      
      <pre className="pine-script-code">
        <code>{message.metadata.pineScript}</code>
      </pre>
      
      <div className="message-actions">
        <button onClick={copyToClipboard}>
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
        <button onClick={() => openInTradingView(message.metadata.pineScript)}>
          Open in TradingView
        </button>
      </div>
    </div>
  );
};
```

---

**Next**: [Educational Animations API](./animations.md)  
**Previous**: [AI Builder Integration API](./builder.md)