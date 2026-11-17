import { Transaction } from '../entities/Transaction';
import { IBaseRepository } from './IBaseRepository';

export interface ITransactionRepository extends IBaseRepository<Transaction> {
  findByReferenceNumber(referenceNumber: string, tenantId: string): Promise<Transaction | null>;
  findByDateRange(tenantId: string, startDate: Date, endDate: Date): Promise<Transaction[]>;
  findByStatus(status: string, tenantId: string): Promise<Transaction[]>;
  getNextReferenceNumber(tenantId: string): Promise<string>;
}