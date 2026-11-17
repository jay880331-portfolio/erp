import { Tenant } from '../entities/Tenant';
import { IBaseRepository } from './IBaseRepository';

export interface ITenantRepository extends Omit<IBaseRepository<Tenant>, 'findById' | 'findAll' | 'update' | 'delete'> {
  findById(id: string): Promise<Tenant | null>;
  findByDomain(domain: string): Promise<Tenant | null>;
  findAll(): Promise<Tenant[]>;
  update(id: string, entity: Partial<Tenant>): Promise<Tenant | null>;
  delete(id: string): Promise<boolean>;
}