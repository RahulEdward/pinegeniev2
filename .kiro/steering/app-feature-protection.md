---
inclusion: always
---

# PineGenie App Feature Protection Guidelines

## Overview
This document serves as a comprehensive guide to protect existing PineGenie app features during development. The agent MUST follow these guidelines to ensure no existing functionality is broken when implementing new features or chat functionality.

## Core App Architecture

### 1. Drag-and-Drop Visual Builder (CRITICAL - DO NOT MODIFY)
**Location**: `src/app/builder/`
**Key Components**:
- `Canvas.tsx` - Main visual builder interface
- `builder-state.ts` - Zustand state management for nodes/edges
- `canvas-config.ts` - Node types and configurations
- `enhanced-pinescript-generator.ts` - Zero-error Pine Script generation
- `nodes/` directory - Individual node components

**Protected Features**:
- Visual drag-and-drop interface for strategy building
- Node-based system with connections
- Real-time Pine Script v6 generation
- Theme consistency with dashboard
- Canvas panning, zooming, and background patterns
- Node validation and connection system
- Strategy save/load functionality

**CRITICAL RULES**:
- Never modify the core builder state management
- Preserve all existing node types and their configurations
- Maintain the zero-error Pine Script generation system
- Keep the visual interface responsive and functional
- Do not break existing node connections or validation

### 2. Pine Script Template System (PROTECTED)
**Location**: `src/agents/pinegenie-agent/core/pine-generator/`
**Key Files**:
- `templates.ts` - Strategy templates with validation
- `examples.ts` - Usage examples
- `validate-templates.ts` - Template validation
- `__tests__/templates.test.ts` - Comprehensive tests

**Protected Features**:
- 6+ pre-built strategy templates
- Parameter validation system
- Template search and categorization
- Pine Script v6 compatibility
- Template customization and parameter injection

**CRITICAL RULES**:
- Never break existing template functionality
- Maintain all template parameters and validation
- Preserve template search and filtering
- Keep Pine Script v6 compatibility
- Do not modify template generation logic without testing

### 3. Theme System (PROTECTED)
**Location**: Multiple files across the app
**Key Components**:
- Theme consistency between dashboard and builder
- Dark/Light mode support
- Color variable system
- Responsive design

**CRITICAL RULES**:
- Maintain theme consistency across all components
- Preserve dark/light mode functionality
- Keep responsive design intact
- Do not break color variable mappings

### 4. Database Schema (PROTECTED)
**Location**: `prisma/schema.prisma`
**Protected Tables**:
- User authentication and management
- Strategy storage and versioning
- Agent conversations (if exists)
- Admin functionality

**CRITICAL RULES**:
- Never modify existing database tables without migration
- Preserve all existing relationships
- Maintain data integrity
- Add new tables/fields only, never remove existing ones

## Development Guidelines for New Features

### When Adding Chat/Agent Features:

1. **Isolation Principle**:
   - Create new components in `src/agents/pinegenie-agent/` directory
   - Do not modify existing builder components
   - Use separate state management for chat features

2. **Integration Points**:
   - Use the existing template system for code generation
   - Integrate with theme system for consistency
   - Respect existing routing and navigation

3. **API Integration**:
   - Add new API routes under `src/app/api/ai-chat/` or similar
   - Do not modify existing API endpoints
   - Maintain backward compatibility

### Protected File Patterns:

**NEVER MODIFY WITHOUT EXPLICIT PERMISSION**:
- `src/app/builder/**` (entire builder system)
- `src/agents/pinegenie-agent/core/pine-generator/templates.ts`
- `prisma/schema.prisma` (without proper migrations)
- Theme-related files that affect the entire app
- Any file with existing tests

**SAFE TO EXTEND**:
- Add new files in `src/agents/pinegenie-agent/components/`
- Create new API routes for chat functionality
- Add new database tables (with proper migrations)
- Create new utility functions that don't affect existing ones

## Specific Feature Protection

### 1. Visual Builder Protection
```typescript
// PROTECTED: Do not modify these interfaces
interface BuilderNode {
  id: string;
  type: string;
  position: NodePosition;
  data: NodeData;
  // ... existing properties
}

interface BuilderEdge {
  id: string;
  source: string;
  target: string;
  // ... existing properties
}
```

### 2. Template System Protection
```typescript
// PROTECTED: Do not modify template structure
interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  category: 'trend-following' | 'mean-reversion' | 'breakout' | 'momentum' | 'scalping' | 'custom';
  parameters: StrategyParameter[];
  template: string;
  // ... existing properties
}
```

### 3. Pine Script Generation Protection
- The enhanced Pine Script generator must remain functional
- Zero-error generation system must be preserved
- All existing node types must continue to generate valid code
- Template parameter injection must work correctly

## Testing Requirements

### Before Any Deployment:
1. **Builder Functionality Test**:
   - Drag and drop nodes
   - Create connections between nodes
   - Generate Pine Script code
   - Save and load strategies
   - Theme switching works

2. **Template System Test**:
   - All templates generate valid code
   - Parameter validation works
   - Search and filtering functional
   - Template customization works

3. **Integration Test**:
   - New chat features don't break builder
   - Theme consistency maintained
   - Database operations work
   - API endpoints respond correctly

## Emergency Rollback Plan

If any existing functionality breaks:

1. **Immediate Actions**:
   - Revert the last changes that caused the issue
   - Check git history for the last working state
   - Test core functionality (builder, templates, theme)

2. **Recovery Steps**:
   - Restore from backup if available
   - Re-run database migrations if needed
   - Clear browser cache and localStorage
   - Restart development server

## Communication Protocol

### When Implementing New Features:

1. **Before Starting**:
   - Review this protection document
   - Identify potential integration points
   - Plan isolation strategy for new features

2. **During Development**:
   - Test existing functionality frequently
   - Use separate branches for new features
   - Document any necessary changes to existing code

3. **Before Deployment**:
   - Run full test suite
   - Verify all protected features work
   - Get explicit approval for any modifications to protected files

## Monitoring and Alerts

### Key Metrics to Monitor:
- Builder load time and responsiveness
- Pine Script generation success rate
- Template system functionality
- Theme switching performance
- Database query performance

### Alert Conditions:
- Any existing functionality stops working
- Pine Script generation fails
- Template system errors
- Theme inconsistencies
- Database connection issues

## Conclusion

This document serves as a contract between the development team and the AI agent. Following these guidelines ensures that PineGenie's core functionality remains intact while allowing for innovative new features to be added safely.

**Remember**: When in doubt, ask for clarification rather than risking existing functionality. The visual builder and Pine Script generation system are the core value propositions of PineGenie and must be protected at all costs.