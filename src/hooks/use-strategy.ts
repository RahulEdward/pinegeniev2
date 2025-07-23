import { useState, useEffect, useCallback } from 'react';
import { TradingStrategy, StrategyVersion } from '@/types/strategy';

interface UseStrategyOptions {
  strategyId?: string;
  autoFetch?: boolean;
}

interface UseStrategyReturn {
  strategy: TradingStrategy | null;
  versions: StrategyVersion[];
  loading: boolean;
  error: string | null;
  fetchStrategy: (id: string) => Promise<void>;
  updateStrategy: (data: any) => Promise<TradingStrategy>;
  deleteStrategy: () => Promise<void>;
  createVersion: (data: any) => Promise<StrategyVersion>;
  restoreVersion: (versionId: string) => Promise<TradingStrategy>;
  fetchVersions: () => Promise<void>;
  cloneStrategy: (options?: any) => Promise<TradingStrategy>;
  exportStrategy: (options?: any) => Promise<void>;
}

export function useStrategy(options: UseStrategyOptions = {}): UseStrategyReturn {
  const { strategyId, autoFetch = true } = options;

  const [strategy, setStrategy] = useState<TradingStrategy | null>(null);
  const [versions, setVersions] = useState<StrategyVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStrategy = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/strategies/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch strategy');
      }

      setStrategy(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStrategy = useCallback(async (data: any): Promise<TradingStrategy> => {
    if (!strategy) {
      throw new Error('No strategy loaded');
    }

    setError(null);

    try {
      const response = await fetch(`/api/strategies/${strategy.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update strategy');
      }

      setStrategy(result.data);
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [strategy]);

  const deleteStrategy = useCallback(async (): Promise<void> => {
    if (!strategy) {
      throw new Error('No strategy loaded');
    }

    setError(null);

    try {
      const response = await fetch(`/api/strategies/${strategy.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete strategy');
      }

      setStrategy(null);
      setVersions([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [strategy]);

  const fetchVersions = useCallback(async () => {
    if (!strategy) return;

    setError(null);

    try {
      const response = await fetch(`/api/strategies/${strategy.id}/versions`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch versions');
      }

      setVersions(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [strategy]);

  const createVersion = useCallback(async (data: any): Promise<StrategyVersion> => {
    if (!strategy) {
      throw new Error('No strategy loaded');
    }

    setError(null);

    try {
      const response = await fetch(`/api/strategies/${strategy.id}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create version');
      }

      // Refresh versions list
      await fetchVersions();

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [strategy, fetchVersions]);

  const restoreVersion = useCallback(async (versionId: string): Promise<TradingStrategy> => {
    if (!strategy) {
      throw new Error('No strategy loaded');
    }

    setError(null);

    try {
      const response = await fetch(`/api/strategies/${strategy.id}/versions/${versionId}/restore`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to restore version');
      }

      setStrategy(result.data);
      
      // Refresh versions list
      await fetchVersions();

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [strategy, fetchVersions]);

  const cloneStrategy = useCallback(async (options: any = {}): Promise<TradingStrategy> => {
    if (!strategy) {
      throw new Error('No strategy loaded');
    }

    setError(null);

    try {
      const response = await fetch(`/api/strategies/${strategy.id}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to clone strategy');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [strategy]);

  const exportStrategy = useCallback(async (options: any = {}): Promise<void> => {
    if (!strategy) {
      throw new Error('No strategy loaded');
    }

    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.includeVersions) params.append('includeVersions', 'true');
      if (options.includeBacktests) params.append('includeBacktests', 'true');

      const response = await fetch(`/api/strategies/${strategy.id}/export?${params.toString()}`);

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to export strategy');
      }

      // Trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'strategy_export.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [strategy]);

  // Auto-fetch on mount and when strategyId changes
  useEffect(() => {
    if (autoFetch && strategyId) {
      fetchStrategy(strategyId);
    }
  }, [fetchStrategy, strategyId, autoFetch]);

  // Fetch versions when strategy is loaded
  useEffect(() => {
    if (strategy) {
      fetchVersions();
    }
  }, [strategy, fetchVersions]);

  return {
    strategy,
    versions,
    loading,
    error,
    fetchStrategy,
    updateStrategy,
    deleteStrategy,
    createVersion,
    restoreVersion,
    fetchVersions,
    cloneStrategy,
    exportStrategy,
  };
}