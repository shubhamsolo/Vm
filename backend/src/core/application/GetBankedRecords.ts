import { IBankingRepository } from "../ports/IBankingRepository";

export class GetBankedRecords {
  constructor(private bankingRepo: IBankingRepository) {}

  async execute(shipId: string) {
    return this.bankingRepo.getAvailableEntries(shipId);
  }
}