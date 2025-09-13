/**
 * Simple Indicator Nodes
 * Simplified versions of all indicator nodes without BaseNode dependency
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Activity, 
  Zap, 
  BarChart3, 
  BarChart2, 
  Settings, 
  Info 
} from 'lucide-react';

interface NodeProps {
  id: string;
  data: {
    label: string;
    description?: string;
    config?: any;
  };
  selected?: boolean;
  onConfigChange?: (config: any) => void;
}

// MACD Node
export const MACDNode: React.FC<NodeProps> = ({ id, data, selected, onConfigChange }) => {
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
        <div className="flex-1">
          <h3 className="font-semibold text-sm">
            {data.label || `MACD (${config.fast},${config.slow},${config.signal})`}
          </h3>
          <p className="text-xs text-gray-500">
            {data.description || 'Moving Average Convergence Divergence'}
          </p>
        </div>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
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
        </div>
      )}
    </div>
  );
};

// Bollinger Bands Node
export const BollingerBandsNode: React.FC<NodeProps> = ({ id, data, selected, onConfigChange }) => {
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState({
    length: data.config?.length || 20,
    mult: data.config?.mult || 2.0,
    source: data.config?.source || 'close'
  });

  return (
    <div className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-4 min-w-[200px] ${
      selected ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 bg-orange-500 rounded">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">
            {data.label || `Bollinger Bands (${config.length}, ${config.mult})`}
          </h3>
          <p className="text-xs text-gray-500">
            {data.description || 'Volatility bands around moving average'}
          </p>
        </div>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <Settings className="w-3 h-3" />
        </button>
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        Length: {config.length} | Mult: {config.mult}
      </div>
    </div>
  );
};

// Stochastic Node
export const StochasticNode: React.FC<NodeProps> = ({ id, data, selected, onConfigChange }) => {
  const [config, setConfig] = useState({
    k: data.config?.k || 14,
    d: data.config?.d || 3,
    smooth: data.config?.smooth || 3
  });

  return (
    <div className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-4 min-w-[200px] ${
      selected ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 bg-cyan-500 rounded">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">
            {data.label || `Stochastic (${config.k}, ${config.d})`}
          </h3>
          <p className="text-xs text-gray-500">
            {data.description || 'Momentum oscillator (0-100)'}
          </p>
        </div>
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        %K: {config.k} | %D: {config.d}
      </div>
    </div>
  );
};

// EMA Node
export const EMANode: React.FC<NodeProps> = ({ id, data, selected, onConfigChange }) => {
  const [config, setConfig] = useState({
    length: data.config?.length || 20,
    source: data.config?.source || 'close'
  });

  return (
    <div className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-4 min-w-[200px] ${
      selected ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 bg-green-500 rounded">
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">
            {data.label || `EMA (${config.length})`}
          </h3>
          <p className="text-xs text-gray-500">
            {data.description || 'Exponential Moving Average'}
          </p>
        </div>
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        Length: {config.length} | Source: {config.source}
      </div>
    </div>
  );
};

// ATR Node
export const ATRNode: React.FC<NodeProps> = ({ id, data, selected, onConfigChange }) => {
  const [config, setConfig] = useState({
    length: data.config?.length || 14
  });

  return (
    <div className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-4 min-w-[200px] ${
      selected ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 bg-yellow-500 rounded">
          <BarChart3 className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">
            {data.label || `ATR (${config.length})`}
          </h3>
          <p className="text-xs text-gray-500">
            {data.description || 'Average True Range - Volatility'}
          </p>
        </div>
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        Length: {config.length}
      </div>
    </div>
  );
};

// Volume Node
export const VolumeNode: React.FC<NodeProps> = ({ id, data, selected, onConfigChange }) => {
  const [config, setConfig] = useState({
    type: data.config?.type || 'volume',
    length: data.config?.length || 20
  });

  return (
    <div className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-4 min-w-[200px] ${
      selected ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 bg-indigo-500 rounded">
          <BarChart2 className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">
            {data.label || 'Volume'}
          </h3>
          <p className="text-xs text-gray-500">
            {data.description || 'Trading volume analysis'}
          </p>
        </div>
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        Type: {config.type.toUpperCase()}
      </div>
    </div>
  );
};