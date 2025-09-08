'use client'
import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Maximize2, RefreshCw } from 'lucide-react';
import ScatterPlot from './scatterPlot';
import BoxPlot from './boxPlot';
import {DataGrid} from 'react-data-grid';
import { useFileStore } from '../../store/useFlowStore';

interface VisualizationPanelProps {
    nodeId: string;
    nodeData: any;
    visualizationType: string;
    onClose: () => void;
}

const VisualizationPanel: React.FC<VisualizationPanelProps> = ({
    nodeId,
    nodeData,
    visualizationType,
    onClose
}) => {

    console.log("HI Iam entered")
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const plotRef = useRef<HTMLDivElement>(null);
    const { data, columns } = useFileStore();

    console.log("Columns" + columns)
    console.log("Data" + data)

    const handleDownload = () => {
        if (plotRef.current) {
            console.log('Downloading plot...');
        }
    };

    const handleRefresh = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1000);
    };

    const renderVisualization = () => {
        const commonProps = {
            data,
            parameters: nodeData.parameters || {},
            isLoading
        };

        if (!data || data.length === 0) {
            return <div className="p-8 text-center text-slate-500">No data available for visualization.</div>;
        }

        const gridColumns = columns.map(col => ({ key: col, name: col }));

        switch (visualizationType) {
            case 'scatter-plot':
                return <ScatterPlot {...commonProps} />;
            case 'box-plot':
                return <BoxPlot {...commonProps} />;
            case 'table':
            default:
                return (
                    <div className="flex-1 overflow-auto">
                        <DataGrid
                            columns={gridColumns}
                            rows={data}
                            className="rdg-light"
                        />
                    </div>
                );
        }
    };

    return (
        <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'fixed right-80 top-16 bottom-16 w-96'} bg-white border border-slate-200 rounded-lg shadow-xl flex flex-col`}>
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-purple-500 to-purple-600">
                <div className="flex items-center justify-between">
                    <div className="text-white">
                        <h3 className="font-semibold">{nodeData.label} - Visualization</h3>
                        <p className="text-sm text-purple-100">Node ID: {nodeId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="p-2 text-white hover:bg-white/20 rounded-md transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={handleDownload}
                            className="p-2 text-white hover:bg-white/20 rounded-md transition-colors"
                            title="Download"
                        >
                            <Download size={16} />
                        </button>
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-2 text-white hover:bg-white/20 rounded-md transition-colors"
                            title="Toggle Fullscreen"
                        >
                            <Maximize2 size={16} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-white hover:bg-white/20 rounded-md transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden" ref={plotRef}>
                {renderVisualization()}
            </div>
        </div>
    );
};

export default VisualizationPanel;