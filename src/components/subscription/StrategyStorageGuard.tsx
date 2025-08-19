/**
 * Strategy Storage Guard Component
 * 
 * Blocks strategy saves when user reaches their plan limit
 */

'use client';

import React, { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Save, AlertTriangle, Trash2, Crown } from 'lucide-react';
import { UpgradePrompt } from './UpgradePrompt';

interface StrategyStorageGuardProps {
  onSaveAttempt: () => void;
  onUpgradePrompt?: () => void;
  onDeleteStrategy?: (strategyId: string) => void;
  children: React.ReactNode;
  strategyName?: string;
  showDeleteOption?: boolean;
}

export function StrategyStorageGuard({
  onSaveAttempt,
  onUpgradePrompt,
  onDeleteStrategy,
  children,
  strategyName = 'strategy',
  showDeleteOption = true
}: StrategyStorageGuardProps) {
  const { limitations, checkStrategyStorageAccess, loading, isFreePlan } = useSubscription();
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);

  const handleSaveClick = () => {
    if (loading) return;

    const storageAccess = checkStrategyStorageAccess();
    
    if (storageAccess.hasAccess) {
      onSaveAttempt();
    } else {
      setShowLimitModal(true);
    }
  };

  const handleUpgrade = () => {
    setShowLimitModal(false);
    onUpgradePrompt?.();
  };

  const handleDeleteStrategy = (strategyId: string) => {
    setSelectedStrategyId(strategyId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (selectedStrategyId && onDeleteStrategy) {
      onDeleteStrategy(selectedStrategyId);
      setShowDeleteConfirm(false);
      setSelectedStrategyId(null);
      setShowLimitModal(false);
    }
  };

  // Clone children and add onClick handler to save buttons
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // Look for save buttons or elements with save-related props
      if (
        child.props.onClick && 
        (child.props.className?.includes('save') || 
         child.props.type === 'submit' ||
         child.props['data-action'] === 'save')
      ) {
        return React.cloneElement(child, {
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            handleSaveClick();
          }
        });
      }
    }
    return child;
  });

  return (
    <>
      {enhancedChildren}

      {/* Storage Limit Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Storage Limit Reached
                </h3>
                <p className="text-sm text-gray-600">
                  Free plan: {limitations.strategiesUsed}/{limitations.strategiesLimit} strategies
                </p>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              You&apos;ve reached your strategy storage limit. To save &quot;{strategyName}&quot;, you can either 
              upgrade to a paid plan or delete an existing strategy.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Crown className="h-4 w-4" />
                <span>Upgrade for Unlimited Storage</span>
              </button>

              {showDeleteOption && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Existing Strategy</span>
                </button>
              )}

              <button
                onClick={() => setShowLimitModal(false)}
                className="w-full text-gray-500 hover:text-gray-700 py-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Strategy
                </h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Choose a strategy to delete to make room for your new strategy. 
              This will permanently remove the selected strategy from your account.
            </p>

            {/* Strategy List - This would be populated with actual user strategies */}
            <div className="space-y-2 mb-6 max-h-40 overflow-y-auto">
              <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="font-medium text-gray-900">My First Strategy</div>
                <div className="text-sm text-gray-500">Created 2 days ago</div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Hook for easy integration with save operations
export function useStrategyStorageGuard() {
  const { limitations, checkStrategyStorageAccess, loading } = useSubscription();

  const canSaveStrategy = () => {
    if (loading) return false;
    return checkStrategyStorageAccess().hasAccess;
  };

  const getStorageInfo = () => {
    return {
      used: limitations.strategiesUsed,
      limit: limitations.strategiesLimit,
      canSave: canSaveStrategy(),
      isAtLimit: limitations.strategiesUsed >= limitations.strategiesLimit
    };
  };

  return {
    canSaveStrategy,
    getStorageInfo,
    limitations,
    loading
  };
}