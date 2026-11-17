import { Customer } from '@/core/domain/entities/Customer';
import { ICustomerRepository } from '@/core/domain/repositories/ICustomerRepository';
import { CustomerModel, ICustomerDocument } from '../mongoose/models/CustomerModel';
import { PaginationParams, PaginatedResult } from '@/common/types';

export class CustomerRepository implements ICustomerRepository {
  private mapToEntity(doc: ICustomerDocument): Customer {
    return {
      id: doc._id.toString(),
      tenantId: doc.tenantId,
      code: doc.code,
      name: doc.name,
      type: doc.type,
      taxId: doc.taxId,
      email: doc.email,
      phone: doc.phone,
      address: doc.address,
      contacts: doc.contacts,
      creditLimit: doc.creditLimit,
      paymentTerms: doc.paymentTerms,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findById(id: string, tenantId: string): Promise<Customer | null> {
    const doc = await CustomerModel.findOne({ _id: id, tenantId });
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByCode(code: string, tenantId: string): Promise<Customer | null> {
    const doc = await CustomerModel.findOne({ code, tenantId });
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByEmail(email: string, tenantId: string): Promise<Customer | null> {
    const doc = await CustomerModel.findOne({ email, tenantId });
    return doc ? this.mapToEntity(doc) : null;
  }

  async searchByName(name: string, tenantId: string): Promise<Customer[]> {
    const docs = await CustomerModel.find({
      tenantId,
      name: { $regex: name, $options: 'i' },
      isActive: true,
    }).limit(20);
    return docs.map(this.mapToEntity);
  }

  async findByType(type: string, tenantId: string): Promise<Customer[]> {
    const docs = await CustomerModel.find({ type, tenantId, isActive: true });
    return docs.map(this.mapToEntity);
  }

  async findAll(tenantId: string, params?: PaginationParams): Promise<PaginatedResult<Customer>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const query = { tenantId };
    const total = await CustomerModel.countDocuments(query);
    
    let queryBuilder = CustomerModel.find(query).skip(skip).limit(limit);
    
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

  async create(entity: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const doc = await CustomerModel.create(entity);
    return this.mapToEntity(doc);
  }

  async update(id: string, tenantId: string, entity: Partial<Customer>): Promise<Customer | null> {
    const doc = await CustomerModel.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: entity },
      { new: true }
    );
    return doc ? this.mapToEntity(doc) : null;
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await CustomerModel.deleteOne({ _id: id, tenantId });
    return result.deletedCount > 0;
  }

  async exists(id: string, tenantId: string): Promise<boolean> {
    const count = await CustomerModel.countDocuments({ _id: id, tenantId });
    return count > 0;
  }
}