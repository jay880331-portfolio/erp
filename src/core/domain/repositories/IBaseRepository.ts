import { PaginationParams, PaginatedResult } from '@/common/types';

export interface IBaseRepository<T> {
  findById(id: string, tenantId: string): Promise<T | null>;
  findAll(tenantId: string, params?: PaginationParams): Promise<PaginatedResult<T>>;
  create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, tenantId: string, entity: Partial<T>): Promise<T | null>;
  delete(id: string, tenantId: string): Promise<boolean>;
  exists(id: string, tenantId: string): Promise<boolean>;
}