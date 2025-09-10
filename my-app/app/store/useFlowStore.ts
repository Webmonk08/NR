import { create } from 'zustand';
import { FileService } from '../services/fileService';

interface NodeFileData {
  fileId: string;
  data: any[];
  columns: string[];
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

interface NodeDataStore {
  [nodeId: string]: {
    fileData?: NodeFileData;
    processedData?: any[];
    processedColumns?: string[];
    status: 'idle' | 'loading' | 'success' | 'error';
    error?: string;
  };
}

interface FileState {
  // Node-specific data storage
  nodeDataStore: NodeDataStore;
  
  // Global state for UI
  loading: boolean;
  error: string | null;
  isVisualizationPanelOpen: boolean;

  // Actions
  uploadFileForNode: (nodeId: string, file: File) => Promise<NodeFileData>;
  setNodeProcessedData: (nodeId: string, data: any[], columns: string[]) => void;
  getNodeData: (nodeId: string) => NodeFileData | null;
  getNodeProcessedData: (nodeId: string) => { data: any[]; columns: string[] } | null;
  clearNodeData: (nodeId: string) => void;
  getFileData: (fileId: string) => Promise<any[]>;
  generateVisualization: (
    nodeId: string,
    visualizationType: string,
    parameters: any,
    fileId?: string
  ) => Promise<any>;
  toggleVisualizationPanel: () => void;
}

export const useFileStore = create<FileState>((set, get) => {
  const fileService = FileService.getInstance();

  return {
    nodeDataStore: {},
    loading: false,
    error: null,
    isVisualizationPanelOpen: false,

    uploadFileForNode: async (nodeId: string, file: File): Promise<NodeFileData> => {
      set((state) => ({
        nodeDataStore: {
          ...state.nodeDataStore,
          [nodeId]: {
            ...state.nodeDataStore[nodeId],
            status: 'loading'
          }
        },
        loading: true,
        error: null
      }));

      try {
        const result = await fileService.uploadFile(file);
        
        const nodeFileData: NodeFileData = {
          fileId: result.id,
          data: result.data,
          columns: result.columns,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: new Date().toISOString()
        };

        set((state) => ({
          nodeDataStore: {
            ...state.nodeDataStore,
            [nodeId]: {
              ...state.nodeDataStore[nodeId],
              fileData: nodeFileData,
              status: 'success',
              error: undefined
            }
          },
          loading: false
        }));

        console.log(`File uploaded for node ${nodeId}:`, result.id);
        return nodeFileData;
      } catch (err: any) {
        set((state) => ({
          nodeDataStore: {
            ...state.nodeDataStore,
            [nodeId]: {
              ...state.nodeDataStore[nodeId],
              status: 'error',
              error: err.message
            }
          },
          loading: false,
          error: err.message
        }));
        throw new Error(`File upload failed for node ${nodeId}: ${err.message}`);
      }
    },

    setNodeProcessedData: (nodeId: string, data: any[], columns: string[]) => {
      set((state) => ({
        nodeDataStore: {
          ...state.nodeDataStore,
          [nodeId]: {
            ...state.nodeDataStore[nodeId],
            processedData: data,
            processedColumns: columns,
            status: 'success'
          }
        }
      }));
    },

    getNodeData: (nodeId: string): NodeFileData | null => {
      const nodeStore = get().nodeDataStore[nodeId];
      return nodeStore?.fileData || null;
    },

    getNodeProcessedData: (nodeId: string): { data: any[]; columns: string[] } | null => {
      const nodeStore = get().nodeDataStore[nodeId];
      if (nodeStore?.processedData && nodeStore?.processedColumns) {
        return {
          data: nodeStore.processedData,
          columns: nodeStore.processedColumns
        };
      }
      return null;
    },

    clearNodeData: (nodeId: string) => {
      set((state) => {
        const newNodeDataStore = { ...state.nodeDataStore };
        delete newNodeDataStore[nodeId];
        return { nodeDataStore: newNodeDataStore };
      });
    },

    getFileData: async (fileId: string): Promise<any[]> => {
      set({ loading: true, error: null });
      try {
        const data = await fileService.getFileData(fileId);
        set({ loading: false });
        return data;
      } catch (err: any) {
        set({ error: err.message, loading: false });
        throw err;
      }
    },

    generateVisualization: async (
      nodeId: string,
      visualizationType: string,
      parameters: any,
      fileId?: string
    ) => {
      set({ loading: true, error: null });
      try {
        const result = await fileService.generateVisualization(
          nodeId,
          visualizationType,
          parameters,
          fileId
        );
        set({ loading: false });
        return result;
      } catch (err: any) {
        set({ error: err.message, loading: false });
        throw err;
      }
    },

    toggleVisualizationPanel: () => 
      set((state) => ({ 
        isVisualizationPanelOpen: !state.isVisualizationPanelOpen 
      })),
  };
});
