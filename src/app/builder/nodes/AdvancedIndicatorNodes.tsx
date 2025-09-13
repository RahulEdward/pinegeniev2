/**
 * Advanced Technical Indicator Nodes
 * Professional trading indicators for comprehensive analysis
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Activity, 
  Zap, 
  BarChart3, 
  BarChart2, 
  Settings, 
  Info,
  Target,
  Waves,
  ArrowUpDown,
  PieChart,
  LineChart,
  Gauge,
  TrendingDown
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

// Williams %R Node
export const WilliamsRNode: React.FC<NodeProps> = ({ id, data, selected, onConfigChange }) => {
  const [config, setConfig] = useState({
    period: data.config?.period || 14
  });

  return (
    <div className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-4 min-w-[200px] ${
      selected ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 bg-red-500 rounded">
          <Target className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">
            {data.label || `Williams %R (${config.period})`}
          </h3>
          <p className="text-xs text-gray-500">
            {data.description || 'Momentum oscillator (-100 to 0)'}
          </p>
        </div>
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        Period: {config.period} | Range: -100 to 0
      </div>
    </div>
  );
};

// CCI (Commodity Channel Index) Node
export const CCINode: React.FC<NodeProps> = ({ id, data, selected, onConfigChange }) => {
  const [config, setConfig] = useState({
    period: data.config?.period || 20
  });

  return (
    <div className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-4 min-w-[200px] ${
      selected ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 bg-teal-500 rounded">
          <Waves className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">
            {data.label || `CCI (${config.period})`}
          </h3>
          <p className="text-xs text-gray-500">
            {data.description || 'Commodity Channel Index'}
          </p>
        </div>
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        Period: {config.period} | Overbought: +100 | Oversold: -100
      </div>
    </div>
  );
};

// ADX (Average Directional Index) Node
export const ADXNode: React.FC<NodeProps> = ({ id, data, selected, onConfigChange }) => {
  const [config, setConfig] = useState({
    period: data.config?.period || 14
  });

  return (
    <div className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-4 min-w-[200px] ${
      selected ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 bg-blue-600 rounded">
          <ArrowUpDown className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">
            {data.label || `ADX (${config.period})`}
          </h3>
          <p className="text-xs text-gray-500">
            {data.description || 'Average Directional Index - Trend Strength'}
          </p>
        </div>
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        Period: {config.period} | Strong Trend: >25 | Weak: &lt;20
      </div>
    </div>
  );
};

// Parabolic SAR Node
export const ParabolicSARNode: React.FC<NodeProps> = ({ id, data, selected, onConfigChange }) => {
  const [config, setConfig] = useState({
    start: data.config?.start || 0.02,
    increment: data.config?.increment || 0.02,
    maximum: data.config?.maximum || 0.2
  });

  return (
    <div className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-4 min-w-[200px] ${
      selected ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 bg-pink-500 rounded">
          <PieChart className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">
            {data.label || 'Parabolic SAR'}
          </h3>
          <p className="text-xs text-gray-500">
            {data.description || 'Stop and Reverse - Trend Following'}
          </p>
        </div>
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        Start: {config.start} | Inc: {config.increment} | Max: {config.maximum}
      </div>
    </div>
  );
};

// Ichimoku Cloud Node
export const IchimokuNode: React.FC<NodeProps> = ({ id, data, selected, onConfigChange }) => {
  const [config, setConfig] = useState({
    tenkan: data.config?.tenkan || 9,
    kijun: data.config?.kijun || 26,
    senkou: data.config?.senkou || 52
  });

  return (
    <div className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-4 min-w-[200px] ${
      selected ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 bg-gradient-to-r from-blue-500 to-green-500 rounded">
          <LineChart className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">
            {data.label || `Ichimoku (${config.tenkan},${config.kijun},${config.senkou})`}
          </h3>
          <p className="text-xs text-gray-500">
            {data.description || 'Ichimoku Kinko Hyo - Complete Trading System'}
          </p>
        </div>
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        Tenkan: {config.tenkan} | Kijun: {config.kijun} | Senkou: {config.senkou}
      </div>
    </div>
  );
};

// Money Flow Index (MFI) Node
export const MFINode: React.FC<NodeProps> = ({ id, data, selected, onConfigChange }) => {
  const [config, setConfig] = useState({
    period: data.config?.period || 14
  });

  return (
    <div className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-4 min-w-[200px] ${
      selected ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 bg-green-600 rounded">
          <Gauge className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">
            {data.label || `MFI (${config.period})`}
          </h3>
          <p className="text-xs text-gray-500">
            {data.description || 'Money Flow Index - Volume-weighted RSI'}
          </p>
        </div>
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        Period: {config.period} | Overbought: >80 | Oversold: &lt;20
      </div>
    </div>
  );
};

// On Balance Volume (OBV) Node
export const OBVNode: React.FC<NodeProps> = ({ id, data, selected, onConfigChange }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-4 min-w-[200px] ${
      selected ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 bg-purple-600 rounded">
          <BarChart2 className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">
            {data.label || 'OBV'}
          </h3>
          <p className="text-xs text-gray-500">
            {data.description || 'On Balance Volume - Volume Flow'}
          </p>
        </div>
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        Cumulative Volume Flow | Confirms Price Trends
      </div>
    </div>
  );
};

// Aroon Oscillator Node
export const AroonNode: React.FC<NodeProps> = ({ id, data, selected, onConfigChange }) => {
  const [config, setConfig] = useState({
    period: data.config?.period || 14
  });

  return (
    <div className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-4 min-w-[200px] ${
      selected ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 bg-orange-600 rounded">
          <TrendingDown className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">
            {data.label || `Aroon (${config.period})`}
          </h3>
          <p className="text-xs text-gray-500">
            {data.description || 'Aroon Oscillator - Trend Change Detection'}
          </p>
        </div>
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        Period: {config.period} | Range: -100 to +100
      </div>
    </div>
  );
};

// VWMA (Volume Weighted Moving Average) Node
export const VWMANode: React.FC<NodeProps> = ({ id, data, selected, onConfigChange }) => {
  const [config, setConfig] = useState({
    period: data.config?.period || 20
  });

  return (
    <div className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-4 min-w-[200px] ${
      selected ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 bg-indigo-600 rounded">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">
            {data.label || `VWMA (${config.period})`}
          </h3>
          <p className="text-xs text-gray-500">
            {data.description || 'Volume Weighted Moving Average'}
          </p>
        </div>
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        Period: {config.period} | Volume Weighted Trend
      </div>
    </div>
  );
};

// Keltner Channels Node
export const KeltnerChannelsNode: React.FC<NodeProps> = ({ id, data, selected, onConfigChange }) => {
  const [config, setConfig] = useState({
    period: data.config?.period || 20,
    multiplier: data.config?.multiplier || 2.0
  });

  return (
    <div className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-4 min-w-[200px] ${
      selected ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 bg-emerald-600 rounded">
          <Waves className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">
            {data.label || `Keltner Channels (${config.period})`}
          </h3>
          <p className="text-xs text-gray-500">
            {data.description || 'Keltner Channels - ATR-based Bands'}
          </p>
        </div>
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        Period: {config.period} | Multiplier: {config.multiplier}
      </div>
    </div>
  );
};