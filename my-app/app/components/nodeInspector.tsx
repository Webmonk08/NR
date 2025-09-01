'use client'
import React, { useState, useEffect, useRef } from 'react';
import { X, Settings, Play, Pause, CheckCircle, AlertCircle } from 'lucide-react';
import { Node } from 'reactflow';

interface NodeInspectorProps {
  selectedNode: Node | null;
  onClose: () => void;
  onUpdateNode: (nodeId: string, data: any) => void;
  onExecuteNode: (nodeId: string) => void;
  position?: { x: number; y: number };
}

interface ParameterConfig {
  type: 'text' | 'number' | 'select' | 'checkbox' | 'file';
  label: string;
  defaultValue: any;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

const nodeConfigs: Record<string, Record<string, ParameterConfig>> = {
  'file': {
    path: { type: 'file', label: 'File Path', defaultValue: '' },
    delimiter: { type: 'select', label: 'Delimiter', defaultValue: ',', options: [',', ';', '\t', '|'] },
    hasHeader: { type: 'checkbox', label: 'Has Header', defaultValue: true }
  },
  'csv': {
    path: { type: 'file', label: 'CSV File Path', defaultValue: '' },
    encoding: { type: 'select', label: 'Encoding', defaultValue: 'utf-8', options: ['utf-8', 'latin-1', 'ascii'] },
    skipRows: { type: 'number', label: 'Skip Rows', defaultValue: 0, min: 0 }
  },
  'knn': {
    neighbors: { type: 'number', label: 'Number of Neighbors', defaultValue: 5, min: 1, max: 50 },
    metric: { type: 'select', label: 'Distance Metric', defaultValue: 'euclidean', options: ['euclidean', 'manhattan', 'minkowski'] },
    weights: { type: 'select', label: 'Weights', defaultValue: 'uniform', options: ['uniform', 'distance'] }
  },
  'tree': {
    maxDepth: { type: 'number', label: 'Max Depth', defaultValue: 5, min: 1, max: 20 },
    minSamplesSplit: { type: 'number', label: 'Min Samples Split', defaultValue: 2, min: 2, max: 10 },
    criterion: { type: 'select', label: 'Criterion', defaultValue: 'gini', options: ['gini', 'entropy'] }
  },
  'svm': {
    C: { type: 'number', label: 'Regularization (C)', defaultValue: 1.0, min: 0.01, max: 100, step: 0.01 },
    kernel: { type: 'select', label: 'Kernel', defaultValue: 'rbf', options: ['linear', 'poly', 'rbf', 'sigmoid'] },
    gamma: { type: 'select', label: 'Gamma', defaultValue: 'scale', options: ['scale', 'auto'] }
  },
  'random-forest': {
    nEstimators: { type: 'number', label: 'Number of Trees', defaultValue: 100, min: 10, max: 1000 },
    maxDepth: { type: 'number', label: 'Max Depth', defaultValue: 10, min: 1, max: 50 },
    minSamplesSplit: { type: 'number', label: 'Min Samples Split', defaultValue: 2, min: 2, max: 10 }
  },
  'scatter-plot': {
    xAxis: { type: 'text', label: 'X-Axis Column', defaultValue: '' },
    yAxis: { type: 'text', label: 'Y-Axis Column', defaultValue: '' },
    colorBy: { type: 'text', label: 'Color By Column', defaultValue: '' },
    size: { type: 'number', label: 'Point Size', defaultValue: 6, min: 1, max: 20 }
  },
  'box-plot': {
    column: { type: 'text', label: 'Column', defaultValue: '' },
    groupBy: { type: 'text', label: 'Group By', defaultValue: '' },
    showOutliers: { type: 'checkbox', label: 'Show Outliers', defaultValue: true }
  }
};

const NodeInspector: React.FC<NodeInspectorProps> = ({ 
  selectedNode, 
  onClose, 
  onUpdateNode, 
  onExecuteNode,
  position = { x: 0, y: 0 }
}) => {
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedNode) {
      const toolId = selectedNode.data.toolId;
      const config = nodeConfigs[toolId] || {};
      const initialParams: Record<string, any> = {};
      
      Object.entries(config).forEach(([key, paramConfig]) => {
        initialParams[key] = selectedNode.data.parameters?.[key] ?? paramConfig.defaultValue;
      });
      
      setParameters(initialParams);
      setExecutionStatus(selectedNode.data.status || 'idle');
    }
  }, [selectedNode]);

  useEffect(() => {
    if (selectedNode && popupRef.current) {
      const popup = popupRef.current;
      const rect = popup.getBoundingClientRect();
      
      // Calculate position above the node with better positioning
      let x = position.x - rect.width / 2;
      let y = position.y - rect.height - 15; // Closer to the node
      
      // Ensure popup doesn't go off-screen
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 10;
      
      // Horizontal bounds check
      if (x < padding) x = padding;
      if (x + rect.width > viewportWidth - padding) x = viewportWidth - rect.width - padding;
      
      // Vertical bounds check - show below if not enough space above
      if (y < padding) {
        y = position.y + 80; // Show below the node
      }
      if (y + rect.height > viewportHeight - padding) {
        y = viewportHeight - rect.height - padding;
      }
      
      setPopupPosition({ x, y });
    }
  }, [selectedNode, position]);

  const handleParameterChange = (key: string, value: any) => {
    const newParams = { ...parameters, [key]: value };
    setParameters(newParams);
    
    if (selectedNode) {
      onUpdateNode(selectedNode.id, {
        ...selectedNode.data,
        parameters: newParams
      });
    }
  };

  const handleExecute = () => {
    if (selectedNode) {
      setExecutionStatus('running');
      onExecuteNode(selectedNode.id);
      
      // Simulate execution (replace with actual API call)
      setTimeout(() => {
        setExecutionStatus(Math.random() > 0.2 ? 'success' : 'error');
      }, 2000);
    }
  };

  const renderParameter = (key: string, config: ParameterConfig) => {
    const value = parameters[key];

    switch (config.type) {
      case 'text':
      case 'file':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleParameterChange(key, e.target.value)}
            className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder={config.type === 'file' ? 'Select file...' : ''}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            min={config.min}
            max={config.max}
            step={config.step || 1}
            onChange={(e) => handleParameterChange(key, parseFloat(e.target.value) || config.defaultValue)}
            className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleParameterChange(key, e.target.value)}
            className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {config.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleParameterChange(key, e.target.checked)}
              className="w-3 h-3 text-blue-600 border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-600">Enable</span>
          </label>
        );

      default:
        return null;
    }
  };

  const getStatusIcon = () => {
    switch (executionStatus) {
      case 'running': return <Pause className="w-3 h-3 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'error': return <AlertCircle className="w-3 h-3 text-red-500" />;
      default: return <Play className="w-3 h-3" />;
    }
  };

  if (!selectedNode) return null;

  const toolId = selectedNode.data.toolId;
  const config = nodeConfigs[toolId] || {};

  return (
    <>
      {/* Backdrop to close popup when clicking outside */}
      <div 
        className="fixed inset-0 z-40 bg-transparent bg-opacity-10"
        onClick={onClose}
      />
      
      <div 
        ref={popupRef}
        className="fixed bg-white border border-slate-300 rounded-lg shadow-2xl z-50 w-72 max-h-80 overflow-hidden"
        style={{
          left: popupPosition.x,
          top: popupPosition.y,
        }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Header - More compact */}
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
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100 transition-colors p-1 hover:bg-white hover:bg-opacity-20 rounded"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Status and Execute - More compact */}
        <div className="px-3 py-2 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              <span className="text-xs capitalize text-slate-600">
                {executionStatus}
              </span>
            </div>
            <button
              onClick={handleExecute}
              disabled={executionStatus === 'running'}
              className="bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white text-xs font-medium py-1 px-2 rounded transition-colors flex items-center gap-1"
            >
              {executionStatus === 'running' ? (
                <>
                  <Pause size={10} />
                  Running
                </>
              ) : (
                <>
                  <Play size={10} />
                  Execute
                </>
              )}
            </button>
          </div>
        </div>

        {/* Parameters - Scrollable and compact */}
        <div className="max-h-40 overflow-y-auto">
          <div className="px-3 py-2">
            <div className="flex items-center gap-1 mb-2">
              <Settings size={12} className="text-slate-600" />
              <h4 className="text-xs font-medium text-slate-800">Parameters</h4>
            </div>

            {Object.keys(config).length === 0 ? (
              <p className="text-slate-500 text-xs italic">No parameters available</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(config).map(([key, paramConfig]) => (
                  <div key={key} className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">
                      {paramConfig.label}
                    </label>
                    {renderParameter(key, paramConfig)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer - More compact */}
        <div className="px-3 py-1.5 border-t border-slate-200 bg-slate-50 rounded-b-lg">
          <div className="text-xs text-slate-500 text-center">
            Configure and execute
          </div>
        </div>
      </div>
    </>
  );
};

export default NodeInspector;