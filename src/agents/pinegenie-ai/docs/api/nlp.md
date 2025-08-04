# Natural Language Processing API

The NLP module provides natural language understanding capabilities for trading strategy requests. It processes user input, extracts trading intents, and identifies relevant parameters.

## 📋 **Table of Contents**

- [Core Classes](#core-classes)
- [Interfaces](#interfaces)
- [Methods](#methods)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)
- [Performance Considerations](#performance-considerations)

## 🏗 **Core Classes**

### `NLPEngine`

Main class for natural language processing operations.

```typescript
class NLPEngine {
  constructor(config?: NLPConfig);
  
  // Core processing methods
  async parseUserInput(input: string): Promise<ParsedRequest>;
  async extractIntent(tokens: Token[]): Promise<TradingIntent>;
  async extractParameters(entities: Entity[]): Promise<StrategyParameters>;
  async validateInput(input: string): Promise<ValidationResult>;
  
  // Context management
  setContext(context: ConversationContext): void;
  getContext(): ConversationContext;
  clearContext(): void;
  
  // Configuration
  updateConfig(config: Partial<NLPConfig>): void;
  getConfig(): NLPConfig;
}
```

### `Tokenizer`

Handles text tokenization and vocabulary management.

```typescript
class Tokenizer {
  constructor(vocabulary?: TradingVocabulary);
  
  // Tokenization methods
  tokenize(text: string): Token[];
  classifyTokens(tokens: Token[]): ClassifiedToken[];
  
  // Vocabulary management
  addVocabulary(terms: VocabularyEntry[]): void;
  updateSynonyms(synonyms: SynonymMap): void;
  
  // Utility methods
  normalizeText(text: string): string;
  detectLanguage(text: string): string;
}
```

### `IntentExtractor`

Extracts trading intents from tokenized input.

```typescript
class IntentExtractor {
  constructor(patterns?: IntentPattern[]);
  
  // Intent extraction
  extractIntent(tokens: Token[]): Promise<TradingIntent>;
  calculateConfidence(intent: TradingIntent, tokens: Token[]): number;
  
  // Pattern management
  addPattern(pattern: IntentPattern): void;
  removePattern(patternId: string): void;
  updatePattern(patternId: string, pattern: Partial<IntentPattern>): void;
}
```

### `ParameterExtractor`

Extracts and validates trading parameters from entities.

```typescript
class ParameterExtractor {
  constructor(validators?: ParameterValidator[]);
  
  // Parameter extraction
  extractParameters(entities: Entity[]): Promise<StrategyParameters>;
  validateParameters(params: StrategyParameters): ValidationResult;
  
  // Default value management
  getDefaultParameters(strategyType: StrategyType): StrategyParameters;
  suggestParameters(intent: TradingIntent): ParameterSuggestion[];
}
```

### `ContextEngine`

Manages conversation context and history.

```typescript
class ContextEngine {
  constructor(config?: ContextConfig);
  
  // Context management
  addMessage(message: ConversationMessage): void;
  getContext(): ConversationContext;
  updateContext(updates: Partial<ConversationContext>): void;
  clearContext(): void;
  
  // Reference resolution
  resolveReferences(input: string, context: ConversationContext): string;
  trackEntities(entities: Entity[]): void;
  
  // History management
  getHistory(limit?: number): ConversationMessage[];
  searchHistory(query: string): ConversationMessage[];
}
```

## 🔧 **Interfaces**

### Core Types

```typescript
interface ParsedRequest {
  originalText: string;
  tokens: Token[];
  entities: Entity[];
  confidence: number;
  language?: string;
  timestamp: number;
}

interface Token {
  text: string;
  type: TokenType;
  position: number;
  confidence: number;
  normalized?: string;
}

interface Entity {
  text: string;
  type: EntityType;
  value: any;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

interface TradingIntent {
  strategyType: StrategyType;
  indicators: string[];
  conditions: string[];
  actions: string[];
  riskManagement: string[];
  timeframe?: string;
  confidence: number;
}

interface StrategyParameters {
  [key: string]: {
    value: any;
    type: ParameterType;
    confidence: number;
    source: 'extracted' | 'default' | 'inferred';
  };
}
```

### Configuration Types

```typescript
interface NLPConfig {
  confidenceThreshold: number;
  maxTokens: number;
  enableContextTracking: boolean;
  enableParameterValidation: boolean;
  language: string;
  customVocabulary?: TradingVocabulary;
  debugMode?: boolean;
}

interface TradingVocabulary {
  indicators: VocabularyEntry[];
  actions: VocabularyEntry[];
  conditions: VocabularyEntry[];
  parameters: VocabularyEntry[];
  synonyms: SynonymMap;
}

interface VocabularyEntry {
  term: string;
  category: string;
  synonyms: string[];
  weight: number;
  context?: string[];
}
```

### Validation Types

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

interface ValidationError {
  type: 'syntax' | 'semantic' | 'parameter' | 'context';
  message: string;
  position?: number;
  severity: 'error' | 'warning' | 'info';
}
```

## 📖 **Methods**

### `parseUserInput(input: string): Promise<ParsedRequest>`

Processes raw user input and returns structured data.

**Parameters:**
- `input` (string): Raw user input text

**Returns:**
- `Promise<ParsedRequest>`: Parsed and structured request data

**Example:**
```typescript
const nlp = new NLPEngine();
const result = await nlp.parseUserInput(
  "Create an RSI strategy that buys when RSI is below 30"
);

console.log(result.tokens); // Array of tokens
console.log(result.entities); // Extracted entities
console.log(result.confidence); // Overall confidence score
```

### `extractIntent(tokens: Token[]): Promise<TradingIntent>`

Extracts trading intent from tokenized input.

**Parameters:**
- `tokens` (Token[]): Array of classified tokens

**Returns:**
- `Promise<TradingIntent>`: Identified trading intent with confidence

**Example:**
```typescript
const intent = await nlp.extractIntent(parsedResult.tokens);

console.log(intent.strategyType); // 'mean-reversion'
console.log(intent.indicators); // ['rsi']
console.log(intent.conditions); // ['less_than']
console.log(intent.actions); // ['buy']
```

### `extractParameters(entities: Entity[]): Promise<StrategyParameters>`

Extracts and validates strategy parameters from entities.

**Parameters:**
- `entities` (Entity[]): Array of extracted entities

**Returns:**
- `Promise<StrategyParameters>`: Validated strategy parameters

**Example:**
```typescript
const params = await nlp.extractParameters(parsedResult.entities);

console.log(params.rsiPeriod); // { value: 14, type: 'number', confidence: 0.8 }
console.log(params.threshold); // { value: 30, type: 'number', confidence: 0.9 }
```

### `validateInput(input: string): Promise<ValidationResult>`

Validates user input for common issues and provides suggestions.

**Parameters:**
- `input` (string): User input to validate

**Returns:**
- `Promise<ValidationResult>`: Validation results with errors and suggestions

**Example:**
```typescript
const validation = await nlp.validateInput("Create strategy with RSI > 150");

console.log(validation.valid); // false
console.log(validation.errors); // [{ type: 'parameter', message: 'RSI value must be between 0-100' }]
console.log(validation.suggestions); // ['Did you mean RSI > 70?']
```

## 💡 **Usage Examples**

### Basic Usage

```typescript
import { NLPEngine } from '@/agents/pinegenie-ai/nlp';

// Initialize with default configuration
const nlp = new NLPEngine();

// Process user input
async function processUserRequest(userInput: string) {
  try {
    // Parse the input
    const parsed = await nlp.parseUserInput(userInput);
    
    // Extract intent
    const intent = await nlp.extractIntent(parsed.tokens);
    
    // Extract parameters
    const parameters = await nlp.extractParameters(parsed.entities);
    
    return {
      intent,
      parameters,
      confidence: parsed.confidence
    };
  } catch (error) {
    console.error('NLP processing failed:', error);
    throw error;
  }
}

// Usage
const result = await processUserRequest(
  "Create a MACD crossover strategy with 12, 26, 9 periods"
);
```

### Advanced Configuration

```typescript
import { NLPEngine, TradingVocabulary } from '@/agents/pinegenie-ai/nlp';

// Custom vocabulary
const customVocabulary: TradingVocabulary = {
  indicators: [
    { term: 'rsi', category: 'momentum', synonyms: ['relative strength'], weight: 1.0 },
    { term: 'macd', category: 'trend', synonyms: ['moving average convergence'], weight: 1.0 }
  ],
  actions: [
    { term: 'buy', category: 'entry', synonyms: ['long', 'purchase'], weight: 1.0 },
    { term: 'sell', category: 'exit', synonyms: ['short', 'close'], weight: 1.0 }
  ],
  conditions: [
    { term: 'above', category: 'comparison', synonyms: ['greater than', '>'], weight: 1.0 },
    { term: 'below', category: 'comparison', synonyms: ['less than', '<'], weight: 1.0 }
  ],
  parameters: [],
  synonyms: new Map([
    ['rsi', ['relative strength index', 'momentum oscillator']],
    ['macd', ['moving average convergence divergence']]
  ])
};

// Initialize with custom configuration
const nlp = new NLPEngine({
  confidenceThreshold: 0.8,
  maxTokens: 500,
  enableContextTracking: true,
  enableParameterValidation: true,
  language: 'en',
  customVocabulary,
  debugMode: true
});
```

### Context-Aware Processing

```typescript
import { NLPEngine, ConversationContext } from '@/agents/pinegenie-ai/nlp';

const nlp = new NLPEngine({ enableContextTracking: true });

// Set initial context
nlp.setContext({
  userId: 'user123',
  sessionId: 'session456',
  currentStrategy: 'rsi-strategy',
  entities: new Map(),
  history: []
});

// First request
const result1 = await nlp.parseUserInput("Create an RSI strategy");

// Follow-up request (context-aware)
const result2 = await nlp.parseUserInput("Change the period to 21");
// The NLP engine understands this refers to the RSI period from context
```

### Batch Processing

```typescript
import { NLPEngine } from '@/agents/pinegenie-ai/nlp';

const nlp = new NLPEngine();

async function processBatch(inputs: string[]) {
  const results = await Promise.all(
    inputs.map(async (input) => {
      try {
        const parsed = await nlp.parseUserInput(input);
        const intent = await nlp.extractIntent(parsed.tokens);
        const parameters = await nlp.extractParameters(parsed.entities);
        
        return {
          input,
          success: true,
          intent,
          parameters,
          confidence: parsed.confidence
        };
      } catch (error) {
        return {
          input,
          success: false,
          error: error.message
        };
      }
    })
  );
  
  return results;
}

// Usage
const inputs = [
  "Create RSI strategy with buy below 30",
  "Build MACD crossover with default settings",
  "Make a Bollinger Bands breakout strategy"
];

const results = await processBatch(inputs);
```

## ⚠️ **Error Handling**

### Common Errors

```typescript
// Input validation errors
try {
  await nlp.parseUserInput("");
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation failed:', error.message);
    console.log('Suggestions:', error.suggestions);
  }
}

// Low confidence errors
try {
  const result = await nlp.parseUserInput("asdfgh random text");
} catch (error) {
  if (error instanceof LowConfidenceError) {
    console.log('Could not understand input');
    console.log('Confidence:', error.confidence);
    console.log('Suggestions:', error.suggestions);
  }
}

// Parameter extraction errors
try {
  const params = await nlp.extractParameters(entities);
} catch (error) {
  if (error instanceof ParameterError) {
    console.log('Parameter extraction failed:', error.message);
    console.log('Invalid parameters:', error.invalidParams);
  }
}
```

### Error Types

```typescript
class ValidationError extends Error {
  constructor(
    message: string,
    public suggestions: string[] = [],
    public errorType: string = 'validation'
  ) {
    super(message);
  }
}

class LowConfidenceError extends Error {
  constructor(
    message: string,
    public confidence: number,
    public suggestions: string[] = []
  ) {
    super(message);
  }
}

class ParameterError extends Error {
  constructor(
    message: string,
    public invalidParams: string[] = [],
    public suggestions: string[] = []
  ) {
    super(message);
  }
}
```

## ⚡ **Performance Considerations**

### Optimization Tips

1. **Caching**: Enable caching for frequently used patterns
```typescript
const nlp = new NLPEngine({
  enableCaching: true,
  cacheSize: 1000,
  cacheTTL: 3600 // 1 hour
});
```

2. **Batch Processing**: Process multiple inputs together
```typescript
const results = await nlp.processBatch(inputs);
```

3. **Context Reuse**: Reuse context for related requests
```typescript
nlp.setContext(existingContext);
```

4. **Confidence Thresholds**: Adjust thresholds based on use case
```typescript
nlp.updateConfig({ confidenceThreshold: 0.7 }); // Lower for more permissive
```

### Performance Metrics

```typescript
// Monitor performance
const startTime = performance.now();
const result = await nlp.parseUserInput(input);
const processingTime = performance.now() - startTime;

console.log(`Processing took ${processingTime}ms`);
console.log(`Confidence: ${result.confidence}`);
console.log(`Tokens processed: ${result.tokens.length}`);
```

### Memory Management

```typescript
// Clear context periodically
if (nlp.getContext().history.length > 100) {
  nlp.clearContext();
}

// Limit token processing
const nlp = new NLPEngine({
  maxTokens: 200 // Limit for performance
});
```

---

**Next**: [Strategy Interpreter API](./interpreter.md)  
**Previous**: [Main Documentation](../README.md)