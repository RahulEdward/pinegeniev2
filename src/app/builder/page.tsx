'use client';

import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import Canvas from './ui/canvas';
import Toolbar from './ui/toolbar';
import { Toaster } from 'react-hot-toast';
import useBuilderStore from './builder-state';
import { initialNodes, initialEdges } from './canvas-config';
import { useEffect } from 'react';

export default function BuilderPage() {
  // Get state setters from Zustand store
  const { setNodes, setEdges } = useBuilderStore();
  
  // Initialize nodes and edges from config
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [setNodes, setEdges]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <ReactFlowProvider>
        <Toolbar />
        <Canvas />
      </ReactFlowProvider>
      <Toaster position="bottom-right" />
    </div>
  );
}
