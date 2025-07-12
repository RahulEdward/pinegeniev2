/**
* RSINode Component - Specialized RSI Indicator Node
* 
* This file contains:
* - RSI-specific node with oscillator styling
* - Real-time RSI parameter configuration (period, source, levels)
* - Overbought/Oversold level visualization
* - RSI-specific color coding and visual indicators
* - Parameter validation and Pine Script generation
* - Integration with RSI indicator definitions
*/

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Settings, MoreVertical, Activity } from 'lucide-react';

// Mock dependencies (replace with your actual imports)
const useBuilderStore = () => {
 const [selectedNode, setSelectedNode] = useState<string | null>(null);
 
 return {
   selectedNode,
   setSelectedNode,
   updateNode: (id: string, updates: Record<string, unknown>) => console.log('Updating RSI node:', id, updates),
   deleteNode: (id: string) => console.log('Deleting RSI node:', id),
 };
};

const getIndicatorById = (id: string) => {
 const rsiDefinition = {
   id: 'rsi',
   name: 'RSI',
   fullName: 'Relative Strength Index',
   description: 'Momentum oscillator measuring overbought/oversold conditions',
   category: 'Momentum',
   type: 'oscillator',
   range: { min: 0, max: 100 },
   levels: {
     overbought: 70,
     oversold: 30,
     neutral: 50
   },
   parameters: [
     { 
       name: 'period', 
       type: 'number', 
       default: 14, 
       min: 2, 
       max: 100,
       description: 'Number of periods for RSI calculation'
     },
     { 
       name: 'source', 
       type: 'select', 
       default: 'close', 
       options: ['open', 'high', 'low', 'close', 'hl2', 'hlc3', 'ohlc4'],
       description: 'Price source for RSI calculation'
     },
     {
       name: 'overboughtLevel',
       type: 'number',
       default: 70,
       min: 50,
       max: 95,
       description: 'Overbought threshold level'
     },
     {
       name: 'oversoldLevel',
       type: 'number',
       default: 30,
       min: 5,
       max: 50,
       description: 'Oversold threshold level'
     }
   ]
 };
 
 return id === 'rsi' ? rsiDefinition : null;
};

interface RSINodeProps {
 id: string;
 data: {
   label?: string;
   config?: {
     parameters?: {
       period?: number;
       source?: string;
       overboughtLevel?: number;
       oversoldLevel?: number;
     };
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

export default function RSINode({ 
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
}: RSINodeProps) {
 const nodeRef = useRef<HTMLDivElement>(null);
 const [isDragging, setIsDragging] = useState(false);
 const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
 const [showSettings, setShowSettings] = useState(false);
 const [isHovered, setIsHovered] = useState(false);
 const [showMenu, setShowMenu] = useState(false);

 const { setSelectedNode, updateNode, deleteNode } = useBuilderStore();
 
 // Get RSI definition
 const rsiDef = getIndicatorById('rsi');
 
 // Initialize parameters with defaults
 const [parameters, setParameters] = useState({
   period: data.config?.parameters?.period || 14,
   source: data.config?.parameters?.source || 'close',
   overboughtLevel: data.config?.parameters?.overboughtLevel || 70,
   oversoldLevel: data.config?.parameters?.oversoldLevel || 30
 });

 // RSI-specific colors (purple for oscillator)
 const colors = {
   main: 'from-purple-500 to-purple-600',
   bg: 'bg-purple-50 dark:bg-purple-950/30',
   border: 'border-purple-200 dark:border-purple-800/50',
   badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
   icon: 'text-purple-600 dark:text-purple-400',
   dot: 'bg-purple-500'
 };

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

 // Get RSI level color based on value (currently unused but kept for future use)
 // const getRSILevelColor = (level: number) => {
 //   if (level >= parameters.overboughtLevel) return 'text-red-500';
 //   if (level <= parameters.oversoldLevel) return 'text-green-500';
 //   return isDarkMode ? 'text-slate-400' : 'text-gray-600';
 // };

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
       width: '260px'
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
     } ${selected ? 'ring-2 ring-purple-500/50 shadow-purple-500/20' : ''} ${colors.border}`}>
       
       {/* Header */}
       <div className={`bg-gradient-to-r ${colors.main} p-3`}>
         <div className="flex items-center justify-between text-white">
           <div className="flex items-center gap-2">
             <Activity className="w-4 h-4 drop-shadow-sm" />
             <div>
               <div className="font-semibold text-sm">
                 {data.label || 'RSI'}
               </div>
               <div className="text-xs opacity-90">
                 Period: {parameters.period}
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
               title="RSI Settings"
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
         {/* RSI Level Indicators */}
         <div className="mb-3">
           <div className="flex justify-between items-center text-xs mb-2">
             <span className={`font-medium ${colors.badge} px-2 py-1 rounded-full`}>
               Oscillator (0-100)
             </span>
             <span className={`font-mono ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
               {parameters.source.toUpperCase()}
             </span>
           </div>
           
           {/* RSI Level Bar */}
           <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
             <div 
               className="absolute left-0 top-0 h-full bg-green-500 rounded-full"
               style={{ width: `${parameters.oversoldLevel}%` }}
             />
             <div 
               className="absolute top-0 h-full bg-yellow-500 rounded-full"
               style={{ 
                 left: `${parameters.oversoldLevel}%`,
                 width: `${parameters.overboughtLevel - parameters.oversoldLevel}%`
               }}
             />
             <div 
               className="absolute right-0 top-0 h-full bg-red-500 rounded-full"
               style={{ width: `${100 - parameters.overboughtLevel}%` }}
             />
           </div>
           
           {/* Level Labels */}
           <div className="flex justify-between text-xs mt-1">
             <span className="text-green-500 font-medium">{parameters.oversoldLevel}</span>
             <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>50</span>
             <span className="text-red-500 font-medium">{parameters.overboughtLevel}</span>
           </div>
         </div>
         
         {/* Description */}
         <p className={`text-xs leading-relaxed mb-3 ${
           isDarkMode ? 'text-slate-400' : 'text-gray-600'
         }`}>
           {rsiDef?.description || 'Measures momentum to identify overbought/oversold conditions'}
         </p>

         {/* RSI Parameters */}
         {showSettings && rsiDef?.parameters && (
           <div className={`rounded-lg border p-3 transition-all ${
             isDarkMode ? 'bg-slate-700/30 border-slate-600/50' : 'bg-gray-50/50 border-gray-200/50'
           }`}>
             <h4 className={`text-xs font-medium mb-3 ${
               isDarkMode ? 'text-slate-300' : 'text-gray-700'
             }`}>
               RSI Parameters
             </h4>
             
             <div className="space-y-3">
               {/* Period */}
               <div className="flex items-center justify-between">
                 <label className={`text-xs ${
                   isDarkMode ? 'text-slate-400' : 'text-gray-600'
                 }`}>
                   Period:
                 </label>
                 <input
                   type="number"
                   value={parameters.period}
                   min={2}
                   max={100}
                   onChange={(e) => handleParameterChange('period', parseInt(e.target.value) || 14)}
                   className={`w-16 px-2 py-1 text-xs rounded border ${
                     isDarkMode 
                       ? 'bg-slate-600 border-slate-500 text-white' 
                       : 'bg-white border-gray-300 text-gray-900'
                   } focus:outline-none focus:ring-1 focus:ring-purple-400`}
                 />
               </div>
               
               {/* Source */}
               <div className="flex items-center justify-between">
                 <label className={`text-xs ${
                   isDarkMode ? 'text-slate-400' : 'text-gray-600'
                 }`}>
                   Source:
                 </label>
                 <select
                   value={parameters.source}
                   onChange={(e) => handleParameterChange('source', e.target.value)}
                   className={`w-20 px-2 py-1 text-xs rounded border ${
                     isDarkMode 
                       ? 'bg-slate-600 border-slate-500 text-white' 
                       : 'bg-white border-gray-300 text-gray-900'
                   } focus:outline-none focus:ring-1 focus:ring-purple-400`}
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
               
               {/* Overbought Level */}
               <div className="flex items-center justify-between">
                 <label className={`text-xs ${
                   isDarkMode ? 'text-slate-400' : 'text-gray-600'
                 }`}>
                   Overbought:
                 </label>
                 <input
                   type="number"
                   value={parameters.overboughtLevel}
                   min={50}
                   max={95}
                   onChange={(e) => handleParameterChange('overboughtLevel', parseInt(e.target.value) || 70)}
                   className={`w-16 px-2 py-1 text-xs rounded border ${
                     isDarkMode 
                       ? 'bg-slate-600 border-slate-500 text-white' 
                       : 'bg-white border-gray-300 text-gray-900'
                   } focus:outline-none focus:ring-1 focus:ring-purple-400`}
                 />
               </div>
               
               {/* Oversold Level */}
               <div className="flex items-center justify-between">
                 <label className={`text-xs ${
                   isDarkMode ? 'text-slate-400' : 'text-gray-600'
                 }`}>
                   Oversold:
                 </label>
                 <input
                   type="number"
                   value={parameters.oversoldLevel}
                   min={5}
                   max={50}
                   onChange={(e) => handleParameterChange('oversoldLevel', parseInt(e.target.value) || 30)}
                   className={`w-16 px-2 py-1 text-xs rounded border ${
                     isDarkMode 
                       ? 'bg-slate-600 border-slate-500 text-white' 
                       : 'bg-white border-gray-300 text-gray-900'
                   } focus:outline-none focus:ring-1 focus:ring-purple-400`}
                 />
               </div>
             </div>
             
             {/* Pine Script Preview */}
             <div className={`mt-3 pt-2 border-t text-xs font-mono ${
               isDarkMode ? 'border-slate-600 text-slate-500' : 'border-gray-200 text-gray-500'
             }`}>
               ta.rsi({parameters.source}, {parameters.period})
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
         title="Price Data Input"
       >
         <div className="absolute inset-1 bg-white rounded-full opacity-80" />
       </div>
       
       <div
         className="absolute -right-2 top-1/2 w-4 h-4 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full cursor-crosshair hover:scale-125 transition-all duration-200 shadow-lg border-2 border-white"
         style={{ transform: 'translateY(-50%)' }}
         onMouseDown={(e) => handleConnectionStart(e, 'output')}
         title="RSI Values (0-100)"
       >
         <div className="absolute inset-1 bg-white rounded-full opacity-80" />
       </div>
     </div>
   </div>
 );
}