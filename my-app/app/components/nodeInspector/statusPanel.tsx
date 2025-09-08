// components/NodeInspector/StatusPanel.tsx
import React from 'react';
import { Play, Pause, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface StatusPanelProps {
  executionStatus: 'idle' | 'running' | 'success' | 'error';
  loading: boolean;
  fileData: any[];
  setShowPreview: (show: boolean) => void;
}

const StatusPanel: React.FC<StatusPanelProps> = ({
  executionStatus,
  loading,
  fileData,
  setShowPreview
}) => {
  const getStatusIcon = () => {
    switch (executionStatus) {
      case 'running': return <Pause className="w-3 h-3 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'error': return <AlertCircle className="w-3 h-3 text-red-500" />;
      default: return <Play className="w-3 h-3" />;
    }
  };

  return (
    <div className="px-3 py-2 border-b border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {getStatusIcon()}
          <span className="text-xs capitalize text-slate-600">
            {loading ? 'loading' : executionStatus}
          </span>
          {fileData.length > 0 && (
            <span className="text-xs text-slate-500 ml-2">
              • {fileData.length} rows
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="text-slate-600 hover:text-slate-800 transition-colors p-1 hover:bg-slate-200 rounded"
            title="Refresh Preview"
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusPanel;