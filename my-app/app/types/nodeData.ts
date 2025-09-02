export interface NodeData {
    id: string;
    label: string;
    icon: React.ReactNode;
    toolId: string;
    status: 'idle' | 'running' | 'success' | 'error';
    parameters: Record<string, any>;
    parentNodes: string[];
    childNodes: string[];
    inputData: any[];
    outputData: any[];
    outputColumns: string[];
    results?: any;
    error?: string;
    progress?: number;
    onExecute?: () => void;
    onClick?: (event: React.MouseEvent) => void;
  }
  
  export interface FileData {
    name: string;
    size: number;
    type: string;
    content: any[];
    columns: string[];
    uploadedAt: Date;
  }