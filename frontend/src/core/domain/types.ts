export interface Route {
  id: string; 
  route_id: string; 
  vesselType: string;
  fuelType: string;
  year: number;
  ghg_intensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  is_baseline: boolean;
}

// --- ADD THESE NEW TYPES ---

export interface ComparisonRoute extends Route {
  percentDiff: number;
  compliant: boolean;
}

export interface ComparisonData {
  baseline: Route | null;
  comparisons: ComparisonRoute[];
  target: number;
}

export interface ComplianceBalance {
  id: string;
  ship_id: string;
  year: number;
  cb_gco2eq: number;
}

export interface BankEntry {
  id: string;
  ship_id: string;
  year: number;
  amount_gco2eq: number;
}

// For the UI state
export interface BankingData {
  cb: ComplianceBalance | null;
  records: BankEntry[];
}
export interface AdjustedCB {
  ship_id: string;
  year: number;
  adjusted_cb_gco2eq: number;
}