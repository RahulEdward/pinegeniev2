# Types

This directory contains TypeScript type definitions for the Kiro-Style Pine Script Agent.

## Files

- **agent.ts** - Agent-related types
- **conversation.ts** - Conversation and message types
- **pine-script.ts** - Pine Script and strategy types
- **theme.ts** - Theme and color types
- **voice.ts** - Voice processing types

## Usage

```typescript
import { AgentResponse, ConversationContext } from './agent';
import { Message, Conversation } from './conversation';
import { GeneratedCode, StrategyTemplate } from './pine-script';
import { AgentTheme, ThemeChangeEvent } from './theme';
import { VoiceCommand, SpeechRecognitionResult } from './voice';

// Example usage
function processAgentResponse(response: AgentResponse): void {
  if (response.code) {
    displayCode(response.code);
  }
  
  if (response.voiceResponse) {
    playAudio(response.voiceResponse);
  }
  
  displayMessage({
    role: 'agent',
    content: response.message,
    timestamp: new Date()
  });
}
```

## Key Type Definitions

### Agent Types

```typescript
interface AgentResponse {
  message: string;
  code?: GeneratedCode;
  suggestions: string[];
  nextSteps: string[];
  requiresInput: boolean;
  voiceResponse?: AudioBuffer;
}

interface ConversationContext {
  sessionId: string;
  userId: string;
  conversationHistory: Message[];
  currentStrategy?: PartialStrategy;
  preferences: UserPreferences;
  progressSteps: ProgressStep[];
}
```

### Pine Script Types

```typescript
interface GeneratedCode {
  code: string;
  explanation: string;
  indicators: IndicatorInfo[];
  riskManagement: RiskControls;
  confidence: number;
  suggestions: string[];
}

interface StrategyTemplate {
  id: string;
  name: string;
  category: 'trend-following' | 'mean-reversion' | 'breakout' | 'scalping';
  codeTemplate: string;
  parameters: TemplateParameter[];
  description: string;
}
```

### Theme Types

```typescript
interface AgentTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  chat: {
    userBubble: string;
    agentBubble: string;
  };
}
```

## Type Safety

All types are designed to ensure type safety throughout the application:

- Strict null checking
- Discriminated unions where appropriate
- Readonly properties for immutable data
- Generic types for reusable components
- Proper indexing for object access