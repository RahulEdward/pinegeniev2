import { create } from 'zustand';
import { 
  Node, 
  Edge, 
  NodeChange, 
  EdgeChange, 
  Connection,
  addEdge as addEdgeToFlow,
  applyNodeChanges, 
  applyEdgeChanges,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
} from 'reactflow';
import { CustomNodeData, initialNodes, initialEdges } from './canvas-config';

export interface BuilderState {
  // State
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
  selectedNode: string | null;
  
  // Actions
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  updateNodeData: (nodeId: string, data: Partial<CustomNodeData>) => void;
  setSelectedNode: (nodeId: string | null) => void;
  addNode: (node: Node<CustomNodeData>) => void;
  addEdge: (edge: Edge | Connection) => void;
  setNodes: (nodes: Node<CustomNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  reset: () => void;
}

const useBuilderStore = create<BuilderState>((set, get) => ({
  // Initial state
  nodes: [...initialNodes],
  edges: [...initialEdges],
  selectedNode: null,
  
  // Actions
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  
  onConnect: (connection: Connection) => {
    set({
      edges: addEdgeToFlow(
        { ...connection, animated: true, style: { stroke: '#94a3b8' } },
        get().edges
      ),
    });
  },
  
  updateNodeData: (nodeId: string, data: Partial<CustomNodeData>) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId 
          ? { 
              ...node, 
              data: { ...node.data, ...data },
              // Update the node's type if it's being changed
              ...(data.type ? { type: data.type } : {})
            } 
          : node
      ),
    });
  },
  
  setSelectedNode: (nodeId: string | null) => {
    set({ selectedNode: nodeId });
  },
  
  addNode: (node: Node<CustomNodeData>) => {
    set((state) => ({
      nodes: [...state.nodes, node],
    }));
  },
  
  addEdge: (edge: Edge | Connection) => {
    set((state) => ({
      edges: addEdgeToFlow(
        { 
          ...edge, 
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#94a3b8' } 
        }, 
        state.edges
      ),
    }));
  },
  
  setNodes: (nodes: Node<CustomNodeData>[]) => {
    set({ nodes });
  },
  
  setEdges: (edges: Edge[]) => {
    set({ edges });
  },
  
  reset: () => {
    set({
      nodes: [...initialNodes],
      edges: [...initialEdges],
      selectedNode: null,
    });
  },
}));

export default useBuilderStore;
