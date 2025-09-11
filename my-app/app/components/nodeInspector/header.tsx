// components/NodeInspector/Header.tsx
import React from 'react';
import { X, Eye, EyeOff, Link } from 'lucide-react';
import { Node } from 'reactflow';

interface HeaderProps {
  selectedNode: Node;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  onClose: () => void;
  shouldShowDetails: boolean;
  hasIncomingEdges: boolean;
  fileData: any[];
}

const Header: React.FC<HeaderProps> = ({
  selectedNode,
  showPreview,
  setShowPreview,
  onClose,
  shouldShowDetails,
  hasIncomingEdges,
  fileData
}) => {
  const toolId = selectedNode.data.toolId;
  const isVisualizationNode = ['scatter-plot', 'line-plot', 'bar-plot', 'box-plot'].includes(toolId);

  return (
    <div className="px-3 py-2 border-b border-slate-200 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-white text-lg">
            {selectedNode.data.icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white truncate max-w-32">
              {selectedNode.data.label}
            </h3>
            <p className="text-blue-100 text-xs opacity-90">
              {selectedNode.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {shouldShowDetails && hasIncomingEdges && (
            <div className="text-white mr-1" title="Connected">
              <Link size={12} />
            </div>
          )}
          {shouldShowDetails && (fileData.length > 0 || isVisualizationNode) && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-white hover:text-blue-100 transition-colors p-1 hover:bg-white hover:bg-opacity-20 rounded"
              title={showPreview ? 'Hide Preview' : 'Show Preview'}
            >
              {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          )}
          <button
            onClick={onClose}
            className="text-white hover:text-blue-100 transition-colors p-1 hover:bg-white hover:bg-opacity-20 rounded"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;