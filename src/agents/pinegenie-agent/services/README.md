# Services

This directory contains service integrations for the Kiro-Style Pine Script Agent.

## Directory Structure

- **llm/** - LLM service integration (OpenAI, Mistral)
- **database/** - Database service integration (Prisma)

## LLM Services

The LLM services handle:

- Natural language processing
- Code generation
- Conversation management
- Context summarization

### Usage

```typescript
import { LLMService } from './llm/service';

const llmService = new LLMService();
const response = await llmService.generateCompletion({
  prompt: 'Create a strategy that buys when RSI is below 30',
  temperature: 0.7,
  maxTokens: 1000
});
```

### Features

- Multiple model support (GPT-4, Mistral, etc.)
- Fallback mechanisms for service outages
- Request queuing and rate limiting
- Error handling and retry logic
- Response validation and filtering

## Database Services

The database services handle:

- Conversation persistence
- User preference storage
- Generated code versioning
- Progress tracking

### Usage

```typescript
import { ConversationRepository } from './database/conversation-repository';

const repository = new ConversationRepository();
await repository.saveConversation({
  sessionId: 'abc123',
  userId: 'user456',
  messages: [/* message history */],
  context: {/* conversation context */}
});

const conversation = await repository.getConversationBySessionId('abc123');
```

### Features

- Efficient data retrieval
- Proper indexing for performance
- Data retention policies
- Backup and recovery
- Migration support