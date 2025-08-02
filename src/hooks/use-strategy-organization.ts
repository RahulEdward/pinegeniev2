import { useState, useEffect, useCallback } from 'react';
import { StrategyOrganizationService } from '@/services/strategy-organization-service';

interface UseStrategyOrganizationOptions {
  autoFetch?: boolean;
}

interface UseStrategyOrganizationReturn {
  stats: OrganizationStats | null;
  popularTags: TagCount[];
  unorganizedStrategies: UnorganizedStrategy[];
  folderHierarchy: FolderHierarchy[];
  templateStats: TemplateStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  fetchPopularTags: () => Promise<void>;
  fetchUnorganizedStrategies: () => Promise<void>;
  fetchFolderHierarchy: () => Promise<void>;
  fetchTemplateStats: () => Promise<void>;
  bulkMoveStrategies: (strategyIds: string[], folderId: string | null) => Promise<number>;
  bulkAddTags: (strategyIds: string[], tags: string[]) => Promise<number>;
  suggestFolderForStrategy: (strategyId: string) => Promise<FolderSuggestion[]>;
  cleanupEmptyFolders: () => Promise<number>;
  exportOrganizationStructure: () => Promise<void>;
}

interface OrganizationStats {
  totalStrategies: number;
  totalFolders: number;
  strategiesInFolders: number;
  strategiesWithTags: number;
  publicStrategies: number;
  sharedStrategies: number;
  templatesUsed: number;
  organizationScore: number;
}

interface TagCount {
  tag: string;
  count: number;
}

interface UnorganizedStrategy {
  id: string;
  name: string;
  description?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FolderHierarchy {
  id: string;
  name: string;
  description?: string;
  color?: string;
  parentId?: string;
  children: FolderHierarchy[];
  _count: {
    strategies: number;
    children: number;
  };
}

interface TemplateStats {
  templates: Array<{
    id: string;
    name: string;
    category: string;
    difficulty: string;
    isOfficial: boolean;
    usagePercentage: number;
    _count: {
      strategies: number;
    };
  }>;
  totalTemplates: number;
  totalUsage: number;
  mostPopular: any;
}

interface FolderSuggestion {
  id: string;
  name: string;
  color?: string;
  _count: {
    strategies: number;
  };
}

export function useStrategyOrganization(options: UseStrategyOrganizationOptions = {}): UseStrategyOrganizationReturn {
  const { autoFetch = true } = options;

  const [stats, setStats] = useState<OrganizationStats | null>(null);
  const [popularTags, setPopularTags] = useState<TagCount[]>([]);
  const [unorganizedStrategies, setUnorganizedStrategies] = useState<UnorganizedStrategy[]>([]);
  const [folderHierarchy, setFolderHierarchy] = useState<FolderHierarchy[]>([]);
  const [templateStats, setTemplateStats] = useState<TemplateStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setError(null);

    try {
      const response = await fetch('/api/organization/stats');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch organization stats');
      }

      setStats(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, []);

  const fetchPopularTags = useCallback(async () => {
    setError(null);

    try {
      const response = await fetch('/api/organization/popular-tags');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch popular tags');
      }

      setPopularTags(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, []);

  const fetchUnorganizedStrategies = useCallback(async () => {
    setError(null);

    try {
      const response = await fetch('/api/organization/unorganized');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch unorganized strategies');
      }

      setUnorganizedStrategies(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, []);

  const fetchFolderHierarchy = useCallback(async () => {
    setError(null);

    try {
      const response = await fetch('/api/organization/folder-hierarchy');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch folder hierarchy');
      }

      setFolderHierarchy(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, []);

  const fetchTemplateStats = useCallback(async () => {
    setError(null);

    try {
      const response = await fetch('/api/organization/template-stats');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch template stats');
      }

      setTemplateStats(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, []);

  const bulkMoveStrategies = useCallback(async (strategyIds: string[], folderId: string | null): Promise<number> => {
    setError(null);

    try {
      const response = await fetch('/api/organization/bulk-move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ strategyIds, folderId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to move strategies');
      }

      // Refresh data
      await Promise.all([fetchStats(), fetchUnorganizedStrategies()]);

      return result.data.movedCount;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchStats, fetchUnorganizedStrategies]);

  const bulkAddTags = useCallback(async (strategyIds: string[], tags: string[]): Promise<number> => {
    setError(null);

    try {
      const response = await fetch('/api/organization/bulk-tag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ strategyIds, tags }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add tags');
      }

      // Refresh data
      await Promise.all([fetchStats(), fetchPopularTags(), fetchUnorganizedStrategies()]);

      return result.data.updatedCount;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchStats, fetchPopularTags, fetchUnorganizedStrategies]);

  const suggestFolderForStrategy = useCallback(async (strategyId: string): Promise<FolderSuggestion[]> => {
    setError(null);

    try {
      const response = await fetch(`/api/organization/suggest-folder/${strategyId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get folder suggestions');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const cleanupEmptyFolders = useCallback(async (): Promise<number> => {
    setError(null);

    try {
      const response = await fetch('/api/organization/cleanup-folders', {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to cleanup folders');
      }

      // Refresh data
      await Promise.all([fetchStats(), fetchFolderHierarchy()]);

      return result.data.deletedCount;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchStats, fetchFolderHierarchy]);

  const exportOrganizationStructure = useCallback(async (): Promise<void> => {
    setError(null);

    try {
      const response = await fetch('/api/organization/export');

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to export organization structure');
      }

      // Trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `strategy-organization-${new Date().toISOString().split('T')[0]}.json`;
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

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    
    try {
      await Promise.all([
        fetchStats(),
        fetchPopularTags(),
        fetchUnorganizedStrategies(),
        fetchFolderHierarchy(),
        fetchTemplateStats(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchStats, fetchPopularTags, fetchUnorganizedStrategies, fetchFolderHierarchy, fetchTemplateStats]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchAllData();
    }
  }, [fetchAllData, autoFetch]);

  return {
    stats,
    popularTags,
    unorganizedStrategies,
    folderHierarchy,
    templateStats,
    loading,
    error,
    fetchStats,
    fetchPopularTags,
    fetchUnorganizedStrategies,
    fetchFolderHierarchy,
    fetchTemplateStats,
    bulkMoveStrategies,
    bulkAddTags,
    suggestFolderForStrategy,
    cleanupEmptyFolders,
    exportOrganizationStructure,
  };
}