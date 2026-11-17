export interface Item {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description?: string;
  type: 'product' | 'raw_material' | 'service';
  unit: string;
  specifications?: Record<string, string | number | boolean>;
  costPrice: number;
  sellingPrice: number;
  taxRate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}