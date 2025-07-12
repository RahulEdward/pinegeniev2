/**
* BaseNode Component - Core Node Component for Strategy Builder
* 
* This file contains:
* - Base node component with drag and drop functionality
* - Custom connection handles without ReactFlow dependency
* - Theme-aware styling and visual states
* - Node parameter editing capabilities
* - Integration with builder state management
* - Visual feedback for selection and hover states
*/

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Settings, MoreVertical } from 'lucide-react';

// Mock builder store (replace with your actual store)
const useBuilderStore = () => {
 const [selectedNode, setSelectedNode] = useState<string | null>(null);
 
 return {
   selectedNode,
   setSelectedNode,
   updateNode: (id: string, updates: Record<string, unknown>) => console.log('Updating node:', id, updates),
   deleteNode: (id: string) => console.log('Deleting node:', id),
 };
};

interface BaseNodeProps {
 id: string;
 data: {
   label?: string;
   type?: string;
   description?: string;
   parameters?: Record<string, unknown>;
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
 icon?: React.ComponentType<{ className?: string }>;
 color?: string;
}

export default function BaseNode({ 
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
 isDarkMode = true,
 icon: Icon,
 // color = 'blue' // Unused parameter
}: BaseNodeProps) {
 const nodeRef = useRef<HTMLDivElement>(null);
 const [isDragging, setIsDragging] = useState(false);
 const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
 const [showSettings, setShowSettings] = useState(false);
 const [isHovered, setIsHovered] = useState(false);
 const [showMenu, setShowMenu] = useState(false);

 const { setSelectedNode, updateNode, deleteNode } = useBuilderStore();
 
 const nodeType = data.type || 'default';

 // Get node colors based on type
 const getNodeColors = () => {
   const colorMap = {
     'input': { main: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800' },
     'output': { main: 'from-green-500 to-green-600', bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800' },
     'indicator': { main: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800' },
     'condition': { main: 'from-yellow-500 to-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200 dark:border-yellow-800' },
     'action': { main: 'from-red-500 to-red-600', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800' },
     'data-source': { main: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800' },
     'math': { main: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30', border: 'border-indigo-200 dark:border-indigo-800' },
     'risk': { main: 'from-orange-500 to-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-800' },
     'timing': { main: 'from-teal-500 to-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/30', border: 'border-teal-200 dark:border-teal-800' },
     'default': { main: 'from-gray-500 to-gray-600', bg: 'bg-gray-50 dark:bg-gray-950/30', border: 'border-gray-200 dark:border-gray-800' }
   };
   
   return colorMap[nodeType as keyof typeof colorMap] || colorMap.default;
 };

 const colors = getNodeColors();

 // Handle node dragging
 const handleMouseDown = useCallback((e: React.MouseEvent) => {
   // Don't start dragging if clicking on controls
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

 // Attach global mouse events for dragging
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

 // Handle connection start
 const handleConnectionStart = (e: React.MouseEvent, handleType: 'input' | 'output') => {
   e.stopPropagation();
   if (onConnectionStart) {
     const rect = e.currentTarget.getBoundingClientRect();
     const centerX = rect.left + rect.width / 2;
     const centerY = rect.top + rect.height / 2;
     onConnectionStart(id, handleType, { x: centerX, y: centerY });
   }
 };

 // Handle connection end
 const handleConnectionEnd = (handleType: 'input' | 'output') => {
   if (onConnectionEnd) {
     onConnectionEnd(id, handleType);
   }
 };

 // Handle parameter updates
 const handleParameterChange = (paramName: string, value: string | number) => {
   const updatedData = {
     ...data,
     parameters: {
       ...data.parameters,
       [paramName]: value
     }
   };
   onUpdate?.(id, { data: updatedData });
   updateNode?.(id, { data: updatedData });
 };

 // Handle node deletion
 const handleDelete = () => {
   onDelete?.(id);
   deleteNode?.(id);
   setShowMenu(false);
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
       transformOrigin: 'top left'
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
     <div className={`relative min-w-[200px] rounded-xl border-2 shadow-lg transition-all duration-200 ${
       isDarkMode 
         ? 'bg-slate-800/90 backdrop-blur-xl border-slate-700/50' 
         : 'bg-white/90 backdrop-blur-xl border-gray-200/50'
     } ${selected ? 'ring-2 ring-blue-500/50 shadow-blue-500/20' : ''} ${colors.border}`}>
       
       {/* Header with gradient */}
       <div className={`bg-gradient-to-r ${colors.main} p-3 rounded-t-xl`}>
         <div className="flex items-center justify-between text-white">
           <div className="flex items-center gap-2">
             {Icon && <Icon className="w-4 h-4 drop-shadow-sm" />}
             <span className="font-semibold text-sm tracking-wide">
               {data.label || nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}
             </span>
           </div>
           
           {/* Node controls */}
           <div className="flex items-center gap-1">
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 setShowSettings(!showSettings);
               }}
               className="node-control p-1.5 hover:bg-white/20 rounded-lg transition-all duration-200 group"
               title="Node Settings"
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
               
               {/* Dropdown menu */}
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
                     Edit
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

       {/* Content area */}
       <div className="p-4">
         {/* Description */}
         {data.description && (
           <p className={`text-xs mb-3 leading-relaxed ${
             isDarkMode ? 'text-slate-400' : 'text-gray-600'
           }`}>
             {data.description}
           </p>
         )}

         {/* Parameters panel */}
         {showSettings && (
           <div className={`rounded-lg border p-3 transition-all ${
             isDarkMode ? 'bg-slate-700/30 border-slate-600/50' : 'bg-gray-50/50 border-gray-200/50'
           }`}>
             <h4 className={`text-xs font-medium mb-2 ${
               isDarkMode ? 'text-slate-300' : 'text-gray-700'
             }`}>
               Parameters
             </h4>
             
             <div className="space-y-2">
               {/* Sample parameters - customize based on node type */}
               <div className="flex items-center justify-between">
                 <label className={`text-xs ${
                   isDarkMode ? 'text-slate-400' : 'text-gray-600'
                 }`}>
                   Value:
                 </label>
                 <input
                   type="number"
                   defaultValue={String(data.parameters?.value || 0)}
                   onChange={(e) => handleParameterChange('value', e.target.value)}
                   className={`w-16 px-2 py-1 text-xs rounded border ${
                     isDarkMode 
                       ? 'bg-slate-600 border-slate-500 text-white' 
                       : 'bg-white border-gray-300 text-gray-900'
                   } focus:outline-none focus:ring-1 focus:ring-blue-400`}
                 />
               </div>
               
               {nodeType === 'indicator' && (
                 <div className="flex items-center justify-between">
                   <label className={`text-xs ${
                     isDarkMode ? 'text-slate-400' : 'text-gray-600'
                   }`}>
                     Period:
                   </label>
                   <input
                     type="number"
                     defaultValue={String(data.parameters?.period || 14)}
                     onChange={(e) => handleParameterChange('period', e.target.value)}
                     className={`w-16 px-2 py-1 text-xs rounded border ${
                       isDarkMode 
                         ? 'bg-slate-600 border-slate-500 text-white' 
                         : 'bg-white border-gray-300 text-gray-900'
                     } focus:outline-none focus:ring-1 focus:ring-blue-400`}
                   />
                 </div>
               )}
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
         title="Input"
       >
         <div className="absolute inset-1 bg-white rounded-full opacity-80" />
       </div>
       
       <div
         className="absolute -right-2 top-1/2 w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full cursor-crosshair hover:scale-125 transition-all duration-200 shadow-lg border-2 border-white"
         style={{ transform: 'translateY(-50%)' }}
         onMouseDown={(e) => handleConnectionStart(e, 'output')}
         title="Output"
       >
         <div className="absolute inset-1 bg-white rounded-full opacity-80" />
       </div>
     </div>
   </div>
 );
}