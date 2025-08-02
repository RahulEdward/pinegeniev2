---
inclusion: manual
contextKey: chat-development
---

# Chat and Agent Development Guidelines

## Overview
This document provides specific guidelines for developing chat and agent features while protecting the existing PineGenie drag-and-drop builder functionality.

## Integration Strategy

### 1. Isolated Development Approach
**Principle**: New chat features should be developed in isolation from the core builder system.

#### Recommended Structure:
```
src/agents/pinegenie-agent/
├── components/           # New chat UI components
│   ├── ChatInterface.tsx
│   ├── MessageBubble.tsx
│   ├── AgentControls.tsx
│   └── VoiceInterface.tsx
├── services/            # Chat-specific services
│   ├── chat-service.ts
│   ├── voice-service.ts
│   └── context-manager.ts
├── hooks/               # Chat-specific hooks
│   ├── useChat.ts
│   ├── useVoice.ts
│   └── useAgentContext.ts
└── utils/               # Chat utilities
    ├── message-parser.ts
    ├── voice-processor.ts
    └── context-utils.ts
```

### 2. Safe Integration Points

#### Template System Integration:
```typescript
// ✅ SAFE: Use existing template system
import { templateManager } from '../core/pine-generator/templates';

// Generate code using existing templates
const generateFromTemplate = (templateId: string, params: Record<string, any>) => {
  return templateManager.generateCode(templateId, params);
};
```

#### Theme System Integration:
```typescript
// ✅ SAFE: Use existing theme system
import { useTheme } from '../components/ThemeConsistencyProvider';

const ChatComponent = () => {
  const { colors, isDark } = useTheme();
  
  return (
    <div className={`${colors.bg.glass} ${colors.border.primary}`}>
      {/* Chat content */}
    </div>
  );
};
```

#### Builder State Integration (READ-ONLY):
```typescript
// ✅ SAFE: Read builder state, don't modify
import useBuilderStore from '../../app/builder/builder-state';

const ChatComponent = () => {
  const { nodes, edges } = useBuilderStore();
  
  // Use for context, but don't modify
  const currentStrategy = { nodes, edges };
  
  return (
    <div>
      {/* Display strategy info in chat */}
    </div>
  );
};
```

### 3. Forbidden Modifications

#### ❌ DO NOT MODIFY:
- `src/app/builder/` - Entire builder system
- `src/agents/pinegenie-agent/core/pine-generator/templates.ts` - Template definitions
- Builder state management logic
- Existing node types and configurations
- Pine Script generation core logic

#### ❌ DO NOT BREAK:
- Drag-and-drop functionality
- Node connection system
- Canvas controls (zoom, pan, background)
- Theme consistency
- Strategy save/load functionality

## Chat Feature Development

### 1. Chat Interface Guidelines

#### Component Structure:
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    templateUsed?: string;
    codeGenerated?: boolean;
    strategyModified?: boolean;
  };
}

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  currentContext: StrategyContext;
  voiceEnabled: boolean;
}
```

#### Safe Chat Actions:
```typescript
// ✅ SAFE: Generate new strategies using templates
const generateStrategyFromChat = async (userInput: string) => {
  // Parse user intent
  const intent = parseUserIntent(userInput);
  
  // Use existing template system
  const template = templateManager.searchTemplates({
    query: intent.strategy
  })[0];
  
  if (template) {
    return templateManager.generateCode(template.id, intent.parameters);
  }
};

// ✅ SAFE: Provide strategy suggestions
const suggestImprovements = (currentNodes: BuilderNode[]) => {
  // Analyze current strategy (read-only)
  // Suggest improvements using template system
  // Don't modify existing nodes
};
```

### 2. Voice Integration Guidelines

#### Voice Processing:
```typescript
// ✅ SAFE: Voice processing in isolation
class VoiceProcessor {
  private speechRecognition: SpeechRecognition;
  private speechSynthesis: SpeechSynthesis;
  
  async processVoiceInput(audio: AudioBuffer): Promise<string> {
    // Process voice input
    // Return text for chat processing
  }
  
  async generateVoiceResponse(text: string): Promise<AudioBuffer> {
    // Generate voice response
    // Don't interfere with builder functionality
  }
}
```

### 3. Context Management

#### Strategy Context:
```typescript
interface StrategyContext {
  currentNodes: BuilderNode[];
  currentEdges: BuilderEdge[];
  lastModified: Date;
  userPreferences: UserPreferences;
  conversationHistory: ChatMessage[];
}

// ✅ SAFE: Context management without modification
class ContextManager {
  getStrategyContext(): StrategyContext {
    const builderState = useBuilderStore.getState();
    return {
      currentNodes: [...builderState.nodes], // Copy, don't reference
      currentEdges: [...builderState.edges], // Copy, don't reference
      lastModified: new Date(),
      userPreferences: getUserPreferences(),
      conversationHistory: getChatHistory()
    };
  }
  
  // Don't modify builder state directly
  suggestStrategyChanges(context: StrategyContext): StrategySuggestion[] {
    // Analyze and suggest, don't modify
  }
}
```

## API Integration

### 1. Chat API Endpoints

#### Safe API Structure:
```typescript
// src/app/api/ai-chat/route.ts
export async function POST(request: Request) {
  const { message, context } = await request.json();
  
  // Process chat message
  // Use existing template system
  // Don't modify builder state
  
  return Response.json({
    response: agentResponse,
    codeGenerated: generatedCode,
    suggestions: strategySuggestions
  });
}
```

### 2. Database Integration

#### Safe Database Operations:
```sql
-- ✅ SAFE: Add new tables for chat
CREATE TABLE agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(255),
  context JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES agent_conversations(id),
  role VARCHAR(50),
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Testing Requirements

### 1. Isolation Testing
```typescript
// Test chat features in isolation
describe('Chat System', () => {
  test('should not affect builder state', () => {
    const initialBuilderState = useBuilderStore.getState();
    
    // Perform chat operations
    processChatMessage('Generate RSI strategy');
    
    const finalBuilderState = useBuilderStore.getState();
    expect(finalBuilderState).toEqual(initialBuilderState);
  });
});
```

### 2. Integration Testing
```typescript
// Test safe integration points
describe('Chat-Builder Integration', () => {
  test('should read builder state safely', () => {
    // Add nodes to builder
    const builderStore = useBuilderStore.getState();
    builderStore.addNode(mockNode);
    
    // Chat should read state correctly
    const context = contextManager.getStrategyContext();
    expect(context.currentNodes).toHaveLength(1);
  });
});
```

## Performance Considerations

### 1. Memory Management
- Don't hold references to builder state
- Clean up voice processing resources
- Manage chat history size
- Use efficient context serialization

### 2. Real-time Updates
- Use WebSockets for real-time chat
- Implement efficient message queuing
- Handle voice processing asynchronously
- Optimize template search performance

## Error Handling

### 1. Graceful Degradation
```typescript
// Handle errors without breaking builder
const safeChatOperation = async (operation: () => Promise<any>) => {
  try {
    return await operation();
  } catch (error) {
    console.error('Chat operation failed:', error);
    // Don't break builder functionality
    return { error: 'Chat temporarily unavailable' };
  }
};
```

### 2. Fallback Mechanisms
- Voice input falls back to text
- AI service failures don't break builder
- Template generation has fallbacks
- Context recovery mechanisms

## Deployment Strategy

### 1. Feature Flags
```typescript
// Use feature flags for gradual rollout
const CHAT_FEATURES = {
  voiceInput: process.env.ENABLE_VOICE === 'true',
  aiGeneration: process.env.ENABLE_AI === 'true',
  realTimeChat: process.env.ENABLE_REALTIME === 'true'
};
```

### 2. Monitoring
- Chat response times
- Voice processing accuracy
- Template generation success rates
- Builder performance impact
- User engagement metrics

## Best Practices Summary

### ✅ DO:
- Develop chat features in isolation
- Use existing template system
- Maintain theme consistency
- Read builder state (don't modify)
- Add new database tables safely
- Test thoroughly before deployment
- Use feature flags for rollout
- Monitor performance impact

### ❌ DON'T:
- Modify builder core functionality
- Break existing node system
- Change template definitions
- Interfere with canvas controls
- Modify database schema unsafely
- Skip testing existing features
- Deploy without validation
- Ignore performance impact

## Conclusion

Following these guidelines ensures that new chat and agent features enhance PineGenie without compromising its core drag-and-drop builder functionality. The key is isolation, safe integration, and thorough testing.

Remember: The visual builder is PineGenie's core value proposition. Protect it at all costs while adding innovative chat features that complement and enhance the user experience.