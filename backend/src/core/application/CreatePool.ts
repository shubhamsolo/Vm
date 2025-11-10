import { IPoolingRepository } from "../ports/IPoolingRepository";
import { IComplianceRepository } from "../ports/IComplianceRepository";

type PoolInput = {
  shipId: string;
  year: number;
};

type ShipWithBalance = {
  ship_id: string;
  cb: number; // The "cb_before"
};

export class CreatePool {
  constructor(
    private poolingRepo: IPoolingRepository,
    private complianceRepo: IComplianceRepository
  ) {}

  async execute(ships: PoolInput[]) {
    if (!ships || ships.length < 2) {
      throw new Error("A pool requires at least two members.");
    }
    
    const year = ships[0].year;

    // 1. Get the AdjustedCB for all ships in the pool
    const shipsWithBalances: ShipWithBalance[] = await Promise.all(
      ships.map(async (ship) => {
        const adjustedCB = await this.complianceRepo.getAdjustedCB(ship.shipId, ship.year);
        return {
          ship_id: ship.shipId,
          cb: adjustedCB.adjusted_cb_gco2eq,
        };
      })
    );

    // 2. Validate Rule 1: Sum(AdjustedCB) >= 0
    const poolSum = shipsWithBalances.reduce((sum, s) => sum + s.cb, 0);
    if (poolSum < 0) {
      throw new Error(`Pool is invalid: Total balance is negative (${poolSum.toFixed(0)}).`);
    }

    // 3. Perform Greedy Allocation Logic
    // Sort members desc by CB (surplus ships first)
    const sortedShips = [...shipsWithBalances].sort((a, b) => b.cb - a.cb);
    
    const finalBalances: Map<string, number> = new Map(
      sortedShips.map(s => [s.ship_id, s.cb])
    );

    let surplusIndex = 0;
    let deficitIndex = sortedShips.length - 1;

    while (surplusIndex < deficitIndex) {
      const surplusShip = sortedShips[surplusIndex];
      const deficitShip = sortedShips[deficitIndex];

      const surplusAmount = finalBalances.get(surplusShip.ship_id)!;
      const deficitAmount = finalBalances.get(deficitShip.ship_id)!;

      if (surplusAmount <= 0) {
        surplusIndex++; // No more surplus left to give
        continue;
      }
      if (deficitAmount >= 0) {
        deficitIndex--; // No more deficits to fill
        continue;
      }

      // Amount to transfer is the smaller of the surplus or the (abs) deficit
      const transferAmount = Math.min(surplusAmount, Math.abs(deficitAmount));

      // Update balances
      finalBalances.set(surplusShip.ship_id, surplusAmount - transferAmount);
      finalBalances.set(deficitShip.ship_id, deficitAmount + transferAmount);

      // Move pointers
      if (finalBalances.get(surplusShip.ship_id) === 0) surplusIndex++;
      if (finalBalances.get(deficitShip.ship_id) === 0) deficitIndex--;
    }

    // 4. Validate Rules 2 & 3
    for (const ship of shipsWithBalances) {
      const cb_before = ship.cb;
      const cb_after = finalBalances.get(ship.ship_id)!;

      // Rule 2: Deficit ship cannot exit worse
      if (cb_before < 0 && cb_after < cb_before) {
        throw new Error(`Invalid allocation: Ship ${ship.ship_id} exits with a worse deficit.`);
      }
      // Rule 3: Surplus ship cannot exit negative
      if (cb_before > 0 && cb_after < 0) {
        throw new Error(`Invalid allocation: Ship ${ship.ship_id} exits with a negative balance.`);
      }
    }

    // 5. Prepare data for repository
    const poolMembersToCreate = shipsWithBalances.map(ship => ({
      ship_id: ship.ship_id,
      cb_before: ship.cb,
      cb_after: finalBalances.get(ship.ship_id)!,
    }));

    // 6. Save to database
    return this.poolingRepo.createPool(year, poolMembersToCreate);
  }
}