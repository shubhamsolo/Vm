import { useState, useEffect, useCallback } from 'react';
import type { AppDependencies } from './main'; 
import type { Route, ComparisonData } from './core/domain/types';
import { RoutesTab } from './adapters/ui/components/RoutesTab';
import { CompareTab } from './adapters/ui/components/CompareTab';
import { BankingTab } from './adapters/ui/components/BankingTab';
import { PoolingTab } from './adapters/ui/components/PoolingTab';
import { Ship, BarChart3, TrendingUp, Zap } from 'lucide-react';

interface AppProps {
  dependencies: AppDependencies;
}

const getTabClass = (isActive: boolean) =>
  `py-2 px-4 font-medium text-sm rounded-t-lg transition-smooth
  ${isActive
    ? 'border-b-2 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/20'
    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
  }`;

function App({ dependencies }: AppProps) {
  const [activeTab, setActiveTab] = useState('routes');
  
  // State for Routes Tab
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [routesError, setRoutesError] = useState<string | null>(null);

  // State for Compare Tab
  const [compareData, setCompareData] = useState<ComparisonData | null>(null);
  const [compareLoading, setCompareLoading] = useState(true);
  const [compareError, setCompareError] = useState<string | null>(null);

  // --- "Routes" Data Fetching ---
  const loadRoutes = useCallback(async () => {
    setRoutesLoading(true);
    setRoutesError(null);
    try {
      const fetchedRoutes = await dependencies.fetchRoutes.execute();
      setRoutes(fetchedRoutes);
    } catch (err) {
      setRoutesError("Failed to fetch routes.");
    } finally {
      setRoutesLoading(false);
    }
  }, [dependencies.fetchRoutes]);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  const handleSetBaseline = async (routeId: string) => {
    try {
      await dependencies.setBaseline.execute(routeId);
      await loadRoutes(); 
      await loadCompareData(); 
    } catch (err) {
      setRoutesError("Failed to set baseline.");
    }
  };

  // --- "Compare" Data Fetching ---
  const loadCompareData = useCallback(async () => {
    setCompareLoading(true);
    setCompareError(null);
    try {
      const fetchedData = await dependencies.fetchComparisonData.execute();
      setCompareData(fetchedData);
    } catch (err) {
      setCompareError("Failed to fetch comparison data.");
    } finally {
      setCompareLoading(false);
    }
  }, [dependencies.fetchComparisonData]);

  useEffect(() => {
    if (activeTab === 'compare') {
      loadCompareData();
    }
  }, [activeTab, loadCompareData]);

  // --- Pass down actions ---
  const bankingActions = {
    onFetchData: dependencies.fetchBankingData.execute.bind(dependencies.fetchBankingData),
    onBank: dependencies.bankSurplus.execute.bind(dependencies.bankSurplus),
    onApply: dependencies.applySurplus.execute.bind(dependencies.applySurplus),
  };
  
  const poolingActions = {
    onFetchAdjustedCB: dependencies.fetchAdjustedCB.execute.bind(dependencies.fetchAdjustedCB),
    onCreatePool: dependencies.createPool.execute.bind(dependencies.createPool),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header with visual appeal */}
      <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-blue-900/40 border-b border-blue-500/20 backdrop-blur-sm">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Ship className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold gradient-text">FuelEU Maritime</h1>
                <p className="text-blue-300 text-sm">Compliance Dashboard</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm ml-16">Real-time compliance monitoring and pool management system</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-7xl">
        {/* Tab Navigation with Icons */}
        <nav className="flex border-b border-gray-700/50 mb-6 gap-2 animate-slide-in-left overflow-x-auto">
          <button onClick={() => setActiveTab('routes')} className={`flex items-center gap-2 ${getTabClass(activeTab === 'routes')}`}>
            <Ship className="w-4 h-4" />
            Routes
          </button>
          <button onClick={() => setActiveTab('compare')} className={`flex items-center gap-2 ${getTabClass(activeTab === 'compare')}`}>
            <BarChart3 className="w-4 h-4" />
            Compare
          </button>
          <button onClick={() => setActiveTab('banking')} className={`flex items-center gap-2 ${getTabClass(activeTab === 'banking')}`}>
            <TrendingUp className="w-4 h-4" />
            Banking
          </button>
          <button onClick={() => setActiveTab('pooling')} className={`flex items-center gap-2 ${getTabClass(activeTab === 'pooling')}`}>
            <Zap className="w-4 h-4" />
            Pooling
          </button>
        </nav>
        
        <main>
          {activeTab === 'routes' && (
            <RoutesTab
              routes={routes}
              onSetBaseline={handleSetBaseline}
              routesLoading={routesLoading}
              routesError={routesError}
            />
          )}
          {activeTab === 'compare' && (
            <CompareTab
              data={compareData!}
              isLoading={compareLoading}
              error={compareError}
            />
          )}
          {activeTab === 'banking' && (
            <BankingTab
              routes={routes}
              actions={bankingActions}
            />
          )}
          {/* --- 3. RENDER THE POOLING TAB --- */}
          {activeTab === 'pooling' && (
            <PoolingTab 
              routes={routes}
              actions={poolingActions}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;