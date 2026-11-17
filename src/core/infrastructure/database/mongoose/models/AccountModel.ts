import mongoose, { Schema, Document, Types } from 'mongoose';
import { Account } from '@/core/domain/entities/Account';

export interface IAccountDocument extends Omit<Account, 'id'>, Document {
  _id: Types.ObjectId;
}

const AccountSchema = new Schema<IAccountDocument>(
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
    type: { 
      type: String, 
      enum: ['asset', 'liability', 'equity', 'revenue', 'expense'], 
      required: true 
    },
    parentAccountId: { type: String },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Compound unique index
AccountSchema.index({ tenantId: 1, code: 1 }, { unique: true });

export const AccountModel = mongoose.models.Account || mongoose.model<IAccountDocument>('Account', AccountSchema);