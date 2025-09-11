// app/components/workflowPersistence.tsx
'use client'
import React, { useState } from 'react';
import { Save, Upload, FileText, Download } from 'lucide-react';
import { Node, Edge } from 'reactflow';

interface WorkflowData {
  version: string;
  timestamp: string;
  nodes: Node[];
  edges: Edge[];
  metadata: {
    name: string;
    description: string;
    author: string;
    tags: string[];
  };
}

interface WorkflowPersistenceProps {
  nodes: Node[];
  edges: Edge[];
  onLoadWorkflow: (nodes: Node[], edges: Edge[]) => void;
  onWorkflowLoaded?: (metadata: WorkflowData['metadata']) => void;
}

const WorkflowPersistence: React.FC<WorkflowPersistenceProps> = ({
  nodes,
  edges,
  onLoadWorkflow,
  onWorkflowLoaded
}) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [metadata, setMetadata] = useState({
    name: '',
    description: '',
    author: '',
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');

  const saveWorkflow = () => {
    const workflowData: WorkflowData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      nodes,
      edges,
      metadata
    };

    const dataStr = JSON.stringify(workflowData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${metadata.name || 'workflow'}_${new Date().getTime()}.orange`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    setShowSaveDialog(false);
    setMetadata({ name: '', description: '', author: '', tags: [] });
  };

  const loadWorkflow = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workflowData: WorkflowData = JSON.parse(e.target?.result as string);
        
        // Validate the workflow data structure
        if (!workflowData.nodes || !workflowData.edges) {
          throw new Error('Invalid workflow file format');
        }

        onLoadWorkflow(workflowData.nodes, workflowData.edges);
        onWorkflowLoaded?.(workflowData.metadata);
        
        // Reset file input
        event.target.value = '';
      } catch (error) {
        console.error('Error loading workflow:', error);
        alert('Failed to load workflow file. Please check the file format.');
      }
    };
    
    reader.readAsText(file);
  };

  const addTag = () => {
    if (tagInput.trim() && !metadata.tags.includes(tagInput.trim())) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const exportAsTemplate = () => {
    // Create a template version with reset node positions and cleared data
    const templateNodes = nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        parameters: {},
        status: 'idle',
        results: null
      }
    }));

    const workflowData: WorkflowData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      nodes: templateNodes,
      edges,
      metadata: {
        ...metadata,
        name: `${metadata.name}_template`
      }
    };

    const dataStr = JSON.stringify(workflowData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${metadata.name || 'workflow'}_template.orange`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="flex items-center gap-2">
      {/* Save Workflow Button */}
      <button
        onClick={() => setShowSaveDialog(true)}
        className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm font-medium"
        title="Save Workflow"
      >
        <Save size={16} />
        Save
      </button>

      {/* Load Workflow Button */}
      <label className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors text-sm font-medium cursor-pointer"
        title="Load Workflow">
        <Upload size={16} />
        Load
        <input
          type="file"
          accept=".orange,.json"
          onChange={loadWorkflow}
          className="hidden"
        />
      </label>

      {/* Export as Template */}
      <button
        onClick={exportAsTemplate}
        className="flex items-center gap-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md transition-colors text-sm font-medium"
        title="Export as Template"
      >
        <FileText size={16} />
        Template
      </button>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 max-w-[90vw]">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Save Workflow</h3>
              <p className="text-sm text-slate-600 mt-1">
                Export your workflow with metadata for easy organization
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Workflow Name *
                </label>
                <input
                  type="text"
                  value={metadata.name}
                  onChange={(e) => setMetadata(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My Data Analysis Workflow"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={metadata.description}
                  onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Brief description of what this workflow does..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  value={metadata.author}
                  onChange={(e) => setMetadata(prev => ({ ...prev, author: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add tags..."
                  />
                  <button
                    onClick={addTag}
                    className="px-3 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-md transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {metadata.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveWorkflow}
                disabled={!metadata.name.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white rounded-md transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Save Workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowPersistence;