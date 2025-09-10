// Enhanced File Data Management System - Usage Examples

/**
 * This file demonstrates how the enhanced data management system works
 * for handling multiple files across different nodes in the workflow.
 */

// 1. MULTIPLE FILE UPLOADS
// Each node now stores its own file data independently

// Node A uploads file1.csv
// - Store: { nodeA: { fileData: {fileId: 'file1', data: [...], columns: [...]} } }

// Node B uploads file2.csv  
// - Store: { nodeA: {...}, nodeB: { fileData: {fileId: 'file2', data: [...], columns: [...]} } }

// Both files are preserved and accessible independently!

// 2. DATA FLOW BETWEEN NODES
/*
Workflow Example:
[CSV Node A] → [Filter Node] → [Scatter Plot]
     ↓
[CSV Node B] → [Sampler] → [Bar Chart]

Data Flow:
1. Node A uploads sales.csv (1000 rows)
2. Filter Node processes Node A's data (filters to 500 rows) 
3. Scatter Plot visualizes filtered data (500 rows)

4. Node B uploads inventory.csv (2000 rows)
5. Sampler processes Node B's data (samples to 100 rows)
6. Bar Chart visualizes sampled data (100 rows)

Each branch maintains its own data pipeline!
*/

// 3. ACCESSING NODE DATA PROGRAMMATICALLY

import { useFileStore } from '../store/useFlowStore';
import { NodeRelationshipService } from '../services/nodeRelationshipservice';

// Get specific node's file data
const nodeData = useFileStore.getState().getNodeData('node-123');
console.log('Node file data:', nodeData?.data);
console.log('Node columns:', nodeData?.columns);

// Get processed data from a node
const processedData = useFileStore.getState().getNodeProcessedData('node-123');
console.log('Processed data:', processedData?.data);

// 4. DATA INHERITANCE AND PROPAGATION
/*
When nodes are connected:

[File Node] → [Transform Node] → [Visualization Node]

1. File Node has its own data: node.data.fileData
2. Transform Node receives File Node's data as input
3. Transform Node processes and stores result: node.data.processedData
4. Visualization Node receives Transform Node's processed data

The system automatically:
- Tracks parent-child relationships
- Propagates data changes downstream
- Maintains data integrity across the pipeline
*/

// 5. HANDLING COMPLEX WORKFLOWS

/*
Complex Multi-Source Workflow:

[CSV A] → [Filter A] ↘
                      [Merge Node] → [Analysis] → [Dashboard]
[CSV B] → [Sample B] ↗

Data Flow:
1. CSV A (customers.csv) → Filter A (active customers only)
2. CSV B (orders.csv) → Sample B (last 30 days)
3. Merge Node combines both filtered datasets
4. Analysis Node performs calculations
5. Dashboard visualizes final results

Each step preserves data lineage and allows independent processing!
*/

// 6. API USAGE IN COMPONENTS

export function MultiFileWorkflowExample() {
  const { 
    uploadFileForNode, 
    getNodeData, 
    setNodeProcessedData 
  } = useFileStore();

  // Upload file to specific node
  const handleFileUpload = async (nodeId: string, file: File) => {
    try {
      const nodeFileData = await uploadFileForNode(nodeId, file);
      console.log(`File uploaded to node ${nodeId}:`, nodeFileData);
      
      // File is automatically stored per node
      // Other nodes' data remains unchanged
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  // Process data and store result
  const processNodeData = (nodeId: string, inputData: any[]) => {
    // Perform transformation
    const processedData = inputData.map(row => ({
      ...row,
      processed: true,
      timestamp: new Date().toISOString()
    }));
    
    const processedColumns = ['id', 'name', 'value', 'processed', 'timestamp'];
    
    // Store processed result
    setNodeProcessedData(nodeId, processedData, processedColumns);
    
    // This automatically propagates to child nodes!
  };

  // Get node's current data (file or processed)
  const getEffectiveNodeData = (nodeId: string) => {
    const processedData = getNodeProcessedData(nodeId);
    if (processedData) {
      return processedData; // Use processed data if available
    }
    
    const fileData = getNodeData(nodeId);
    if (fileData) {
      return { data: fileData.data, columns: fileData.columns };
    }
    
    return null; // No data available
  };

  return null; // Component implementation
}

// 7. BENEFITS OF THE NEW SYSTEM

/*
✅ SCALABILITY
- Handle unlimited files across different nodes
- Each node maintains independent data storage
- No global state conflicts

✅ DATA INTEGRITY  
- Parent-child relationships tracked automatically
- Data propagation maintains consistency
- Clear data lineage throughout workflow

✅ PERFORMANCE
- Only affected nodes reprocess when data changes
- Lazy evaluation prevents unnecessary computations
- Efficient memory usage per node

✅ FLEXIBILITY
- Mix file sources with processed data
- Complex branching workflows supported
- Independent processing paths

✅ RELIABILITY
- Robust error handling per node
- Data isolation prevents cascade failures
- Clear debugging and data inspection
*/

export default MultiFileWorkflowExample;
