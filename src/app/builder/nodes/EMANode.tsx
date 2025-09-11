/**
 * EMA (Exponential Moving Average) Node
 * Exponential moving average indicator
 */

import React, { useState } from 'react';
import { TrendingUp, Settings, Info } from 'lucide-react';
import BaseNode from './base-node';
import BaseNode from './base-node';
import { useTheme } from '@/hooks/useTheme';


interface EMANodeProps {
  id: string;
  data: {
    label: string;
    description?: string;
    config?: {
      length?: number;
      source?: string;
    };
  };
  selected?: boolean;
  onConfigChange?: (config: any) => void;
}

export const EMANode: React.FC<EMANodeProps> = ({
  id,
  data,
  selected,
  onConfigChange
}) => {
  const { colors } = useTheme();
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState({
    length: data.config?.length || 20,
    source: data.config?.source || 'close'
  });

  const handleConfigUpdate = (newConfig: any) => {
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  return (
    <BaseNode
      id={id}
      type="indicator"
      title={data.label || `EMA (${config.length})`}
      description={data.description || 'Exponential Moving Average'}
      icon={<TrendingUp className="w-4 h-4" />}
      color="from-green-500 to-emerald-500"
      selected={selected}
      inputs={[{ id: 'price', label: 'Price Data' }]}
      outputs={[{ id: 'ema', label: 'EMA Value' }]}
    >
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className={`text-xs ${colors.text.secondary}`}>
            Length: {config.length} | Source: {config.source}
          </span>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`p-1 rounded ${colors.text.tertiary} hover:${colors.text.primary}`}
          >
            <Settings className="w-3 h-3" />
          </button>
        </div>

        {showConfig && (
          <div className={`p-3 ${colors.bg.secondary} rounded-lg border ${colors.border.secondary} space-y-3`}>
            <div>
              <label className={`block text-xs font-medium ${colors.text.primary} mb-1`}>
                Length (Period)
              </label>
              <input
                type="number"
                value={config.length}
                onChange={(e) => handleConfigUpdate({ ...config, length: parseInt(e.target.value) })}
                className={`w-full px-2 py-1 text-xs ${colors.bg.primary} border ${colors.border.secondary} rounded`}
                min="1"
                max="200"
              />
            </div>

            <div>
              <label className={`block text-xs font-medium ${colors.text.primary} mb-1`}>
                Source
              </label>
              <select
                value={config.source}
                onChange={(e) => handleConfigUpdate({ ...config, source: e.target.value })}
                className={`w-full px-2 py-1 text-xs ${colors.bg.primary} border ${colors.border.secondary} rounded`}
              >
                <option value="close">Close</option>
                <option value="open">Open</option>
                <option value="high">High</option>
                <option value="low">Low</option>
                <option value="hl2">HL2</option>
                <option value="hlc3">HLC3</option>
                <option value="ohlc4">OHLC4</option>
              </select>
            </div>

            <div className={`text-xs ${colors.text.tertiary} space-y-1`}>
              <div>• More responsive than SMA</div>
              <div>• Gives more weight to recent prices</div>
              <div>• Good for trend following</div>
            </div>
          </div>
        )}

        <div className={`flex items-center gap-1 text-xs ${colors.text.tertiary}`}>
          <Info className="w-3 h-3" />
          <span>Exponential smoothing</span>
        </div>
      </div>
    </BaseNode>
  );
};