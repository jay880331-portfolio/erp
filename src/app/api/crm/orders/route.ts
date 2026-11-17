import { NextRequest, NextResponse } from 'next/server';
import { CreateOrderSchema } from '@/core/application/dtos/crm.dto';
import { CreateOrderUseCase } from '@/core/application/use-cases/crm/CreateOrderUseCase';
import { OrderRepository } from '@/core/infrastructure/database/repositories/OrderRepository';
import { CustomerRepository } from '@/core/infrastructure/database/repositories/CustomerRepository';
import { ItemRepository } from '@/core/infrastructure/database/repositories/ItemRepository';
import { requireAuth } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    const body = await request.json();
    
    const validationResult = CreateOrderSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const orderRepository = new OrderRepository();
    const customerRepository = new CustomerRepository();
    const itemRepository = new ItemRepository();
    
    const useCase = new CreateOrderUseCase(
      orderRepository,
      customerRepository,
      itemRepository
    );
    
    const order = await useCase.execute(validationResult.data, currentUser);

    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    console.error('Create order error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to create order';
    
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');

    const orderRepository = new OrderRepository();

    if (customerId) {
      const orders = await orderRepository.findByCustomer(customerId, currentUser.tenantId);
      return NextResponse.json(orders);
    }

    if (status) {
      const orders = await orderRepository.findByStatus(status, currentUser.tenantId);
      return NextResponse.json(orders);
    }

    const result = await orderRepository.findAll(currentUser.tenantId, {
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Get orders error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to fetch orders';
    
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}