/**
 * Feature Access Gate Component
 * 
 * More granular access control for specific features with custom handling
 */

'use client';

import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Lock, Crown, Zap } from 'lucide-react';

interface FeatureAccessGateProps {
  feature: string;
  mode?: 'block' | 'disable' | 'overlay';
  showIcon?: boolean;
  iconType?: 'lock' | 'crown' | 'zap';
  customMessage?: string;
  onUpgradeClick?: () => void;
  children: React.ReactNode;
}

export function FeatureAccessGate({
  feature,
  mode = 'block',
  showIcon = true,
  iconType = 'lock',
  customMessage,
  onUpgradeClick,
  children
}: FeatureAccessGateProps) {
  const { checkFeatureAccess, limitations, loading } = useSubscription();

  if (loading) {
    return (
      <div className="relative">
        {children}
        <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const hasAccess = checkFeatureAccess(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  // Feature is restricted
  const IconComponent = getIconComponent(iconType);
  const message = customMessage || getDefaultMessage(feature);

  switch (mode) {
    case 'disable':
      return (
        <div className="relative opacity-50 pointer-events-none">
          {children}
          {showIcon && (
            <div className="absolute top-2 right-2">
              <IconComponent className="h-4 w-4 text-gray-500" />
            </div>
          )}
        </div>
      );

    case 'overlay':
      return (
        <div className="relative">
          <div className="opacity-30 pointer-events-none">
            {children}
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center p-4 text-center">
            {showIcon && <IconComponent className="h-8 w-8 text-blue-500 mb-2" />}
            <p className="text-sm font-medium text-gray-700 mb-2">{message}</p>
            <button
              onClick={onUpgradeClick}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      );

    case 'block':
    default:
      return (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-lg p-6 text-center">
          {showIcon && <IconComponent className="h-12 w-12 text-blue-500 mx-auto mb-4" />}
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {getFeatureTitle(feature)}
          </h3>
          <p className="text-gray-600 mb-4">{message}</p>
          <button
            onClick={onUpgradeClick}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upgrade to Access
          </button>
        </div>
      );
  }
}

function getIconComponent(iconType: string) {
  switch (iconType) {
    case 'crown':
      return Crown;
    case 'zap':
      return Zap;
    case 'lock':
    default:
      return Lock;
  }
}

function getFeatureTitle(feature: string): string {
  const titles: Record<string, string> = {
    'ai_chat': 'AI Chat Assistant',
    'advanced_indicators': 'Advanced Indicators',
    'backtesting': 'Strategy Backtesting',
    'custom_signatures': 'Custom Signatures',
    'premium_templates': 'Premium Templates',
    'api_access': 'API Access',
    'white_label': 'White Label',
    'team_collaboration': 'Team Collaboration'
  };

  return titles[feature] || 'Premium Feature';
}

function getDefaultMessage(feature: string): string {
  const messages: Record<string, string> = {
    'ai_chat': 'Unlock unlimited AI assistance for your Pine Script development',
    'advanced_indicators': 'Access premium indicators and advanced analysis tools',
    'backtesting': 'Test your strategies with comprehensive backtesting tools',
    'custom_signatures': 'Personalize your Pine Script code with custom signatures',
    'premium_templates': 'Access our library of professional strategy templates',
    'api_access': 'Integrate Pine Genie with your applications',
    'white_label': 'Remove branding and customize the interface',
    'team_collaboration': 'Collaborate with your team on strategy development'
  };

  return messages[feature] || 'This feature is available in paid plans';
}