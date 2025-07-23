/**
 * Theme Demo Component
 * 
 * Demonstrates the theme adapter system functionality and provides
 * a visual test of theme consistency and accessibility.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAgentTheme, useAgentColors } from '../hooks/useAgentTheme';
import { AgentThemeProvider } from './AgentThemeProvider';
import { 
  validateThemeSystem, 
  generateAccessibilityReport, 
  testThemeConsistency,
  exportThemeDebugInfo,
  ThemeTestResult,
  AccessibilityReport 
} from '../utils/theme-validator';

/**
 * Color swatch component for displaying theme colors
 */
function ColorSwatch({ 
  color, 
  name, 
  textColor = '#000' 
}: { 
  color: string; 
  name: string; 
  textColor?: string; 
}) {
  return (
    <div className="flex items-center space-x-3 p-2 rounded">
      <div 
        className="w-8 h-8 rounded border border-gray-300"
        style={{ backgroundColor: color }}
      />
      <div>
        <div className="text-sm font-medium" style={{ color: textColor }}>
          {name}
        </div>
        <div className="text-xs text-gray-500">
          {color}
        </div>
      </div>
    </div>
  );
}

/**
 * Theme validation status component
 */
function ValidationStatus({ 
  validation 
}: { 
  validation: { isValid: boolean; warnings: string[] } | null 
}) {
  if (!validation) {
    return (
      <div className="agent-status-info">
        Loading validation...
      </div>
    );
  }

  return (
    <div className={validation.isValid ? 'agent-status-success' : 'agent-status-warning'}>
      {validation.isValid ? '✓ Accessible' : '⚠ Accessibility Issues'}
      {validation.warnings.length > 0 && (
        <div className="text-xs mt-1">
          {validation.warnings.length} warning{validation.warnings.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

/**
 * Main theme demo component
 */
function ThemeDemoContent() {
  const { theme, isLoading, validation, isDark, refreshTheme, warnings } = useAgentTheme();
  const colors = useAgentColors();
  const [testResult, setTestResult] = useState<ThemeTestResult | null>(null);
  const [accessibilityReport, setAccessibilityReport] = useState<AccessibilityReport | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Run comprehensive theme validation
  const runThemeTests = async () => {
    setIsRunningTests(true);
    try {
      const result = await validateThemeSystem();
      setTestResult(result);

      if (theme) {
        const report = generateAccessibilityReport(theme);
        setAccessibilityReport(report);
      }
    } catch (error) {
      console.error('Theme test error:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  // Export debug information
  const exportDebugInfo = () => {
    const debugInfo = exportThemeDebugInfo();
    console.log('Theme Debug Info:', debugInfo);
    
    // Create downloadable JSON file
    const dataStr = JSON.stringify(debugInfo, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'theme-debug-info.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (isLoading) {
    return (
      <div className="p-8 agent-bg-surface rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 agent-bg-secondary rounded w-1/4 mb-4"></div>
          <div className="h-4 agent-bg-secondary rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="agent-card p-6">
        <h1 className="text-3xl font-bold agent-text-primary mb-2">
          Agent Theme System Demo
        </h1>
        <p className="agent-text-secondary">
          Demonstrating theme adapter functionality, color consistency, and accessibility compliance.
        </p>
        <div className="flex items-center space-x-4 mt-4">
          <ValidationStatus validation={validation} />
          <div className="agent-status-info">
            Mode: {isDark ? 'Dark' : 'Light'}
          </div>
          <button 
            onClick={refreshTheme}
            className="agent-btn agent-btn-secondary"
          >
            Refresh Theme
          </button>
        </div>
      </div>

      {/* Color Palette Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Primary Colors */}
        <div className="agent-card p-6">
          <h2 className="text-xl font-semibold agent-text-primary mb-4">
            Primary Colors
          </h2>
          <div className="space-y-2">
            <ColorSwatch color={colors.primary} name="Primary" textColor={colors.text.primary} />
            <ColorSwatch color={colors.primaryHover} name="Primary Hover" textColor={colors.text.primary} />
            <ColorSwatch color={colors.secondary} name="Secondary" textColor={colors.text.primary} />
            <ColorSwatch color={colors.accent} name="Accent" textColor={colors.text.primary} />
          </div>
        </div>

        {/* Background Colors */}
        <div className="agent-card p-6">
          <h2 className="text-xl font-semibold agent-text-primary mb-4">
            Background Colors
          </h2>
          <div className="space-y-2">
            <ColorSwatch color={colors.background} name="Background" textColor={colors.text.primary} />
            <ColorSwatch color={colors.surface} name="Surface" textColor={colors.text.primary} />
            <ColorSwatch color={colors.surfaceHover} name="Surface Hover" textColor={colors.text.primary} />
          </div>
        </div>

        {/* Status Colors */}
        <div className="agent-card p-6">
          <h2 className="text-xl font-semibold agent-text-primary mb-4">
            Status Colors
          </h2>
          <div className="space-y-2">
            <ColorSwatch color={colors.status.success} name="Success" textColor={colors.text.primary} />
            <ColorSwatch color={colors.status.warning} name="Warning" textColor={colors.text.primary} />
            <ColorSwatch color={colors.status.error} name="Error" textColor={colors.text.primary} />
            <ColorSwatch color={colors.status.info} name="Info" textColor={colors.text.primary} />
          </div>
        </div>

        {/* Chat Colors */}
        <div className="agent-card p-6">
          <h2 className="text-xl font-semibold agent-text-primary mb-4">
            Chat Colors
          </h2>
          <div className="space-y-2">
            <ColorSwatch color={colors.chat.userBubble} name="User Bubble" textColor={colors.text.primary} />
            <ColorSwatch color={colors.chat.agentBubble} name="Agent Bubble" textColor={colors.text.primary} />
            <ColorSwatch color={colors.chat.inputBg} name="Input Background" textColor={colors.text.primary} />
          </div>
        </div>
      </div>

      {/* Component Examples */}
      <div className="agent-card p-6">
        <h2 className="text-xl font-semibold agent-text-primary mb-4">
          Component Examples
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Buttons */}
          <div className="space-y-2">
            <h3 className="font-medium agent-text-secondary">Buttons</h3>
            <button className="agent-btn agent-btn-primary w-full">
              Primary Button
            </button>
            <button className="agent-btn agent-btn-secondary w-full">
              Secondary Button
            </button>
          </div>

          {/* Status Indicators */}
          <div className="space-y-2">
            <h3 className="font-medium agent-text-secondary">Status</h3>
            <div className="agent-status-success">Success Status</div>
            <div className="agent-status-warning">Warning Status</div>
            <div className="agent-status-error">Error Status</div>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <h3 className="font-medium agent-text-secondary">Input</h3>
            <input 
              type="text" 
              placeholder="Theme-aware input"
              className="agent-input w-full"
            />
          </div>
        </div>
      </div>

      {/* Chat Example */}
      <div className="agent-card p-6">
        <h2 className="text-xl font-semibold agent-text-primary mb-4">
          Chat Interface Example
        </h2>
        <div className="space-y-4 max-w-md">
          <div className="flex justify-end">
            <div className="agent-chat-user-bubble px-4 py-2 rounded-lg max-w-xs">
              This is a user message using theme colors
            </div>
          </div>
          <div className="flex justify-start">
            <div className="agent-chat-agent-bubble px-4 py-2 rounded-lg max-w-xs">
              This is an agent response with proper contrast
            </div>
          </div>
        </div>
      </div>

      {/* Theme Testing */}
      <div className="agent-card p-6">
        <h2 className="text-xl font-semibold agent-text-primary mb-4">
          Theme System Testing
        </h2>
        <div className="flex space-x-4 mb-4">
          <button 
            onClick={runThemeTests}
            disabled={isRunningTests}
            className="agent-btn agent-btn-primary"
          >
            {isRunningTests ? 'Running Tests...' : 'Run Theme Tests'}
          </button>
          <button 
            onClick={exportDebugInfo}
            className="agent-btn agent-btn-secondary"
          >
            Export Debug Info
          </button>
        </div>

        {testResult && (
          <div className="space-y-4">
            <div className={`p-4 rounded ${testResult.passed ? 'agent-bg-success' : 'agent-bg-error'}`}>
              <h3 className="font-semibold">
                Test Result: {testResult.passed ? 'PASSED' : 'FAILED'}
              </h3>
              {testResult.errors.length > 0 && (
                <div className="mt-2">
                  <strong>Errors:</strong>
                  <ul className="list-disc list-inside">
                    {testResult.errors.map((error, i) => (
                      <li key={i} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {testResult.warnings.length > 0 && (
                <div className="mt-2">
                  <strong>Warnings:</strong>
                  <ul className="list-disc list-inside">
                    {testResult.warnings.map((warning, i) => (
                      <li key={i} className="text-sm">{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
              {Object.entries(testResult.details).map(([key, passed]) => (
                <div key={key} className={`p-2 rounded text-center ${passed ? 'agent-bg-success' : 'agent-bg-error'}`}>
                  <div className="font-medium">{passed ? '✓' : '✗'}</div>
                  <div className="text-xs">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {accessibilityReport && (
          <div className="mt-6 p-4 agent-bg-info rounded">
            <h3 className="font-semibold agent-text-info mb-2">
              Accessibility Score: {accessibilityReport.overallScore.toFixed(1)}%
            </h3>
            {accessibilityReport.issues.length > 0 && (
              <div className="space-y-2">
                {accessibilityReport.issues.slice(0, 3).map((issue, i) => (
                  <div key={i} className="text-sm">
                    <span className={`font-medium ${
                      issue.severity === 'error' ? 'agent-text-error' : 'agent-text-warning'
                    }`}>
                      {issue.severity.toUpperCase()}:
                    </span>
                    {' '}{issue.description}
                  </div>
                ))}
                {accessibilityReport.issues.length > 3 && (
                  <div className="text-sm agent-text-muted">
                    ...and {accessibilityReport.issues.length - 3} more issues
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="agent-card p-6 agent-bg-warning">
          <h2 className="text-xl font-semibold agent-text-warning mb-4">
            Theme Warnings
          </h2>
          <ul className="list-disc list-inside space-y-1">
            {warnings.map((warning, i) => (
              <li key={i} className="text-sm agent-text-warning">{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Main demo component with theme provider
 */
export default function ThemeDemo() {
  return (
    <AgentThemeProvider
      enableAccessibilityWarnings={true}
      onThemeChange={(event) => {
        console.log('Theme changed:', event);
      }}
      onAccessibilityIssue={(warnings) => {
        console.warn('Accessibility issues detected:', warnings);
      }}
    >
      <div className="min-h-screen agent-bg-background">
        <ThemeDemoContent />
      </div>
    </AgentThemeProvider>
  );
}