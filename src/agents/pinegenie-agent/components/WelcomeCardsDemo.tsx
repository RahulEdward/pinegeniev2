/**
 * PineGenie AI Welcome Cards Demo Component
 * 
 * Demonstrates the PineGenie AI welcome cards with different user scenarios
 */

'use client';

import { useState } from 'react';
import { AgentThemeProvider } from './AgentThemeProvider';
import KiroEnhancedChatInterface from './KiroEnhancedChatInterface';
import { useAgentColors } from '../hooks/useAgentTheme';

export default function WelcomeCardsDemo() {
  const [demoType, setDemoType] = useState<'new-user' | 'returning-user' | 'experienced-user'>('new-user');
  const colors = useAgentColors();
  
  // Demo user data
  const demoData = {
    'new-user': {
      userName: undefined,
      userHistory: undefined
    },
    'returning-user': {
      userName: 'Alex',
      userHistory: {
        strategies: 3,
        conversations: 7
      }
    },
    'experienced-user': {
      userName: 'Taylor',
      userHistory: {
        strategies: 15,
        conversations: 32,
        lastStrategy: 'RSI Divergence Strategy'
      }
    }
  };
  
  const selectedDemo = demoData[demoType];
  
  return (
    <div className="flex flex-col h-full">
      <div 
        className="p-4 mb-4 rounded-lg"
        style={{ 
          backgroundColor: colors.surfaceHover,
          borderBottom: `1px solid ${colors.border}`
        }}
      >
        <h2 
          className="text-lg font-medium mb-3"
          style={{ color: colors.text.primary }}
        >
          PineGenie AI Welcome Cards
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => setDemoType('new-user')}
            className="px-3 py-2 rounded-md text-sm transition-colors"
            style={{ 
              backgroundColor: demoType === 'new-user' ? colors.primary : colors.surface,
              color: demoType === 'new-user' ? colors.text.inverse : colors.text.primary,
              border: `1px solid ${colors.border}`
            }}
          >
            New User
          </button>
          <button
            onClick={() => setDemoType('returning-user')}
            className="px-3 py-2 rounded-md text-sm transition-colors"
            style={{ 
              backgroundColor: demoType === 'returning-user' ? colors.primary : colors.surface,
              color: demoType === 'returning-user' ? colors.text.inverse : colors.text.primary,
              border: `1px solid ${colors.border}`
            }}
          >
            Returning User
          </button>
          <button
            onClick={() => setDemoType('experienced-user')}
            className="px-3 py-2 rounded-md text-sm transition-colors"
            style={{ 
              backgroundColor: demoType === 'experienced-user' ? colors.primary : colors.surface,
              color: demoType === 'experienced-user' ? colors.text.inverse : colors.text.primary,
              border: `1px solid ${colors.border}`
            }}
          >
            Experienced User
          </button>
        </div>
        <p 
          className="mt-3 text-sm"
          style={{ color: colors.text.secondary }}
        >
          This demo shows how welcome cards adapt to different user profiles and history.
        </p>
      </div>
      
      <div 
        className="flex-1 overflow-hidden"
        style={{ 
          border: `1px solid ${colors.border}`,
          borderRadius: '0.5rem',
          backgroundColor: colors.background
        }}
      >
        <AgentThemeProvider>
          <KiroEnhancedChatInterface
            agentName="PineGenie AI"
            agentDescription="Your TradingView strategy assistant"
            userName={selectedDemo.userName}
            userHistory={selectedDemo.userHistory}
          />
        </AgentThemeProvider>
      </div>
    </div>
  );
}