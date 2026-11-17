import { Customer } from '../entities/Customer';
import { IBaseRepository } from './IBaseRepository';

export interface ICustomerRepository extends IBaseRepository<Customer> {
  findByCode(code: string, tenantId: string): Promise<Customer | null>;
  findByEmail(email: string, tenantId: string): Promise<Customer | null>;
  searchByName(name: string, tenantId: string): Promise<Customer[]>;
  findByType(type: string, tenantId: string): Promise<Customer[]>;
}