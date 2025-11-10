import { Router, Request, Response } from "express";
import { CreatePool } from "../../../core/application/CreatePool";

export class PoolingController {
  public router = Router();

  constructor(private createPool: CreatePool) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/", this.handleCreatePool);
  }

  private handleCreatePool = async (req: Request, res: Response) => {
    try {
      // Expects { year: 2025, shipIds: ["id1", "id2"] }
      const { year, shipIds } = req.body;
      if (!year || !shipIds || !Array.isArray(shipIds) || shipIds.length < 2) {
        return res.status(400).json({ message: "year and an array of shipIds are required." });
      }

      const poolInput = shipIds.map(id => ({ shipId: id, year: year }));
      const result = await this.createPool.execute(poolInput);
      
      res.status(201).json(result);
    } catch (error) {
      // Catch validation errors from the use case
      res.status(400).json({ message: (error as Error).message });
    }
  };
}