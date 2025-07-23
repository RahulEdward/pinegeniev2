/**
 * PineGenie AI Chat Demo Component
 * 
 * Demonstrates the enhanced PineGenie AI chat interface with welcome cards
 */

'use client';

import { useState } from 'react';
import KiroEnhancedChatInterface from './KiroEnhancedChatInterface';
import WelcomeCardsDemo from './WelcomeCardsDemo';
import { useAgentColors } from '../hooks/useAgentTheme';

export default function ChatDemo() {
  const [demoType, setDemoType] = useState<'enhanced' | 'original' | 'welcome-cards'>('welcome-cards');
  const colors = useAgentColors();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 
          className="text-2xl font-bold mb-2"
          style={{ color: colors.text.primary }}
        >
          PineGenie AI Chat Interface
        </h1>
        <p 
          className="mb-4"
          style={{ color: colors.text.secondary }}
        >
          Enhanced chat interface with Kiro-style welcome cards, interactive elements, and smooth animations.
        </p>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setDemoType('welcome-cards')}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: demoType === 'welcome-cards' ? colors.primary : colors.surface,
              color: demoType === 'welcome-cards' ? colors.text.inverse : colors.text.primary,
              border: `1px solid ${colors.border}`
            }}
          >
            Welcome Cards
          </button>
          <button
            onClick={() => setDemoType('enhanced')}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: demoType === 'enhanced' ? colors.primary : colors.surface,
              color: demoType === 'enhanced' ? colors.text.inverse : colors.text.primary,
              border: `1px solid ${colors.border}`
            }}
          >
            Standard Chat
          </button>
          <button
            onClick={() => setDemoType('original')}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: demoType === 'original' ? colors.primary : colors.surface,
              color: demoType === 'original' ? colors.text.inverse : colors.text.primary,
              border: `1px solid ${colors.border}`
            }}
          >
            Original Version
          </button>
        </div>
      </div>
      
      <div 
        className="h-[650px] overflow-hidden shadow-lg"
        style={{ 
          border: `1px solid ${colors.border}`,
          borderRadius: '0.5rem',
          backgroundColor: colors.background
        }}
      >
        {demoType === 'original' ? (
          <iframe 
            src="/original-chat-demo" 
            className="w-full h-full border-0"
            title="Original Chat Interface"
          />
        ) : demoType === 'welcome-cards' ? (
          <WelcomeCardsDemo />
        ) : (
          <KiroEnhancedChatInterface 
            agentName="PineGenie AI"
            agentDescription="Your TradingView strategy assistant"
          />
        )}
      </div>
      
      <div 
        className="mt-6 p-4 rounded-lg"
        style={{ 
          backgroundColor: colors.status.infoBg,
          border: `1px solid ${colors.border}`
        }}
      >
        <h3 
          className="text-lg font-semibold mb-2"
          style={{ color: colors.text.primary }}
        >
          Welcome Cards Features
        </h3>
        <ul 
          className="list-disc pl-5 space-y-1"
          style={{ color: colors.text.secondary }}
        >
          <li>Personalized greeting based on time of day and user name</li>
          <li>Interactive cards with engaging hover animations and effects</li>
          <li>User history integration showing previous strategies</li>
          <li>Quick-start prompts for common Pine Script tasks</li>
          <li>Smooth transitions and staggered animations for visual appeal</li>
          <li>Consistent theme integration with PineGenie dashboard</li>
          <li>Responsive design that works on all screen sizes</li>
          <li>Accessibility-compliant interactive elements</li>
          <li>Seamless integration with chat interface</li>
        </ul>
      </div>
    </div>
  );
}