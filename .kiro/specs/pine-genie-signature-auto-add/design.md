# Pine Genie Signature Auto Add Feature - Design Document

## Overview

The Pine Genie Signature Auto Add feature will provide a comprehensive signature system that automatically adds professional branding and attribution to all generated Pine Script code. The system will be designed as a modular service that integrates with existing code generation systems without disrupting their core functionality.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Pine Genie Application                   │
├─────────────────────────────────────────────────────────────┤
│  Template System  │  Visual Builder  │  AI Chat System     │
│                   │                  │                     │
│  ┌─────────────┐  │  ┌─────────────┐ │  ┌─────────────┐    │
│  │   Template  │  │  │  Enhanced   │ │  │ LLM Service │    │
│  │  Generator  │  │  │ Pine Script │ │  │             │    │
│  │             │  │  │  Generator  │ │  │             │    │
│  └─────────────┘  │  └─────────────┘ │  └─────────────┘    │
│         │         │         │        │         │           │
└─────────┼─────────┼─────────┼────────┼─────────┼───────────┘
          │         │         │        │         │
          └─────────┼─────────┼────────┼─────────┘
                    │         │        │
          ┌─────────▼─────────▼────────▼─────────┐
          │        Signature Service             │
          │                                     │
          │  ┌─────────────────────────────────┐ │
          │  │     Signature Manager          │ │
          │  │  - Template Management         │ │
          │  │  - Dynamic Content Resolution  │ │
          │  │  - Format Selection            │ │
          │  └─────────────────────────────────┘ │
          │                                     │
          │  ┌─────────────────────────────────┐ │
          │  │   Configuration Service        │ │
          │  │  - User Preferences            │ │
          │  │  - Signature Templates         │ │
          │  │  - Format Definitions          │ │
          │  └─────────────────────────────────┘ │
          │                                     │
          │  ┌─────────────────────────────────┐ │
          │  │    Integration Layer           │ │
          │  │  - Code Injection              │ │
          │  │  - Format Validation           │ │
          │  │  - Performance Optimization    │ │
          │  └─────────────────────────────────┘ │
          └─────────────────────────────────────┘
```

### Service Layer Design

The signature system will be implemented as a standalone service that can be injected into any code generation pipeline:

```typescript
interface SignatureService {
  addSignature(code: string, context: GenerationContext): Promise<string>;
  getSignatureTemplate(type: SignatureType): SignatureTemplate;
  updateUserPreferences(userId: string, preferences: SignaturePreferences): Promise<void>;
  validateSignature(signature: string): ValidationResult;
}
```

## Components and Interfaces

### 1. Signature Manager

**Purpose**: Core service responsible for signature generation and injection.

**Key Interfaces**:

```typescript
interface SignatureManager {
  generateSignature(context: GenerationContext): Promise<string>;
  injectSignature(code: string, signature: string, position: SignaturePosition): string;
  resolveVariables(template: string, context: GenerationContext): string;
}

interface GenerationContext {
  type: 'template' | 'builder' | 'ai-chat';
  userId?: string;
  strategyName?: string;
  templateId?: string;
  timestamp: Date;
  version: string;
  metadata?: Record<string, any>;
}

interface SignatureTemplate {
  id: string;
  name: string;
  type: SignatureType;
  template: string;
  variables: SignatureVariable[];
  position: SignaturePosition;
  enabled: boolean;
}
```

### 2. Configuration Service

**Purpose**: Manages signature templates, user preferences, and system configuration.

**Key Interfaces**:

```typescript
interface ConfigurationService {
  getSignatureTemplate(type: SignatureType): Promise<SignatureTemplate>;
  getUserPreferences(userId: string): Promise<SignaturePreferences>;
  updateSignatureTemplate(template: SignatureTemplate): Promise<void>;
  getSystemDefaults(): SignatureDefaults;
}

interface SignaturePreferences {
  enabled: boolean;
  verbosityLevel: 'minimal' | 'standard' | 'detailed';
  customBranding?: string;
  includeTimestamp: boolean;
  includeMetadata: boolean;
  position: SignaturePosition;
}

enum SignatureType {
  TEMPLATE = 'template',
  BUILDER = 'builder',
  AI_CHAT = 'ai-chat',
  CUSTOM = 'custom'
}

enum SignaturePosition {
  TOP = 'top',
  BOTTOM = 'bottom',
  AFTER_VERSION = 'after-version'
}
```

### 3. Template System

**Purpose**: Manages signature templates with variable substitution and formatting.

**Default Templates**:

```typescript
const DEFAULT_TEMPLATES: Record<SignatureType, SignatureTemplate> = {
  [SignatureType.TEMPLATE]: {
    id: 'template-default',
    name: 'Template Generated Script',
    type: SignatureType.TEMPLATE,
    template: `// ═══════════════════════════════════════════════════════════════════════════════
// 🌲 Pine Genie - Professional Pine Script Generator
// ═══════════════════════════════════════════════════════════════════════════════
// 
// Generated by: Pine Genie Template System
// Template: {{templateName}}
// Generated: {{timestamp}}
// Version: {{version}}
// Website: https://pinegenie.com
// 
// ⚡ Powered by Pine Genie - The Ultimate Pine Script Generator
// 📈 Create professional trading strategies with zero coding experience
// 
// ═══════════════════════════════════════════════════════════════════════════════`,
    variables: [
      { name: 'templateName', type: 'string', required: true },
      { name: 'timestamp', type: 'datetime', required: true },
      { name: 'version', type: 'string', required: true }
    ],
    position: SignaturePosition.TOP,
    enabled: true
  },
  
  [SignatureType.BUILDER]: {
    id: 'builder-default',
    name: 'Visual Builder Generated Script',
    type: SignatureType.BUILDER,
    template: `// ═══════════════════════════════════════════════════════════════════════════════
// 🌲 Pine Genie - Visual Strategy Builder
// ═══════════════════════════════════════════════════════════════════════════════
// 
// Generated by: Pine Genie Visual Builder
// Strategy: {{strategyName}}
// Nodes: {{nodeCount}}
// Generated: {{timestamp}}
// Version: {{version}}
// Website: https://pinegenie.com
// 
// 🎨 Built with Pine Genie's drag-and-drop visual builder
// 🚀 No coding required - Professional results guaranteed
// 
// ═══════════════════════════════════════════════════════════════════════════════`,
    variables: [
      { name: 'strategyName', type: 'string', required: true },
      { name: 'nodeCount', type: 'number', required: false },
      { name: 'timestamp', type: 'datetime', required: true },
      { name: 'version', type: 'string', required: true }
    ],
    position: SignaturePosition.TOP,
    enabled: true
  },
  
  [SignatureType.AI_CHAT]: {
    id: 'ai-chat-default',
    name: 'AI Generated Script',
    type: SignatureType.AI_CHAT,
    template: `// ═══════════════════════════════════════════════════════════════════════════════
// 🌲 Pine Genie - AI-Powered Pine Script Generator
// ═══════════════════════════════════════════════════════════════════════════════
// 
// Generated by: Pine Genie AI Assistant
// Strategy: {{strategyName}}
// Generated: {{timestamp}}
// Version: {{version}}
// Website: https://pinegenie.com
// 
// 🤖 Created with Pine Genie's advanced AI technology
// 💬 From natural language to professional Pine Script
// 
// ═══════════════════════════════════════════════════════════════════════════════`,
    variables: [
      { name: 'strategyName', type: 'string', required: true },
      { name: 'timestamp', type: 'datetime', required: true },
      { name: 'version', type: 'string', required: true }
    ],
    position: SignaturePosition.TOP,
    enabled: true
  }
};
```

### 4. Integration Layer

**Purpose**: Provides seamless integration with existing code generation systems.

**Integration Points**:

```typescript
// Template System Integration
class TemplateSignatureIntegration {
  static async enhanceTemplate(template: StrategyTemplate): Promise<StrategyTemplate> {
    const signatureService = new SignatureService();
    const enhancedTemplate = { ...template };
    
    enhancedTemplate.template = await signatureService.addSignature(
      template.template,
      {
        type: 'template',
        templateId: template.id,
        timestamp: new Date(),
        version: '1.0'
      }
    );
    
    return enhancedTemplate;
  }
}

// Visual Builder Integration
class BuilderSignatureIntegration {
  static async enhanceGeneratedCode(
    code: string, 
    nodes: CustomNode[], 
    edges: CustomEdge[]
  ): Promise<string> {
    const signatureService = new SignatureService();
    
    return await signatureService.addSignature(code, {
      type: 'builder',
      strategyName: 'Visual Strategy',
      nodeCount: nodes.length,
      timestamp: new Date(),
      version: '1.0',
      metadata: {
        nodeTypes: nodes.map(n => n.type),
        edgeCount: edges.length
      }
    });
  }
}

// AI Chat Integration
class AISignatureIntegration {
  static async enhanceAIGeneratedCode(
    code: string,
    prompt: string,
    strategyName?: string
  ): Promise<string> {
    const signatureService = new SignatureService();
    
    return await signatureService.addSignature(code, {
      type: 'ai-chat',
      strategyName: strategyName || 'AI Generated Strategy',
      timestamp: new Date(),
      version: '1.0',
      metadata: {
        prompt: prompt.substring(0, 100) + '...',
        promptLength: prompt.length
      }
    });
  }
}
```

## Data Models

### Signature Configuration Schema

```typescript
interface SignatureVariable {
  name: string;
  type: 'string' | 'number' | 'datetime' | 'boolean';
  required: boolean;
  defaultValue?: any;
  description?: string;
}

interface SignatureDefaults {
  enabled: boolean;
  defaultType: SignatureType;
  defaultPosition: SignaturePosition;
  defaultVerbosity: 'minimal' | 'standard' | 'detailed';
  brandingText: string;
  websiteUrl: string;
  version: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}
```

### Database Schema Extensions

```sql
-- User signature preferences
CREATE TABLE user_signature_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  enabled BOOLEAN DEFAULT true,
  verbosity_level VARCHAR(20) DEFAULT 'standard',
  custom_branding TEXT,
  include_timestamp BOOLEAN DEFAULT true,
  include_metadata BOOLEAN DEFAULT true,
  position VARCHAR(20) DEFAULT 'top',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custom signature templates
CREATE TABLE signature_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  template TEXT NOT NULL,
  variables JSONB,
  position VARCHAR(20) DEFAULT 'top',
  enabled BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Signature usage analytics
CREATE TABLE signature_usage_analytics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  signature_type VARCHAR(50),
  template_id INTEGER REFERENCES signature_templates(id),
  generation_context JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Error Handling

### Error Types and Handling Strategy

```typescript
enum SignatureError {
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  VARIABLE_RESOLUTION_FAILED = 'VARIABLE_RESOLUTION_FAILED',
  INJECTION_FAILED = 'INJECTION_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  USER_PREFERENCES_ERROR = 'USER_PREFERENCES_ERROR'
}

class SignatureErrorHandler {
  static handle(error: SignatureError, context: any): string {
    switch (error) {
      case SignatureError.TEMPLATE_NOT_FOUND:
        return this.getDefaultSignature(context);
      case SignatureError.VARIABLE_RESOLUTION_FAILED:
        return this.getMinimalSignature(context);
      case SignatureError.INJECTION_FAILED:
        console.warn('Signature injection failed, returning original code');
        return context.originalCode;
      default:
        return this.getFallbackSignature();
    }
  }
  
  private static getDefaultSignature(context: any): string {
    return `// Generated by Pine Genie - https://pinegenie.com\n// ${new Date().toISOString()}\n`;
  }
  
  private static getMinimalSignature(context: any): string {
    return `// Pine Genie Generated Script\n`;
  }
  
  private static getFallbackSignature(): string {
    return `// Pine Genie - Professional Pine Script Generator\n`;
  }
}
```

## Testing Strategy

### Unit Testing

1. **Signature Generation Tests**
   - Template variable resolution
   - Different signature types
   - Error handling scenarios
   - Performance benchmarks

2. **Integration Tests**
   - Template system integration
   - Visual builder integration
   - AI chat integration
   - Database operations

3. **End-to-End Tests**
   - Complete signature workflow
   - User preference persistence
   - Multi-user scenarios
   - Performance under load

### Test Coverage Requirements

- Minimum 90% code coverage
- All error paths tested
- Performance tests for signature injection
- Integration tests with existing systems
- User acceptance tests for different signature formats

## Performance Considerations

### Optimization Strategies

1. **Template Caching**
   - Cache compiled signature templates
   - Invalidate cache on template updates
   - Memory-efficient template storage

2. **Variable Resolution Optimization**
   - Pre-compile variable patterns
   - Batch variable resolution
   - Lazy loading of complex variables

3. **Injection Performance**
   - String manipulation optimization
   - Minimal memory allocation
   - Efficient position detection

4. **Database Optimization**
   - Index user preferences table
   - Cache frequently accessed templates
   - Batch analytics insertions

### Performance Targets

- Signature addition: < 100ms per script
- Template loading: < 50ms
- User preference retrieval: < 25ms
- Memory usage: < 10MB additional overhead
- Database queries: < 5ms average response time

## Security Considerations

### Security Measures

1. **Input Validation**
   - Sanitize all user-provided signature content
   - Validate template variables
   - Prevent code injection through signatures

2. **Access Control**
   - User-specific signature preferences
   - Admin-only template management
   - Rate limiting for signature operations

3. **Data Protection**
   - Encrypt sensitive signature data
   - Audit signature template changes
   - Secure variable resolution

### Security Testing

- Input sanitization tests
- SQL injection prevention
- XSS prevention in signature content
- Access control validation
- Audit trail verification