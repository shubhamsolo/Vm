import { IComplianceRepository } from "../ports/IComplianceRepository";

export class GetAdjustedComplianceBalance {
  constructor(private complianceRepo: IComplianceRepository) {}

  async execute(shipId: string, year: number) {
    // This simply calls the repository method.
    // We keep it as a use case for architectural consistency.
    return this.complianceRepo.getAdjustedCB(shipId, year);
  }
}