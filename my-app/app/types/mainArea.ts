import {Node, Edge,} from 'reactflow'

export interface DroppableMainAreaProps {
    nodes: Node[];
    edges: Edge[];
    onNodesChange: any;
    onEdgesChange: any;
    onConnect: any;
    onDrop?: (position: { x: number, y: number }) => void;
    onNodesDelete: any
}
