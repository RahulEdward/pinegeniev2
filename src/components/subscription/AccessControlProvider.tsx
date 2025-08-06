/**
 * Access Control Provider
 * 
 * Context provider for app-wide subscription limitation management
 */

'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useSubscription } from '@/hooks/useSubscription';

interface AccessControlContextType {
  checkAccess: (feature: string) => boolean;
  showUpgradePrompt: (feature: string, customConfig?: Partial<UpgradePromptConfig>) => void;
  hideUpgradePrompt: () => void;
  isUpgradePromptVisible: boolean;
  currentPromptConfig: UpgradePromptConfig | null;
  limitations: any;
  isFreePlan: boolean;
  isPaidPlan: boolean;
}

interface UpgradePromptConfig {
  trigger: string;
  title: string;
  description: string;
  benefits: string[];
  ctaText: string;
  dismissible: boolean;
  showComparison: boolean;
}

const AccessControlContext = createContext<AccessControlContextType | undefined>(undefined);

interface AccessControlProviderProps {
  children: React.ReactNode;
}

export function AccessControlProvider({ children }: AccessControlProviderProps) {
  const {
    checkFeatureAccess,
    limitations,
    isFreePlan,
    isPaidPlan,
    loading
  } = useSubscription();

  const [isUpgradePromptVisible, setIsUpgradePromptVisible] = useState(false);
  const [currentPromptConfig, setCurrentPromptConfig] = useState<UpgradePromptConfig | null>(null);

  const checkAccess = useCallback((feature: string): boolean => {
    if (loading) return false;
    return checkFeatureAccess(feature);
  }, [checkFeatureAccess, loading]);

  const showUpgradePrompt = useCallback((
    feature: string,
    customConfig?: Partial<UpgradePromptConfig>
  ) => {
    const defaultConfig = getDefaultPromptConfig(feature);
    const config = { ...defaultConfig, ...customConfig };
    
    setCurrentPromptConfig(config);
    setIsUpgradePromptVisible(true);
  }, []);

  const hideUpgradePrompt = useCallback(() => {
    setIsUpgradePromptVisible(false);
    setCurrentPromptConfig(null);
  }, []);

  const contextValue: AccessControlContextType = {
    checkAccess,
    showUpgradePrompt,
    hideUpgradePrompt,
    isUpgradePromptVisible,
    currentPromptConfig,
    limitations,
    isFreePlan: isFreePlan(),
    isPaidPlan: isPaidPlan()
  };

  return (
    <AccessControlContext.Provider value={contextValue}>
      {children}
    </AccessControlContext.Provider>
  );
}

export function useAccessControl(): AccessControlContextType {
  const context = useContext(AccessControlContext);
  if (context === undefined) {
    throw new Error('useAccessControl must be used within an AccessControlProvider');
  }
  return context;
}

function getDefaultPromptConfig(feature: string): UpgradePromptConfig {
  const configs: Record<string, UpgradePromptConfig> = {
    'ai_chat': {
      trigger: 'ai_chat',
      title: 'Unlock AI Chat Assistant',
      description: 'Get unlimited AI-powered assistance for your Pine Script development',
      benefits: [
        'Unlimited AI conversations',
        'Advanced strategy optimization',
        'Real-time Pine Script assistance',
        'Custom indicator suggestions'
      ],
      ctaText: 'Upgrade to Pro',
      dismissible: true,
      showComparison: true
    },
    'strategy_storage': {
      trigger: 'strategy_storage',
      title: 'Save More Strategies',
      description: 'Free users can save only 1 strategy. Upgrade to save unlimited strategies.',
      benefits: [
        'Unlimited strategy storage',
        'Strategy versioning',
        'Advanced organization tools',
        'Cloud backup & sync'
      ],
      ctaText: 'Upgrade Now',
      dismissible: true,
      showComparison: true
    },
    'premium_templates': {
      trigger: 'premium_templates',
      title: 'Access Premium Templates',
      description: 'Unlock our library of professional strategy templates',
      benefits: [
        'Access to 50+ professional templates',
        'Advanced strategy patterns',
        'Institutional-grade strategies',
        'Regular template updates'
      ],
      ctaText: 'Upgrade to Pro',
      dismissible: true,
      showComparison: true
    },
    'advanced_indicators': {
      trigger: 'advanced_indicators',
      title: 'Advanced Indicators',
      description: 'Access premium technical indicators and advanced analysis tools',
      benefits: [
        'Premium technical indicators',
        'Advanced market analysis',
        'Custom indicator creation',
        'Professional trading signals'
      ],
      ctaText: 'Upgrade to Pro',
      dismissible: true,
      showComparison: true
    },
    'backtesting': {
      trigger: 'backtesting',
      title: 'Strategy Backtesting',
      description: 'Test your strategies with comprehensive backtesting tools',
      benefits: [
        'Historical data testing',
        'Performance metrics analysis',
        'Risk assessment tools',
        'Strategy optimization insights'
      ],
      ctaText: 'Upgrade to Pro',
      dismissible: true,
      showComparison: true
    }
  };

  return configs[feature] || {
    trigger: feature,
    title: 'Premium Feature',
    description: 'This feature requires a paid subscription plan',
    benefits: [
      'Enhanced functionality',
      'Professional features',
      'Priority support',
      'Advanced capabilities'
    ],
    ctaText: 'Upgrade Now',
    dismissible: true,
    showComparison: true
  };
}