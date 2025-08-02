'use client';

import React, { useState } from 'react';
import { FolderManager } from './FolderManager';
import { TemplateBrowser } from './TemplateBrowser';
import { StrategySharing } from './StrategySharing';
import { TagManager } from './TagManager';
import { useFolders } from '@/hooks/use-folders';
import { useTemplates } from '@/hooks/use-templates';
import { useStrategy } from '@/hooks/use-strategy';
import { StrategyFolder, StrategyTemplate, TradingStrategy } from '@/types/strategy';

interface StrategyOrganizerProps {
  currentStrategy?: TradingStrategy;
  onStrategyUpdate?: (strategy: TradingStrategy) => void;
  className?: string;
}

type ActiveTab = 'folders' | 'templates' | 'sharing' | 'tags';

export function StrategyOrganizer({
  currentStrategy,
  onStrategyUpdate,
  className = '',
}: StrategyOrganizerProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('folders');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<StrategyTemplate | null>(null);
  
  const { updateStrategy } = useStrategy();
  const { filters: templateFilters } = useTemplates();

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolder(folderId);
  };

  const handleTemplateSelect = (template: StrategyTemplate) => {
    setSelectedTemplate(template);
  };

  const handleStrategyCreate = (strategy: TradingStrategy) => {
    onStrategyUpdate?.(strategy);
  };

  const handleTagsChange = async (tags: string[]) => {
    if (!currentStrategy) return;

    try {
      const updatedStrategy = await updateStrategy({
        tags,
      });
      onStrategyUpdate?.(updatedStrategy);
    } catch (error) {
      console.error('Failed to update strategy tags:', error);
    }
  };

  const handleMoveToFolder = async (folderId: string | null) => {
    if (!currentStrategy) return;

    try {
      const updatedStrategy = await updateStrategy({
        folderId,
      });
      onStrategyUpdate?.(updatedStrategy);
    } catch (error) {
      console.error('Failed to move strategy to folder:', error);
    }
  };

  const tabs = [
    {
      id: 'folders' as ActiveTab,
      name: 'Folders',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
    },
    {
      id: 'templates' as ActiveTab,
      name: 'Templates',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      id: 'sharing' as ActiveTab,
      name: 'Sharing',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
      ),
      disabled: !currentStrategy,
    },
    {
      id: 'tags' as ActiveTab,
      name: 'Tags',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      disabled: !currentStrategy,
    },
  ];

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg ${className}`}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : tab.disabled
                  ? 'border-transparent text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'folders' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            <div>
              <FolderManager
                currentFolderId={selectedFolder}
                onFolderSelect={handleFolderSelect}
                className="h-full"
              />
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Actions
              </h4>
              
              {currentStrategy && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                    Move Current Strategy
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Current strategy: <strong>{currentStrategy.name}</strong>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Current folder: {currentStrategy.folder?.name || 'Root'}
                  </p>
                  
                  {selectedFolder !== currentStrategy.folderId && (
                    <button
                      onClick={() => handleMoveToFolder(selectedFolder)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Move to {selectedFolder ? 'Selected Folder' : 'Root'}
                    </button>
                  )}
                </div>
              )}

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                  Folder Tips
                </h5>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Organize strategies by trading style or market</li>
                  <li>• Use colors to categorize different types</li>
                  <li>• Create nested folders for better organization</li>
                  <li>• Move strategies between folders easily</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <TemplateBrowser
            onTemplateSelect={handleTemplateSelect}
            onStrategyCreate={handleStrategyCreate}
          />
        )}

        {activeTab === 'sharing' && currentStrategy && (
          <StrategySharing
            strategyId={currentStrategy.id}
            isPublic={currentStrategy.isPublic}
            onPublicToggle={(isPublic) => {
              if (currentStrategy) {
                onStrategyUpdate?.({ ...currentStrategy, isPublic });
              }
            }}
          />
        )}

        {activeTab === 'tags' && currentStrategy && (
          <div className="p-6">
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Strategy Tags
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Add tags to help categorize and find your strategies more easily. 
                Tags are searchable and help organize your strategy library.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Strategy Tags
                  </label>
                  <TagManager
                    tags={currentStrategy.tags || []}
                    onTagsChange={handleTagsChange}
                    suggestions={templateFilters.popularTags}
                    placeholder="Add tags to categorize your strategy..."
                    maxTags={10}
                  />
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                    Tag Suggestions
                  </h5>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <strong>Trading Style:</strong>
                      <ul className="mt-1 space-y-1">
                        <li>• scalping</li>
                        <li>• swing-trading</li>
                        <li>• day-trading</li>
                        <li>• position-trading</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Strategy Type:</strong>
                      <ul className="mt-1 space-y-1">
                        <li>• trend-following</li>
                        <li>• mean-reversion</li>
                        <li>• breakout</li>
                        <li>• momentum</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {currentStrategy.tags && currentStrategy.tags.length > 0 && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h5 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                      Current Tags ({currentStrategy.tags.length})
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {currentStrategy.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedTemplate.name}
              </h3>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
                  {selectedTemplate.category}
                </span>
                <span className={`px-2 py-1 text-xs rounded ${
                  selectedTemplate.difficulty === 'beginner' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : selectedTemplate.difficulty === 'intermediate'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {selectedTemplate.difficulty}
                </span>
                {selectedTemplate.isOfficial && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                    Official
                  </span>
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-400">
                {selectedTemplate.description}
              </p>

              {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Tags:</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500 dark:text-gray-400">
                Used by {selectedTemplate._count?.strategies || 0} strategies
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}