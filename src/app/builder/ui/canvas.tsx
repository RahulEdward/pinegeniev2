'use client';

import { useEffect, useRef } from 'react';
import ReactFlow, {
  Controls,
  Background,
  BackgroundVariant,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import useBuilderStore from '../builder-state';
import { defaultEdgeOptions, nodeTypes } from '../canvas-config';

function Flow() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect: onConnectHandler,
  } = useBuilderStore();
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();

  // Fit view when nodes change
  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => fitView({ padding: 0.2 }), 100);
    }
  }, [nodes.length, fitView]);

  return (
    <div className="h-full w-full bg-white dark:bg-gray-900" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnectHandler}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        nodesDraggable
        nodesConnectable
        elementsSelectable
        panOnScroll
        snapGrid={[10, 10]}
        snapToGrid={true}
        minZoom={0.1}
        maxZoom={2}
        className="dark:text-white"
      >
        <Controls className="dark:bg-gray-800 dark:text-white dark:border-gray-700" />
        <Background variant={BackgroundVariant.Dots} gap={10} size={0.8} color="#94a3b8" />
      </ReactFlow>
    </div>
  );
}

export default function Canvas() {
  return (
    <div className="h-[calc(100vh-64px)] w-full">
      <Flow />
    </div>
  );
}
