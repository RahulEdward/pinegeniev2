import { useState, useEffect, useCallback } from 'react';
import { StrategyFolder } from '@/types/strategy';

interface UseFoldersOptions {
  parentId?: string | null;
  includeStrategies?: boolean;
  autoFetch?: boolean;
}

interface UseFoldersReturn {
  folders: StrategyFolder[];
  loading: boolean;
  error: string | null;
  fetchFolders: (parentId?: string | null) => Promise<void>;
  createFolder: (data: CreateFolderData) => Promise<StrategyFolder>;
  updateFolder: (id: string, data: UpdateFolderData) => Promise<StrategyFolder>;
  deleteFolder: (id: string, force?: boolean) => Promise<void>;
  moveFolder: (id: string, newParentId: string | null) => Promise<StrategyFolder>;
}

interface CreateFolderData {
  name: string;
  description?: string;
  parentId?: string | null;
  color?: string;
}

interface UpdateFolderData {
  name?: string;
  description?: string;
  parentId?: string | null;
  color?: string;
}

export function useFolders(options: UseFoldersOptions = {}): UseFoldersReturn {
  const { parentId, includeStrategies = false, autoFetch = true } = options;

  const [folders, setFolders] = useState<StrategyFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFolders = useCallback(async (fetchParentId?: string | null) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (includeStrategies) params.append('includeStrategies', 'true');
      if (fetchParentId !== undefined) {
        params.append('parentId', fetchParentId || 'null');
      } else if (parentId !== undefined) {
        params.append('parentId', parentId || 'null');
      }

      const response = await fetch(`/api/folders?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch folders');
      }

      setFolders(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [parentId, includeStrategies]);

  const createFolder = useCallback(async (data: CreateFolderData): Promise<StrategyFolder> => {
    setError(null);

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create folder');
      }

      // Refresh folders list
      await fetchFolders();

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchFolders]);

  const updateFolder = useCallback(async (id: string, data: UpdateFolderData): Promise<StrategyFolder> => {
    setError(null);

    try {
      const response = await fetch(`/api/folders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update folder');
      }

      // Update local state
      setFolders(prev => prev.map(folder => 
        folder.id === id ? { ...folder, ...result.data } : folder
      ));

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteFolder = useCallback(async (id: string, force = false): Promise<void> => {
    setError(null);

    try {
      const params = new URLSearchParams();
      if (force) params.append('force', 'true');

      const response = await fetch(`/api/folders/${id}?${params.toString()}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete folder');
      }

      // Remove from local state
      setFolders(prev => prev.filter(folder => folder.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const moveFolder = useCallback(async (id: string, newParentId: string | null): Promise<StrategyFolder> => {
    return updateFolder(id, { parentId: newParentId });
  }, [updateFolder]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchFolders();
    }
  }, [fetchFolders, autoFetch]);

  return {
    folders,
    loading,
    error,
    fetchFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    moveFolder,
  };
}