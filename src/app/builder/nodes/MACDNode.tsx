/**
 * MACD Indicator Node
 * Moving Average Convergence Divergence indicator
 */

import React, { useState } from 'react';
import { TrendingUp, Settings, Info } from 'lucide-react';

interface MACDNodeProps {
  id: string;
  data: {
    label: string;
    description?: string;
    config?: {
      fast?: number;
      slow?: number;
      signal?: number;
      source?: string;
    };
  };
  selected?: boolean;
  onConfigChange?: (config: any) => void;
}

export const MACDNode: React.FC<MACDNodeProps> = ({
  id,
  data,
  selected,
  onConfigChange
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState({
    fast: data.config?.fast || 12,
    slow: data.config?.slow || 26,
    signal: data.config?.signal || 9,
    source: data.config?.source || 'close'
  });

  const handleConfigUpdate = (newConfig: any) => {
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-4 min-w-[200px] ${
      selected ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 bg-purple-500 rounded">
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">
            {data.label || `MACD (${config.fast},${config.slow},${config.signal})`}
          </h3>
          <p className="text-xs text-gray-500">
            {data.description || 'Moving Average Convergence Divergence'}
          </p>
        </div>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="ml-auto p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <Settings className="w-3 h-3" />
        </button>
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        Fast: {config.fast} | Slow: {config.slow} | Signal: {config.signal}
      </div>

      {showConfig && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 space-y-2">
          <div>
            <label className="block text-xs font-medium mb-1">Fast Period</label>
            <input
              type="number"
              value={config.fast}
              onChange={(e) => handleConfigUpdate({ ...config, fast: parseInt(e.target.value) })}
              className="w-full px-2 py-1 text-xs border rounded"
              min="1"
              max="50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Slow Period</label>
            <input
              type="number"
              value={config.slow}
              onChange={(e) => handleConfigUpdate({ ...config, slow: parseInt(e.target.value) })}
              className="w-full px-2 py-1 text-xs border rounded"
              min="1"
              max="100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Signal Period</label>
            <input
              type="number"
              value={config.signal}
              onChange={(e) => handleConfigUpdate({ ...config, signal: parseInt(e.target.value) })}
              className="w-full px-2 py-1 text-xs border rounded"
              min="1"
              max="50"
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
        <Info className="w-3 h-3" />
        <span>Trend momentum indicator</span>
      </div>
    </div>
  );
};