import mongoose, { Schema, Document, Types } from 'mongoose';
import { Customer, Contact } from '@/core/domain/entities/Customer';

export interface ICustomerDocument extends Omit<Customer, 'id'>, Document {
  _id: Types.ObjectId;
}

const ContactSchema = new Schema<Contact>({
  name: { type: String, required: true },
  position: { type: String },
  email: { type: String },
  phone: { type: String },
  isPrimary: { type: Boolean, default: false },
});

const CustomerSchema = new Schema<ICustomerDocument>(
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
      enum: ['individual', 'company'], 
      required: true 
    },
    taxId: { type: String },
    email: { type: String },
    phone: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    contacts: [ContactSchema],
    creditLimit: { type: Number },
    paymentTerms: { type: String },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Compound unique index
CustomerSchema.index({ tenantId: 1, code: 1 }, { unique: true });

export const CustomerModel = mongoose.models.Customer || mongoose.model<ICustomerDocument>('Customer', CustomerSchema);