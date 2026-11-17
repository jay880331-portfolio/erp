import mongoose, { Schema, Document, Types } from 'mongoose';
import { Order, OrderLine } from '@/core/domain/entities/Order';

export interface IOrderDocument extends Omit<Order, 'id'>, Document {
  _id: Types.ObjectId;
}

const OrderLineSchema = new Schema<OrderLine>({
  itemId: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
});

const OrderSchema = new Schema<IOrderDocument>(
  {
    tenantId: { 
      type: String, 
      required: true,
      index: true,
    },
    orderNumber: { 
      type: String, 
      required: true,
    },
    type: { 
      type: String, 
      enum: ['sales', 'purchase'], 
      required: true 
    },
    customerId: { type: String },
    supplierId: { type: String },
    date: { type: Date, required: true },
    dueDate: { type: Date },
    status: { 
      type: String, 
      enum: ['draft', 'confirmed', 'processing', 'shipped', 'delivered', 'canceled'], 
      default: 'draft' 
    },
    lines: [OrderLineSchema],
    subtotal: { type: Number, required: true },
    totalDiscount: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    notes: { type: String },
    shippingAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    createdBy: { type: String, required: true },
    approvedBy: { type: String },
    approvedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Compound unique index
OrderSchema.index({ tenantId: 1, orderNumber: 1 }, { unique: true });
OrderSchema.index({ tenantId: 1, customerId: 1 });
OrderSchema.index({ tenantId: 1, date: -1 });

export const OrderModel = mongoose.models.Order || mongoose.model<IOrderDocument>('Order', OrderSchema);