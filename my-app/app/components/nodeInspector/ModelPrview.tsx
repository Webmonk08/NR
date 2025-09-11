import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, Target, Award, BarChart3, Info } from "lucide-react";

type Metrics = {
  precision: number;
  recall: number;
  "f1-score": number;
  support: number;
};

type ClassificationReport = {
  [key: string]: Metrics | number;
};

export type ModelData = {
  classification_report: ClassificationReport;
  feature_importances: Record<string, number>;
  confusion_matrix: number[][];
};

interface ModelPreviewProps {
  modelData: ModelData | null;
}

function ModelPreview({ modelData }: ModelPreviewProps) {
  const [activeTab, setActiveTab] = useState<'report' | 'features'>('report');

  if (!modelData) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No model data available</p>
          <p className="text-slate-400 text-sm mt-1">Upload a model to see analysis</p>
        </div>
      </div>
    );
  }

  const { classification_report, feature_importances } = modelData;

  const featureData = Object.entries(feature_importances)
    .map(([feature, importance]) => {
      const num = Number(importance);
      return {
        feature: feature.length > 15 ? feature.substring(0, 12) + '...' : feature,
        fullFeature: feature,
        importance: Number.isFinite(num) ? Number(num.toFixed(4)) : 0,
      };
    })
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 10); // Show top 10 features

  const reportData = Object.entries(classification_report)
    .filter(([key]) => key !== "accuracy")
    .map(([key, value]) => ({
      class: key,
      ...(value as Metrics),
    }));

  const accuracy = classification_report.accuracy as number;

  // Generate colors for the bar chart
  const generateColors = (count: number) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = (i * 137.5) % 360; // Golden angle approximation
      colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    return colors;
  };

  const chartColors = generateColors(featureData.length);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-medium text-slate-900">{data.fullFeature}</p>
          <p className="text-blue-600">
            Importance: <span className="font-semibold">{data.importance}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return "text-green-600 bg-green-50";
    if (score >= 0.8) return "text-blue-600 bg-blue-50";
    if (score >= 0.7) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 0.9) return <Award className="h-4 w-4" />;
    if (score >= 0.8) return <Target className="h-4 w-4" />;
    return <TrendingUp className="h-4 w-4" />;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Model Performance Analysis</h1>
        <p className="text-blue-100">Comprehensive evaluation metrics and insights</p>
      </div>

      {/* Accuracy Card */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">Overall Accuracy</h3>
            <p className="text-slate-600 text-sm">Model prediction accuracy</p>
          </div>
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${getScoreColor(accuracy)}`}>
            {getScoreIcon(accuracy)}
            <span className="text-2xl font-bold">{(accuracy * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('report')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'report'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Classification Report</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'features'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Feature Importance</span>
              </div>
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'report' && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Info className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-800">Per-Class Metrics</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        Class
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        Precision
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        Recall
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        F1-Score
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        Support
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reportData.map((row, index) => (
                      <tr key={row.class} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900 capitalize">
                          {row.class}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(row.precision)}`}>
                            {row.precision.toFixed(3)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(row.recall)}`}>
                            {row.recall.toFixed(3)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(row["f1-score"])}`}>
                            {row["f1-score"].toFixed(3)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 font-medium">
                          {row.support}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-800">Top Feature Importance</h3>
                <span className="text-sm text-slate-500">({featureData.length} most important features)</span>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={featureData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="feature" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                      stroke="#64748b"
                    />
                    <YAxis 
                      fontSize={12}
                      stroke="#64748b"
                      tickFormatter={(value) => value.toFixed(3)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="importance" radius={[4, 4, 0, 0]}>
                      {featureData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-slate-600">
                <p>Feature importance values indicate how much each feature contributes to the model's predictions.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModelPreview;