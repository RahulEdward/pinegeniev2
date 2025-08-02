'use client';

import React, { useState } from 'react';
import { useFolders } from '@/hooks/use-folders';
import { StrategyFolder } from '@/types/strategy';

interface FolderManagerProps {
  currentFolderId?: string | null;
  onFolderSelect?: (folderId: string | null) => void;
  onFolderCreate?: (folder: StrategyFolder) => void;
  showCreateButton?: boolean;
  className?: string;
}

export function FolderManager({
  currentFolderId,
  onFolderSelect,
  onFolderCreate,
  showCreateButton = true,
  className = '',
}: FolderManagerProps) {
  const { folders, loading, error, createFolder, updateFolder, deleteFolder } = useFolders({
    parentId: currentFolderId,
    includeStrategies: true,
  });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFolder, setEditingFolder] = useState<StrategyFolder | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
  });

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newFolder = await createFolder({
        name: formData.name,
        description: formData.description || undefined,
        parentId: currentFolderId,
        color: formData.color,
      });

      setFormData({ name: '', description: '', color: '#3B82F6' });
      setShowCreateForm(false);
      onFolderCreate?.(newFolder);
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleUpdateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingFolder) return;

    try {
      await updateFolder(editingFolder.id, {
        name: formData.name,
        description: formData.description || undefined,
        color: formData.color,
      });

      setFormData({ name: '', description: '', color: '#3B82F6' });
      setEditingFolder(null);
    } catch (error) {
      console.error('Failed to update folder:', error);
    }
  };

  const handleDeleteFolder = async (folderId: string, force = false) => {
    if (!confirm(`Are you sure you want to delete this folder${force ? ' and move its contents to the parent folder' : ''}?`)) {
      return;
    }

    try {
      await deleteFolder(folderId, force);
    } catch (error) {
      console.error('Failed to delete folder:', error);
      // If folder is not empty, ask if user wants to force delete
      if (error instanceof Error && error.message.includes('not empty')) {
        if (confirm('Folder is not empty. Move contents to parent folder and delete?')) {
          await deleteFolder(folderId, true);
        }
      }
    }
  };

  const startEdit = (folder: StrategyFolder) => {
    setEditingFolder(folder);
    setFormData({
      name: folder.name,
      description: folder.description || '',
      color: folder.color || '#3B82F6',
    });
    setShowCreateForm(false);
  };

  const cancelEdit = () => {
    setEditingFolder(null);
    setFormData({ name: '', description: '', color: '#3B82F6' });
  };

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-red-600 text-sm">
          Error loading folders: {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Folders
        </h3>
        {showCreateButton && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            New Folder
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingFolder) && (
        <form onSubmit={editingFolder ? handleUpdateFolder : handleCreateFolder} className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Folder Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter folder name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter folder description"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-16 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                {editingFolder ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  cancelEdit();
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Folders List */}
      <div className="space-y-2">
        {folders.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
            No folders found
          </div>
        ) : (
          folders.map((folder) => (
            <div
              key={folder.id}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div 
                className="flex items-center gap-3 flex-1 cursor-pointer"
                onClick={() => onFolderSelect?.(folder.id)}
              >
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: folder.color || '#3B82F6' }}
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {folder.name}
                  </div>
                  {folder.description && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {folder.description}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {folder._count?.strategies || 0} strategies, {folder._count?.children || 0} subfolders
                  </div>
                </div>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => startEdit(folder)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit folder"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteFolder(folder.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete folder"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}