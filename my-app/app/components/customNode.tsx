import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Play, CheckCircle, AlertCircle, Loader, Users, Database } from 'lucide-react';

const CustomNode = memo(({ data, selected }: NodeProps) => {
  const getStatusColor = () => {
    switch (data.status) {
      case 'running': return 'border-yellow-400 bg-yellow-50';
      case 'success': return 'border-green-400 bg-green-50';
      case 'error': return 'border-red-400 bg-red-50';
      default: return 'border-slate-300 bg-white';
    }
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case 'running': return <Loader className="w-3 h-3 text-yellow-600 animate-spin" />;
      case 'success': return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'error': return <AlertCircle className="w-3 h-3 text-red-600" />;
      default: return <Play className="w-3 h-3 text-slate-400" />;
    }
  };

  const isSourceNode = ['file', 'csv'].includes(data.toolId);
  const hasParents = data.parentNodes && data.parentNodes.length > 0;
  const hasChildren = data.childNodes && data.childNodes.length > 0;

  return (
    <div
      className={`relative min-w-32 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
        getStatusColor()
      } ${selected ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
      onClick={data.onClick}
    >
      {/* Input Handle - only show if not a source node */}
      {!isSourceNode && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-blue-500 border-2 border-white"
          style={{ left: -6 }}
        />
      )}

      {/* Node Content */}
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="text-slate-600">
              {data.icon}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-800 truncate">
                {data.label}
              </div>
              <div className="text-xs text-slate-500">
                {data.toolId}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {getStatusIcon()}
          </div>
        </div>

        {/* Progress Bar */}
        {data.status === 'running' && data.progress !== undefined && (
          <div className="mb-2">
            <div className="w-full bg-slate-200 rounded-full h-1">
              <div
                className="bg-yellow-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${data.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Connection Info */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            {hasParents && (
              <div className="flex items-center gap-1" title={`${data.parentNodes.length} parent node(s)`}>
                <Database size={10} />
                <span>{data.parentNodes.length}</span>
              </div>
            )}
            {hasChildren && (
              <div className="flex items-center gap-1" title={`${data.childNodes.length} child node(s)`}>
                <Users size={10} />
                <span>{data.childNodes.length}</span>
              </div>
            )}
          </div>
          
          {data.outputData && (
            <div className="text-xs text-slate-500">
              {data.outputData.length} rows
            </div>
          )}
        </div>

        {/* Error Message */}
        {data.error && (
          <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
            {data.error}
          </div>
        )}

        {/* Results Summary */}
        {data.results && (
          <div className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200">
            {data.results.rowCount} rows • {data.results.columns?.length || 0} columns
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
        style={{ right: -6 }}
      />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;