/**
* N8nBaseNode Component - N8n-style Base Node for Workflow Building
* 
* This file contains:
* - N8n-inspired node design with workflow logic
* - Conditional connection handles based on node type
* - Category-based styling and visual indicators
* - Workflow-specific node types (input, output, condition, action)
* - Clean, minimalist design following n8n aesthetics
* - Integration with builder state management
*/

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { 
 Play, 
 Square, 
 GitBranch, 
 Zap, 
 Settings, 
 MoreVertical,
 ArrowRight,
 ArrowLeft
} from 'lucide-react';

// Mock dependencies (replace with your actual imports)
const useBuilderStore = () => {
 const [selectedNode, setSelectedNode] = useState<string | null>(null);
 
 return {
   selectedNode,
   setSelectedNode,
   updateNode: (id: string, updates: Record<string, unknown>) => console.log('Updating n8n node:', id, updates),
   deleteNode: (id: string) => console.log('Deleting n8n node:', id),
 };
};

interface N8nBaseNodeProps {
 id: string;
 data: {
   label?: string;
   type?: string;
   description?: string;
   config?: Record<string, unknown>;
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

export default function N8nBaseNode({ 
 id, 
 data, 
 selected = false,
 position = { x: 0, y: 0 },
 onSelect,
 onDelete,
 onUpdate, // Now properly used below
 onMove,
 onConnectionStart,
 onConnectionEnd,
 zoom = 1,
 canvasOffset = { x: 0, y: 0 },
 isDarkMode = true
}: N8nBaseNodeProps) {
 const nodeRef = useRef<HTMLDivElement>(null);
 const [isDragging, setIsDragging] = useState(false);
 const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
 const [showSettings, setShowSettings] = useState(false);
 const [isHovered, setIsHovered] = useState(false);
 const [showMenu, setShowMenu] = useState(false);
 const [nodeConfig, setNodeConfig] = useState(data.config || {});

 const { setSelectedNode, deleteNode, updateNode } = useBuilderStore();
 
 const nodeType = data.type || 'default';

 // Handle node configuration updates
 const handleConfigUpdate = useCallback((updates: Record<string, unknown>) => {
   const newConfig = { ...nodeConfig, ...updates };
   setNodeConfig(newConfig);
   onUpdate?.(id, { config: newConfig }); // Now onUpdate is properly used
   updateNode(id, { config: newConfig });
 }, [id, nodeConfig, onUpdate, updateNode]);

 // Get node icon based on type
 const getNodeIcon = () => {
   switch (nodeType) {
     case 'input':
       return Play;
     case 'output':
       return Square;
     case 'condition':
       return GitBranch;
     case 'action':
       return Zap;
     default:
       return Play;
   }
 };

 // Get node color scheme based on type
 const getNodeColors = () => {
   const colorMap = {
     'input': {
       main: 'from-blue-500 to-blue-600',
       bg: 'bg-blue-50 dark:bg-blue-950/20',
       border: 'border-blue-200 dark:border-blue-800/50',
       badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
       icon: 'text-blue-600 dark:text-blue-400'
     },
     'output': {
       main: 'from-green-500 to-green-600',
       bg: 'bg-green-50 dark:bg-green-950/20',
       border: 'border-green-200 dark:border-green-800/50',
       badge: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
       icon: 'text-green-600 dark:text-green-400'
     },
     'condition': {
       main: 'from-yellow-500 to-yellow-600',
       bg: 'bg-yellow-50 dark:bg-yellow-950/20',
       border: 'border-yellow-200 dark:border-yellow-800/50',
       badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
       icon: 'text-yellow-600 dark:text-yellow-400'
     },
     'action': {
       main: 'from-red-500 to-red-600',
       bg: 'bg-red-50 dark:bg-red-950/20',
       border: 'border-red-200 dark:border-red-800/50',
       badge: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
       icon: 'text-red-600 dark:text-red-400'
     },
     'default': {
       main: 'from-gray-500 to-gray-600',
       bg: 'bg-gray-50 dark:bg-gray-950/20',
       border: 'border-gray-200 dark:border-gray-800/50',
       badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300',
       icon: 'text-gray-600 dark:text-gray-400'
     }
   };

   return colorMap[nodeType as keyof typeof colorMap] || colorMap.default;
 };

 const colors = getNodeColors();
 const IconComponent = getNodeIcon();

 // Get node description based on type
 const getNodeDescription = () => {
   switch (nodeType) {
     case 'input':
       return 'Starting point for the workflow execution';
     case 'output':
       return 'Final output destination of the workflow';
     case 'condition':
       return 'Conditional logic for decision making';
     case 'action':
       return 'Performs an action in the workflow';
     default:
       return 'Workflow node for data processing';
   }
 };

 // Get category info
 const getNodeCategory = () => {
   switch (nodeType) {
     case 'input':
       return { text: 'Trigger', color: colors.badge };
     case 'output':
       return { text: 'Output', color: colors.badge };
     case 'condition':
       return { text: 'Logic', color: colors.badge };
     case 'action':
       return { text: 'Action', color: colors.badge };
     default:
       return { text: 'Node', color: colors.badge };
   }
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

 // Check if node should have handles
 const hasInputHandle = nodeType !== 'input';
 const hasOutputHandle = nodeType !== 'output';

 const category = getNodeCategory();

 return (
   <div
     ref={nodeRef}
     className={`absolute cursor-move select-none transition-all duration-200 ${
       selected ? 'z-50' : 'z-20'
     } ${isHovered ? 'scale-102' : 'scale-100'}`}
     style={{
       left: position.x,
       top: position.y,
       transform: `scale(${zoom}) ${selected ? 'scale(1.03)' : ''} ${isHovered ? 'scale(1.01)' : ''}`,
       transformOrigin: 'top left',
       width: '240px'
     }}
     onMouseDown={handleMouseDown}
     onMouseEnter={() => setIsHovered(true)}
     onMouseLeave={() => setIsHovered(false)}
   >
     {/* Selection glow effect */}
     {selected && (
       <div className={`absolute inset-0 bg-gradient-to-r ${colors.main} rounded-lg blur-md opacity-20 scale-110`} />
     )}
     
     {/* Main node container - N8n style */}
     <div className={`relative rounded-lg border shadow-md transition-all duration-200 overflow-hidden ${
       isDarkMode 
         ? 'bg-slate-800/95 backdrop-blur-sm border-slate-700/70' 
         : 'bg-white/95 backdrop-blur-sm border-gray-200/70'
     } ${selected ? 'ring-1 ring-blue-400/50 shadow-lg' : 'shadow-sm'} ${colors.border}`}>
       
       {/* Header */}
       <div className={`px-4 py-3 border-b transition-colors ${
         isDarkMode ? 'border-slate-700/50' : 'border-gray-100'
       }`}>
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className={`p-1.5 rounded-lg ${colors.bg}`}>
               <IconComponent className={`w-4 h-4 ${colors.icon}`} />
             </div>
             <div>
               <h3 className={`text-sm font-medium truncate ${
                 isDarkMode ? 'text-white' : 'text-gray-900'
               }`}>
                 {data.label || nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}
               </h3>
               <span className={`text-xs px-2 py-0.5 rounded-full ${category.color}`}>
                 {category.text}
               </span>
             </div>
           </div>
           
           {/* Controls */}
           <div className="flex items-center gap-1">
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 setShowSettings(!showSettings);
               }}
               className={`node-control p-1.5 rounded transition-colors ${
                 isDarkMode 
                   ? 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-300' 
                   : 'hover:bg-gray-100/50 text-gray-500 hover:text-gray-700'
               }`}
               title="Node Settings"
             >
               <Settings className="w-3.5 h-3.5" />
             </button>
             
             <div className="relative">
               <button
                 onClick={(e) => {
                   e.stopPropagation();
                   setShowMenu(!showMenu);
                 }}
                 className={`node-control p-1.5 rounded transition-colors ${
                   isDarkMode 
                     ? 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-300' 
                     : 'hover:bg-gray-100/50 text-gray-500 hover:text-gray-700'
                 }`}
                 title="More Options"
               >
                 <MoreVertical className="w-3.5 h-3.5" />
               </button>
               
               {showMenu && (
                 <div className={`absolute right-0 top-8 w-32 rounded-md shadow-lg border z-50 ${
                   isDarkMode 
                     ? 'bg-slate-800 border-slate-700' 
                     : 'bg-white border-gray-200'
                 }`}>
                   <button
                     onClick={() => {
                       setShowSettings(!showSettings);
                       setShowMenu(false);
                     }}
                     className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                       isDarkMode 
                         ? 'text-slate-300 hover:bg-slate-700' 
                         : 'text-gray-700 hover:bg-gray-50'
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
       <div className="px-4 py-3">
         <p className={`text-xs leading-relaxed ${
           isDarkMode ? 'text-slate-400' : 'text-gray-600'
         }`}>
           {data.description || getNodeDescription()}
         </p>

         {/* Settings panel */}
         {showSettings && (
           <div className={`mt-3 p-3 rounded border transition-all ${
             isDarkMode 
               ? 'bg-slate-700/30 border-slate-600/50' 
               : 'bg-gray-50/50 border-gray-200/50'
           }`}>
             <h4 className={`text-xs font-medium mb-2 ${
               isDarkMode ? 'text-slate-300' : 'text-gray-700'
             }`}>
               Node Configuration
             </h4>
             
             <div className="space-y-2">
               <div className="flex items-center justify-between">
                 <label className={`text-xs ${
                   isDarkMode ? 'text-slate-400' : 'text-gray-600'
                 }`}>
                   Enabled:
                 </label>
                 <input
                   type="checkbox"
                   defaultChecked={nodeConfig.enabled !== false}
                   onChange={(e) => handleConfigUpdate({ enabled: e.target.checked })}
                   className="w-3 h-3 text-blue-500 rounded focus:ring-blue-400"
                 />
               </div>
               
               <div className="flex items-center justify-between">
                 <label className={`text-xs ${
                   isDarkMode ? 'text-slate-400' : 'text-gray-600'
                 }`}>
                   Timeout:
                 </label>
                 <input
                   type="number"
                   defaultValue={typeof nodeConfig.timeout === 'number' ? nodeConfig.timeout : 30}
                   onChange={(e) => handleConfigUpdate({ 
                     timeout: !isNaN(parseInt(e.target.value)) ? parseInt(e.target.value) : 30 
                   })}
                   min="1"
                   className={`w-16 px-2 py-1 text-xs rounded border ${
                     isDarkMode 
                       ? 'bg-slate-600 border-slate-500 text-white' 
                       : 'bg-white border-gray-300 text-gray-900'
                   } focus:outline-none focus:ring-1 focus:ring-blue-400`}
                 />
               </div>
             </div>
           </div>
         )}
       </div>

       {/* Connection handles - N8n style */}
       {hasInputHandle && (
         <div
           className={`absolute -left-2 top-1/2 w-3 h-3 rounded-full cursor-crosshair hover:scale-125 transition-all duration-200 border-2 ${
             isDarkMode ? 'border-slate-800' : 'border-white'
           }`}
           style={{ 
             transform: 'translateY(-50%)',
             backgroundColor: '#94a3b8'
           }}
           onMouseDown={(e) => handleConnectionStart(e, 'input')}
           onMouseEnter={() => handleConnectionEnd('input')}
           title="Input"
         >
           <ArrowLeft className="w-2 h-2 text-white absolute top-0.5 left-0.5" style={{ fontSize: '8px' }} />
         </div>
       )}
       
       {hasOutputHandle && (
         <div
           className={`absolute -right-2 top-1/2 w-3 h-3 rounded-full cursor-crosshair hover:scale-125 transition-all duration-200 border-2 ${
             isDarkMode ? 'border-slate-800' : 'border-white'
           }`}
           style={{ 
             transform: 'translateY(-50%)',
             backgroundColor: '#94a3b8'
           }}
           onMouseDown={(e) => handleConnectionStart(e, 'output')}
           title="Output"
         >
           <ArrowRight className="w-2 h-2 text-white absolute top-0.5 left-0.5" style={{ fontSize: '8px' }} />
         </div>
       )}
     </div>
   </div>
 );
}