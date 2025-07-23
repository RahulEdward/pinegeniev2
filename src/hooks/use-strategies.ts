import { useState, useEffect, useCallback } from 'react';
import { TradingStrategy, StrategySearchFilters } from '@/types/strategy';

interface UseStrategiesOptions {
  initialFilters?: StrategySearchFilters;
  autoFetch?: boolean;
}

interface UseStrategiesReturn {
  strategies: TradingStrategy[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  filters: StrategySearchFilters;
  setFilters: (filters: StrategySearchFilters) => void;
  fetchStrategies: () => Promise<void>;
  createStrategy: (data: any) => Promise<TradingStrategy>;
  updateStrategy: (id: string, data: any) => Promise<TradingStrategy>;
  deleteStrategy: (id: string) => Promise<void>;
  cloneStrategy: (id: string, options?: any) => Promise<TradingStrategy>;
  exportStrategy: (id: string, options?: any) => Promise<void>;
  importStrategy: (data: any, options?: any) => Promise<TradingStrategy>;
  searchStrategies: (query: string) => Promise<void>;
}

export function useStrategies(options: UseStrategiesOptions = {}): UseStrategiesReturn {
  const { initialFilters = {}, autoFetch = true } = options;

  const [strategies, setStrategies] = useState<TradingStrategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<StrategySearchFilters>(initialFilters);

  const fetchStrategies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      // Add pagination
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      // Add filters
      if (filters.category) params.append('category', filters.category);
      if (filters.isPublic !== undefined) params.append('isPublic', filters.isPublic.toString());
      if (filters.folderId) params.append('folderId', filters.folderId);
      if (filters.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','));
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.dateRange?.start) params.append('dateFrom', filters.dateRange.start.toISOString());
      if (filters.dateRange?.end) params.append('dateTo', filters.dateRange.end.toISOString());

      const response = await fetch(`/api/strategies?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch strategies');
      }

      setStrategies(result.data.strategies);
      setPagination(result.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  const createStrategy = useCallback(async (data: any): Promise<TradingStrategy> => {
    setError(null);

    try {
      const response = await fetch('/api/strategies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create strategy');
      }

      // Refresh the list
      await fetchStrategies();

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchStrategies]);

  const updateStrategy = useCallback(async (id: string, data: any): Promise<TradingStrategy> => {
    setError(null);

    try {
      const response = await fetch(`/api/strategies/${id}`, {
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

      // Update the strategy in the list
      setStrategies(prev => 
        prev.map(strategy => 
          strategy.id === id ? result.data : strategy
        )
      );

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteStrategy = useCallback(async (id: string): Promise<void> => {
    setError(null);

    try {
      const response = await fetch(`/api/strategies/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete strategy');
      }

      // Remove the strategy from the list
      setStrategies(prev => prev.filter(strategy => strategy.id !== id));
      
      // Update pagination
      setPagination(prev => ({
        ...prev,
        totalCount: prev.totalCount - 1,
        totalPages: Math.ceil((prev.totalCount - 1) / prev.limit),
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const cloneStrategy = useCallback(async (id: string, options: any = {}): Promise<TradingStrategy> => {
    setError(null);

    try {
      const response = await fetch(`/api/strategies/${id}/clone`, {
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

      // Refresh the list
      await fetchStrategies();

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchStrategies]);

  const exportStrategy = useCallback(async (id: string, options: any = {}): Promise<void> => {
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.includeVersions) params.append('includeVersions', 'true');
      if (options.includeBacktests) params.append('includeBacktests', 'true');

      const response = await fetch(`/api/strategies/${id}/export?${params.toString()}`);

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
  }, []);

  const importStrategy = useCallback(async (data: any, options: any = {}): Promise<TradingStrategy> => {
    setError(null);

    try {
      const response = await fetch('/api/strategies/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ importData: data, ...options }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to import strategy');
      }

      // Refresh the list
      await fetchStrategies();

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchStrategies]);

  const searchStrategies = useCallback(async (query: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('q', query);
      
      // Add current filters
      if (filters.category) params.append('category', filters.category);
      if (filters.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','));
      if (filters.folderId) params.append('folderId', filters.folderId);

      const response = await fetch(`/api/strategies/search?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to search strategies');
      }

      setStrategies(result.data.strategies);
      setPagination(result.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchStrategies();
    }
  }, [fetchStrategies, autoFetch]);

  return {
    strategies,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    fetchStrategies,
    createStrategy,
    updateStrategy,
    deleteStrategy,
    cloneStrategy,
    exportStrategy,
    importStrategy,
    searchStrategies,
  };
}