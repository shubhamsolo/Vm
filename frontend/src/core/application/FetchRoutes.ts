// src/core/application/FetchRoutes.ts

import type { IApiClient } from "../ports/IApiClient";
import type { Route } from "../domain/types";

export class FetchRoutes {
  // Depend on the *interface* (the "port")
  private apiClient: IApiClient;

  constructor(apiClient: IApiClient) {
    this.apiClient = apiClient;
  }

  async execute(): Promise<Route[]> {
    try {
      const routes = await this.apiClient.getRoutes();
      
      // This is a good place for simple, non-tool-specific logic,
      // like sorting the data before returning it.
      return routes.sort((a, b) => a.route_id.localeCompare(b.route_id));

    } catch (error) {
      console.error("Error fetching routes:", error);
      // Return a stable value (empty array) so the UI doesn't break
      return []; 
    }
  }
}