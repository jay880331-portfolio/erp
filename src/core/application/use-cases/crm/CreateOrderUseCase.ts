import { IOrderRepository } from '@/core/domain/repositories/IOrderRepository';
import { ICustomerRepository } from '@/core/domain/repositories/ICustomerRepository';
import { IItemRepository } from '@/core/domain/repositories/IItemRepository';
import { CreateOrderDto } from '@/core/application/dtos/crm.dto';
import { Order } from '@/core/domain/entities/Order';
import { JwtPayload } from '@/core/infrastructure/auth/jwt';
import { connectDB } from '@/core/infrastructure/database/mongoose/connection';

export class CreateOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private customerRepository: ICustomerRepository,
    private itemRepository: IItemRepository
  ) {}

  async execute(dto: CreateOrderDto, currentUser: JwtPayload): Promise<Order> {
    await connectDB();

    // Validate customer/supplier
    if (dto.type === 'sales' && dto.customerId) {
      const customer = await this.customerRepository.findById(
        dto.customerId,
        currentUser.tenantId
      );
      if (!customer) {
        throw new Error('Customer not found');
      }
      if (!customer.isActive) {
        throw new Error('Customer is not active');
      }
    }

    // Validate all items
    for (const line of dto.lines) {
      const item = await this.itemRepository.findById(line.itemId, currentUser.tenantId);
      if (!item) {
        throw new Error(`Item ${line.itemId} not found`);
      }
      if (!item.isActive) {
        throw new Error(`Item ${item.code} is not active`);
      }
    }

    // Validate totals
    const calculatedSubtotal = dto.lines.reduce((sum, line) => sum + line.total, 0);
    if (Math.abs(calculatedSubtotal - dto.subtotal) > 0.01) {
      throw new Error('Subtotal does not match line totals');
    }

    const calculatedTotal = dto.subtotal - dto.totalDiscount + dto.totalTax;
    if (Math.abs(calculatedTotal - dto.total) > 0.01) {
      throw new Error('Total does not match calculation');
    }

    // Get next order number
    const orderNumber = await this.orderRepository.getNextOrderNumber(
      currentUser.tenantId,
      dto.type
    );

    // Create order
    const order = await this.orderRepository.create({
      tenantId: currentUser.tenantId,
      orderNumber,
      type: dto.type,
      customerId: dto.customerId,
      supplierId: dto.supplierId,
      date: dto.date,
      dueDate: dto.dueDate,
      status: 'draft',
      lines: dto.lines,
      subtotal: dto.subtotal,
      totalDiscount: dto.totalDiscount,
      totalTax: dto.totalTax,
      total: dto.total,
      notes: dto.notes,
      shippingAddress: dto.shippingAddress,
      createdBy: currentUser.userId,
    });

    return order;
  }
}