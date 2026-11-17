import mongoose, { Schema, Document, Types } from 'mongoose';
import { Item } from '@/core/domain/entities/Item';

export interface IItemDocument extends Omit<Item, 'id'>, Document {
  _id: Types.ObjectId;
}

const ItemSchema = new Schema<IItemDocument>(
  {
    tenantId: { 
      type: String, 
      required: true,
      index: true,
    },
    code: { 
      type: String, 
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String },
    type: { 
      type: String, 
      enum: ['product', 'raw_material', 'service'], 
      required: true 
    },
    unit: { type: String, required: true },
    specifications: { type: Schema.Types.Mixed },
    costPrice: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Compound unique index
ItemSchema.index({ tenantId: 1, code: 1 }, { unique: true });

export const ItemModel = mongoose.models.Item || mongoose.model<IItemDocument>('Item', ItemSchema);