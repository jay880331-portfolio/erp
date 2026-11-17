import { z } from 'zod';

export const CreateItemSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  type: z.enum(['product', 'raw_material', 'service']),
  unit: z.string().min(1).max(20),
  specifications: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  costPrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  taxRate: z.number().min(0).max(100),
});

export type CreateItemDto = z.infer<typeof CreateItemSchema>;

export const UpdateItemSchema = CreateItemSchema.partial().omit({ code: true });
export type UpdateItemDto = z.infer<typeof UpdateItemSchema>;

export const InventoryMovementSchema = z.object({
  itemId: z.string(),
  type: z.enum(['in', 'out', 'adjustment']),
  quantity: z.number().min(0.01),
  unitCost: z.number().min(0),
  referenceType: z.enum(['purchase', 'sale', 'production', 'adjustment', 'transfer']),
  referenceId: z.string().optional(),
  warehouseId: z.string().optional(),
  notes: z.string().optional(),
});

export type InventoryMovementDto = z.infer<typeof InventoryMovementSchema>;