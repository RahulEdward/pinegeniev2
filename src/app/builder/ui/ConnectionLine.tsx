import React from 'react';

export interface ConnectionLineProps {
  start: { x: number; y: number };
  end: { x: number; y: number };
  isActive?: boolean;
  isTemporary?: boolean;
  isDarkMode?: boolean;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({
  start,
  end,
  isActive = false,
  isTemporary = false,
  isDarkMode = true
}) => {
  const midX = (start.x + end.x) / 2;
  const controlPoint1X = start.x + (midX - start.x) * 0.7;
  const controlPoint2X = end.x - (end.x - midX) * 0.7;
  const path = `M ${start.x} ${start.y} C ${controlPoint1X} ${start.y}, ${controlPoint2X} ${end.y}, ${end.x} ${end.y}`;

  const baseColor = isActive
    ? '#3b82f6'
    : isTemporary
    ? '#8b5cf6'
    : isDarkMode
    ? '#64748b'
    : '#94a3b8';
  const glowColor = isActive
    ? '#60a5fa'
    : isTemporary
    ? '#a78bfa'
    : isDarkMode
    ? '#94a3b8'
    : '#cbd5e1';

  return (
    <g>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="12"
          markerHeight="8"
          refX="11"
          refY="4"
          orient="auto"
        >
          <polygon points="0 0, 12 4, 0 8" fill={baseColor} />
        </marker>
      </defs>
      {/* Glow */}
      <path
        d={path}
        stroke={glowColor}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        opacity={0.3}
        style={{ filter: 'blur(3px)' }}
      />
      {/* Main line */}
      <path
        d={path}
        stroke={baseColor}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        markerEnd="url(#arrowhead)"
        className={isActive || isTemporary ? 'animate-pulse' : ''}
      />
      {/* Optional animated dot for active/temporary */}
      {(isActive || isTemporary) && (
        <circle r={3} fill={baseColor} opacity={0.8}>
          <animateMotion dur="2s" repeatCount="indefinite" path={path} />
        </circle>
      )}
    </g>
  );
};

export default ConnectionLine; 