import { IInventoryRepository } from '@/core/domain/repositories/IInventoryRepository';
import { IItemRepository } from '@/core/domain/repositories/IItemRepository';
import { InventoryMovementDto } from '@/core/application/dtos/scm.dto';
import { InventoryMovement } from '@/core/domain/entities/Inventory';
import { JwtPayload } from '@/core/infrastructure/auth/jwt';
import { connectDB } from '@/core/infrastructure/database/mongoose/connection';
import mongoose from 'mongoose';

export class CreateInventoryMovementUseCase {
  constructor(
    private inventoryRepository: IInventoryRepository,
    private itemRepository: IItemRepository
  ) {}

  async execute(dto: InventoryMovementDto, currentUser: JwtPayload): Promise<InventoryMovement> {
    await connectDB();

    // Verify item exists and belongs to the tenant
    const item = await this.itemRepository.findById(dto.itemId, currentUser.tenantId);
    if (!item) {
      throw new Error('Item not found');
    }

    if (!item.isActive) {
      throw new Error('Item is not active');
    }

    // Start a MongoDB session for transaction
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();

      // Create inventory movement
      const movement = await this.inventoryRepository.createMovement({
        tenantId: currentUser.tenantId,
        itemId: dto.itemId,
        type: dto.type,
        quantity: dto.quantity,
        unitCost: dto.unitCost,
        referenceType: dto.referenceType,
        referenceId: dto.referenceId,
        warehouseId: dto.warehouseId,
        notes: dto.notes,
        createdBy: currentUser.userId,
      });

      // Get current stock
      const currentStock = await this.inventoryRepository.findStockByItem(
        dto.itemId,
        currentUser.tenantId,
        dto.warehouseId
      );

      let newQuantity = dto.quantity;
      let newAverageCost = dto.unitCost;

      if (currentStock) {
        // Calculate new quantity based on movement type
        if (dto.type === 'in') {
          newQuantity = currentStock.quantity + dto.quantity;
          // Calculate weighted average cost
          const totalValue = (currentStock.quantity * currentStock.averageCost) + 
                            (dto.quantity * dto.unitCost);
          newAverageCost = totalValue / newQuantity;
        } else if (dto.type === 'out') {
          newQuantity = currentStock.quantity - dto.quantity;
          if (newQuantity < 0) {
            throw new Error('Insufficient stock quantity');
          }
          newAverageCost = currentStock.averageCost; // Keep the same average cost
        } else { // adjustment
          newQuantity = dto.quantity; // Set to exact quantity
          newAverageCost = dto.unitCost;
        }
      } else {
        // First stock entry
        if (dto.type === 'out') {
          throw new Error('Cannot create outbound movement without existing stock');
        }
      }

      // Update stock
      await this.inventoryRepository.updateStock(
        dto.itemId,
        currentUser.tenantId,
        newQuantity,
        newAverageCost,
        dto.warehouseId
      );

      await session.commitTransaction();
      return movement;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}