// app/page.tsx
'use client'
import React, { useState, useCallback, useRef } from "react";
import { DndContext, DragOverlay, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
  ReactFlowProvider,
  MiniMap,
  Background,
  BackgroundVariant,
  NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';

// Components
import Sidenav from '@/app/components/sidenav';
import DroppableMainArea from "./components/droppableManArea";
import NodeInspector from "./components/nodeInspector";
import VisualizationPanel from "./components/visualizations/visualizationPanel";
import Toolbar from "./components/toolbar";
import CustomNode from "./components/customNode"; // Import the custom node component

import { ToolItem } from "./types/toolItem";
import { getAllTools } from "./data/allTools";

// Register custom node types
const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

export default function Home() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeCounter, setNodeCounter] = useState(0);

  // UI state
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showNodeInspector, setShowNodeInspector] = useState(false);
  const [nodeInspectorPosition, setNodeInspectorPosition] = useState({ x: 0, y: 0 });
  const [visualizationNode, setVisualizationNode] = useState<{ nodeId: string; type: string; data: any[] } | null>(null);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  const logIdCounter = useRef(0);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = addEdge(params, edges);
      setEdges(newEdge);
    },
    [setEdges, edges]
  );

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      let remainingNodes: Node[] = [...nodes];
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, remainingNodes, acc);
          const outgoers = getOutgoers(node, remainingNodes, acc);
          const connectedEdges = getConnectedEdges([node], acc);

          const remainingEdges = acc.filter((edge) => !connectedEdges.includes(edge));
          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `${source}->${target}`,
              source,
              target,
            })),
          );

          remainingNodes = remainingNodes.filter((rn) => rn.id !== node.id);
          return [...remainingEdges, ...createdEdges];
        }, edges),
      );
      setNodes(remainingNodes);

      if (selectedNode && deleted.some(node => node.id === selectedNode.id)) {
        setSelectedNode(null);
        setShowNodeInspector(false);
      }
    },
    [nodes, edges, setNodes, setEdges, selectedNode]
  );

  const updateNode = useCallback((nodeId: string, newData: any) => {
    setNodes(prevNodes =>
      prevNodes.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  }, [setNodes]);

  const executeNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    updateNode(nodeId, { status: 'running', progress: 0 });

    // Simulate execution progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);

        const success = Math.random() > 0.2;
        updateNode(nodeId, {
          status: success ? 'success' : 'error',
          progress: 100,
          results: success ? { data: 'mock results' } : null,
          error: success ? null : 'Execution failed: Sample error message'
        });

        if (success && ['scatter-plot', 'box-plot', 'line-plot', 'bar-plot'].includes(node.data.toolId)) {
          setVisualizationNode({
            nodeId,
            type: node.data.toolId,
            data: generateMockData(node.data.toolId)
          });
        }
      } else {
        updateNode(nodeId, { progress });
      }
    }, 100);
  }, [nodes, updateNode]);

  const generateMockData = (type: string) => {
    const data = [];
    for (let i = 0; i < 100; i++) {
      data.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        value: Math.random() * 50 + 10
      });
    }
    return data;
  };

  // Handle node click to show inspector
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    // Get the node's screen position more accurately
    const nodeElement = event.currentTarget as HTMLElement;
    const rect = nodeElement.getBoundingClientRect();
    
    // Calculate center position of the node
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top
    };

    // Close any existing inspector first
    if (showNodeInspector && selectedNode?.id === node.id) {
      setShowNodeInspector(false);
      setSelectedNode(null);
      return;
    }

    setSelectedNode(node);
    setNodeInspectorPosition(position);
    setShowNodeInspector(true);
  }, [showNodeInspector, selectedNode]);

  // Handle ReactFlow's built-in node click (for selection)
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    // This is for ReactFlow's built-in selection, we'll use our custom handler
    handleNodeClick(event, node);
  }, [handleNodeClick]);

  const runWorkflow = useCallback(() => {
    setIsWorkflowRunning(true);

    nodes.forEach(node => {
      updateNode(node.id, { status: 'idle', progress: 0, error: null });
    });

    let delay = 0;
    nodes.forEach(node => {
      setTimeout(() => {
        executeNode(node.id);
      }, delay);
      delay += 500; 
    });

    setTimeout(() => {
      setIsWorkflowRunning(false);
    }, delay + 3000);
  }, [nodes, executeNode, updateNode]);

  const stopWorkflow = useCallback(() => {
    setIsWorkflowRunning(false);

    // Reset all running nodes
    nodes.forEach(node => {
      if (node.data.status === 'running' || node.data.status === 'queued') {
        updateNode(node.id, { status: 'idle', progress: 0 });
      }
    });
  }, [nodes, updateNode]);

  const loadWorkflow = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    setNodes(newNodes);
    setEdges(newEdges);
    setSelectedNode(null);
    setShowNodeInspector(false);
    setVisualizationNode(null);
  }, [setNodes, setEdges]);

  const duplicateNodes = useCallback(() => {
    const selectedNodes = nodes.filter(node => node.selected);
    if (selectedNodes.length === 0) return;

    const newNodes: Node[] = [];
    selectedNodes.forEach(node => {
      const newNodeId = `${node.data.toolId}-${nodeCounter + newNodes.length}`;
      const newNode: Node = {
        ...node,
        id: newNodeId,
        position: {
          x: node.position.x + 150,
          y: node.position.y + 50
        },
        data: {
          ...node.data,
          status: 'idle',
          progress: 0,
          results: null,
          error: null
        },
        selected: false
      };
      newNodes.push(newNode);
    });

    setNodes(prev => [...prev, ...newNodes]);
    setNodeCounter(prev => prev + newNodes.length);
  }, [nodes, nodeCounter, setNodes]);

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

        const dropPosition = over.data.current?.getDropPosition?.() || {
          x: Math.max(50, Math.random() * 400),
          y: Math.max(50, Math.random() * 300)
        };

        const newNode: Node = {
          id: newNodeId,
          type: 'custom',
          position: snapToGrid ? {
            x: Math.round(dropPosition.x / 20) * 20,
            y: Math.round(dropPosition.y / 20) * 20
          } : dropPosition,
          data: {
            label: toolData.name,
            icon: toolData.icon,
            toolId: toolData.id,
            status: 'idle',
            parameters: {},
            onExecute: () => executeNode(newNodeId),
            onClick: (event: React.MouseEvent) => handleNodeClick(event, newNode)
          },
          draggable: true,
        };

        setNodes(prev => [...prev, newNode]);
      }
    }

    setActiveId(null);
  };

  // Close inspector when clicking outside
  const handlePaneClick = useCallback(() => {
    if (showNodeInspector) {
      setShowNodeInspector(false);
      setSelectedNode(null);
    }
  }, [showNodeInspector]);

  const activeTool = activeId ? getAllTools().find(tool => tool.id === activeId) : null;

  return (
    <ReactFlowProvider>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex h-screen overflow-hidden">
          {/* Toolbar */}
          <Toolbar
            nodes={nodes}
            edges={edges}
            onLoadWorkflow={loadWorkflow}
            onRunWorkflow={runWorkflow}
            onStopWorkflow={stopWorkflow}
            isWorkflowRunning={isWorkflowRunning}
            snapToGrid={snapToGrid}
            onToggleSnapToGrid={() => setSnapToGrid(prev => !prev)}
            showMinimap={showMinimap}
            onToggleMinimap={() => setShowMinimap(prev => !prev)}
            onShowSettings={() => setShowKeyboardHelp(true)}
          />

          <div className="flex-1 flex pt-16">
            <Sidenav />

            <div className="flex-1 relative main-area">
              <DroppableMainArea
                nodes={nodes.map(node => ({
                  ...node,
                  data: {
                    ...node.data,
                    onClick: (event: React.MouseEvent) => handleNodeClick(event, node)
                  }
                }))}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodesDelete={onNodesDelete}
                onNodeClick={onNodeClick}
                onPaneClick={handlePaneClick}
                nodeTypes={nodeTypes}
                onDrop={() => { }}
              />

              {showMinimap && (
                <MiniMap
                  className="!absolute !bottom-4 !right-4 !z-10 !w-48 !h-32"
                  nodeColor="#3b82f6"
                  maskColor="rgba(0, 0, 0, 0.1)"
                />
              )}

              {snapToGrid && (
                <Background
                  variant={BackgroundVariant.Lines}
                  gap={20}
                  size={1}
                  color="#e2e8f0"
                  className="!absolute !inset-0 !z-0"
                />
              )}
            </div>
          </div>

          {showNodeInspector && selectedNode && (
            <NodeInspector
              selectedNode={selectedNode}
              onClose={() => {
                setShowNodeInspector(false);
                setSelectedNode(null);
              }}
              onUpdateNode={updateNode}
              onExecuteNode={executeNode}
              position={nodeInspectorPosition}
            />
          )}

          {visualizationNode && (
            <VisualizationPanel
              nodeId={visualizationNode.nodeId}
              nodeData={nodes.find(n => n.id === visualizationNode.nodeId)?.data}
              visualizationType={visualizationNode.type}
              data={visualizationNode.data}
              onClose={() => setVisualizationNode(null)}
            />
          )}

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
        </div>
      </DndContext>
    </ReactFlowProvider>
  );
}