import { BankEntry } from "../domain/types";

export interface IBankingRepository {
  /**
   * Creates a new bank entry (banks a surplus).
   * @param shipId The ship ID.
   * @param year The year the surplus is from.
   * @param amount The surplus amount.
   */
  bankSurplus(shipId: string, year: number, amount: number): Promise<BankEntry>;

  /**
   * Applies a specific amount of banked surplus to cover a deficit.
   * This "consumes" the banked entries, starting with the oldest.
   * @param shipId The ship ID.
   * @param amountToApply The deficit amount to cover.
   * @returns The total amount that was successfully applied.
   */
  applyBankedSurplus(shipId: string, amountToApply: number): Promise<number>;

  /**
   * Gets all *available* (un-consumed) bank entries for a ship.
   */
  getAvailableEntries(shipId: string): Promise<BankEntry[]>;
}