import { User } from '@/core/domain/entities/User';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { UserModel, IUserDocument } from '../mongoose/models/UserModel';
import { PaginationParams, PaginatedResult } from '@/common/types';

export class UserRepository implements IUserRepository {
  private mapToEntity(doc: IUserDocument): User {
    return {
      id: doc._id.toString(),
      email: doc.email,
      password: doc.password,
      name: doc.name,
      role: doc.role,
      tenantId: doc.tenantId,
      isActive: doc.isActive,
      lastLoginAt: doc.lastLoginAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findById(id: string, tenantId: string): Promise<User | null> {
    const doc = await UserModel.findOne({ _id: id, tenantId });
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() });
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByTenantId(tenantId: string): Promise<User[]> {
    const docs = await UserModel.find({ tenantId });
    return docs.map(this.mapToEntity);
  }

  async findByRole(role: string, tenantId: string): Promise<User[]> {
    const docs = await UserModel.find({ role, tenantId });
    return docs.map(this.mapToEntity);
  }

  async countByTenantIdAndRole(tenantId: string, role: string): Promise<number> {
    return UserModel.countDocuments({ tenantId, role });
  }

  async findAll(tenantId: string, params?: PaginationParams): Promise<PaginatedResult<User>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const query = { tenantId };
    const total = await UserModel.countDocuments(query);
    
    let queryBuilder = UserModel.find(query).skip(skip).limit(limit);
    
    if (params?.sortBy) {
      const sortOrder = params.sortOrder === 'desc' ? -1 : 1;
      queryBuilder = queryBuilder.sort({ [params.sortBy]: sortOrder });
    }

    const docs = await queryBuilder.exec();

    return {
      data: docs.map(this.mapToEntity),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(entity: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const doc = await UserModel.create(entity);
    return this.mapToEntity(doc);
  }

  async update(id: string, tenantId: string, entity: Partial<User>): Promise<User | null> {
    const doc = await UserModel.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: entity },
      { new: true }
    );
    return doc ? this.mapToEntity(doc) : null;
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await UserModel.deleteOne({ _id: id, tenantId });
    return result.deletedCount > 0;
  }

  async exists(id: string, tenantId: string): Promise<boolean> {
    const count = await UserModel.countDocuments({ _id: id, tenantId });
    return count > 0;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      { $set: { lastLoginAt: new Date() } }
    );
  }
}