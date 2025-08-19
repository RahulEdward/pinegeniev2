# Subscription Limitations Design Document

## Overview

This design document outlines the technical implementation for enforcing subscription-based limitations across the Pine Genie application. The system will implement a comprehensive access control mechanism that restricts features based on user subscription plans while providing clear upgrade paths.

## Architecture

### Core Components

1. **Subscription Guard System**: Centralized access control
2. **Limitation Enforcement**: Feature-specific restriction logic
3. **Upgrade Prompt System**: Consistent upgrade messaging
4. **Plan-Aware UI Components**: Dynamic interface adaptation
5. **Storage Management**: Strategy count enforcement
6. **Navigation Control**: Menu and routing restrictions

## Components and Interfaces

### 1. Subscription Guard System

```typescript
// Enhanced subscription hook with limitation checks
interface SubscriptionLimitations {
  canSaveStrategy: boolean;
  canUseAI: boolean;
  canAccessPremiumTemplates: boolean;
  strategiesUsed: number;
  strategiesLimit: number;
  upgradeRequired: string[]; // List of blocked features
}

interface UseSubscriptionReturn {
  subscription: UserSubscription | null;
  limitations: SubscriptionLimitations;
  checkAccess: (feature: string) => boolean;
  getRemainingQuota: (resource: string) => number;
  isLoading: boolean;
}
```

### 2. Strategy Storage Guard

```typescript
// Strategy save limitation component
interface StrategyStorageGuardProps {
  onSaveAttempt: () => void;
  onUpgradePrompt: () => void;
  children: React.ReactNode;
}

// Strategy management with limitations
interface StrategyLimitationState {
  canSave: boolean;
  hasReachedLimit: boolean;
  existingStrategies: Strategy[];
  showUpgradeModal: boolean;
  showDeletePrompt: boolean;
}
```

### 3. AI Assistant Restrictions

```typescript
// AI feature blocking system
interface AIAccessGuardProps {
  feature: 'chat' | 'assistant' | 'optimization';
  fallbackComponent?: React.ComponentType;
  upgradePrompt?: boolean;
}

// AI component states
interface AIRestrictionState {
  isBlocked: boolean;
  blockReason: string;
  upgradeMessage: string;
  alternativeActions: string[];
}
```

### 4. Template Access Control

```typescript
// Template filtering and access
interface TemplateAccessControl {
  filterTemplatesByPlan: (templates: Template[]) => Template[];
  isTemplateAccessible: (templateId: string) => boolean;
  getTemplateRestrictionMessage: (templateId: string) => string;
}

// Template component with restrictions
interface RestrictedTemplateProps {
  template: Template;
  isAccessible: boolean;
  onUpgradeClick: () => void;
}
```

### 5. Upgrade Prompt System

```typescript
// Centralized upgrade messaging
interface UpgradePromptConfig {
  trigger: 'strategy_limit' | 'ai_access' | 'premium_template' | 'navigation';
  title: string;
  description: string;
  benefits: string[];
  ctaText: string;
  dismissible: boolean;
  showComparison: boolean;
}

interface UpgradePromptManager {
  showPrompt: (config: UpgradePromptConfig) => void;
  dismissPrompt: (trigger: string, duration?: number) => void;
  shouldShowPrompt: (trigger: string) => boolean;
}
```

## Data Models

### Enhanced Subscription Plan Structure

```typescript
interface SubscriptionPlanLimits {
  // Storage limitations
  strategiesLimit: number; // -1 for unlimited
  templatesAccess: 'basic' | 'all';
  
  // Feature access
  aiChatAccess: boolean;
  aiAssistantAccess: boolean;
  premiumTemplatesAccess: boolean;
  
  // Export and sharing
  exportFormats: string[];
  sharingEnabled: boolean;
  
  // UI features
  customSignatures: boolean;
  advancedIndicators: boolean;
  backtesting: boolean;
}

interface UserSubscriptionStatus {
  planId: string;
  planName: string;
  limits: SubscriptionPlanLimits;
  usage: {
    strategiesCount: number;
    aiUsageThisMonth: number;
    templatesUsed: string[];
  };
  isActive: boolean;
  expiresAt?: Date;
}
```

### Strategy Storage Tracking

```typescript
interface StrategyStorageInfo {
  userId: string;
  strategiesCount: number;
  strategiesLimit: number;
  canSaveNew: boolean;
  strategies: {
    id: string;
    name: string;
    createdAt: Date;
    lastModified: Date;
  }[];
}
```

## Implementation Strategy

### Phase 1: Core Infrastructure

1. **Enhanced Subscription Hook**
   - Extend `useSubscription` with limitation checking
   - Add real-time quota tracking
   - Implement caching for performance

2. **Access Control Components**
   - Create reusable guard components
   - Implement feature-specific restrictions
   - Add upgrade prompt integration

3. **Database Updates**
   - Add usage tracking tables
   - Update subscription plan data
   - Implement quota counting queries

### Phase 2: Feature Restrictions

1. **Strategy Storage Limitation**
   - Implement save blocking logic
   - Add strategy management UI
   - Create deletion/upgrade flows

2. **AI Feature Blocking**
   - Disable AI assistant in builder
   - Block AI chat access
   - Add upgrade prompts to AI features

3. **Template Access Control**
   - Filter templates by plan
   - Add premium template markers
   - Implement access restriction UI

### Phase 3: UI/UX Integration

1. **Navigation Updates**
   - Add plan indicators to menu items
   - Implement restricted item styling
   - Create upgrade-focused navigation

2. **Dashboard Enhancements**
   - Add usage indicators
   - Show plan limitations clearly
   - Integrate upgrade prompts

3. **Upgrade Flow Optimization**
   - Create contextual upgrade prompts
   - Implement prompt dismissal logic
   - Add conversion tracking

## Error Handling

### Limitation Violations

```typescript
class SubscriptionLimitationError extends Error {
  constructor(
    public feature: string,
    public limitation: string,
    public upgradeRequired: boolean = true
  ) {
    super(`Access denied: ${limitation}`);
  }
}

interface LimitationHandler {
  handleViolation: (error: SubscriptionLimitationError) => void;
  showUpgradePrompt: (feature: string) => void;
  logLimitationHit: (feature: string, userId: string) => void;
}
```

### Graceful Degradation

1. **Feature Unavailable States**
   - Show informative placeholders
   - Provide alternative actions
   - Maintain app functionality

2. **Data Consistency**
   - Handle plan downgrades gracefully
   - Preserve user data during transitions
   - Implement data archiving for excess content

3. **Network Failures**
   - Cache subscription status
   - Implement offline limitation checking
   - Graceful fallback to last known state

## Testing Strategy

### Unit Tests
- Subscription limitation logic
- Access control components
- Upgrade prompt system
- Storage quota calculations

### Integration Tests
- End-to-end limitation enforcement
- Plan upgrade/downgrade flows
- Cross-component restriction consistency
- Database quota tracking accuracy

### User Experience Tests
- Limitation discovery flows
- Upgrade prompt effectiveness
- Feature restriction clarity
- Plan transition smoothness

## Performance Considerations

### Caching Strategy
- Cache subscription status in memory
- Implement quota checking optimization
- Use React Query for subscription data
- Minimize database calls for limitation checks

### Real-time Updates
- WebSocket updates for plan changes
- Immediate UI updates on subscription changes
- Efficient quota recalculation
- Optimistic UI updates where appropriate

## Security Considerations

### Access Control
- Server-side limitation enforcement
- API endpoint protection
- Client-side restrictions as UX enhancement only
- Audit logging for limitation violations

### Data Protection
- Secure storage of subscription data
- Encrypted quota information
- Protected upgrade flow data
- Compliance with data retention policies

## Monitoring and Analytics

### Limitation Tracking
- Track limitation hit rates
- Monitor upgrade conversion rates
- Analyze feature restriction impact
- Measure user satisfaction with limitations

### Performance Monitoring
- Subscription check performance
- Quota calculation efficiency
- UI responsiveness with restrictions
- Database query optimization

## Migration Strategy

### Existing Users
- Grandfather existing free users appropriately
- Migrate existing strategies to new quota system
- Update subscription data structure
- Communicate changes clearly

### Rollout Plan
1. Deploy infrastructure changes
2. Enable limitations for new users
3. Gradually apply to existing users
4. Monitor and adjust based on feedback

This design ensures a comprehensive, user-friendly implementation of subscription limitations that drives upgrades while maintaining a positive user experience.