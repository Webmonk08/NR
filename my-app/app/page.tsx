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

import DroppableMainArea from "./components/droppableManArea";
import NodeInspector from "./components/nodeInspector/index";
import VisualizationPanel from "./components/visualizations/visualizationPanel";
import Toolbar from "./components/toolbar";
import CustomNode from "./components/customNode";
import { ToolItem } from "./types/toolItem";
import { getAllTools } from "./data/allTools";
import { NodeRelationshipService } from "@/app/services/nodeRelationshipservice";
import dynamic from 'next/dynamic';


const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const Sidenav = dynamic(() => import('@/app/components/sidenav'), {
  ssr: false,
});


export default function Home() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeCounter, setNodeCounter] = useState(0);

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showNodeInspector, setShowNodeInspector] = useState(false);
  const [nodeInspectorPosition, setNodeInspectorPosition] = useState({ x: 0, y: 0 });
  const [visualizationNode, setVisualizationNode] = useState<{ nodeId: string; type: string; data: any[] } | null>(null);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);


  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      
      // Update node relationships when edges change
      const updatedNodes = NodeRelationshipService.updateNodeRelationships(nodes, newEdges);
      setNodes(updatedNodes);
      
      // Propagate data changes to connected nodes
      if (params.source) {
        const propagatedNodes = NodeRelationshipService.propagateDataChanges(params.source, updatedNodes, newEdges);
        setNodes(propagatedNodes);
      }
    },
    [setEdges, edges, nodes, setNodes]
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

      // Update relationships for remaining nodes
      const updatedNodes = NodeRelationshipService.updateNodeRelationships(remainingNodes, edges);
      setNodes(updatedNodes);

      if (selectedNode && deleted.some(node => node.id === selectedNode.id)) {
        setSelectedNode(null);
        setShowNodeInspector(false);
      }
    },
    [nodes, edges, setNodes, setEdges, selectedNode]
  );

  const updateNode = useCallback((nodeId: string, newData: any) => {
    const updatedNodes = nodes.map(node =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, ...newData } }
        : node
    );
    
    // Propagate changes to child nodes
    const finalNodes = NodeRelationshipService.propagateDataChanges(nodeId, updatedNodes, edges);
    setNodes(finalNodes);
  }, [setNodes, nodes, edges]);

  const generateMockFileData = (): any[] => {
    return Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      value: Math.random() * 100,
      category: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      amount: Math.floor(Math.random() * 1000),
      date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]
    }));
  };

  const processNodeData = (node: Node, inputData: any[]): any[] => {
    const { toolId, parameters } = node.data;

    switch (toolId) {
      case 'file':
      case 'csv':
        return generateMockFileData();

      case 'sampler':
        const sampleSize = parameters?.sampleSize || 100;
        return inputData.slice(0, Math.min(sampleSize, inputData.length));

      case 'select-columns':
        if (parameters?.columns) {
          const selectedColumns = parameters.columns.split(',').map((col: string) => col.trim());
          return inputData.map(row => {
            const newRow: any = {};
            selectedColumns.forEach(col => {
              if (row[col] !== undefined) {
                newRow[col] = row[col];
              }
            });
            return newRow;
          });
        }
        return inputData;

      case 'select-rows':
        const start = parameters?.startRow || 0;
        const end = parameters?.endRow || inputData.length;
        return inputData.slice(start, end);

      case 'filter-more':
        if (parameters?.column && parameters?.operator && parameters?.value) {
          return inputData.filter(row => {
            const cellValue = row[parameters.column];
            const filterValue = parameters.value;

            switch (parameters.operator) {
              case '==': return cellValue == filterValue;
              case '!=': return cellValue != filterValue;
              case '>': return Number(cellValue) > Number(filterValue);
              case '<': return Number(cellValue) < Number(filterValue);
              case '>=': return Number(cellValue) >= Number(filterValue);
              case '<=': return Number(cellValue) <= Number(filterValue);
              case 'contains': return String(cellValue).includes(String(filterValue));
              case 'startswith': return String(cellValue).startsWith(String(filterValue));
              default: return true;
            }
          });
        }
        return inputData;

      default:
        return inputData;
    }
  };

  const getOutputColumns = (node: Node, inputData: any[]): string[] => {
    const { toolId, parameters } = node.data;

    if (inputData.length === 0) return [];

    switch (toolId) {
      case 'select-columns':
        if (parameters?.columns) {
          return parameters.columns.split(',').map((col: string) => col.trim());
        }
        return Object.keys(inputData[0]);

      default:
        return Object.keys(inputData[0]);
    }
  };

  const executeNode = useCallback((nodeId: string) => {
    const node = nodes.find((n: any) => n.id === nodeId);
    if (!node) return;

    updateNode(nodeId, { status: 'running', progress: 0 });

    // Get input data from parent nodes or node's own file data
    const inputData = NodeRelationshipService.getNodeInputData(nodeId, nodes, edges);

    // Process the data based on node type
    const outputData = processNodeData(node, inputData);
    const outputColumns = getOutputColumns(node, outputData);

    // Simulate execution progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);

        const success = Math.random() > 0.2;
        
        // Update node with processed data
        const nodeUpdateData = {
          status: success ? 'success' : 'error',
          progress: 100,
          processedData: success ? outputData : null,
          processedColumns: success ? outputColumns : null,
          outputData: success ? outputData : null,
          outputColumns: success ? outputColumns : null,
          results: success ? { rowCount: outputData.length, columns: outputColumns } : null,
          error: success ? null : 'Execution failed: Sample error message'
        };

        // Use NodeRelationshipService to update and propagate
        if (success) {
          const updatedNodes = NodeRelationshipService.updateNodeProcessedData(
            nodeId, 
            outputData, 
            outputColumns, 
            nodes, 
            edges
          );
          setNodes(updatedNodes);
        } else {
          updateNode(nodeId, nodeUpdateData);
        }

        if (success && ['scatter-plot', 'box-plot', 'line-plot', 'bar-plot'].includes(node.data.toolId)) {
          setVisualizationNode({
            nodeId,
            type: node.data.toolId,
            data: outputData
          });
        }
      } else {
        updateNode(nodeId, { progress });
      }
    }, 100);
  }, [nodes, edges, updateNode]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
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

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
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

    if (over) {
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
            parentNodes: [],
            childNodes: [],
            inputData: [],
            outputData: [],
            outputColumns: [],
            onExecute: () => executeNode(newNodeId),
            onClick: (event: React.MouseEvent) => handleNodeClick(event, newNode)
          },
          draggable: true,
        };

        setNodes(prev => [...prev, newNode]);
        
        // If it's a data node (file/csv), show file upload modal
        if (['file', 'csv'].includes(toolData.id)) {
          // We'll handle this in the node inspector when the node is selected
        }
      }
    }

    setActiveId(null);
  };

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
              nodeData={NodeRelationshipService.getNodeInputData(selectedNode.id, nodes, edges)}
              availableColumns={NodeRelationshipService.getAvailableColumns(selectedNode.id, nodes, edges)}
              edges={edges}
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