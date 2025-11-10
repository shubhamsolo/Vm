import { Router } from "express";
import type { Request, Response } from "express";
import { GetRoutes } from "../../../core/application/GetRoutes";
import { SetBaseline } from "../../../core/application/SetBaseline";
import { GetComparison } from "../../../core/application/GetComparison"; 

export class RouteController {
  public router = Router();
  
  constructor(
    private getRoutes: GetRoutes,
    private setBaseline: SetBaseline,
    private getComparison: GetComparison 
  ) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.handleGetRoutes);
    this.router.post("/:id/baseline", this.handleSetBaseline);
    this.router.get("/comparison", this.handleGetComparison); 
  }

  private handleGetRoutes = async (req: Request, res: Response) => {
    try {
      const routes = await this.getRoutes.execute();
      res.status(200).json(routes);
    } catch (error) {
      console.error("Error fetching routes:", error);
      res.status(500).json({ message: "Error fetching routes" });
    }
  };
  private handleSetBaseline = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.setBaseline.execute(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error setting baseline:", error);
      res.status(500).json({ message: "Error setting baseline" });
    }
  };

  private handleGetComparison = async (req: Request, res: Response) => {
    try {
      const data = await this.getComparison.execute();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching comparison data:", error);
      res.status(500).json({ message: "Error fetching comparison data" });
    }
  };
}