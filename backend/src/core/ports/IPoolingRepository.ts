import { PoolMember } from "../domain/types";

// Defines the data structure for saving a new pool member
type NewPoolMember = Omit<PoolMember, 'id' | 'pool_id'>;

export interface IPoolingRepository {
  /**
   * Creates a new pool and saves all its members in a single transaction.
   * @param year The year of the pool.
   * @param members An array of member objects with cb_before and cb_after.
   * @returns The newly created pool members.
   */
  createPool(year: number, members: NewPoolMember[]): Promise<PoolMember[]>;
}