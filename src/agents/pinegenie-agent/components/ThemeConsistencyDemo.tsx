/**
 * Theme Consistency Demo Component
 * 
 * This component demonstrates proper usage of the agent theme system
 * and serves as a visual reference for developers.
 */

import React, { useState } from 'react';
import { useAgentTheme, useAgentColors } from '../hooks/useAgentTheme';

export const ThemeConsistencyDemo: React.FC = () => {
  const { theme, isLoading, validation, isDark, refreshTheme, isAccessible } = useAgentTheme();
  const colors = useAgentColors();
  const [activeTab, setActiveTab] = useState<'colors' | 'components' | 'accessibility'>('colors');

  if (isLoading) {
    return (
      <div className="agent-bg-background p-8">
        <div className="agent-text-muted">Loading theme...</div>
      </div>
    );
  }

  return (
    <div className="agent-bg-background min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="agent-text-primary text-3xl font-bold mb-2">
            Agent Theme Consistency Demo
          </h1>
          <p className="agent-text-secondary">
            Visual examples of proper theme usage across all agent components
          </p>
          
          {/* Theme Status */}
          <div className="flex items-center space-x-4 mt-4">
            <div className={`agent-status-${isAccessible ? 'success' : 'warning'}`}>
              {isAccessible ? '✓ Accessible' : '⚠ Accessibility Issues'}
            </div>
            <div className="agent-text-muted text-sm">
              Mode: {isDark ? 'Dark' : 'Light'}
            </div>
            <button 
              onClick={refreshTheme}
              className="agent-btn agent-btn-secondary text-sm"
            >
              Refresh Theme
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="mb-8">
          <div className="flex space-x-1 agent-bg-surface p-1 rounded-lg">
            {(['colors', 'components', 'accessibility'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-4 py-2 rounded-md font-medium transition-colors capitalize
                  ${activeTab === tab 
                    ? 'agent-bg-primary agent-text-inverse' 
                    : 'agent-text-secondary hover:agent-text-primary'
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        {activeTab === 'colors' && <ColorPalette colors={colors} />}
        {activeTab === 'components' && <ComponentExamples />}
        {activeTab === 'accessibility' && <AccessibilityDemo validation={validation} />}
      </div>
    </div>
  );
};

const ColorPalette: React.FC<{ colors: ReturnType<typeof useAgentColors> }> = ({ colors }) => {
  return (
    <div className="space-y-8">
      {/* Primary Colors */}
      <section>
        <h2 className="agent-text-primary text-xl font-semibold mb-4">Primary Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ColorSwatch 
            name="Primary" 
            color={colors.primary} 
            variable="--agent-primary"
            usage="Main actions, branding"
          />
          <ColorSwatch 
            name="Primary Hover" 
            color={colors.primaryHover} 
            variable="--agent-primary-hover"
            usage="Button hover states"
          />
          <ColorSwatch 
            name="Primary Active" 
            color={colors.primaryActive} 
            variable="--agent-primary-active"
            usage="Button active states"
          />
        </div>
      </section>

      {/* Text Colors */}
      <section>
        <h2 className="agent-text-primary text-xl font-semibold mb-4">Text Colors</h2>
        <div className="agent-bg-surface p-6 rounded-lg">
          <div className="space-y-3">
            <div className="agent-text-primary text-lg">
              Primary text - Main content and headings
            </div>
            <div className="agent-text-secondary">
              Secondary text - Descriptions and labels
            </div>
            <div className="agent-text-muted">
              Muted text - Placeholder and disabled states
            </div>
            <div className="agent-bg-primary agent-text-inverse p-2 rounded inline-block">
              Inverse text - Text on colored backgrounds
            </div>
          </div>
        </div>
      </section>

      {/* Status Colors */}
      <section>
        <h2 className="agent-text-primary text-xl font-semibold mb-4">Status Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="agent-bg-success p-4 rounded-lg">
            <div className="agent-text-success font-medium">Success</div>
            <div className="agent-text-success opacity-80 text-sm">
              Operation completed successfully
            </div>
          </div>
          <div className="agent-bg-warning p-4 rounded-lg">
            <div className="agent-text-warning font-medium">Warning</div>
            <div className="agent-text-warning opacity-80 text-sm">
              Please review before continuing
            </div>
          </div>
          <div className="agent-bg-error p-4 rounded-lg">
            <div className="agent-text-error font-medium">Error</div>
            <div className="agent-text-error opacity-80 text-sm">
              Something went wrong
            </div>
          </div>
          <div className="agent-bg-info p-4 rounded-lg">
            <div className="agent-text-info font-medium">Info</div>
            <div className="agent-text-info opacity-80 text-sm">
              Additional information
            </div>
          </div>
        </div>
      </section>

      {/* Chat Colors */}
      <section>
        <h2 className="agent-text-primary text-xl font-semibold mb-4">Chat Colors</h2>
        <div className="space-y-4 max-w-md">
          <div className="agent-chat-user-bubble p-3 rounded-lg ml-auto">
            User message bubble
          </div>
          <div className="agent-chat-agent-bubble p-3 rounded-lg mr-auto">
            Agent message bubble
          </div>
          <input 
            type="text"
            placeholder="Chat input placeholder..."
            className="agent-chat-input w-full px-3 py-2 rounded-lg"
          />
        </div>
      </section>
    </div>
  );
};

const ComponentExamples: React.FC = () => {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="space-y-8">
      {/* Buttons */}
      <section>
        <h2 className="agent-text-primary text-xl font-semibold mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <button className="agent-btn agent-btn-primary">
            Primary Button
          </button>
          <button className="agent-btn agent-btn-secondary">
            Secondary Button
          </button>
          <button className="agent-btn agent-btn-primary" disabled>
            Disabled Button
          </button>
        </div>
      </section>

      {/* Cards */}
      <section>
        <h2 className="agent-text-primary text-xl font-semibold mb-4">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="agent-card p-6">
            <h3 className="agent-text-primary font-semibold mb-2">
              Strategy Card
            </h3>
            <p className="agent-text-secondary mb-4">
              This is an example of a strategy card with proper theme colors.
            </p>
            <div className="flex justify-between items-center">
              <span className="agent-status-success">Active</span>
              <button className="agent-btn agent-btn-secondary text-sm">
                Edit
              </button>
            </div>
          </div>
          
          <div className="agent-card p-6 hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="agent-text-primary font-semibold mb-2">
              Hoverable Card
            </h3>
            <p className="agent-text-secondary mb-4">
              This card demonstrates hover effects with theme consistency.
            </p>
            <div className="agent-text-muted text-sm">
              Hover to see the effect
            </div>
          </div>
        </div>
      </section>

      {/* Form Elements */}
      <section>
        <h2 className="agent-text-primary text-xl font-semibold mb-4">Form Elements</h2>
        <div className="agent-card p-6 max-w-md">
          <div className="space-y-4">
            <div>
              <label className="agent-text-primary font-medium block mb-2">
                Strategy Name
              </label>
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="agent-input w-full"
                placeholder="Enter strategy name..."
              />
            </div>
            
            <div>
              <label className="agent-text-primary font-medium block mb-2">
                Strategy Type
              </label>
              <select className="agent-input w-full">
                <option value="">Select type...</option>
                <option value="trend">Trend Following</option>
                <option value="mean">Mean Reversion</option>
                <option value="breakout">Breakout</option>
              </select>
            </div>
            
            <div>
              <label className="agent-text-primary font-medium block mb-2">
                Description
              </label>
              <textarea 
                className="agent-input w-full h-20 resize-none"
                placeholder="Describe your strategy..."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Code Preview */}
      <section>
        <h2 className="agent-text-primary text-xl font-semibold mb-4">Code Preview</h2>
        <div className="agent-card">
          <div className="flex justify-between items-center p-4 border-b agent-border">
            <h4 className="agent-text-primary font-medium">Generated Pine Script</h4>
            <button className="agent-btn agent-btn-secondary text-sm">
              Copy Code
            </button>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 font-mono text-sm">
            <pre className="agent-text-primary">
{`//@version=6
strategy("RSI Strategy", overlay=true)

// Parameters
rsi_length = input.int(14, "RSI Length")
rsi_oversold = input.int(30, "Oversold Level")
rsi_overbought = input.int(70, "Overbought Level")

// Calculate RSI
rsi = ta.rsi(close, rsi_length)

// Entry conditions
long_condition = ta.crossover(rsi, rsi_oversold)
short_condition = ta.crossunder(rsi, rsi_overbought)

// Execute trades
if long_condition
    strategy.entry("Long", strategy.long)
if short_condition
    strategy.entry("Short", strategy.short)`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
};

const AccessibilityDemo: React.FC<{ validation: any }> = ({ validation }) => {
  return (
    <div className="space-y-8">
      {/* Validation Results */}
      <section>
        <h2 className="agent-text-primary text-xl font-semibold mb-4">
          Accessibility Validation
        </h2>
        
        {validation && (
          <div className="agent-card p-6">
            <div className={`agent-status-${validation.isValid ? 'success' : 'warning'} mb-4`}>
              {validation.isValid ? '✓ All checks passed' : '⚠ Issues detected'}
            </div>
            
            {validation.warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="agent-text-primary font-medium">Warnings:</h4>
                <ul className="space-y-1">
                  {validation.warnings.map((warning: string, index: number) => (
                    <li key={index} className="agent-text-warning text-sm">
                      • {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Contrast Examples */}
      <section>
        <h2 className="agent-text-primary text-xl font-semibold mb-4">
          Contrast Examples
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Good Contrast */}
          <div className="agent-card p-6">
            <h3 className="agent-text-success font-semibold mb-4">✓ Good Contrast</h3>
            <div className="space-y-3">
              <div className="agent-text-primary">
                Primary text on background (4.5:1+)
              </div>
              <div className="agent-bg-primary agent-text-inverse p-2 rounded">
                White text on primary (4.5:1+)
              </div>
              <div className="agent-bg-success agent-text-success p-2 rounded">
                Success text on success background
              </div>
            </div>
          </div>
          
          {/* Focus Indicators */}
          <div className="agent-card p-6">
            <h3 className="agent-text-primary font-semibold mb-4">Focus Indicators</h3>
            <div className="space-y-3">
              <button className="agent-btn agent-btn-primary agent-focus-visible">
                Focusable Button
              </button>
              <input 
                type="text"
                placeholder="Focusable input"
                className="agent-input agent-focus-visible w-full"
              />
              <a 
                href="#" 
                className="agent-text-primary underline agent-focus-visible"
              >
                Focusable Link
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Screen Reader Support */}
      <section>
        <h2 className="agent-text-primary text-xl font-semibold mb-4">
          Screen Reader Support
        </h2>
        
        <div className="agent-card p-6">
          <div className="space-y-4">
            <button 
              className="agent-btn agent-btn-primary"
              aria-label="Generate Pine Script strategy code"
            >
              Generate
            </button>
            
            <div 
              className="agent-status-success"
              role="status"
              aria-live="polite"
            >
              Strategy generated successfully
            </div>
            
            <div className="agent-text-secondary">
              <label htmlFor="strategy-input" className="block mb-2">
                Strategy Description
              </label>
              <input 
                id="strategy-input"
                type="text"
                className="agent-input w-full"
                aria-describedby="strategy-help"
              />
              <div id="strategy-help" className="agent-text-muted text-sm mt-1">
                Describe your trading strategy in natural language
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ColorSwatch: React.FC<{
  name: string;
  color: string;
  variable: string;
  usage: string;
}> = ({ name, color, variable, usage }) => {
  return (
    <div className="agent-card p-4">
      <div 
        className="w-full h-16 rounded-lg mb-3 border agent-border"
        style={{ backgroundColor: color }}
      />
      <h3 className="agent-text-primary font-medium">{name}</h3>
      <p className="agent-text-muted text-sm font-mono">{variable}</p>
      <p className="agent-text-secondary text-sm">{color}</p>
      <p className="agent-text-muted text-xs mt-1">{usage}</p>
    </div>
  );
};

export default ThemeConsistencyDemo;