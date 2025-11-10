import type { IApiClient } from "../ports/IApiClient";
import type { BankEntry, BankingData, ComplianceBalance } from "../domain/types";

export class FetchBankingData {
  private apiClient: IApiClient;
  constructor(apiClient: IApiClient) {
    this.apiClient = apiClient;
  }

  async execute(shipId: string, year: number): Promise<BankingData> {
    if (!shipId || !year) {
      return { cb: null, records: [] };
    }
    
    // Fetch CB and records in parallel
    const [cb, records] = await Promise.all([
      (this.apiClient as any).getComplianceBalance(shipId, year) as unknown as Promise<ComplianceBalance>,
      (this.apiClient as any).getBankedRecords(shipId) as unknown as Promise<BankEntry[]>,
    ]);
    
    return { cb, records };
  }
}