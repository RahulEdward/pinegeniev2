/**
 * Subscription Usage Indicator Component
 * 
 * Shows user's current plan usage and limitations
 */

'use client';

import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { 
  Crown, 
  Zap, 
  FileText, 
  MessageSquare, 
  AlertTriangle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SubscriptionUsageIndicatorProps {
  className?: string;
  showUpgradeButton?: boolean;
  compact?: boolean;
}

export function SubscriptionUsageIndicator({ 
  className = '', 
  showUpgradeButton = true,
  compact = false 
}: SubscriptionUsageIndicatorProps) {
  const { 
    subscription, 
    limitations, 
    loading, 
    isFreePlan, 
    isPaidPlan 
  } = useSubscription();
  const router = useRouter();

  if (loading) {
    return (
      <div className={`bg-gray-100 rounded-lg p-4 animate-pulse ${className}`}>
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  const planName = subscription.planDisplayName || 'Free';
  const isAtLimit = limitations.strategiesUsed >= limitations.strategiesLimit;
  const isNearLimit = limitations.strategiesLimit !== 'unlimited' && 
                     limitations.strategiesUsed >= limitations.strategiesLimit * 0.8;

  if (compact) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isFreePlan() ? (
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">F</span>
              </div>
            ) : (
              <Crown className="h-5 w-5 text-yellow-500" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">{planName}</p>
              <p className="text-xs text-gray-500">
                {limitations.strategiesUsed}/{limitations.strategiesLimit === 'unlimited' ? '∞' : limitations.strategiesLimit} strategies
              </p>
            </div>
          </div>
          
          {isFreePlan() && showUpgradeButton && (
            <button
              onClick={() => router.push('/billing')}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
            >
              Upgrade
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {isFreePlan() ? (
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-sm font-bold text-gray-600">FREE</span>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
              <Crown className="h-5 w-5 text-white" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{planName} Plan</h3>
            <p className="text-sm text-gray-500">
              {isFreePlan() ? 'Basic features included' : 'All premium features unlocked'}
            </p>
          </div>
        </div>

        {isFreePlan() && showUpgradeButton && (
          <button
            onClick={() => router.push('/billing')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2"
          >
            <Crown className="h-4 w-4" />
            <span>Upgrade</span>
          </button>
        )}
      </div>

      {/* Usage Stats */}
      <div className="space-y-4">
        {/* Strategy Storage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Strategy Storage</span>
            </div>
            <span className="text-sm text-gray-500">
              {limitations.strategiesUsed}/{limitations.strategiesLimit === 'unlimited' ? '∞' : limitations.strategiesLimit}
            </span>
          </div>
          
          {limitations.strategiesLimit !== 'unlimited' && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  isAtLimit ? 'bg-red-500' : 
                  isNearLimit ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
                style={{ 
                  width: `${Math.min(100, (limitations.strategiesUsed / limitations.strategiesLimit) * 100)}%` 
                }}
              ></div>
            </div>
          )}
          
          {isAtLimit && (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs">Storage limit reached</span>
            </div>
          )}
        </div>

        {/* AI Access */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">AI Assistant</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              limitations.canUseAI 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {limitations.canUseAI ? 'Available' : 'Restricted'}
            </span>
          </div>
          
          {!limitations.canUseAI && (
            <p className="text-xs text-gray-500">
              Upgrade to Pro for unlimited AI conversations
            </p>
          )}
        </div>

        {/* Template Access */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Templates</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              limitations.canAccessPremiumTemplates 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {limitations.canAccessPremiumTemplates ? 'All Access' : 'Basic Only'}
            </span>
          </div>
          
          {!limitations.canAccessPremiumTemplates && (
            <p className="text-xs text-gray-500">
              Access to beginner templates only
            </p>
          )}
        </div>
      </div>

      {/* Restricted Features */}
      {limitations.restrictedFeatures.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Upgrade to unlock:</h4>
          <div className="space-y-1">
            {limitations.restrictedFeatures.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 text-xs text-gray-500">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span>{feature}</span>
              </div>
            ))}
            {limitations.restrictedFeatures.length > 3 && (
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span>+{limitations.restrictedFeatures.length - 3} more features</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upgrade CTA */}
      {isFreePlan() && showUpgradeButton && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => router.push('/billing')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Upgrade to Pro</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          
          <p className="text-center text-xs text-gray-500 mt-2">
            Starting at ₹24.99/month • 14-day free trial
          </p>
        </div>
      )}
    </div>
  );
}

// Quick usage stats component for header/navbar
export function QuickUsageStats({ className = '' }: { className?: string }) {
  const { limitations, loading, isFreePlan } = useSubscription();
  const router = useRouter();

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-300 rounded w-16"></div>
      </div>
    );
  }

  const isAtLimit = limitations.strategiesUsed >= limitations.strategiesLimit;

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Strategy Count */}
      <div className="flex items-center space-x-1">
        <FileText className="h-4 w-4 text-gray-500" />
        <span className={`text-sm ${isAtLimit ? 'text-red-600' : 'text-gray-600'}`}>
          {limitations.strategiesUsed}/{limitations.strategiesLimit === 'unlimited' ? '∞' : limitations.strategiesLimit}
        </span>
      </div>

      {/* AI Status */}
      <div className="flex items-center space-x-1">
        <MessageSquare className={`h-4 w-4 ${limitations.canUseAI ? 'text-green-500' : 'text-gray-400'}`} />
        <span className={`text-xs ${limitations.canUseAI ? 'text-green-600' : 'text-gray-500'}`}>
          {limitations.canUseAI ? 'AI' : 'No AI'}
        </span>
      </div>

      {/* Upgrade Button */}
      {isFreePlan() && (
        <button
          onClick={() => router.push('/billing')}
          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors flex items-center space-x-1"
        >
          <Crown className="h-3 w-3" />
          <span>Pro</span>
        </button>
      )}
    </div>
  );
}