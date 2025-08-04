# User Acceptance Tests

This directory contains user acceptance tests (UAT) for the PineGenie AI System. These tests focus on real user scenarios and workflows to ensure the system meets user expectations and requirements.

## Test Categories

### 1. Common User Scenarios (`common-scenarios.test.ts`)
- Basic strategy creation workflows
- Template usage and customization
- Error handling and recovery

### 2. Educational Features (`educational-features.test.ts`)
- Step-by-step animations
- Learning mode functionality
- Help system and tooltips

### 3. Accessibility and Usability (`accessibility.test.ts`)
- Keyboard navigation
- Screen reader compatibility
- Mobile responsiveness

### 4. Error Handling (`error-handling.test.ts`)
- Graceful error recovery
- User-friendly error messages
- System stability under edge cases

### 5. Performance (`performance.test.ts`)
- Response times for user interactions
- System responsiveness
- Memory usage optimization

## Running Tests

```bash
# Run all user acceptance tests
npm test src/agents/pinegenie-ai/tests/user-acceptance/

# Run specific test category
npm test src/agents/pinegenie-ai/tests/user-acceptance/common-scenarios.test.ts
```

## Test Data

User acceptance tests use realistic test data from `../fixtures/user-scenarios.ts` to simulate real user interactions.