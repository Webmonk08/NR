import { Node, Edge } from 'reactflow';

export class NodeRelationshipService {
  static updateNodeRelationships(nodes: Node[], edges: Edge[]): Node[] {
    return nodes.map(node => {
      const parentNodes = edges
        .filter(edge => edge.target === node.id)
        .map(edge => edge.source);
      
      const childNodes = edges
        .filter(edge => edge.source === node.id)
        .map(edge => edge.target);

      return {
        ...node,
        data: {
          ...node.data,
          parentNodes,
          childNodes
        }
      };
    });
  }

  static getParentNodes(nodeId: string, nodes: Node[], edges: Edge[]): Node[] {
    const parentIds = edges
      .filter(edge => edge.target === nodeId)
      .map(edge => edge.source);
    
    return nodes.filter(node => parentIds.includes(node.id));
  }

  static getChildNodes(nodeId: string, nodes: Node[], edges: Edge[]): Node[] {
    const childIds = edges
      .filter(edge => edge.source === nodeId)
      .map(edge => edge.target);
    
    return nodes.filter(node => childIds.includes(node.id));
  }

  static getNodeInputData(nodeId: string, nodes: Node[], edges: Edge[]): any[] {
    const parentNodes = this.getParentNodes(nodeId, nodes, edges);
    
    if (parentNodes.length === 0) {
      const currentNode = nodes.find(n => n.id === nodeId);
      if (currentNode && ['file', 'csv'].includes(currentNode.data.toolId)) {
        // Return node's own file data or output data
        return currentNode.data.fileData || currentNode.data.outputData || [];
      }
      return [];
    }

    // Combine data from all parent nodes
    const combinedData: any[] = [];
    parentNodes.forEach(parent => {
      // Priority: processed data > file data > output data
      const parentData = parent.data.processedData || 
                        parent.data.fileData || 
                        parent.data.outputData || [];
      
      if (Array.isArray(parentData)) {
        combinedData.push(...parentData);
      }
    });

    return combinedData;
  }

  static getAvailableColumns(nodeId: string, nodes: Node[], edges: Edge[]): string[] {
    const parentNodes = this.getParentNodes(nodeId, nodes, edges);
    const allColumns = new Set<string>();

    parentNodes.forEach(parent => {
      // Priority: processed columns > file columns > output columns
      const parentColumns = parent.data.processedColumns || 
                           parent.data.fileColumns || 
                           parent.data.outputColumns || [];
      
      if (Array.isArray(parentColumns)) {
        parentColumns.forEach((col: string) => allColumns.add(col));
      }
    });

    // If no parent nodes, get columns from current node or defaults
    if (allColumns.size === 0) {
      const currentNode = nodes.find(n => n.id === nodeId);
      if (currentNode && ['file', 'csv'].includes(currentNode.data.toolId)) {
        const nodeColumns = currentNode.data.fileColumns || 
                           currentNode.data.outputColumns || 
                           ['id', 'name', 'value', 'category', 'x', 'y', 'date', 'amount'];
        nodeColumns.forEach((col: string) => allColumns.add(col));
      }
    }

    return Array.from(allColumns);
  }

  static propagateDataChanges(changedNodeId: string, nodes: Node[], edges: Edge[]): Node[] {
    const updatedNodes = [...nodes];
    const visited = new Set<string>();
    
    const propagateToChildren = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const childNodes = this.getChildNodes(nodeId, updatedNodes, edges);
      
      childNodes.forEach(child => {
        const childIndex = updatedNodes.findIndex(n => n.id === child.id);
        if (childIndex !== -1) {
          const inputData = this.getNodeInputData(child.id, updatedNodes, edges);
          const availableColumns = this.getAvailableColumns(child.id, updatedNodes, edges);
          
          updatedNodes[childIndex] = {
            ...updatedNodes[childIndex],
            data: {
              ...updatedNodes[childIndex].data,
              inputData,
              availableColumns,
              // Reset status when input data changes
              status: 'idle',
              progress: 0,
              error: null
            }
          };

          // Continue propagation to grandchildren
          propagateToChildren(child.id);
        }
      });
    };

    propagateToChildren(changedNodeId);
    return updatedNodes;
  }

  /**
   * Updates node with processed data and propagates to children
   */
  static updateNodeProcessedData(
    nodeId: string, 
    processedData: any[], 
    processedColumns: string[],
    nodes: Node[], 
    edges: Edge[]
  ): Node[] {
    const updatedNodes = nodes.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            processedData,
            processedColumns,
            outputData: processedData,
            outputColumns: processedColumns,
            status: 'success'
          }
        };
      }
      return node;
    });

    // Propagate changes to child nodes
    return this.propagateDataChanges(nodeId, updatedNodes, edges);
  }

  /**
   * Gets all source nodes (file/csv nodes) in the workflow
   */
  static getSourceNodes(nodes: Node[]): Node[] {
    return nodes.filter(node => ['file', 'csv'].includes(node.data.toolId));
  }

  /**
   * Checks if node has valid input data from parents or itself
   */
  static hasValidInputData(nodeId: string, nodes: Node[], edges: Edge[]): boolean {
    const inputData = this.getNodeInputData(nodeId, nodes, edges);
    return Array.isArray(inputData) && inputData.length > 0;
  }

  /**
   * Gets the data flow path for a node (all nodes that contribute data)
   */
  static getDataFlowPath(nodeId: string, nodes: Node[], edges: Edge[]): string[] {
    const path: string[] = [];
    const visited = new Set<string>();
    
    const traverse = (currentNodeId: string) => {
      if (visited.has(currentNodeId)) return;
      visited.add(currentNodeId);
      
      const parentNodes = this.getParentNodes(currentNodeId, nodes, edges);
      
      if (parentNodes.length === 0) {
        // Source node
        path.unshift(currentNodeId);
      } else {
        parentNodes.forEach(parent => {
          traverse(parent.id);
        });
        path.push(currentNodeId);
      }
    };
    
    traverse(nodeId);
    return [...new Set(path)]; // Remove duplicates while preserving order
  }
}