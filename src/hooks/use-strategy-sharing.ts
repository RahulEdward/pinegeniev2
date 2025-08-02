import { useState, useEffect, useCallback } from 'react';
import { SharedStrategy } from '@/types/strategy';

interface UseStrategySharingOptions {
  strategyId?: string;
  autoFetch?: boolean;
}

interface UseStrategySharingReturn {
  shares: SharedStrategy[];
  sharedStrategies: any[];
  loading: boolean;
  error: string | null;
  fetchShares: (strategyId: string) => Promise<void>;
  fetchSharedStrategies: () => Promise<void>;
  shareStrategy: (strategyId: string, data: ShareStrategyData) => Promise<void>;
  updateShare: (strategyId: string, data: ShareStrategyData) => Promise<void>;
  removeShare: (strategyId: string, shareId?: string, userId?: string) => Promise<void>;
  makePublic: (strategyId: string) => Promise<void>;
  makePrivate: (strategyId: string) => Promise<void>;
}

interface ShareStrategyData {
  shareWithEmail?: string;
  shareWithUserId?: string;
  permission?: 'READ' | 'WRITE' | 'ADMIN';
  expiresAt?: string;
  makePublic?: boolean;
}

export function useStrategySharing(options: UseStrategySharingOptions = {}): UseStrategySharingReturn {
  const { strategyId, autoFetch = true } = options;

  const [shares, setShares] = useState<SharedStrategy[]>([]);
  const [sharedStrategies, setSharedStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShares = useCallback(async (fetchStrategyId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/strategies/${fetchStrategyId}/share`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch strategy shares');
      }

      setShares(result.data.shares);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSharedStrategies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/shared-strategies');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch shared strategies');
      }

      setSharedStrategies(result.data.sharedStrategies);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const shareStrategy = useCallback(async (shareStrategyId: string, data: ShareStrategyData): Promise<void> => {
    setError(null);

    try {
      const response = await fetch(`/api/strategies/${shareStrategyId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to share strategy');
      }

      // Refresh shares if this is the current strategy
      if (shareStrategyId === strategyId) {
        await fetchShares(shareStrategyId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [strategyId, fetchShares]);

  const updateShare = useCallback(async (shareStrategyId: string, data: ShareStrategyData): Promise<void> => {
    return shareStrategy(shareStrategyId, data);
  }, [shareStrategy]);

  const removeShare = useCallback(async (
    removeStrategyId: string, 
    shareId?: string, 
    userId?: string
  ): Promise<void> => {
    setError(null);

    try {
      const params = new URLSearchParams();
      if (shareId) params.append('shareId', shareId);
      if (userId) params.append('userId', userId);

      const response = await fetch(`/api/strategies/${removeStrategyId}/share?${params.toString()}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to remove strategy share');
      }

      // Refresh shares if this is the current strategy
      if (removeStrategyId === strategyId) {
        await fetchShares(removeStrategyId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [strategyId, fetchShares]);

  const makePublic = useCallback(async (publicStrategyId: string): Promise<void> => {
    return shareStrategy(publicStrategyId, { makePublic: true });
  }, [shareStrategy]);

  const makePrivate = useCallback(async (privateStrategyId: string): Promise<void> => {
    return shareStrategy(privateStrategyId, { makePublic: false });
  }, [shareStrategy]);

  // Auto-fetch on mount and when strategyId changes
  useEffect(() => {
    if (autoFetch && strategyId) {
      fetchShares(strategyId);
    }
  }, [fetchShares, strategyId, autoFetch]);

  return {
    shares,
    sharedStrategies,
    loading,
    error,
    fetchShares,
    fetchSharedStrategies,
    shareStrategy,
    updateShare,
    removeShare,
    makePublic,
    makePrivate,
  };
}