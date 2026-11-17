import mongoose, { Schema, Document, Types } from 'mongoose';
import { InventoryMovement, InventoryStock } from '@/core/domain/entities/Inventory';

export interface IInventoryMovementDocument extends Omit<InventoryMovement, 'id'>, Document {
  _id: Types.ObjectId;
}
export interface IInventoryStockDocument extends Omit<InventoryStock, 'id'>, Document {
  _id: Types.ObjectId;
}

const InventoryMovementSchema = new Schema<IInventoryMovementDocument>(
  {
    tenantId: { 
      type: String, 
      required: true,
      index: true,
    },
    itemId: { 
      type: String, 
      required: true,
      index: true,
    },
    type: { 
      type: String, 
      enum: ['in', 'out', 'adjustment'], 
      required: true 
    },
    quantity: { type: Number, required: true },
    unitCost: { type: Number, required: true },
    referenceType: { 
      type: String, 
      enum: ['purchase', 'sale', 'production', 'adjustment', 'transfer'], 
      required: true 
    },
    referenceId: { type: String },
    warehouseId: { type: String },
    notes: { type: String },
    createdBy: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

InventoryMovementSchema.index({ tenantId: 1, itemId: 1, createdAt: -1 });

const InventoryStockSchema = new Schema<IInventoryStockDocument>(
  {
    tenantId: { 
      type: String, 
      required: true,
      index: true,
    },
    itemId: { 
      type: String, 
      required: true,
    },
    warehouseId: { type: String },
    quantity: { type: Number, required: true, default: 0 },
    averageCost: { type: Number, required: true, default: 0 },
    lastMovementDate: { type: Date, required: true },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

// Compound unique index
InventoryStockSchema.index({ tenantId: 1, itemId: 1, warehouseId: 1 }, { unique: true });

export const InventoryMovementModel = mongoose.models.InventoryMovement || 
  mongoose.model<IInventoryMovementDocument>('InventoryMovement', InventoryMovementSchema);

export const InventoryStockModel = mongoose.models.InventoryStock || 
  mongoose.model<IInventoryStockDocument>('InventoryStock', InventoryStockSchema);