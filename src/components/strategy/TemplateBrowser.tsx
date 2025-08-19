'use client';

import React, { useState } from 'react';
import { useTemplates } from '@/hooks/use-templates';
import { StrategyTemplate, TradingStrategy } from '@/types/strategy';

interface TemplateBrowserProps {
  onTemplateSelect?: (template: StrategyTemplate) => void;
  onStrategyCreate?: (strategy: TradingStrategy) => void;
  className?: string;
}

export function TemplateBrowser({
  onTemplateSelect,
  onStrategyCreate,
  className = '',
}: TemplateBrowserProps) {
  const { templates, loading, error, filters, fetchTemplates, useTemplate: createFromTemplate } = useTemplates();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showUseDialog, setShowUseDialog] = useState<StrategyTemplate | null>(null);
  const [useTemplateData, setUseTemplateData] = useState({
    name: '',
    description: '',
    folderId: '',
  });

  const handleSearch = () => {
    fetchTemplates({
      search: searchQuery || undefined,
      category: selectedCategory || undefined,
      difficulty: selectedDifficulty || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    });
  };

  const handleUseTemplate = async (template: StrategyTemplate) => {
    setShowUseDialog(template);
    setUseTemplateData({
      name: `${template.name} Strategy`,
      description: `Strategy created from ${template.name} template`,
      folderId: '',
    });
  };

  const confirmUseTemplate = async () => {
    if (!showUseDialog) return;

    try {
      const strategy = await createFromTemplate(showUseDialog.id, {
        name: useTemplateData.name || undefined,
        description: useTemplateData.description || undefined,
        folderId: useTemplateData.folderId || undefined,
      });

      setShowUseDialog(null);
      onStrategyCreate?.(strategy);
    } catch (error) {
      console.error('Failed to create strategy from template:', error);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-red-600 text-center">
          Error loading templates: {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Strategy Templates
        </h2>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>

          <div className="flex flex-wrap gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Categories</option>
              {filters.categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Difficulties</option>
              {filters.difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Popular Tags */}
          {filters.popularTags.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Popular Tags:
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.popularTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {template.name}
              </h3>
              {template.isOfficial && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                  Official
                </span>
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
              {template.description}
            </p>

            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded">
                {template.category}
              </span>
              <span className={`px-2 py-1 text-xs rounded ${getDifficultyColor(template.difficulty)}`}>
                {template.difficulty}
              </span>
            </div>

            {template.tags && template.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {template.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {template.tags.length > 3 && (
                  <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                    +{template.tags.length - 3} more
                  </span>
                )}
              </div>
            )}

            <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Used by {template._count?.strategies || 0} strategies
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onTemplateSelect?.(template)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Preview
              </button>
              <button
                onClick={() => handleUseTemplate(template)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            No templates found matching your criteria
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
              setSelectedDifficulty('');
              setSelectedTags([]);
              fetchTemplates();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Use Template Dialog */}
      {showUseDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create Strategy from Template
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Strategy Name
                </label>
                <input
                  type="text"
                  value={useTemplateData.name}
                  onChange={(e) => setUseTemplateData({ ...useTemplateData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={useTemplateData.description}
                  onChange={(e) => setUseTemplateData({ ...useTemplateData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={confirmUseTemplate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Create Strategy
                </button>
                <button
                  onClick={() => setShowUseDialog(null)}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}