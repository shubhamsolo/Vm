import { Router, Request, Response } from "express";
import { BankSurplus } from "../../../core/application/BankSurplus";
import { ApplyBankedSurplus } from "../../../core/application/ApplyBankedSurplus";
import { GetBankedRecords } from "../../../core/application/GetBankedRecords";

export class BankingController {
  public router = Router();

  constructor(
    private bankSurplus: BankSurplus,
    private applyBankedSurplus: ApplyBankedSurplus,
    private getBankedRecords: GetBankedRecords
  ) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/records", this.handleGetRecords);
    this.router.post("/bank", this.handleBank);
    this.router.post("/apply", this.handleApply);
  }

  private handleGetRecords = async (req: Request, res: Response) => {
    try {
      const { shipId } = req.query;
      if (!shipId) return res.status(400).json({ message: "shipId is required" });
      
      const records = await this.getBankedRecords.execute(shipId as string);
      res.status(200).json(records);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  private handleBank = async (req: Request, res: Response) => {
    try {
      const { shipId, year } = req.body;
      if (!shipId || !year) return res.status(400).json({ message: "shipId and year are required" });

      const entry = await this.bankSurplus.execute(shipId, year);
      res.status(201).json(entry);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  };

  private handleApply = async (req: Request, res: Response) => {
    try {
      const { shipId, year } = req.body;
      if (!shipId || !year) return res.status(400).json({ message: "shipId and year are required" });
      
      const result = await this.applyBankedSurplus.execute(shipId, year);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  };
}