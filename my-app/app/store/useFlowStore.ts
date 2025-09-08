import { create } from 'zustand';
import { FileService } from '../services/fileService';

interface FileState {
  fileId: string;
  data: any[];
  columns: string[];
  loading: boolean;
  error: string | null;
  isVisualizationPanelOpen: boolean;

  uploadFileStore: (file: File) => Promise<{fileid:string , data : any[] ,columns : any[] } >;
  getFileData: (fileId: string) => Promise<void>;
  generateVisualization: (
    nodeId: string,
    visualizationType: string,
    parameters: any,
    fileId?: string
  ) => Promise<any>;
  toggleVisualizationPanel: () => void;
}

export const useFileStore = create<FileState>((set) => {
  const fileService = FileService.getInstance();

  return {
    fileId: "",
    data: [],
    columns: [],
    loading: false,
    error: null,
    isVisualizationPanelOpen: false,

    uploadFileStore: async (file: File) => {
      set({ loading: true, error: null });
      try {
        const result = await fileService.uploadFile(file);
        set({
          fileId: result.id,
          data: result.data,
          columns: result.columns,
          loading: false,
        });
        console.log("Upload File " + result.id)
        return ({
          fileid: result.id,
          data: result.data,
          columns: result.columns,
        });
      } catch (err: any) {
        set({ error: err.message, loading: false });
        throw new Error("File upload failed") 
      }

    },

    getFileData: async (fileId: string) => {
      set({ loading: true, error: null });
      try {
        const data = await fileService.getFileData(fileId);
        set({ data, loading: false });
      } catch (err: any) {
        set({ error: err.message, loading: false });
      }
    },

    generateVisualization: async (nodeId, visualizationType, parameters, fileId) => {
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

    toggleVisualizationPanel: () => set((state) => ({ isVisualizationPanelOpen: !state.isVisualizationPanelOpen })),
  };
});
