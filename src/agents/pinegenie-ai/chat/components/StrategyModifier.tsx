'use client';

import React, { useState, useEffect } from 'react';
import { StrategyPreview as StrategyPreviewType, ComponentSummary } from '../../types/chat-types';
import { 
  Settings, 
  Plus, 
  Minus, 
  Edit3, 
  Save, 
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Shield,
  Clock,
  Sliders,
  X
} from 'lucide-react';

interface StrategyModifierProps {
  strategy: StrategyPreviewType;
  onSave?: (modifiedStrategy: StrategyPreviewType) => void;
  onCancel?: () => void;
  className?: string;
}

interface ModificationHistory {
  id: string;
  action: string;
  description: string;
  timestamp: Date;
  reversible: boolean;
}

/**
 * Strategy modification and refinement interface
 * Allows users to customize strategy components, parameters, and settings
 */
export const StrategyModifier: React.FC<StrategyModifierProps> = ({
  strategy: initialStrategy,
  onSave,
  onCancel,
  className = ''
}) => {
  const [strategy, setStrategy] = useState<StrategyPreviewType>(initialStrategy);
  const [modifications, setModifications] = useState<ModificationHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'components' | 'parameters' | 'risk'>('components');
  const [hasChanges, setHasChanges] = useState(false);

  // Track changes
  useEffect(() => {
    const hasChanges = JSON.stringify(strategy) !== JSON.stringify(initialStrategy);
    setHasChanges(hasChanges);
  }, [strategy, initialStrategy]);

  // Add modification to history
  const addModification = (action: string, description: string, reversible: boolean = true) => {
    const modification: ModificationHistory = {
      id: Date.now().toString(),
      action,
      description,
      timestamp: new Date(),
      reversible
    };
    setModifications(prev => [...prev, modification]);
  };

  // Add component
  const addComponent = (type: string) => {
    const newComponent: ComponentSummary = {
      type,
      label: `New ${type}`,
      description: `Custom ${type} component`,
      essential: false
    };

    setStrategy(prev => ({
      ...prev,
      components: [...prev.components, newComponent]
    }));

    addModification('add_component', `Added ${type} component`);
  };

  // Remove component
  const removeComponent = (index: number) => {
    const component = strategy.components[index];
    if (component.essential) {
      return; // Don't allow removing essential components
    }

    setStrategy(prev => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index)
    }));

    addModification('remove_component', `Removed ${component.label}`);
  };

  // Toggle component essential status
  const toggleComponentEssential = (index: number) => {
    const component = strategy.components[index];
    setStrategy(prev => ({
      ...prev,
      components: prev.components.map((comp, i) => 
        i === index ? { ...comp, essential: !comp.essential } : comp
      )
    }));

    addModification(
      'toggle_essential', 
      `Made ${component.label} ${component.essential ? 'optional' : 'essential'}`
    );
  };

  // Update strategy risk level
  const updateRiskLevel = (riskLevel: 'low' | 'medium' | 'high') => {
    setStrategy(prev => ({ ...prev, riskLevel }));
    addModification('update_risk', `Changed risk level to ${riskLevel}`);
  };

  // Update strategy complexity
  const updateComplexity = (complexity: 'low' | 'medium' | 'high') => {
    setStrategy(prev => ({ ...prev, estimatedComplexity: complexity }));
    addModification('update_complexity', `Changed complexity to ${complexity}`);
  };

  // Reset to original
  const resetStrategy = () => {
    setStrategy(initialStrategy);
    setModifications([]);
    addModification('reset', 'Reset strategy to original state', false);
  };

  // Save changes
  const handleSave = () => {
    if (onSave) {
      onSave(strategy);
    }
  };

  // Get component type options
  const getComponentTypeOptions = () => [
    { value: 'indicator', label: 'Technical Indicator', description: 'Add RSI, MACD, SMA, etc.' },
    { value: 'condition', label: 'Trading Condition', description: 'Add entry/exit conditions' },
    { value: 'action', label: 'Trading Action', description: 'Add buy/sell orders' },
    { value: 'risk', label: 'Risk Management', description: 'Add stop loss, take profit' },
    { value: 'timing', label: 'Time Filter', description: 'Add trading hours, sessions' }
  ];

  // Get risk level info
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

  // Get complexity info
  const getComplexityInfo = (complexity: string) => {
    switch (complexity) {
      case 'low':
        return { color: '#059669', icon: <CheckCircle size={16} />, label: 'Beginner' };
      case 'medium':
        return { color: '#f59e0b', icon: <Settings size={16} />, label: 'Intermediate' };
      case 'high':
        return { color: '#dc2626', icon: <AlertTriangle size={16} />, label: 'Advanced' };
      default:
        return { color: '#6b7280', icon: <Settings size={16} />, label: 'Unknown' };
    }
  };

  const riskInfo = getRiskInfo(strategy.riskLevel);
  const complexityInfo = getComplexityInfo(strategy.estimatedComplexity);

  return (
    <div className={`strategy-modifier ${className}`}>
      {/* Header */}
      <div className="modifier-header">
        <div className="header-info">
          <h3 className="modifier-title">
            <Edit3 size={20} />
            Modify Strategy: {strategy.name}
          </h3>
          <p className="modifier-description">
            Customize components, parameters, and risk settings
          </p>
        </div>
        {onCancel && (
          <button className="close-btn" onClick={onCancel} title="Close modifier">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="modifier-tabs">
        <button
          className={`tab ${activeTab === 'components' ? 'active' : ''}`}
          onClick={() => setActiveTab('components')}
        >
          <Settings size={16} />
          <span>Components</span>
        </button>
        <button
          className={`tab ${activeTab === 'parameters' ? 'active' : ''}`}
          onClick={() => setActiveTab('parameters')}
        >
          <Sliders size={16} />
          <span>Parameters</span>
        </button>
        <button
          className={`tab ${activeTab === 'risk' ? 'active' : ''}`}
          onClick={() => setActiveTab('risk')}
        >
          <Shield size={16} />
          <span>Risk & Settings</span>
        </button>
      </div>

      {/* Content */}
      <div className="modifier-content">
        {/* Components Tab */}
        {activeTab === 'components' && (
          <div className="components-section">
            <div className="section-header">
              <h4>Strategy Components</h4>
              <div className="add-component-dropdown">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addComponent(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                >
                  <option value="">Add Component...</option>
                  {getComponentTypeOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="components-list">
              {strategy.components.map((component, index) => (
                <div key={index} className={`component-item ${component.essential ? 'essential' : 'optional'}`}>
                  <div className="component-info">
                    <div className="component-header">
                      <span className="component-label">{component.label}</span>
                      <div className="component-actions">
                        <button
                          className="action-btn"
                          onClick={() => toggleComponentEssential(index)}
                          title={component.essential ? 'Make optional' : 'Make essential'}
                        >
                          {component.essential ? <CheckCircle size={14} /> : <Plus size={14} />}
                        </button>
                        {!component.essential && (
                          <button
                            className="action-btn danger"
                            onClick={() => removeComponent(index)}
                            title="Remove component"
                          >
                            <Minus size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="component-description">{component.description}</p>
                    <div className="component-meta">
                      <span className={`component-type ${component.type}`}>
                        {component.type}
                      </span>
                      <span className={`component-status ${component.essential ? 'essential' : 'optional'}`}>
                        {component.essential ? 'Essential' : 'Optional'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Parameters Tab */}
        {activeTab === 'parameters' && (
          <div className="parameters-section">
            <div className="section-header">
              <h4>Strategy Parameters</h4>
            </div>

            <div className="parameter-groups">
              <div className="parameter-group">
                <h5>Complexity Level</h5>
                <div className="complexity-options">
                  {['low', 'medium', 'high'].map(level => (
                    <button
                      key={level}
                      className={`complexity-btn ${strategy.estimatedComplexity === level ? 'active' : ''}`}
                      onClick={() => updateComplexity(level as any)}
                    >
                      {getComplexityInfo(level).icon}
                      <span>{getComplexityInfo(level).label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="parameter-group">
                <h5>Estimated Build Time</h5>
                <div className="time-slider">
                  <input
                    type="range"
                    min="30"
                    max="300"
                    value={strategy.estimatedTime}
                    onChange={(e) => {
                      const time = parseInt(e.target.value);
                      setStrategy(prev => ({ ...prev, estimatedTime: time }));
                      addModification('update_time', `Changed build time to ${time}s`);
                    }}
                  />
                  <div className="time-display">
                    <Clock size={16} />
                    <span>{Math.floor(strategy.estimatedTime / 60)}m {strategy.estimatedTime % 60}s</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Risk & Settings Tab */}
        {activeTab === 'risk' && (
          <div className="risk-section">
            <div className="section-header">
              <h4>Risk Management & Settings</h4>
            </div>

            <div className="risk-groups">
              <div className="risk-group">
                <h5>Risk Level</h5>
                <div className="risk-options">
                  {['low', 'medium', 'high'].map(level => (
                    <button
                      key={level}
                      className={`risk-btn ${strategy.riskLevel === level ? 'active' : ''}`}
                      onClick={() => updateRiskLevel(level as any)}
                    >
                      {getRiskInfo(level).icon}
                      <span>{getRiskInfo(level).label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="risk-group">
                <h5>Strategy Information</h5>
                <div className="info-inputs">
                  <div className="input-group">
                    <label>Strategy Name</label>
                    <input
                      type="text"
                      value={strategy.name}
                      onChange={(e) => {
                        setStrategy(prev => ({ ...prev, name: e.target.value }));
                        addModification('update_name', `Changed name to "${e.target.value}"`);
                      }}
                    />
                  </div>
                  <div className="input-group">
                    <label>Description</label>
                    <textarea
                      value={strategy.description}
                      onChange={(e) => {
                        setStrategy(prev => ({ ...prev, description: e.target.value }));
                        addModification('update_description', 'Updated strategy description');
                      }}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modification History */}
      {modifications.length > 0 && (
        <div className="modification-history">
          <h5>Recent Changes</h5>
          <div className="history-list">
            {modifications.slice(-3).map(mod => (
              <div key={mod.id} className="history-item">
                <div className="history-info">
                  <span className="history-action">{mod.description}</span>
                  <span className="history-time">
                    {mod.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="modifier-actions">
        <div className="action-group">
          <button
            className="action-btn secondary"
            onClick={resetStrategy}
            disabled={!hasChanges}
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        </div>

        <div className="action-group">
          {onCancel && (
            <button className="action-btn secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button
            className="action-btn primary"
            onClick={handleSave}
            disabled={!hasChanges}
          >
            <Save size={16} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .strategy-modifier {
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

        .modifier-header {
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

        .modifier-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary, #111827);
        }

        .modifier-description {
          margin: 0;
          font-size: 14px;
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

        .modifier-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 20px;
          background: var(--bg-secondary, #f9fafb);
          border-radius: 8px;
          padding: 4px;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border: none;
          background: transparent;
          border-radius: 6px;
          color: var(--text-secondary, #6b7280);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
          justify-content: center;
        }

        .tab:hover {
          background: var(--bg-hover, #f3f4f6);
          color: var(--text-primary, #111827);
        }

        .tab.active {
          background: var(--bg-primary, #ffffff);
          color: var(--primary-color, #3b82f6);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .modifier-content {
          margin-bottom: 20px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-header h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary, #111827);
        }

        .add-component-dropdown select {
          padding: 6px 10px;
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 6px;
          background: var(--bg-primary, #ffffff);
          color: var(--text-primary, #111827);
          font-size: 12px;
          cursor: pointer;
        }

        .components-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .component-item {
          background: var(--bg-secondary, #f9fafb);
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 8px;
          padding: 12px;
          transition: all 0.2s ease;
        }

        .component-item.essential {
          border-left: 3px solid #059669;
        }

        .component-item.optional {
          border-left: 3px solid #f59e0b;
        }

        .component-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .component-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary, #111827);
        }

        .component-actions {
          display: flex;
          gap: 4px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: none;
          background: var(--bg-primary, #ffffff);
          border-radius: 4px;
          color: var(--text-secondary, #6b7280);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: var(--bg-hover, #f3f4f6);
          color: var(--text-primary, #111827);
        }

        .action-btn.danger:hover {
          background: #fef2f2;
          color: #dc2626;
        }

        .component-description {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: var(--text-secondary, #6b7280);
          line-height: 1.4;
        }

        .component-meta {
          display: flex;
          gap: 8px;
        }

        .component-type,
        .component-status {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .component-type {
          background: var(--bg-primary, #ffffff);
          color: var(--text-secondary, #6b7280);
          border: 1px solid var(--border-color, #e5e7eb);
        }

        .component-status.essential {
          background: #dcfce7;
          color: #059669;
        }

        .component-status.optional {
          background: #fef3c7;
          color: #f59e0b;
        }

        .parameter-groups,
        .risk-groups {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .parameter-group,
        .risk-group {
          background: var(--bg-secondary, #f9fafb);
          border-radius: 8px;
          padding: 16px;
        }

        .parameter-group h5,
        .risk-group h5 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary, #111827);
        }

        .complexity-options,
        .risk-options {
          display: flex;
          gap: 8px;
        }

        .complexity-btn,
        .risk-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border: 1px solid var(--border-color, #e5e7eb);
          background: var(--bg-primary, #ffffff);
          border-radius: 6px;
          color: var(--text-primary, #111827);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
          justify-content: center;
        }

        .complexity-btn:hover,
        .risk-btn:hover {
          border-color: var(--primary-color, #3b82f6);
          background: var(--primary-bg, #eff6ff);
        }

        .complexity-btn.active,
        .risk-btn.active {
          border-color: var(--primary-color, #3b82f6);
          background: var(--primary-color, #3b82f6);
          color: white;
        }

        .time-slider {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .time-slider input[type="range"] {
          flex: 1;
          height: 4px;
          background: var(--border-color, #e5e7eb);
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }

        .time-display {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-primary, #111827);
          min-width: 60px;
        }

        .info-inputs {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .input-group label {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-primary, #111827);
        }

        .input-group input,
        .input-group textarea {
          padding: 8px 10px;
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 6px;
          background: var(--bg-primary, #ffffff);
          color: var(--text-primary, #111827);
          font-size: 13px;
          resize: vertical;
        }

        .input-group input:focus,
        .input-group textarea:focus {
          outline: none;
          border-color: var(--primary-color, #3b82f6);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .modification-history {
          background: var(--bg-secondary, #f9fafb);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 20px;
        }

        .modification-history h5 {
          margin: 0 0 8px 0;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary, #111827);
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
        }

        .history-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .history-action {
          font-size: 12px;
          color: var(--text-primary, #111827);
        }

        .history-time {
          font-size: 11px;
          color: var(--text-secondary, #6b7280);
        }

        .modifier-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid var(--border-color, #e5e7eb);
        }

        .action-group {
          display: flex;
          gap: 8px;
        }

        .modifier-actions .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          width: auto;
          height: auto;
        }

        .modifier-actions .action-btn.primary {
          background: var(--primary-color, #3b82f6);
          border: 1px solid var(--primary-color, #3b82f6);
          color: white;
        }

        .modifier-actions .action-btn.primary:hover:not(:disabled) {
          background: var(--primary-hover, #2563eb);
          border-color: var(--primary-hover, #2563eb);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .modifier-actions .action-btn.secondary {
          background: var(--bg-primary, #ffffff);
          border: 1px solid var(--border-color, #e5e7eb);
          color: var(--text-primary, #111827);
        }

        .modifier-actions .action-btn.secondary:hover:not(:disabled) {
          background: var(--bg-hover, #f9fafb);
          border-color: var(--border-hover, #d1d5db);
        }

        .modifier-actions .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .strategy-modifier {
            --bg-primary: #1f2937;
            --bg-secondary: #374151;
            --bg-hover: #4b5563;
            --primary-bg: #1e3a8a;
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
          .modifier-tabs {
            flex-direction: column;
          }
          
          .complexity-options,
          .risk-options {
            flex-direction: column;
          }
          
          .modifier-actions {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }
          
          .action-group {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};