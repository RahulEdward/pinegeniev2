"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Play, 
  ChevronDown, 
  ChevronUp,
  Zap,
  Bot,
  Code,
  BarChart3,
  Palette,
  Star,
  ArrowRight,
  Github,
  Cpu,
  TrendingUp,
  Shield,
  Database,
  GitBranch,
  Activity,
  Workflow,
  MousePointer,
  Eye,
  RotateCcw,
  Sparkles,
  Download
} from 'lucide-react';

// Theme Context
interface ThemeColors {
  bg: {
    primary: string;
    secondary: string;
    tertiary: string;
    card: string;
    glass: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    muted: string;
  };
  border: {
    primary: string;
    secondary: string;
    accent: string;
  };
  accent: {
    blue: string;
    purple: string;
    green: string;
    orange: string;
    red: string;
    indigo: string;
  };
}

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [isDark, setIsDark] = useState<boolean>(true);
  
  const toggleTheme = () => {
    setIsDark(!isDark);
  };
  
  const theme: ThemeContextType = {
    isDark,
    toggleTheme,
    colors: {
      bg: {
        primary: isDark ? 'from-slate-900 via-slate-800 to-slate-900' : 'from-gray-50 via-white to-gray-50',
        secondary: isDark ? 'bg-slate-800/80' : 'bg-white/90',
        tertiary: isDark ? 'bg-slate-700/50' : 'bg-gray-100/80',
        card: isDark ? 'bg-slate-800/30' : 'bg-white/60',
        glass: isDark ? 'bg-slate-800/80 backdrop-blur-xl' : 'bg-white/80 backdrop-blur-xl',
      },
      text: {
        primary: isDark ? 'text-white' : 'text-gray-900',
        secondary: isDark ? 'text-slate-300' : 'text-gray-700',
        tertiary: isDark ? 'text-slate-400' : 'text-gray-600',
        muted: isDark ? 'text-slate-500' : 'text-gray-500',
      },
      border: {
        primary: isDark ? 'border-slate-700/50' : 'border-gray-200',
        secondary: isDark ? 'border-slate-600/30' : 'border-gray-300/50',
        accent: isDark ? 'border-blue-500/50' : 'border-blue-400/50',
      },
      accent: {
        blue: isDark ? 'from-blue-500 to-cyan-500' : 'from-blue-400 to-cyan-400',
        purple: isDark ? 'from-purple-500 to-pink-500' : 'from-purple-400 to-pink-400',
        green: isDark ? 'from-green-500 to-emerald-500' : 'from-green-400 to-emerald-400',
        orange: isDark ? 'from-amber-500 to-orange-500' : 'from-amber-400 to-orange-400',
        red: isDark ? 'from-red-500 to-pink-500' : 'from-red-400 to-pink-400',
        indigo: isDark ? 'from-indigo-500 to-purple-500' : 'from-indigo-400 to-purple-400',
      }
    }
  };
  
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

// Interactive Dashboard Preview Component
// Define interfaces for state types
interface Position {
  x: number;
  y: number;
}

interface NodePosition {
  [nodeId: string]: Position;
}

interface Connection {
  from: string;
  to: string;
  id: string;
}

interface TempConnection {
  from: string;
  to: Position;
}

const DashboardPreview = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [tempConnection, setTempConnection] = useState<TempConnection | null>(null);
  const [userConnections, setUserConnections] = useState<Connection[]>([]);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [nodePositions, setNodePositions] = useState<NodePosition>({});
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  
  const theme = useTheme();
  if (!theme) return null;
  const { colors } = theme;

  const initialNodes = [
    { 
      id: 'data-1', 
      type: 'data', 
      label: 'Market Data', 
      icon: Database, 
      position: { x: 50, y: 150 },
      color: colors.accent.purple 
    },
    { 
      id: 'indicator-1', 
      type: 'indicator', 
      label: 'RSI', 
      icon: TrendingUp, 
      position: { x: 200, y: 100 },
      color: colors.accent.blue 
    },
    { 
      id: 'indicator-2', 
      type: 'indicator', 
      label: 'MACD', 
      icon: BarChart3, 
      position: { x: 200, y: 200 },
      color: colors.accent.blue 
    },
    { 
      id: 'condition-1', 
      type: 'condition', 
      label: 'Crossover', 
      icon: GitBranch, 
      position: { x: 380, y: 150 },
      color: colors.accent.orange 
    },
    { 
      id: 'action-1', 
      type: 'action', 
      label: 'Buy Signal', 
      icon: Zap, 
      position: { x: 550, y: 120 },
      color: colors.accent.green 
    },
    { 
      id: 'risk-1', 
      type: 'risk', 
      label: 'Stop Loss', 
      icon: Shield, 
      position: { x: 550, y: 180 },
      color: colors.accent.red 
    }
  ];

  const nodes = initialNodes.map(node => ({
    ...node,
    position: nodePositions[node.id] || node.position
  }));

  const predefinedConnections: Connection[] = [
    { id: 'conn-1', from: 'data-1', to: 'indicator-1' },
    { id: 'conn-2', from: 'data-1', to: 'indicator-2' },
    { id: 'conn-3', from: 'indicator-1', to: 'condition-1' },
    { id: 'conn-4', from: 'indicator-2', to: 'condition-1' },
    { id: 'conn-5', from: 'condition-1', to: 'action-1' },
    { id: 'conn-6', from: 'condition-1', to: 'risk-1' }
  ];

  const connections = [...predefinedConnections, ...userConnections];

  const getConnectionPath = (from: string, to: string) => {
    const fromNode = nodes.find(n => n.id === from);
    const toNode = nodes.find(n => n.id === to);
    
    if (!fromNode || !toNode) return '';
    
    const x1 = fromNode.position.x + 60;
    const y1 = fromNode.position.y + 30;
    const x2 = toNode.position.x;
    const y2 = toNode.position.y + 30;
    
    const midX = (x1 + x2) / 2;
    
    return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const nodeWidth = 140;
    
    if (x > nodeWidth - 20) {
      setIsConnecting(true);
      setDraggedNode(nodeId);
      setSelectedNode(nodeId);
    } else {
      setIsDragging(true);
      setDraggedNode(nodeId);
      setSelectedNode(nodeId);
      
      const nodeRect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - nodeRect.left,
        y: e.clientY - nodeRect.top
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isConnecting && draggedNode) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setTempConnection({
        from: draggedNode,
        to: { x, y }
      });
    } else if (isDragging && draggedNode) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width - 140, e.clientX - rect.left - dragOffset.x));
      const y = Math.max(0, Math.min(rect.height - 60, e.clientY - rect.top - dragOffset.y));
      
      setNodePositions(prev => ({
        ...prev,
        [draggedNode]: { x, y }
      }));
    }
  };

  const handleNodeMouseUp = (nodeId: string) => {
    if (isConnecting && draggedNode && draggedNode !== nodeId) {
      const newConnection = {
        from: draggedNode,
        to: nodeId,
        id: `user-${Date.now()}`
      };
      
      const exists = connections.some(
        conn => (conn.from === draggedNode && conn.to === nodeId) ||
                (conn.from === nodeId && conn.to === draggedNode)
      );
      
      if (!exists) {
        setUserConnections(prev => [...prev, newConnection]);
      }
    }
    
    setIsDragging(false);
    setIsConnecting(false);
    setDraggedNode(null);
    setTempConnection(null);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsConnecting(false);
    setDraggedNode(null);
    setTempConnection(null);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className={`${colors.bg.glass} ${colors.border.primary} border rounded-3xl p-8 shadow-2xl overflow-hidden`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Workflow className={`w-6 h-6 ${colors.text.primary}`} />
            <h3 className={`text-lg font-semibold ${colors.text.primary}`}>
              RSI + MACD Strategy
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className={`text-sm ${colors.text.tertiary}`}>Live Preview</span>
          </div>
        </div>

        <div 
          className="relative h-80 bg-gradient-to-br from-slate-900/20 to-slate-800/20 rounded-2xl border border-slate-700/30 overflow-hidden select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(148, 163, 184, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(148, 163, 184, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />

          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <marker
                id="arrowhead-preview"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#60a5fa" />
              </marker>
              <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            
            {connections.map((conn, index) => (
              <g key={conn.id || index}>
                <path
                  d={getConnectionPath(conn.from, conn.to)}
                  stroke="url(#connectionGradient)"
                  strokeWidth="6"
                  fill="none"
                  opacity="0.3"
                  filter="blur(3px)"
                />
                <path
                  d={getConnectionPath(conn.from, conn.to)}
                  stroke={conn.id.startsWith('user-') ? "#10b981" : "url(#connectionGradient)"}
                  strokeWidth="3"
                  fill="none"
                  markerEnd="url(#arrowhead-preview)"
                  className="animate-pulse"
                />
                <circle 
                  r="3" 
                  fill={conn.id?.startsWith('user-') ? "#10b981" : "#60a5fa"}
                  opacity="0.8"
                >
                  <animateMotion
                    dur="3s"
                    repeatCount="indefinite"
                    path={getConnectionPath(conn.from, conn.to)}
                    begin={`${index * 0.5}s`}
                  />
                </circle>
              </g>
            ))}
            
            {tempConnection && nodes.find(n => n.id === tempConnection.from) && (
              <g>
                <path
                  d={`M ${nodes.find(n => n.id === tempConnection.from)!.position.x + 80} ${nodes.find(n => n.id === tempConnection.from)!.position.y + 25} L ${tempConnection.to.x} ${tempConnection.to.y}`}
                  stroke="#8b5cf6"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="5,5"
                  opacity="0.8"
                />
                <circle cx={tempConnection.to.x} cy={tempConnection.to.y} r="4" fill="#8b5cf6" opacity="0.8" />
              </g>
            )}
          </svg>

          {nodes.map((node, index) => {
            const IconComponent = node.icon;
            return (
              <div
                key={node.id}
                className={`absolute transition-all duration-200 ${
                  selectedNode === node.id ? 'scale-110 z-10' : 'z-0'
                } ${isDragging && draggedNode === node.id ? 'opacity-75 cursor-grabbing' : 'cursor-grab hover:scale-105'} ${
                  isConnecting && draggedNode === node.id ? 'opacity-50' : ''
                }`}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  animationDelay: `${index * 200}ms`
                }}
                onMouseEnter={() => !isDragging && !isConnecting && setSelectedNode(node.id)}
                onMouseLeave={() => !isDragging && !isConnecting && setSelectedNode(null)}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                onMouseUp={() => handleNodeMouseUp(node.id)}
              >
                {selectedNode === node.id && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${node.color} rounded-xl blur-lg opacity-50 scale-110 animate-pulse`} />
                )}
                
                <div className={`relative ${colors.bg.glass} ${colors.border.primary} border rounded-xl p-3 shadow-lg min-w-[140px] backdrop-blur-lg`}>
                  <div className={`bg-gradient-to-r ${node.color} rounded-lg p-2 mb-2`}>
                    <div className="flex items-center gap-2 text-white">
                      <IconComponent className="w-4 h-4" />
                      <span className="text-xs font-semibold">{node.label}</span>
                    </div>
                  </div>
                  
                  <div className={`text-xs ${colors.text.tertiary}`}>
                    {node.type === 'data' && 'Real-time feed'}
                    {node.type === 'indicator' && 'Period: 14'}
                    {node.type === 'condition' && 'Golden cross'}
                    {node.type === 'action' && 'Market order'}
                    {node.type === 'risk' && '2% risk'}
                  </div>
                </div>

                <div 
                  className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-pointer" 
                  title="Input"
                />
                <div 
                  className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-crosshair" 
                  title="Output - Drag to connect"
                />
              </div>
            );
          })}

          {!isDragging && !isConnecting && userConnections.length === 0 && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
              <div className={`${colors.bg.glass} ${colors.border.primary} border rounded-xl px-4 py-2 text-xs ${colors.text.secondary} flex items-center gap-2 animate-bounce`}>
                <MousePointer className="w-4 h-4" />
                <span>Drag nodes to move • Drag from green dots to connect!</span>
              </div>
            </div>
          )}

          {userConnections.length > 0 && (
            <div className="absolute top-4 left-4">
              <div className={`${colors.bg.glass} ${colors.border.primary} border rounded-xl px-3 py-2 text-xs ${colors.text.primary} flex items-center gap-2`}>
                <Zap className="w-4 h-4 text-green-400" />
                <span>You created {userConnections.length} connection{userConnections.length > 1 ? 's' : ''}!</span>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 right-4 flex gap-2">
            <button 
              onClick={() => {
                setUserConnections([]);
                setNodePositions({});
              }}
              className={`p-2 ${colors.bg.glass} ${colors.border.primary} border rounded-lg ${colors.text.secondary} hover:${colors.text.primary} transition-all hover:scale-110`}
              title="Reset all changes"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button className={`p-2 ${colors.bg.glass} ${colors.border.primary} border rounded-lg ${colors.text.secondary} hover:${colors.text.primary} transition-all hover:scale-110`}>
              <Eye className="w-4 h-4" />
            </button>
            <button className={`p-2 ${colors.bg.glass} ${colors.border.primary} border rounded-lg ${colors.text.secondary} hover:${colors.text.primary} transition-all hover:scale-110`}>
              <MousePointer className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className={`${colors.bg.card} rounded-xl p-4 text-center`}>
            <div className="text-2xl font-bold text-green-400 mb-1">+24.5%</div>
            <div className={`text-xs ${colors.text.tertiary}`}>Total Return</div>
          </div>
          <div className={`${colors.bg.card} rounded-xl p-4 text-center`}>
            <div className="text-2xl font-bold text-blue-400 mb-1">{87 + userConnections.length}%</div>
            <div className={`text-xs ${colors.text.tertiary}`}>Win Rate</div>
          </div>
          <div className={`${colors.bg.card} rounded-xl p-4 text-center`}>
            <div className="text-2xl font-bold text-purple-400 mb-1">{156 + userConnections.length * 5}</div>
            <div className={`text-xs ${colors.text.tertiary}`}>Total Trades</div>
          </div>
        </div>
      </div>

      <div className="absolute -top-4 left-8">
        <div className={`${colors.bg.glass} ${colors.border.primary} border rounded-full px-3 py-1 text-xs ${colors.text.secondary} flex items-center gap-2`}>
          <Cpu className="w-3 h-3" />
          <span>Live Strategy</span>
        </div>
      </div>
    </div>
  );
};

// Text Animation Component
interface AnimatedTextProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const AnimatedText = ({ children, delay = 0, className = "" }: AnimatedTextProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`transition-all duration-1000 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0 blur-0' 
          : 'opacity-0 translate-y-8 blur-sm'
      } ${className}`}
    >
      {children}
    </div>
  );
};



// Gradient Text Animation
interface GradientTextProps {
  children: React.ReactNode;
  delay?: number;
}

const GradientText = ({ children, delay = 0 }: GradientTextProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <span 
      className={`bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent transition-all duration-1000 ${
        isVisible ? 'animate-gradient-x opacity-100' : 'opacity-0'
      }`}
      style={{
        backgroundSize: '200% 200%',
        animation: isVisible ? 'gradient-x 3s ease infinite' : 'none'
      }}
    >
      {children}
    </span>
  );
};

// Rotating Words Component
interface RotatingWordsProps {
  words: string[];
  interval?: number;
}

const RotatingWords = ({ words, interval = 4500 }: RotatingWordsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
        setIsAnimating(false);
      }, 800);
    }, interval);

    return () => clearInterval(timer);
  }, [words.length, interval]);

  // Calculate the width needed for the longest word with very generous spacing
  const maxWordLength = Math.max(...words.map(word => word.length));
  const dynamicWidth = Math.max(350, maxWordLength * 20); // Very generous 20px per character

  return (
    <span 
      className="relative inline-block h-16 overflow-visible text-center"
      style={{ 
        minWidth: `${dynamicWidth}px`,
        width: `${dynamicWidth}px`
      }}
    >
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className={`absolute left-0 top-0 w-full whitespace-nowrap text-center transition-all duration-1000 ease-in-out transform ${
            index === currentIndex && !isAnimating
              ? 'translate-y-0 opacity-100 scale-100'
              : index === currentIndex && isAnimating
              ? '-translate-y-2 opacity-0 scale-98'
              : index === (currentIndex - 1 + words.length) % words.length && isAnimating
              ? 'translate-y-2 opacity-0 scale-98'
              : 'translate-y-4 opacity-0 scale-95'
          }`}
        >
          <span className="bg-gradient-to-r from-indigo-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent font-bold block w-full">
            {word}
          </span>
        </span>
      ))}
    </span>
  );
};

// Floating Animation Component
interface FloatingElementProps {
  children: React.ReactNode;
  delay?: number;
  intensity?: number;
}

const FloatingElement = ({ children, delay = 0, intensity = 10 }: FloatingElementProps) => {
  return (
    <div 
      className="animate-float-smooth"
      style={{
        animationDelay: `${delay}ms`,
        ['--float-intensity' as string]: `${intensity}px`
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};

// Main Component
function PineGenieLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState('landing');
  const router = useRouter();
  
  const theme = useTheme();
  
  // All useEffect hooks must be called before any early returns
  useEffect(() => {
    if (theme?.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme?.isDark]);
  
  if (!theme) return null;
  const { colors, isDark, toggleTheme } = theme;

  // Enhanced CSS animations
  const customAnimations = `
    @keyframes gradient-x {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    
    @keyframes float-smooth {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33% { transform: translateY(var(--float-intensity, -10px)) rotate(1deg); }
      66% { transform: translateY(calc(var(--float-intensity, -10px) * 0.5)) rotate(-1deg); }
    }
    
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
      50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6), 0 0 40px rgba(139, 92, 246, 0.3); }
    }
    
    @keyframes slide-up-fade {
      0% { transform: translateY(30px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes scale-in {
      0% { transform: scale(0.9); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    
    .animate-float-smooth {
      animation: float-smooth 6s ease-in-out infinite;
    }
    
    .animate-pulse-glow {
      animation: pulse-glow 2s ease-in-out infinite;
    }
    
    .animate-slide-up-fade {
      animation: slide-up-fade 0.8s ease-out forwards;
    }
    
    .animate-scale-in {
      animation: scale-in 0.6s ease-out forwards;
    }
    
    .animate-gradient-x {
      animation: gradient-x 3s ease infinite;
      background-size: 200% 200%;
    }
    
    .text-shadow-glow {
      text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
    }
  `;

  const handleLogin = () => {
    router.push('/login');
  };

  const handleSignUp = () => {
    router.push('/register');
  };




  const features = [
    {
      icon: <Zap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
      title: "Visual Drag-n-Drop Builder",
      description: "Create complex trading strategies with our intuitive visual interface. No coding required."
    },
    {
      icon: <Bot className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
      title: "AI Strategy Generator",
      description: "Powered by GPT & Mistral AI to generate intelligent trading strategies from simple descriptions."
    },
    {
      icon: <Code className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
      title: "Zero-error Pine Script v6",
      description: "Generate clean, optimized Pine Script v6 code that works perfectly on TradingView."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
      title: "Live Chart Testing",
      description: "Test your strategies in real-time with integrated TradingView chart simulation."
    },
    {
      icon: <Cpu className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
      title: "Custom Indicator Modules",
      description: "Build and save custom indicators that you can reuse across multiple strategies."
    },
    {
      icon: <Palette className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
      title: "Dark/Light Mode UI",
      description: "Beautiful interface that adapts to your preference with seamless theme switching."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Describe Your Strategy",
      description: "Simply tell our AI what kind of trading strategy you want to build using natural language."
    },
    {
      number: "02", 
      title: "Visual Builder Magic",
      description: "Use our drag-and-drop interface to customize and fine-tune your strategy components."
    },
    {
      number: "03",
      title: "Export & Deploy",
      description: "Get production-ready Pine Script v6 code and deploy directly to TradingView."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Quantitative Trader",
      content: "Pine Genie transformed how I build strategies. What used to take hours of coding now takes minutes with the visual builder.",
      rating: 5
    },
    {
      name: "Mike Rodriguez", 
      role: "Crypto Analyst",
      content: "The AI strategy generator is incredible. It understood my complex requirements and generated perfect Pine Script code.",
      rating: 5
    },
    {
      name: "Alex Thompson",
      role: "Day Trader",
      content: "Finally, a tool that bridges the gap between ideas and implementation. The live testing feature is a game-changer.",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "Do I need coding experience to use Pine Genie?",
      answer: "Not at all! Pine Genie is designed for traders of all skill levels. Our visual drag-and-drop builder and AI-powered generator make strategy creation accessible to everyone."
    },
    {
      question: "What version of Pine Script does Pine Genie support?",
      answer: "Pine Genie generates clean, optimized Pine Script v6 code that's fully compatible with TradingView's latest standards."
    },
    {
      question: "Can I test my strategies before deploying them?",
      answer: "Yes! Pine Genie includes integrated live chart testing powered by TradingView, so you can validate your strategies before going live."
    },
    {
      question: "How does the AI strategy generator work?",
      answer: "Our AI is powered by advanced models like GPT and Mistral. Simply describe your trading idea in natural language, and it will generate a complete strategy for you."
    },
    {
      question: "Can I export my strategies to other platforms?",
      answer: "Pine Genie generates standard Pine Script v6 code that works on any platform supporting Pine Script, primarily TradingView."
    }
  ];

  // Render different pages based on currentPage state
  if (currentPage === 'login') {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${colors.bg.primary} flex items-center justify-center p-4`}>
        <div className="w-full max-w-md">
          <button
            onClick={() => setCurrentPage('landing')}
            className={`flex items-center gap-2 ${colors.text.tertiary} hover:${colors.text.primary} transition-colors mb-8`}
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Back to Home</span>
          </button>
          <div className={`${colors.bg.glass} ${colors.border.primary} border rounded-3xl p-8 shadow-2xl text-center`}>
            <h1 className={`text-2xl font-bold ${colors.text.primary} mb-4`}>Login Page</h1>
            <p className={`${colors.text.secondary} mb-6`}>Login functionality will be implemented here</p>
            <button 
              onClick={() => setCurrentPage('register')}
              className={`${colors.text.primary} hover:text-blue-400 font-semibold transition-colors`}
            >
              Don&apos;t have an account? Sign up here
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'register') {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${colors.bg.primary} flex items-center justify-center p-4`}>
        <div className="w-full max-w-md">
          <button
            onClick={() => setCurrentPage('landing')}
            className={`flex items-center gap-2 ${colors.text.tertiary} hover:${colors.text.primary} transition-colors mb-8`}
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Back to Home</span>
          </button>
          <div className={`${colors.bg.glass} ${colors.border.primary} border rounded-3xl p-8 shadow-2xl text-center`}>
            <h1 className={`text-2xl font-bold ${colors.text.primary} mb-4`}>Register Page</h1>
            <p className={`${colors.text.secondary} mb-6`}>Registration functionality will be implemented here</p>
            <button 
              onClick={() => setCurrentPage('login')}
              className={`${colors.text.primary} hover:text-blue-400 font-semibold transition-colors`}
            >
              Already have an account? Sign in here
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'canvas') {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${colors.bg.primary} flex items-center justify-center p-4`}>
        <div className="text-center">
          <h1 className={`text-3xl font-bold ${colors.text.primary} mb-4`}>Strategy Builder Canvas</h1>
          <p className={`${colors.text.secondary} mb-8`}>Full canvas implementation will be integrated here</p>
          <button 
            onClick={() => setCurrentPage('landing')}
            className={`px-6 py-3 bg-gradient-to-r ${colors.accent.blue} text-white rounded-lg transition-colors`}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 bg-gradient-to-br ${colors.bg.primary}`}>
      {/* Inject custom CSS */}
      <style dangerouslySetInnerHTML={{ __html: customAnimations }} />
      
      {/* Header */}
      <nav className={`${colors.bg.glass} ${colors.border.primary} border-b backdrop-blur-md sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className={`w-8 h-8 bg-gradient-to-r ${colors.accent.blue} rounded-lg flex items-center justify-center mr-3`}>
                  <span className="text-white font-bold text-sm">PG</span>
                </div>
                <span className={`text-xl font-bold bg-gradient-to-r ${colors.accent.blue} bg-clip-text text-transparent`}>
                  PineGenie
                </span>
              </div>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <a href="#features" className={`${colors.text.secondary} hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors`}>
                  Features
                </a>
                <a href="#pricing" className={`${colors.text.secondary} hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors`}>
                  Pricing
                </a>
                <a href="#faq" className={`${colors.text.secondary} hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors`}>
                  FAQ
                </a>
                <button 
                  onClick={() => setCurrentPage('canvas')}
                  className={`${colors.text.secondary} hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors`}
                >
                  Try Builder
                </button>
              </div>
            </div>
            
            <div className="hidden md:flex md:items-center md:space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 ${colors.text.secondary} hover:text-indigo-600 transition-colors`}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button 
                onClick={handleLogin}
                className={`${colors.text.secondary} hover:text-indigo-600 px-4 py-2 text-sm font-medium transition-colors`}
              >
                Login
              </button>
              <button 
                onClick={handleSignUp}
                className={`bg-gradient-to-r ${colors.accent.blue} text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-all`}
              >
                Sign Up
              </button>
            </div>

            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className={`p-2 ${colors.text.secondary}`}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 ${colors.text.secondary}`}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden ${colors.bg.secondary} ${colors.border.primary} border-t`}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className={`block px-3 py-2 ${colors.text.secondary}`}>Features</a>
              <a href="#pricing" className={`block px-3 py-2 ${colors.text.secondary}`}>Pricing</a>
              <a href="#faq" className={`block px-3 py-2 ${colors.text.secondary}`}>FAQ</a>
              <button 
                onClick={() => setCurrentPage('canvas')}
                className={`block w-full text-left px-3 py-2 ${colors.text.secondary}`}
              >
                Try Builder
              </button>
              <div className={`pt-4 pb-2 border-t ${colors.border.primary}`}>
                <button 
                  onClick={handleLogin}
                  className={`block w-full text-left px-3 py-2 ${colors.text.secondary}`}
                >
                  Login
                </button>
                <button 
                  onClick={handleSignUp}
                  className={`block w-full text-left px-3 py-2 text-indigo-600 dark:text-indigo-400 font-medium`}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Centered in Viewport */}
      <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r ${colors.accent.blue} rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse`} />
          <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r ${colors.accent.purple} rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse`} />
        </div>

        <div className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center">
            {/* Hero Content */}
            <div className="w-full max-w-3xl">
              <AnimatedText delay={300}>
                <div className={`inline-flex items-center gap-2 px-4 py-2 ${colors.bg.glass} ${colors.border.primary} border rounded-full mb-8 animate-pulse-glow`}>
                  <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
                  <span className={`text-sm ${colors.text.secondary}`}>
                    AI-Powered Strategy Builder
                  </span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
                </div>
              </AnimatedText>

              <AnimatedText delay={600}>
                <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold ${colors.text.primary} mb-6 leading-tight`}>
                  <RotatingWords 
                    words={['AI-Powered', 'Visual', 'No-Code', 'Smart', 'Advanced']} 
                    interval={6000}
                  />{' '}
                  Builder for{' '}
                  <br className="hidden sm:block" />
                  <GradientText delay={900}>
                    TradingView Strategies
                  </GradientText>
                </h1>
              </AnimatedText>
              
              <AnimatedText delay={1200}>
                <div className={`text-xl ${colors.text.tertiary} mb-8 max-w-3xl mx-auto leading-relaxed`}>
                  Create professional Pine Script strategies without coding. Our AI-powered visual builder transforms your trading ideas into production-ready code in minutes.
                </div>
              </AnimatedText>

              <AnimatedText delay={1600}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <button 
                    onClick={handleSignUp}
                    className={`group px-8 py-4 bg-gradient-to-r ${colors.accent.blue} text-white rounded-xl hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 font-semibold animate-pulse-glow text-shadow-glow`}
                  >
                    <Zap className="w-5 h-5 animate-bounce" />
                    Start Building Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </button>
                  
                  <button 
                    onClick={() => setCurrentPage('canvas')}
                    className={`px-8 py-4 ${colors.bg.glass} ${colors.border.primary} border ${colors.text.primary} rounded-xl hover:${colors.bg.tertiary} transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-3 font-semibold backdrop-blur-lg`}
                  >
                    <Play className="w-5 h-5 animate-pulse" />
                    Try Builder Now
                  </button>
                </div>
              </AnimatedText>

              {/* Hero stats with enhanced animation */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
                {[
                  { label: 'Strategies Created', value: '10,000+', color: 'from-green-400 to-emerald-500' },
                  { label: 'Active Users', value: '2,500+', color: 'from-blue-400 to-cyan-500' },
                  { label: 'Success Rate', value: '98%', color: 'from-purple-400 to-pink-500' },
                  { label: 'Time Saved', value: '90%', color: 'from-amber-400 to-orange-500' }
                ].map((stat, index) => (
                  <AnimatedText key={index} delay={2000 + index * 200}>
                    <div className="text-center group cursor-pointer transform transition-all duration-300 hover:scale-110 hover:-translate-y-2">
                      <div className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent group-hover:animate-pulse mb-1`}>
                        {stat.value}
                      </div>
                      <div className={`text-sm ${colors.text.tertiary} group-hover:${colors.text.secondary} transition-colors`}>
                        {stat.label}
                      </div>
                    </div>
                  </AnimatedText>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Node Builder Box Section - Below Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl lg:text-4xl font-bold ${colors.text.primary} mb-4`}>
              Build Your Strategy Visually
            </h2>
            <p className={`text-xl ${colors.text.tertiary} max-w-2xl mx-auto`}>
              Drag and drop nodes to create your custom trading strategy
            </p>
          </div>
          
          <div className="relative mx-auto max-w-4xl">

            <AnimatedText delay={1000}>
              <FloatingElement delay={500} intensity={15}>
                <DashboardPreview />
              </FloatingElement>
            </AnimatedText>
              
            {/* Floating Action Cards with enhanced animation */}
            <AnimatedText delay={1600}>
              <FloatingElement delay={800} intensity={8}>
                <div className="absolute -top-8 -right-8 hidden lg:block">
                  <div className={`${colors.bg.glass} ${colors.border.primary} border rounded-2xl p-4 shadow-xl hover:scale-105 transition-all duration-300 backdrop-blur-lg animate-pulse-glow`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Download className="w-5 h-5 text-green-400 animate-bounce" />
                      <span className={`text-sm font-semibold ${colors.text.primary}`}>Pine Script Generated</span>
                    </div>
                    <div className={`text-xs ${colors.text.tertiary}`}>
                      Ready for TradingView deployment
                    </div>
                  </div>
                </div>
              </FloatingElement>
            </AnimatedText>

            <AnimatedText delay={1800}>
              <FloatingElement delay={1200} intensity={12}>
                <div className="absolute -bottom-8 -left-8 hidden lg:block">
                  <div className={`${colors.bg.glass} ${colors.border.primary} border rounded-2xl p-4 shadow-xl hover:scale-105 transition-all duration-300 backdrop-blur-lg animate-pulse-glow`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
                      <span className={`text-sm font-semibold ${colors.text.primary}`}>Live Testing</span>
                    </div>
                    <div className={`text-xs ${colors.text.tertiary}`}>
                      Real-time market simulation
                    </div>
                  </div>
                </div>
              </FloatingElement>
            </AnimatedText>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-24 ${colors.bg.secondary}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl lg:text-4xl font-bold ${colors.text.primary} mb-4`}>
              Powerful Features for Modern Traders
            </h2>
            <p className={`text-xl ${colors.text.tertiary} max-w-3xl mx-auto`}>
              Everything you need to build, test, and deploy professional trading strategies
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className={`group relative ${colors.bg.card} p-8 rounded-2xl border ${colors.border.primary} hover:${colors.border.accent} transition-all hover:scale-105`}>
                <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                <div className="relative">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className={`text-xl font-semibold ${colors.text.primary} mb-3`}>{feature.title}</h3>
                  <p className={`${colors.text.tertiary}`}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className={`py-24 ${colors.bg.secondary}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl lg:text-4xl font-bold ${colors.text.primary} mb-4`}>
              How Pine Genie Works
            </h2>
            <p className={`text-xl ${colors.text.tertiary}`}>
              From idea to implementation in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${colors.accent.purple} text-white rounded-full text-xl font-bold mb-6`}>
                    {step.number}
                  </div>
                  <h3 className={`text-xl font-semibold ${colors.text.primary} mb-4`}>{step.title}</h3>
                  <p className={`${colors.text.tertiary}`}>{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 right-0 transform translate-x-1/2">
                    <ArrowRight className={`h-6 w-6 ${colors.text.muted}`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className={`py-24 bg-gradient-to-br ${isDark ? 'from-gray-800 to-gray-900' : 'from-indigo-50 to-purple-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl lg:text-4xl font-bold ${colors.text.primary} mb-4`}>
              Loved by Traders Worldwide
            </h2>
            <p className={`text-xl ${colors.text.tertiary}`}>
              See what our users are saying about Pine Genie
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className={`${colors.bg.card} p-8 rounded-2xl shadow-lg border ${colors.border.primary}`}>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className={`${colors.text.tertiary} mb-6 italic`}>&ldquo;{testimonial.content}&rdquo;</p>
                <div>
                  <div className={`font-semibold ${colors.text.primary}`}>{testimonial.name}</div>
                  <div className={`text-sm ${colors.text.muted}`}>{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={`py-24 ${colors.bg.secondary}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl lg:text-4xl font-bold ${colors.text.primary} mb-4`}>
              Choose Your Plan
            </h2>
            <p className={`text-xl ${colors.text.tertiary} max-w-3xl mx-auto`}>
              Start free and upgrade as you scale. All plans include our core features.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className={`${colors.bg.card} rounded-2xl p-8 border ${colors.border.primary} relative`}>
              <div className="text-center">
                <h3 className={`text-xl font-semibold ${colors.text.primary} mb-2`}>Free</h3>
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${colors.text.primary}`}>$0</span>
                  <span className={`${colors.text.tertiary} ml-2`}>/month</span>
                </div>
                <ul className={`text-left space-y-3 mb-8 ${colors.text.tertiary}`}>
                  <li className="flex items-center">
                    <Zap className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    3 strategies per month
                  </li>
                  <li className="flex items-center">
                    <Code className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    Basic Pine Script export
                  </li>
                  <li className="flex items-center">
                    <BarChart3 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    Community support
                  </li>
                  <li className="flex items-center">
                    <Bot className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    AI assistant (limited)
                  </li>
                </ul>
                <button 
                  onClick={handleSignUp}
                  className={`w-full py-3 px-6 border-2 ${colors.border.primary} ${colors.text.primary} rounded-lg font-semibold hover:${colors.bg.tertiary} transition-all`}
                >
                  Get Started Free
                </button>
              </div>
            </div>

            {/* Pro Plan */}
            <div className={`${colors.bg.card} rounded-2xl p-8 border-2 border-blue-500 relative transform scale-105`}>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <div className="text-center">
                <h3 className={`text-xl font-semibold ${colors.text.primary} mb-2`}>Pro</h3>
                <div className="mb-6">
                  <span className={`text-4xl font-bold bg-gradient-to-r ${colors.accent.blue} bg-clip-text text-transparent`}>$29</span>
                  <span className={`${colors.text.tertiary} ml-2`}>/month</span>
                </div>
                <ul className={`text-left space-y-3 mb-8 ${colors.text.tertiary}`}>
                  <li className="flex items-center">
                    <Zap className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    Unlimited strategies
                  </li>
                  <li className="flex items-center">
                    <Code className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    Advanced Pine Script v6
                  </li>
                  <li className="flex items-center">
                    <BarChart3 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    Real-time backtesting
                  </li>
                  <li className="flex items-center">
                    <Bot className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    Full AI assistant
                  </li>
                  <li className="flex items-center">
                    <Shield className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <Database className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    Custom indicators
                  </li>
                </ul>
                <button 
                  onClick={handleSignUp}
                  className={`w-full py-3 px-6 bg-gradient-to-r ${colors.accent.blue} text-white rounded-lg font-semibold hover:opacity-90 transition-all transform hover:scale-105`}
                >
                  Start Pro Trial
                </button>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className={`${colors.bg.card} rounded-2xl p-8 border ${colors.border.primary} relative`}>
              <div className="text-center">
                <h3 className={`text-xl font-semibold ${colors.text.primary} mb-2`}>Enterprise</h3>
                <div className="mb-6">
                  <span className={`text-4xl font-bold bg-gradient-to-r ${colors.accent.purple} bg-clip-text text-transparent`}>$99</span>
                  <span className={`${colors.text.tertiary} ml-2`}>/month</span>
                </div>
                <ul className={`text-left space-y-3 mb-8 ${colors.text.tertiary}`}>
                  <li className="flex items-center">
                    <Zap className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    Everything in Pro
                  </li>
                  <li className="flex items-center">
                    <Code className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    White-label solutions
                  </li>
                  <li className="flex items-center">
                    <BarChart3 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center">
                    <Bot className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    Custom AI training
                  </li>
                  <li className="flex items-center">
                    <Shield className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    24/7 dedicated support
                  </li>
                  <li className="flex items-center">
                    <Database className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    API access
                  </li>
                </ul>
                <button 
                  onClick={handleSignUp}
                  className={`w-full py-3 px-6 border-2 ${colors.border.primary} ${colors.text.primary} rounded-lg font-semibold hover:${colors.bg.tertiary} transition-all`}
                >
                  Contact Sales
                </button>
              </div>
            </div>
          </div>

          {/* Pricing FAQ */}
          <div className="mt-16 text-center">
            <p className={`${colors.text.tertiary} mb-4`}>
              All plans include a 14-day free trial. No credit card required.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center">
                <Shield className="w-4 h-4 text-green-500 mr-2" />
                <span className={colors.text.tertiary}>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center">
                <Zap className="w-4 h-4 text-blue-500 mr-2" />
                <span className={colors.text.tertiary}>Cancel anytime</span>
              </div>
              <div className="flex items-center">
                <Code className="w-4 h-4 text-purple-500 mr-2" />
                <span className={colors.text.tertiary}>No setup fees</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className={`py-24 ${colors.bg.secondary}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl lg:text-4xl font-bold ${colors.text.primary} mb-4`}>
              Frequently Asked Questions
            </h2>
            <p className={`text-xl ${colors.text.tertiary}`}>
              Everything you need to know about Pine Genie
            </p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className={`border ${colors.border.primary} rounded-lg`}>
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className={`w-full flex justify-between items-center p-6 text-left hover:${colors.bg.tertiary} transition-colors`}
                >
                  <span className={`font-semibold ${colors.text.primary}`}>{faq.question}</span>
                  <span className="flex-shrink-0">
                    {openFAQ === index ? (
                      <ChevronUp className={`h-5 w-5 ${colors.text.muted}`} />
                    ) : (
                      <ChevronDown className={`h-5 w-5 ${colors.text.muted}`} />
                    )}
                  </span>
                </button>
                {openFAQ === index && (
                  <div className={`px-6 pb-6 border-t ${colors.border.primary}`}>
                    <p className={`${colors.text.tertiary} pt-4`}>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-24 ${colors.bg.secondary}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-3xl lg:text-4xl font-bold ${colors.text.primary} mb-4`}>
            Ready to Build Your First Strategy?
          </h2>
          <p className={`text-xl ${colors.text.tertiary} mb-8`}>
            Join thousands of traders who are already using Pine Genie to create winning strategies.
          </p>
          <button 
            onClick={handleSignUp}
            className={`bg-gradient-to-r ${colors.accent.blue} text-white px-8 py-4 rounded-lg font-semibold hover:opacity-90 transition-all transform hover:scale-105`}
          >
            Start Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${isDark ? 'bg-gray-900' : colors.bg.secondary} ${colors.text.primary} py-16 border-t ${colors.border.primary}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className={`w-8 h-8 bg-gradient-to-r ${colors.accent.blue} rounded-lg flex items-center justify-center mr-3`}>
                  <span className="text-white font-bold text-sm">PG</span>
                </div>
                <span className={`text-xl font-bold ${isDark ? 'text-white' : colors.text.primary}`}>PineGenie</span>
              </div>
              <p className={`${isDark ? 'text-gray-400' : colors.text.tertiary} mb-4`}>
                AI-powered visual builder for TradingView strategies.
              </p>
              <div className="flex space-x-4">
                <Github className={`h-5 w-5 ${isDark ? 'text-gray-400 hover:text-white' : `${colors.text.tertiary} hover:${colors.text.primary}`} cursor-pointer transition-colors`} />
              </div>
            </div>
            
            <div>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : colors.text.primary}`}>Product</h3>
              <ul className={`space-y-2 ${isDark ? 'text-gray-400' : colors.text.tertiary}`}>
                <li><a href="#features" className={`${isDark ? 'hover:text-white' : `hover:${colors.text.primary}`} transition-colors`}>Features</a></li>
                <li><a href="#pricing" className={`${isDark ? 'hover:text-white' : `hover:${colors.text.primary}`} transition-colors`}>Pricing</a></li>
                <li><a href="#" className={`${isDark ? 'hover:text-white' : `hover:${colors.text.primary}`} transition-colors`}>Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : colors.text.primary}`}>Company</h3>
              <ul className={`space-y-2 ${isDark ? 'text-gray-400' : colors.text.tertiary}`}>
                <li><a href="#" className={`${isDark ? 'hover:text-white' : `hover:${colors.text.primary}`} transition-colors`}>About</a></li>
                <li><a href="#" className={`${isDark ? 'hover:text-white' : `hover:${colors.text.primary}`} transition-colors`}>Blog</a></li>
                <li><a href="#" className={`${isDark ? 'hover:text-white' : `hover:${colors.text.primary}`} transition-colors`}>Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : colors.text.primary}`}>Legal</h3>
              <ul className={`space-y-2 ${isDark ? 'text-gray-400' : colors.text.tertiary}`}>
                <li><a href="#" className={`${isDark ? 'hover:text-white' : `hover:${colors.text.primary}`} transition-colors`}>Terms of Service</a></li>
                <li><a href="#" className={`${isDark ? 'hover:text-white' : `hover:${colors.text.primary}`} transition-colors`}>Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className={`border-t ${isDark ? 'border-gray-800' : colors.border.primary} mt-12 pt-8 flex flex-col md:flex-row justify-between items-center`}>
            <p className={`${isDark ? 'text-gray-400' : colors.text.tertiary}`}>
              © {new Date().getFullYear()} PineGenie. All rights reserved.
            </p>
            <p className={`${isDark ? 'text-gray-400' : colors.text.tertiary} mt-4 md:mt-0`}>
              Built by Abhishek Software and Digital Solutions Pvt Ltd.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Main App Component with Theme Provider
export default function App() {
  return (
    <ThemeProvider>
      <PineGenieLanding />
    </ThemeProvider>
  );
};