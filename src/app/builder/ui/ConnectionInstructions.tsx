/**
 * Connection Instructions Component
 * 
 * Shows simple instructions for creating connections between nodes
 */

import React from 'react';
import { useTheme } from './ThemeProvider';

interface ConnectionInstructionsProps {
  isVisible: boolean;
  connectionCount: number;
  isConnecting: boolean;
}

const ConnectionInstructions: React.FC<ConnectionInstructionsProps> = ({
  isVisible,
  connectionCount,
  isConnecting
}) => {
  const { colors } = useTheme();

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-6 left-6 ${colors.bg.glass} ${colors.border.primary} border rounded-2xl p-4 shadow-xl max-w-sm z-40`}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
          <span className={`font-semibold ${colors.text.primary}`}>
            Connection Guide
          </span>
        </div>

        {isConnecting ? (
          <div className={`text-sm ${colors.text.secondary} space-y-2`}>
            <div className="flex items-center gap-2 text-orange-400">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-ping" />
              <span className="font-medium">Creating Connection...</span>
            </div>
            <div>Click on another node's handle to complete the connection</div>
            <div className="text-xs text-gray-400">Press ESC or click empty space to cancel</div>
          </div>
        ) : (
          <div className={`text-sm ${colors.text.secondary} space-y-2`}>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-purple-500 rounded-full border-2 border-white" />
              <span>🟣 OUTPUT (right side)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
              <span>🔵 INPUT (left side)</span>
            </div>
            <div className="pt-2 border-t border-gray-600">
              <div className="font-medium text-green-400">How to Connect:</div>
              <div>1. Click OUTPUT handle (purple)</div>
              <div>2. Click INPUT handle (blue) on target node</div>
            </div>
          </div>
        )}

        <div className={`text-xs ${colors.text.tertiary} pt-2 border-t ${colors.border.secondary}`}>
          Connections: {connectionCount}
        </div>
      </div>
    </div>
  );
};

export default ConnectionInstructions;