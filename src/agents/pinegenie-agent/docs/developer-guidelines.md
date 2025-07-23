# Developer Guidelines for Theme Consistency

## Overview

This document provides guidelines for developers working on the Kiro-Style Pine Script Agent to maintain theme consistency, accessibility, and code quality. Following these guidelines ensures a cohesive user experience across all agent components.

## Core Principles

### 1. Always Use CSS Variables
Never hardcode color values. Always use the provided CSS variables or utility classes.

```typescript
// ❌ DON'T: Hardcode colors
const buttonStyle = {
  backgroundColor: '#0ea5e9',
  color: '#ffffff'
};

// ✅ DO: Use CSS variables
const buttonStyle = {
  backgroundColor: 'var(--agent-primary)',
  color: 'var(--agent-text-inverse)'
};

// ✅ BETTER: Use utility classes
<button className="agent-btn agent-btn-primary">
  Click me
</button>
```

### 2. Semantic Color Usage
Use colors based on their semantic meaning, not their appearance.

```typescript
// ❌ DON'T: Use colors by appearance
<div className="text-green-500">Success message</div>

// ✅ DO: Use semantic color names
<div className="agent-text-success">Success message</div>
<div className="agent-status-success">✓ Operation completed</div>
```

### 3. Theme-Aware Components
All components should work in both light and dark modes without modification.

```typescript
// ✅ Theme-aware component
const MessageBubble: React.FC<{ isUser: boolean; children: React.ReactNode }> = ({ 
  isUser, 
  children 
}) => {
  return (
    <div className={`
      p-3 rounded-lg max-w-xs
      ${isUser 
        ? 'agent-chat-user-bubble ml-auto' 
        : 'agent-chat-agent-bubble mr-auto'
      }
    `}>
      {children}
    </div>
  );
};
```

## Development Workflow

### 1. Setting Up Theme Integration

#### Import Theme Hook
```typescript
import { useAgentTheme, useAgentColors } from '../hooks/useAgentTheme';

const MyComponent: React.FC = () => {
  const { theme, isLoading, isAccessible } = useAgentTheme();
  const colors = useAgentColors();
  
  if (isLoading) return <div>Loading theme...</div>;
  
  return (
    <div style={{ backgroundColor: colors.surface }}>
      {/* Component content */}
    </div>
  );
};
```

#### Initialize Theme Adapter
```typescript
import { themeAdapter } from '../config/theme-adapter';

// In your app initialization
useEffect(() => {
  const theme = themeAdapter.initializeTheme();
  console.log('Theme initialized:', theme);
}, []);
```

### 2. Component Development Guidelines

#### Use Provided Utility Classes
```typescript
// ✅ Recommended approach
const AgentCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="agent-card p-6 hover:shadow-md transition-shadow">
      {children}
    </div>
  );
};
```

#### Custom Styling with CSS Variables
```typescript
// When utility classes aren't sufficient
const CustomComponent: React.FC = () => {
  return (
    <div 
      className="rounded-lg p-4"
      style={{
        backgroundColor: 'var(--agent-surface)',
        borderColor: 'var(--agent-border)',
        color: 'var(--agent-text-primary)'
      }}
    >
      Custom styled content
    </div>
  );
};
```

#### Dynamic Styling with Theme Hook
```typescript
const DynamicComponent: React.FC = () => {
  const colors = useAgentColors();
  
  return (
    <div 
      style={{
        background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
        color: colors.text.inverse
      }}
    >
      Gradient background
    </div>
  );
};
```

### 3. Accessibility Implementation

#### Contrast Validation
```typescript
import { themeAdapter } from '../config/theme-adapter';

const validateContrast = () => {
  const validation = themeAdapter.validateColorConsistency();
  
  if (!validation.isValid) {
    console.warn('Accessibility issues detected:', validation.warnings);
    validation.contrastIssues.forEach(issue => {
      console.warn(`Low contrast: ${issue.foreground} on ${issue.background} (${issue.ratio.toFixed(2)}:1)`);
    });
  }
};
```

#### Focus Management
```typescript
const AccessibleButton: React.FC<{ children: React.ReactNode; onClick: () => void }> = ({ 
  children, 
  onClick 
}) => {
  return (
    <button
      className="agent-btn agent-btn-primary agent-focus-visible"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </button>
  );
};
```

#### Status Announcements
```typescript
const StatusMessage: React.FC<{ type: 'success' | 'error' | 'warning'; message: string }> = ({ 
  type, 
  message 
}) => {
  return (
    <div 
      className={`agent-status-${type}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
};
```

## Code Organization

### 1. File Structure
```
src/agents/pinegenie-agent/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   ├── chat/                  # Chat-specific components
│   │   ├── MessageBubble.tsx
│   │   ├── ChatInput.tsx
│   │   └── ChatContainer.tsx
│   └── forms/                 # Form components
│       ├── StrategyForm.tsx
│       └── ConfigForm.tsx
├── hooks/
│   ├── useAgentTheme.ts       # Theme integration hook
│   └── useAccessibility.ts    # Accessibility utilities
├── config/
│   └── theme-adapter.ts       # Theme adapter implementation
├── styles/
│   └── agent-theme.css        # CSS variables and utilities
└── docs/                      # Documentation
    ├── color-mappings.md
    ├── style-guide.md
    └── developer-guidelines.md
```

### 2. Component Naming Conventions

#### Component Files
- Use PascalCase: `MessageBubble.tsx`
- Be descriptive: `StrategyConfigurationForm.tsx`
- Group by feature: `chat/MessageBubble.tsx`

#### CSS Classes
- Use kebab-case with `agent-` prefix: `agent-btn-primary`
- Be semantic: `agent-status-success` not `agent-green-bg`
- Follow BEM-like structure: `agent-chat-input-placeholder`

#### CSS Variables
- Use kebab-case with `--agent-` prefix: `--agent-primary`
- Be hierarchical: `--agent-text-primary`, `--agent-text-secondary`
- Include state variants: `--agent-primary-hover`

### 3. TypeScript Integration

#### Theme Type Definitions
```typescript
// Use provided interfaces
import { AgentTheme, DashboardColorPalette } from '../config/theme-adapter';

interface ComponentProps {
  theme?: AgentTheme;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}
```

#### Color Prop Types
```typescript
type StatusType = 'success' | 'warning' | 'error' | 'info';
type TextVariant = 'primary' | 'secondary' | 'muted' | 'inverse';
type ButtonVariant = 'primary' | 'secondary';

interface ThemedComponentProps {
  status?: StatusType;
  textVariant?: TextVariant;
  variant?: ButtonVariant;
}
```

## Testing Guidelines

### 1. Theme Testing

#### Unit Tests
```typescript
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../components/AgentThemeProvider';
import MyComponent from '../components/MyComponent';

describe('MyComponent', () => {
  it('renders with correct theme colors', () => {
    render(
      <ThemeProvider>
        <MyComponent />
      </ThemeProvider>
    );
    
    const element = screen.getByRole('button');
    expect(element).toHaveClass('agent-btn-primary');
  });
  
  it('adapts to dark mode', () => {
    document.documentElement.classList.add('dark');
    
    render(
      <ThemeProvider>
        <MyComponent />
      </ThemeProvider>
    );
    
    // Test dark mode specific behavior
  });
});
```

#### Accessibility Tests
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(
      <ThemeProvider>
        <MyComponent />
      </ThemeProvider>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### 2. Visual Regression Testing

#### Storybook Integration
```typescript
// MyComponent.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider } from '../components/AgentThemeProvider';
import MyComponent from './MyComponent';

const meta: Meta<typeof MyComponent> = {
  title: 'Agent/MyComponent',
  component: MyComponent,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = {};

export const Dark: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => {
      document.documentElement.classList.add('dark');
      return <Story />;
    },
  ],
};
```

## Performance Best Practices

### 1. CSS Variable Optimization

#### Minimize Reflows
```typescript
// ❌ DON'T: Multiple style updates
element.style.backgroundColor = 'var(--agent-primary)';
element.style.color = 'var(--agent-text-inverse)';
element.style.borderColor = 'var(--agent-border)';

// ✅ DO: Batch updates or use classes
element.className = 'agent-btn agent-btn-primary';
```

#### Efficient Theme Updates
```typescript
// Use the theme adapter's batch update method
const updateTheme = (newColors: DashboardColorPalette) => {
  const theme = themeAdapter.mapToAgentTheme(newColors);
  themeAdapter.updateThemeVariables(theme); // Batched update
};
```

### 2. Component Optimization

#### Memoization
```typescript
import { memo, useMemo } from 'react';
import { useAgentColors } from '../hooks/useAgentTheme';

const ExpensiveComponent = memo<Props>(({ data }) => {
  const colors = useAgentColors();
  
  const computedStyles = useMemo(() => ({
    backgroundColor: colors.surface,
    borderColor: colors.border,
    color: colors.text.primary,
  }), [colors]);
  
  return (
    <div style={computedStyles}>
      {/* Expensive rendering */}
    </div>
  );
});
```

#### Lazy Loading
```typescript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

const App = () => (
  <Suspense fallback={<div className="agent-text-muted">Loading...</div>}>
    <HeavyComponent />
  </Suspense>
);
```

## Common Patterns

### 1. Conditional Styling
```typescript
const ConditionalComponent: React.FC<{ isActive: boolean; variant: 'primary' | 'secondary' }> = ({ 
  isActive, 
  variant 
}) => {
  return (
    <div className={`
      agent-card p-4 transition-colors
      ${isActive ? 'agent-bg-primary agent-text-inverse' : 'agent-bg-surface'}
      ${variant === 'primary' ? 'border-2 agent-border' : 'border agent-border'}
    `}>
      Content
    </div>
  );
};
```

### 2. Theme-Aware Icons
```typescript
const ThemedIcon: React.FC<{ name: string; variant?: 'primary' | 'secondary' | 'muted' }> = ({ 
  name, 
  variant = 'primary' 
}) => {
  const colorClass = {
    primary: 'agent-text-primary',
    secondary: 'agent-text-secondary',
    muted: 'agent-text-muted',
  }[variant];
  
  return <Icon name={name} className={colorClass} />;
};
```

### 3. Responsive Theme Components
```typescript
const ResponsiveCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="
      agent-card
      p-4 md:p-6
      text-sm md:text-base
      rounded-lg md:rounded-xl
      shadow-sm md:shadow-md
    ">
      {children}
    </div>
  );
};
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Colors Not Updating
**Problem**: Components don't reflect theme changes
**Solution**: 
- Ensure components use CSS variables, not hardcoded values
- Check if theme adapter is properly initialized
- Verify theme change listeners are set up correctly

```typescript
// Debug theme updates
useEffect(() => {
  const handleThemeChange = (event) => {
    console.log('Theme changed:', event);
  };
  
  themeAdapter.addThemeChangeListener(handleThemeChange);
  return () => themeAdapter.removeThemeChangeListener(handleThemeChange);
}, []);
```

#### 2. Accessibility Violations
**Problem**: Components fail accessibility tests
**Solution**:
- Use semantic HTML elements
- Ensure proper contrast ratios
- Add ARIA labels and roles
- Test with screen readers

```typescript
// Check accessibility in development
if (process.env.NODE_ENV === 'development') {
  const validation = themeAdapter.validateColorConsistency();
  if (!validation.isValid) {
    console.warn('Accessibility issues:', validation.warnings);
  }
}
```

#### 3. Performance Issues
**Problem**: Theme updates cause performance problems
**Solution**:
- Use CSS classes instead of inline styles
- Batch theme updates
- Memoize expensive calculations
- Avoid unnecessary re-renders

```typescript
// Optimize with useMemo
const memoizedStyles = useMemo(() => ({
  backgroundColor: colors.surface,
  color: colors.text.primary,
}), [colors.surface, colors.text.primary]);
```

## Code Review Checklist

### Theme Consistency
- [ ] Uses CSS variables or utility classes (no hardcoded colors)
- [ ] Follows semantic color naming conventions
- [ ] Works in both light and dark modes
- [ ] Maintains visual consistency with dashboard

### Accessibility
- [ ] Meets WCAG 2.1 AA contrast requirements
- [ ] Has proper focus indicators
- [ ] Uses semantic HTML elements
- [ ] Includes appropriate ARIA attributes

### Performance
- [ ] Minimizes style recalculations
- [ ] Uses efficient CSS selectors
- [ ] Avoids unnecessary re-renders
- [ ] Implements proper memoization

### Code Quality
- [ ] Follows TypeScript best practices
- [ ] Has proper error handling
- [ ] Includes unit tests
- [ ] Is properly documented

## Theme Consistency Enforcement

### Dashboard Integration Checklist

When creating new agent components, ensure they match dashboard patterns:

#### ✅ Navigation Elements
```typescript
// Dashboard-style tab navigation
const TabNavigation: React.FC<{ tabs: string[]; activeTab: string; onTabChange: (tab: string) => void }> = ({
  tabs, activeTab, onTabChange
}) => {
  return (
    <nav className="agent-bg-surface border-b agent-border">
      <div className="flex space-x-1 p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`
              px-4 py-2 rounded-md font-medium transition-colors
              ${activeTab === tab 
                ? 'agent-bg-primary agent-text-inverse' 
                : 'agent-text-secondary hover:agent-text-primary hover:agent-bg-surface-hover'
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>
    </nav>
  );
};
```

#### ✅ Form Elements
```typescript
// Dashboard-consistent form styling
const FormField: React.FC<{
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}> = ({ label, type = 'text', placeholder, value, onChange, error }) => {
  return (
    <div className="space-y-2">
      <label className="agent-text-primary font-medium block">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          agent-input w-full
          ${error ? 'border-red-500 focus:border-red-500' : ''}
        `}
      />
      {error && (
        <p className="agent-text-error text-sm">{error}</p>
      )}
    </div>
  );
};
```

#### ✅ Status Indicators
```typescript
// Consistent status messaging
const StatusMessage: React.FC<{
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}> = ({ type, title, message, dismissible, onDismiss }) => {
  const icons = {
    success: '✓',
    warning: '⚠',
    error: '✗',
    info: 'ℹ'
  };

  return (
    <div className={`agent-bg-${type} p-4 rounded-lg`}>
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-2">
          <span className={`agent-text-${type} font-bold`}>
            {icons[type]}
          </span>
          <div>
            <h4 className={`agent-text-${type} font-medium`}>
              {title}
            </h4>
            <p className={`agent-text-${type} opacity-80 text-sm mt-1`}>
              {message}
            </p>
          </div>
        </div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className={`agent-text-${type} opacity-60 hover:opacity-100`}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};
```

### Visual Consistency Patterns

#### Component Spacing
```typescript
// Consistent spacing patterns matching dashboard
const SPACING = {
  xs: 'space-y-1',      // 4px - tight elements
  sm: 'space-y-2',      // 8px - form elements
  md: 'space-y-4',      // 16px - card content
  lg: 'space-y-6',      // 24px - sections
  xl: 'space-y-8',      // 32px - major sections
} as const;

// Usage in components
const StrategyCard: React.FC = () => (
  <div className="agent-card p-6">
    <div className={SPACING.md}>
      <h3 className="agent-text-primary font-semibold">Strategy Name</h3>
      <p className="agent-text-secondary">Description</p>
      <div className="flex space-x-3">
        <button className="agent-btn agent-btn-primary">Edit</button>
        <button className="agent-btn agent-btn-secondary">Delete</button>
      </div>
    </div>
  </div>
);
```

#### Typography Hierarchy
```typescript
// Consistent text sizing matching dashboard
const TEXT_STYLES = {
  h1: 'agent-text-primary text-3xl font-bold',
  h2: 'agent-text-primary text-2xl font-semibold',
  h3: 'agent-text-primary text-xl font-semibold',
  h4: 'agent-text-primary text-lg font-medium',
  body: 'agent-text-primary text-base',
  caption: 'agent-text-secondary text-sm',
  muted: 'agent-text-muted text-sm',
} as const;

// Usage
const ContentSection: React.FC = () => (
  <section className="space-y-4">
    <h2 className={TEXT_STYLES.h2}>Section Title</h2>
    <p className={TEXT_STYLES.body}>Main content</p>
    <p className={TEXT_STYLES.caption}>Additional information</p>
  </section>
);
```

## Migration Guide

### Updating Existing Components

#### From Hardcoded Colors
```typescript
// Before
const oldStyle = {
  backgroundColor: '#0ea5e9',
  color: '#ffffff',
  border: '1px solid #e2e8f0'
};

// After
const newStyle = {
  backgroundColor: 'var(--agent-primary)',
  color: 'var(--agent-text-inverse)',
  border: '1px solid var(--agent-border)'
};

// Or better, use utility classes
<div className="agent-bg-primary agent-text-inverse border agent-border">
```

#### From Tailwind Classes
```typescript
// Before
<button className="bg-blue-500 text-white border-gray-300">

// After
<button className="agent-bg-primary agent-text-inverse agent-border">

// Or use component classes
<button className="agent-btn agent-btn-primary">
```

#### From Dashboard Components
```typescript
// Dashboard component
const DashboardButton = () => (
  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
    Dashboard Action
  </button>
);

// Migrated agent component (visually identical)
const AgentButton = () => (
  <button className="agent-btn agent-btn-primary">
    Agent Action
  </button>
);
```

### Adding New Components

1. **Start with utility classes**: Use provided `agent-*` classes
2. **Match dashboard patterns**: Ensure visual consistency with existing dashboard components
3. **Add custom CSS variables**: If needed, extend the theme system following naming conventions
4. **Test accessibility**: Validate contrast and screen reader support
5. **Test theme switching**: Verify component works in both light and dark modes
6. **Document usage**: Add examples to style guide and update color mappings

## Resources

### Documentation
- [Color Mappings](./color-mappings.md) - Complete color reference
- [Style Guide](./style-guide.md) - Visual examples and usage
- [Theme Adapter API](../config/theme-adapter.ts) - Technical implementation

### Tools
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/) - Accessibility testing
- [React DevTools](https://react.dev/learn/react-developer-tools) - Component debugging

### Testing
- Jest + Testing Library for unit tests
- Storybook for visual testing
- axe-core for accessibility testing
- Chromatic for visual regression testing