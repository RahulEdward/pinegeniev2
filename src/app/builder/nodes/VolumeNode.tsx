/**
 * Volume Node
 * Trading volume indicator and analysis
 */

import React, { useState } from 'react';
import { BarChart2, Settings, Info } from 'lucide-react';
import BaseNode from './base-node';
import { useTheme } from '../ui/ThemeProvider';

interface VolumeNodeProps {
  id: string;
  data: {
    label: string;
    description?: string;
    config?: {
      type?: 'volume' | 'volume_sma' | 'volume_weighted';
      length?: number;
    };
  };
  selected?: boolean;
  onConfigChange?: (config: any) => void;
}

export const VolumeNode: React.FC<VolumeNodeProps> = ({
  id,
  data,
  selected,
  onConfigChange
}) => {
  const { colors } = useTheme();
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState({
    type: data.config?.type || 'volume',
    length: data.config?.length || 20
  });

  const handleConfigUpdate = (newConfig: any) => {
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const getTitle = () => {
    switch (config.type) {
      case 'volume_sma':
        return `Volume SMA (${config.length})`;
      case 'volume_weighted':
        return `VWAP (${config.length})`;
      default:
        return 'Volume';
    }
  };

  return (
    <BaseNode
      id={id}
      type="indicator"
      title={data.label || getTitle()}
      description={data.description || 'Trading volume analysis'}
      icon={<BarChart2 className="w-4 h-4" />}
      color="from-indigo-500 to-purple-500"
      selected={selected}
      inputs={[{ id: 'data', label: 'Market Data' }]}
      outputs={[
        { id: 'volume', label: 'Volume' },
        ...(config.type === 'volume_sma' ? [{ id: 'volume_sma', label: 'Volume SMA' }] : []),
        ...(config.type === 'volume_weighted' ? [{ id: 'vwap', label: 'VWAP' }] : [])
      ]}
    >
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className={`text-xs ${colors.text.secondary}`}>
            Type: {config.type.replace('_', ' ').toUpperCase()}
            {config.type !== 'volume' && ` (${config.length})`}
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
                Volume Type
              </label>
              <select
                value={config.type}
                onChange={(e) => handleConfigUpdate({ ...config, type: e.target.value })}
                className={`w-full px-2 py-1 text-xs ${colors.bg.primary} border ${colors.border.secondary} rounded`}
              >
                <option value="volume">Raw Volume</option>
                <option value="volume_sma">Volume SMA</option>
                <option value="volume_weighted">VWAP</option>
              </select>
            </div>

            {config.type !== 'volume' && (
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
            )}

            <div className={`text-xs ${colors.text.tertiary} space-y-1`}>
              <div>• Volume confirms price moves</div>
              <div>• High volume = Strong conviction</div>
              <div>• VWAP = Volume weighted price</div>
              <div>• Volume SMA = Average volume</div>
            </div>
          </div>
        )}

        <div className={`flex items-center gap-1 text-xs ${colors.text.tertiary}`}>
          <Info className="w-3 h-3" />
          <span>Volume analysis</span>
        </div>
      </div>
    </BaseNode>
  );
};