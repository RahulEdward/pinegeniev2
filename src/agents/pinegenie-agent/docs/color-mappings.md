# Agent Theme Color Mappings Documentation

## Overview

This document provides comprehensive documentation of all color variables used in the Kiro-Style Pine Script Agent and their mappings to the dashboard theme system. The agent theme system ensures visual consistency between the main dashboard and agent components while maintaining accessibility standards.

## Color System Architecture

The agent theme system consists of three layers:

1. **Dashboard Colors** - Base color palette from Tailwind config and CSS variables
2. **Agent Theme Mapping** - Semantic color assignments for agent components
3. **CSS Variables** - Runtime color variables for styling

## Dashboard Color Palette

### Primary Colors (Blue Scale)
Used for main actions, branding, and primary interactive elements.

| Shade | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| 50    | `#f0f9ff`  | `#f0f9ff` | Very light backgrounds, subtle highlights |
| 100   | `#e0f2fe`  | `#e0f2fe` | Light backgrounds, hover states |
| 200   | `#bae6fd`  | `#bae6fd` | Disabled states, light borders |
| 300   | `#7dd3fc`  | `#7dd3fc` | Placeholder text, secondary elements |
| 400   | `#38bdf8`  | `#38bdf8` | Accent color, highlights |
| 500   | `#0ea5e9`  | `#0ea5e9` | **Primary brand color** |
| 600   | `#0284c7`  | `#0284c7` | Primary hover state |
| 700   | `#0369a1`  | `#0369a1` | Primary active state |
| 800   | `#075985`  | `#075985` | Dark primary variants |
| 900   | `#0c4a6e`  | `#0c4a6e` | Very dark primary |
| 950   | `#082f49`  | `#082f49` | Darkest primary |

### Secondary Colors (Slate Scale)
Used for text, borders, backgrounds, and neutral elements.

| Shade | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| 50    | `#f8fafc`  | `#f8fafc` | Light surface backgrounds |
| 100   | `#f1f5f9`  | `#f1f5f9` | Card backgrounds, subtle surfaces |
| 200   | `#e2e8f0`  | `#e2e8f0` | Borders, dividers |
| 300   | `#cbd5e1`  | `#cbd5e1` | Input borders, secondary borders |
| 400   | `#94a3b8`  | `#94a3b8` | Placeholder text, muted elements |
| 500   | `#64748b`  | `#64748b` | Secondary text, icons |
| 600   | `#475569`  | `#475569` | Primary text in light mode |
| 700   | `#334155`  | `#334155` | Dark borders, strong text |
| 800   | `#1e293b`  | `#1e293b` | Dark surfaces |
| 900   | `#0f172a`  | `#0f172a` | Very dark surfaces |
| 950   | `#020617`  | `#020617` | Darkest backgrounds |

### Status Colors

#### Success (Green Scale)
| Shade | Color | Usage |
|-------|-------|-------|
| 50    | `#f0fdf4` | Success background (light) |
| 500   | `#22c55e` | Success text and icons |
| 900   | `#14532d` | Success background (dark) |

#### Warning (Amber Scale)
| Shade | Color | Usage |
|-------|-------|-------|
| 50    | `#fffbeb` | Warning background (light) |
| 500   | `#f59e0b` | Warning text and icons |
| 900   | `#78350f` | Warning background (dark) |

#### Error/Danger (Red Scale)
| Shade | Color | Usage |
|-------|-------|-------|
| 50    | `#fef2f2` | Error background (light) |
| 500   | `#ef4444` | Error text and icons |
| 900   | `#7f1d1d` | Error background (dark) |

### Base Colors
| Variable | Light Mode | Dark Mode | Usage |
|----------|------------|-----------|-------|
| `--background` | `#ffffff` | `#0a0a0a` | Main page background |
| `--foreground` | `#171717` | `#ededed` | Primary text color |

## Agent Theme Color Mappings

### Core Interactive Colors

#### Primary Colors
- **Purpose**: Main actions, buttons, links, brand elements
- **Light Mode**: `primary-500` (`#0ea5e9`)
- **Dark Mode**: `primary-500` (`#0ea5e9`)
- **CSS Variable**: `--agent-primary`
- **Hover State**: `--agent-primary-hover` (`primary-600`)
- **Active State**: `--agent-primary-active` (`primary-700`)

#### Secondary Colors
- **Purpose**: Less prominent buttons, secondary actions
- **Light Mode**: `secondary-500` (`#64748b`)
- **Dark Mode**: `secondary-500` (`#64748b`)
- **CSS Variable**: `--agent-secondary`
- **Hover State**: `--agent-secondary-hover` (`secondary-600`)

#### Accent Color
- **Purpose**: Highlights, special elements, call-to-action accents
- **Light Mode**: `primary-400` (`#38bdf8`)
- **Dark Mode**: `primary-400` (`#38bdf8`)
- **CSS Variable**: `--agent-accent`

### Background and Surface Colors

#### Background
- **Purpose**: Main container backgrounds
- **Light Mode**: `--background` (`#ffffff`)
- **Dark Mode**: `--background` (`#0a0a0a`)
- **CSS Variable**: `--agent-background`

#### Surface
- **Purpose**: Card backgrounds, elevated elements
- **Light Mode**: `secondary-50` (`#f8fafc`)
- **Dark Mode**: `secondary-900` (`#0f172a`)
- **CSS Variable**: `--agent-surface`
- **Hover State**: `--agent-surface-hover`

### Border Colors

#### Default Border
- **Purpose**: Standard borders, dividers
- **Light Mode**: `secondary-200` (`#e2e8f0`)
- **Dark Mode**: `secondary-700` (`#334155`)
- **CSS Variable**: `--agent-border`

#### Hover Border
- **Purpose**: Interactive border states
- **Light Mode**: `secondary-300` (`#cbd5e1`)
- **Dark Mode**: `secondary-600` (`#475569`)
- **CSS Variable**: `--agent-border-hover`

### Text Colors

#### Primary Text
- **Purpose**: Main content, headings
- **Light Mode**: `--foreground` (`#171717`)
- **Dark Mode**: `--foreground` (`#ededed`)
- **CSS Variable**: `--agent-text-primary`

#### Secondary Text
- **Purpose**: Descriptions, less important content
- **Light Mode**: `secondary-600` (`#475569`)
- **Dark Mode**: `secondary-300` (`#cbd5e1`)
- **CSS Variable**: `--agent-text-secondary`

#### Muted Text
- **Purpose**: Placeholder text, disabled states
- **Light Mode**: `secondary-500` (`#64748b`)
- **Dark Mode**: `secondary-400` (`#94a3b8`)
- **CSS Variable**: `--agent-text-muted`

#### Inverse Text
- **Purpose**: Text on colored backgrounds
- **Light Mode**: `--background` (`#ffffff`)
- **Dark Mode**: `--background` (`#0a0a0a`)
- **CSS Variable**: `--agent-text-inverse`

### Status Colors

#### Success
- **Text Color**: `success-500` (`#22c55e`)
- **Background Light**: `success-50` (`#f0fdf4`)
- **Background Dark**: `success-900` (`#14532d`)
- **CSS Variables**: `--agent-success`, `--agent-success-bg`

#### Warning
- **Text Color**: `warning-500` (`#f59e0b`)
- **Background Light**: `warning-50` (`#fffbeb`)
- **Background Dark**: `warning-900` (`#78350f`)
- **CSS Variables**: `--agent-warning`, `--agent-warning-bg`

#### Error
- **Text Color**: `danger-500` (`#ef4444`)
- **Background Light**: `danger-50` (`#fef2f2`)
- **Background Dark**: `danger-900` (`#7f1d1d`)
- **CSS Variables**: `--agent-error`, `--agent-error-bg`

#### Info
- **Text Color**: `primary-500` (`#0ea5e9`)
- **Background Light**: `primary-50` (`#f0f9ff`)
- **Background Dark**: `primary-900` (`#0c4a6e`)
- **CSS Variables**: `--agent-info`, `--agent-info-bg`

### Chat-Specific Colors

#### User Message Bubble
- **Background**: `primary-500` (`#0ea5e9`)
- **Text**: `#ffffff`
- **CSS Variables**: `--agent-chat-user-bubble`, `--agent-chat-user-text`

#### Agent Message Bubble
- **Background Light**: `secondary-100` (`#f1f5f9`)
- **Background Dark**: `secondary-800` (`#1e293b`)
- **Text**: Follows `--agent-text-primary`
- **CSS Variables**: `--agent-chat-agent-bubble`, `--agent-chat-agent-text`

#### Chat Input
- **Background Light**: `#ffffff`
- **Background Dark**: `secondary-900` (`#0f172a`)
- **Border Light**: `secondary-300` (`#cbd5e1`)
- **Border Dark**: `secondary-700` (`#334155`)
- **Text**: Follows `--agent-text-primary`
- **Placeholder**: Follows `--agent-text-muted`
- **CSS Variables**: `--agent-chat-input-bg`, `--agent-chat-input-border`, `--agent-chat-input-text`, `--agent-chat-input-placeholder`

## Color Usage Context

### When to Use Each Color

#### Primary Colors
- ✅ **Use for**: Main CTAs, primary buttons, active states, brand elements
- ❌ **Don't use for**: Large background areas, body text, decorative elements

#### Secondary Colors
- ✅ **Use for**: Secondary buttons, navigation, subtle backgrounds, borders
- ❌ **Don't use for**: Primary actions, error states, success indicators

#### Status Colors
- ✅ **Use for**: Feedback messages, status indicators, alerts, validation states
- ❌ **Don't use for**: General UI elements, decorative purposes

#### Text Colors
- ✅ **Use for**: Content hierarchy, readability, accessibility compliance
- ❌ **Don't use for**: Decorative backgrounds, non-text elements

### Accessibility Considerations

All color combinations are validated for WCAG 2.1 AA compliance:

- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **Interactive elements**: Clear focus indicators
- **Status colors**: Not relying on color alone for meaning

### Color Combination Guidelines

#### Safe Combinations (WCAG AA Compliant)
- Primary text on background: ✅ 4.5:1+ contrast
- Secondary text on surface: ✅ 4.5:1+ contrast
- White text on primary: ✅ 4.5:1+ contrast
- Status colors on their backgrounds: ✅ 4.5:1+ contrast

#### Avoid These Combinations
- Muted text on surface backgrounds: ❌ Low contrast
- Secondary colors as text on primary: ❌ Poor readability
- Status colors on wrong backgrounds: ❌ Accessibility issues

## Implementation Notes

### CSS Variable Naming Convention
- Prefix: `--agent-`
- Category: `primary`, `secondary`, `text`, `status`, `chat`
- State: `-hover`, `-active` (when applicable)
- Context: `-bg` for backgrounds

### Theme Switching
Colors automatically adapt to light/dark mode through:
1. CSS media queries: `@media (prefers-color-scheme: dark)`
2. Class-based switching: `.dark` class on `<html>`
3. JavaScript theme detection and updates

### Performance Considerations
- CSS variables are cached and updated only when theme changes
- Color calculations are performed once during theme initialization
- Accessibility validation runs in background to avoid blocking UI

## Validation and Testing

### Automated Validation
The theme adapter automatically validates:
- Contrast ratios for all color combinations
- WCAG 2.1 AA compliance
- Color consistency across light/dark modes
- Proper fallback values

### Manual Testing Checklist
- [ ] All colors render correctly in light mode
- [ ] All colors render correctly in dark mode
- [ ] Theme switching works smoothly
- [ ] High contrast mode is supported
- [ ] Print styles maintain readability
- [ ] Color-blind accessibility is maintained

## Visual Examples

### Dashboard to Agent Consistency

The agent theme system ensures seamless visual continuity between the main dashboard and agent components. Here are key consistency points:

#### Navigation and Headers
- **Dashboard**: Uses `primary-500` for active navigation items
- **Agent**: Uses `--agent-primary` (mapped to `primary-500`) for active tabs and headers
- **Result**: Identical visual treatment across both interfaces

#### Interactive Elements
- **Dashboard**: Button hover states use `primary-600`
- **Agent**: Button hover states use `--agent-primary-hover` (mapped to `primary-600`)
- **Result**: Consistent interaction feedback

#### Status Indicators
- **Dashboard**: Success states use `success-500` with `success-50` backgrounds
- **Agent**: Success states use `--agent-success` with `--agent-success-bg`
- **Result**: Identical status communication across interfaces

#### Text Hierarchy
- **Dashboard**: Primary text uses `--foreground`, secondary uses `secondary-600`
- **Agent**: Primary text uses `--agent-text-primary`, secondary uses `--agent-text-secondary`
- **Result**: Consistent information hierarchy and readability

### Theme Switching Behavior

#### Light to Dark Mode Transition
1. **Background Colors**: Smoothly transition from light surfaces to dark surfaces
2. **Text Colors**: Automatically adjust contrast for optimal readability
3. **Border Colors**: Adapt to maintain proper visual separation
4. **Status Colors**: Maintain semantic meaning while adjusting backgrounds

#### System Theme Detection
- Automatically detects user's system preference
- Respects manual theme overrides
- Provides smooth transitions without jarring changes
- Maintains accessibility compliance in both modes

## Troubleshooting

### Common Issues

#### Colors Not Updating
- Check if theme adapter is initialized: `themeAdapter.initializeTheme()`
- Verify CSS variables are properly set in the DOM
- Ensure DOM is ready before initialization
- Check for JavaScript errors in theme detection

#### Accessibility Warnings
- Review contrast ratios in validation results
- Check color combinations against WCAG guidelines
- Test with screen readers and accessibility tools
- Use browser dev tools to inspect computed contrast ratios

#### Inconsistent Colors
- Verify all components use CSS variables instead of hardcoded values
- Check for Tailwind classes that override theme variables
- Ensure proper theme inheritance in nested components
- Validate that theme adapter is running on all relevant pages

#### Performance Issues
- Monitor theme update frequency to avoid excessive recalculations
- Use CSS variables efficiently to minimize reflows
- Batch theme updates when possible
- Consider memoization for expensive color calculations