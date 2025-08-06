/**
 * Subscription Guard Component
 * 
 * Protects features based on user subscription plan and shows upgrade prompts
 */

'use client';

import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradePrompt } from './UpgradePrompt';

interface SubscriptionGuardProps {
  feature: string;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  upgradePromptTitle?: string;
  upgradePromptDescription?: string;
  children: React.ReactNode;
}

export function SubscriptionGuard({
  feature,
  fallback,
  showUpgradePrompt = true,
  upgradePromptTitle,
  upgradePromptDescription,
  children
}: SubscriptionGuardProps) {
  const { checkFeatureAccess, limitations, loading } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hasAccess = checkFeatureAccess(feature);

  if (!hasAccess) {
    if (showUpgradePrompt) {
      return (
        <UpgradePrompt
          trigger={feature}
          title={upgradePromptTitle || getDefaultTitle(feature)}
          description={upgradePromptDescription || getDefaultDescription(feature)}
          benefits={getFeatureBenefits(feature)}
          showComparison={true}
        />
      );
    }

    if (fallback) {
      return <>{fallback}</>;
    }

    return null;
  }

  return <>{children}</>;
}

function getDefaultTitle(feature: string): string {
  const titles: Record<string, string> = {
    'ai_chat': 'AI Chat Assistant',
    'advanced_indicators': 'Advanced Indicators',
    'backtesting': 'Strategy Backtesting',
    'custom_signatures': 'Custom Signatures',
    'premium_templates': 'Premium Templates',
    'api_access': 'API Access',
    'white_label': 'White Label Options',
    'team_collaboration': 'Team Collaboration'
  };

  return titles[feature] || 'Premium Feature';
}

function getDefaultDescription(feature: string): string {
  const descriptions: Record<string, string> = {
    'ai_chat': 'Get unlimited AI-powered assistance for your Pine Script strategies',
    'advanced_indicators': 'Access premium technical indicators and advanced analysis tools',
    'backtesting': 'Test your strategies with historical data and performance metrics',
    'custom_signatures': 'Customize your Pine Script signatures and branding',
    'premium_templates': 'Access our library of professional strategy templates',
    'api_access': 'Integrate Pine Genie with your applications via REST API',
    'white_label': 'Remove Pine Genie branding and customize the interface',
    'team_collaboration': 'Share strategies and collaborate with your team members'
  };

  return descriptions[feature] || 'This feature requires a paid subscription plan';
}

function getFeatureBenefits(feature: string): string[] {
  const benefits: Record<string, string[]> = {
    'ai_chat': [
      'Unlimited AI conversations',
      'Advanced strategy optimization',
      'Real-time Pine Script assistance',
      'Custom indicator suggestions'
    ],
    'advanced_indicators': [
      'Premium technical indicators',
      'Advanced market analysis tools',
      'Custom indicator creation',
      'Professional trading signals'
    ],
    'backtesting': [
      'Historical data testing',
      'Performance metrics analysis',
      'Risk assessment tools',
      'Strategy optimization insights'
    ],
    'custom_signatures': [
      'Personalized Pine Script signatures',
      'Custom branding options',
      'Professional code appearance',
      'Brand consistency'
    ],
    'premium_templates': [
      'Access to 50+ professional templates',
      'Advanced strategy patterns',
      'Institutional-grade strategies',
      'Regular template updates'
    ],
    'api_access': [
      'Full REST API access',
      'Custom integrations',
      'Automated strategy deployment',
      'Third-party tool connections'
    ],
    'white_label': [
      'Remove Pine Genie branding',
      'Custom interface themes',
      'Your brand, your way',
      'Professional appearance'
    ],
    'team_collaboration': [
      'Share strategies with team',
      'Collaborative editing',
      'Team workspace management',
      'Permission controls'
    ]
  };

  return benefits[feature] || [
    'Enhanced functionality',
    'Professional features',
    'Priority support',
    'Advanced capabilities'
  ];
}