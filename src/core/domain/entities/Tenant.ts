export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  subscription: {
    plan: 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'suspended' | 'canceled';
    maxUsers: number;
  };
  createdAt: Date;
  updatedAt: Date;
}