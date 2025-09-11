
import { ParameterConfig } from "../types/nodeTypes";

export const nodeConfigs: Record<string, Record<string, ParameterConfig>> = {
  'file': {
    path: { type: 'file', label: 'File Path', defaultValue: '', description: 'Select input file' },
    hasHeader: { type: 'checkbox', label: 'Has Header', defaultValue: true, description: 'First row contains column names' }
  },
  'csv': {
    path: { type: 'file', label: 'CSV File Path', defaultValue: '', description: 'Select CSV file to import' },
    skipRows: { type: 'number', label: 'Skip Rows', defaultValue: 0, min: 0, description: 'Number of rows to skip from top' }
  },
  'sampler': {
    sampleSize: { type: 'number', label: 'Sample Size', defaultValue: 100, min: 1, max: 10000, description: 'Number of rows to sample' },
    method: { type: 'select', label: 'Sampling Method', defaultValue: 'random', options: ['random', 'systematic', 'stratified'], description: 'Sampling strategy' },
    seed: { type: 'number', label: 'Random Seed', defaultValue: 42, min: 0, description: 'Seed for reproducibility' }
  },
  'select-columns': {
    columns: { type: 'text', label: 'Column Names', defaultValue: '', description: 'Comma-separated list of columns to select' },
    includeAll: { type: 'checkbox', label: 'Include All', defaultValue: false, description: 'Select all columns' }
  },
  'select-rows': {
    startRow: { type: 'number', label: 'Start Row', defaultValue: 0, min: 0, description: 'Starting row index' },
    endRow: { type: 'number', label: 'End Row', defaultValue: 100, min: 1, description: 'Ending row index' },
    condition: { type: 'text', label: 'Filter Condition', defaultValue: '', description: 'SQL-like condition (e.g., age > 30)' }
  },
  'filter-more': {
    column: { type: 'column-select', label: 'Filter Column', defaultValue: '', description: 'Column to apply filter on' },
    operator: { type: 'select', label: 'Operator', defaultValue: '==', options: ['==', '!=', '>', '<', '>=', '<=', 'contains', 'startswith'], description: 'Comparison operator' },
    value: { type: 'text', label: 'Filter Value', defaultValue: '', description: 'Value to filter by' }
  },
  'knn': {
    target_column: { type: 'column-select', label: 'Target Column', defaultValue: '', description: 'Column to predict' },
    neighbors: { type: 'number', label: 'Number of Neighbors', defaultValue: 5, min: 1, max: 50, description: 'K value for nearest neighbors' },
    metric: { type: 'select', label: 'Distance Metric', defaultValue: 'euclidean', options: ['euclidean', 'manhattan', 'minkowski'], description: 'Distance calculation method' },
    weights: { type: 'select', label: 'Weights', defaultValue: 'uniform', options: ['uniform', 'distance'], description: 'Weight function for predictions' }
  },
  'tree': {
    maxDepth: { type: 'number', label: 'Max Depth', defaultValue: 5, min: 1, max: 20, description: 'Maximum depth of the tree' },
    minSamplesSplit: { type: 'number', label: 'Min Samples Split', defaultValue: 2, min: 2, max: 10, description: 'Minimum samples required to split' },
    criterion: { type: 'select', label: 'Criterion', defaultValue: 'gini', options: ['gini', 'entropy'], description: 'Function to measure split quality' }
  },
  'svm': {
    C: { type: 'number', label: 'Regularization (C)', defaultValue: 1.0, min: 0.01, max: 100, step: 0.01, description: 'Regularization parameter' },
    kernel: { type: 'select', label: 'Kernel', defaultValue: 'rbf', options: ['linear', 'poly', 'rbf', 'sigmoid'], description: 'Kernel type for SVM' },
    gamma: { type: 'select', label: 'Gamma', defaultValue: 'scale', options: ['scale', 'auto'], description: 'Kernel coefficient' }
  },
  'random_forest': {
    target_column: { type: 'column-select', label: 'Target Column', defaultValue: '', description: 'Column to predict' },
    nEstimators: { type: 'number', label: 'Number of Trees', defaultValue: 100, min: 10, max: 1000, description: 'Number of trees in the forest' },
    maxDepth: { type: 'number', label: 'Max Depth', defaultValue: 10, min: 1, max: 50, description: 'Maximum depth of trees' },
    minSamplesSplit: { type: 'number', label: 'Min Samples Split', defaultValue: 2, min: 2, max: 10, description: 'Minimum samples to split node' }
  },
  'adaboost': {
    target_column: { type: 'column-select', label: 'Target Column', defaultValue: '', description: 'Column to predict' },
    n_estimators: { type: 'number', label: 'Number of Estimators', defaultValue: 50, min: 10, max: 1000, description: 'Number of estimators in the forest' },
    learning_rate: { type: 'number', label: 'Learning Rate', defaultValue: 1.0, min: 0.01, max: 2, step: 0.01, description: 'Learning rate' }
  },
  'naive_bayes': {
    target_column: { type: 'column-select', label: 'Target Column', defaultValue: '', description: 'Column to predict' }
  },
  'scatter-plot': {
    xAxis: { type: 'column-select', label: 'X-Axis Column', defaultValue: '', description: 'Column for X-axis values' },
    yAxis: { type: 'column-select', label: 'Y-Axis Column', defaultValue: '', description: 'Column for Y-axis values' },
    colorBy: { type: 'column-select', label: 'Color By Column', defaultValue: '', description: 'Column for color grouping (optional)' },
    size: { type: 'number', label: 'Point Size', defaultValue: 6, min: 1, max: 20, description: 'Size of scatter points' }
  },
  'box-plot': {
    column: { type: 'column-select', label: 'Value Column', defaultValue: '', description: 'Column containing values to plot' },
    groupBy: { type: 'column-select', label: 'Group By Column', defaultValue: '', description: 'Column for grouping boxes (optional)' },
    showOutliers: { type: 'checkbox', label: 'Show Outliers', defaultValue: true, description: 'Display outlier points' }
  },
  'line-plot': {
    xAxis: { type: 'column-select', label: 'X-Axis Column', defaultValue: '', description: 'Column for X-axis values' },
    yAxis: { type: 'column-select', label: 'Y-Axis Column', defaultValue: '', description: 'Column for Y-axis values' },
    lineColor: { type: 'select', label: 'Line Color', defaultValue: '#8884d8', options: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'], description: 'Color of the line' }
  },
  'bar-plot': {
    xAxis: { type: 'column-select', label: 'Category Column', defaultValue: '', description: 'Column for categories (X-axis)' },
    yAxis: { type: 'column-select', label: 'Value Column', defaultValue: '', description: 'Column for values (Y-axis)' },
    barColor: { type: 'select', label: 'Bar Color', defaultValue: '#8884d8', options: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'], description: 'Color of the bars' }
  }
};