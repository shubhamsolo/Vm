import { IRouteRepository } from "../ports/IRouteRepository";

export class GetRoutes {
  // We "inject" the repository via the constructor
  constructor(private routeRepo: IRouteRepository) {}

  /**
   * Executes the use case: get all routes.
   * @returns A list of all routes.
   */
  async execute() {
    // In a real app, you might add sorting, filtering,
    // or other business logic here.
    return this.routeRepo.getAll();
  }
}