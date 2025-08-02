'use client';

import React, { useState } from 'react';
import { useStrategySharing } from '@/hooks/use-strategy-sharing';

interface StrategySharingProps {
  strategyId: string;
  isPublic: boolean;
  onPublicToggle?: (isPublic: boolean) => void;
  className?: string;
}

export function StrategySharing({
  strategyId,
  isPublic,
  onPublicToggle,
  className = '',
}: StrategySharingProps) {
  const { shares, loading, error, shareStrategy, removeShare, makePublic, makePrivate } = useStrategySharing({
    strategyId,
  });

  const [showShareForm, setShowShareForm] = useState(false);
  const [shareData, setShareData] = useState({
    email: '',
    permission: 'READ' as 'READ' | 'WRITE' | 'ADMIN',
    expiresAt: '',
  });

  const handleTogglePublic = async () => {
    try {
      if (isPublic) {
        await makePrivate(strategyId);
        onPublicToggle?.(false);
      } else {
        await makePublic(strategyId);
        onPublicToggle?.(true);
      }
    } catch (error) {
      console.error('Failed to toggle public status:', error);
    }
  };

  const handleShareStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await shareStrategy(strategyId, {
        shareWithEmail: shareData.email,
        permission: shareData.permission,
        expiresAt: shareData.expiresAt || undefined,
      });

      setShareData({ email: '', permission: 'READ', expiresAt: '' });
      setShowShareForm(false);
    } catch (error) {
      console.error('Failed to share strategy:', error);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    if (!confirm('Are you sure you want to remove this share?')) {
      return;
    }

    try {
      await removeShare(strategyId, shareId);
    } catch (error) {
      console.error('Failed to remove share:', error);
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'READ': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'WRITE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'ADMIN': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const isExpired = (expiresAt: string | null) => {
    return expiresAt && new Date(expiresAt) <= new Date();
  };

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Strategy Sharing
        </h3>
        <button
          onClick={() => setShowShareForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Share Strategy
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Public/Private Toggle */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              Public Access
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isPublic 
                ? 'This strategy is publicly visible to all users'
                : 'This strategy is private and only visible to you and people you share it with'
              }
            </p>
          </div>
          <button
            onClick={handleTogglePublic}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isPublic ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isPublic ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Share Form */}
      {showShareForm && (
        <form onSubmit={handleShareStrategy} className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">
            Share with User
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={shareData.email}
                onChange={(e) => setShareData({ ...shareData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter user's email address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Permission Level
              </label>
              <select
                value={shareData.permission}
                onChange={(e) => setShareData({ ...shareData, permission: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="READ">Read Only - Can view the strategy</option>
                <option value="WRITE">Read & Write - Can view and edit the strategy</option>
                <option value="ADMIN">Admin - Can view, edit, and manage sharing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expiration Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={shareData.expiresAt}
                onChange={(e) => setShareData({ ...shareData, expiresAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Share Strategy
              </button>
              <button
                type="button"
                onClick={() => setShowShareForm(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Existing Shares */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">
          Shared With ({shares.length})
        </h4>

        {shares.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
            This strategy hasn't been shared with anyone yet
          </div>
        ) : (
          <div className="space-y-3">
            {shares.map((share) => (
              <div
                key={share.id}
                className={`flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg ${
                  isExpired(share.expiresAt) ? 'opacity-50' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {share.sharedWithUser?.name || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {share.sharedWithUser?.email}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${getPermissionColor(share.permission)}`}>
                      {share.permission}
                    </span>
                    {isExpired(share.expiresAt) && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded">
                        Expired
                      </span>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Shared on {new Date(share.createdAt).toLocaleDateString()}
                    {share.expiresAt && (
                      <span>
                        {' • '}
                        {isExpired(share.expiresAt) ? 'Expired' : 'Expires'} on{' '}
                        {new Date(share.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveShare(share.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Remove share"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}