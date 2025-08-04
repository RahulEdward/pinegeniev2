'use client';

import React, { useState } from 'react';
import { StrategyPreview as StrategyPreviewType } from '../../types/chat-types';
import { 
  TrendingUp, 
  Shield, 
  Clock, 
  BarChart3, 
  CheckCircle,
  AlertTriangle,
  Zap,
  ArrowRight,
  X,
  Compare
} from 'lucide-react';

interface StrategyComparisonProps {
  strategies: StrategyPreviewType[];
  onSelect?: (strategyId: string) => void;
  onClose?: () => void;
  className?: string;
}

/**
 * Strategy comparison interface for selecting between multiple strategies
 * Allows side-by-side comparison of strategy features, complexity, and risk
 */
export const StrategyComparison: React.FC<StrategyComparisonProps> = ({
  strategies,
  onSelect,
  onClose,
  className = ''
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  // Get complexity info with colors and icons
  const getComplexityInfo = (complexity: string) => {
    switch (complexity) {
      case 'low':
        return { color: '#059669', icon: <CheckCircle size={16} />, label: 'Beginner', score: 1 };
      case 'medium':
        return { color: '#f59e0b', icon: <Zap size={16} />, label: 'Intermediate', score: 2 };
      case 'high':
        return { color: '#dc2626', icon: <AlertTriangle size={16} />, label: 'Advanced', score: 3 };
      default:
        return { color: '#6b7280', icon: <BarChart3 size={16} />, label: 'Unknown', score: 0 };
    }
  };

  // Get risk info with colors and icons
  const getRiskInfo = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return { color: '#059669', icon: <Shield size={16} />, label: 'Low Risk', score: 1 };
      case 'medium':
        return { color: '#f59e0b', icon: <Shield size={16} />, label: 'Medium Risk', score: 2 };
      case 'high':
        return { color: '#dc2626', icon: <AlertTriangle size={16} />, label: 'High Risk', score: 3 };
      default:
        return { color: '#6b7280', icon: <Shield size={16} />, label: 'Unknown Risk', score: 0 };
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  // Handle strategy selection
  const handleSelect = (strategyId: string) => {
    setSelectedStrategy(strategyId);
    if (onSelect) {
      onSelect(strategyId);
    }
  };

  // Get comparison metrics
  const getComparisonMetrics = () => {
    if (strategies.length === 0) return null;

    const complexityScores = strategies.map(s => getComplexityInfo(s.estimatedComplexity).score);
    const riskScores = strategies.map(s => getRiskInfo(s.riskLevel).score);
    const times = strategies.map(s => s.estimatedTime);

    return {
      avgComplexity: complexityScores.reduce((a, b) => a + b, 0) / complexityScores.length,
      avgRisk: riskScores.reduce((a, b) => a + b, 0) / riskScores.length,
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times)
    };
  };

  const metrics = getComparisonMetrics();

  if (strategies.length === 0) {
    return (
      <div className={`strategy-comparison empty ${className}`}>
        <div className="empty-state">
          <Compare size={48} />
          <h3>No Strategies to Compare</h3>
          <p>Generate some strategies first to see them here for comparison.</p>
        </div>
        <style jsx>{`
          .strategy-comparison.empty {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 48px 24px;
            background: var(--bg-primary, #ffffff);
            border: 1px solid var(--border-color, #e5e7eb);
            border-radius: 12px;
            margin-top: 16px;
          }
          
          .empty-state {
            text-align: center;
            color: var(--text-secondary, #6b7280);
          }
          
          .empty-state h3 {
            margin: 16px 0 8px 0;
            color: var(--text-primary, #111827);
            font-size: 18px;
            font-weight: 600;
          }
          
          .empty-state p {
            margin: 0;
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`strategy-comparison ${className}`}>
      {/* Header */}
      <div className="comparison-header">
        <div className="header-info">
          <h3 className="comparison-title">
            <Compare size={20} />
            Strategy Comparison ({strategies.length} strategies)
          </h3>
          {metrics && (
            <div className="comparison-summary">
              <span>Avg. Build Time: {formatTime(Math.round(metrics.avgTime))}</span>
              <span>•</span>
              <span>Time Range: {formatTime(metrics.minTime)} - {formatTime(metrics.maxTime)}</span>
            </div>
          )}
        </div>
        {onClose && (
          <button className="close-btn" onClick={onClose} title="Close comparison">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Strategy Grid */}
      <div className="strategies-grid">
        {strategies.map((strategy) => {
          const complexityInfo = getComplexityInfo(strategy.estimatedComplexity);
          const riskInfo = getRiskInfo(strategy.riskLevel);
          const isSelected = selectedStrategy === strategy.id;

          return (
            <div
              key={strategy.id}
              className={`strategy-card ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelect(strategy.id)}
            >
              {/* Card Header */}
              <div className="card-header">
                <div className="strategy-thumbnail">
                  <TrendingUp size={20} />
                </div>
                <div className="strategy-info">
                  <h4 className="strategy-name">{strategy.name}</h4>
                  <p className="strategy-description">{strategy.description}</p>
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
                    <span className="metric-label">Risk</span>
                    <span className="metric-value">{riskInfo.label}</span>
                  </div>
                </div>

                <div className="metric">
                  <div className="metric-icon">
                    <Clock size={16} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">Time</span>
                    <span className="metric-value">{formatTime(strategy.estimatedTime)}</span>
                  </div>
                </div>
              </div>

              {/* Components Count */}
              <div className="components-summary">
                <span className="components-count">
                  {strategy.components.length} components
                </span>
                <span className="essential-count">
                  {strategy.components.filter(c => c.essential).length} essential
                </span>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="selection-indicator">
                  <CheckCircle size={16} />
                  <span>Selected</span>
                </div>
              )}

              {/* Select Button */}
              <button className="select-btn">
                <span>Select Strategy</span>
                <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Action Bar */}
      {selectedStrategy && (
        <div className="action-bar">
          <div className="selected-info">
            <CheckCircle size={16} />
            <span>
              {strategies.find(s => s.id === selectedStrategy)?.name} selected
            </span>
          </div>
          <button
            className="build-btn"
            onClick={() => onSelect && onSelect(selectedStrategy)}
          >
            <TrendingUp size={16} />
            <span>Build Selected Strategy</span>
          </button>
        </div>
      )}

      <style jsx>{`
        .strategy-comparison {
          background: var(--bg-primary, #ffffff);
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 12px;
          padding: 20px;
          margin-top: 16px;
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

        .comparison-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-color, #e5e7eb);
        }

        .header-info {
          flex: 1;
        }

        .comparison-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary, #111827);
        }

        .comparison-summary {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-secondary, #6b7280);
        }

        .close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: var(--bg-secondary, #f9fafb);
          border-radius: 6px;
          color: var(--text-secondary, #6b7280);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: var(--bg-hover, #f3f4f6);
          color: var(--text-primary, #111827);
        }

        .strategies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .strategy-card {
          background: var(--bg-secondary, #f9fafb);
          border: 2px solid var(--border-color, #e5e7eb);
          border-radius: 10px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .strategy-card:hover {
          border-color: var(--primary-color, #3b82f6);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }

        .strategy-card.selected {
          border-color: var(--primary-color, #3b82f6);
          background: var(--primary-bg, #eff6ff);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        .card-header {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .strategy-thumbnail {
          width: 36px;
          height: 36px;
          background: var(--bg-primary, #ffffff);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-color, #3b82f6);
          border: 1px solid var(--border-color, #e5e7eb);
          flex-shrink: 0;
        }

        .strategy-info {
          flex: 1;
          min-width: 0;
        }

        .strategy-name {
          margin: 0 0 4px 0;
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary, #111827);
          line-height: 1.3;
        }

        .strategy-description {
          margin: 0;
          font-size: 12px;
          color: var(--text-secondary, #6b7280);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .strategy-metrics {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }

        .metric {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .metric-icon {
          color: var(--text-secondary, #6b7280);
        }

        .metric-info {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .metric-label {
          font-size: 11px;
          color: var(--text-secondary, #6b7280);
          font-weight: 500;
          min-width: 60px;
        }

        .metric-value {
          font-size: 12px;
          color: var(--text-primary, #111827);
          font-weight: 600;
        }

        .components-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: var(--bg-primary, #ffffff);
          border-radius: 6px;
          margin-bottom: 12px;
          font-size: 11px;
        }

        .components-count {
          color: var(--text-primary, #111827);
          font-weight: 600;
        }

        .essential-count {
          color: var(--text-secondary, #6b7280);
        }

        .selection-indicator {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: var(--primary-color, #3b82f6);
          color: white;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }

        .select-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          padding: 8px 12px;
          background: var(--bg-primary, #ffffff);
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 6px;
          color: var(--text-primary, #111827);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .select-btn:hover {
          background: var(--primary-color, #3b82f6);
          border-color: var(--primary-color, #3b82f6);
          color: white;
        }

        .strategy-card.selected .select-btn {
          background: var(--primary-color, #3b82f6);
          border-color: var(--primary-color, #3b82f6);
          color: white;
        }

        .action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: var(--bg-secondary, #f9fafb);
          border-radius: 8px;
          border-top: 1px solid var(--border-color, #e5e7eb);
        }

        .selected-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--primary-color, #3b82f6);
          font-size: 14px;
          font-weight: 500;
        }

        .build-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--primary-color, #3b82f6);
          border: none;
          border-radius: 6px;
          color: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .build-btn:hover {
          background: var(--primary-hover, #2563eb);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .strategy-comparison {
            --bg-primary: #1f2937;
            --bg-secondary: #374151;
            --bg-hover: #4b5563;
            --primary-bg: #1e3a8a;
            --text-primary: #f9fafb;
            --text-secondary: #d1d5db;
            --border-color: #4b5563;
            --primary-color: #3b82f6;
            --primary-hover: #2563eb;
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .strategies-grid {
            grid-template-columns: 1fr;
          }
          
          .action-bar {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }
          
          .build-btn {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};