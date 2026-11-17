import { Order } from '../entities/Order';
import { IBaseRepository } from './IBaseRepository';

export interface IOrderRepository extends IBaseRepository<Order> {
  findByOrderNumber(orderNumber: string, tenantId: string): Promise<Order | null>;
  findByCustomer(customerId: string, tenantId: string): Promise<Order[]>;
  findByStatus(status: string, tenantId: string): Promise<Order[]>;
  findByDateRange(tenantId: string, startDate: Date, endDate: Date): Promise<Order[]>;
  getNextOrderNumber(tenantId: string, type: 'sales' | 'purchase'): Promise<string>;
}