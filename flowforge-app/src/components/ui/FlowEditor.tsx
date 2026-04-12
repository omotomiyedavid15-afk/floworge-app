"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  Node,
  Edge,
  Connection,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ScreenNode from "./ScreenNode";

const nodeTypes = {
  screen: ScreenNode,
};

const initialNodes: Node[] = [
  {
    id: "node-1",
    type: "screen",
    data: { 
      label: "Login Screen",
      imageUrl: "https://placehold.co/400x200/141414/ededed?text=Login+Screen" 
    },
    position: { x: 100, y: 100 },
  },
  {
    id: "node-2",
    type: "screen",
    data: { 
      label: "Dashboard",
      imageUrl: "https://placehold.co/400x200/141414/ededed?text=Dashboard" 
    },
    position: { x: 450, y: 100 },
  },
  {
    id: "node-3",
    type: "screen",
    data: { 
      label: "Onboarding",
      imageUrl: "https://placehold.co/400x200/141414/ededed?text=Onboarding" 
    },
    position: { x: 450, y: 300 },
  },
];

const initialEdges: Edge[] = [
  { 
    id: "e1-2", 
    source: "node-1", 
    target: "node-2", 
    label: "Success",
    animated: true,
    style: { stroke: "#18e299", strokeWidth: 2 },
    labelStyle: { fill: "#888888", fontSize: 10, fontWeight: 500 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#18e299",
    },
  },
  { 
    id: "e1-3", 
    source: "node-1", 
    target: "node-3", 
    label: "First Time",
    style: { stroke: "rgba(255,255,255,0.1)", strokeWidth: 2 },
    labelStyle: { fill: "#888888", fontSize: 10, fontWeight: 500 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "rgba(255,255,255,0.1)",
    },
  },
];

export default function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      animated: true,
      style: { stroke: "#18e299", strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#18e299",
      },
    }, eds)),
    [setEdges]
  );

  const onAddNode = useCallback(() => {
    const id = `node-${Date.now()}`;
    const newNode: Node = {
      id,
      type: "screen",
      data: { label: "New Screen", imageUrl: null },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  return (
    <div className="w-full h-full bg-[#0d0d0d]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        colorMode="dark"
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
      >
        <Background color="#222" gap={20} size={1} />
        <Controls className="!bg-[#141414] !border-white/10 !fill-[#ededed]" />
        <MiniMap 
          nodeColor="#18e299"
          maskColor="rgba(0,0,0,0.7)"
          style={{ backgroundColor: "#141414", border: "1px solid rgba(255,255,255,0.1)" }}
        />
        
        <Panel position="top-right" className="bg-[#141414]/90 backdrop-blur-md p-3 border border-white/10 rounded-xl shadow-2xl">
          <div className="flex flex-col gap-3 min-w-[160px]">
            <div className="flex items-center justify-between">
              <span className="text-[#888888] text-[9px] font-mono uppercase tracking-[0.1em]">
                Flow Controls
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#18e299] animate-pulse" />
            </div>
            
            <div className="flex flex-col gap-2">
              <button 
                onClick={onAddNode}
                className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 text-[#ededed] text-[11px] font-medium rounded-lg transition-all border border-white/5 flex items-center gap-2"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add Screen Node
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button className="px-2 py-1.5 bg-white/5 hover:bg-white/10 text-[#888888] hover:text-[#ededed] text-[10px] rounded-lg transition-colors border border-white/5">
                  Auto Layout
                </button>
                <button className="px-2 py-1.5 bg-[#18e299] text-[#0d0d0d] text-[10px] font-bold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Save Flow
                </button>
              </div>
            </div>
            
            <div className="pt-2 border-t border-white/5">
              <p className="text-[9px] text-[#555] leading-relaxed">
                Tip: Drag from green handles to connect screens. Double click to edit labels.
              </p>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
