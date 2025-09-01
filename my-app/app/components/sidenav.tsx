'use client'
import React, { useState } from 'react';
import {
  Search, Database, FileText, Download, Table,
  Dice1, MousePointer, Rows, RotateCcw, Filter, Grid3X3, ChevronRight, ChevronDown,
  Grid, Users, TreePine, Bot,
  BarChart, LineChart, Box
} from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { ToolItem } from '../types/toolItem';
import { Section } from '../types/section';


interface DraggableToolProps {
  tool: ToolItem;
}

function DraggableTool({ tool }: DraggableToolProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: tool.id,
    data: {
      type: 'tool',
      tool: tool
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 rounded-lg ${tool.color} transition-all duration-200 flex flex-col items-center gap-2 text-slate-700 hover:scale-105 hover:shadow-md bg-white/80 backdrop-blur-sm border border-white/40 group cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50 scale-105 shadow-xl z-50' : ''
        }`}
    >
      <div className="text-slate-600 group-hover:text-slate-800 transition-colors">
        {tool.icon}
      </div>
      <span className="text-xs font-medium text-center leading-tight group-hover:text-slate-900 transition-colors">
        {tool.name}
      </span>
    </button>
  );
}

function Sidenav() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sections, setSections] = useState<Section[]>([
    {
      id: 'data',
      title: 'Data',
      color: 'text-orange-800',
      bgColor: 'from-orange-300 to-orange-400',
      isExpanded: true,
      tools: [
        { id: 'file', name: 'File', icon: <FileText size={24} />, color: 'hover:bg-orange-100' },
        { id: 'csv', name: 'CSV File Import', icon: <Table size={24} />, color: 'hover:bg-orange-100' },
        { id: 'datasets', name: 'Datasets', icon: <Download size={24} />, color: 'hover:bg-orange-100' },
        { id: 'sql', name: 'SQL Table', icon: <Database size={24} />, color: 'hover:bg-orange-100' },
        { id: 'datatable', name: 'Data Table', icon: <Grid3X3 size={24} />, color: 'hover:bg-orange-100' },
      ]
    },
    {
      id: 'transform',
      title: 'Transform',
      color: 'text-emerald-800',
      bgColor: 'from-emerald-300 to-emerald-400',
      isExpanded: true,
      tools: [
        { id: 'sampler', name: 'Data Sampler', icon: <Dice1 size={24} />, color: 'hover:bg-emerald-100' },
        { id: 'select-columns', name: 'Select Columns', icon: <MousePointer size={24} />, color: 'hover:bg-emerald-100' },
        { id: 'select-rows', name: 'Select Rows', icon: <Rows size={24} />, color: 'hover:bg-emerald-100' },
        { id: 'transpose', name: 'Transpose', icon: <RotateCcw size={24} />, color: 'hover:bg-emerald-100' },
        { id: 'filter-more', name: 'Filter', icon: <Filter size={24} />, color: 'hover:bg-emerald-100' }
      ]
    },
    {
      id: 'model',
      title: 'Model',
      color: 'text-pink-800',
      bgColor: 'from-pink-300 to-pink-400',
      isExpanded: true,
      tools: [
        { id: 'knn', name: 'kNN', icon: <Users size={24} />, color: 'hover:bg-pink-100' },
        { id: 'tree', name: 'Tree', icon: <TreePine size={24} />, color: 'hover:bg-pink-100' },
        { id: 'random-forest', name: 'Random Forest', icon: <TreePine size={24} />, color: 'hover:bg-pink-100' },
        { id: 'svm', name: 'SVM', icon: <Bot size={24} />, color: 'hover:bg-pink-100' }
      ]
    },
    {
      id: 'visualize',
      title: 'Visualize',
      color: 'text-red-800',
      bgColor: 'from-red-300 to-red-400',
      isExpanded: true,
      tools: [
        { id: 'box-plot', name: 'Box Plot', icon: <Box size={24} />, color: 'hover:bg-red-100' },
        { id: 'scatter-plot', name: 'Scatter Plot', icon: <Grid size={24} />, color: 'hover:bg-red-100' },
        { id: 'line-plot', name: 'Line Plot', icon: <LineChart size={24} />, color: 'hover:bg-red-100' },
        { id: 'bar-plot', name: 'Bar Plot', icon: <BarChart size={24} />, color: 'hover:bg-red-100' }
      ]
    }
  ]);

  const toggleSection = (sectionId: string) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId
        ? { ...section, isExpanded: !section.isExpanded }
        : section
    ));
  };

  const filteredSections = sections.map(section => ({
    ...section,
    tools: section.tools.filter(tool =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.tools.length > 0 || !searchQuery);

  return (
    <div className="w-80 h-screen bg-gradient-to-br from-slate-50 to-slate-100 border-r border-slate-200 flex flex-col shadow-lg">
      {/* Search Bar */}
      <div className="p-4 border-b border-slate-200 bg-white/70 backdrop-blur-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Filter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-black border border-slate-200 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        <div className="p-2 space-y-2">
          {filteredSections.map((section) => (
            <div key={section.id} className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-white/40">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full p-3 rounded-xl bg-gradient-to-r ${section.bgColor} ${section.color} font-semibold text-left flex items-center justify-between hover:shadow-md transition-all duration-200 group`}
              >
                <span className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white/30 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-sm"></div>
                  </div>
                  {section.title}
                </span>
                <div className="text-white/80 group-hover:text-white transition-colors">
                  {section.isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              </button>

              {/* Tools Grid */}
              {section.isExpanded && (
                <div className="p-3 grid grid-cols-4 gap-2">
                  {section.tools.map((tool) => (
                    <DraggableTool key={tool.id} tool={tool} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="h-4 bg-gradient-to-t from-slate-100 to-transparent pointer-events-none"></div>
    </div>
  );
}

export default Sidenav
