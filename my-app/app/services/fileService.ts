export class FileService {
    private static instance: FileService;
    private files: Map<string, any> = new Map();
  
    static getInstance(): FileService {
      if (!FileService.instance) {
        FileService.instance = new FileService();
      }
      return FileService.instance;
    }
  
    async uploadFile(file: File): Promise<{ id: string; data: any[]; columns: string[] }> {
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            let data: any[] = [];
            let columns: string[] = [];
  
            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
              const lines = content.split('\n').filter(line => line.trim());
              if (lines.length > 0) {
                columns = lines[0].split(',').map(col => col.trim().replace(/"/g, ''));
                data = lines.slice(1).map(line => {
                  const values = line.split(',').map(val => val.trim().replace(/"/g, ''));
                  const row: any = {};
                  columns.forEach((col, index) => {
                    const value = values[index];
                    // Try to parse as number, otherwise keep as string
                    row[col] = isNaN(Number(value)) ? value : Number(value);
                  });
                  return row;
                });
              }
            } else if (file.type === 'application/json' || file.name.endsWith('.json')) {
              const jsonData = JSON.parse(content);
              if (Array.isArray(jsonData) && jsonData.length > 0) {
                data = jsonData;
                columns = Object.keys(jsonData[0]);
              }
            } else {
              // For other text files, create a simple structure
              const lines = content.split('\n').filter(line => line.trim());
              columns = ['line_number', 'content'];
              data = lines.map((line, index) => ({
                line_number: index + 1,
                content: line
              }));
            }
  
            // Store in temporary storage
            this.files.set(fileId, {
              name: file.name,
              size: file.size,
              type: file.type,
              content: data,
              columns,
              uploadedAt: new Date()
            });
  
            resolve({ id: fileId, data, columns });
          } catch (error) {
            reject(new Error(`Failed to parse file: ${error}`));
          }
        };
  
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
  
        reader.readAsText(file);
      });
    }
  
    getFile(fileId: string) {
      return this.files.get(fileId);
    }
  
    getAllFiles() {
      return Array.from(this.files.entries()).map(([id, file]) => ({
        id,
        ...file
      }));
    }
  
    deleteFile(fileId: string) {
      return this.files.delete(fileId);
    }
  
    clearAll() {
      this.files.clear();
    }
  }