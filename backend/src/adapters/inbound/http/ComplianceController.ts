import { Router, Request, Response } from "express";
import { GetComplianceBalance } from "../../../core/application/GetComplianceBalance";
import { GetAdjustedComplianceBalance } from "../../../core/application/GetAdjustedComplianceBalance";
export class ComplianceController {
  public router = Router();

  constructor(
    private getComplianceBalance: GetComplianceBalance,
    private getAdjustedComplianceBalance: GetAdjustedComplianceBalance
  ) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/cb", this.handleGetCB);
    this.router.get("/adjusted-cb", this.handleGetAdjustedCB); // <-- 3. ADD ROUTE
    // GET /compliance/adjusted-cb is for pooling, we'll add it later
  }

  private handleGetCB = async (req: Request, res: Response) => {
    try {
      const { shipId, year } = req.query;
      if (!shipId || !year) {
        return res.status(400).json({ message: "shipId and year are required" });
      }

      const cb = await this.getComplianceBalance.execute(shipId as string, parseInt(year as string));
      res.status(200).json(cb);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  };
  
  private handleGetAdjustedCB = async (req: Request, res: Response) => {
    try {
      const { shipId, year } = req.query;
      if (!shipId || !year) {
        return res.status(400).json({ message: "shipId and year are required" });
      }

      const cb = await this.getAdjustedComplianceBalance.execute(
        shipId as string, 
        parseInt(year as string)
      );
      res.status(200).json(cb);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  };
}
