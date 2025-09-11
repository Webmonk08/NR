import {
    Database, FileText, Download, Table,
    Dice1, MousePointer, Rows, RotateCcw, Filter, Grid3X3, Grid, Users, TreePine, Bot,
    BarChart, LineChart, Box,
  } from "lucide-react";
import { ToolItem } from "../types/toolItem";

  export const getAllTools = (): ToolItem[]=> {
    const sections = [
      {
        tools: [
          { id: "file", name: "File", icon: <FileText size={24} />, color: "hover:bg-orange-100", category: "data"},
          { id: "csv", name: "CSV File Import", icon: <Table size={24} />, color: "hover:bg-orange-100", category: "data" },
          { id: "datasets", name: "Datasets", icon: <Download size={24} />, color: "hover:bg-orange-100", category: "data" },
          { id: "sql", name: "SQL Table", icon: <Database size={24} />, color: "hover:bg-orange-100", category: "data" },
          { id: "datatable", name: "Data Table", icon: <Grid3X3 size={24} />, color: "hover:bg-orange-100", category: "data" },
          { id: "sampler", name: "Data Sampler", icon: <Dice1 size={24} />, color: "hover:bg-emerald-100", category: "transform" },
          { id: "select-columns", name: "Select Columns", icon: <MousePointer size={24} />, color: "hover:bg-emerald-100", category: "transform" },
          { id: "select-rows", name: "Select Rows", icon: <Rows size={24} />, color: "hover:bg-emerald-100", category: "transform" },
          { id: "transpose", name: "Transpose", icon: <RotateCcw size={24} />, color: "hover:bg-emerald-100", category: "transform" },
          { id: "filter-more", name: "Filter", icon: <Filter size={24} />, color: "hover:bg-emerald-100", category: "transform" },
          { id: "knn", name: "kNN", icon: <Users size={24} />, color: "hover:bg-pink-100", category: "model" },
          { id: "tree", name: "Tree", icon: <TreePine size={24} />, color: "hover:bg-pink-100", category: "model" },
          { id: "random_forest", name: "Random Forest", icon: <TreePine size={24} />, color: "hover:bg-pink-100", category: "model" },
          { id: "svm", name: "SVM", icon: <Bot size={24} />, color: "hover:bg-pink-100", category: "model" },
          { id: "box-plot", name: "Box Plot", icon: <Box size={24} />, color: "hover:bg-red-100", category: "visualization" },
          { id: "scatter-plot", name: "Scatter Plot", icon: <Grid size={24} />, color: "hover:bg-red-100", category: "visualization" },
          { id: "line-plot", name: "Line Plot", icon: <LineChart size={24} />, color: "hover:bg-red-100", category: "visualization" },
          { id: "bar-plot", name: "Bar Plot", icon: <BarChart size={24} />, color: "hover:bg-red-100", category: "visualization" },
        ],
      },
    ];
    return sections[0].tools
  };
  