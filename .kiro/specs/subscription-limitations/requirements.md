# Subscription Limitations Requirements

## Introduction

This document outlines the requirements for implementing subscription-based limitations across the Pine Genie application. The system needs to enforce different access levels and restrictions based on user subscription plans, starting with the Free plan limitations and extending to Pro plan features.

## Requirements

### Requirement 1: Free Plan Strategy Storage Limitation

**User Story:** As a free user, I want to be able to save only one strategy in my account, so that I understand the value of upgrading to a paid plan for unlimited storage.

#### Acceptance Criteria

1. WHEN a free user creates their first strategy THEN the system SHALL allow them to save it successfully
2. WHEN a free user attempts to save a second strategy THEN the system SHALL prevent the save and display an upgrade prompt
3. WHEN a free user has one saved strategy and wants to save another THEN the system SHALL offer options to either delete the existing strategy or upgrade to a paid plan
4. WHEN a free user deletes their existing strategy THEN the system SHALL allow them to save a new strategy
5. IF a free user tries to access the save functionality with an existing strategy THEN the system SHALL show a modal with upgrade options and strategy management choices

### Requirement 2: Free Plan AI Assistant Restrictions

**User Story:** As a free user, I want to understand that AI assistance is not available in my plan, so that I can make an informed decision about upgrading.

#### Acceptance Criteria

1. WHEN a free user accesses the strategy builder THEN the AI Assistant panel SHALL be disabled or hidden
2. WHEN a free user clicks on AI-related features THEN the system SHALL display an upgrade prompt explaining AI features are available in paid plans
3. WHEN a free user navigates to the AI chat page THEN the system SHALL redirect them to an upgrade page or show a paywall
4. IF a free user attempts to use any AI-powered features THEN the system SHALL consistently block access and show upgrade options

### Requirement 3: Free Plan Visual Builder Access

**User Story:** As a free user, I want full access to the drag-and-drop visual builder, so that I can experience the core value of Pine Genie before deciding to upgrade.

#### Acceptance Criteria

1. WHEN a free user accesses the strategy builder THEN the drag-and-drop interface SHALL be fully functional
2. WHEN a free user uses nodes, connections, and canvas features THEN all visual builder functionality SHALL work without restrictions
3. WHEN a free user generates Pine Script code from their visual strategy THEN the code generation SHALL work normally
4. WHEN a free user exports their strategy THEN the Pine Script export SHALL be available
5. IF a free user uses the visual builder THEN they SHALL have access to all node types and canvas features

### Requirement 4: Free Plan Template Access Restrictions

**User Story:** As a free user, I want access to basic templates only, so that I can get started while understanding that more advanced templates require a paid subscription.

#### Acceptance Criteria

1. WHEN a free user browses templates THEN the system SHALL show only basic/free templates
2. WHEN a free user attempts to access premium templates THEN the system SHALL show an upgrade prompt
3. WHEN a free user filters templates THEN premium templates SHALL be marked as "Pro" or "Premium" with upgrade prompts
4. IF a free user clicks on a premium template THEN the system SHALL display template details with an upgrade call-to-action
5. WHEN a free user uses a basic template THEN it SHALL work without any restrictions

### Requirement 5: Strategy Management Interface Updates

**User Story:** As a free user, I want clear visibility of my storage limitations in the dashboard and strategy management areas, so that I understand my current usage and upgrade options.

#### Acceptance Criteria

1. WHEN a free user views their dashboard THEN the system SHALL display their strategy count (1/1) with upgrade options
2. WHEN a free user is at their storage limit THEN all strategy creation buttons SHALL show upgrade prompts instead of creation flows
3. WHEN a free user views their saved strategies THEN the interface SHALL clearly indicate their plan limitations
4. WHEN a free user hovers over disabled features THEN tooltips SHALL explain the limitation and upgrade benefits
5. IF a free user reaches their limit THEN the system SHALL provide clear paths to either manage existing strategies or upgrade

### Requirement 6: Upgrade Prompts and Messaging

**User Story:** As a free user encountering limitations, I want clear and helpful upgrade prompts that explain the benefits of paid plans, so that I can make an informed upgrade decision.

#### Acceptance Criteria

1. WHEN a free user hits any limitation THEN the upgrade prompt SHALL clearly explain what they get with paid plans
2. WHEN upgrade prompts are shown THEN they SHALL include specific benefits relevant to the blocked feature
3. WHEN a free user sees upgrade messaging THEN it SHALL be consistent across all areas of the application
4. WHEN upgrade prompts appear THEN they SHALL include clear pricing and plan comparison information
5. IF a user dismisses an upgrade prompt THEN the system SHALL remember their choice and not show the same prompt repeatedly for a reasonable time period

### Requirement 7: Navigation and Access Control

**User Story:** As a free user, I want the application navigation to clearly indicate which features are available in my plan, so that I don't waste time trying to access restricted features.

#### Acceptance Criteria

1. WHEN a free user views the main navigation THEN restricted features SHALL be visually marked (grayed out, locked icon, etc.)
2. WHEN a free user clicks on restricted navigation items THEN they SHALL see upgrade prompts instead of accessing the feature
3. WHEN a free user is on pages with mixed free/paid features THEN the paid features SHALL be clearly marked and disabled
4. WHEN a free user uses the application THEN the overall experience SHALL feel complete within their plan limitations
5. IF a free user navigates to restricted pages directly via URL THEN they SHALL be redirected to appropriate upgrade or access-denied pages

### Requirement 8: Data Persistence and Plan Changes

**User Story:** As a user who upgrades from free to paid, I want my existing strategy and preferences to be preserved, so that my upgrade experience is seamless.

#### Acceptance Criteria

1. WHEN a free user upgrades to a paid plan THEN their existing strategy SHALL remain accessible
2. WHEN a user's plan changes THEN the system SHALL immediately update their access permissions
3. WHEN a paid user downgrades to free THEN the system SHALL handle excess strategies gracefully (archive, prompt for deletion, etc.)
4. WHEN plan changes occur THEN all UI elements SHALL update to reflect the new plan capabilities
5. IF there are any data conflicts during plan changes THEN the system SHALL provide clear resolution options to the user

## Success Criteria

- Free users can fully use the visual builder without restrictions
- Free users are limited to saving only one strategy
- AI features are completely blocked for free users with clear upgrade paths
- Template access is appropriately restricted with upgrade prompts
- All limitation messaging is clear, helpful, and consistent
- Upgrade flows are smooth and conversion-optimized
- Plan changes are handled seamlessly without data loss