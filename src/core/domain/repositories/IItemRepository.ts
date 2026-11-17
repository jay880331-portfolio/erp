import { Item } from '../entities/Item';
import { IBaseRepository } from './IBaseRepository';

export interface IItemRepository extends IBaseRepository<Item> {
  findByCode(code: string, tenantId: string): Promise<Item | null>;
  findByType(type: string, tenantId: string): Promise<Item[]>;
  searchByName(name: string, tenantId: string): Promise<Item[]>;
}