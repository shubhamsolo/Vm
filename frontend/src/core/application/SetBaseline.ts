// src/core/application/SetBaseline.ts

import type { IApiClient } from "../ports/IApiClient";

export class SetBaseline {
  private apiClient: IApiClient;

  constructor(apiClient: IApiClient) {
    this.apiClient = apiClient;
  }

  async execute(routeId: string): Promise<void> {
    try {
      await this.apiClient.setRouteAsBaseline(routeId);
    } catch (error) {
      console.error(`Error setting baseline for route ${routeId}:`, error);
      // We could re-throw or handle the error here
      // For now, we'll just log it.
    }
  }
}