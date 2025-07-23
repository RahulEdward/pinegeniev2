# Context Manager

This directory contains the conversation context management functionality for the Kiro-Style Pine Script Agent.

## Components

- **manager.ts** - Main context manager class that maintains conversation state
- **persistence/** - Database integration for context persistence
- **summarization/** - Context summarization for long conversations
- **retrieval/** - Efficient context retrieval and search

## Usage

```typescript
import { ContextManager } from './manager';

const manager = new ContextManager();

// Initialize or retrieve context
const context = await manager.getContext(sessionId);

// Update context with new information
await manager.updateContext(sessionId, {
  currentStrategy: { name: 'RSI Strategy', timeframe: '1h' },
  progressStep: 'code_generation'
});

// Save context to database
await manager.persistContext(sessionId);
```

## Features

- **Persistent Context** - Maintains state across user sessions
- **Conversation History** - Tracks message history for reference
- **Progress Tracking** - Monitors multi-step processes
- **User Preferences** - Stores and retrieves user preferences
- **Context Summarization** - Efficiently handles long conversations

## Integration

The context manager integrates with:

- Database services for persistence
- LLM services for context summarization
- Agent handler for conversation management
- UI components for progress display