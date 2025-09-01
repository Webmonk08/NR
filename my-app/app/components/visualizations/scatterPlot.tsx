'use client'
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ScatterPlotProps {
  data: any[];
  parameters: {
    xAxis?: string;
    yAxis?: string;
    colorBy?: string;
    size?: number;
  };
  isLoading: boolean;
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({ data, parameters, isLoading }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || isLoading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 80, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.bottom - margin.top;

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Extract data for axes
    const xData = data.map(d => d[parameters.xAxis || Object.keys(data[0])[0]]);
    const yData = data.map(d => d[parameters.yAxis || Object.keys(data[0])[1]]);
    const colorData = parameters.colorBy ? data.map(d => d[parameters.colorBy? parameters.colorBy : '']) : null;

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(xData) as [number, number])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(yData) as [number, number])
      .range([height, 0]);

    const colorScale = colorData
      ? d3.scaleOrdinal(d3.schemeCategory10)
          .domain([...new Set(colorData)])
      : () => "#3b82f6";

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 35)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text(parameters.xAxis || "X Axis");

    g.append("g")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text(parameters.yAxis || "Y Axis");

    // Dots
    g.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("r", parameters.size || 4)
      .attr("cx", (d, i) => xScale(xData[i]))
      .attr("cy", (d, i) => yScale(yData[i]))
      .style("fill", (d, i) => colorData ? colorScale(colorData[i]) : '')
      .style("opacity", 0.7)
      .style("stroke", "#fff")
      .style("stroke-width", 1)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(100)
          .attr("r", (parameters.size || 4) + 2)
          .style("opacity", 1);

        // Tooltip
        const tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("padding", "10px")
          .style("background", "rgba(0, 0, 0, 0.8)")
          .style("color", "white")
          .style("border-radius", "5px")
          .style("pointer-events", "none")
          .style("opacity", 0);

        tooltip.transition()
          .duration(200)
          .style("opacity", .9);

        tooltip.html(`
          <div><strong>${parameters.xAxis || 'X'}:</strong> ${d[parameters.xAxis || Object.keys(d)[0]]}</div>
          <div><strong>${parameters.yAxis || 'Y'}:</strong> ${d[parameters.yAxis || Object.keys(d)[1]]}</div>
          ${parameters.colorBy ? `<div><strong>${parameters.colorBy}:</strong> ${d[parameters.colorBy]}</div>` : ''}
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(100)
          .attr("r", parameters.size || 4)
          .style("opacity", 0.7);

        d3.selectAll(".tooltip").remove();
      });

    // Legend
    if (colorData) {
      const legend = g.selectAll(".legend")
        .data([...new Set(colorData)])
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width + 20},${i * 20})`);

      legend.append("rect")
        .attr("x", 0)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => colorScale(d));

      legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .style("font-size", "12px")
        .text(d => d);
    }

  }, [data, parameters, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-slate-600">Loading scatter plot...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        No data available for scatter plot
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};

export default ScatterPlot;