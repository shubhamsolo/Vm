import type { ComparisonData } from "../../../core/domain/types";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { BarChart3, Target } from 'lucide-react';

interface CompareTabProps {
  data: ComparisonData;
  isLoading: boolean;
  error: string | null;
}

export const CompareTab = ({ data, isLoading, error }: CompareTabProps) => {
  if (isLoading) {
    return (
      <div className="p-4 animate-fade-in-up">
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin-slow"></div>
          </div>
          <p className="text-gray-400 mt-4">Loading comparison data...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return <div className="p-4 text-red-300 bg-red-900/30 border border-red-700/50 rounded-lg animate-fade-in-up">{error}</div>;
  }
  if (!data.baseline) {
    return <div className="p-4 text-yellow-300 bg-yellow-900/30 border border-yellow-700/50 rounded-lg animate-fade-in-up">Please set a baseline route in the 'Routes' tab first.</div>;
  }

  // Combine baseline + comparisons for the chart
  const chartData = [
    { ...data.baseline, name: `Baseline (${data.baseline.route_id})` },
    ...data.comparisons.map(c => ({ ...c, name: c.route_id })),
  ];

  return (
    <div className="p-4 space-y-8 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold gradient-text">Baseline Comparison</h2>
      </div>
      
      {/* --- Chart --- */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 p-6 rounded-lg shadow-lg border border-gray-700/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">
            GHG Intensity (gCO₂e/MJ)
          </h3>
        </div>
        <div style={{ width: '100%', height: 300 }} className="animate-fade-in-up">
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis dataKey="name" stroke="#D1D5DB" />
              <YAxis stroke="#D1D5DB" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '0.5rem' }} 
                labelStyle={{ color: '#F9FAFB' }}
              />
              <Legend wrapperStyle={{ color: '#D1D5DB' }} />
              <ReferenceLine y={data.target} label={{ value: `2025 Target: ${data.target}`, fill: '#34D399', dy: -10 }} stroke="#34D399" strokeDasharray="4 4" />
              <ReferenceLine y={data.baseline.ghg_intensity} label={{ value: 'Baseline', fill: '#60A5FA', dy: 10 }} stroke="#60A5FA" strokeDasharray="4 4" />
              <Bar dataKey="ghg_intensity" name="GHG Intensity" fill="#A78BFA" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- Table --- */}
      <div className="rounded-lg overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-700/50 shadow-lg backdrop-blur-sm">
        <table className="min-w-full divide-y divide-gray-700/50">
          <thead className="bg-gradient-to-r from-gray-800 to-gray-700/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Route ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">GHG Intensity</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">% Diff from Baseline</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">2025 Compliant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50 text-gray-200">
            {/* Baseline Row */}
            <tr className="bg-gradient-to-r from-blue-900/30 to-transparent hover:from-blue-900/50 transition-smooth">
              <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-300">{data.baseline.route_id} (Baseline)</td>
              <td className="px-6 py-4 whitespace-nowrap font-medium">{data.baseline.ghg_intensity.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-400">0.00 %</td>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-lg">
                {data.baseline.ghg_intensity <= data.target ? '✅' : '❌'}
              </td>
            </tr>
            {/* Comparison Rows */}
            {data.comparisons.map((route, idx) => (
              <tr key={route.id} className="hover:bg-gray-700/30 transition-smooth" style={{ animationDelay: `${idx * 50}ms` }}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{route.route_id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{route.ghg_intensity.toFixed(2)}</td>
                <td className={`px-6 py-4 whitespace-nowrap font-semibold ${route.percentDiff > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {route.percentDiff > 0 ? '+' : ''}{route.percentDiff.toFixed(2)} %
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-lg">
                  {route.compliant ? '✅' : '❌'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};