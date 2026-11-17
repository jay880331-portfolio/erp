import { Account } from '@/core/domain/entities/Account';
import { IAccountRepository } from '@/core/domain/repositories/IAccountRepository';
import { AccountModel, IAccountDocument } from '../mongoose/models/AccountModel';
import { PaginationParams, PaginatedResult } from '@/common/types';

export class AccountRepository implements IAccountRepository {
  private mapToEntity(doc: IAccountDocument): Account {
    return {
      id: doc._id.toString(),
      tenantId: doc.tenantId,
      code: doc.code,
      name: doc.name,
      type: doc.type,
      parentAccountId: doc.parentAccountId,
      balance: doc.balance,
      currency: doc.currency,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findById(id: string, tenantId: string): Promise<Account | null> {
    const doc = await AccountModel.findOne({ _id: id, tenantId }).exec();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByCode(code: string, tenantId: string): Promise<Account | null> {
    const doc = await AccountModel.findOne({ code, tenantId }).exec();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByType(type: string, tenantId: string): Promise<Account[]> {
    const docs = await AccountModel.find({ type, tenantId, isActive: true }).exec();
    return docs.map(this.mapToEntity);
  }

  async findByParentId(parentId: string, tenantId: string): Promise<Account[]> {
    const docs = await AccountModel.find({ parentAccountId: parentId, tenantId }).exec();
    return docs.map(this.mapToEntity);
  }

  async findAll(tenantId: string, params?: PaginationParams): Promise<PaginatedResult<Account>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const query = { tenantId };
    const total = await AccountModel.countDocuments(query);
    
    let queryBuilder = AccountModel.find(query).skip(skip).limit(limit);
    
    if (params?.sortBy) {
      const sortOrder = params.sortOrder === 'desc' ? -1 : 1;
      queryBuilder = queryBuilder.sort({ [params.sortBy]: sortOrder });
    } else {
      queryBuilder = queryBuilder.sort({ code: 1 });
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

  async create(entity: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    const doc = await AccountModel.create(entity);
    return this.mapToEntity(doc);
  }

  async update(id: string, tenantId: string, entity: Partial<Account>): Promise<Account | null> {
    const doc = await AccountModel.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: entity },
      { new: true }
    ).exec();
    return doc ? this.mapToEntity(doc) : null;
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await AccountModel.deleteOne({ _id: id, tenantId });
    return result.deletedCount > 0;
  }

  async exists(id: string, tenantId: string): Promise<boolean> {
    const count = await AccountModel.countDocuments({ _id: id, tenantId });
    return count > 0;
  }

  async updateBalance(accountId: string, tenantId: string, amount: number): Promise<void> {
    await AccountModel.updateOne(
      { _id: accountId, tenantId },
      { $inc: { balance: amount } }
    );
  }
}