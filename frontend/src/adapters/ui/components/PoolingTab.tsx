import { useState, useMemo } from 'react';
import type { Route, AdjustedCB } from '../../../core/domain/types';
import { Zap, Users, Trash2 } from 'lucide-react';

const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

// Define the props for our use cases
interface PoolingActions {
  onFetchAdjustedCB: (shipId: string, year: number) => Promise<AdjustedCB>;
  onCreatePool: (shipIds: string[], year: number) => Promise<any>;
}

interface PoolingTabProps {
  routes: Route[];
  actions: PoolingActions;
}

type PoolMember = {
  route: Route;
  cb: number;
};

export const PoolingTab = ({ routes, actions }: PoolingTabProps) => {
  // --- Local UI State ---
  const [selectedShipId, setSelectedShipId] = useState<string>(routes[0]?.id || '');
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // --- Data State ---
  const [poolMembers, setPoolMembers] = useState<PoolMember[]>([]);

  // --- Derived State (Pool Sum) ---
  const poolSum = useMemo(() => {
    return poolMembers.reduce((sum, m) => sum + m.cb, 0);
  }, [poolMembers]);
  const isPoolValid = poolSum >= 0;

  // --- Event Handlers ---
  const handleAddShip = async () => {
    if (!selectedShipId || !selectedYear) return;
    // Prevent adding the same ship twice
    if (poolMembers.find(m => m.route.id === selectedShipId)) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const route = routes.find(r => r.id === selectedShipId)!;
      const result = await actions.onFetchAdjustedCB(selectedShipId, selectedYear);
      
      setPoolMembers([...poolMembers, {
        route: route,
        cb: result.adjusted_cb_gco2eq,
      }]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveShip = (shipId: string) => {
    setPoolMembers(poolMembers.filter(m => m.route.id !== shipId));
  };

  const handleCreatePool = async () => {
    if (!isPoolValid || poolMembers.length < 2) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const shipIds = poolMembers.map(m => m.route.id);
      await actions.onCreatePool(shipIds, selectedYear);
      
      setSuccess(`Pool created successfully! ${shipIds.length} members' balances have been updated.`);
      setPoolMembers([]); // Clear the pool
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold gradient-text">Create a Pool</h2>
      </div>

      {/* --- 1. Controls --- */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 p-6 rounded-lg shadow-lg border border-gray-700/50 backdrop-blur-sm flex items-end space-x-4">
        <div className="flex-1">
          <label htmlFor="ship-select" className="block text-sm font-semibold text-gray-300 mb-2">Ship</label>
          <select
            id="ship-select"
            value={selectedShipId}
            onChange={(e) => setSelectedShipId(e.target.value)}
            className="w-full pl-3 pr-10 py-2 text-base bg-gray-700/50 border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm rounded-lg text-white transition-smooth hover:bg-gray-700"
          >
            {routes.map(r => (
              <option key={r.id} value={r.id}>{r.route_id} ({r.vesselType})</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="year-select" className="block text-sm font-semibold text-gray-300 mb-2">Year</label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-full pl-3 pr-10 py-2 text-base bg-gray-700/50 border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm rounded-lg text-white transition-smooth hover:bg-gray-700"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
        </div>
        <button
          onClick={handleAddShip}
          disabled={isLoading}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 transition-smooth font-medium"
        >
          {isLoading ? '⏳ Adding...' : '➕ Add to Pool'}
        </button>
      </div>
      
      {error && <div className="p-4 text-red-300 bg-red-900/30 border border-red-700/50 rounded-lg backdrop-blur-sm animate-fade-in-up">{error}</div>}
      {success && <div className="p-4 text-green-300 bg-green-900/30 border border-green-700/50 rounded-lg backdrop-blur-sm animate-fade-in-up">{success}</div>}

      {/* --- 2. Pool Staging Area --- */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 p-6 rounded-lg shadow-lg border border-gray-700/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Staged Pool Members</h3>
        </div>
        <div className="space-y-3">
          {poolMembers.map((member, idx) => (
            <div key={member.route.id} className="flex justify-between items-center bg-gray-700/50 p-4 rounded-lg border border-gray-600/30 hover:border-gray-600/50 transition-smooth group" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyan-500/20 rounded">
                  <Users className="w-3 h-3 text-cyan-400" />
                </div>
                <div>
                  <span className="font-semibold text-white">{member.route.route_id}</span>
                  <span className="text-sm text-gray-400 ml-2">({member.route.vesselType})</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`font-mono text-lg font-bold ${member.cb > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {member.cb > 0 ? '+' : ''}{formatter.format(member.cb)}
                </span>
                <button 
                  onClick={() => handleRemoveShip(member.route.id)}
                  className="text-gray-400 hover:text-red-400 transition-smooth p-1 hover:bg-red-500/20 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {poolMembers.length === 0 && <p className="text-gray-500 text-center py-4">Add ships to the pool.</p>}
        </div>
        
        {/* --- Pool Summary & Action --- */}
        <div className="my-6 border-t border-gray-700/50"></div>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-lg font-semibold text-gray-300">Pool Sum:</span>
            <span className={`text-3xl font-bold ml-3 font-mono ${isPoolValid ? 'text-green-400' : 'text-red-400'}`}>
              {poolSum > 0 ? '+' : ''}{formatter.format(poolSum)}
            </span>
          </div>
          <button
            onClick={handleCreatePool}
            disabled={!isPoolValid || poolMembers.length < 2 || isLoading}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth font-medium"
          >
            {isLoading ? '⏳ Creating...' : '✨ Create Pool'}
          </button>
        </div>
        {!isPoolValid && <p className="text-red-400 text-sm mt-3 flex items-center"><span className="mr-2">⚠️</span>Pool sum must be zero or positive.</p>}
        {poolMembers.length < 2 && poolMembers.length > 0 && <p className="text-yellow-400 text-sm mt-3 flex items-center"><span className="mr-2">ℹ️</span>A pool requires at least 2 members.</p>}
      </div>
    </div>
  );
};