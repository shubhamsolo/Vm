import type { Route } from "../../../core/domain/types";
import { Ship, CheckCircle, MapPin, Gauge } from 'lucide-react';

interface RoutesTabProps {
  routes: Route[];
  onSetBaseline: (routeId: string) => void;
  routesLoading: boolean;
  routesError: string | null;
}

export const RoutesTab = ({ routes, onSetBaseline, routesLoading, routesError }: RoutesTabProps) => {
  if (routesLoading) {
    return (
      <div className="p-4 animate-fade-in-up">
        <h2 className="text-2xl font-bold mb-6 gradient-text">Routes</h2>
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin-slow"></div>
          </div>
          <p className="text-gray-400 mt-4">Loading routes...</p>
        </div>
      </div>
    );
  }

  if (routesError) {
    return (
      <div className="p-4 animate-fade-in-up">
        <h2 className="text-2xl font-bold mb-6 gradient-text">Routes</h2>
        <div className="p-4 text-red-300 bg-red-900/30 border border-red-700/50 rounded-lg backdrop-blur-sm">{routesError}</div>
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="p-4 animate-fade-in-up">
        <h2 className="text-2xl font-bold mb-6 gradient-text">Routes</h2>
        <div className="text-center py-12 text-gray-400">
          No routes found. Make sure the backend is running and accessible.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold gradient-text">Routes</h2>
      </div>
      
      <div className="overflow-x-auto rounded-lg border border-gray-700/50">
        <table className="min-w-full divide-y divide-gray-700/50">
          <thead className="bg-gradient-to-r from-gray-800 to-gray-700/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Route ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Ship className="w-4 h-4" /> Vessel Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Gauge className="w-4 h-4" /> GHG Intensity
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {routes.map((route, idx) => (
              <tr key={route.id} className="bg-gray-800/50 hover:bg-gray-700/50 transition-smooth group" style={{ animationDelay: `${idx * 50}ms` }}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500/20 rounded">
                    <MapPin className="w-3 h-3 text-blue-400" />
                  </div>
                  {route.route_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 flex items-center gap-2">
                  <div className="p-1.5 bg-cyan-500/20 rounded">
                    <Ship className="w-3 h-3 text-cyan-400" />
                  </div>
                  {route.vesselType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 flex items-center gap-2">
                  <div className="p-1.5 bg-orange-500/20 rounded">
                    <Gauge className="w-3 h-3 text-orange-400" />
                  </div>
                  <span className="font-mono">{route.ghg_intensity}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => onSetBaseline(route.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-smooth flex items-center gap-2 ${
                      route.is_baseline
                        ? "bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/30 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105"
                    }`}
                    disabled={route.is_baseline}
                  >
                    {route.is_baseline ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Baseline
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Set Baseline
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};