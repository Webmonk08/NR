'use client'
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface BoxPlotProps {
  data: any[];
  parameters: {
    column?: string;
    groupBy?: string;
    showOutliers?: boolean;
  };
  isLoading: boolean;
}

const BoxPlot: React.FC<BoxPlotProps> = ({ data, parameters, isLoading }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || isLoading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.bottom - margin.top;

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Extract and process data
    const column = parameters.column || Object.keys(data[0])[0];
    const values = data.map(d => d[column]).filter(v => v != null && !isNaN(v));
    
    if (values.length === 0) return;

    values.sort(d3.ascending);
    
    const q1 = d3.quantile(values, 0.25)!;
    const median = d3.quantile(values, 0.5)!;
    const q3 = d3.quantile(values, 0.75)!;
    const iqr = q3 - q1;
    const min = Math.max(d3.min(values)!, q1 - 1.5 * iqr);
    const max = Math.min(d3.max(values)!, q3 + 1.5 * iqr);

    const yScale = d3.scaleLinear()
      .domain([min, max])
      .range([height, 0]);

    // Draw box plot
    const boxWidth = 60;
    const center = width / 2;

    // Vertical line (whiskers)
    g.append("line")
      .attr("x1", center)
      .attr("x2", center)
      .attr("y1", yScale(min))
      .attr("y2", yScale(max))
      .attr("stroke", "black");

    // Box
    g.append("rect")
      .attr("x", center - boxWidth / 2)
      .attr("y", yScale(q3))
      .attr("width", boxWidth)
      .attr("height", yScale(q1) - yScale(q3))
      .attr("fill", "#3b82f6")
      .attr("fill-opacity", 0.3)
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2);

    // Median line
    g.append("line")
      .attr("x1", center - boxWidth / 2)
      .attr("x2", center + boxWidth / 2)
      .attr("y1", yScale(median))
      .attr("y2", yScale(median))
      .attr("stroke", "#1d4ed8")
      .attr("stroke-width", 3);

    // Whisker caps
    [min, max].forEach(value => {
      g.append("line")
        .attr("x1", center - boxWidth / 4)
        .attr("x2", center + boxWidth / 4)
        .attr("y1", yScale(value))
        .attr("y2", yScale(value))
        .attr("stroke", "black");
    });

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text(column);

  }, [data, parameters, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-slate-600">Loading box plot...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};

// app/components/visualizations/linePlot.tsx
export const LinePlot: React.FC<BoxPlotProps> = ({ data, parameters, isLoading }) => {
  // Similar implementation for line plot
  return (
    <div className="flex items-center justify-center h-full text-slate-500">
      Line Plot Implementation
    </div>
  );
};

// app/components/visualizations/barPlot.tsx
export const BarPlot: React.FC<BoxPlotProps> = ({ data, parameters, isLoading }) => {
  // Similar implementation for bar plot
  return (
    <div className="flex items-center justify-center h-full text-slate-500">
      Bar Plot Implementation
    </div>
  );
};

// app/components/visualizations/confusionMatrix.tsx
export const ConfusionMatrix: React.FC<BoxPlotProps> = ({ data, parameters, isLoading }) => {
  // Implementation for confusion matrix
  return (
    <div className="flex items-center justify-center h-full text-slate-500">
      Confusion Matrix Implementation
    </div>
  );
};

// app/components/visualizations/rocCurve.tsx
export const ROCCurve: React.FC<BoxPlotProps> = ({ data, parameters, isLoading }) => {
  // Implementation for ROC curve
  return (
    <div className="flex items-center justify-center h-full text-slate-500">
      ROC Curve Implementation
    </div>
  );
};

export default BoxPlot;