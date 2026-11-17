import { Transaction } from '@/core/domain/entities/Transaction';
import { ITransactionRepository } from '@/core/domain/repositories/ITransactionRepository';
import { TransactionModel, ITransactionDocument } from '../mongoose/models/TransactionModel';
import { PaginationParams, PaginatedResult } from '@/common/types';

export class TransactionRepository implements ITransactionRepository {
  private mapToEntity(doc: ITransactionDocument): Transaction {
    return {
      id: doc._id.toString(),
      tenantId: doc.tenantId,
      referenceNumber: doc.referenceNumber,
      date: doc.date,
      description: doc.description,
      lines: doc.lines,
      status: doc.status,
      createdBy: doc.createdBy,
      approvedBy: doc.approvedBy,
      approvedAt: doc.approvedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findById(id: string, tenantId: string): Promise<Transaction | null> {
    const doc = await TransactionModel.findOne({ _id: id, tenantId });
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByReferenceNumber(referenceNumber: string, tenantId: string): Promise<Transaction | null> {
    const doc = await TransactionModel.findOne({ referenceNumber, tenantId });
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByDateRange(tenantId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    const docs = await TransactionModel.find({
      tenantId,
      date: { $gte: startDate, $lte: endDate },
      status: 'posted',
    }).sort({ date: -1 });
    return docs.map(this.mapToEntity);
  }

  async findByStatus(status: string, tenantId: string): Promise<Transaction[]> {
    const docs = await TransactionModel.find({ status, tenantId }).sort({ date: -1 });
    return docs.map(this.mapToEntity);
  }

  async getNextReferenceNumber(tenantId: string): Promise<string> {
    const lastTransaction = await TransactionModel.findOne({ tenantId })
      .sort({ referenceNumber: -1 })
      .select('referenceNumber');

    if (!lastTransaction) {
      return 'JV-000001';
    }

    const lastNumber = parseInt(lastTransaction.referenceNumber.split('-')[1] || '0');
    const nextNumber = lastNumber + 1;
    return `JV-${nextNumber.toString().padStart(6, '0')}`;
  }

  async findAll(tenantId: string, params?: PaginationParams): Promise<PaginatedResult<Transaction>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const query = { tenantId };
    const total = await TransactionModel.countDocuments(query);
    
    let queryBuilder = TransactionModel.find(query).skip(skip).limit(limit);
    
    if (params?.sortBy) {
      const sortOrder = params.sortOrder === 'desc' ? -1 : 1;
      queryBuilder = queryBuilder.sort({ [params.sortBy]: sortOrder });
    } else {
      queryBuilder = queryBuilder.sort({ date: -1, referenceNumber: -1 });
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

  async create(entity: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const doc = await TransactionModel.create(entity);
    return this.mapToEntity(doc);
  }

  async update(id: string, tenantId: string, entity: Partial<Transaction>): Promise<Transaction | null> {
    const doc = await TransactionModel.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: entity },
      { new: true }
    );
    return doc ? this.mapToEntity(doc) : null;
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await TransactionModel.deleteOne({ _id: id, tenantId });
    return result.deletedCount > 0;
  }

  async exists(id: string, tenantId: string): Promise<boolean> {
    const count = await TransactionModel.countDocuments({ _id: id, tenantId });
    return count > 0;
  }
}