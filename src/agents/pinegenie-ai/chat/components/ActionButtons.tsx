'use client';

import React, { useState } from 'react';
import { AIAction, ActionType } from '../../types/chat-types';
import { 
  Play, 
  Settings, 
  HelpCircle, 
  FileText, 
  BarChart3, 
  Download, 
  RotateCcw,
  Zap,
  Loader2
} from 'lucide-react';

interface ActionButtonsProps {
  actions: AIAction[];
  onActionClick: (action: AIAction) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Interactive action buttons component for AI responses
 * Provides quick actions like building strategies, optimizing parameters, etc.
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  actions,
  onActionClick,
  className = '',
  disabled = false
}) => {
  const [executingAction, setExecutingAction] = useState<string | null>(null);

  // Get appropriate icon for action type
  const getActionIcon = (type: ActionType) => {
    switch (type) {
      case ActionType.BUILD_STRATEGY:
        return <Play size={16} />;
      case ActionType.MODIFY_STRATEGY:
        return <Settings size={16} />;
      case ActionType.OPTIMIZE_PARAMETERS:
        return <Zap size={16} />;
      case ActionType.EXPLAIN_CONCEPT:
        return <HelpCircle size={16} />;
      case ActionType.SHOW_TEMPLATE:
        return <FileText size={16} />;
      case ActionType.ANALYZE_STRATEGY:
        return <BarChart3 size={16} />;
      case ActionType.EXPORT_STRATEGY:
        return <Download size={16} />;
      case ActionType.RESET_CONVERSATION:
        return <RotateCcw size={16} />;
      default:
        return <Play size={16} />;
    }
  };

  // Get button variant based on action properties
  const getButtonVariant = (action: AIAction) => {
    if (action.destructive) return 'destructive';
    if (action.primary) return 'primary';
    return 'secondary';
  };

  // Handle action click with loading state
  const handleActionClick = async (action: AIAction) => {
    if (disabled || executingAction) return;

    setExecutingAction(action.id);
    
    try {
      await onActionClick(action);
    } catch (error) {
      console.error('Error executing action:', error);
    } finally {
      setExecutingAction(null);
    }
  };

  // Group actions by importance
  const primaryActions = actions.filter(action => action.primary);
  const secondaryActions = actions.filter(action => !action.primary && !action.destructive);
  const destructiveActions = actions.filter(action => action.destructive);

  if (actions.length === 0) return null;

  return (
    <div className={`action-buttons ${className}`}>
      {/* Primary Actions */}
      {primaryActions.length > 0 && (
        <div className="action-group primary-actions">
          {primaryActions.map((action) => (
            <button
              key={action.id}
              className={`action-btn ${getButtonVariant(action)}`}
              onClick={() => handleActionClick(action)}
              disabled={disabled || executingAction !== null}
              title={action.description}
            >
              {executingAction === action.id ? (
                <Loader2 size={16} className="spinning" />
              ) : (
                getActionIcon(action.type)
              )}
              <span className="action-label">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Secondary Actions */}
      {secondaryActions.length > 0 && (
        <div className="action-group secondary-actions">
          {secondaryActions.map((action) => (
            <button
              key={action.id}
              className={`action-btn ${getButtonVariant(action)}`}
              onClick={() => handleActionClick(action)}
              disabled={disabled || executingAction !== null}
              title={action.description}
            >
              {executingAction === action.id ? (
                <Loader2 size={16} className="spinning" />
              ) : (
                getActionIcon(action.type)
              )}
              <span className="action-label">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Destructive Actions */}
      {destructiveActions.length > 0 && (
        <div className="action-group destructive-actions">
          {destructiveActions.map((action) => (
            <button
              key={action.id}
              className={`action-btn ${getButtonVariant(action)}`}
              onClick={() => handleActionClick(action)}
              disabled={disabled || executingAction !== null}
              title={action.description}
            >
              {executingAction === action.id ? (
                <Loader2 size={16} className="spinning" />
              ) : (
                getActionIcon(action.type)
              )}
              <span className="action-label">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 12px;
          padding: 12px;
          background: var(--bg-tertiary, #f8fafc);
          border-radius: 12px;
          border: 1px solid var(--border-color, #e5e7eb);
        }

        .action-group {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
          min-height: 36px;
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Primary button style */
        .action-btn.primary {
          background: var(--primary-color, #3b82f6);
          border-color: var(--primary-color, #3b82f6);
          color: white;
        }

        .action-btn.primary:hover:not(:disabled) {
          background: var(--primary-hover, #2563eb);
          border-color: var(--primary-hover, #2563eb);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        /* Secondary button style */
        .action-btn.secondary {
          background: var(--bg-primary, #ffffff);
          border-color: var(--border-color, #e5e7eb);
          color: var(--text-primary, #111827);
        }

        .action-btn.secondary:hover:not(:disabled) {
          background: var(--bg-hover, #f9fafb);
          border-color: var(--border-hover, #d1d5db);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        /* Destructive button style */
        .action-btn.destructive {
          background: var(--bg-primary, #ffffff);
          border-color: #dc2626;
          color: #dc2626;
        }

        .action-btn.destructive:hover:not(:disabled) {
          background: #fef2f2;
          border-color: #b91c1c;
          color: #b91c1c;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
        }

        .action-label {
          white-space: nowrap;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .action-group {
            flex-direction: column;
          }
          
          .action-btn {
            justify-content: center;
            width: 100%;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .action-buttons {
            --bg-primary: #1f2937;
            --bg-tertiary: #374151;
            --bg-hover: #4b5563;
            --text-primary: #f9fafb;
            --border-color: #4b5563;
            --border-hover: #6b7280;
            --primary-color: #3b82f6;
            --primary-hover: #2563eb;
          }
        }

        /* Focus styles for accessibility */
        .action-btn:focus {
          outline: 2px solid var(--primary-color, #3b82f6);
          outline-offset: 2px;
        }

        /* Animation for action groups */
        .action-group {
          animation: fadeInUp 0.3s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Hover effects for better UX */
        .action-btn:hover:not(:disabled) .action-label {
          transform: translateX(2px);
        }

        .action-label {
          transition: transform 0.2s ease;
        }

        /* Loading state styling */
        .action-btn:disabled .spinning {
          color: var(--text-secondary, #6b7280);
        }

        /* Group spacing */
        .primary-actions + .secondary-actions,
        .secondary-actions + .destructive-actions {
          margin-top: 4px;
          padding-top: 8px;
          border-top: 1px solid var(--border-color, #e5e7eb);
        }
      `}</style>
    </div>
  );
};