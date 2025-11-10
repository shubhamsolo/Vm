import { PrismaClient } from "@prisma/client";
import { IComplianceRepository } from "../../../core/ports/IComplianceRepository";
import { ComplianceBalance , AdjustedCB } from "../../../core/domain/types";

export class PrismaComplianceRepository implements IComplianceRepository {
  constructor(private prisma: PrismaClient) {}

  async find(shipId: string, year: number): Promise<ComplianceBalance | null> {
    return this.prisma.ship_compliance.findFirst({
      where: { ship_id: shipId, year: year },
      orderBy: { id: 'desc' }, // Get the latest record
    });
  }

  async save(data: Omit<ComplianceBalance, 'id'>): Promise<ComplianceBalance> {
    return this.prisma.ship_compliance.create({
      data: data,
    });
  }
  
  async getAvailableBankedSurplus(shipId: string): Promise<number> {
    const result = await this.prisma.bank_entries.aggregate({
      _sum: {
        amount_gco2eq: true,
      },
      where: {
        ship_id: shipId,
      },
    });
    return result._sum.amount_gco2eq || 0;
  }
  async getAdjustedCB(shipId: string, year: number): Promise<AdjustedCB> {
    // We run two queries in parallel to get the two parts of the balance
    const [latestCB, totalBanked] = await Promise.all([
      // 1. Get the latest (final) CB record for the year
      this.prisma.ship_compliance.findFirst({
        where: { ship_id: shipId, year: year },
        orderBy: { id: 'desc' }, // 'id' should be sequential, 'created_at' is safer
      }),
      
      // 2. Get the sum of all available banked surplus
      this.prisma.bank_entries.aggregate({
        _sum: { amount_gco2eq: true },
        where: { ship_id: shipId, amount_gco2eq: { gt: 0 } },
      })
    ]);

    const finalCB = latestCB?.cb_gco2eq || 0;
    const banked = totalBanked._sum.amount_gco2eq || 0;
    
    // Adjusted CB = Final CB + Total Available Bank
    return {
      ship_id: shipId,
      year: year,
      adjusted_cb_gco2eq: finalCB + banked,
    };
  }
}
