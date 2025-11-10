import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' 

// 1. Import adapter
import { AxiosApiClient } from './adapters/infrastructure/AxiosApiClient'

// 2. Import use cases
import { FetchRoutes } from './core/application/FetchRoutes'
import { SetBaseline } from './core/application/SetBaseline'
import { FetchComparisonData } from './core/application/FetchComparisonData';
import { FetchBankingData } from './core/application/FetchBankingData';
import { BankSurplus } from './core/application/BankSurplus';
import { ApplySurplus } from './core/application/ApplySurplus';
// --- Pooling Imports ---
import { FetchAdjustedCB } from './core/application/FetchAdjustedCB';
import { CreatePool } from './core/application/CreatePool';

// --- DEPENDENCY INJECTION ---
const apiClient = new AxiosApiClient()

const appDependencies = {
  // Routes
  fetchRoutes: new FetchRoutes(apiClient),
  setBaseline: new SetBaseline(apiClient),
  // Compare
  fetchComparisonData: new FetchComparisonData(apiClient),
  // Banking
  fetchBankingData: new FetchBankingData(apiClient),
  bankSurplus: new BankSurplus(apiClient),
  applySurplus: new ApplySurplus(apiClient),
  // Pooling
  fetchAdjustedCB: new FetchAdjustedCB(apiClient),
  createPool: new CreatePool(apiClient),
}

export type AppDependencies = typeof appDependencies

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App dependencies={appDependencies} />
  </React.StrictMode>,
)