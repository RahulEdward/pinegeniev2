# PineGenie AI Test Suite

## Overview

This directory contains comprehensive tests for the PineGenie AI system, ensuring reliability, performance, and compatibility with existing functionality.

## Test Structure

```
tests/
├── unit/                 # Unit tests for individual components
├── integration/          # Integration tests for component interactions
├── performance/          # Performance and load tests
├── fixtures/             # Test data and mock objects
└── helpers/              # Test utilities and helpers
```

## Test Categories

### Unit Tests
- Individual component functionality
- Algorithm correctness
- Error handling
- Configuration management

### Integration Tests
- End-to-end AI workflows
- Integration with existing builder system
- Pine Script generation compatibility
- Theme and UI integration

### Performance Tests
- Response time benchmarks
- Memory usage monitoring
- Concurrent request handling
- Cache performance

## Running Tests

```bash
# Run all AI tests
npm test -- src/agents/pinegenie-ai/tests

# Run specific test category
npm test -- src/agents/pinegenie-ai/tests/unit
npm test -- src/agents/pinegenie-ai/tests/integration
npm test -- src/agents/pinegenie-ai/tests/performance

# Run with coverage
npm test -- --coverage src/agents/pinegenie-ai/tests
```

## Test Guidelines

1. **Isolation**: All tests must be isolated and not affect existing functionality
2. **Mocking**: Use mocks for external dependencies
3. **Performance**: Include performance assertions where relevant
4. **Documentation**: Document complex test scenarios
5. **Cleanup**: Ensure proper cleanup after each test

## Test Data

Test fixtures and mock data are stored in the `fixtures/` directory and should be used consistently across tests to ensure reproducible results.