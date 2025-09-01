import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface CustomNodeData {
  label: string;
  icon: string;
  toolId: string;
  status: 'idle' | 'running' | 'success' | 'error';
  progress?: number;
  onExecute: () => void;
  onClick: (event: React.MouseEvent) => void;
}

const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({ data, selected }) => {
  const getStatusColor = () => {
    switch (data.status) {
      case 'running': return 'border-yellow-400 bg-yellow-50';
      case 'success': return 'border-green-400 bg-green-50';
      case 'error': return 'border-red-400 bg-red-50';
      default: return 'border-slate-300 bg-white';
    }
  };

  const handleNodeClick = (event: React.MouseEvent) => {
    // Prevent event from propagating to ReactFlow's node selection
    event.stopPropagation();
    data.onClick(event);
  };

  return (
    <div 
      className={`
        relative px-4 py-3 min-w-32 rounded-lg border-2 transition-all duration-200 cursor-pointer
        ${getStatusColor()}
        ${selected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
        hover:shadow-md hover:scale-105
      `}
      onClick={handleNodeClick}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
        style={{ left: -8 }}
      />
      
      {/* Node Content */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-2xl">
          {data.icon}
        </div>
        <div className="text-sm font-medium text-center text-slate-700 leading-tight">
          {data.label}
        </div>
        
        {/* Status indicator */}
        {data.status === 'running' && data.progress !== undefined && (
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${data.progress}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-green-500 !border-2 !border-white"
        style={{ right: -8 }}
      />
    </div>
  );
};

export default CustomNode;