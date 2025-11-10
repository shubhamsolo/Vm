import { PrismaClient } from "@prisma/client";
import { IPoolingRepository } from "../../../core/ports/IPoolingRepository";
import { PoolMember } from "../../../core/domain/types";

type NewPoolMember = Omit<PoolMember, 'id' | 'pool_id'>;

export class PrismaPoolingRepository implements IPoolingRepository {
  constructor(private prisma: PrismaClient) {}

  async createPool(year: number, members: NewPoolMember[]): Promise<PoolMember[]> {
    
    // This MUST be a transaction.
    return this.prisma.$transaction(async (tx) => {
      // 1. Create the parent "pool" registry entry
      const pool = await tx.pools.create({
        data: {
          year: year,
        },
      });

      // 2. Create all the "pool_members" entries
      const createdMembers = await Promise.all(
        members.map(member => {
          return tx.pool_members.create({
            data: {
              pool_id: pool.id,
              ship_id: member.ship_id,
              cb_before: member.cb_before,
              cb_after: member.cb_after,
            },
          });
        })
      );
      
      // 3. (CRITICAL) We must now update the state of the system
      // We "zero out" the balances of all ships in the pool.
      // Their new "Adjusted CB" is now their 'cb_after' from the pool.
      
      // First, "zero out" all banked entries for all members
      const memberShipIds = members.map(m => m.ship_id);
      await tx.bank_entries.updateMany({
        where: { ship_id: { in: memberShipIds } },
        data: { amount_gco2eq: 0 },
      });

      // Second, create new "final" CB records for each ship
      await Promise.all(
        createdMembers.map(member => {
          return tx.ship_compliance.create({
            data: {
              ship_id: member.ship_id,
              year: year,
              cb_gco2eq: member.cb_after,
            },
          });
        })
      );
      
      return createdMembers;
    });
  }
}