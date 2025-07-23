/**
 * Kiro-Style Pine Script Agent - Main Export File
 * 
 * Exports all agent components, hooks, and utilities
 */

// Core agent handler
export { AgentHandler } from './core/agent-handler';

// Pine Script generator
export { PineScriptGenerator } from './core/pine-generator/generator';

// Voice processor
export { VoiceProcessor } from './core/voice-processor/processor';

// Context manager
export { ContextManager } from './core/context-manager/manager';

// LLM service
export { LLMService } from './services/llm/service';

// Database repository
export { ConversationRepository } from './services/database/conversation-repository';

// Core theme adapter
export { 
  ThemeAdapter, 
  themeAdapter,
  type DashboardColorPalette,
  type AgentTheme,
  type ValidationResult,
  type ThemeChangeEvent,
  type ThemeChangeListener
} from './config/theme-adapter';

// React hooks
export { 
  useAgentTheme, 
  useAgentColors,
  type UseAgentThemeReturn 
} from './hooks/useAgentTheme';

// React components
export { 
  AgentThemeProvider, 
  useAgentThemeContext, 
  withAgentTheme 
} from './components/AgentThemeProvider';

export { default as ThemeDemo } from './components/ThemeDemo';

// Validation utilities
export {
  validateThemeSystem,
  generateAccessibilityReport,
  testThemeConsistency,
  testThemePerformance,
  exportThemeDebugInfo,
  type ThemeTestResult,
  type AccessibilityReport
} from './utils/theme-validator';

// Type definitions
export * from './types/agent';
export * from './types/pine-script';
export * from './types/voice';

// CSS styles (to be imported in your app)
// import './styles/agent-theme.css';