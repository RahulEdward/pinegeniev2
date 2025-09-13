/**
 * ATR (Average True Range) Node
 * Volatility indicator measuring market volatility
 */

import React, { useState } from 'react';
import { BarChart3, Settings, Info } from 'lucide-react';
import BaseNode from './base-node';
import BaseNode from './base-node';
import { useTheme } from '@/hooks/useTheme';


interface ATRNodeProps {
  id: string;
  data: {
    label: string;
    description?: string;
    config?: {
      length?: number;
    };
  };
  selected?: boolean;
  onConfigChange?: (config: any) => void;
}

export const ATRNode: React.FC<ATRNodeProps> = ({
  id,
  data,
  selected,
  onConfigChange
}) => {
  const { colors } = useTheme();
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState({
    length: data.config?.length || 14
  });

  const handleConfigUpdate = (newConfig: any) => {
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  return (
    <BaseNode
      id={id}
      type="indicator"
      title={data.label || `ATR (${config.length})`}
      description={data.description || 'Average True Range - Volatility'}
      icon={<BarChart3 className="w-4 h-4" />}
      color="from-yellow-500 to-orange-500"
      selected={selected}
      inputs={[{ id: 'price', label: 'OHLC Data' }]}
      outputs={[{ id: 'atr', label: 'ATR Value' }]}
    >
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className={`text-xs ${colors.text.secondary}`}>
            Length: {config.length}
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
                max="100"
              />
            </div>

            <div className={`text-xs ${colors.text.tertiary} space-y-1`}>
              <div>• Measures market volatility</div>
              <div>• Higher ATR = Higher volatility</div>
              <div>• Used for stop-loss placement</div>
              <div>• Position sizing based on risk</div>
            </div>
          </div>
        )}

        <div className={`flex items-center gap-1 text-xs ${colors.text.tertiary}`}>
          <Info className="w-3 h-3" />
          <span>Volatility measurement</span>
        </div>
      </div>
    </BaseNode>
  );
};