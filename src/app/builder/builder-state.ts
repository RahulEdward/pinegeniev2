/**
* Builder State Management - Zustand Store for Strategy Builder
* 
* This file contains:
* - Complete state management for visual strategy builder
* - Node and edge operations without ReactFlow dependency
* - Custom connection system with visual feedback
* - Theme management and canvas controls
* - Strategy persistence and export functionality
* - Undo/redo system for builder operations
*/

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Custom types without ReactFlow dependency
export interface NodeData {
 id: string;
 type: string;
 label: string;
 description?: string;
 config?: Record<string, unknown>;
 parameters?: Record<string, unknown>;
 [key: string]: unknown;
}

export interface NodePosition {
 x: number;
 y: number;
}

export interface BuilderNode {
 id: string;
 type: string;
 position: NodePosition;
 data: NodeData;
 selected?: boolean;
 dragging?: boolean;
 width?: number;
 height?: number;
 style?: React.CSSProperties;
}

export interface BuilderEdge {
 id: string;
 source: string;
 target: string;
 sourceHandle?: string;
 targetHandle?: string;
 animated?: boolean;
 style?: React.CSSProperties;
 type?: string;
}

export interface Connection {
 source: string;
 target: string;
 sourceHandle?: string;
 targetHandle?: string;
}

export interface BuilderState {
 // Core State
 nodes: BuilderNode[];
 edges: BuilderEdge[];
 selectedNode: string | null;
 
 // UI State
 zoom: number;
 canvasOffset: { x: number; y: number };
 isDarkMode: boolean;
 backgroundType: 'grid' | 'dots' | 'lines' | 'clean';
 
 // History for undo/redo
 history: {
   nodes: BuilderNode[];
   edges: BuilderEdge[];
 }[];
 historyIndex: number;
 
 // Loading/Saving State
 isSaving: boolean;
 isLoading: boolean;
 lastSaved: Date | null;
 
 // Node Operations
 addNode: (nodeTemplate: Partial<BuilderNode>) => void;
 updateNode: (id: string, updates: Partial<BuilderNode>) => void;
 updateNodeData: (id: string, data: Record<string, unknown>) => void;
 updateNodeConfig: (id: string, config: Record<string, unknown>) => void;
 deleteNode: (nodeId: string) => void;
 duplicateNode: (nodeId: string) => void;
 selectNode: (nodeId: string | null) => void;
 moveNode: (nodeId: string, position: NodePosition) => void;
 
 // Edge Operations
 addEdge: (connection: Connection) => void;
 deleteEdge: (edgeId: string) => void;
 updateEdge: (edgeId: string, updates: Partial<BuilderEdge>) => void;
 
 // Bulk Operations
 setNodes: (nodes: BuilderNode[]) => void;
 setEdges: (edges: BuilderEdge[]) => void;
 clearCanvas: () => void;
 
 // Canvas Controls
 setZoom: (zoom: number) => void;
 setCanvasOffset: (offset: { x: number; y: number }) => void;
 toggleTheme: () => void;
 setBackgroundType: (type: 'grid' | 'dots' | 'lines' | 'clean') => void;
 
 // Connection Handling
 onConnect: (connection: Connection) => void;
 
 // History Operations
 undo: () => void;
 redo: () => void;
 canUndo: () => boolean;
 canRedo: () => boolean;
 saveToHistory: () => void;
 
 // Strategy Operations
 saveStrategy: (name?: string) => Promise<void>;
 loadStrategy: (strategyData: Record<string, unknown>) => void;
 exportStrategy: () => Record<string, unknown>;
 reset: () => void;
 
 // Utility Functions
 getNodeById: (id: string) => BuilderNode | undefined;
 getEdgeById: (id: string) => BuilderEdge | undefined;
 getConnectedNodes: (nodeId: string) => BuilderNode[];
 validateConnection: (connection: Connection) => boolean;
}

// Initial state
const initialState = {
 nodes: [],
 edges: [],
 selectedNode: null,
 zoom: 1,
 canvasOffset: { x: 0, y: 0 },
 isDarkMode: true,
 backgroundType: 'grid' as const,
 history: [],
 historyIndex: -1,
 isSaving: false,
 isLoading: false,
 lastSaved: null,
};

const useBuilderStore = create<BuilderState>()(
 devtools(
   persist(
     (set, get) => ({
       ...initialState,
       
       // Node Operations
       addNode: (nodeTemplate) => {
         const state = get();
         const newNode: BuilderNode = {
           id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
           type: nodeTemplate.type || 'default',
           position: nodeTemplate.position || { 
             x: 100 + Math.random() * 200, 
             y: 100 + Math.random() * 200 
           },
           data: {
             id: nodeTemplate.id || `node_${Date.now()}`,
             type: nodeTemplate.type || 'default',
             label: nodeTemplate.data?.label || 'New Node',
             description: nodeTemplate.data?.description || '',
             config: nodeTemplate.data?.config || {},
             parameters: nodeTemplate.data?.parameters || {},
             ...nodeTemplate.data
           },
           ...nodeTemplate
         };
         
         set({
           nodes: [...state.nodes, newNode],
           selectedNode: newNode.id
         });
         
         state.saveToHistory();
       },
       
       updateNode: (nodeId, updates) => {
         const state = get();
         set({
           nodes: state.nodes.map(node =>
             node.id === nodeId 
               ? { 
                   ...node, 
                   ...updates,
                   data: updates.data ? { ...node.data, ...updates.data } : node.data
                 }
               : node
           )
         });
       },
       
       updateNodeData: (id, data) => {
         const state = get();
         set({
           nodes: state.nodes.map(node =>
             node.id === id 
               ? { ...node, data: { ...node.data, ...data } }
               : node
           )
         });
       },
       
       updateNodeConfig: (id, config) => {
         const state = get();
         set({
           nodes: state.nodes.map(node =>
             node.id === id 
               ? { ...node, data: { ...node.data, config: { ...node.data.config, ...config } } }
               : node
           )
         });
       },
       
       deleteNode: (nodeId) => {
         const state = get();
         set({
           nodes: state.nodes.filter(node => node.id !== nodeId),
           edges: state.edges.filter(edge => 
             edge.source !== nodeId && edge.target !== nodeId
           ),
           selectedNode: state.selectedNode === nodeId ? null : state.selectedNode
         });
         
         state.saveToHistory();
       },
       
       duplicateNode: (nodeId) => {
         const state = get();
         const nodeToDuplicate = state.nodes.find(node => node.id === nodeId);
         if (!nodeToDuplicate) return;
         
         const duplicatedNode: BuilderNode = {
           ...nodeToDuplicate,
           id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
           position: {
             x: nodeToDuplicate.position.x + 50,
             y: nodeToDuplicate.position.y + 50
           },
           data: {
             ...nodeToDuplicate.data,
             id: `node_${Date.now()}`,
             label: `${nodeToDuplicate.data.label} Copy`
           }
         };
         
         set({
           nodes: [...state.nodes, duplicatedNode],
           selectedNode: duplicatedNode.id
         });
         
         state.saveToHistory();
       },
       
       selectNode: (nodeId) => {
         set({ selectedNode: nodeId });
       },
       
       moveNode: (nodeId, position) => {
         const state = get();
         state.updateNode(nodeId, { position });
       },
       
       // Edge Operations
       addEdge: (connection) => {
         const state = get();
         
         // Validate connection
         if (!state.validateConnection(connection)) {
           console.warn('Invalid connection attempt:', connection);
           return;
         }
         
         // Check if connection already exists
         const existingEdge = state.edges.find(edge =>
           edge.source === connection.source && edge.target === connection.target
         );
         
         if (existingEdge) {
           console.warn('Connection already exists');
           return;
         }
         
         const newEdge: BuilderEdge = {
           id: `edge_${connection.source}_${connection.target}_${Date.now()}`,
           source: connection.source,
           target: connection.target,
           sourceHandle: connection.sourceHandle || 'output',
           targetHandle: connection.targetHandle || 'input',
           animated: true,
           style: { stroke: state.isDarkMode ? '#60a5fa' : '#3b82f6', strokeWidth: 2 },
           type: 'smoothstep'
         };
         
         set({
           edges: [...state.edges, newEdge]
         });
         
         state.saveToHistory();
       },
       
       deleteEdge: (edgeId) => {
         const state = get();
         set({
           edges: state.edges.filter(edge => edge.id !== edgeId)
         });
         
         state.saveToHistory();
       },
       
       updateEdge: (edgeId, updates) => {
         const state = get();
         set({
           edges: state.edges.map(edge =>
             edge.id === edgeId ? { ...edge, ...updates } : edge
           )
         });
       },
       
       // Bulk Operations
       setNodes: (nodes) => {
         set({ nodes });
         get().saveToHistory();
       },
       
       setEdges: (edges) => {
         set({ edges });
         get().saveToHistory();
       },
       
       clearCanvas: () => {
         set({
           nodes: [],
           edges: [],
           selectedNode: null
         });
         
         get().saveToHistory();
       },
       
       // Canvas Controls
       setZoom: (zoom) => {
         set({ zoom: Math.max(0.1, Math.min(3, zoom)) });
       },
       
       setCanvasOffset: (canvasOffset) => {
         set({ canvasOffset });
       },
       
       toggleTheme: () => {
         const state = get();
         set({ 
           isDarkMode: !state.isDarkMode,
           edges: state.edges.map(edge => ({
             ...edge,
             style: {
               ...edge.style,
               stroke: !state.isDarkMode ? '#60a5fa' : '#3b82f6'
             }
           }))
         });
       },
       
       setBackgroundType: (backgroundType) => {
         set({ backgroundType });
       },
       
       // Connection Handling
       onConnect: (connection) => {
         get().addEdge(connection);
       },
       
       // History Operations
       saveToHistory: () => {
         const state = get();
         const snapshot = {
           nodes: [...state.nodes],
           edges: [...state.edges]
         };
         
         const newHistory = state.history.slice(0, state.historyIndex + 1);
         newHistory.push(snapshot);
         
         // Limit history size
         const maxHistory = 50;
         if (newHistory.length > maxHistory) {
           newHistory.shift();
         }
         
         set({
           history: newHistory,
           historyIndex: newHistory.length - 1
         });
       },
       
       undo: () => {
         const state = get();
         if (state.canUndo()) {
           const newIndex = state.historyIndex - 1;
           const snapshot = state.history[newIndex];
           
           set({
             nodes: [...snapshot.nodes],
             edges: [...snapshot.edges],
             historyIndex: newIndex,
             selectedNode: null
           });
         }
       },
       
       redo: () => {
         const state = get();
         if (state.canRedo()) {
           const newIndex = state.historyIndex + 1;
           const snapshot = state.history[newIndex];
           
           set({
             nodes: [...snapshot.nodes],
             edges: [...snapshot.edges],
             historyIndex: newIndex,
             selectedNode: null
           });
         }
       },
       
       canUndo: () => {
         const state = get();
         return state.historyIndex > 0;
       },
       
       canRedo: () => {
         const state = get();
         return state.historyIndex < state.history.length - 1;
       },
       
       // Strategy Operations
       saveStrategy: async (name) => {
         const state = get();
         set({ isSaving: true });
         
         try {
           const strategyData = {
             name: name || `Strategy_${Date.now()}`,
             nodes: state.nodes,
             edges: state.edges,
             metadata: {
               createdAt: new Date().toISOString(),
               nodeCount: state.nodes.length,
               edgeCount: state.edges.length,
               zoom: state.zoom,
               canvasOffset: state.canvasOffset
             }
           };
           
           // Save to localStorage as backup
           localStorage.setItem('pinegenie_strategy_backup', JSON.stringify(strategyData));
           
           // In real implementation, save to backend
           await new Promise(resolve => setTimeout(resolve, 1000));
           
           set({ 
             lastSaved: new Date(),
             isSaving: false 
           });
           
           console.log('Strategy saved successfully');
         } catch (error) {
           console.error('Failed to save strategy:', error);
           set({ isSaving: false });
           throw error;
         }
       },
       
       loadStrategy: (strategyData: { nodes?: BuilderNode[]; edges?: BuilderEdge[]; metadata?: { zoom?: number; canvasOffset?: { x: number; y: number } } }) => {
         set({
           nodes: Array.isArray(strategyData?.nodes) ? strategyData.nodes : [],
           edges: Array.isArray(strategyData?.edges) ? strategyData.edges : [],
           selectedNode: null,
           zoom: typeof strategyData?.metadata?.zoom === 'number' ? strategyData.metadata.zoom : 1,
           canvasOffset: strategyData?.metadata?.canvasOffset && 
                        typeof strategyData.metadata.canvasOffset.x === 'number' && 
                        typeof strategyData.metadata.canvasOffset.y === 'number'
                      ? strategyData.metadata.canvasOffset 
                      : { x: 0, y: 0 }
         });
         
         get().saveToHistory();
       },
       
       exportStrategy: () => {
         const state = get();
         return {
           version: '1.0',
           strategy: {
             nodes: state.nodes,
             edges: state.edges,
             metadata: {
               exportedAt: new Date().toISOString(),
               nodeCount: state.nodes.length,
               edgeCount: state.edges.length,
               zoom: state.zoom,
               canvasOffset: state.canvasOffset,
               theme: state.isDarkMode ? 'dark' : 'light',
               backgroundType: state.backgroundType
             }
           }
         };
       },
       
       reset: () => {
         set({
           ...initialState,
           history: [],
           historyIndex: -1
         });
       },
       
       // Utility Functions
       getNodeById: (id) => {
         return get().nodes.find(node => node.id === id);
       },
       
       getEdgeById: (id) => {
         return get().edges.find(edge => edge.id === id);
       },
       
       getConnectedNodes: (nodeId) => {
         const state = get();
         const connectedNodeIds = new Set<string>();
         
         state.edges.forEach(edge => {
           if (edge.source === nodeId) {
             connectedNodeIds.add(edge.target);
           }
           if (edge.target === nodeId) {
             connectedNodeIds.add(edge.source);
           }
         });
         
         return state.nodes.filter(node => connectedNodeIds.has(node.id));
       },
       
       validateConnection: (connection) => {
         const state = get();
         
         // Basic validation
         if (!connection.source || !connection.target) return false;
         if (connection.source === connection.target) return false;
         
         // Check if nodes exist
         const sourceNode = state.getNodeById(connection.source);
         const targetNode = state.getNodeById(connection.target);
         if (!sourceNode || !targetNode) return false;
         
         // Check for circular dependencies (basic)
         const isCircular = (sourceId: string, targetId: string, visited = new Set<string>()): boolean => {
           if (visited.has(sourceId)) return true;
           visited.add(sourceId);
           
           const outgoingEdges = state.edges.filter(edge => edge.source === sourceId);
           for (const edge of outgoingEdges) {
             if (edge.target === targetId || isCircular(edge.target, targetId, visited)) {
               return true;
             }
           }
           
           return false;
         };
         
         return !isCircular(connection.target, connection.source);
       }
     }),
     {
       name: 'pinegenie-builder-storage',
       partialize: (state) => ({
         nodes: state.nodes,
         edges: state.edges,
         isDarkMode: state.isDarkMode,
         backgroundType: state.backgroundType,
         zoom: state.zoom,
         canvasOffset: state.canvasOffset
       })
     }
   ),
   {
     name: 'PineGenie Builder Store'
   }
 )
);

export default useBuilderStore;