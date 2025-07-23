# Kiro-Style Pine Script Agent

## Overview

This directory contains the implementation of the Kiro-Style Pine Script Agent, a conversational AI system that integrates seamlessly with the existing PineGenie dashboard to provide natural language Pine Script generation, voice interaction capabilities, and automated code validation.

## Features

- **Theme Integration**: Seamless visual consistency with dashboard
- **Conversational AI**: Natural language Pine Script generation
- **Voice Integration**: Speech-to-text and text-to-speech capabilities
- **Code Validation**: Automated Pine Script syntax and logic validation
- **Agent Hooks**: Automated code enhancement and risk management
- **Accessibility**: WCAG 2.1 AA compliant interface

## Architecture

The agent follows a modular architecture with clear separation of concerns:

```
src/agents/pinegenie-agent/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── chat/           # Chat-specific components
│   └── forms/          # Form components
├── config/             # Configuration and theme adapter
├── hooks/              # React hooks for theme and functionality
├── styles/             # CSS variables and utilities
├── utils/              # Utility functions
└── docs/               # Comprehensive documentation
    ├── color-mappings.md      # Complete color reference
    ├── style-guide.md         # Visual examples and patterns
    └── developer-guidelines.md # Best practices and conventions
```

## Theme System

The agent uses a sophisticated theme system that ensures visual consistency with the dashboard:

### Key Components

1. **Theme Adapter** (`config/theme-adapter.ts`)
   - Extracts dashboard colors automatically
   - Maps colors to semantic agent theme variables
   - Validates accessibility compliance
   - Handles light/dark mode switching

2. **CSS Variables** (`styles/agent-theme.css`)
   - Defines all theme colors as CSS custom properties
   - Provides utility classes for common patterns
   - Supports automatic dark mode adaptation

3. **React Hooks** (`hooks/useAgentTheme.ts`)
   - Provides theme data to React components
   - Handles theme change notifications
   - Offers accessibility validation

### Color System

The theme system maps dashboard colors to semantic agent variables:

```css
/* Primary colors for main actions */
--agent-primary: #0ea5e9;
--agent-primary-hover: #0284c7;
--agent-primary-active: #0369a1;

/* Text hierarchy */
--agent-text-primary: #171717;    /* Main content */
--agent-text-secondary: #475569;  /* Descriptions */
--agent-text-muted: #64748b;      /* Placeholders */

/* Status colors */
--agent-success: #22c55e;
--agent-warning: #f59e0b;
--agent-error: #ef4444;
--agent-info: #0ea5e9;

/* Chat-specific colors */
--agent-chat-user-bubble: #0ea5e9;
--agent-chat-agent-bubble: #f1f5f9;
```

## Getting Started

### Prerequisites

- Node.js 18+
- React 18+
- TypeScript 5+
- Tailwind CSS 3+

### Installation

1. Install dependencies:
```bash
npm install
```

2. Initialize the theme system:
```typescript
import { themeAdapter } from './config/theme-adapter';

// Initialize theme on app startup
useEffect(() => {
  themeAdapter.initializeTheme();
}, []);
```

3. Wrap your components with the theme provider:
```typescript
import { AgentThemeProvider } from './components/AgentThemeProvider';

function App() {
  return (
    <AgentThemeProvider>
      {/* Your app components */}
    </AgentThemeProvider>
  );
}
```

## Usage Examples

### Basic Component Usage

```typescript
import { useAgentTheme } from './hooks/useAgentTheme';

const MyComponent = () => {
  const { theme, isLoading, isAccessible } = useAgentTheme();
  
  if (isLoading) return <div className="agent-text-muted">Loading...</div>;
  
  return (
    <div className="agent-card p-6">
      <h2 className="agent-text-primary text-lg font-semibold mb-4">
        Strategy Generator
      </h2>
      <p className="agent-text-secondary mb-4">
        This component uses the agent theme system for consistent styling.
      </p>
      <div className="flex space-x-3">
        <button className="agent-btn agent-btn-primary">
          Generate Code
        </button>
        <button className="agent-btn agent-btn-secondary">
          Cancel
        </button>
      </div>
      
      {!isAccessible && (
        <div className="agent-status-warning mt-4">
          ⚠ Accessibility issues detected
        </div>
      )}
    </div>
  );
};
```

### Chat Interface Example

```typescript
const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  return (
    <div className="agent-card p-6">
      {/* Message history */}
      <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              p-3 rounded-lg max-w-xs
              ${message.isUser 
                ? 'agent-chat-user-bubble' 
                : 'agent-chat-agent-bubble'
              }
            `}>
              {message.content}
            </div>
          </div>
        ))}
      </div>
      
      {/* Input area */}
      <div className="flex items-center space-x-2">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your trading strategy..."
          className="agent-chat-input flex-1 px-4 py-2 rounded-lg"
        />
        <button className="agent-btn agent-btn-primary px-4 py-2">
          Send
        </button>
      </div>
    </div>
  );
};
```

### Status Indicators

```typescript
const StatusExamples = () => (
  <div className="space-y-4">
    <div className="agent-status-success">
      ✓ Strategy generated successfully
    </div>
    <div className="agent-status-warning">
      ⚠ Code validation warnings detected
    </div>
    <div className="agent-status-error">
      ✗ Syntax error in generated code
    </div>
    <div className="agent-status-info">
      ℹ Using trend-following template
    </div>
  </div>
);
```

## Theme Consistency

The agent theme system ensures perfect visual consistency with the dashboard:

### Navigation Elements
- Tab navigation uses identical styling to dashboard tabs
- Active states use the same primary color
- Hover effects match dashboard behavior

### Form Elements
- Input fields have consistent styling and focus states
- Button variants match dashboard button patterns
- Validation states use the same color system

### Status Communication
- Success, warning, error, and info states are visually identical
- Background colors and text colors maintain semantic meaning
- Icons and messaging patterns are consistent

### Responsive Design
- Mobile adaptations follow dashboard responsive patterns
- Touch targets meet accessibility requirements
- Layout breakpoints align with dashboard design

## Documentation

### Complete Documentation Suite

- **[Color Mappings](./docs/color-mappings.md)** - Comprehensive color reference with:
  - Complete color palette documentation
  - Dashboard to agent color mappings
  - Usage contexts and guidelines
  - Accessibility validation information
  - Visual examples and troubleshooting

- **[Style Guide](./docs/style-guide.md)** - Visual examples and patterns including:
  - Component styling examples
  - Theme consistency demonstrations
  - Interactive state examples
  - Accessibility guidelines
  - Mobile responsive patterns

- **[Developer Guidelines](./docs/developer-guidelines.md)** - Best practices and conventions covering:
  - Theme integration workflows
  - Component development patterns
  - Accessibility implementation
  - Performance optimization
  - Testing strategies
  - Migration guides

### Visual Demo Component

The `ThemeConsistencyDemo` component provides interactive examples of:
- Color palette usage
- Component styling patterns
- Accessibility validation
- Theme switching behavior
- Dashboard consistency examples

## Testing

### Automated Testing

```bash
# Run all tests
npm test

# Run accessibility tests
npm run test:a11y

# Run visual regression tests
npm run test:visual

# Run theme validation
npm run test:theme
```

### Manual Testing Checklist

- [ ] All colors render correctly in light mode
- [ ] All colors render correctly in dark mode
- [ ] Theme switching works smoothly
- [ ] Accessibility compliance is maintained
- [ ] Visual consistency with dashboard
- [ ] Mobile responsiveness
- [ ] Print styles work correctly

## Performance Considerations

### Optimization Strategies

1. **CSS Variables**: Use CSS custom properties for efficient theme updates
2. **Memoization**: Cache expensive color calculations
3. **Batch Updates**: Group theme changes to minimize reflows
4. **Lazy Loading**: Load theme components only when needed

### Monitoring

- Theme update performance is monitored
- Accessibility validation runs in development
- Color contrast ratios are automatically checked
- Memory usage is optimized for theme data

## Contributing

### Development Workflow

1. **Follow Guidelines**: Adhere to [Developer Guidelines](./docs/developer-guidelines.md)
2. **Use Theme System**: Always use CSS variables and utility classes
3. **Test Accessibility**: Validate WCAG 2.1 AA compliance
4. **Update Documentation**: Keep docs current with changes
5. **Visual Consistency**: Ensure dashboard integration

### Code Review Checklist

- [ ] Uses theme system (no hardcoded colors)
- [ ] Maintains accessibility standards
- [ ] Works in both light and dark modes
- [ ] Follows naming conventions
- [ ] Includes proper documentation
- [ ] Has adequate test coverage

## Troubleshooting

### Common Issues

1. **Colors Not Updating**: Check theme adapter initialization
2. **Accessibility Violations**: Review contrast ratios and ARIA labels
3. **Inconsistent Styling**: Verify CSS variable usage
4. **Performance Issues**: Monitor theme update frequency

### Debug Tools

```typescript
// Check theme status
const validation = themeAdapter.validateColorConsistency();
console.log('Theme validation:', validation);

// Monitor theme changes
themeAdapter.addThemeChangeListener((event) => {
  console.log('Theme changed:', event);
});
```

## License

This project is licensed under the MIT License.