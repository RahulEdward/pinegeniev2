# Agent Theme Documentation

## Overview

This documentation provides comprehensive guidance for understanding and implementing the Kiro-Style Pine Script Agent theme system. The theme system ensures visual consistency between the main dashboard and agent components while maintaining accessibility standards and providing a seamless user experience.

## Documentation Structure

### 📋 [Color Mappings](./color-mappings.md)
Complete reference of all color variables, their purposes, and mappings between dashboard colors and agent theme colors.

**Contents:**
- Dashboard color palette (Primary, Secondary, Status colors)
- Agent theme color mappings
- CSS variable definitions
- Color usage contexts and guidelines
- Accessibility considerations
- Implementation notes

### 🎨 [Style Guide](./style-guide.md)
Visual examples and guidelines for proper color usage across all agent components.

**Contents:**
- Color usage examples with HTML/CSS code
- Component styling patterns
- Interactive state demonstrations
- Chat interface styling
- Form element styling
- Status indicator examples
- Accessibility guidelines
- Responsive design patterns

### 👨‍💻 [Developer Guidelines](./developer-guidelines.md)
Best practices and guidelines for developers working with the agent theme system.

**Contents:**
- Core development principles
- Component development workflow
- Code organization standards
- TypeScript integration
- Testing guidelines
- Performance best practices
- Common patterns and solutions
- Troubleshooting guide

## Quick Start

### 1. Basic Usage

Import the theme hook in your React components:

```typescript
import { useAgentTheme, useAgentColors } from '../hooks/useAgentTheme';

const MyComponent: React.FC = () => {
  const { theme, isLoading } = useAgentTheme();
  const colors = useAgentColors();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div className="agent-bg-surface agent-text-primary p-4">
      <button className="agent-btn agent-btn-primary">
        Click me
      </button>
    </div>
  );
};
```

### 2. CSS Variables

Use CSS variables for custom styling:

```css
.my-custom-component {
  background-color: var(--agent-surface);
  border: 1px solid var(--agent-border);
  color: var(--agent-text-primary);
}

.my-custom-component:hover {
  background-color: var(--agent-surface-hover);
  border-color: var(--agent-border-hover);
}
```

### 3. Utility Classes

Use provided utility classes for common patterns:

```html
<!-- Buttons -->
<button class="agent-btn agent-btn-primary">Primary Action</button>
<button class="agent-btn agent-btn-secondary">Secondary Action</button>

<!-- Status indicators -->
<div class="agent-status-success">✓ Success message</div>
<div class="agent-status-error">✗ Error message</div>

<!-- Chat bubbles -->
<div class="agent-chat-user-bubble">User message</div>
<div class="agent-chat-agent-bubble">Agent response</div>

<!-- Form inputs -->
<input type="text" class="agent-input" placeholder="Enter text..." />
```

## Key Features

### 🎯 Semantic Color System
Colors are organized by purpose, not appearance:
- `agent-text-primary` instead of `text-gray-900`
- `agent-status-success` instead of `text-green-500`
- `agent-bg-surface` instead of `bg-gray-50`

### 🌓 Automatic Dark Mode
All colors automatically adapt to light/dark mode:
- CSS variables update based on system preference or user setting
- No additional code needed in components
- Consistent appearance across all themes

### ♿ Accessibility First
Built-in accessibility features:
- WCAG 2.1 AA compliant contrast ratios
- Automatic contrast validation
- Screen reader support
- Keyboard navigation support

### 🚀 Performance Optimized
Efficient implementation:
- CSS variables for fast theme switching
- Minimal JavaScript overhead
- Cached color calculations
- Optimized for React rendering

## Architecture

### Theme Layers

```
┌─────────────────────────────────────┐
│           CSS Variables             │ ← Runtime styling
│        (--agent-primary, etc.)      │
├─────────────────────────────────────┤
│          Agent Theme                │ ← Semantic mapping
│     (primary, secondary, etc.)      │
├─────────────────────────────────────┤
│        Dashboard Colors             │ ← Base palette
│    (Tailwind config + CSS vars)     │
└─────────────────────────────────────┘
```

### Component Integration

```typescript
// Theme Adapter extracts dashboard colors
const dashboardColors = themeAdapter.extractDashboardColors();

// Maps to semantic agent theme
const agentTheme = themeAdapter.mapToAgentTheme(dashboardColors);

// Updates CSS variables for styling
themeAdapter.updateThemeVariables(agentTheme);

// React components use theme via hooks
const colors = useAgentColors();
```

## File Structure

```
src/agents/pinegenie-agent/
├── docs/                          # Documentation
│   ├── README.md                  # This file
│   ├── color-mappings.md          # Color reference
│   ├── style-guide.md             # Visual examples
│   └── developer-guidelines.md    # Development guide
├── config/
│   └── theme-adapter.ts           # Theme system core
├── hooks/
│   └── useAgentTheme.ts           # React integration
├── styles/
│   └── agent-theme.css            # CSS variables & utilities
├── components/
│   ├── ThemeConsistencyDemo.tsx   # Visual demo component
│   └── AgentThemeProvider.tsx     # Theme context provider
└── utils/
    └── theme-validator.ts         # Accessibility validation
```

## Color Reference Quick Guide

### Primary Colors
- `--agent-primary` - Main brand color (#0ea5e9)
- `--agent-primary-hover` - Hover state (#0284c7)
- `--agent-primary-active` - Active state (#0369a1)

### Text Colors
- `--agent-text-primary` - Main content
- `--agent-text-secondary` - Descriptions
- `--agent-text-muted` - Placeholders
- `--agent-text-inverse` - Text on colored backgrounds

### Status Colors
- `--agent-success` / `--agent-success-bg` - Success states
- `--agent-warning` / `--agent-warning-bg` - Warning states
- `--agent-error` / `--agent-error-bg` - Error states
- `--agent-info` / `--agent-info-bg` - Info states

### Chat Colors
- `--agent-chat-user-bubble` / `--agent-chat-user-text` - User messages
- `--agent-chat-agent-bubble` / `--agent-chat-agent-text` - Agent messages
- `--agent-chat-input-*` - Input field styling

## Testing

### Visual Testing
Use the theme consistency demo component:

```typescript
import ThemeConsistencyDemo from '../components/ThemeConsistencyDemo';

// In your development environment
<ThemeConsistencyDemo />
```

### Accessibility Testing
```typescript
import { themeAdapter } from '../config/theme-adapter';

const validation = themeAdapter.validateColorConsistency();
console.log('Accessibility:', validation);
```

### Unit Testing
```typescript
import { render } from '@testing-library/react';
import { ThemeProvider } from '../components/AgentThemeProvider';

test('component uses theme colors', () => {
  render(
    <ThemeProvider>
      <MyComponent />
    </ThemeProvider>
  );
  // Test theme integration
});
```

## Common Patterns

### Conditional Styling
```typescript
<div className={`
  agent-card p-4
  ${isActive ? 'agent-bg-primary agent-text-inverse' : 'agent-bg-surface'}
`}>
```

### Status Messages
```typescript
<div className={`agent-status-${type}`} role="status" aria-live="polite">
  {message}
</div>
```

### Theme-Aware Icons
```typescript
<Icon className="agent-text-secondary" />
```

## Migration Guide

### From Hardcoded Colors
```typescript
// Before
style={{ backgroundColor: '#0ea5e9' }}

// After
style={{ backgroundColor: 'var(--agent-primary)' }}

// Best
className="agent-bg-primary"
```

### From Tailwind Classes
```typescript
// Before
className="bg-blue-500 text-white"

// After
className="agent-bg-primary agent-text-inverse"
```

## Troubleshooting

### Colors Not Updating
1. Check if theme adapter is initialized
2. Verify CSS variables are loaded
3. Ensure components use theme classes/variables

### Accessibility Issues
1. Run validation: `themeAdapter.validateColorConsistency()`
2. Check contrast ratios in browser dev tools
3. Test with screen readers

### Performance Problems
1. Use CSS classes instead of inline styles
2. Memoize expensive calculations
3. Avoid unnecessary re-renders

## Support

### Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [React Accessibility](https://react.dev/learn/accessibility)

### Tools
- Chrome DevTools for color inspection
- axe DevTools for accessibility testing
- React DevTools for component debugging

## Contributing

When adding new colors or components:

1. **Follow semantic naming**: Use purpose-based names
2. **Maintain accessibility**: Ensure WCAG compliance
3. **Update documentation**: Add examples and usage notes
4. **Test thoroughly**: Verify light/dark mode compatibility
5. **Consider performance**: Use efficient CSS patterns

## Changelog

### Version 1.0.0
- Initial theme system implementation
- Complete color mapping documentation
- Accessibility validation system
- React hooks integration
- CSS utility classes
- Visual demo component

---

For detailed information on any aspect of the theme system, refer to the specific documentation files linked above.