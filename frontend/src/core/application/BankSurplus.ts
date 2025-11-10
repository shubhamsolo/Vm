import type { IApiClient } from "../ports/IApiClient";

export class BankSurplus {
  private apiClient: IApiClient;
  constructor(apiClient: IApiClient) {
    this.apiClient = apiClient;
  }
  async execute(shipId: string, year: number) {
    return (this.apiClient as any).bankSurplus(shipId, year);
  }
}