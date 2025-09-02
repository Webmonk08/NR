'use client'
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { X, Settings, Play, Pause, CheckCircle, AlertCircle, Eye, EyeOff, RefreshCw, Link, Link2Off, Upload } from 'lucide-react';
import { Node, Edge } from 'reactflow';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter, BarChart, Bar, ResponsiveContainer } from 'recharts';
import FileUploadModal from './fileUploadModal';
import { FileService } from '../services/fileService';

interface NodeInspectorProps {
  selectedNode: Node | null;
  onClose: () => void;
  onUpdateNode: (nodeId: string, data: any) => void;
  onExecuteNode: (nodeId: string) => void;
  position?: { x: number; y: number };
  nodeData?: any[]; // Data flowing through the node
  availableColumns?: string[]; // Available column names from upstream nodes
  edges?: Edge[]; // Add edges prop to check connections
}

interface ParameterConfig {
  type: 'text' | 'number' | 'select' | 'checkbox' | 'file' | 'column-select';
  label: string;
  defaultValue: any;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

const nodeConfigs: Record<string, Record<string, ParameterConfig>> = {
  'file': {
    path: { type: 'file', label: 'File Path', defaultValue: '', description: 'Select input file' },
    delimiter: { type: 'select', label: 'Delimiter', defaultValue: ',', options: [',', ';', '\t', '|'], description: 'Field separator' },
    hasHeader: { type: 'checkbox', label: 'Has Header', defaultValue: true, description: 'First row contains column names' }
  },
  'csv': {
    path: { type: 'file', label: 'CSV File Path', defaultValue: '', description: 'Select CSV file to import' },
    encoding: { type: 'select', label: 'Encoding', defaultValue: 'utf-8', options: ['utf-8', 'latin-1', 'ascii'], description: 'File encoding format' },
    skipRows: { type: 'number', label: 'Skip Rows', defaultValue: 0, min: 0, description: 'Number of rows to skip from top' }
  },
  'sampler': {
    sampleSize: { type: 'number', label: 'Sample Size', defaultValue: 100, min: 1, max: 10000, description: 'Number of rows to sample' },
    method: { type: 'select', label: 'Sampling Method', defaultValue: 'random', options: ['random', 'systematic', 'stratified'], description: 'Sampling strategy' },
    seed: { type: 'number', label: 'Random Seed', defaultValue: 42, min: 0, description: 'Seed for reproducibility' }
  },
  'select-columns': {
    columns: { type: 'text', label: 'Column Names', defaultValue: '', description: 'Comma-separated list of columns to select' },
    includeAll: { type: 'checkbox', label: 'Include All', defaultValue: false, description: 'Select all columns' }
  },
  'select-rows': {
    startRow: { type: 'number', label: 'Start Row', defaultValue: 0, min: 0, description: 'Starting row index' },
    endRow: { type: 'number', label: 'End Row', defaultValue: 100, min: 1, description: 'Ending row index' },
    condition: { type: 'text', label: 'Filter Condition', defaultValue: '', description: 'SQL-like condition (e.g., age > 30)' }
  },
  'filter-more': {
    column: { type: 'column-select', label: 'Filter Column', defaultValue: '', description: 'Column to apply filter on' },
    operator: { type: 'select', label: 'Operator', defaultValue: '==', options: ['==', '!=', '>', '<', '>=', '<=', 'contains', 'startswith'], description: 'Comparison operator' },
    value: { type: 'text', label: 'Filter Value', defaultValue: '', description: 'Value to filter by' }
  },
  'knn': {
    neighbors: { type: 'number', label: 'Number of Neighbors', defaultValue: 5, min: 1, max: 50, description: 'K value for nearest neighbors' },
    metric: { type: 'select', label: 'Distance Metric', defaultValue: 'euclidean', options: ['euclidean', 'manhattan', 'minkowski'], description: 'Distance calculation method' },
    weights: { type: 'select', label: 'Weights', defaultValue: 'uniform', options: ['uniform', 'distance'], description: 'Weight function for predictions' }
  },
  'tree': {
    maxDepth: { type: 'number', label: 'Max Depth', defaultValue: 5, min: 1, max: 20, description: 'Maximum depth of the tree' },
    minSamplesSplit: { type: 'number', label: 'Min Samples Split', defaultValue: 2, min: 2, max: 10, description: 'Minimum samples required to split' },
    criterion: { type: 'select', label: 'Criterion', defaultValue: 'gini', options: ['gini', 'entropy'], description: 'Function to measure split quality' }
  },
  'svm': {
    C: { type: 'number', label: 'Regularization (C)', defaultValue: 1.0, min: 0.01, max: 100, step: 0.01, description: 'Regularization parameter' },
    kernel: { type: 'select', label: 'Kernel', defaultValue: 'rbf', options: ['linear', 'poly', 'rbf', 'sigmoid'], description: 'Kernel type for SVM' },
    gamma: { type: 'select', label: 'Gamma', defaultValue: 'scale', options: ['scale', 'auto'], description: 'Kernel coefficient' }
  },
  'random-forest': {
    nEstimators: { type: 'number', label: 'Number of Trees', defaultValue: 100, min: 10, max: 1000, description: 'Number of trees in the forest' },
    maxDepth: { type: 'number', label: 'Max Depth', defaultValue: 10, min: 1, max: 50, description: 'Maximum depth of trees' },
    minSamplesSplit: { type: 'number', label: 'Min Samples Split', defaultValue: 2, min: 2, max: 10, description: 'Minimum samples to split node' }
  },
  'scatter-plot': {
    xAxis: { type: 'column-select', label: 'X-Axis Column', defaultValue: '', description: 'Column for X-axis values' },
    yAxis: { type: 'column-select', label: 'Y-Axis Column', defaultValue: '', description: 'Column for Y-axis values' },
    colorBy: { type: 'column-select', label: 'Color By Column', defaultValue: '', description: 'Column for color grouping (optional)' },
    size: { type: 'number', label: 'Point Size', defaultValue: 6, min: 1, max: 20, description: 'Size of scatter points' }
  },
  'box-plot': {
    column: { type: 'column-select', label: 'Value Column', defaultValue: '', description: 'Column containing values to plot' },
    groupBy: { type: 'column-select', label: 'Group By Column', defaultValue: '', description: 'Column for grouping boxes (optional)' },
    showOutliers: { type: 'checkbox', label: 'Show Outliers', defaultValue: true, description: 'Display outlier points' }
  },
  'line-plot': {
    xAxis: { type: 'column-select', label: 'X-Axis Column', defaultValue: '', description: 'Column for X-axis values' },
    yAxis: { type: 'column-select', label: 'Y-Axis Column', defaultValue: '', description: 'Column for Y-axis values' },
    lineColor: { type: 'select', label: 'Line Color', defaultValue: '#8884d8', options: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'], description: 'Color of the line' }
  },
  'bar-plot': {
    xAxis: { type: 'column-select', label: 'Category Column', defaultValue: '', description: 'Column for categories (X-axis)' },
    yAxis: { type: 'column-select', label: 'Value Column', defaultValue: '', description: 'Column for values (Y-axis)' },
    barColor: { type: 'select', label: 'Bar Color', defaultValue: '#8884d8', options: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'], description: 'Color of the bars' }
  }
};

const NodeInspector: React.FC<NodeInspectorProps> = ({ 
  selectedNode, 
  onClose, 
  onUpdateNode, 
  onExecuteNode,
  position = { x: 0, y: 0 },
  nodeData = [],
  availableColumns = [],
  edges = []
}) => {
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [showPreview, setShowPreview] = useState(true);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Check if the selected node has incoming edges (connections)
  const hasIncomingEdges = useMemo(() => {
    if (!selectedNode) return false;
    return edges.some(edge => edge.target === selectedNode.id);
  }, [selectedNode, edges]);

  // Check if the selected node has outgoing edges
  const hasOutgoingEdges = useMemo(() => {
    if (!selectedNode) return false;
    return edges.some(edge => edge.source === selectedNode.id);
  }, [selectedNode, edges]);

  // Check if it's a source node (file/csv nodes that don't need incoming data)
  const isSourceNode = useMemo(() => {
    if (!selectedNode) return false;
    return ['file', 'csv'].includes(selectedNode.data.toolId);
  }, [selectedNode]);

  // Determine if we should show detailed content
  const shouldShowDetails = useMemo(() => {
    if (!selectedNode) return false;
    // Show details if it's a source node OR if it has incoming edges
    return isSourceNode || hasIncomingEdges;
  }, [selectedNode, isSourceNode, hasIncomingEdges]);

  // Memoize preview data to prevent infinite renders
  const previewData = useMemo(() => {
    if (!shouldShowDetails) return [];
    
    if (nodeData && nodeData.length > 0) {
      return nodeData.slice(0, 50); // Show first 50 rows
    } else {
      // Generate sample data for demonstration
      return Array.from({ length: 20 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        value: Math.random() * 50 + 10,
        index: i
      }));
    }
  }, [nodeData, shouldShowDetails]);

  // Initialize parameters when selectedNode changes
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

  // Calculate popup position
  useEffect(() => {
    if (selectedNode && popupRef.current) {
      const popup = popupRef.current;
      const rect = popup.getBoundingClientRect();
      
      let x = position.x - rect.width / 2;
      let y = position.y - rect.height - 15;
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 10;
      
      if (x < padding) x = padding;
      if (x + rect.width > viewportWidth - padding) x = viewportWidth - rect.width - padding;
      
      if (y < padding) {
        y = position.y + 80;
      }
      if (y + rect.height > viewportHeight - padding) {
        y = viewportHeight - rect.height - padding;
      }
      
      setPopupPosition({ x, y });
    }
  }, [selectedNode, position]);

  const handleParameterChange = useCallback((key: string, value: any) => {
    const newParams = { ...parameters, [key]: value };
    setParameters(newParams);
    
    if (selectedNode) {
      onUpdateNode(selectedNode.id, {
        ...selectedNode.data,
        parameters: newParams
      });
    }
  }, [parameters, selectedNode, onUpdateNode]);

  const handleFileUpload = useCallback((fileId: string, data: any[], columns: string[]) => {
    if (selectedNode) {
      onUpdateNode(selectedNode.id, {
        ...selectedNode.data,
        parameters: { ...parameters, fileId },
        outputData: data,
        outputColumns: columns,
        status: 'success'
      });
    }
    setShowFileUpload(false);
  }, [selectedNode, parameters, onUpdateNode]);

  const handleExecute = useCallback(() => {
    if (selectedNode) {
      setExecutionStatus('running');
      onExecuteNode(selectedNode.id);
      
      setTimeout(() => {
        setExecutionStatus(Math.random() > 0.2 ? 'success' : 'error');
      }, 2000);
    }
  }, [selectedNode, onExecuteNode]);

  const renderParameter = useCallback((key: string, config: ParameterConfig) => {
    const value = parameters[key];

    switch (config.type) {
      case 'text':
      case 'file':
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={value || ''}
                onChange={(e) => handleParameterChange(key, e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Select file..."
                title={config.description}
                readOnly
              />
              <button
                onClick={() => setShowFileUpload(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors"
                title="Upload file"
              >
                <Upload size={10} />
                Upload
              </button>
            </div>
            {value && (
              <div className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle size={10} />
                File uploaded successfully
              </div>
            )}
          </div>
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
            title={config.description}
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleParameterChange(key, e.target.value)}
            className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            title={config.description}
          >
            <option value="">Select option...</option>
            {config.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'column-select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleParameterChange(key, e.target.value)}
            className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            title={config.description}
          >
            <option value="">Select column...</option>
            {availableColumns.length > 0 ? (
              availableColumns.map(column => (
                <option key={column} value={column}>{column}</option>
              ))
            ) : (
              <>
                <option value="x">x</option>
                <option value="y">y</option>
                <option value="category">category</option>
                <option value="value">value</option>
                <option value="index">index</option>
              </>
            )}
          </select>
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-2" title={config.description}>
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
  }, [parameters, availableColumns, handleParameterChange]);

  // Memoize preview component to prevent re-renders
  const PreviewComponent = useMemo(() => {
    if (!selectedNode || !showPreview || !shouldShowDetails || previewData.length === 0) return null;

    const toolId = selectedNode.data.toolId;
    const xCol = parameters.xAxis || 'x';
    const yCol = parameters.yAxis || 'y';
    const categoryCol = parameters.groupBy || parameters.colorBy || 'category';
    const valueCol = parameters.column || parameters.yAxis || 'value';

    switch (toolId) {
      case 'scatter-plot':
        return (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={previewData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xCol} tick={{ fontSize: 10 }} />
                <YAxis dataKey={yCol} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Scatter dataKey={yCol} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        );

      case 'line-plot':
        return (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={previewData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xCol} tick={{ fontSize: 10 }} />
                <YAxis dataKey={yCol} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey={yCol} stroke={parameters.lineColor || "#8884d8"} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'bar-plot':
        return (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={previewData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xCol} tick={{ fontSize: 10 }} />
                <YAxis dataKey={yCol} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey={valueCol} fill={parameters.barColor || "#8884d8"} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'box-plot':
        return (
          <div className="h-48 w-full flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-300 rounded">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm text-slate-600">Box Plot Preview</div>
              <div className="text-xs text-slate-500">Column: {valueCol}</div>
              {parameters.groupBy && (
                <div className="text-xs text-slate-500">Grouped by: {parameters.groupBy}</div>
              )}
            </div>
          </div>
        );

      default:
        if (selectedNode.data.category && ['data', 'transform', 'model'].includes(selectedNode.data.category)) {
          return (
            <div className="bg-slate-50 p-3 rounded">
              <div className="text-xs font-medium text-slate-700 mb-2">Data Preview</div>
              <div className="max-h-32 overflow-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      {Object.keys(previewData[0] || {}).map(col => (
                        <th key={col} className="text-left p-1 font-medium text-slate-600">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        {Object.values(row).map((val: any, j) => (
                          <td key={j} className="p-1 text-slate-700">
                            {typeof val === 'number' ? val.toFixed(2) : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Showing 5 of {previewData.length} rows
              </div>
            </div>
          );
        }
        return null;
    }
  }, [selectedNode, showPreview, shouldShowDetails, previewData, parameters]);

  const getStatusIcon = () => {
    switch (executionStatus) {
      case 'running': return <Pause className="w-3 h-3 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'error': return <AlertCircle className="w-3 h-3 text-red-500" />;
      default: return <Play className="w-3 h-3" />;
    }
  };

  // Render connection status message
  const ConnectionStatusMessage = () => {
    if (isSourceNode) {
      return (
        <div className="px-3 py-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="text-blue-500">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="text-sm font-medium text-slate-700">Source Node</div>
            <div className="text-xs text-slate-500 text-center">
              This node provides data to the workflow. Configure its parameters to get started.
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

  if (!selectedNode) return null;

  const toolId = selectedNode.data.toolId;
  const config = nodeConfigs[toolId] || {};
  const isVisualizationNode = ['scatter-plot', 'line-plot', 'bar-plot', 'box-plot'].includes(toolId);

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-transparent"
        onClick={onClose}
      />
      
      <div 
        ref={popupRef}
        className="fixed bg-white border border-slate-300 rounded-lg shadow-2xl z-50 w-80 max-h-96 overflow-hidden"
        style={{
          left: popupPosition.x,
          top: popupPosition.y,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
              {shouldShowDetails && isVisualizationNode && (
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

        {/* Status and Execute - only show if details should be shown */}
        {shouldShowDetails && (
          <div className="px-3 py-2 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {getStatusIcon()}
                <span className="text-xs capitalize text-slate-600">
                  {executionStatus}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-slate-600 hover:text-slate-800 transition-colors p-1 hover:bg-slate-200 rounded"
                  title="Refresh Preview"
                >
                  <RefreshCw size={12} />
                </button>
               
              </div>
            </div>
          </div>
        )}

        {/* Content - Scrollable */}
        <div className="max-h-60 overflow-y-auto">
          {shouldShowDetails ? (
            <>
              {/* Preview */}
              {PreviewComponent}

              {/* Parameters */}
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
                          {paramConfig.description && (
                            <span className="text-slate-500 font-normal ml-1">
                              ({paramConfig.description})
                            </span>
                          )}
                        </label>
                        {renderParameter(key, paramConfig)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <ConnectionStatusMessage />
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-1.5 border-t border-slate-200 bg-slate-50 rounded-b-lg">
          <div className="text-xs text-slate-500 text-center">
            {shouldShowDetails ? (
              <>
                Configure parameters • {showPreview ? 'Preview enabled' : 'Preview disabled'}
                {selectedNode.data.parentNodes?.length > 0 && (
                  <> • {selectedNode.data.parentNodes.length} parent(s)</>
                )}
                {selectedNode.data.childNodes?.length > 0 && (
                  <> • {selectedNode.data.childNodes.length} child(ren)</>
                )}
              </>
            ) : (
              <>Connect nodes to enable configuration</>
            )}
          </div>
        </div>
      </div>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onFileUploaded={handleFileUpload}
      />
    </>
  );
};

export default NodeInspector;