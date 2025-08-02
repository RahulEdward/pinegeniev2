import { useState, useEffect, useCallback } from 'react';
import { StrategyTemplate, TradingStrategy } from '@/types/strategy';

interface UseTemplatesOptions {
  category?: string;
  difficulty?: string;
  isOfficial?: boolean;
  autoFetch?: boolean;
}

interface UseTemplatesReturn {
  templates: StrategyTemplate[];
  loading: boolean;
  error: string | null;
  filters: {
    categories: string[];
    difficulties: string[];
    popularTags: string[];
  };
  fetchTemplates: (searchParams?: TemplateSearchParams) => Promise<void>;
  getTemplate: (id: string) => Promise<StrategyTemplate>;
  createTemplate: (data: CreateTemplateData) => Promise<StrategyTemplate>;
  updateTemplate: (id: string, data: UpdateTemplateData) => Promise<StrategyTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  useTemplate: (id: string, options?: UseTemplateOptions) => Promise<TradingStrategy>;
}

interface TemplateSearchParams {
  category?: string;
  difficulty?: string;
  isOfficial?: boolean;
  search?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

interface CreateTemplateData {
  name: string;
  description: string;
  category: string;
  nodes: any[];
  connections: any[];
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

interface UpdateTemplateData {
  name?: string;
  description?: string;
  category?: string;
  nodes?: any[];
  connections?: any[];
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

interface UseTemplateOptions {
  name?: string;
  description?: string;
  folderId?: string;
  customizations?: {
    nodeParameters?: { [nodeId: string]: any };
  };
}

export function useTemplates(options: UseTemplatesOptions = {}): UseTemplatesReturn {
  const { category, difficulty, isOfficial, autoFetch = true } = options;

  const [templates, setTemplates] = useState<StrategyTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    categories: [],
    difficulties: [],
    popularTags: [],
  });

  const fetchTemplates = useCallback(async (searchParams: TemplateSearchParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      // Apply default options
      if (category) params.append('category', category);
      if (difficulty) params.append('difficulty', difficulty);
      if (isOfficial !== undefined) params.append('isOfficial', isOfficial.toString());

      // Apply search parameters
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'tags' && Array.isArray(value)) {
            params.append('tags', value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`/api/templates?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch templates');
      }

      setTemplates(result.data.templates);
      setFilters(result.data.filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [category, difficulty, isOfficial]);

  const getTemplate = useCallback(async (id: string): Promise<StrategyTemplate> => {
    setError(null);

    try {
      const response = await fetch(`/api/templates/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch template');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const createTemplate = useCallback(async (data: CreateTemplateData): Promise<StrategyTemplate> => {
    setError(null);

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create template');
      }

      // Refresh templates list
      await fetchTemplates();

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchTemplates]);

  const updateTemplate = useCallback(async (id: string, data: UpdateTemplateData): Promise<StrategyTemplate> => {
    setError(null);

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update template');
      }

      // Update local state
      setTemplates(prev => prev.map(template => 
        template.id === id ? { ...template, ...result.data } : template
      ));

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteTemplate = useCallback(async (id: string): Promise<void> => {
    setError(null);

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete template');
      }

      // Remove from local state
      setTemplates(prev => prev.filter(template => template.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const useTemplate = useCallback(async (id: string, options: UseTemplateOptions = {}): Promise<TradingStrategy> => {
    setError(null);

    try {
      const response = await fetch(`/api/templates/${id}/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create strategy from template');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchTemplates();
    }
  }, [fetchTemplates, autoFetch]);

  return {
    templates,
    loading,
    error,
    filters,
    fetchTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate,
  };
}