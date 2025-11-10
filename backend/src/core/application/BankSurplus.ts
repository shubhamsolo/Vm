import { IBankingRepository } from "../ports/IBankingRepository";
import { IComplianceRepository } from "../ports/IComplianceRepository";

export class BankSurplus {
  constructor(
    private bankingRepo: IBankingRepository,
    private complianceRepo: IComplianceRepository
  ) {}

  async execute(shipId: string, year: number) {
    // 1. Get the ship's current CB
    const cb = await this.complianceRepo.find(shipId, year);
    if (!cb) {
      throw new Error("Compliance Balance not calculated yet.");
    }

    // 2. Validate it's a surplus
    if (cb.cb_gco2eq <= 0) {
      throw new Error("No surplus to bank.");
    }

    // 3. Bank the surplus
    const bankedEntry = await this.bankingRepo.bankSurplus(
      shipId,
      year,
      cb.cb_gco2eq
    );

    // 4. (CRITICAL) "Zero out" the ship's CB so it can't be banked again
    await this.complianceRepo.save({
      ship_id: shipId,
      year: year,
      cb_gco2eq: 0,
    });

    return bankedEntry;
  }
}