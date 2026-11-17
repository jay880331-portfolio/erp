export interface InventoryMovement {
  id: string;
  tenantId: string;
  itemId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  unitCost: number;
  referenceType: 'purchase' | 'sale' | 'production' | 'adjustment' | 'transfer';
  referenceId?: string;
  warehouseId?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

export interface InventoryStock {
  id: string;
  tenantId: string;
  itemId: string;
  warehouseId?: string;
  quantity: number;
  averageCost: number;
  lastMovementDate: Date;
  updatedAt: Date;
}