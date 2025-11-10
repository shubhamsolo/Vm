import type { IApiClient } from "../ports/IApiClient";

export class ApplySurplus {
  private apiClient: IApiClient;
  constructor(apiClient: IApiClient) {
    this.apiClient = apiClient;
  }
  async execute(shipId: string, year: number) {
    return (this.apiClient as any).applySurplus(shipId, year);
  }
}