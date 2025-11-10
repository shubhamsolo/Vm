import type { Route } from "../domain/types";
import type { ComplianceBalance } from "../domain/types";
import type { BankEntry } from "../domain/types";
import type { AdjustedCB } from "../domain/types";

export interface IApiClient {
    getComparisonData(): unknown;
  /**
   * Fetches all routes from the backend.
   */
  getRoutes(): Promise<Route[]>;

  /**
   * Sets a specific route as the baseline.
   * @param routeId The UUID of the route to set as baseline.
   */
  setRouteAsBaseline(routeId: string): Promise<void>;
  
 getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance>;

  /**
   * Fetches all available banked surplus for a ship.
   */
  getBankedRecords(shipId: string): Promise<BankEntry[]>;

  /**
   * Banks the current surplus for a ship/year.
   */
  bankSurplus(shipId: string, year: number): Promise<BankEntry>;
  
  /**
   * Applies banked surplus to the current deficit.
   */
  applySurplus(shipId: string, year: number): Promise<any>;

  getAdjustedCB(shipId: string, year: number): Promise<AdjustedCB>;

  /**
   * Attempts to create a new pool.
   */
  createPool(shipIds: string[], year: number): Promise<any>; // Returns { cb_before, applied, cb_after }
}