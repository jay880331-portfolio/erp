export type UserRole = 'admin' | 'user';

export interface TenantId {
  value: string;
}

export interface UserId {
  value: string;
}

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}