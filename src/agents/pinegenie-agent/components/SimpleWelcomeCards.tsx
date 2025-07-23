/**
 * Simple Welcome Cards Component (without complex dependencies)
 */

'use client';

import { useState, useEffect } from 'react';
import { useAgentColors } from '../hooks/useAgentTheme';

interface SimpleWelcomeCardsProps {
  userName?: string;
  userHistory?: {
    strategies: number;
    conversations: number;
    lastStrategy?: string;
  };
  onCardClick: (prompt: string) => void;
}

const SimpleWelcomeCards: React.FC<SimpleWelcomeCardsProps> = ({ 
  userName, 
  userHistory,
  onCardClick
}) => {
  const [greeting, setGreeting] = useState('');
  
  // Use agent theme colors
  const colors = useAgentColors();
  
  useEffect(() => {
    const hour = new Date().getHours();
    let newGreeting = '';
    
    if (hour < 12) {
      newGreeting = 'Good morning';
    } else if (hour < 18) {
      newGreeting = 'Good afternoon';
    } else {
      newGreeting = 'Good evening';
    }
    
    if (userName) {
      newGreeting += `, ${userName}`;
    }
    
    setGreeting(newGreeting);
  }, [userName]);

  return (
    <div className="welcome-cards-container max-w-3xl mx-auto">
      {/* Clean Header */}
      <div className="text-center mb-16">
        <div 
          className="w-12 h-12 mx-auto mb-6 rounded-xl flex items-center justify-center" 
          style={{ backgroundColor: colors.primary }}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: colors.text.inverse }}>
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
        </div>
        <h1 className="text-2xl font-medium mb-4" style={{ color: colors.text.primary }}>
          Let's build
        </h1>
        <p className="text-base" style={{ color: colors.text.secondary }}>
          Plan, search, or build anything
        </p>
      </div>
      
      {/* Personalized message */}
      {userHistory && userHistory.strategies > 0 && (
        <div className="mb-12 text-center">
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            {userHistory.lastStrategy ? (
              <>You last worked on <span className="font-medium" style={{ color: colors.text.primary }}>{userHistory.lastStrategy}</span>. Ready to continue or start something new?</>
            ) : (
              <>You've created <span className="font-medium" style={{ color: colors.text.primary }}>{userHistory.strategies}</span> {userHistory.strategies === 1 ? 'strategy' : 'strategies'}. What's next?</>
            )}
          </p>
        </div>
      )}
      
      {/* Main Action Cards - Clean Kiro-style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div 
          onClick={() => onCardClick("I want to start with a vibe-based approach to build a Pine Script strategy")}
          className="rounded-2xl p-8 cursor-pointer transition-all duration-300 group"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}10, ${colors.primary}20)`,
            border: `1px solid ${colors.primary}30`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = `${colors.primary}60`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = `${colors.primary}30`;
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:opacity-80 transition-opacity"
              style={{ backgroundColor: `${colors.primary}30` }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: colors.primary }}>
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <h3 className="font-semibold text-lg" style={{ color: colors.text.primary }}>Vibe</h3>
          </div>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: colors.text.secondary }}>
            Chat first, then build. Explore ideas and iterate as you discover needs.
          </p>
          <div className="text-xs">
            <div className="mb-3 font-medium" style={{ color: colors.primary }}>Great for:</div>
            <ul className="space-y-2" style={{ color: colors.text.muted }}>
              <li>• Rapid exploration and testing</li>
              <li>• Building when requirements are unclear</li>
              <li>• Implementing a task</li>
            </ul>
          </div>
        </div>

        <div 
          onClick={() => onCardClick("I want to create a detailed specification for a Pine Script project")}
          className="rounded-2xl p-8 cursor-pointer transition-all duration-300 group"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.surfaceHover;
            e.currentTarget.style.borderColor = colors.borderHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.surface;
            e.currentTarget.style.borderColor = colors.border;
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:opacity-80 transition-opacity"
              style={{ backgroundColor: colors.surfaceHover }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: colors.text.secondary }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </div>
            <h3 className="font-semibold text-lg" style={{ color: colors.text.primary }}>Spec</h3>
          </div>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: colors.text.secondary }}>
            Plan first, then build. Create requirements and design before coding starts.
          </p>
          <div className="text-xs">
            <div className="mb-3 font-medium" style={{ color: colors.text.primary }}>Great for:</div>
            <ul className="space-y-2" style={{ color: colors.text.muted }}>
              <li>• Complex trading strategies</li>
              <li>• Multi-indicator systems</li>
              <li>• Professional development</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Actions - Simplified */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button 
          onClick={() => onCardClick("Create a simple RSI indicator")}
          className="rounded-xl p-4 text-left transition-all duration-200 group"
          style={{
            backgroundColor: colors.surface + '50',
            borderColor: colors.border + '50',
            border: `1px solid ${colors.border}50`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.surfaceHover + '80';
            e.currentTarget.style.borderColor = colors.borderHover + '70';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.surface + '50';
            e.currentTarget.style.borderColor = colors.border + '50';
          }}
          aria-label="Create RSI indicator strategy"
        >
          <div 
            className="font-medium text-sm group-hover:transition-colors"
            style={{ 
              color: colors.text.primary,
              '--hover-color': colors.primary
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.text.primary;
            }}
          >
            RSI Indicator
          </div>
        </button>
        
        <button 
          onClick={() => onCardClick("Help me build a moving average crossover strategy")}
          className="rounded-xl p-4 text-left transition-all duration-200 group"
          style={{
            backgroundColor: colors.surface + '50',
            borderColor: colors.border + '50',
            border: `1px solid ${colors.border}50`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.surfaceHover + '80';
            e.currentTarget.style.borderColor = colors.borderHover + '70';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.surface + '50';
            e.currentTarget.style.borderColor = colors.border + '50';
          }}
          aria-label="Build moving average crossover strategy"
        >
          <div 
            className="font-medium text-sm group-hover:transition-colors"
            style={{ 
              color: colors.text.primary,
              '--hover-color': colors.primary
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.text.primary;
            }}
          >
            MA Strategy
          </div>
        </button>
        
        <button 
          onClick={() => onCardClick("Explain Pine Script v6 syntax")}
          className="rounded-xl p-4 text-left transition-all duration-200 group"
          style={{
            backgroundColor: colors.surface + '50',
            borderColor: colors.border + '50',
            border: `1px solid ${colors.border}50`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.surfaceHover + '80';
            e.currentTarget.style.borderColor = colors.borderHover + '70';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.surface + '50';
            e.currentTarget.style.borderColor = colors.border + '50';
          }}
          aria-label="Learn Pine Script v6 syntax"
        >
          <div 
            className="font-medium text-sm group-hover:transition-colors"
            style={{ 
              color: colors.text.primary,
              '--hover-color': colors.primary
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.text.primary;
            }}
          >
            Learn Syntax
          </div>
        </button>
        
        <button 
          onClick={() => onCardClick("Debug my Pine Script code")}
          className="rounded-xl p-4 text-left transition-all duration-200 group"
          style={{
            backgroundColor: colors.surface + '50',
            borderColor: colors.border + '50',
            border: `1px solid ${colors.border}50`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.surfaceHover + '80';
            e.currentTarget.style.borderColor = colors.borderHover + '70';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.surface + '50';
            e.currentTarget.style.borderColor = colors.border + '50';
          }}
          aria-label="Debug Pine Script code"
        >
          <div 
            className="font-medium text-sm group-hover:transition-colors"
            style={{ 
              color: colors.text.primary,
              '--hover-color': colors.primary
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.text.primary;
            }}
          >
            Debug Code
          </div>
        </button>
      </div>
    </div>
  );
};

export default SimpleWelcomeCards;