import React, { useMemo } from 'react';

export interface ConnectionLineProps {
  start: { x: number; y: number };
  end: { x: number; y: number };
  isActive?: boolean;
  isTemporary?: boolean;
  isValid?: boolean;
  isDarkMode?: boolean;
  connectionId?: string;
  onConnectionClick?: (connectionId: string) => void;
  onConnectionHover?: (connectionId: string, isHovering: boolean) => void;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({
  start,
  end,
  isActive = false,
  isTemporary = false,
  isValid = true,
  isDarkMode = true,
  connectionId,
  onConnectionClick,
  onConnectionHover
}) => {
  // N8N-style bezier curve calculation
  const connectionPath = useMemo(() => {
    const deltaX = end.x - start.x;
    const controlOffset = Math.max(Math.abs(deltaX) * 0.5, 100);
    
    const controlPoint1X = start.x + controlOffset;
    const controlPoint2X = end.x - controlOffset;
    
    return `M ${start.x} ${start.y} C ${controlPoint1X} ${start.y}, ${controlPoint2X} ${end.y}, ${end.x} ${end.y}`;
  }, [start, end]);

  // Enhanced colors - more vibrant and visible
  const getConnectionColor = () => {
    if (isTemporary) {
      return isValid ? '#ff6d5a' : '#ff4757'; // Bright orange for valid, red for invalid
    }
    if (isActive) {
      return '#ff6d5a'; // Bright orange for active
    }
    return isDarkMode ? '#60a5fa' : '#3b82f6'; // Blue for normal connections
  };

  const strokeColor = getConnectionColor();
  const uniqueId = useMemo(() => 
    connectionId || `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    [connectionId]
  );

  // Handle connection interactions
  const handleConnectionClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (connectionId && onConnectionClick) {
      onConnectionClick(connectionId);
    }
  };

  const handleConnectionMouseEnter = () => {
    if (connectionId && onConnectionHover) {
      onConnectionHover(connectionId, true);
    }
  };

  const handleConnectionMouseLeave = () => {
    if (connectionId && onConnectionHover) {
      onConnectionHover(connectionId, false);
    }
  };

  return (
    <g className="connection-line-group">
      {/* Main connection line - clean and simple like N8N */}
      <path
        d={connectionPath}
        stroke={strokeColor}
        strokeWidth={isTemporary ? "3" : "2"}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={isTemporary ? "8 4" : "none"}
        style={{
          transition: 'stroke 0.2s ease',
          opacity: isTemporary ? 0.9 : 1,
          animation: isTemporary ? 'n8n-dash-flow 1s linear infinite' : 'none'
        }}
        className={`
          ${isActive ? 'connection-active' : ''}
          ${isTemporary ? 'connection-temporary' : ''}
          ${!isValid ? 'connection-invalid' : ''}
        `}
      />

      {/* Invisible thicker line for easier clicking */}
      <path
        d={connectionPath}
        stroke="transparent"
        strokeWidth="12"
        fill="none"
        style={{ 
          cursor: connectionId ? 'pointer' : 'default',
          pointerEvents: 'all'
        }}
        onClick={handleConnectionClick}
        onMouseEnter={handleConnectionMouseEnter}
        onMouseLeave={handleConnectionMouseLeave}
        className="connection-interaction-area"
      />
    </g>
  );
};

export default ConnectionLine; 