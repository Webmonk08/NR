import ReactFlow, {
    Controls,
    Background,
    BackgroundVariant,
    Node, Edge,
    NodeTypes,

} from 'reactflow'
import { useDroppable } from '@dnd-kit/core';
import { useState, useRef } from 'react';
import CustomNode from '@/app/components/customNode'


interface DroppableMainAreaProps {
    nodes: Node[];
    edges: Edge[];
    onNodesChange: any;
    onEdgesChange: any;
    onConnect: any;
}

const nodeTypes: NodeTypes = {
    custom: CustomNode,
};

export default function DroppableMainArea({ nodes, edges, onNodesChange, onEdgesChange, onConnect }: DroppableMainAreaProps) {
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const offset = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        offset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - offset.current.x,
            y: e.clientY - offset.current.y,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };


    const { isOver, setNodeRef } = useDroppable({
        id: 'main-area',
    });

    return (
        <div
            ref={setNodeRef}
            className={`flex-1 min-h-screen relative transition-colors duration-200 
          bg-gradient-to-br from-slate-50 to-slate-100`}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
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
                <div
                    onMouseDown={handleMouseDown}
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={20}
                        size={1}
                        color="#e2e8f0"
                    />
                </div>
            </ReactFlow>
        </div>
    );
}