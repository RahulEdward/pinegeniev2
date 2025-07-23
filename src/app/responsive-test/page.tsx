/**
 * Responsive Design Test Page
 * 
 * Interactive page for testing and validating responsive design
 * of the PineGenie agent interface across different devices.
 */

'use client';

import { useState } from 'react';
import ResponsiveTestSuite from '../../agents/pinegenie-agent/components/ResponsiveTestSuite';
import { AgentThemeProvider } from '../../agents/pinegenie-agent/components/AgentThemeProvider';

export default function ResponsiveTestPage() {
  const [testComponent, setTestComponent] = useState<'chat' | 'welcome-cards' | 'both'>('both');

  return (
    <AgentThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              PineGenie Agent Responsive Design Tests
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Comprehensive testing suite for validating responsive design across devices
            </p>
            
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setTestComponent('both')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  testComponent === 'both'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                }`}
              >
                Full Interface
              </button>
              <button
                onClick={() => setTestComponent('chat')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  testComponent === 'chat'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                }`}
              >
                Chat Only
              </button>
              <button
                onClick={() => setTestComponent('welcome-cards')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  testComponent === 'welcome-cards'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                }`}
              >
                Welcome Cards Only
              </button>
            </div>
          </div>

          <ResponsiveTestSuite component={testComponent} />

          <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Test Instructions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Visual Testing
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• Select different device presets to test various screen sizes</li>
                  <li>• Toggle between portrait and landscape orientations</li>
                  <li>• Verify that all content remains visible and accessible</li>
                  <li>• Check that text remains readable at all sizes</li>
                  <li>• Ensure proper spacing and layout adaptation</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Interaction Testing
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• Switch to "Interaction" mode for touch testing</li>
                  <li>• Verify touch targets are at least 44px in size</li>
                  <li>• Test tap, long press, and swipe gestures</li>
                  <li>• Ensure hover effects are disabled on touch devices</li>
                  <li>• Validate keyboard navigation functionality</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Performance Monitoring
              </h4>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                Enable "Performance" mode to monitor render times, memory usage, and frame rates.
                Green metrics indicate good performance, yellow indicates acceptable, and red indicates issues that need attention.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AgentThemeProvider>
  );
}