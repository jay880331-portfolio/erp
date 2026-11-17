import { UserRole } from '@/common/types';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  tenantId: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}