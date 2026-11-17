import { InventoryMovement, InventoryStock } from '@/core/domain/entities/Inventory';
import { IInventoryRepository } from '@/core/domain/repositories/IInventoryRepository';
import { 
  InventoryMovementModel, 
  InventoryStockModel, 
  IInventoryMovementDocument, 
  IInventoryStockDocument 
} from '../mongoose/models/InventoryModel';
import { PaginationParams, PaginatedResult } from '@/common/types';

export class InventoryRepository implements IInventoryRepository {
  private mapMovementToEntity(doc: IInventoryMovementDocument): InventoryMovement {
    return {
      id: doc._id.toString(),
      tenantId: doc.tenantId,
      itemId: doc.itemId,
      type: doc.type,
      quantity: doc.quantity,
      unitCost: doc.unitCost,
      referenceType: doc.referenceType,
      referenceId: doc.referenceId,
      warehouseId: doc.warehouseId,
      notes: doc.notes,
      createdBy: doc.createdBy,
      createdAt: doc.createdAt,
    };
  }

  private mapStockToEntity(doc: IInventoryStockDocument): InventoryStock {
    return {
      id: doc._id.toString(),
      tenantId: doc.tenantId,
      itemId: doc.itemId,
      warehouseId: doc.warehouseId,
      quantity: doc.quantity,
      averageCost: doc.averageCost,
      lastMovementDate: doc.lastMovementDate,
      updatedAt: doc.updatedAt,
    };
  }

  // InventoryMovement methods
  async createMovement(movement: Omit<InventoryMovement, 'id' | 'createdAt'>): Promise<InventoryMovement> {
    const doc = await InventoryMovementModel.create(movement);
    return this.mapMovementToEntity(doc);
  }

  async findMovementsByItem(
    itemId: string, 
    tenantId: string, 
    params?: PaginationParams
  ): Promise<PaginatedResult<InventoryMovement>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const query = { itemId, tenantId };
    const total = await InventoryMovementModel.countDocuments(query);
    
    const docs = await InventoryMovementModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data: docs.map(this.mapMovementToEntity),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findMovementsByDateRange(
    tenantId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<InventoryMovement[]> {
    const docs = await InventoryMovementModel.find({
      tenantId,
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: -1 });

    return docs.map(this.mapMovementToEntity);
  }

  // InventoryStock methods
  async findStockByItem(
    itemId: string, 
    tenantId: string, 
    warehouseId?: string
  ): Promise<InventoryStock | null> {
    const query: Record<string, unknown> = { itemId, tenantId };
    if (warehouseId) {
      query.warehouseId = warehouseId;
    }

    const doc = await InventoryStockModel.findOne(query);
    return doc ? this.mapStockToEntity(doc) : null;
  }

  async findAllStock(
    tenantId: string, 
    params?: PaginationParams
  ): Promise<PaginatedResult<InventoryStock>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const query = { tenantId };
    const total = await InventoryStockModel.countDocuments(query);
    
    let queryBuilder = InventoryStockModel.find(query).skip(skip).limit(limit);
    
    if (params?.sortBy) {
      const sortOrder = params.sortOrder === 'desc' ? -1 : 1;
      queryBuilder = queryBuilder.sort({ [params.sortBy]: sortOrder });
    } else {
      queryBuilder = queryBuilder.sort({ quantity: 1 }); // Show low stock first
    }

    const docs = await queryBuilder.exec();

    return {
      data: docs.map(this.mapStockToEntity),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStock(
    itemId: string, 
    tenantId: string, 
    quantity: number, 
    averageCost: number, 
    warehouseId?: string
  ): Promise<InventoryStock> {
    const query: Record<string, unknown> = { itemId, tenantId };
    if (warehouseId) {
      query.warehouseId = warehouseId;
    }

    const doc = await InventoryStockModel.findOneAndUpdate(
      query,
      {
        $set: {
          quantity,
          averageCost,
          lastMovementDate: new Date(),
        },
      },
      { 
        new: true, 
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return this.mapStockToEntity(doc);
  }

  async findLowStock(tenantId: string, threshold: number): Promise<InventoryStock[]> {
    const docs = await InventoryStockModel.find({
      tenantId,
      quantity: { $lte: threshold },
    }).sort({ quantity: 1 });

    return docs.map(this.mapStockToEntity);
  }
}