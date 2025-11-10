import type { IApiClient } from "../ports/IApiClient";

export class CreatePool {
  private apiClient: IApiClient;
  constructor(apiClient: IApiClient) {
    this.apiClient = apiClient;
  }
  async execute(shipIds: string[], year: number) {
    return (this.apiClient as any).createPool(shipIds, year);
  }
}