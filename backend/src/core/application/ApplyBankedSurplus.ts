import { IBankingRepository } from "../ports/IBankingRepository";
import { IComplianceRepository } from "../ports/IComplianceRepository";

export class ApplyBankedSurplus {
  constructor(
    private bankingRepo: IBankingRepository,
    private complianceRepo: IComplianceRepository
  ) {}

  async execute(shipId: string, year: number) {
    // 1. Get the current CB (which should be a deficit)
    const cb = await this.complianceRepo.find(shipId, year);
    if (!cb) {
      throw new Error("Compliance Balance not calculated yet.");
    }
    if (cb.cb_gco2eq >= 0) {
      throw new Error("No deficit to cover.");
    }

    const deficitAmount = Math.abs(cb.cb_gco2eq);

    // 2. Get total available banked surplus
    const available = await this.complianceRepo.getAvailableBankedSurplus(shipId);
    if (available <= 0) {
      throw new Error("No banked surplus available.");
    }
    
    // 3. Call repository to "consume" banked entries
    const amountToApply = Math.min(deficitAmount, available);
    const totalApplied = await this.bankingRepo.applyBankedSurplus(shipId, amountToApply);

    // 4. Create a new CB record reflecting the change
    const newBalance = cb.cb_gco2eq + totalApplied;
    const newCB = await this.complianceRepo.save({
      ship_id: shipId,
      year: year,
      cb_gco2eq: newBalance,
    });

    return {
      cb_before: cb.cb_gco2eq,
      applied: totalApplied,
      cb_after: newBalance,
    };
  }
}