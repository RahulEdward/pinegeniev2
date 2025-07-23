# Hooks

This directory contains React hooks for the Kiro-Style Pine Script Agent.

## Directory Structure

- **theme/** - Theme-related hooks
- **voice/** - Voice processing hooks
- **context/** - Conversation context hooks
- **code/** - Code generation and validation hooks

## Theme Hooks

- **useAgentTheme.ts** - Main hook for accessing theme data
- **useThemeChange.ts** - Hook for detecting theme changes
- **useAccessibility.ts** - Hook for accessibility validation

### Usage

```typescript
import { useAgentTheme } from './theme/useAgentTheme';

function MyComponent() {
  const { theme, isLoading, isAccessible } = useAgentTheme();
  
  return (
    <div style={{ color: theme.textPrimary }}>
      {isLoading ? 'Loading...' : 'Theme loaded'}
      {!isAccessible && <div>Accessibility issues detected</div>}
    </div>
  );
}
```

## Voice Hooks

- **useVoiceRecognition.ts** - Hook for speech recognition
- **useVoiceSynthesis.ts** - Hook for text-to-speech
- **useVoiceCommands.ts** - Hook for voice command processing

### Usage

```typescript
import { useVoiceRecognition } from './voice/useVoiceRecognition';

function VoiceInput() {
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    error 
  } = useVoiceRecognition();
  
  return (
    <div>
      <button onClick={isListening ? stopListening : startListening}>
        {isListening ? 'Stop' : 'Start'} Listening
      </button>
      <div>{transcript}</div>
      {error && <div>Error: {error.message}</div>}
    </div>
  );
}
```

## Context Hooks

- **useConversationContext.ts** - Hook for accessing conversation context
- **useProgressTracking.ts** - Hook for tracking multi-step processes
- **useContextPersistence.ts** - Hook for context persistence

### Usage

```typescript
import { useConversationContext } from './context/useConversationContext';

function ConversationView() {
  const { 
    messages, 
    addMessage, 
    currentStrategy, 
    updateStrategy 
  } = useConversationContext();
  
  return (
    <div>
      {messages.map((msg, i) => (
        <div key={i}>{msg.content}</div>
      ))}
      <button onClick={() => addMessage({ role: 'user', content: 'Hello' })}>
        Add Message
      </button>
    </div>
  );
}
```

## Code Hooks

- **useCodeGeneration.ts** - Hook for generating Pine Script code
- **useCodeValidation.ts** - Hook for validating generated code
- **useCodeExport.ts** - Hook for exporting code to different formats

### Usage

```typescript
import { useCodeGeneration } from './code/useCodeGeneration';

function CodeGenerator() {
  const { 
    code, 
    isGenerating, 
    generateCode, 
    error 
  } = useCodeGeneration();
  
  return (
    <div>
      <button 
        onClick={() => generateCode('Create a strategy that buys when RSI is below 30')}
        disabled={isGenerating}
      >
        Generate Code
      </button>
      <pre>{code}</pre>
      {error && <div>Error: {error.message}</div>}
    </div>
  );
}
```