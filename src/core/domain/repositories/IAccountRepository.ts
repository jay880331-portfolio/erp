import { Account } from '../entities/Account';
import { IBaseRepository } from './IBaseRepository';

export interface IAccountRepository extends IBaseRepository<Account> {
  findByCode(code: string, tenantId: string): Promise<Account | null>;
  findByType(type: string, tenantId: string): Promise<Account[]>;
  findByParentId(parentId: string, tenantId: string): Promise<Account[]>;
  updateBalance(accountId: string, tenantId: string, amount: number): Promise<void>;
}