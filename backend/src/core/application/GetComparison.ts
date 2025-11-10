import { IRouteRepository } from "../ports/IRouteRepository";
import { ComparisonData, ComparisonRoute, Route } from "../domain/types";

// From the brief: 2025 Target = 89.3368 gCO₂e/MJ
const TARGET_2025 = 89.3368;

export class GetComparison {
  constructor(private routeRepo: IRouteRepository) {}

  async execute(): Promise<ComparisonData> {
    // 1. Fetch data from the repository
    const [baseline, comparisons] = await Promise.all([
      this.routeRepo.getBaseline(),
      this.routeRepo.getNonBaseline(),
    ]);

    if (!baseline) {
      return {
        baseline: null,
        comparisons: [],
        target: TARGET_2025,
      };
    }

    // 2. Perform business logic (the formulas)
    const comparisonResults: ComparisonRoute[] = comparisons.map((route) => {
      const percentDiff =
        ((route.ghg_intensity / baseline.ghg_intensity) - 1) * 100;
      
      const compliant = route.ghg_intensity <= TARGET_2025;

      return {
        ...route,
        percentDiff,
        compliant,
      };
    });

    // 3. Return the complete data payload
    return {
      baseline: baseline,
      comparisons: comparisonResults,
      target: TARGET_2025,
    };
  }
}