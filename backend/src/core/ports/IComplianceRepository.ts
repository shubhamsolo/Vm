import { ComplianceBalance, AdjustedCB } from "../domain/types";

export interface IComplianceRepository {
  /**
   * Finds the most recent CB record for a ship in a given year.
   */
  find(shipId: string, year: number): Promise<ComplianceBalance | null>;

  /**
   * Creates and saves a new CB record.
   */
  save(data: Omit<ComplianceBalance, 'id'>): Promise<ComplianceBalance>;

  /**
   * Gets the total *available* (un-used) banked surplus for a ship.
   * This is a "read" operation, often needed for CB calculations.
   */
  getAvailableBankedSurplus(shipId: string): Promise<number>;
  getAdjustedCB(shipId: string, year: number): Promise<AdjustedCB>;
}