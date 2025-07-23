# Agent Theme Style Guide

## Overview

This style guide demonstrates proper usage of colors in the Kiro-Style Pine Script Agent interface. It provides visual examples and guidelines for maintaining theme consistency across all agent components.

## Color Usage Examples

### Primary Actions

#### Primary Buttons
```html
<!-- Primary button - main actions -->
<button class="agent-btn agent-btn-primary">
  Generate Strategy
</button>

<!-- Primary button hover state -->
<button class="agent-btn agent-btn-primary hover:bg-[var(--agent-primary-hover)]">
  Generate Strategy
</button>
```

**Visual Result:**
- Background: `#0ea5e9` (primary-500)
- Text: `#ffffff` (white)
- Hover: `#0284c7` (primary-600)
- Active: `#0369a1` (primary-700)

#### Secondary Buttons
```html
<!-- Secondary button - less prominent actions -->
<button class="agent-btn agent-btn-secondary">
  Cancel
</button>
```

**Visual Result:**
- Background: `#f8fafc` (secondary-50) in light mode
- Background: `#0f172a` (secondary-900) in dark mode
- Border: `#e2e8f0` (secondary-200) in light mode
- Text: Primary text color

### Text Hierarchy

#### Primary Text
```html
<h1 class="agent-text-primary text-2xl font-bold">
  Pine Script Strategy Generator
</h1>

<p class="agent-text-primary">
  Main content and important information uses primary text color.
</p>
```

**Visual Result:**
- Light mode: `#171717` (foreground)
- Dark mode: `#ededed` (foreground)

#### Secondary Text
```html
<p class="agent-text-secondary">
  Descriptions, labels, and less important content.
</p>

<span class="agent-text-secondary text-sm">
  Last updated 2 minutes ago
</span>
```

**Visual Result:**
- Light mode: `#475569` (secondary-600)
- Dark mode: `#cbd5e1` (secondary-300)

#### Muted Text
```html
<input 
  type="text" 
  placeholder="Enter your strategy description..."
  class="agent-input"
/>

<p class="agent-text-muted text-sm">
  Optional field - leave blank for default settings
</p>
```

**Visual Result:**
- Light mode: `#64748b` (secondary-500)
- Dark mode: `#94a3b8` (secondary-400)

### Status Indicators

#### Success States
```html
<div class="agent-status-success">
  ✓ Strategy generated successfully
</div>

<div class="agent-bg-success p-4 rounded-lg">
  <p class="agent-text-success font-medium">Success</p>
  <p class="agent-text-success opacity-80">
    Your Pine Script code has been validated and is ready to use.
  </p>
</div>
```

**Visual Result:**
- Text: `#22c55e` (success-500)
- Background light: `#f0fdf4` (success-50)
- Background dark: `#14532d` (success-900)

#### Warning States
```html
<div class="agent-status-warning">
  ⚠ Code validation warnings detected
</div>

<div class="agent-bg-warning p-4 rounded-lg">
  <p class="agent-text-warning font-medium">Warning</p>
  <p class="agent-text-warning opacity-80">
    Some indicators may not work on all timeframes.
  </p>
</div>
```

**Visual Result:**
- Text: `#f59e0b` (warning-500)
- Background light: `#fffbeb` (warning-50)
- Background dark: `#78350f` (warning-900)

#### Error States
```html
<div class="agent-status-error">
  ✗ Syntax error in generated code
</div>

<div class="agent-bg-error p-4 rounded-lg">
  <p class="agent-text-error font-medium">Error</p>
  <p class="agent-text-error opacity-80">
    Invalid Pine Script syntax detected on line 15.
  </p>
</div>
```

**Visual Result:**
- Text: `#ef4444` (danger-500)
- Background light: `#fef2f2` (danger-50)
- Background dark: `#7f1d1d` (danger-900)

#### Info States
```html
<div class="agent-status-info">
  ℹ Strategy template loaded
</div>

<div class="agent-bg-info p-4 rounded-lg">
  <p class="agent-text-info font-medium">Information</p>
  <p class="agent-text-info opacity-80">
    Using trend-following template with RSI indicator.
  </p>
</div>
```

**Visual Result:**
- Text: `#0ea5e9` (primary-500)
- Background light: `#f0f9ff` (primary-50)
- Background dark: `#0c4a6e` (primary-900)

### Chat Interface

#### User Messages
```html
<div class="agent-chat-user-bubble p-3 rounded-lg max-w-xs ml-auto">
  Create a strategy that buys when RSI is below 30 and sells when above 70
</div>
```

**Visual Result:**
- Background: `#0ea5e9` (primary-500)
- Text: `#ffffff` (white)
- Alignment: Right-aligned
- Shape: Rounded corners

#### Agent Messages
```html
<div class="agent-chat-agent-bubble p-3 rounded-lg max-w-xs mr-auto">
  I'll create an RSI-based mean reversion strategy for you. Let me generate the Pine Script code with proper risk management.
</div>
```

**Visual Result:**
- Background light: `#f1f5f9` (secondary-100)
- Background dark: `#1e293b` (secondary-800)
- Text: Primary text color
- Alignment: Left-aligned
- Shape: Rounded corners

#### Chat Input
```html
<div class="flex items-center space-x-2">
  <input 
    type="text"
    placeholder="Describe your trading strategy..."
    class="agent-chat-input flex-1 px-4 py-2 rounded-lg"
  />
  <button class="agent-btn agent-btn-primary px-4 py-2">
    Send
  </button>
</div>
```

**Visual Result:**
- Background light: `#ffffff`
- Background dark: `#0f172a` (secondary-900)
- Border light: `#cbd5e1` (secondary-300)
- Border dark: `#334155` (secondary-700)
- Focus: Primary color border with subtle shadow

### Cards and Surfaces

#### Strategy Cards
```html
<div class="agent-card p-6 hover:shadow-md transition-shadow">
  <h3 class="agent-text-primary font-semibold mb-2">
    Trend Following Strategy
  </h3>
  <p class="agent-text-secondary mb-4">
    Uses moving average crossovers to identify trend direction
  </p>
  <div class="flex justify-between items-center">
    <span class="agent-status-success">Active</span>
    <button class="agent-btn agent-btn-secondary text-sm">
      Edit
    </button>
  </div>
</div>
```

**Visual Result:**
- Background: Surface color with subtle border
- Hover: Slightly elevated with shadow
- Content: Proper text hierarchy
- Actions: Secondary button styling

#### Code Preview
```html
<div class="agent-card">
  <div class="flex justify-between items-center p-4 border-b agent-border">
    <h4 class="agent-text-primary font-medium">Generated Pine Script</h4>
    <button class="agent-btn agent-btn-secondary text-sm">
      Copy Code
    </button>
  </div>
  <div class="p-4 bg-gray-50 dark:bg-gray-900 font-mono text-sm">
    <pre class="agent-text-primary">
//@version=6
strategy("RSI Mean Reversion", overlay=true)

// Input parameters
rsi_length = input.int(14, "RSI Length")
rsi_oversold = input.int(30, "RSI Oversold")
rsi_overbought = input.int(70, "RSI Overbought")
    </pre>
  </div>
</div>
```

**Visual Result:**
- Header: Clear separation with border
- Code area: Monospace font with syntax highlighting
- Background: Subtle code background color
- Actions: Consistent button styling

### Form Elements

#### Input Fields
```html
<div class="space-y-4">
  <div>
    <label class="agent-text-primary font-medium block mb-2">
      Strategy Name
    </label>
    <input 
      type="text"
      class="agent-input w-full"
      placeholder="Enter strategy name..."
    />
  </div>
  
  <div>
    <label class="agent-text-primary font-medium block mb-2">
      Description
    </label>
    <textarea 
      class="agent-input w-full h-24 resize-none"
      placeholder="Describe your strategy..."
    ></textarea>
  </div>
</div>
```

**Visual Result:**
- Labels: Primary text color, medium weight
- Inputs: Consistent styling with theme colors
- Placeholders: Muted text color
- Focus: Primary color border and shadow

#### Select Dropdowns
```html
<div>
  <label class="agent-text-primary font-medium block mb-2">
    Strategy Type
  </label>
  <select class="agent-input w-full">
    <option value="">Select strategy type...</option>
    <option value="trend">Trend Following</option>
    <option value="mean">Mean Reversion</option>
    <option value="breakout">Breakout</option>
  </select>
</div>
```

**Visual Result:**
- Consistent with input styling
- Proper option contrast
- Accessible focus states

### Interactive States

#### Hover Effects
```html
<!-- Button hover -->
<button class="agent-btn agent-btn-primary agent-hover-primary">
  Hover me
</button>

<!-- Card hover -->
<div class="agent-card agent-hover-surface cursor-pointer">
  <p class="agent-text-primary">Hoverable card</p>
</div>

<!-- Border hover -->
<div class="border-2 agent-border agent-border-hover p-4">
  <p class="agent-text-primary">Hover for border change</p>
</div>
```

**Visual Result:**
- Smooth transitions (200ms)
- Consistent hover states
- Proper visual feedback

#### Focus States
```html
<button class="agent-btn agent-btn-primary agent-focus-visible">
  Focusable button
</button>

<input 
  type="text"
  class="agent-input agent-focus-visible"
  placeholder="Focusable input"
/>
```

**Visual Result:**
- Clear focus indicators
- Primary color focus rings
- Accessible contrast ratios

## Theme Consistency Examples

### Dashboard to Agent Visual Continuity

#### Consistent Navigation Pattern
```html
<!-- Dashboard Navigation Style -->
<nav class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
  <div class="flex space-x-4">
    <a href="#" class="text-blue-500 border-b-2 border-blue-500 px-3 py-2">
      Active Tab
    </a>
    <a href="#" class="text-gray-600 dark:text-gray-300 px-3 py-2">
      Inactive Tab
    </a>
  </div>
</nav>

<!-- Agent Navigation Style (Consistent) -->
<nav class="agent-bg-surface border-b agent-border">
  <div class="flex space-x-4">
    <button class="agent-text-primary border-b-2 border-[var(--agent-primary)] px-3 py-2">
      Active Tab
    </button>
    <button class="agent-text-secondary px-3 py-2">
      Inactive Tab
    </button>
  </div>
</nav>
```

#### Consistent Button Patterns
```html
<!-- Dashboard Primary Button -->
<button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
  Dashboard Action
</button>

<!-- Agent Primary Button (Visually Identical) -->
<button class="agent-btn agent-btn-primary">
  Agent Action
</button>
```

#### Consistent Status Indicators
```html
<!-- Dashboard Success Message -->
<div class="bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400 p-3 rounded">
  ✓ Operation successful
</div>

<!-- Agent Success Message (Visually Identical) -->
<div class="agent-bg-success agent-text-success p-3 rounded">
  ✓ Operation successful
</div>
```

### Complete Interface Examples

#### Light Mode Layout
```html
<div class="agent-bg-background min-h-screen">
  <!-- Header matches dashboard header styling -->
  <header class="agent-bg-surface border-b agent-border p-4">
    <div class="flex justify-between items-center">
      <h1 class="agent-text-primary text-xl font-bold">
        Pine Script Agent
      </h1>
      <div class="flex items-center space-x-3">
        <span class="agent-status-success">Connected</span>
        <button class="agent-btn agent-btn-secondary text-sm">
          Settings
        </button>
      </div>
    </div>
  </header>
  
  <!-- Main content area -->
  <main class="p-6">
    <!-- Welcome card with consistent styling -->
    <div class="agent-card p-6 mb-6">
      <h2 class="agent-text-primary text-lg font-semibold mb-4">
        Strategy Generator
      </h2>
      <p class="agent-text-secondary mb-4">
        Describe your trading strategy in natural language and I'll generate Pine Script code for you.
      </p>
      <div class="flex space-x-3">
        <button class="agent-btn agent-btn-primary">
          Get Started
        </button>
        <button class="agent-btn agent-btn-secondary">
          View Examples
        </button>
      </div>
    </div>
    
    <!-- Chat interface -->
    <div class="agent-card p-6">
      <div class="space-y-4 mb-4 max-h-96 overflow-y-auto">
        <!-- Agent message -->
        <div class="flex justify-start">
          <div class="agent-chat-agent-bubble p-3 rounded-lg max-w-xs">
            Hello! I'm ready to help you create Pine Script strategies. What kind of trading strategy would you like to build?
          </div>
        </div>
        
        <!-- User message -->
        <div class="flex justify-end">
          <div class="agent-chat-user-bubble p-3 rounded-lg max-w-xs">
            I want to create a strategy that uses RSI and moving averages
          </div>
        </div>
      </div>
      
      <!-- Input area -->
      <div class="flex items-center space-x-2">
        <input 
          type="text"
          placeholder="Describe your strategy..."
          class="agent-chat-input flex-1 px-4 py-2 rounded-lg"
        />
        <button class="agent-btn agent-btn-primary px-4 py-2">
          Send
        </button>
      </div>
    </div>
  </main>
</div>
```

#### Dark Mode Layout
The same HTML automatically adapts to dark mode through CSS variables and the `.dark` class on the root element. Key adaptations include:

- **Backgrounds**: Automatically switch to dark surfaces
- **Text**: Adjusts to maintain proper contrast
- **Borders**: Become lighter to remain visible on dark backgrounds
- **Status Colors**: Background colors adapt while maintaining semantic meaning

#### Mobile Responsive Layout
```html
<div class="agent-bg-background min-h-screen">
  <!-- Mobile-optimized header -->
  <header class="agent-bg-surface border-b agent-border p-4">
    <div class="flex justify-between items-center">
      <h1 class="agent-text-primary text-lg md:text-xl font-bold">
        Pine Script Agent
      </h1>
      <button class="agent-btn agent-btn-secondary text-sm px-3 py-1">
        Menu
      </button>
    </div>
  </header>
  
  <!-- Mobile-friendly content -->
  <main class="p-4 md:p-6">
    <div class="agent-card p-4 md:p-6 mb-4 md:mb-6">
      <h2 class="agent-text-primary text-base md:text-lg font-semibold mb-3 md:mb-4">
        Strategy Generator
      </h2>
      <p class="agent-text-secondary text-sm md:text-base mb-4">
        Create Pine Script strategies with natural language
      </p>
      <button class="agent-btn agent-btn-primary w-full md:w-auto">
        Get Started
      </button>
    </div>
    
    <!-- Mobile chat interface -->
    <div class="agent-card p-4 md:p-6">
      <div class="space-y-3 mb-4 max-h-64 md:max-h-96 overflow-y-auto">
        <div class="agent-chat-agent-bubble p-2 md:p-3 rounded-lg text-sm md:text-base">
          Mobile-optimized message
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <input 
          type="text"
          placeholder="Type here..."
          class="agent-chat-input flex-1 px-3 py-2 text-sm md:text-base rounded-lg"
        />
        <button class="agent-btn agent-btn-primary px-3 py-2 text-sm">
          Send
        </button>
      </div>
    </div>
  </main>
</div>
```

## Accessibility Guidelines

### Color Contrast Requirements

#### WCAG AA Compliance
- **Normal text**: 4.5:1 minimum contrast ratio
- **Large text**: 3:1 minimum contrast ratio
- **Interactive elements**: Clear focus indicators

#### Validated Combinations
✅ **Safe to use:**
- Primary text on background
- Secondary text on surface
- White text on primary colors
- Status colors on their designated backgrounds

❌ **Avoid:**
- Muted text on surface (may fail contrast)
- Colored text on colored backgrounds
- Status colors on wrong backgrounds

### Focus Management
```html
<!-- Proper focus indicators -->
<button class="agent-btn agent-btn-primary focus:ring-2 focus:ring-offset-2 focus:ring-[var(--agent-primary)]">
  Accessible button
</button>

<input 
  type="text"
  class="agent-input focus:border-[var(--agent-primary)] focus:ring-1 focus:ring-[var(--agent-primary)]"
/>
```

### Screen Reader Support
```html
<!-- Proper labeling -->
<button 
  class="agent-btn agent-btn-primary"
  aria-label="Generate Pine Script strategy"
>
  Generate
</button>

<!-- Status announcements -->
<div 
  class="agent-status-success"
  role="status"
  aria-live="polite"
>
  Strategy generated successfully
</div>
```

## Responsive Design

### Mobile Adaptations
```html
<!-- Mobile-friendly chat -->
<div class="flex flex-col space-y-2 md:space-y-4">
  <div class="agent-chat-user-bubble p-2 md:p-3 text-sm md:text-base">
    Mobile message
  </div>
</div>

<!-- Responsive buttons -->
<button class="agent-btn agent-btn-primary w-full md:w-auto">
  Full width on mobile
</button>
```

### Touch Targets
- Minimum 44px touch targets
- Adequate spacing between interactive elements
- Proper hover states for touch devices

## Print Styles

The theme includes print-optimized styles:

```css
@media print {
  .agent-chat-user-bubble,
  .agent-chat-agent-bubble {
    background-color: transparent !important;
    color: black !important;
    border: 1px solid black;
  }
}
```

## Performance Considerations

### CSS Variable Usage
- Use CSS variables for all theme colors
- Avoid hardcoded color values
- Leverage CSS custom property inheritance

### Animation Performance
- Use `transform` and `opacity` for animations
- Respect `prefers-reduced-motion`
- Keep transitions under 300ms

## Testing Checklist

### Visual Testing
- [ ] All colors render correctly in light mode
- [ ] All colors render correctly in dark mode
- [ ] Theme switching is smooth and complete
- [ ] High contrast mode works properly
- [ ] Print styles maintain readability

### Accessibility Testing
- [ ] All text meets contrast requirements
- [ ] Focus indicators are visible
- [ ] Screen readers announce status changes
- [ ] Keyboard navigation works properly
- [ ] Color is not the only way to convey information

### Cross-browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers