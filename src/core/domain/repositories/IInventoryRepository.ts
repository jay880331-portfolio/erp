import { InventoryMovement, InventoryStock } from '../entities/Inventory';
import { PaginatedResult, PaginationParams } from '@/common/types';

export interface IInventoryRepository {
  // InventoryMovement methods
  createMovement(movement: Omit<InventoryMovement, 'id' | 'createdAt'>): Promise<InventoryMovement>;
  findMovementsByItem(itemId: string, tenantId: string, params?: PaginationParams): Promise<PaginatedResult<InventoryMovement>>;
  findMovementsByDateRange(tenantId: string, startDate: Date, endDate: Date): Promise<InventoryMovement[]>;
  
  // InventoryStock methods
  findStockByItem(itemId: string, tenantId: string, warehouseId?: string): Promise<InventoryStock | null>;
  findAllStock(tenantId: string, params?: PaginationParams): Promise<PaginatedResult<InventoryStock>>;
  updateStock(itemId: string, tenantId: string, quantity: number, averageCost: number, warehouseId?: string): Promise<InventoryStock>;
  findLowStock(tenantId: string, threshold: number): Promise<InventoryStock[]>;
}