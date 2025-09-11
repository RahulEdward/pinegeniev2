/**
 * Stochastic Oscillator Node
 * Momentum oscillator comparing closing price to price range
 */

import React, { useState } from 'react';
import { Zap, Settings, Info } from 'lucide-react';

interface StochasticNodeProps {
  id: string;
  data: {
    label: string;
    description?: string;
    config?: {
      k?: number;
      d?: number;
      smooth?: number;
    };
  };
  selected?: boolean;
  onConfigChange?: (config: any) => void;
}

export const StochasticNode: React.FC<StochasticNodeProps> = ({
  id,
  data,
  selected,
  onConfigChange
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState({
    k: data.config?.k || 14,
    d: data.config?.d || 3,
    smooth: data.config?.smooth || 3
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
        <div className="p-1 bg-cyan-500 rounded">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">
            {data.label || `Stochastic (${config.k}, ${config.d})`}
          </h3>
          <p className="text-xs text-gray-500">
            {data.description || 'Momentum oscillator (0-100)'}
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
        %K: {config.k} | %D: {config.d} | Smooth: {config.smooth}
      </div>

      {showConfig && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 space-y-2">
          <div>
            <label className="block text-xs font-medium mb-1">%K Period</label>
            <input
              type="number"
              value={config.k}
              onChange={(e) => handleConfigUpdate({ ...config, k: parseInt(e.target.value) })}
              className="w-full px-2 py-1 text-xs border rounded"
              min="1"
              max="50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">%D Period</label>
            <input
              type="number"
              value={config.d}
              onChange={(e) => handleConfigUpdate({ ...config, d: parseInt(e.target.value) })}
              className="w-full px-2 py-1 text-xs border rounded"
              min="1"
              max="20"
            />
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Overbought: > 80</div>
            <div>• Oversold: < 20</div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
        <Info className="w-3 h-3" />
        <span>Momentum oscillator (0-100)</span>
      </div>
    </div>
  );
};