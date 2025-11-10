import { PrismaClient, routes } from "@prisma/client";
import { IRouteRepository } from "../../../core/ports/IRouteRepository";
import { Route } from "../../../core/domain/types"; 

export class PrismaRouteRepository implements IRouteRepository {
  
  constructor(private prisma: PrismaClient) {}

  private mapToDomain(dbRoute: routes): Route {
    return dbRoute;
  }

  async getAll(): Promise<Route[]> {
    const dbRoutes = await this.prisma.routes.findMany({
      orderBy: { route_id: 'asc' }, 
    });
    return dbRoutes.map(this.mapToDomain);
  }

  async setBaseline(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.routes.updateMany({
        where: { is_baseline: true },
        data: { is_baseline: false },
      });
      await tx.routes.update({
        where: { id: id },
        data: { is_baseline: true },
      });
    });
  }

  // --- ADD THESE 2 NEW METHODS ---

  async getBaseline(): Promise<Route | null> {
    const dbRoute = await this.prisma.routes.findFirst({
      where: { is_baseline: true },
    });
    return dbRoute ? this.mapToDomain(dbRoute) : null;
  }

  async getNonBaseline(): Promise<Route[]> {
    const dbRoutes = await this.prisma.routes.findMany({
      where: { is_baseline: false },
      orderBy: { route_id: 'asc' },
    });
    return dbRoutes.map(this.mapToDomain);
  }

  
async getById(id: string): Promise<Route | null> {
    const dbRoute = await this.prisma.routes.findUnique({
      where: { id },
    });
    return dbRoute ? this.mapToDomain(dbRoute) : null;
  }
}