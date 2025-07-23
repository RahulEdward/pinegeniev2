# Core Logic

This directory contains the core business logic for the Kiro-Style Pine Script Agent.

## Directory Structure

- **agent-handler.ts** - Main agent handler that processes user messages and manages conversation flow
- **pine-generator/** - Pine Script generation engine and template system
- **voice-processor/** - Voice recognition and speech synthesis functionality
- **context-manager/** - Conversation context management and persistence

## Usage

The core modules should be accessed through the main agent handler:

```typescript
import { AgentHandler } from '../core/agent-handler';

const agentHandler = new AgentHandler();
const response = await agentHandler.processMessage('Generate a trend following strategy', context);
```

## Responsibilities

- Processing user messages and generating appropriate responses
- Maintaining conversation context and state
- Generating Pine Script code based on user requirements
- Processing voice input and generating voice responses
- Managing agent hooks and automation

## Integration Points

- Connects with database services for persistence
- Interfaces with LLM services for natural language processing
- Provides data to UI components for rendering
- Consumes configuration from the config directory