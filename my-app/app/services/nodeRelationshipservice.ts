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
        return currentNode.data.outputData || [];
      }
      return [];
    }

    // Combine data from all parent nodes
    const combinedData: any[] = [];
    parentNodes.forEach(parent => {
      if (parent.data.outputData) {
        combinedData.push(...parent.data.outputData);
      }
    });

    return combinedData;
  }

  static getAvailableColumns(nodeId: string, nodes: Node[], edges: Edge[]): string[] {
    const parentNodes = this.getParentNodes(nodeId, nodes, edges);
    const allColumns = new Set<string>();

    parentNodes.forEach(parent => {
      if (parent.data.outputColumns) {
        parent.data.outputColumns.forEach((col: string) => allColumns.add(col));
      }
    });

    // If no parent nodes, provide default columns for source nodes
    if (allColumns.size === 0) {
      const currentNode = nodes.find(n => n.id === nodeId);
      if (currentNode && ['file', 'csv'].includes(currentNode.data.toolId)) {
        ['id', 'name', 'value', 'category', 'x', 'y', 'date', 'amount'].forEach(col => 
          allColumns.add(col)
        );
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
}