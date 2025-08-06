/**
 * Dashboard Subscription Card Component
 * 
 * Displays subscription status and usage on the dashboard
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
  ArrowRight,
  Sparkles,
  Lock,
  CheckCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DashboardSubscriptionCardProps {
  darkMode?: boolean;
  className?: string;
}

export function DashboardSubscriptionCard({ 
  darkMode = false, 
  className = '' 
}: DashboardSubscriptionCardProps) {
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
      <div className={`backdrop-blur-xl rounded-2xl border p-6 transition-colors ${
        darkMode
          ? 'bg-slate-800/50 border-slate-700/50'
          : 'bg-white/70 border-gray-200/50 shadow-lg'
      } ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          </div>
        </div>
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

  return (
    <div className={`backdrop-blur-xl rounded-2xl border p-6 transition-colors ${
      darkMode
        ? 'bg-slate-800/50 border-slate-700/50'
        : 'bg-white/70 border-gray-200/50 shadow-lg'
    } ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {isFreePlan() ? (
            <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">FREE</span>
            </div>
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
              <Crown className="h-6 w-6 text-white" />
            </div>
          )}
          <div>
            <h3 className={`text-xl font-bold transition-colors ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {planName} Plan
            </h3>
            <p className={`text-sm transition-colors ${
              darkMode ? 'text-slate-300' : 'text-gray-600'
            }`}>
              {isFreePlan() ? 'Basic features included' : 'All premium features unlocked'}
            </p>
          </div>
        </div>

        {isFreePlan() && (
          <button
            onClick={() => router.push('/billing')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2 shadow-lg"
          >
            <Crown className="h-4 w-4" />
            <span>Upgrade</span>
          </button>
        )}
      </div>

      {/* Usage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Strategy Storage */}
        <div className={`p-4 rounded-xl border transition-colors ${
          darkMode 
            ? 'bg-slate-700/30 border-slate-600/50' 
            : 'bg-gray-50/50 border-gray-200/50'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <FileText className={`h-5 w-5 ${
              isAtLimit ? 'text-red-500' : 'text-blue-500'
            }`} />
            <span className={`text-sm font-medium transition-colors ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Strategies
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-2xl font-bold ${
                isAtLimit ? 'text-red-500' : darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {limitations.strategiesUsed}
              </span>
              <span className={`text-sm transition-colors ${
                darkMode ? 'text-slate-400' : 'text-gray-500'
              }`}>
                / {limitations.strategiesLimit === 'unlimited' ? '∞' : limitations.strategiesLimit}
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
              <div className="flex items-center space-x-1 text-red-500">
                <AlertTriangle className="h-3 w-3" />
                <span className="text-xs">Limit reached</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Access */}
        <div className={`p-4 rounded-xl border transition-colors ${
          darkMode 
            ? 'bg-slate-700/30 border-slate-600/50' 
            : 'bg-gray-50/50 border-gray-200/50'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <MessageSquare className={`h-5 w-5 ${
              limitations.canUseAI ? 'text-green-500' : 'text-gray-400'
            }`} />
            <span className={`text-sm font-medium transition-colors ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              AI Assistant
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {limitations.canUseAI ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className={`text-sm font-medium text-green-500`}>
                    Available
                  </span>
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5 text-gray-400" />
                  <span className={`text-sm font-medium text-gray-400`}>
                    Restricted
                  </span>
                </>
              )}
            </div>
            
            <p className={`text-xs transition-colors ${
              darkMode ? 'text-slate-400' : 'text-gray-500'
            }`}>
              {limitations.canUseAI 
                ? 'Unlimited conversations' 
                : 'Upgrade for AI access'
              }
            </p>
          </div>
        </div>

        {/* Template Access */}
        <div className={`p-4 rounded-xl border transition-colors ${
          darkMode 
            ? 'bg-slate-700/30 border-slate-600/50' 
            : 'bg-gray-50/50 border-gray-200/50'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <Zap className={`h-5 w-5 ${
              limitations.canAccessPremiumTemplates ? 'text-purple-500' : 'text-yellow-500'
            }`} />
            <span className={`text-sm font-medium transition-colors ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Templates
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {limitations.canAccessPremiumTemplates ? (
                <>
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <span className={`text-sm font-medium text-purple-500`}>
                    All Access
                  </span>
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5 text-yellow-500" />
                  <span className={`text-sm font-medium text-yellow-500`}>
                    Basic Only
                  </span>
                </>
              )}
            </div>
            
            <p className={`text-xs transition-colors ${
              darkMode ? 'text-slate-400' : 'text-gray-500'
            }`}>
              {limitations.canAccessPremiumTemplates 
                ? '50+ professional templates' 
                : 'Beginner templates only'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Restricted Features Alert */}
      {limitations.restrictedFeatures.length > 0 && (
        <div className={`p-4 rounded-xl border-2 border-dashed mb-6 transition-colors ${
          darkMode 
            ? 'bg-blue-500/10 border-blue-500/30' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className={`font-medium mb-2 transition-colors ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Unlock Premium Features
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mb-3">
                {limitations.restrictedFeatures.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                    <span className={`text-xs transition-colors ${
                      darkMode ? 'text-slate-300' : 'text-gray-600'
                    }`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
              {limitations.restrictedFeatures.length > 4 && (
                <p className={`text-xs transition-colors ${
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  +{limitations.restrictedFeatures.length - 4} more premium features
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upgrade CTA */}
      {isFreePlan() && (
        <div className="space-y-3">
          <button
            onClick={() => router.push('/billing')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2 shadow-lg"
          >
            <TrendingUp className="h-5 w-5" />
            <span className="font-medium">Upgrade to Pro Plan</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          
          <div className="text-center">
            <p className={`text-sm transition-colors ${
              darkMode ? 'text-slate-300' : 'text-gray-600'
            }`}>
              Starting at <span className="font-bold">₹24.99/month</span>
            </p>
            <p className={`text-xs transition-colors ${
              darkMode ? 'text-slate-400' : 'text-gray-500'
            }`}>
              14-day free trial • Cancel anytime • No hidden fees
            </p>
          </div>
        </div>
      )}

      {/* Pro Plan Benefits */}
      {isPaidPlan() && (
        <div className={`p-4 rounded-xl border transition-colors ${
          darkMode 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className={`font-medium text-green-500`}>
              Pro Plan Active
            </span>
          </div>
          <p className={`text-sm transition-colors ${
            darkMode ? 'text-slate-300' : 'text-gray-600'
          }`}>
            You have access to all premium features including unlimited strategies, 
            AI assistance, and professional templates.
          </p>
        </div>
      )}
    </div>
  );
}