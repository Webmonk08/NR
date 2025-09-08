import { useFileStore } from "@/app/store/useFlowStore";


export class FileService {

  private static instance: FileService;
  private apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  
  static getInstance(): FileService {
    if (!FileService.instance) {
      FileService.instance = new FileService();
    }
    return FileService.instance;
  }
  
  async uploadFile(file: File): Promise<{ id: string; data: any[]; columns: string[] }> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/files/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      
      const dataResponse = await fetch(`${this.apiBaseUrl}/api/files/${result.file_id}/data`);
      const dataResult = await dataResponse.json();
      console.log("Data result" + dataResult);


      const playload =  {
        id: result.file_id,
        data: dataResult.data,
        columns: dataResult.columns
      };

      return playload
    } catch (error) {
      throw new Error(`Failed to upload file: ${error}`);
    }
  }

  async getFileData(fileId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/files/${fileId}/data`);
      if (!response.ok) {
        throw new Error('Failed to fetch file data');
      }
      const result = await response.json();
      console.log(result);

      return result.data;
    } catch (error) {
      throw new Error(`Failed to get file data: ${error}`);
    }
  }

  async generateVisualization(nodeId: string, visualizationType: string, parameters: any, fileId?: string) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/visualizations/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          node_id: nodeId,
          visualization_type: visualizationType,
          parameters: parameters,
          data_source_file_id: fileId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate visualization');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Visualization generation failed: ${error}`);
    }
  }
}