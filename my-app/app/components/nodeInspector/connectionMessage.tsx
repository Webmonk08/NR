// components/NodeInspector/ConnectionMessage.tsx
import React from 'react';
import { CheckCircle, Link2Off } from 'lucide-react';

interface ConnectionMessageProps {
  isSourceNode: boolean;
  hasIncomingEdges: boolean;
  fileData: any[];
}

const ConnectionMessage: React.FC<ConnectionMessageProps> = ({
  isSourceNode,
  hasIncomingEdges,
  fileData
}) => {
  if (isSourceNode) {
    return (
      <div className="px-3 py-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="text-blue-500">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="text-sm font-medium text-slate-700">Source Node</div>
          <div className="text-xs text-slate-500 text-center">
            This node provides data to the workflow. 
            {fileData.length > 0 ? ` Currently loaded: ${fileData.length} rows` : ' Upload a file to get started.'}
          </div>
        </div>
      </div>
    );
  }

  if (!hasIncomingEdges) {
    return (
      <div className="px-3 py-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="text-orange-500">
            <Link2Off className="w-8 h-8" />
          </div>
          <div className="text-sm font-medium text-slate-700">No Input Connection</div>
          <div className="text-xs text-slate-500 text-center">
            Connect this node to a data source or upstream node to see detailed configuration options.
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ConnectionMessage;