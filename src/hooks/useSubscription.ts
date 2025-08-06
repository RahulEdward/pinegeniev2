/**
 * Enhanced Subscription Hook
 * 
 * Custom hook for checking subscription access, limits, and enforcing restrictions
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface SubscriptionPlanLimits {
  strategiesPerMonth: number | 'unlimited';
  templatesAccess: 'basic' | 'all';
  aiGenerations: number | 'unlimited';
  aiChatAccess: boolean;
  scriptStorage: number | 'unlimited';
  exportFormats: string[];
  supportLevel: 'community' | 'priority' | 'dedicated';
  customSignatures: boolean;
  apiAccess: boolean;
  whiteLabel: boolean;
  teamCollaboration: boolean;
  advancedIndicators: boolean;
  backtesting: boolean;
}

interface SubscriptionInfo {
  id: string;
  planName: string;
  planDisplayName: string;
  status: string;
  isActive: boolean;
  features: any[];
  limits: SubscriptionPlanLimits;
}

interface UserUsage {
  strategiesCount: number;
  aiUsageThisMonth: number;
  templatesUsed: string[];
  lastUpdated: Date;
}

interface SubscriptionLimitations {
  canSaveStrategy: boolean;
  canUseAI: boolean;
  canAccessPremiumTemplates: boolean;
  canUseAdvancedFeatures: boolean;
  strategiesUsed: number;
  strategiesLimit: number | 'unlimited';
  aiUsageUsed: number;
  aiUsageLimit: number | 'unlimited';
  upgradeRequired: string[];
  restrictedFeatures: string[];
}

interface AccessInfo {
  hasAccess: boolean;
  currentCount?: number;
  limit?: number | 'unlimited';
  remaining?: number | 'unlimited';
  reason?: string;
}

export function useSubscription() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchSubscriptionData();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Fetch subscription and usage data in parallel
      const [subscriptionResponse, usageResponse] = await Promise.all([
        fetch('/api/subscription/current'),
        fetch('/api/subscription/usage')
      ]);
      
      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json();
        setSubscription(subscriptionData.subscription);
      }
      
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setUsage(usageData.usage);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate comprehensive limitations based on subscription and usage
  const limitations = useCallback((): SubscriptionLimitations => {
    if (!subscription || !usage) {
      return {
        canSaveStrategy: false,
        canUseAI: false,
        canAccessPremiumTemplates: false,
        canUseAdvancedFeatures: false,
        strategiesUsed: 0,
        strategiesLimit: 0,
        aiUsageUsed: 0,
        aiUsageLimit: 0,
        upgradeRequired: [],
        restrictedFeatures: []
      };
    }

    const limits = subscription.limits;
    const upgradeRequired: string[] = [];
    const restrictedFeatures: string[] = [];

    // Strategy storage limitations
    const strategiesLimit = limits.scriptStorage === 'unlimited' ? 'unlimited' : limits.scriptStorage;
    const canSaveStrategy = strategiesLimit === 'unlimited' || usage.strategiesCount < strategiesLimit;
    
    if (!canSaveStrategy) {
      upgradeRequired.push('strategy_storage');
      restrictedFeatures.push('Save additional strategies');
    }

    // AI access limitations
    const canUseAI = limits.aiChatAccess;
    const aiUsageLimit = limits.aiGenerations === 'unlimited' ? 'unlimited' : limits.aiGenerations;
    
    if (!canUseAI) {
      upgradeRequired.push('ai_access');
      restrictedFeatures.push('AI Chat Assistant', 'AI Strategy Optimization');
    }

    // Template access limitations
    const canAccessPremiumTemplates = limits.templatesAccess === 'all';
    
    if (!canAccessPremiumTemplates) {
      upgradeRequired.push('premium_templates');
      restrictedFeatures.push('Premium Strategy Templates');
    }

    // Advanced features limitations
    const canUseAdvancedFeatures = limits.advancedIndicators && limits.backtesting;
    
    if (!canUseAdvancedFeatures) {
      upgradeRequired.push('advanced_features');
      if (!limits.advancedIndicators) restrictedFeatures.push('Advanced Indicators');
      if (!limits.backtesting) restrictedFeatures.push('Strategy Backtesting');
      if (!limits.customSignatures) restrictedFeatures.push('Custom Signatures');
    }

    return {
      canSaveStrategy,
      canUseAI,
      canAccessPremiumTemplates,
      canUseAdvancedFeatures,
      strategiesUsed: usage.strategiesCount,
      strategiesLimit,
      aiUsageUsed: usage.aiUsageThisMonth,
      aiUsageLimit,
      upgradeRequired,
      restrictedFeatures
    };
  }, [subscription, usage]);

  const checkAccess = useCallback(async (feature: string): Promise<AccessInfo> => {
    try {
      const response = await fetch(`/api/subscription/check-access?feature=${feature}`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          hasAccess: data.hasAccess,
          currentCount: data.currentCount,
          limit: data.limit,
          remaining: data.remaining,
          reason: data.reason
        };
      }
      
      return { hasAccess: false, reason: 'API request failed' };
    } catch (error) {
      console.error('Error checking access:', error);
      return { hasAccess: false, reason: 'Network error' };
    }
  }, []);

  // Specific access check methods
  const checkAIChatAccess = useCallback((): boolean => {
    return subscription?.limits?.aiChatAccess || false;
  }, [subscription]);

  const checkStrategyStorageAccess = useCallback((): AccessInfo => {
    if (!subscription || !usage) {
      return { hasAccess: false, reason: 'Subscription data not loaded' };
    }

    const limit = subscription.limits.scriptStorage;
    const current = usage.strategiesCount;
    
    if (limit === 'unlimited') {
      return { 
        hasAccess: true, 
        currentCount: current, 
        limit: 'unlimited',
        remaining: 'unlimited'
      };
    }

    const hasAccess = current < limit;
    const remaining = Math.max(0, limit - current);

    return {
      hasAccess,
      currentCount: current,
      limit,
      remaining,
      reason: hasAccess ? undefined : 'Storage limit reached'
    };
  }, [subscription, usage]);

  const checkTemplateAccess = useCallback((templateType: 'basic' | 'premium'): boolean => {
    if (!subscription) return false;
    
    if (templateType === 'basic') return true;
    return subscription.limits.templatesAccess === 'all';
  }, [subscription]);

  const checkFeatureAccess = useCallback((feature: string): boolean => {
    if (!subscription) return false;
    
    const limits = subscription.limits;
    
    switch (feature) {
      case 'ai_chat':
        return limits.aiChatAccess;
      case 'advanced_indicators':
        return limits.advancedIndicators;
      case 'backtesting':
        return limits.backtesting;
      case 'custom_signatures':
        return limits.customSignatures;
      case 'api_access':
        return limits.apiAccess;
      case 'white_label':
        return limits.whiteLabel;
      case 'team_collaboration':
        return limits.teamCollaboration;
      default:
        return false;
    }
  }, [subscription]);

  const getRemainingQuota = useCallback((resource: string): number | 'unlimited' => {
    if (!subscription || !usage) return 0;
    
    const limits = subscription.limits;
    
    switch (resource) {
      case 'strategies':
        if (limits.scriptStorage === 'unlimited') return 'unlimited';
        return Math.max(0, limits.scriptStorage - usage.strategiesCount);
      case 'ai_usage':
        if (limits.aiGenerations === 'unlimited') return 'unlimited';
        return Math.max(0, limits.aiGenerations - usage.aiUsageThisMonth);
      default:
        return 0;
    }
  }, [subscription, usage]);

  const isFreePlan = useCallback((): boolean => {
    return subscription?.planName === 'free';
  }, [subscription]);

  const isPaidPlan = useCallback((): boolean => {
    return subscription?.planName !== 'free' && subscription?.isActive;
  }, [subscription]);

  return {
    subscription,
    usage,
    limitations: limitations(),
    loading,
    
    // Access checking methods
    checkAccess,
    checkAIChatAccess,
    checkStrategyStorageAccess,
    checkTemplateAccess,
    checkFeatureAccess,
    getRemainingQuota,
    
    // Plan type checks
    isFreePlan,
    isPaidPlan,
    
    // Utility methods
    refetch: fetchSubscriptionData,
    refreshUsage: () => fetchSubscriptionData()
  };
}