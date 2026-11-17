import { Tenant } from '@/core/domain/entities/Tenant';
import { ITenantRepository } from '@/core/domain/repositories/ITenantRepository';
import { TenantModel, ITenantDocument } from '../mongoose/models/TenantModel';

export class TenantRepository implements ITenantRepository {
  private mapToEntity(doc: ITenantDocument): Tenant {
    return {
      id: doc._id.toString(),
      name: doc.name,
      domain: doc.domain,
      subscription: doc.subscription,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findById(id: string): Promise<Tenant | null> {
    const doc = await TenantModel.findById(id);
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByDomain(domain: string): Promise<Tenant | null> {
    const doc = await TenantModel.findOne({ domain });
    return doc ? this.mapToEntity(doc) : null;
  }

  async findAll(): Promise<Tenant[]> {
    const docs = await TenantModel.find();
    return docs.map(this.mapToEntity);
  }

  async create(entity: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> {
    const doc = await TenantModel.create(entity);
    return this.mapToEntity(doc);
  }

  async update(id: string, entity: Partial<Tenant>): Promise<Tenant | null> {
    const doc = await TenantModel.findByIdAndUpdate(
      id,
      { $set: entity },
      { new: true }
    );
    return doc ? this.mapToEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await TenantModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async exists(id: string): Promise<boolean> {
    const count = await TenantModel.countDocuments({ _id: id });
    return count > 0;
  }
}