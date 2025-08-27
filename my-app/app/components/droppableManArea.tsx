import ReactFlow, {
    Controls,
    Background,
    BackgroundVariant,
    Node, Edge,
    NodeTypes,
    useReactFlow,
    ReactFlowInstance,

} from 'reactflow'
import { useDroppable } from '@dnd-kit/core';
import { useState, useRef, useCallback, useEffect } from 'react';
import CustomNode from '@/app/components/customNode'


interface DroppableMainAreaProps {
    nodes: Node[];
    edges: Edge[];
    onNodesChange: any;
    onEdgesChange: any;
    onConnect: any;
    onDrop?: (position: { x: number, y: number }) => void;
}

const nodeTypes: NodeTypes = {
    custom: CustomNode,
};

export default function DroppableMainArea({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onDrop }: DroppableMainAreaProps) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

    // Track mouse position over the ReactFlow area
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
            // Pass the current mouse position and ReactFlow instance to the drop handler
            getDropPosition: () => {
                if (reactFlowInstance && reactFlowWrapper.current) {
                    // Convert screen coordinates to ReactFlow coordinates
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
            <div ref={reactFlowWrapper} className="w-full h-full">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance}
                    nodeTypes={nodeTypes}
                    fitView
                    className="bg-transparent"
                    connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
                    defaultEdgeOptions={{
                        style: { stroke: '#3b82f6', strokeWidth: 2 },
                        type: 'smoothstep',
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