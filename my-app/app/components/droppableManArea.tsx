import ReactFlow, {
    Controls,
    Background,
    BackgroundVariant,
    NodeTypes,
    ReactFlowInstance,
    OnNodesChange,
    OnEdgesChange,
    OnConnect
} from 'reactflow'
import { useDroppable } from '@dnd-kit/core';
import { useState, useRef, useCallback } from 'react';
import CustomNode from './customNode'
import {DroppableMainAreaProps} from '@/app/types/mainArea';

const nodeTypes: NodeTypes = {
    custom: CustomNode,
};


export default function DroppableMainArea({ 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange, 
  onConnect, 
  onNodesDelete,
  onNodeClick,
  onPaneClick,
  nodeTypes,
  onDrop 
}: DroppableMainAreaProps) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (reactFlowWrapper.current) {
            const bounds = reactFlowWrapper.current.getBoundingClientRect();
            setMousePosition({
                x: e.clientX - bounds.left,
                y: e.clientY - bounds.top,
            });
        }
    }, []);

    const { isOver, setNodeRef } = useDroppable({
        id: 'main-area',
        data: {
            getDropPosition: () => {
                if (reactFlowInstance && reactFlowWrapper.current) {
                    const position = reactFlowInstance.project({
                        x: mousePosition.x,
                        y: mousePosition.y,
                    });
                    return position;
                }
                return mousePosition;
            }
        }
    });

    return (
        <div
            ref={setNodeRef}
            className={`flex-1 min-h-screen relative transition-colors duration-200 
          bg-gradient-to-br from-slate-50 to-slate-100 ${isOver ? 'bg-blue-50' : ''}`}
            onMouseMove={handleMouseMove}
        >
            <div ref={reactFlowWrapper} className="w-full h-200">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodesDelete={onNodesDelete}
                    onInit={setReactFlowInstance}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    nodeTypes={nodeTypes}
                    fitView
                    className="bg-transparent"
                    connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 3 }}
                    defaultEdgeOptions={{
                        style: { stroke: '#3b82f6', strokeWidth: 2 ,borderRadius : '50%'},
                        type: 'default',
                    }}
                >
                    <Controls
                        className="bg-white border border-slate-200 rounded-lg shadow-lg"
                    />
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={20}
                        size={1}
                        color="#e2e8f0"
                    />
                </ReactFlow>
            </div>
        </div>
    );
}