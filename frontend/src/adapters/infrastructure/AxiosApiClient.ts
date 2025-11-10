import axios from "axios";
import type { IApiClient } from "../../core/ports/IApiClient";
import type { Route, ComparisonData, ComplianceBalance, BankEntry } from "../../core/domain/types"; // <-- Import ComparisonData
import type { AdjustedCB } from "../../core/domain/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export class AxiosApiClient implements IApiClient {
  
  private client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000,
  });

  async getRoutes(): Promise<Route[]> {
    const response = await this.client.get("/routes");
    return response.data;
  }

  async setRouteAsBaseline(routeId: string): Promise<void> {
    await this.client.post(`/routes/${routeId}/baseline`);
  }

  // --- ADD THIS NEW METHOD ---
  async getComparisonData(): Promise<ComparisonData> {
    const response = await this.client.get("/routes/comparison");
    return response.data;
  }

  // --- ADD THESE 4 METHODS ---
  async getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance> {
    const response = await this.client.get("/compliance/cb", {
      params: { shipId, year },
    });
    return response.data;
  }

  async getBankedRecords(shipId: string): Promise<BankEntry[]> {
    const response = await this.client.get("/banking/records", {
      params: { shipId },
    });
    return response.data;
  }

  async bankSurplus(shipId: string, year: number): Promise<BankEntry> {
    const response = await this.client.post("/banking/bank", { shipId, year });
    return response.data;
  }

  async applySurplus(shipId: string, year: number): Promise<any> {
    const response = await this.client.post("/banking/apply", { shipId, year });
    return response.data;
  }
  // --- ADD THESE 2 METHODS ---
  async getAdjustedCB(shipId: string, year: number): Promise<AdjustedCB> {
    const response = await this.client.get("/compliance/adjusted-cb", {
      params: { shipId, year },
    });
    return response.data;
  }

  async createPool(shipIds: string[], year: number): Promise<any> {
    const response = await this.client.post("/pools", { shipIds, year });
    return response.data;
  }
}

