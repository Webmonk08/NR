// types/nodeTypes.ts

export type DataType = 'table' | 'model' | 'visualization' | 'number' | 'string' | 'boolean';

export interface NodePort {
  id: string;
  name: string;
  type: DataType;
  required?: boolean;
}

export interface BaseNodeConfig {
  id: string;
  type: string;
  label: string;
  category: 'data' | 'transform' | 'model' | 'visualize';
  inputs: NodePort[];
  outputs: NodePort[];
}

// Specific node configurations
export interface FileNodeConfig extends BaseNodeConfig {
  type: 'file';
  config: {
    filePath: string;
    delimiter: string;
    hasHeader: boolean;
    encoding: 'utf-8' | 'latin1';
  };
}

export interface FilterNodeConfig extends BaseNodeConfig {
  type: 'filter';
  config: {
    condition: string; // e.g., "age > 25"
    operator: '>' | '<' | '=' | '!=' | '>=' | '<=';
    column: string;
    value: string;
  };
}

export interface TransformNodeConfig extends BaseNodeConfig {
  type: 'transform';
  config: {
    operation: 'select' | 'drop' | 'rename' | 'sort';
    columns: string[];
    newNames?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

export interface KNNNodeConfig extends BaseNodeConfig {
  type: 'knn';
  config: {
    k: number;
    distanceMetric: 'euclidean' | 'manhattan' | 'cosine';
    features: string[];
    target: string;
  };
}

export interface ScatterPlotNodeConfig extends BaseNodeConfig {
  type: 'scatterPlot';
  config: {
    xAxis: string;
    yAxis: string;
    colorBy?: string;
    sizeBy?: string;
    title: string;
    width: number;
    height: number;
  };
}

export interface LineChartNodeConfig extends BaseNodeConfig {
  type: 'lineChart';
  config: {
    xAxis: string;
    yAxis: string;
    groupBy?: string;
    title: string;
    width: number;
    height: number;
  };
}

export interface BarChartNodeConfig extends BaseNodeConfig {
  type: 'barChart';
  config: {
    xAxis: string;
    yAxis: string;
    title: string;
    width: number;
    height: number;
  };
}

export type NodeConfig = 
  | FileNodeConfig 
  | FilterNodeConfig 
  | TransformNodeConfig 
  | KNNNodeConfig 
  | ScatterPlotNodeConfig 
  | LineChartNodeConfig
  | BarChartNodeConfig;

// Data structures for runtime
export interface TableData {
  columns: string[];
  rows: Record<string, any>[];
  metadata?: {
    rowCount: number;
    columnTypes: Record<string, string>;
  };
}

export interface ModelData {
  type: 'knn' | 'regression' | 'classification';
  model: any;
  features: string[];
  target: string;
  metrics?: Record<string, number>;
}

export interface VisualizationData {
  type: 'scatter' | 'line' | 'bar' | 'histogram';
  data: any[];
  config: Record<string, any>;
}

export type RuntimeData = TableData | ModelData | VisualizationData | number | string | boolean;

// Execution context
export interface ExecutionContext {
  nodeData: Map<string, RuntimeData>;
  nodeStatus: Map<string, 'idle' | 'running' | 'completed' | 'error'>;
  nodeErrors: Map<string, string>;
}

// Node templates for the sidebar
export const NODE_TEMPLATES: Record<string, Omit<NodeConfig, 'id'>> = {
  file: {
    type: 'file',
    label: 'File Input',
    category: 'data',
    inputs: [],
    outputs: [{ id: 'output', name: 'Data', type: 'table' }],
    config: {
      filePath: '',
      delimiter: ',',
      hasHeader: true,
      encoding: 'utf-8'
    }
  },
  filter: {
    type: 'filter',
    label: 'Filter Rows',
    category: 'transform',
    inputs: [{ id: 'input', name: 'Data', type: 'table', required: true }],
    outputs: [{ id: 'output', name: 'Filtered Data', type: 'table' }],
    config: {
      condition: '',
      operator: '>',
      column: '',
      value: ''
    }
  },
  transform: {
    type: 'transform',
    label: 'Transform Data',
    category: 'transform',
    inputs: [{ id: 'input', name: 'Data', type: 'table', required: true }],
    outputs: [{ id: 'output', name: 'Transformed Data', type: 'table' }],
    config: {
      operation: 'select',
      columns: []
    }
  },
  knn: {
    type: 'knn',
    label: 'k-NN Classifier',
    category: 'model',
    inputs: [{ id: 'input', name: 'Training Data', type: 'table', required: true }],
    outputs: [{ id: 'output', name: 'Model', type: 'model' }],
    config: {
      k: 3,
      distanceMetric: 'euclidean',
      features: [],
      target: ''
    }
  },
  scatterPlot: {
    type: 'scatterPlot',
    label: 'Scatter Plot',
    category: 'visualize',
    inputs: [{ id: 'input', name: 'Data', type: 'table', required: true }],
    outputs: [],
    config: {
      xAxis: '',
      yAxis: '',
      title: 'Scatter Plot',
      width: 400,
      height: 300
    }
  },
  lineChart: {
    type: 'lineChart',
    label: 'Line Chart',
    category: 'visualize',
    inputs: [{ id: 'input', name: 'Data', type: 'table', required: true }],
    outputs: [],
    config: {
      xAxis: '',
      yAxis: '',
      title: 'Line Chart',
      width: 400,
      height: 300
    }
  },
  barChart: {
    type: 'barChart',
    label: 'Bar Chart',
    category: 'visualize',
    inputs: [{ id: 'input', name: 'Data', type: 'table', required: true }],
    outputs: [],
    config: {
      xAxis: '',
      yAxis: '',
      title: 'Bar Chart',
      width: 400,
      height: 300
    }
  }
};

// Utility functions
export function createNodeFromTemplate(type: string): NodeConfig | null {
  const template = NODE_TEMPLATES[type];
  if (!template) return null;
  
  return {
    ...template,
    id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  } as NodeConfig;
}

export function validateConnection(sourceType: DataType, targetType: DataType): boolean {
  // Allow any connection for now, but you can add stricter rules
  return sourceType === targetType || targetType === 'table';
}