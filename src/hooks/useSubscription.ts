/**
 * Subscription Hook
 * 
 * Custom hook for checking subscription access and limits
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface SubscriptionInfo {
  id: string;
  planName: string;
  planDisplayName: string;
  status: string;
  isActive: boolean;
  features: any[];
  limits: any;
}

interface AccessInfo {
  hasAccess: boolean;
  currentCount?: number;
  limit?: number | 'unlimited';
  remaining?: number | 'unlimited';
}

export function useSubscription() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchSubscription();
    }
  }, [session]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscription/current');
      
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAccess = async (feature: string): Promise<AccessInfo> => {
    try {
      const response = await fetch(`/api/subscription/check-access?feature=${feature}`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          hasAccess: data.hasAccess,
          currentCount: data.currentCount,
          limit: data.limit,
          remaining: data.remaining
        };
      }
      
      return { hasAccess: false };
    } catch (error) {
      console.error('Error checking access:', error);
      return { hasAccess: false };
    }
  };

  const checkAIChatAccess = async (): Promise<boolean> => {
    const result = await checkAccess('ai_chat');
    return result.hasAccess;
  };

  const checkScriptStorageLimit = async (): Promise<AccessInfo> => {
    return await checkAccess('script_storage');
  };

  return {
    subscription,
    loading,
    checkAccess,
    checkAIChatAccess,
    checkScriptStorageLimit,
    refetch: fetchSubscription
  };
}