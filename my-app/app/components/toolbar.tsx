// app/components/toolbar.tsx
'use client'
import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Play,
  Square,
  RotateCcw,
  Grid3X3,
  Map,
  Settings,
  HelpCircle
} from 'lucide-react';
import { useReactFlow } from 'reactflow';
import WorkflowPersistence from './workflowPersistence';
import { Node, Edge } from 'reactflow';

interface ToolbarProps {
  nodes: Node[];
  edges: Edge[];
  onLoadWorkflow: (nodes: Node[], edges: Edge[]) => void;
  onRunWorkflow: () => void;
  onStopWorkflow: () => void;
  isWorkflowRunning: boolean;
  snapToGrid: boolean;
  onToggleSnapToGrid: () => void;
  showMinimap: boolean;
  onToggleMinimap: () => void;
  onShowSettings: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  nodes,
  edges,
  onLoadWorkflow,
  onRunWorkflow,
  onStopWorkflow,
  isWorkflowRunning,
  snapToGrid,
  onToggleSnapToGrid,
  showMinimap,
  onToggleMinimap,
  onShowSettings
}) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const [zoomLevel, setZoomLevel] = useState(100);

  const handleZoomIn = () => {
    zoomIn();
    setZoomLevel(prev => Math.min(prev + 25, 400));
  };

  const handleZoomOut = () => {
    zoomOut();
    setZoomLevel(prev => Math.max(prev - 25, 25));
  };

  const handleFitView = () => {
    fitView({ padding: 0.2 });
    setZoomLevel(100);
  };

  const handleReset = () => {
    fitView({ padding: 0.2 });
    setZoomLevel(100);
    // Could also reset other view states here
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 shadow-sm z-30">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left Section - Logo and Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Orange Mining</h1>
              <p className="text-xs text-slate-500">Visual Data Mining</p>
            </div>
          </div>

          <div className="w-px h-8 bg-slate-300"></div>

          {/* Workflow Controls */}
          <div className="flex items-center gap-2">
            <WorkflowPersistence
              nodes={nodes}
              edges={edges}
              onLoadWorkflow={onLoadWorkflow}
            />

            <div className="w-px h-6 bg-slate-300"></div>

            <button
              onClick={isWorkflowRunning ? onStopWorkflow : onRunWorkflow}
              disabled={nodes.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm font-medium ${isWorkflowRunning
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white disabled:bg-slate-300'
                }`}
              title={isWorkflowRunning ? 'Stop Workflow' : 'Run Workflow'}
            >
              {isWorkflowRunning ? (
                <>
                  <Square size={16} fill="currentColor" />
                  Stop
                </>
              ) : (
                <>
                  <Play size={16} fill="currentColor" />
                  Run All
                </>
              )}
            </button>
          </div>
        </div>

        {/* Center Section - View Controls */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={handleZoomOut}
            className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white rounded-md transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>

          <div className="px-3 py-1 text-sm text-slate-600 font-medium min-w-[60px] text-center">
            {zoomLevel}%
          </div>

          <button
            onClick={handleZoomIn}
            className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white rounded-md transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>

          <div className="w-px h-6 bg-slate-300 mx-1"></div>

          <button
            onClick={handleFitView}
            className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white rounded-md transition-colors"
            title="Fit to View"
          >
            <Maximize size={16} />
          </button>

          <button
            onClick={handleReset}
            className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white rounded-md transition-colors"
            title="Reset View"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Right Section - View Options and Help */}
        <div className="flex items-center gap-2">
          {/* View Options */}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleSnapToGrid}
              className={`p-2 rounded-md transition-colors ${snapToGrid
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                }`}
              title="Toggle Snap to Grid"
            >
              <Grid3X3 size={16} />
            </button>

            <button
              onClick={onToggleMinimap}
              className={`p-2 rounded-md transition-colors ${showMinimap
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                }`}
              title="Toggle Minimap"
            >
              <Map size={16} />
            </button>

            <button
              onClick={onShowSettings}
              className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
              title="Settings"
            >
              <Settings size={16} />
            </button>
          </div>

          <div className="w-px h-6 bg-slate-300"></div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isWorkflowRunning ? 'bg-green-500' : 'bg-slate-400'
              }`}></div>
            <span className="text-xs text-slate-600">
              {nodes.length} nodes, {edges.length} connections
            </span>
          </div>

          <div className="w-px h-6 bg-slate-300"></div>

          {/* Help Button */}
          <button
            onClick={() => window.open('https://orangedatamining.com/docs/', '_blank')}
            className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
            title="Help & Documentation"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </div>

      {/* Workflow Status Bar */}
      {isWorkflowRunning && (
        <div className="bg-green-50 border-t border-green-200 px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-green-700 font-medium">
              Workflow is running... This may take a few moments.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbar;