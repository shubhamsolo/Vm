import { IComplianceRepository } from "../ports/IComplianceRepository";
import { IRouteRepository } from "../ports/IRouteRepository";

// Constants from the brief
const TARGET_2025 = 89.3368;
const ENERGY_PER_TON_FUEL = 41000; // MJ/t

export class GetComplianceBalance {
  constructor(
    private complianceRepo: IComplianceRepository,
    private routeRepo: IRouteRepository
  ) {}

  async execute(shipId: string, year: number) {
    // 1. Get the route data
    const route = await this.routeRepo.getById(shipId);
    if (!route) {
      throw new Error("Route not found");
    }

    // 2. Check if a CB has already been calculated and stored
    const existingCB = await this.complianceRepo.find(shipId, year);
    if (existingCB) {
      return existingCB;
    }

    // 3. If not, calculate it using the formula
    // CB = (Target - Actual) * Energy
    const target = TARGET_2025; // Assuming 2025 target for all
    const actual = route.ghg_intensity;
    const energy = route.fuelConsumption * ENERGY_PER_TON_FUEL;
    
    const cb_gco2eq = (target - actual) * energy;

    // 4. Save and return the new CB record
    const newCB = {
      ship_id: shipId,
      year: year,
      cb_gco2eq: cb_gco2eq,
    };
    
    return this.complianceRepo.save(newCB);
  }
}