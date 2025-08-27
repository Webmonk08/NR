import {
    Database, FileText, Download, Table,
    Dice1, MousePointer, Rows, RotateCcw, Filter, Grid3X3, Grid, Users, TreePine, Bot,
    BarChart, LineChart, Box,
  } from "lucide-react";
  
  export interface ToolItem {
    id: string;
    name: string;
    icon: React.ReactNode;
    color: string;
  }
  
  export const getAllTools = (): ToolItem[]=> {
    const sections = [
      {
        tools: [
          { id: "file", name: "File", icon: <FileText size={24} />, color: "hover:bg-orange-100"},
          { id: "csv", name: "CSV File Import", icon: <Table size={24} />, color: "hover:bg-orange-100" },
          { id: "datasets", name: "Datasets", icon: <Download size={24} />, color: "hover:bg-orange-100" },
          { id: "sql", name: "SQL Table", icon: <Database size={24} />, color: "hover:bg-orange-100" },
          { id: "datatable", name: "Data Table", icon: <Grid3X3 size={24} />, color: "hover:bg-orange-100" },
          { id: "sampler", name: "Data Sampler", icon: <Dice1 size={24} />, color: "hover:bg-emerald-100" },
          { id: "select-columns", name: "Select Columns", icon: <MousePointer size={24} />, color: "hover:bg-emerald-100" },
          { id: "select-rows", name: "Select Rows", icon: <Rows size={24} />, color: "hover:bg-emerald-100" },
          { id: "transpose", name: "Transpose", icon: <RotateCcw size={24} />, color: "hover:bg-emerald-100" },
          { id: "filter-more", name: "Filter", icon: <Filter size={24} />, color: "hover:bg-emerald-100" },
          { id: "knn", name: "kNN", icon: <Users size={24} />, color: "hover:bg-pink-100" },
          { id: "tree", name: "Tree", icon: <TreePine size={24} />, color: "hover:bg-pink-100" },
          { id: "random-forest", name: "Random Forest", icon: <TreePine size={24} />, color: "hover:bg-pink-100" },
          { id: "svm", name: "SVM", icon: <Bot size={24} />, color: "hover:bg-pink-100" },
          { id: "box-plot", name: "Box Plot", icon: <Box size={24} />, color: "hover:bg-red-100" },
          { id: "scatter-plot", name: "Scatter Plot", icon: <Grid size={24} />, color: "hover:bg-red-100" },
          { id: "line-plot", name: "Line Plot", icon: <LineChart size={24} />, color: "hover:bg-red-100" },
          { id: "bar-plot", name: "Bar Plot", icon: <BarChart size={24} />, color: "hover:bg-red-100" },
        ],
      },
    ];
    return sections[0].tools
  };
  