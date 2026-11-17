import { Item } from '@/core/domain/entities/Item';
import { IItemRepository } from '@/core/domain/repositories/IItemRepository';
import { ItemModel, IItemDocument } from '../mongoose/models/ItemModel';
import { PaginationParams, PaginatedResult } from '@/common/types';

export class ItemRepository implements IItemRepository {
  private mapToEntity(doc: IItemDocument): Item {
    return {
      id: doc._id.toString(),
      tenantId: doc.tenantId,
      code: doc.code,
      name: doc.name,
      description: doc.description,
      type: doc.type,
      unit: doc.unit,
      specifications: doc.specifications,
      costPrice: doc.costPrice,
      sellingPrice: doc.sellingPrice,
      taxRate: doc.taxRate,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findById(id: string, tenantId: string): Promise<Item | null> {
    const doc = await ItemModel.findOne({ _id: id, tenantId });
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByCode(code: string, tenantId: string): Promise<Item | null> {
    const doc = await ItemModel.findOne({ code, tenantId });
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByType(type: string, tenantId: string): Promise<Item[]> {
    const docs = await ItemModel.find({ type, tenantId, isActive: true });
    return docs.map(this.mapToEntity);
  }

  async searchByName(name: string, tenantId: string): Promise<Item[]> {
    const docs = await ItemModel.find({
      tenantId,
      name: { $regex: name, $options: 'i' },
      isActive: true,
    }).limit(20);
    return docs.map(this.mapToEntity);
  }

  async findAll(tenantId: string, params?: PaginationParams): Promise<PaginatedResult<Item>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const query = { tenantId };
    const total = await ItemModel.countDocuments(query);
    
    let queryBuilder = ItemModel.find(query).skip(skip).limit(limit);
    
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

  async create(entity: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> {
    const doc = await ItemModel.create(entity);
    return this.mapToEntity(doc);
  }

  async update(id: string, tenantId: string, entity: Partial<Item>): Promise<Item | null> {
    const doc = await ItemModel.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: entity },
      { new: true }
    );
    return doc ? this.mapToEntity(doc) : null;
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await ItemModel.deleteOne({ _id: id, tenantId });
    return result.deletedCount > 0;
  }

  async exists(id: string, tenantId: string): Promise<boolean> {
    const count = await ItemModel.countDocuments({ _id: id, tenantId });
    return count > 0;
  }
}