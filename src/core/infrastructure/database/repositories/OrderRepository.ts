import { Order } from '@/core/domain/entities/Order';
import { IOrderRepository } from '@/core/domain/repositories/IOrderRepository';
import { OrderModel, IOrderDocument } from '../mongoose/models/OrderModel';
import { PaginationParams, PaginatedResult } from '@/common/types';

export class OrderRepository implements IOrderRepository {
  private mapToEntity(doc: IOrderDocument): Order {
    return {
      id: doc._id.toString(),
      tenantId: doc.tenantId,
      orderNumber: doc.orderNumber,
      type: doc.type,
      customerId: doc.customerId,
      supplierId: doc.supplierId,
      date: doc.date,
      dueDate: doc.dueDate,
      status: doc.status,
      lines: doc.lines,
      subtotal: doc.subtotal,
      totalDiscount: doc.totalDiscount,
      totalTax: doc.totalTax,
      total: doc.total,
      notes: doc.notes,
      shippingAddress: doc.shippingAddress,
      createdBy: doc.createdBy,
      approvedBy: doc.approvedBy,
      approvedAt: doc.approvedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findById(id: string, tenantId: string): Promise<Order | null> {
    const doc = await OrderModel.findOne({ _id: id, tenantId });
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByOrderNumber(orderNumber: string, tenantId: string): Promise<Order | null> {
    const doc = await OrderModel.findOne({ orderNumber, tenantId });
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByCustomer(customerId: string, tenantId: string): Promise<Order[]> {
    const docs = await OrderModel.find({ customerId, tenantId }).sort({ date: -1 });
    return docs.map(this.mapToEntity);
  }

  async findByStatus(status: string, tenantId: string): Promise<Order[]> {
    const docs = await OrderModel.find({ status, tenantId }).sort({ date: -1 });
    return docs.map(this.mapToEntity);
  }

  async findByDateRange(tenantId: string, startDate: Date, endDate: Date): Promise<Order[]> {
    const docs = await OrderModel.find({
      tenantId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: -1 });
    return docs.map(this.mapToEntity);
  }

  async getNextOrderNumber(tenantId: string, type: 'sales' | 'purchase'): Promise<string> {
    const prefix = type === 'sales' ? 'SO' : 'PO';
    
    const lastOrder = await OrderModel.findOne({ tenantId, type })
      .sort({ orderNumber: -1 })
      .select('orderNumber');

    if (!lastOrder) {
      return `${prefix}-000001`;
    }

    const lastNumber = parseInt(lastOrder.orderNumber.split('-')[1] || '0');
    const nextNumber = lastNumber + 1;
    return `${prefix}-${nextNumber.toString().padStart(6, '0')}`;
  }

  async findAll(tenantId: string, params?: PaginationParams): Promise<PaginatedResult<Order>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const query = { tenantId };
    const total = await OrderModel.countDocuments(query);
    
    let queryBuilder = OrderModel.find(query).skip(skip).limit(limit);
    
    if (params?.sortBy) {
      const sortOrder = params.sortOrder === 'desc' ? -1 : 1;
      queryBuilder = queryBuilder.sort({ [params.sortBy]: sortOrder });
    } else {
      queryBuilder = queryBuilder.sort({ date: -1, orderNumber: -1 });
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

  async create(entity: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const doc = await OrderModel.create(entity);
    return this.mapToEntity(doc);
  }

  async update(id: string, tenantId: string, entity: Partial<Order>): Promise<Order | null> {
    const doc = await OrderModel.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: entity },
      { new: true }
    );
    return doc ? this.mapToEntity(doc) : null;
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await OrderModel.deleteOne({ _id: id, tenantId });
    return result.deletedCount > 0;
  }

  async exists(id: string, tenantId: string): Promise<boolean> {
    const count = await OrderModel.countDocuments({ _id: id, tenantId });
    return count > 0;
  }
}