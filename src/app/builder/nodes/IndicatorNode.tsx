/**
* IndicatorNode Component - Specialized Node for Technical Indicators
* 
* This file contains:
* - Indicator-specific node with parameter controls
* - Dynamic indicator loading from definitions
* - Category-based visual styling and colors
* - Parameter editing with validation
* - Integration with indicator definitions system
* - Real-time parameter updates and preview
*/

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { TrendingUp, Settings, MoreVertical } from 'lucide-react';

// Mock dependencies (replace with your actual imports)
const useBuilderStore = () => {
 const [selectedNode, setSelectedNode] = useState<string | null>(null);
 
 return {
   selectedNode,
   setSelectedNode,
   updateNode: (id: string, updates: Record<string, unknown>) => console.log('Updating indicator node:', id, updates),
   deleteNode: (id: string) => console.log('Deleting indicator node:', id),
 };
};

const getIndicatorById = (id: string) => {
 const indicators = {
   'rsi': {
     id: 'rsi',
     name: 'RSI',
     description: 'Relative Strength Index - Momentum oscillator',
     category: 'Momentum',
     type: 'oscillator',
     parameters: [
       { name: 'period', type: 'number', default: 14, min: 1, max: 100 },
       { name: 'source', type: 'select', default: 'close', options: ['open', 'high', 'low', 'close'] }
     ]
   },
   'sma': {
     id: 'sma',
     name: 'SMA',
     description: 'Simple Moving Average - Trend following indicator',
     category: 'Trend',
     type: 'overlay',
     parameters: [
       { name: 'period', type: 'number', default: 20, min: 1, max: 200 },
       { name: 'source', type: 'select', default: 'close', options: ['open', 'high', 'low', 'close'] }
     ]
   },
   'macd': {
     id: 'macd',
     name: 'MACD',
     description: 'Moving Average Convergence Divergence',
     category: 'Momentum',
     type: 'oscillator',
     parameters: [
       { name: 'fastPeriod', type: 'number', default: 12, min: 1, max: 50 },
       { name: 'slowPeriod', type: 'number', default: 26, min: 1, max: 100 },
       { name: 'signalPeriod', type: 'number', default: 9, min: 1, max: 50 }
     ]
   },
   'bb': {
     id: 'bb',
     name: 'Bollinger Bands',
     description: 'Volatility bands around moving average',
     category: 'Volatility',
     type: 'overlay',
     parameters: [
       { name: 'period', type: 'number', default: 20, min: 1, max: 100 },
       { name: 'stddev', type: 'number', default: 2, min: 0.1, max: 5, step: 0.1 }
     ]
   }
 };
 
 return indicators[id as keyof typeof indicators] || indicators.rsi;
};

interface IndicatorNodeProps {
 id: string;
 data: {
   label?: string;
   config?: {
     indicatorId?: string;
     parameters?: Record<string, unknown>;
   };
   [key: string]: unknown;
 };
 selected?: boolean;
 position?: { x: number; y: number };
 onSelect?: (id: string) => void;
 onDelete?: (id: string) => void;
 onUpdate?: (id: string, updates: Record<string, unknown>) => void;
 onMove?: (id: string, position: { x: number; y: number }) => void;
 onConnectionStart?: (nodeId: string, handleType: 'input' | 'output', position: { x: number; y: number }) => void;
 onConnectionEnd?: (nodeId: string, handleType: 'input' | 'output') => void;
 zoom?: number;
 canvasOffset?: { x: number; y: number };
 isDarkMode?: boolean;
}

export default function IndicatorNode({ 
 id, 
 data, 
 selected = false,
 position = { x: 0, y: 0 },
 onSelect,
 onDelete,
 onUpdate,
 onMove,
 onConnectionStart,
 onConnectionEnd,
 zoom = 1,
 canvasOffset = { x: 0, y: 0 },
 isDarkMode = true
}: IndicatorNodeProps) {
 const nodeRef = useRef<HTMLDivElement>(null);
 const [isDragging, setIsDragging] = useState(false);
 const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
 const [showSettings, setShowSettings] = useState(false);
 const [isHovered, setIsHovered] = useState(false);
 const [showMenu, setShowMenu] = useState(false);
 const [parameters, setParameters] = useState<Record<string, unknown>>({});

 const { setSelectedNode, updateNode, deleteNode } = useBuilderStore();

 // Get indicator definition
 const indicatorId = data.config?.indicatorId || 'rsi';
 const indicator = getIndicatorById(indicatorId);

 // Initialize parameters
 useEffect(() => {
   if (indicator && indicator.parameters) {
     const defaultParams: Record<string, unknown> = {};
     indicator.parameters.forEach((param: { name: string; default: string | number | boolean }) => {
       defaultParams[param.name] = data.config?.parameters?.[param.name] || param.default;
     });
     setParameters(defaultParams);
   }
 }, [indicator, data.config?.parameters]);

 // Get node colors based on indicator type and category
 const getNodeColors = () => {
   const colorMap = {
     'Momentum': {
       main: 'from-purple-500 to-purple-600',
       bg: 'bg-purple-50 dark:bg-purple-950/30',
       border: 'border-purple-200 dark:border-purple-800',
       badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
     },
     'Trend': {
       main: 'from-blue-500 to-blue-600',
       bg: 'bg-blue-50 dark:bg-blue-950/30',
       border: 'border-blue-200 dark:border-blue-800',
       badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
     },
     'Volatility': {
       main: 'from-orange-500 to-orange-600',
       bg: 'bg-orange-50 dark:bg-orange-950/30',
       border: 'border-orange-200 dark:border-orange-800',
       badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
     },
     'Volume': {
       main: 'from-green-500 to-green-600',
       bg: 'bg-green-50 dark:bg-green-950/30',
       border: 'border-green-200 dark:border-green-800',
       badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
     },
     'default': {
       main: 'from-gray-500 to-gray-600',
       bg: 'bg-gray-50 dark:bg-gray-950/30',
       border: 'border-gray-200 dark:border-gray-800',
       badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
     }
   };

   return colorMap[indicator?.category as keyof typeof colorMap] || colorMap.default;
 };

 const colors = getNodeColors();

 // Handle node dragging
 const handleMouseDown = useCallback((e: React.MouseEvent) => {
   if (e.target instanceof Element && e.target.closest('.node-control')) return;
   
   const rect = nodeRef.current?.getBoundingClientRect();
   if (rect) {
     setDragOffset({
       x: (e.clientX - rect.left) / zoom,
       y: (e.clientY - rect.top) / zoom
     });
     setIsDragging(true);
     onSelect?.(id);
     setSelectedNode?.(id);
   }
 }, [zoom, onSelect, id, setSelectedNode]);

 const handleMouseMove = useCallback((e: MouseEvent) => {
   if (!isDragging || !onMove) return;
   
   const newX = (e.clientX - canvasOffset.x) / zoom - dragOffset.x;
   const newY = (e.clientY - canvasOffset.y) / zoom - dragOffset.y;
   
   onMove(id, { x: Math.max(0, newX), y: Math.max(0, newY) });
 }, [isDragging, dragOffset, onMove, id, zoom, canvasOffset]);

 const handleMouseUp = useCallback(() => {
   setIsDragging(false);
 }, []);

 useEffect(() => {
   if (isDragging) {
     document.addEventListener('mousemove', handleMouseMove);
     document.addEventListener('mouseup', handleMouseUp);
     return () => {
       document.removeEventListener('mousemove', handleMouseMove);
       document.removeEventListener('mouseup', handleMouseUp);
     };
   }
 }, [isDragging, handleMouseMove, handleMouseUp]);

 // Handle parameter changes
 const handleParameterChange = (paramName: string, value: string | number) => {
   const newParams = { ...parameters, [paramName]: value };
   setParameters(newParams);
   
   const updatedData = {
     ...data,
     config: {
       ...data.config,
       parameters: newParams
     }
   };
   
   onUpdate?.(id, { data: updatedData });
   updateNode?.(id, { data: updatedData });
 };

 // Handle connection events
 const handleConnectionStart = (e: React.MouseEvent, handleType: 'input' | 'output') => {
   e.stopPropagation();
   if (onConnectionStart) {
     const rect = e.currentTarget.getBoundingClientRect();
     const centerX = rect.left + rect.width / 2;
     const centerY = rect.top + rect.height / 2;
     onConnectionStart(id, handleType, { x: centerX, y: centerY });
   }
 };

 const handleConnectionEnd = (handleType: 'input' | 'output') => {
   onConnectionEnd?.(id, handleType);
 };

 // Handle delete
 const handleDelete = () => {
   onDelete?.(id);
   deleteNode?.(id);
   setShowMenu(false);
 };

 // Render parameter input
 const renderParameterInput = (param: { 
   name: string; 
   type: string; 
   default: string | number | boolean; 
   options?: string[]; 
   min?: number; 
   max?: number; 
   step?: number 
 }) => {
   const paramValue = parameters[param.name];
   const currentValue = paramValue !== undefined ? paramValue : param.default;
   
   if (param.type === 'select') {
     return (
       <select
         value={String(currentValue)}
         onChange={(e) => handleParameterChange(param.name, e.target.value)}
         className={`w-20 px-2 py-1 text-xs rounded border ${
           isDarkMode 
             ? 'bg-slate-600 border-slate-500 text-white' 
             : 'bg-white border-gray-300 text-gray-900'
         } focus:outline-none focus:ring-1 focus:ring-blue-400`}
       >
         {param.options?.map((option: string) => (
           <option key={option} value={option}>{option}</option>
         ))}
       </select>
     );
   }
   
   // Handle number or string parameters
   if (param.type === 'number' || param.type === 'string') {
     const numericValue = typeof currentValue === 'number' 
       ? currentValue 
       : typeof currentValue === 'string' 
         ? parseFloat(currentValue) || 0 
         : 0;

     return (
       <input
         type="number"
         value={numericValue}
         min={param.min}
         max={param.max}
         step={param.step || 1}
         onChange={(e) => {
           const value = parseFloat(e.target.value);
           handleParameterChange(param.name, isNaN(value) ? 0 : value);
         }}
         className={`w-20 px-2 py-1 text-xs rounded border ${
           isDarkMode 
             ? 'bg-slate-600 border-slate-500 text-white' 
             : 'bg-white border-gray-300 text-gray-900'
         } focus:outline-none focus:ring-1 focus:ring-blue-400`}
       />
     );
   }
   
   // Handle boolean parameters
   if (param.type === 'boolean') {
     const boolValue = typeof currentValue === 'boolean' 
       ? currentValue 
       : typeof currentValue === 'string' 
         ? currentValue === 'true'
         : Boolean(currentValue);
         
     return (
       <input
         type="checkbox"
         checked={boolValue}
         onChange={(e) => {
           // For boolean parameters, we need to ensure we're passing a string or number
           const value = e.target.checked ? 1 : 0;
           handleParameterChange(param.name, value);
         }}
         className={`h-4 w-4 rounded border ${
           isDarkMode 
             ? 'bg-slate-600 border-slate-500 text-blue-400' 
             : 'bg-white border-gray-300 text-blue-600'
         } focus:ring-blue-400`}
       />
     );
   }
   
   // Default fallback for any other parameter types
   const stringValue = typeof currentValue === 'string' 
     ? currentValue 
     : typeof currentValue === 'number' 
       ? currentValue.toString()
       : '';
       
   return (
     <input
       type="text"
       value={stringValue}
       onChange={(e) => handleParameterChange(param.name, e.target.value)}
       className={`w-20 px-2 py-1 text-xs rounded border ${
         isDarkMode 
           ? 'bg-slate-600 border-slate-500 text-white' 
           : 'bg-white border-gray-300 text-gray-900'
       } focus:outline-none focus:ring-1 focus:ring-blue-400`}
     />
   );
 };

 return (
   <div
     ref={nodeRef}
     className={`absolute cursor-move select-none transition-all duration-200 ${
       selected ? 'z-50' : 'z-20'
     } ${isHovered ? 'scale-105' : 'scale-100'}`}
     style={{
       left: position.x,
       top: position.y,
       transform: `scale(${zoom}) ${selected ? 'scale(1.05)' : ''} ${isHovered ? 'scale(1.02)' : ''}`,
       transformOrigin: 'top left',
       width: '240px'
     }}
     onMouseDown={handleMouseDown}
     onMouseEnter={() => setIsHovered(true)}
     onMouseLeave={() => setIsHovered(false)}
   >
     {/* Selection glow effect */}
     {selected && (
       <div className={`absolute inset-0 bg-gradient-to-r ${colors.main} rounded-xl blur-lg opacity-30 scale-110 animate-pulse`} />
     )}
     
     {/* Main node container */}
     <div className={`relative rounded-xl border-2 shadow-lg transition-all duration-200 overflow-hidden ${
       isDarkMode 
         ? 'bg-slate-800/90 backdrop-blur-xl border-slate-700/50' 
         : 'bg-white/90 backdrop-blur-xl border-gray-200/50'
     } ${selected ? 'ring-2 ring-blue-500/50 shadow-blue-500/20' : ''} ${colors.border}`}>
       
       {/* Header */}
       <div className={`bg-gradient-to-r ${colors.main} p-3`}>
         <div className="flex items-center justify-between text-white">
           <div className="flex items-center gap-2">
             <TrendingUp className="w-4 h-4 drop-shadow-sm" />
             <div>
               <div className="font-semibold text-sm">
                 {indicator?.name || data.label || 'Indicator'}
               </div>
               <div className="text-xs opacity-90">
                 {indicator?.type || 'Technical'}
               </div>
             </div>
           </div>
           
           {/* Controls */}
           <div className="flex items-center gap-1">
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 setShowSettings(!showSettings);
               }}
               className="node-control p-1.5 hover:bg-white/20 rounded-lg transition-all duration-200 group"
               title="Indicator Settings"
             >
               <Settings className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
             </button>
             
             <div className="relative">
               <button
                 onClick={(e) => {
                   e.stopPropagation();
                   setShowMenu(!showMenu);
                 }}
                 className="node-control p-1.5 hover:bg-white/20 rounded-lg transition-all duration-200"
                 title="More Options"
               >
                 <MoreVertical className="w-3.5 h-3.5" />
               </button>
               
               {showMenu && (
                 <div className={`absolute right-0 top-8 w-32 rounded-lg shadow-lg border z-50 ${
                   isDarkMode 
                     ? 'bg-slate-800 border-slate-700' 
                     : 'bg-white border-gray-200'
                 }`}>
                   <button
                     onClick={() => {
                       setShowSettings(!showSettings);
                       setShowMenu(false);
                     }}
                     className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-700 transition-colors ${
                       isDarkMode ? 'text-slate-300' : 'text-gray-700'
                     }`}
                   >
                     Configure
                   </button>
                   <button
                     onClick={handleDelete}
                     className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
                   >
                     Delete
                   </button>
                 </div>
               )}
             </div>
           </div>
         </div>
       </div>

       {/* Content */}
       <div className="p-4">
         {/* Category badge */}
         <div className="mb-3">
           <span className={`text-xs px-2 py-1 rounded-full ${colors.badge}`}>
             {indicator?.category || 'Technical'}
           </span>
         </div>
         
         {/* Description */}
         <p className={`text-xs leading-relaxed mb-3 ${
           isDarkMode ? 'text-slate-400' : 'text-gray-600'
         }`}>
           {indicator?.description || 'Technical analysis indicator'}
         </p>

         {/* Parameters */}
         {showSettings && indicator?.parameters && (
           <div className={`rounded-lg border p-3 transition-all ${
             isDarkMode ? 'bg-slate-700/30 border-slate-600/50' : 'bg-gray-50/50 border-gray-200/50'
           }`}>
             <h4 className={`text-xs font-medium mb-3 ${
               isDarkMode ? 'text-slate-300' : 'text-gray-700'
             }`}>
               Parameters
             </h4>
             
             <div className="space-y-2">
               {indicator.parameters.map((param, index) => (
                 <div key={index} className="flex items-center justify-between">
                   <label className={`text-xs capitalize ${
                     isDarkMode ? 'text-slate-400' : 'text-gray-600'
                   }`}>
                     {param.name}:
                   </label>
                   {renderParameterInput(param)}
                 </div>
               ))}
             </div>
             
             {/* Current values display */}
             <div className={`mt-3 pt-2 border-t text-xs ${
               isDarkMode ? 'border-slate-600 text-slate-500' : 'border-gray-200 text-gray-500'
             }`}>
               Active: {Object.entries(parameters).map(([key, value]) => 
                 `${key}=${value}`
               ).join(', ')}
             </div>
           </div>
         )}
       </div>

       {/* Connection handles */}
       <div
         className="absolute -left-2 top-1/2 w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full cursor-crosshair hover:scale-125 transition-all duration-200 shadow-lg border-2 border-white"
         style={{ transform: 'translateY(-50%)' }}
         onMouseDown={(e) => handleConnectionStart(e, 'input')}
         onMouseEnter={() => handleConnectionEnd('input')}
         title="Data Input"
       >
         <div className="absolute inset-1 bg-white rounded-full opacity-80" />
       </div>
       
       <div
         className="absolute -right-2 top-1/2 w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full cursor-crosshair hover:scale-125 transition-all duration-200 shadow-lg border-2 border-white"
         style={{ transform: 'translateY(-50%)' }}
         onMouseDown={(e) => handleConnectionStart(e, 'output')}
         title="Indicator Output"
       >
         <div className="absolute inset-1 bg-white rounded-full opacity-80" />
       </div>
     </div>
   </div>
 );
}