// app/components/visualizations/visualizationPanel.tsx
'use client'
import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Maximize2, RefreshCw } from 'lucide-react';
import ScatterPlot from './scatterPlot';
import BoxPlot from './boxPlot';


interface VisualizationPanelProps {
    nodeId: string;
    nodeData: any;
    visualizationType: string;
    data: any[];
    onClose: () => void;
}

const VisualizationPanel: React.FC<VisualizationPanelProps> = ({
    nodeId,
    nodeData,
    visualizationType,
    data,
    onClose
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const plotRef = useRef<HTMLDivElement>(null);

    const handleDownload = () => {
        if (plotRef.current) {
            // Implementation for downloading the plot as PNG/PDF
            console.log('Downloading plot...');
        }
    };

    const handleRefresh = () => {
        setIsLoading(true);
        // Simulate data refresh
        setTimeout(() => setIsLoading(false), 1000);
    };

    const renderVisualization = () => {
        const commonProps = {
            data,
            parameters: nodeData.parameters || {},
            isLoading
        };

        switch (visualizationType) {
            case 'scatter-plot':
                return <ScatterPlot {...commonProps} />;
            case 'box-plot':
                return <BoxPlot {...commonProps} />;
            default:
                return <div className="p-8 text-center text-slate-500">Visualization not available</div>;
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

            {/* Visualization Content */}
            <div className="flex-1 overflow-hidden" ref={plotRef}>
                {renderVisualization()}
            </div>
        </div>
    );
};

export default VisualizationPanel;