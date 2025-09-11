import React, { useState, useEffect, useCallback } from "react";
import { X, Maximize2, Minimize2, RefreshCw, AlertCircle, CheckCircle2, Play, Zap } from "lucide-react";
import type { Node } from "reactflow";
import ModelPreview, { type ModelData } from "./ModelPrview";

export interface ModelPreviewModalProps {
  node: Node | null;
  fileId?: string | null;
  parameters: Record<string, any>;
  isOpen: boolean;
  onClose: () => void;
}

function ModelPreviewModal({ node, fileId, parameters, isOpen, onClose }: ModelPreviewModalProps) {
  const [modelData, setModelData] = useState<ModelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [debouncedParameters, setDebouncedParameters] = useState(parameters);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedParameters(parameters);
    }, 500);

    return () => clearTimeout(timer);
  }, [parameters]);

  const fetchModelData = useCallback(async () => {
    console.log("ModelPreviewModal - Node:", node?.id, node?.data?.toolId);
    console.log("ModelPreviewModal - FileId:", fileId);
    console.log("ModelPreviewModal - Parameters:", debouncedParameters);
    
    if (!node) {
      setError("No node selected");
      setLoading(false);
      return;
    }

    if (!fileId) {
      setError("No file ID found. Please ensure a data file is connected to this model node.");
      setLoading(false);
      return;
    }

    if (!debouncedParameters.target_column) {
      setError("Please select a target column for the model");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let modelParameters = {};
      
      switch (node.data.toolId) {
        case "knn":
          modelParameters = {
            n_neighbors: debouncedParameters.neighbours || 5
          };
          break;
        case "random_forest":
          modelParameters = {
            n_estimators: debouncedParameters.n_estimators || 100,
            max_depth: debouncedParameters.max_depth || 5
          };
          break;
        default:
          modelParameters = {
            test_size: debouncedParameters.test_size || 0.2,
            random_state: debouncedParameters.random_state || 42,
            ...debouncedParameters,
          };
      }

      const requestBody = {
        file_id: fileId,
        target_column: debouncedParameters.target_column,
        model_type: node.data.toolId,
        parameters: modelParameters,
      };
      console.log("hi")
      console.log("ModelPreviewModal - API Request:", requestBody);

      const response = await fetch("/api/models/train", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data: ModelData = await response.json();
      console.log("ModelPreviewModal - API Response:", data);
      setModelData(data);
    } catch (e: any) {
      console.error("ModelPreviewModal - Error:", e);
      setError(e.message);
      setModelData(null);
    } finally {
      setLoading(false);
    }
  }, [node, fileId, debouncedParameters]);

  useEffect(() => {
    if (isOpen) {
      fetchModelData();
    }
  }, [fetchModelData, isOpen]);

  const getModelTypeIcon = (toolId: string) => {
    switch (toolId) {
      case "knn": return "🔍";
      case "random_forest": return "🌳";
      case "linear_regression": return "📈";
      case "logistic_regression": return "📊";
      case "svm": return "🎯";
      default: return "🤖";
    }
  };

  const getModelTypeColor = (toolId: string) => {
    switch (toolId) {
      case "knn": return "bg-blue-500";
      case "random_forest": return "bg-green-500";
      case "linear_regression": return "bg-purple-500";
      case "logistic_regression": return "bg-orange-500";
      case "svm": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Enhanced backdrop with blur */}
      <div 
        className={`absolute inset-0 bg-black transition-all duration-300 ${
          isOpen ? 'bg-opacity-60 backdrop-blur-sm' : 'bg-opacity-0'
        }`} 
        onClick={onClose}
      />
      
      {/* Enhanced modal with animations */}
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        } ${
          isMaximized 
            ? 'w-full h-full m-4' 
            : 'w-11/12 max-w-5xl max-h-[92vh] m-4'
        } flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Enhanced header with gradient */}
        <div className="relative bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 p-6 border-b border-slate-200/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Enhanced model indicator */}
              <div className="relative">
                <div className={`w-12 h-12 ${getModelTypeColor(node?.data?.toolId)} rounded-xl flex items-center justify-center shadow-md`}>
                  <span className="text-xl">{getModelTypeIcon(node?.data?.toolId)}</span>
                </div>
                {modelData && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-white" />
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-1">
                  {node?.data?.label || 'Model'} Results
                </h2>
                <div className="flex items-center space-x-3 text-sm">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                    {node?.data?.toolId?.toUpperCase()}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-600">
                    Target: <span className="font-medium">{debouncedParameters.target_column}</span>
                  </span>
                </div>
              </div>
            </div>
            
            {/* Enhanced controls */}
            <div className="flex items-center space-x-2">
              {error && (
                <button
                  onClick={fetchModelData}
                  className="p-3 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
                  title="Retry Training"
                >
                  <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                </button>
              )}
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all duration-200"
                title={isMaximized ? "Minimize" : "Maximize"}
              >
                {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button
                onClick={onClose}
                className="p-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced content area */}
        <div className="flex-1 overflow-auto bg-slate-50/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-96">
              {/* Enhanced loading state */}
              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin"></div>
                <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-r-blue-300 animate-spin animate-reverse"></div>
              </div>
              
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2 text-xl font-semibold text-slate-800">
                  <Zap className="text-blue-500" size={20} />
                  <span>Training Model</span>
                </div>
                <p className="text-slate-600">
                  Crunching the numbers and finding patterns...
                </p>
                <div className="flex items-center justify-center space-x-1 mt-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full min-h-96 p-6">
              {/* Enhanced error state */}
              <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 max-w-lg w-full">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="text-red-500" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Training Failed</h3>
                  <p className="text-red-600 leading-relaxed">{error}</p>
                </div>
                
                {/* Debug information */}
                <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-2 text-xs text-slate-600">
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="font-medium">Node ID:</span> {node?.id}</div>
                    <div><span className="font-medium">Model:</span> {node?.data?.toolId}</div>
                    <div><span className="font-medium">File ID:</span> {fileId?.substring(0, 12)}...</div>
                    <div><span className="font-medium">Target:</span> {debouncedParameters.target_column || 'Not selected'}</div>
                  </div>
                </div>
                
                <button
                  onClick={fetchModelData}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <RefreshCw size={18} />
                  <span>Retry Training</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <ModelPreview modelData={modelData} />
            </div>
          )}
        </div>

        {/* Enhanced footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm text-slate-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>File: <span className="font-mono text-xs">{fileId?.substring(0, 8)}...</span></span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Target: <span className="font-medium">{debouncedParameters.target_column}</span></span>
              </div>
              
              {/* Model-specific parameters */}
              {node?.data?.toolId === 'knn' && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>K: <span className="font-medium">{debouncedParameters.neighbours || 5}</span></span>
                </div>
              )}
              {node?.data?.toolId === 'random_forest' && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>
                    Trees: <span className="font-medium">{debouncedParameters.n_estimators || 100}</span>, 
                    Depth: <span className="font-medium">{debouncedParameters.max_depth || 5}</span>
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {modelData && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-2 rounded-full">
                  <CheckCircle2 size={16} />
                  <span className="font-medium text-sm">Training Complete</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes animate-reverse {
          to {
            transform: rotate(-360deg);
          }
        }
        .animate-reverse {
          animation: animate-reverse 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default ModelPreviewModal;