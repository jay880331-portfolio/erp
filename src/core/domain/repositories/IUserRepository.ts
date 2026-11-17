import { User } from '../entities/User';
import { IBaseRepository } from './IBaseRepository';

export interface IUserRepository extends IBaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByTenantId(tenantId: string): Promise<User[]>;
  countByTenantIdAndRole(tenantId: string, role: string): Promise<number>;
  updateLastLogin(userId: string): Promise<void>;
}