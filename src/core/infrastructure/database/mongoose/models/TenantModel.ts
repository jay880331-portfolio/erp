import mongoose, { Schema, Document, Types } from 'mongoose';
import { Tenant } from '@/core/domain/entities/Tenant';

export interface ITenantDocument extends Omit<Tenant, 'id'>, Document {
  _id: Types.ObjectId;
}

const TenantSchema = new Schema<ITenantDocument>(
  {
    name: { type: String, required: true },
    domain: { type: String, unique: true, sparse: true },
    subscription: {
      plan: { 
        type: String, 
        enum: ['basic', 'premium', 'enterprise'], 
        default: 'basic' 
      },
      status: { 
        type: String, 
        enum: ['active', 'suspended', 'canceled'], 
        default: 'active' 
      },
      maxUsers: { type: Number, default: 3 }, // 1 admin + 2 users
    },
  },
  {
    timestamps: true,
  }
);

export const TenantModel = mongoose.models.Tenant || mongoose.model<ITenantDocument>('Tenant', TenantSchema);