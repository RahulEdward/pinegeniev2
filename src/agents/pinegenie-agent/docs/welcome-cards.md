# PineGenie AI Welcome Cards Component

## Overview

The Welcome Cards component provides an interactive, personalized introduction to the PineGenie AI agent capabilities. It follows Kiro-style design principles with smooth animations, engaging hover effects, and personalized content based on user history, while maintaining the specific visual identity of PineGenie AI.

## Features

- **Personalized Greeting**: Displays time-based greetings (Good morning/afternoon/evening) with the user's name if available
- **User History Integration**: Shows personalized messages based on previous Pine Script strategy activity
- **Interactive Cards**: Clickable cards with hover effects that guide users to common Pine Script tasks
- **Animated Icons**: Each card features unique icon animations on hover for visual engagement
- **Theme Integration**: Fully integrated with the PineGenie theme system for consistent styling
- **Advanced Options**: Additional button for accessing advanced Pine Script features

## Component Structure

- `WelcomeCards`: Main container component that handles personalization and layout
- `WelcomeCard`: Individual card component with hover effects and animations
- Supporting CSS: Custom animations defined in welcome-cards.css

## Usage

```tsx
import WelcomeCards from '../components/WelcomeCards';

// Basic usage
<WelcomeCards 
  onCardClick={(prompt) => handlePrompt(prompt)}
/>

// With user personalization
<WelcomeCards 
  userName="Alex"
  userHistory={{
    strategies: 5,
    conversations: 12,
    lastStrategy: "RSI Divergence Strategy"
  }}
  onCardClick={(prompt) => handlePrompt(prompt)}
/>
```

## Props

### WelcomeCards Props

| Prop | Type | Description |
|------|------|-------------|
| `userName` | `string` (optional) | User's name for personalized greeting |
| `userHistory` | `object` (optional) | User's history data for personalization |
| `userHistory.strategies` | `number` | Number of Pine Script strategies created |
| `userHistory.conversations` | `number` | Number of conversations had |
| `userHistory.lastStrategy` | `string` (optional) | Name of last strategy created |
| `onCardClick` | `(prompt: string) => void` | Callback when a card is clicked |

### WelcomeCard Props (Internal)

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Card title |
| `description` | `string` | Card description |
| `icon` | `React.ReactNode` | Icon component |
| `onClick` | `() => void` | Click handler |
| `delay` | `number` (optional) | Animation delay in tenths of seconds |
| `primaryColor` | `boolean` (optional) | Whether to use primary color styling |
| `iconClass` | `string` (optional) | CSS class for icon animation type |

## Animations

The component includes several animations specifically designed for PineGenie AI:

### Card Animations
- Staggered card appearance on initial render
- Hover effects with elevation and scale changes
- Smooth transitions for all interactive elements

### Icon Animations
- `spin-on-hover`: Rotates the icon 360 degrees
- `bounce-on-hover`: Makes the icon bounce up and down
- `scale-on-hover`: Scales the icon up and down
- `pulse-on-hover`: Creates a pulsing effect for the icon

### Other Animations
- Avatar glow effect for the bot icon
- Personalized message fade-in
- Button hover effects

## PineGenie AI Specific Features

The welcome cards are specifically designed for PineGenie AI with:

1. **Trading-Focused Content**: All cards focus on Pine Script and trading strategy development
2. **Specialized Icons**: Using trading-related icons (TrendingUp, BookOpen, Zap, etc.)
3. **PineGenie Color Scheme**: Using the PineGenie color palette through the theme adapter
4. **Trading Terminology**: Descriptions use proper TradingView and Pine Script terminology

## Accessibility

- All interactive elements are properly accessible with keyboard navigation
- Color contrast follows WCAG guidelines through the theme adapter
- Proper semantic HTML structure for screen readers
- Hover states have visible focus indicators

## Integration with Chat Interface

The Welcome Cards component is designed to be displayed when no messages are present in the chat interface. It provides a starting point for users to engage with the PineGenie AI agent by:

1. Suggesting common Pine Script tasks
2. Providing quick-start prompts for strategy creation
3. Showing personalized history and previous strategies
4. Offering voice command capabilities

## Customization

The cards can be customized by modifying the `WelcomeCards.tsx` component:

- Add new cards by extending the grid layout
- Modify existing cards to highlight different capabilities
- Change animation types by updating the `iconClass` prop
- Add new animation types in the welcome-cards.css file

## Example Card Types

1. **Create Trading Strategy**: Generates Pine Script code from natural language
2. **Learn Pine Script**: Provides educational content about Pine Script syntax
3. **Optimize Strategy**: Helps improve existing strategies with better performance
4. **Voice Commands**: Enables voice interaction for hands-free strategy creation
5. **Advanced Options**: Access to more complex Pine Script features