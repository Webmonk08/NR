// components/NodeInspector/index.tsx
"use client"
import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import type { Node, Edge } from "reactflow"
import { useFileStore } from "@/app/store/useFlowStore"
import { nodeConfigs } from "@/app/data/nodeConfig"
import Header from "./header"
import StatusPanel from "./statusPanel"
import PreviewPanel from "./previewPanel"
import ParametersPanel from "./parametersPanel"
import ConnectionMessage from "./connectionMessage"
import FileUpload from "./fileUpload"

interface NodeInspectorProps {
  selectedNode: Node | null
  onClose: () => void
  onUpdateNode: (nodeId: string, data: any) => void
  onExecuteNode: (nodeId: string) => void
  position?: { x: number; y: number }
  nodeData?: any[]
  availableColumns?: string[]
  edges?: Edge[]
}

const NodeInspector: React.FC<NodeInspectorProps> = ({
  selectedNode,
  onClose,
  onUpdateNode,
  onExecuteNode,
  position = { x: 0, y: 0 },
  nodeData = [],
  availableColumns = [],
  edges = [],
}) => {
  const [parameters, setParameters] = useState<Record<string, any>>({})
  const [executionStatus, setExecutionStatus] = useState<"idle" | "running" | "success" | "error">("idle")
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const [showPreview, setShowPreview] = useState(true)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  const { 
    uploadFileForNode, 
    getNodeData, 
    getNodeProcessedData,
    setNodeProcessedData,
    loading, 
    error 
  } = useFileStore()

  const hasIncomingEdges = useMemo(() => {
    if (!selectedNode) return false
    return edges.some((edge) => edge.target === selectedNode.id)
  }, [selectedNode, edges])

  const hasOutgoingEdges = useMemo(() => {
    if (!selectedNode) return false
    return edges.some((edge) => edge.source === selectedNode.id)
  }, [selectedNode, edges])

  const isSourceNode = useMemo(() => {
    if (!selectedNode) return false
    return ["file", "csv"].includes(selectedNode.data.toolId)
  }, [selectedNode])

  const shouldShowDetails = useMemo(() => {
    if (!selectedNode) return false
    return isSourceNode || hasIncomingEdges
  }, [selectedNode, isSourceNode, hasIncomingEdges])

  // Get node-specific data from the store
  const currentNodeData = useMemo(() => {
    if (!selectedNode) return null
    return getNodeData(selectedNode.id)
  }, [selectedNode, getNodeData])

  const currentNodeProcessedData = useMemo(() => {
    if (!selectedNode) return null
    return getNodeProcessedData(selectedNode.id)
  }, [selectedNode, getNodeProcessedData])

  const effectiveColumns = useMemo(() => {
    if (availableColumns && availableColumns.length > 0) {
      return availableColumns
    }
    if (currentNodeData?.columns && currentNodeData.columns.length > 0) {
      return currentNodeData.columns
    }
    if (currentNodeProcessedData?.columns && currentNodeProcessedData.columns.length > 0) {
      return currentNodeProcessedData.columns
    }
    return ["x", "y", "category", "value", "index"]
  }, [availableColumns, currentNodeData, currentNodeProcessedData])

  const effectiveData = useMemo(() => {
    if (nodeData && nodeData.length > 0) {
      return nodeData
    }
    if (currentNodeProcessedData?.data && currentNodeProcessedData.data.length > 0) {
      return currentNodeProcessedData.data
    }
    if (currentNodeData?.data && currentNodeData.data.length > 0) {
      return currentNodeData.data
    }
    return Array.from({ length: 20 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      category: ["A", "B", "C"][Math.floor(Math.random() * 3)],
      value: Math.random() * 50 + 10,
      index: i,
    }))
  }, [nodeData, currentNodeData, currentNodeProcessedData])

  const previewData = useMemo(() => {
    if (!shouldShowDetails) return []
    return effectiveData.slice(0, 50)
  }, [effectiveData, shouldShowDetails])

  useEffect(() => {
    if (selectedNode) {
      const toolId = selectedNode.data.toolId
      const config = nodeConfigs[toolId] || {}
      const initialParams: Record<string, any> = {}

      Object.entries(config).forEach(([key, paramConfig]) => {
        initialParams[key] = selectedNode.data.parameters?.[key] ?? paramConfig.defaultValue
      })

      setParameters(initialParams)
      setExecutionStatus(selectedNode.data.status || "idle")
    }
  }, [selectedNode])

  useEffect(() => {
    if (selectedNode && popupRef.current) {
      const popup = popupRef.current
      const rect = popup.getBoundingClientRect()

      let x = position.x - rect.width / 2
      let y = position.y - rect.height - 15

      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const padding = 10

      if (x < padding) x = padding
      if (x + rect.width > viewportWidth - padding) x = viewportWidth - rect.width - padding

      if (y < padding) {
        y = position.y + 80
      }
      if (y + rect.height > viewportHeight - padding) {
        y = viewportHeight - rect.height - padding
      }

      setPopupPosition({ x, y })
    }
  }, [selectedNode, position])

  const handleParameterChange = (key: string, value: any) => {
    const newParams = { ...parameters, [key]: value }
    setParameters(newParams)

    if (selectedNode) {
      onUpdateNode(selectedNode.id, {
        ...selectedNode.data,
        parameters: newParams,
      })
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!selectedNode) return

    try {
      const nodeFileData = await uploadFileForNode(selectedNode.id, file)

      const updatedNodeData = {
        ...selectedNode.data,
        parameters: {
          ...parameters,
          path: file.name,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          rowCount: nodeFileData.data?.length || 0,
          columns: nodeFileData.columns,
        },
        status: "success",
        hasFile: true,
        fileColumns: nodeFileData.columns,
        fileData: nodeFileData.data,
      }

      onUpdateNode(selectedNode.id, updatedNodeData)

      setParameters((prev) => ({
        ...prev,
        path: file.name,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        rowCount: nodeFileData.data?.length || 0,
        columns: nodeFileData.columns,
      }))

      setExecutionStatus("success")
      setShowPreview(true)
      setShowFileUpload(false)
    } catch (err) {
      console.error("File upload failed:", err)
      setExecutionStatus("error")
    }
  }

  const handleExecute = () => {
    if (selectedNode) {
      setExecutionStatus("running")
      onExecuteNode(selectedNode.id)

      setTimeout(() => {
        setExecutionStatus(Math.random() > 0.2 ? "success" : "error")
      }, 2000)
    }
  }

  if (!selectedNode) return null

  const toolId = selectedNode.data.toolId
  const config = nodeConfigs[toolId] || {}

  return (
    <>
      <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose} />

      <div
        ref={popupRef}
        className="fixed bg-white border border-slate-300 rounded-lg shadow-2xl z-50 w-80 max-h-96 overflow-hidden"
        style={{
          left: popupPosition.x,
          top: popupPosition.y,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Header
          selectedNode={selectedNode}
          showPreview={showPreview}
          setShowPreview={setShowPreview}
          onClose={onClose}
          shouldShowDetails={shouldShowDetails}
          hasIncomingEdges={hasIncomingEdges}
          fileData={effectiveData}
        />

        {shouldShowDetails && (
          <StatusPanel
            executionStatus={executionStatus}
            loading={loading}
            fileData={effectiveData}
            setShowPreview={setShowPreview}
          />
        )}

        <div className="max-h-60 overflow-y-auto">
          {shouldShowDetails ? (
            <>
              <PreviewPanel
                selectedNode={selectedNode}
                showPreview={showPreview}
                previewData={previewData}
                parameters={parameters}
                effectiveColumns={effectiveColumns}
                loading={loading}
              />

              <ParametersPanel
                config={config}
                parameters={parameters}
                effectiveColumns={effectiveColumns}
                handleParameterChange={handleParameterChange}
                loading={loading}
                error={error}
                setShowFileUpload={setShowFileUpload}
              />
            </>
          ) : (
            <ConnectionMessage isSourceNode={isSourceNode} hasIncomingEdges={hasIncomingEdges} fileData={effectiveData} />
          )}
        </div>

        <div className="px-3 py-1.5 border-t border-slate-200 bg-slate-50 rounded-b-lg">
          <div className="text-xs text-slate-500 text-center">
            {shouldShowDetails ? (
              <>
                Configure parameters • {showPreview ? "Preview enabled" : "Preview disabled"}
                {selectedNode.data.parentNodes?.length > 0 && <> • {selectedNode.data.parentNodes.length} parent(s)</>}
                {selectedNode.data.childNodes?.length > 0 && <> • {selectedNode.data.childNodes.length} child(ren)</>}
              </>
            ) : (
              <>Connect nodes to enable configuration</>
            )}
          </div>
        </div>
      </div>

      {showFileUpload && (
        <FileUpload
          onClose={() => setShowFileUpload(false)}
          onFileUpload={handleFileUpload}
        />
      )}
    </>
  )
}

export default NodeInspector
