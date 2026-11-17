import mongoose, { Schema, Document, Types } from 'mongoose';
import { User } from '@/core/domain/entities/User';

export interface IUserDocument extends Omit<User, 'id'>, Document {
  _id: Types.ObjectId;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['admin', 'user'], 
      required: true 
    },
    tenantId: { 
      type: String, 
      required: true,
      index: true,
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
UserSchema.index({ tenantId: 1, role: 1 });
UserSchema.index({ tenantId: 1, email: 1 });

export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);