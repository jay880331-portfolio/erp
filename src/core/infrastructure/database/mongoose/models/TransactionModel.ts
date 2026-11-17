import mongoose, { Schema, Document, Types } from 'mongoose';
import { Transaction, TransactionLine } from '@/core/domain/entities/Transaction';

export interface ITransactionDocument extends Omit<Transaction, 'id'>, Document {
  _id: Types.ObjectId;
}

const TransactionLineSchema = new Schema<TransactionLine>({
  accountId: { type: String, required: true },
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
  description: { type: String },
});

const TransactionSchema = new Schema<ITransactionDocument>(
  {
    tenantId: { 
      type: String, 
      required: true,
      index: true,
    },
    referenceNumber: { 
      type: String, 
      required: true,
    },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    lines: [TransactionLineSchema],
    status: { 
      type: String, 
      enum: ['draft', 'posted', 'void'], 
      default: 'draft' 
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
TransactionSchema.index({ tenantId: 1, referenceNumber: 1 }, { unique: true });
TransactionSchema.index({ tenantId: 1, date: -1 });

export const TransactionModel = mongoose.models.Transaction || mongoose.model<ITransactionDocument>('Transaction', TransactionSchema);