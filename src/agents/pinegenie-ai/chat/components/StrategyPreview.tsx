'use client';

import React, { useState, useEffect } from 'react';
import { StrategyPreview as StrategyPreviewType, ComponentSummary } from '../../types/chat-types';
import { StrategyModifier } from './StrategyModifier';
import { StrategyExporter } from './StrategyExporter';
import { 
  TrendingUp, 
  Shield, 
  Clock, 
  BarChart3, 
  Eye, 
  Download,
  AlertTriangle,
  CheckCircle,
  Zap,
  Edit3,
  Share2
} from 'lucide-react';

interface StrategyPreviewProps {
  strategyId: string;
  onPreviewClick?: () => void;
  onDownload?: () => void;
  onModify?: (modifiedStrategy: StrategyPreviewType) => void;
  onShare?: () => void;
  className?: string;
}

/**
 * Strategy preview component with visual representations
 * Shows strategy overview, components, complexity, and risk assessment
 */
export const StrategyPreview: React.FC<StrategyPreviewProps> = ({
  strategyId,
  onPreviewClick,
  onDownload,
  onModify,
  onShare,
  className = ''
}) => {
  const [strategy, setStrategy] = useState<StrategyPreviewType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModifier, setShowModifier] = useState(false);
  const [showExporter, setShowExporter] = useState(false);

  // Mock strategy data for now - in real implementation this would fetch from API
  useEffect(() => {
    const mockStrategy: StrategyPreviewType = {
      id: strategyId,
      name: 'RSI Mean Reversion Strategy',
      description: 'A strategy that buys when RSI is oversold and sells when overbought',
      components: [
        {
          type: 'data-source',
          label: 'Market Data',
          description: 'BTCUSDT 1h timeframe',
          essential: true
        },
        {
          type: 'indicator',
          label: 'RSI (14)',
          description: 'Relative Strength Index with 14 period',
          essential: true
        },
        {
          type: 'condition',
          label: 'Oversold Check',
          description: 'RSI < 30 for buy signal',
          essential: true
        },
        {
          type: 'condition',
          label: 'Overbought Check',
          description: 'RSI > 70 for sell signal',
          essential: true
        },
        {
          type: 'action',
          label: 'Buy Order',
          description: 'Market buy when oversold',
          essential: true
        },
        {
          type: 'action',
          label: 'Sell Order',
          description: 'Market sell when overbought',
          essential: true
        },
        {
          type: 'risk',
          label: 'Stop Loss',
          description: '2% stop loss protection',
          essential: false
        }
      ],
      estimatedComplexity: 'medium',
      estimatedTime: 45,
      riskLevel: 'medium'
    };

    // Simulate loading delay
    setTimeout(() => {
      setStrategy(mockStrategy);
      setIsLoading(false);
    }, 500);
  }, [strategyId]);

  // Get complexity color and icon
  const getComplexityInfo = (complexity: string) => {
    switch (complexity) {
      case 'low':
        return { color: '#059669', icon: <CheckCircle size={16} />, label: 'Beginner' };
      case 'medium':
        return { color: '#f59e0b', icon: <Zap size={16} />, label: 'Intermediate' };
      case 'high':
        return { color: '#dc2626', icon: <AlertTriangle size={16} />, label: 'Advanced' };
      default:
        return { color: '#6b7280', icon: <BarChart3 size={16} />, label: 'Unknown' };
    }
  };

  // Get risk level color and icon
  const getRiskInfo = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return { color: '#059669', icon: <Shield size={16} />, label: 'Low Risk' };
      case 'medium':
        return { color: '#f59e0b', icon: <Shield size={16} />, label: 'Medium Risk' };
      case 'high':
        return { color: '#dc2626', icon: <AlertTriangle size={16} />, label: 'High Risk' };
      default:
        return { color: '#6b7280', icon: <Shield size={16} />, label: 'Unknown Risk' };
    }
  };

  // Format estimated time
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  // Handle strategy modification
  const handleModify = (modifiedStrategy: StrategyPreviewType) => {
    setStrategy(modifiedStrategy);
    setShowModifier(false);
    if (onModify) {
      onModify(modifiedStrategy);
    }
  };

  // Handle share
  const handleShare = () => {
    setShowExporter(true);
    if (onShare) {
      onShare();
    }
  };

  if (isLoading) {
    return (
      <div className={`strategy-preview loading ${className}`}>
        <div className="loading-content">
          <div className="loading-spinner" />
          <span>Loading strategy preview...</span>
        </div>
        <style jsx>{`
          .strategy-preview.loading {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            background: var(--bg-secondary, #f9fafb);
            border-radius: 12px;
            border: 1px solid var(--border-color, #e5e7eb);
            margin-top: 12px;
          }
          
          .loading-content {
            display: flex;
            align-items: center;
            gap: 12px;
            color: var(--text-secondary, #6b7280);
            font-size: 14px;
          }
          
          .loading-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid var(--border-color, #e5e7eb);
            border-top: 2px solid var(--primary-color, #3b82f6);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className={`strategy-preview error ${className}`}>
        <div className="error-content">
          <AlertTriangle size={20} />
          <span>Failed to load strategy preview</span>
        </div>
        <style jsx>{`
          .strategy-preview.error {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            background: #fef2f2;
            border-radius: 12px;
            border: 1px solid #fecaca;
            margin-top: 12px;
          }
          
          .error-content {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #dc2626;
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }

  const complexityInfo = getComplexityInfo(strategy.estimatedComplexity);
  const riskInfo = getRiskInfo(strategy.riskLevel);

  return (
    <div className={`strategy-preview ${className}`}>
      {/* Header */}
      <div className="preview-header">
        <div className="strategy-info">
          <h4 className="strategy-name">{strategy.name}</h4>
          <p className="strategy-description">{strategy.description}</p>
        </div>
        <div className="strategy-thumbnail">
          <TrendingUp size={24} />
        </div>
      </div>

      {/* Metrics */}
      <div className="strategy-metrics">
        <div className="metric">
          <div className="metric-icon" style={{ color: complexityInfo.color }}>
            {complexityInfo.icon}
          </div>
          <div className="metric-info">
            <span className="metric-label">Complexity</span>
            <span className="metric-value">{complexityInfo.label}</span>
          </div>
        </div>

        <div className="metric">
          <div className="metric-icon" style={{ color: riskInfo.color }}>
            {riskInfo.icon}
          </div>
          <div className="metric-info">
            <span className="metric-label">Risk Level</span>
            <span className="metric-value">{riskInfo.label}</span>
          </div>
        </div>

        <div className="metric">
          <div className="metric-icon">
            <Clock size={16} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Build Time</span>
            <span className="metric-value">{formatTime(strategy.estimatedTime)}</span>
          </div>
        </div>
      </div>

      {/* Components */}
      <div className="strategy-components">
        <h5 className="components-title">Strategy Components</h5>
        <div className="components-list">
          {strategy.components.map((component, index) => (
            <div key={index} className={`component-item ${component.essential ? 'essential' : 'optional'}`}>
              <div className="component-indicator">
                {component.essential ? (
                  <CheckCircle size={12} />
                ) : (
                  <div className="optional-dot" />
                )}
              </div>
              <div className="component-info">
                <span className="component-label">{component.label}</span>
                <span className="component-description">{component.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="preview-actions">
        <button
          className="preview-btn secondary"
          onClick={onPreviewClick}
          title="View strategy details"
        >
          <Eye size={16} />
          <span>Preview</span>
        </button>
        
        <button
          className="preview-btn secondary"
          onClick={() => setShowModifier(true)}
          title="Modify strategy"
        >
          <Edit3 size={16} />
          <span>Modify</span>
        </button>
        
        <button
          className="preview-btn secondary"
          onClick={handleShare}
          title="Export & share strategy"
        >
          <Share2 size={16} />
          <span>Share</span>
        </button>
        
        <button
          className="preview-btn primary"
          onClick={onPreviewClick}
          title="Build this strategy"
        >
          <TrendingUp size={16} />
          <span>Build Strategy</span>
        </button>
      </div>

      {/* Strategy Modifier Modal */}
      {showModifier && strategy && (
        <StrategyModifier
          strategy={strategy}
          onSave={handleModify}
          onCancel={() => setShowModifier(false)}
        />
      )}

      {/* Strategy Exporter Modal */}
      {showExporter && strategy && (
        <StrategyExporter
          strategy={strategy}
          onClose={() => setShowExporter(false)}
        />
      )}

      <style jsx>{`
        .strategy-preview {
          background: var(--bg-primary, #ffffff);
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 12px;
          padding: 16px;
          margin-top: 12px;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .strategy-info {
          flex: 1;
        }

        .strategy-name {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary, #111827);
        }

        .strategy-description {
          margin: 0;
          font-size: 13px;
          color: var(--text-secondary, #6b7280);
          line-height: 1.4;
        }

        .strategy-thumbnail {
          width: 40px;
          height: 40px;
          background: var(--bg-secondary, #f9fafb);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-color, #3b82f6);
          border: 1px solid var(--border-color, #e5e7eb);
        }

        .strategy-metrics {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          padding: 12px;
          background: var(--bg-secondary, #f9fafb);
          border-radius: 8px;
        }

        .metric {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .metric-icon {
          color: var(--text-secondary, #6b7280);
        }

        .metric-info {
          display: flex;
          flex-direction: column;
        }

        .metric-label {
          font-size: 11px;
          color: var(--text-secondary, #6b7280);
          font-weight: 500;
        }

        .metric-value {
          font-size: 12px;
          color: var(--text-primary, #111827);
          font-weight: 600;
        }

        .strategy-components {
          margin-bottom: 16px;
        }

        .components-title {
          margin: 0 0 8px 0;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary, #111827);
        }

        .components-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .component-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 6px;
          transition: background-color 0.2s;
        }

        .component-item:hover {
          background: var(--bg-secondary, #f9fafb);
        }

        .component-item.essential {
          border-left: 2px solid #059669;
        }

        .component-item.optional {
          border-left: 2px solid #f59e0b;
        }

        .component-indicator {
          color: #059669;
          display: flex;
          align-items: center;
        }

        .optional-dot {
          width: 8px;
          height: 8px;
          background: #f59e0b;
          border-radius: 50%;
        }

        .component-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .component-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-primary, #111827);
        }

        .component-description {
          font-size: 11px;
          color: var(--text-secondary, #6b7280);
        }

        .preview-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .preview-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .preview-btn.primary {
          background: var(--primary-color, #3b82f6);
          border-color: var(--primary-color, #3b82f6);
          color: white;
        }

        .preview-btn.primary:hover {
          background: var(--primary-hover, #2563eb);
          border-color: var(--primary-hover, #2563eb);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .preview-btn.secondary {
          background: var(--bg-primary, #ffffff);
          border-color: var(--border-color, #e5e7eb);
          color: var(--text-primary, #111827);
        }

        .preview-btn.secondary:hover {
          background: var(--bg-hover, #f9fafb);
          border-color: var(--border-hover, #d1d5db);
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .strategy-preview {
            --bg-primary: #1f2937;
            --bg-secondary: #374151;
            --bg-hover: #4b5563;
            --text-primary: #f9fafb;
            --text-secondary: #d1d5db;
            --border-color: #4b5563;
            --border-hover: #6b7280;
            --primary-color: #3b82f6;
            --primary-hover: #2563eb;
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .strategy-metrics {
            flex-direction: column;
            gap: 8px;
          }
          
          .preview-actions {
            flex-direction: column;
          }
          
          .preview-btn {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};