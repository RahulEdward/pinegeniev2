# Pine Genie Signature Service

The Pine Genie Signature Service provides automatic signature addition to all generated Pine Script code. This service adds professional branding, attribution, and metadata information while maintaining Pine Script v6 compatibility.

## Overview

The signature system consists of several core components:

- **SignatureService**: Main entry point for signature operations
- **SignatureManager**: Core signature generation and injection logic
- **ConfigurationService**: Template and preference management
- **SignatureErrorHandler**: Error handling and fallback mechanisms

## Quick Start

```typescript
import { SignatureService } from './services/signature';
import { GenerationContext } from './types/signature';

const signatureService = new SignatureService();

// Create generation context
const context: GenerationContext = {
  type: 'template',
  strategyName: 'My Strategy',
  timestamp: new Date(),
  version: '1.0'
};

// Add signature to Pine Script code
const pineScriptCode = '//@version=6\nstrategy("Test", overlay=true)';
const enhancedCode = await signatureService.addSignature(pineScriptCode, context);

console.log(enhancedCode);
```

## Features

### Automatic Signature Addition

The service automatically adds appropriate signatures based on the generation context:

- **Template signatures**: For template-generated code
- **Builder signatures**: For visual builder-generated code  
- **AI signatures**: For AI-generated code
- **Custom signatures**: For other generation types

### Variable Resolution

Signatures support dynamic variables that are resolved at generation time:

- `{{strategyName}}`: Name of the generated strategy
- `{{timestamp}}`: Generation timestamp
- `{{version}}`: Pine Genie version
- `{{templateName}}`: Template identifier (for template-generated code)
- `{{nodeCount}}`: Number of nodes (for builder-generated code)
- `{{userId}}`: User identifier

### Flexible Positioning

Signatures can be positioned at different locations in the code:

- **TOP**: At the beginning of the file (default)
- **BOTTOM**: At the end of the file
- **AFTER_VERSION**: After the `//@version` declaration

### Signature Validation

The service includes validation to ensure signatures are Pine Script compatible:

- All signature lines must be comments (start with `//`)
- Line length validation
- Character validation
- Format validation

## API Reference

### SignatureService

Main service class for signature operations.

#### Methods

##### `addSignature(code: string, context: GenerationContext): Promise<string>`

Adds a signature to Pine Script code based on the generation context.

**Parameters:**
- `code`: The Pine Script code to enhance
- `context`: Generation context with metadata

**Returns:** Promise resolving to code with signature added

##### `getSignatureTemplate(type: SignatureType): Promise<SignatureTemplate>`

Retrieves a signature template by type.

**Parameters:**
- `type`: The signature type (TEMPLATE, BUILDER, AI_CHAT, CUSTOM)

**Returns:** Promise resolving to the signature template

##### `validateSignature(signature: string): ValidationResult`

Validates a signature for Pine Script compatibility.

**Parameters:**
- `signature`: The signature string to validate

**Returns:** Validation result with errors, warnings, and suggestions

##### `updateUserPreferences(userId: string, preferences: SignaturePreferences): Promise<void>`

Updates user signature preferences (placeholder for future implementation).

### SignatureManager

Core signature generation and injection logic.

#### Methods

##### `generateSignature(context: GenerationContext): Promise<string>`

Generates a signature string based on the context.

##### `injectSignature(code: string, signature: string, position: SignaturePosition): string`

Injects a signature into Pine Script code at the specified position.

##### `resolveVariables(template: string, context: GenerationContext): string`

Resolves template variables with actual values from the context.

### ConfigurationService

Template and preference management.

#### Methods

##### `getSignatureTemplate(type: SignatureType): Promise<SignatureTemplate>`

Retrieves a signature template by type.

##### `getUserPreferences(userId: string): Promise<SignaturePreferences>`

Retrieves user signature preferences.

##### `getSystemDefaults(): SignatureDefaults`

Gets system default configuration.

## Types

### GenerationContext

```typescript
interface GenerationContext {
  type: 'template' | 'builder' | 'ai-chat';
  userId?: string;
  strategyName?: string;
  templateId?: string;
  timestamp: Date;
  version: string;
  metadata?: Record<string, any>;
}
```

### SignatureTemplate

```typescript
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

### SignaturePreferences

```typescript
interface SignaturePreferences {
  enabled: boolean;
  verbosityLevel: 'minimal' | 'standard' | 'detailed';
  customBranding?: string;
  includeTimestamp: boolean;
  includeMetadata: boolean;
  position: SignaturePosition;
}
```

## Error Handling

The signature service includes comprehensive error handling:

- **Template not found**: Falls back to default signature
- **Variable resolution failed**: Uses minimal signature
- **Injection failed**: Returns original code
- **Validation failed**: Uses basic signature
- **User preferences error**: Uses default preferences

All errors are logged and handled gracefully to ensure code generation never fails due to signature issues.

## Testing

The signature service includes comprehensive unit tests:

```bash
# Run all signature service tests
npm test -- src/services/signature

# Run specific test file
npm test -- src/services/signature/__tests__/SignatureService.test.ts
```

## Examples

See `example.ts` for comprehensive usage examples demonstrating:

- Template signature generation
- Builder signature generation
- AI signature generation
- Signature validation
- Template retrieval

## Future Enhancements

This initial implementation provides the core infrastructure. Future tasks will add:

- Database persistence for user preferences
- Custom template management
- Performance optimization and caching
- Integration with existing Pine Genie systems
- User interface components
- Analytics and usage tracking

## Integration Points

The signature service is designed to integrate with existing Pine Genie systems:

- **Template System**: Enhance generated templates with signatures
- **Visual Builder**: Add signatures to builder-generated code
- **AI Chat**: Include signatures in AI-generated code
- **User Preferences**: Respect user signature settings
- **Database**: Store templates and preferences (future)

## Performance Considerations

The signature service is optimized for performance:

- Template caching for fast retrieval
- Efficient variable resolution
- Minimal memory allocation during injection
- Fast signature validation
- Error handling with minimal overhead

Target performance metrics:
- Signature addition: < 100ms per script
- Template loading: < 50ms
- Variable resolution: < 25ms
- Validation: < 10ms