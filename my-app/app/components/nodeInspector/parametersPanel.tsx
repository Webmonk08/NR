"use client"

// components/NodeInspector/ParametersPanel.tsx
import type React from "react"
import { Settings, Upload, CheckCircle, AlertCircle } from "lucide-react"
import type { ParameterConfig } from "@/app/types/nodeTypes"

interface ParametersPanelProps {
  config: Record<string, ParameterConfig>
  parameters: Record<string, any>
  effectiveColumns: string[]
  handleParameterChange: (key: string, value: any) => void
  loading: boolean
  error: string | null
  setShowFileUpload: (show: boolean) => void
}

const ParametersPanel: React.FC<ParametersPanelProps> = ({
  config,
  parameters,
  effectiveColumns,
  handleParameterChange,
  loading,
  error,
  setShowFileUpload,
}) => {
  const renderParameter = (key: string, paramConfig: ParameterConfig) => {
    const value = parameters[key]

    switch (paramConfig.type) {
      case "text":
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => handleParameterChange(key, e.target.value)}
            className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter value..."
            title={paramConfig.description}
          />
        )
      case "file":
        return (
          <div className="space-y-2">
            <button
              onClick={() => setShowFileUpload(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded text-xs flex items-center justify-center gap-2 transition-colors disabled:bg-blue-300"
              title="Upload file"
              disabled={loading}
            >
              <Upload size={12} />
              <span>{loading ? "Loading..." : "Upload File"}</span>
            </button>
            {parameters.fileName && (
              <div className="space-y-1 mt-2 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={12} className="text-green-500" />
                  <span>File: {parameters.fileName}</span>
                </div>
                {parameters.fileSize && (
                  <div className="pl-5">Size: {(parameters.fileSize / 1024).toFixed(1)} KB</div>
                )}
                {parameters.rowCount && <div className="pl-5">Rows: {parameters.rowCount}</div>}
              </div>
            )}
            {error && (
              <div className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle size={10} />
                Error: {error}
              </div>
            )}
          </div>
        )

      case "number":
        return (
          <input
            type="number"
            value={value || ""}
            min={paramConfig.min}
            max={paramConfig.max}
            step={paramConfig.step || 1}
            onChange={(e) => handleParameterChange(key, Number.parseFloat(e.target.value) || paramConfig.defaultValue)}
            className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            title={paramConfig.description}
          />
        )

      case "select":
        return (
          <select
            value={value || ""}
            onChange={(e) => handleParameterChange(key, e.target.value)}
            className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            title={paramConfig.description}
          >
            <option value="">Select option...</option>
            {paramConfig.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case "column-select":
        return (
          <select
            value={value || ""}
            onChange={(e) => handleParameterChange(key, e.target.value)}
            className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            title={paramConfig.description}
          >
            <option value="">Select column...</option>
            {effectiveColumns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        )

      case "checkbox":
        return (
          <label className="flex items-center gap-2" title={paramConfig.description}>
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleParameterChange(key, e.target.checked)}
              className="w-3 h-3 text-blue-600 border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-600">Enable</span>
          </label>
        )

      default:
        return null
    }
  }

  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-1 mb-2">
        <Settings size={12} className="text-slate-600" />
        <h4 className="text-xs font-medium text-slate-800">Parameters</h4>
      </div>

      {Object.keys(config).length === 0 ? (
        <p className="text-slate-500 text-xs italic">No parameters available</p>
      ) : (
        <div className="space-y-2">
          {Object.entries(config).map(([key, paramConfig]) => (
            <div key={key} className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">
                {paramConfig.label}
                {paramConfig.description && (
                  <span className="text-slate-500 font-normal ml-1">({paramConfig.description})</span>
                )}
              </label>
              {renderParameter(key, paramConfig)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ParametersPanel
