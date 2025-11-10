import { Route } from "../domain/types";

export interface IRouteRepository {
  /**
   * Fetches all routes from the data source.
   */
  getAll(): Promise<Route[]>;

  /**
   * Sets a specific route as the baseline,
   * and unsets any previous baseline.
   * @param id The UUID of the route to set.
   */
  setBaseline(id: string): Promise<void>;

  /**
   * Fetches the single route marked as baseline.
   */
  getBaseline(): Promise<Route | null>; // <-- ADD THIS

  /**
   * Fetches all routes NOT marked as baseline.
   */
  getNonBaseline(): Promise<Route[]>; // <-- ADD THIS

  getById(id: string): Promise<Route | null>; // <-- ADD THIS
}