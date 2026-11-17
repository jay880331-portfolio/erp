import { IItemRepository } from '@/core/domain/repositories/IItemRepository';
import { CreateItemDto } from '@/core/application/dtos/scm.dto';
import { Item } from '@/core/domain/entities/Item';
import { JwtPayload } from '@/core/infrastructure/auth/jwt';
import { connectDB } from '@/core/infrastructure/database/mongoose/connection';

export class CreateItemUseCase {
  constructor(private itemRepository: IItemRepository) {}

  async execute(dto: CreateItemDto, currentUser: JwtPayload): Promise<Item> {
    await connectDB();

    // Check if current user is admin
    if (currentUser.role !== 'admin') {
      throw new Error('Only admins can create items');
    }

    // Check if item code already exists
    const existingItem = await this.itemRepository.findByCode(
      dto.code,
      currentUser.tenantId
    );
    
    if (existingItem) {
      throw new Error('Item code already exists');
    }

    // Create item
    const item = await this.itemRepository.create({
      code: dto.code,
      name: dto.name,
      description: dto.description,
      type: dto.type,
      unit: dto.unit,
      specifications: dto.specifications,
      costPrice: dto.costPrice,
      sellingPrice: dto.sellingPrice,
      taxRate: dto.taxRate,
      tenantId: currentUser.tenantId,
      isActive: true,
    });

    return item;
  }
}