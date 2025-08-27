import {  Handle,
    Position} from 'reactflow'

const CustomNode = ({ data }: { data: any }) => {
    return (
      <div className="bg-white rounded-lg shadow-lg border-2 border-slate-200 p-4 min-w-[120px] hover:shadow-xl transition-all duration-200 relative">
        {/* Input Handle - Left side */}
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          className="w-3 h-3 !bg-blue-500 !border-2 !border-white shadow-md hover:!bg-blue-600 transition-colors"
          style={{ left: '-6px' }}
        />
  
        {/* Output Handle - Right side */}
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="w-3 h-3 !bg-green-500 !border-2 !border-white shadow-md hover:!bg-green-600 transition-colors"
          style={{ right: '-6px' }}
        />
  
        <div className="flex flex-col items-center gap-2">
          <div className="text-slate-600 text-2xl">
            {data.icon}
          </div>
          <div className="text-sm font-semibold text-slate-800 text-center">
            {data.label}
          </div>
        </div>
      </div>
    );
  };

export default CustomNode;