import { Node, Edge, OnNodesChange, OnEdgesChange, OnConnect, NodeTypes } from 'reactflow';

export interface DroppableMainAreaProps {
    nodes: Node[];
    edges: Edge[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    onNodesDelete: (nodes: Node[]) => void;
    onNodeClick?: (event: React.MouseEvent, node: Node) => void;
    onPaneClick?: () => void;
    nodeTypes: NodeTypes;
    onDrop: () => void;
}