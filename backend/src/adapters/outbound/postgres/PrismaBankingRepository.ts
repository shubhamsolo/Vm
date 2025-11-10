import { PrismaClient } from "@prisma/client";
import { IBankingRepository } from "../../../core/ports/IBankingRepository";
import { BankEntry } from "../../../core/domain/types";

export class PrismaBankingRepository implements IBankingRepository {
  constructor(private prisma: PrismaClient) {}

  async bankSurplus(shipId: string, year: number, amount: number): Promise<BankEntry> {
    return this.prisma.bank_entries.create({
      data: {
        ship_id: shipId,
        year: year,
        amount_gco2eq: amount,
      },
    });
  }
  
  async getAvailableEntries(shipId: string): Promise<BankEntry[]> {
    return this.prisma.bank_entries.findMany({
      where: {
        ship_id: shipId,
        amount_gco2eq: { gt: 0 }, // Only get entries with surplus
      },
      orderBy: {
        year: 'asc', // Use oldest surplus first
      },
    });
  }

  async applyBankedSurplus(shipId: string, amountToApply: number): Promise<number> {
    // This logic is complex. It must be a transaction.
    return this.prisma.$transaction(async (tx) => {
      let remainingDeficit = amountToApply;
      let totalApplied = 0;

      const availableEntries = await tx.bank_entries.findMany({
        where: {
          ship_id: shipId,
          amount_gco2eq: { gt: 0 },
        },
        orderBy: { year: 'asc' }, // Use oldest first
      });

      for (const entry of availableEntries) {
        if (remainingDeficit <= 0) break;

        const amountFromThisEntry = Math.min(entry.amount_gco2eq, remainingDeficit);
        
        // "Consume" this entry's surplus
        await tx.bank_entries.update({
          where: { id: entry.id },
          data: {
            amount_gco2eq: entry.amount_gco2eq - amountFromThisEntry,
          },
        });

        remainingDeficit -= amountFromThisEntry;
        totalApplied += amountFromThisEntry;
      }

      return totalApplied; // Return the total amount we managed to cover
    });
  }
}