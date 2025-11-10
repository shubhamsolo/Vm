import type { IApiClient } from "../ports/IApiClient";

export class FetchComparisonData {
  private apiClient: IApiClient;
  constructor(apiClient: IApiClient) {
    this.apiClient = apiClient;
  }

  async execute() {
    try {
      const data = await (this.apiClient as any).getComparisonData();
      return data;
    } catch (error) {
      console.error("Error in FetchComparisonData use case:", error);
      // Return a default state
      return { baseline: null, comparisons: [], target: 0 };
    }
  }
}