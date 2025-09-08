"use client"

// components/NodeInspector/PreviewPanel.tsx
import type React from "react"
import { useMemo } from "react"
import {
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { RefreshCw } from "lucide-react"
import type { Node } from "reactflow"

interface PreviewPanelProps {
  selectedNode: Node
  showPreview: boolean
  previewData: any[]
  parameters: Record<string, any>
  effectiveColumns: string[]
  loading: boolean
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  selectedNode,
  showPreview,
  previewData,
  parameters,
  effectiveColumns,
  loading,
}) => {
  const PreviewComponent = useMemo(() => {
    if (!showPreview) return null

    const toolId = selectedNode.data.toolId

    const isSourceNode = ["file", "csv"].includes(toolId)
    if (isSourceNode) {
      // Show file information when file is uploaded
      if (parameters.path || parameters.fileName) {
        return (
          <div className="bg-slate-50 p-3 rounded">
            <div className="text-xs font-medium text-slate-700 mb-2">📁 File Details</div>

            <div className="space-y-1 mb-3">
              <div className="text-xs">
                <span className="font-medium text-slate-600">Name:</span> {parameters.fileName || parameters.path}
              </div>
              {parameters.fileSize && (
                <div className="text-xs">
                  <span className="font-medium text-slate-600">Size:</span> {(parameters.fileSize / 1024).toFixed(1)} KB
                </div>
              )}
              {parameters.fileType && (
                <div className="text-xs">
                  <span className="font-medium text-slate-600">Type:</span> {parameters.fileType}
                </div>
              )}
              {parameters.rowCount && (
                <div className="text-xs">
                  <span className="font-medium text-slate-600">Rows:</span> {parameters.rowCount}
                </div>
              )}
              {effectiveColumns.length > 0 && (
                <div className="text-xs">
                  <span className="font-medium text-slate-600">Columns:</span> {effectiveColumns.length}
                </div>
              )}
            </div>

            {previewData.length > 0 ? (
              <>
                <div className="text-xs font-medium text-slate-700 mb-2">Data Preview</div>
                {loading ? (
                  <div className="text-center py-4">
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2" />
                    <div className="text-xs text-slate-500">Loading data...</div>
                  </div>
                ) : (
                  <>
                    <div className="max-h-32 overflow-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-200">
                            {effectiveColumns.map((col) => (
                              <th key={col} className="text-left p-1 font-medium text-slate-600">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.slice(0, 5).map((row, i) => (
                            <tr key={i} className="border-b border-slate-100">
                              {effectiveColumns.map((col, j) => (
                                <td key={j} className="p-1 text-slate-700">
                                  {typeof row[col] === "number" ? Number(row[col]).toFixed(2) : String(row[col] || "-")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      Showing 5 of {previewData.length} rows • {effectiveColumns.length} columns
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-4 border-2 border-dashed border-slate-300 rounded">
                <div className="text-xs text-slate-500">File uploaded successfully</div>
                <div className="text-xs text-slate-400 mt-1">Connect to see data preview</div>
              </div>
            )}
          </div>
        )
      } else {
        return (
          <div className="bg-slate-50 p-3 rounded">
            <div className="text-center py-4 border-2 border-dashed border-slate-300 rounded">
              <div className="text-2xl mb-2">📁</div>
              <div className="text-xs text-slate-600 font-medium">No file selected</div>
              <div className="text-xs text-slate-500 mt-1">Upload a file to get started</div>
            </div>
          </div>
        )
      }
    }

    // Handle case where no data is available yet
    if (previewData.length === 0) return null

    const xCol = parameters.xAxis || effectiveColumns[0] || "x"
    const yCol = parameters.yAxis || effectiveColumns[1] || "y"
    const categoryCol = parameters.groupBy || parameters.colorBy || effectiveColumns[2] || "category"
    const valueCol = parameters.column || parameters.yAxis || effectiveColumns[1] || "value"

    switch (toolId) {
      case "scatter-plot":
        return (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={previewData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xCol} tick={{ fontSize: 10 }} />
                <YAxis dataKey={yCol} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Scatter dataKey={yCol} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )

      case "line-plot":
        return (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={previewData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xCol} tick={{ fontSize: 10 }} />
                <YAxis dataKey={yCol} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey={yCol} stroke={parameters.lineColor || "#8884d8"} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )

      case "bar-plot":
        return (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={previewData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xCol} tick={{ fontSize: 10 }} />
                <YAxis dataKey={yCol} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey={valueCol} fill={parameters.barColor || "#8884d8"} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )

      case "box-plot":
        return (
          <div className="h-48 w-full flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-300 rounded">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm text-slate-600">Box Plot Preview</div>
              <div className="text-xs text-slate-500">Column: {valueCol}</div>
              {parameters.groupBy && <div className="text-xs text-slate-500">Grouped by: {parameters.groupBy}</div>}
            </div>
          </div>
        )

      default:
        if (selectedNode.data.category && ["data", "transform", "model"].includes(selectedNode.data.category)) {
          return (
            <div className="bg-slate-50 p-3 rounded">
              <div className="text-xs font-medium text-slate-700 mb-2">Data Preview</div>
              {loading ? (
                <div className="text-center py-4">
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2" />
                  <div className="text-xs text-slate-500">Loading data...</div>
                </div>
              ) : (
                <>
                  <div className="max-h-32 overflow-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-200">
                          {effectiveColumns.map((col) => (
                            <th key={col} className="text-left p-1 font-medium text-slate-600">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.slice(0, 5).map((row, i) => (
                          <tr key={i} className="border-b border-slate-100">
                            {effectiveColumns.map((col, j) => (
                              <td key={j} className="p-1 text-slate-700">
                                {typeof row[col] === "number" ? Number(row[col]).toFixed(2) : String(row[col] || "-")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Showing 5 of {previewData.length} rows • {effectiveColumns.length} columns
                  </div>
                </>
              )}
            </div>
          )
        }
        return null
    }
  }, [selectedNode, showPreview, previewData, parameters, effectiveColumns, loading])

  return PreviewComponent
}

export default PreviewPanel
