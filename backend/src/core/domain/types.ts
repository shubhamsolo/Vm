// This is our core application model for a Route
// It matches the 'routes' table in the database.
export interface Route {
  id: string; // The database UUID
  route_id: string; // The human-readable ID like "R001"
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

/**
 * A route object augmented with comparison calculations.
 */
export interface ComparisonRoute extends Route {
  percentDiff: number; // % difference from baseline
  compliant: boolean;  // 2025 target compliant
}

/**
 * The response payload for the /comparison endpoint.
 */
export interface ComparisonData {
  baseline: Route | null;
  comparisons: ComparisonRoute[];
  target: number;
}

export interface ComplianceBalance {
  id: string;
  ship_id: string;
  year: number;
  cb_gco2eq: number; // The calculated balance (positive=surplus, negative=deficit)
}

/**
 * Represents a "banked" surplus.
 */
export interface BankEntry {
  id: string;
  ship_id: string;
  year: number; // The year the surplus was *banked*
  amount_gco2eq: number; // The amount of surplus
}
export interface AdjustedCB {
  ship_id: string;
  year: number;
  adjusted_cb_gco2eq: number;
}

/**
 * Represents a member in a newly created pool,
 * showing their balance before and after allocation.
 */
export interface PoolMember {
  id: string;
  pool_id: string;
  ship_id: string;
  cb_before: number;
  cb_after: number;
}