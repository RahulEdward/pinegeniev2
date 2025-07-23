/**
 * PineGenie AI Welcome Cards Component
 * 
 * Interactive welcome cards that introduce agent capabilities
 * and guide users through common Pine Script tasks
 */

'use client';

import { useState, useEffect } from 'react';
import { Bot, ChevronRight, LineChart, Code, Sparkles, Mic, TrendingUp, BookOpen, Zap, Settings } from 'lucide-react';
import { useAgentColors } from '../hooks/useAgentTheme';

interface WelcomeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  delay?: number;
  primaryColor?: boolean;
  iconClass?: string;
}

interface WelcomeCardsProps {
  userName?: string;
  userHistory?: {
    strategies: number;
    conversations: number;
    lastStrategy?: string;
  };
  onCardClick: (prompt: string) => void;
}

// Individual welcome card component
const WelcomeCard: React.FC<WelcomeCardProps> = ({ 
  title, 
  description, 
  icon, 
  onClick, 
  delay = 0,
  primaryColor = false,
  iconClass = ''
}) => {
  // Use agent theme colors
  const colors = useAgentColors();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className="rounded-xl p-4 cursor-pointer transition-all duration-300 welcome-card-item"
      style={{ 
        backgroundColor: primaryColor ? colors.primary : colors.surface,
        color: primaryColor ? colors.text.inverse : colors.text.primary,
        border: `1px solid ${primaryColor ? colors.primaryHover : colors.border}`,
        boxShadow: isHovered 
          ? `0 8px 16px rgba(0,0,0,${colors.isDark ? '0.3' : '0.1'})`
          : `0 2px 4px rgba(0,0,0,${colors.isDark ? '0.2' : '0.05'})`,
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        animationDelay: `${delay * 0.1}s`
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <div 
          className={`p-2 rounded-lg ${iconClass}`}
          style={{ 
            backgroundColor: primaryColor 
              ? colors.primaryHover 
              : colors.surfaceHover
          }}
        >
          {icon}
        </div>
        
        <div className="flex-1">
          <h4 className="font-medium text-base mb-1">{title}</h4>
          <p 
            className="text-sm"
            style={{ 
              color: primaryColor 
                ? colors.text.inverse + 'E6' // 90% opacity
                : colors.text.secondary 
            }}
          >
            {description}
          </p>
        </div>
        
        <div 
          className="self-center transition-transform duration-300"
          style={{ transform: isHovered ? 'translateX(3px)' : 'translateX(0)' }}
        >
          <ChevronRight size={18} />
        </div>
      </div>
    </div>
  );
};

// Welcome cards container component
const WelcomeCards: React.FC<WelcomeCardsProps> = ({ 
  userName, 
  userHistory,
  onCardClick
}) => {
  // Use agent theme colors
  const colors = useAgentColors();
  const [greeting, setGreeting] = useState('');
  
  // Set greeting based on time of day
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

  // Personalized welcome message
  const getPersonalizedMessage = () => {
    if (!userHistory) return null;
    
    if (userHistory.strategies > 0) {
      return (
        <div
          className="mb-4 p-4 rounded-lg personalized-message"
          style={{ 
            backgroundColor: colors.status.infoBg,
            border: `1px solid ${colors.border}`
          }}
        >
          <div className="flex items-start gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: colors.primary + '20' }}
            >
              <TrendingUp size={16} style={{ color: colors.primary }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                Welcome back!
              </p>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                {userHistory.lastStrategy ? (
                  <>You last worked on <strong style={{ color: colors.text.primary }}>{userHistory.lastStrategy}</strong>. Ready to continue or start something new?</>
                ) : (
                  <>You've created <strong style={{ color: colors.text.primary }}>{userHistory.strategies}</strong> {userHistory.strategies === 1 ? 'strategy' : 'strategies'} and had <strong style={{ color: colors.text.primary }}>{userHistory.conversations}</strong> conversations. What's next?</>
                )}
              </p>
              {userHistory.lastStrategy && (
                <button
                  className="mt-2 text-xs px-3 py-1 rounded-md transition-colors"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.text.inverse
                  }}
                  onClick={() => onCardClick(`Continue working on my ${userHistory.lastStrategy} - help me improve and optimize it further`)}
                  aria-label={`Continue working on ${userHistory.lastStrategy} strategy`}
                >
                  Continue {userHistory.lastStrategy}
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="welcome-cards-container">
      <div
        className="text-center mb-6"
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center avatar-animation"
          style={{ backgroundColor: colors.primary + '20' }}>
          <Bot 
            className="w-10 h-10" 
            style={{ color: colors.primary }}
          />
        </div>
        <h3 
          className="text-2xl font-medium mb-2"
          style={{ color: colors.text.primary }}
        >
          {greeting || 'Welcome to PineGenie AI'}
        </h3>
        <p 
          className="text-base"
          style={{ color: colors.text.secondary }}
        >
          Your TradingView Pine Script assistant
        </p>
      </div>
      
      {getPersonalizedMessage()}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <WelcomeCard
          title="Create Trading Strategy"
          description="Generate Pine Script code for your trading ideas using natural language"
          icon={<TrendingUp size={24} style={{ color: colors.primary }} />}
          onClick={() => onCardClick("I want to create a Pine Script trading strategy that uses RSI and moving averages to identify entry and exit points with proper risk management")}
          delay={1}
          iconClass="scale-on-hover"
        />
        
        <WelcomeCard
          title="Learn Pine Script"
          description="Get explanations and examples of Pine Script concepts and syntax"
          icon={<BookOpen size={24} style={{ color: colors.secondary }} />}
          onClick={() => onCardClick("Explain the basics of Pine Script v5 syntax, how to create indicators, and best practices for strategy development")}
          delay={2}
          iconClass="bounce-on-hover"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WelcomeCard
          title="Optimize Strategy"
          description="Improve performance or add features to your existing strategy"
          icon={<Zap size={24} style={{ color: colors.status.success }} />}
          onClick={() => onCardClick("Help me optimize my Pine Script strategy for better performance, add stop loss and take profit levels, and implement proper position sizing")}
          delay={3}
          iconClass="spin-on-hover"
        />
        
        <WelcomeCard
          title="Voice Commands"
          description="Speak your trading ideas and get Pine Script code (beta)"
          icon={<Mic size={24} style={{ color: colors.text.inverse }} />}
          onClick={() => onCardClick("I'd like to use voice commands to describe my trading strategy and have you convert it to Pine Script code")}
          delay={4}
          primaryColor
          iconClass="pulse-on-hover"
        />
      </div>
      
      {/* Additional specialized cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        <WelcomeCard
          title="Debug Code"
          description="Fix errors in your Pine Script"
          icon={<Code size={20} style={{ color: colors.status.warning }} />}
          onClick={() => onCardClick("Help me debug and fix errors in my Pine Script code")}
          delay={5}
          iconClass="bounce-on-hover"
        />
        
        <WelcomeCard
          title="Add Indicators"
          description="Integrate technical indicators"
          icon={<LineChart size={20} style={{ color: colors.status.info }} />}
          onClick={() => onCardClick("Show me how to add and customize technical indicators like MACD, Bollinger Bands, and Stochastic in Pine Script")}
          delay={6}
          iconClass="scale-on-hover"
        />
        
        <WelcomeCard
          title="Quick Templates"
          description="Start with proven strategies"
          icon={<Sparkles size={20} style={{ color: colors.accent }} />}
          onClick={() => onCardClick("Show me Pine Script templates for popular trading strategies like breakout, mean reversion, and trend following")}
          delay={7}
          iconClass="spin-on-hover"
        />
      </div>

      <div
        className="mt-6 text-center"
      >
        <button
          className="text-sm px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 hover:opacity-80"
          style={{
            backgroundColor: colors.surfaceHover,
            color: colors.text.secondary,
          }}
          onClick={() => onCardClick("Show me advanced Pine Script features like custom functions, arrays, and complex strategy logic")}
          aria-label="Learn advanced Pine Script features"
        >
          <Settings size={16} />
          <span>Advanced Pine Script Features</span>
        </button>
      </div>
    </div>
  );
};

export default WelcomeCards;