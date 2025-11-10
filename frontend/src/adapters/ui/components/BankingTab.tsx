import { useState, useMemo } from 'react';
import type { BankingData, Route } from '../../../core/domain/types';
import { TrendingUp, Wallet, PiggyBank } from 'lucide-react';

// Helper to format the large numbers
const formatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  maximumFractionDigits: 0,
});

// Define the props for our use cases
interface BankingActions {
  onFetchData: (shipId: string, year: number) => Promise<BankingData>;
  onBank: (shipId: string, year: number) => Promise<any>;
  onApply: (shipId: string, year: number) => Promise<any>;
}

interface BankingTabProps {
  routes: Route[]; // Pass in all routes to create a selector
  actions: BankingActions;
}

export const BankingTab = ({ routes, actions }: BankingTabProps) => {
  // --- Local UI State ---
  const [selectedShipId, setSelectedShipId] = useState<string>(routes[0]?.id || '');
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // --- Data State ---
  const [data, setData] = useState<BankingData>({ cb: null, records: [] });

  // --- Derived State ---
  const totalBanked = useMemo(() => {
    return data.records.reduce((sum, r) => sum + r.amount_gco2eq, 0);
  }, [data.records]);
  
  const currentCB = data.cb?.cb_gco2eq || 0;
  const isSurplus = currentCB > 0;
  const isDeficit = currentCB < 0;

  // --- Event Handlers ---
  const handleFetchData = async () => {
    if (!selectedShipId || !selectedYear) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await actions.onFetchData(selectedShipId, selectedYear);
      setData(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBank = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await actions.onBank(selectedShipId, selectedYear);
      await handleFetchData(); // Refresh all data
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await actions.onApply(selectedShipId, selectedYear);
      await handleFetchData(); // Refresh all data
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold gradient-text">Banking & Compliance</h2>
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
          onClick={handleFetchData}
          disabled={isLoading}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 transition-smooth font-medium"
        >
          {isLoading ? '⏳ Loading...' : '📊 Load CB'}
        </button>
      </div>
      
      {error && <div className="p-4 text-red-300 bg-red-900/30 border border-red-700/50 rounded-lg backdrop-blur-sm animate-fade-in-up">{error}</div>}

      {/* --- 2. Results --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current CB */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 p-6 rounded-lg shadow-lg border border-gray-700/50 backdrop-blur-sm hover:shadow-xl transition-smooth" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-300">Compliance Balance ({selectedYear})</h3>
          </div>
          {!data.cb ? (
            <p className="text-gray-500 mt-4">Load data to see CB</p>
          ) : (
            <>
              <p className={`text-5xl font-bold mt-4 font-mono ${isSurplus ? 'text-green-400' : isDeficit ? 'text-red-400' : 'text-gray-200'}`}>
                {formatter.format(currentCB)}
              </p>
              <p className="text-sm text-gray-400 mt-2">gCO₂e</p>
              <button
                onClick={handleBank}
                disabled={!isSurplus || isLoading}
                className="mt-6 w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth font-medium"
              >
                {isLoading ? '⏳ Banking...' : '🏦 Bank Surplus'}
              </button>
            </>
          )}
        </div>
        
        {/* Banked Surplus */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 p-6 rounded-lg shadow-lg border border-gray-700/50 backdrop-blur-sm hover:shadow-xl transition-smooth" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <PiggyBank className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-300">Total Available Bank</h3>
          </div>
          <p className="text-5xl font-bold mt-4 text-blue-400 font-mono">
            {formatter.format(totalBanked)}
          </p>
          <p className="text-sm text-gray-400 mt-2">gCO₂e</p>
          <button
            onClick={handleApply}
            disabled={!isDeficit || totalBanked <= 0 || isLoading}
            className="mt-6 w-full px-4 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white rounded-lg hover:shadow-lg hover:shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth font-medium"
          >
            {isLoading ? '⏳ Applying...' : '💰 Apply Bank to Deficit'}
          </button>
        </div>
      </div>
    </div>
  );
};