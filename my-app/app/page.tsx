'use client'
import React, { useState, useCallback, } from "react";
import { DndContext, DragOverlay, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  Node,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Sidenav from '@/app/components/sidenav'
import { ToolItem, getAllTools } from "./data/allTools";
import DroppableMainArea from "./components/droppableManArea";

export default function Home() {

  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeCounter, setNodeCounter] = useState(0);


  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && over.id === 'main-area') {
      const toolData = active.data.current?.tool as ToolItem;
      if (toolData) {
        const newNodeId = `${toolData.id}-${nodeCounter}`;
        setNodeCounter(prev => prev + 1);

        // Create a new React Flow node
        const newNode: Node = {
          id: newNodeId,
          type: 'custom',
          position: {
            x: Math.max(50, Math.random() * 400),
            y: Math.max(50, Math.random() * 300)
          },
          data: {
            label: toolData.name,
            icon: toolData.icon,
            toolId: toolData.id
          },
          draggable: true,
        };

        setNodes(prev => [...prev, newNode]);
      }
    }
    console.log(nodes)

    setActiveId(null);
  };

  const activeTool = activeId ? getAllTools().find(tool => tool.id === activeId) : null;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen">
        <Sidenav />
        <DroppableMainArea
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
        />
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId && activeTool ? (
          <div className="p-3 rounded-lg bg-white shadow-xl border-2 border-blue-400 flex flex-col items-center gap-2 text-slate-700 opacity-90">
            <div className="text-slate-600">
              {activeTool.icon}
            </div>
            <span className="text-xs font-medium text-center">
              {activeTool.name}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}