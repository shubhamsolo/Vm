import { IRouteRepository } from "../ports/IRouteRepository";

export class SetBaseline {
  // Inject the repository port
  constructor(private routeRepo: IRouteRepository) {}

  /**
   * Executes the use case: set a new baseline route.
   * @param id The UUID of the route.
   */
  async execute(id: string) {
    // The business logic is to call the repository
    // In a real app, you might check if the ID exists first.
    return this.routeRepo.setBaseline(id);
  }
}