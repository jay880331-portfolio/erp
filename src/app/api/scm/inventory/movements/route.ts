import { NextRequest, NextResponse } from 'next/server';
import { InventoryMovementSchema } from '@/core/application/dtos/scm.dto';
import { CreateInventoryMovementUseCase } from '@/core/application/use-cases/scm/CreateInventoryMovementUseCase';
import { InventoryRepository } from '@/core/infrastructure/database/repositories/InventoryRepository';
import { ItemRepository } from '@/core/infrastructure/database/repositories/ItemRepository';
import { requireAuth } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    const body = await request.json();
    
    const validationResult = InventoryMovementSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const inventoryRepository = new InventoryRepository();
    const itemRepository = new ItemRepository();
    
    const useCase = new CreateInventoryMovementUseCase(
      inventoryRepository,
      itemRepository
    );
    
    const movement = await useCase.execute(validationResult.data, currentUser);

    return NextResponse.json(movement, { status: 201 });
  } catch (error: unknown) {
    console.error('Create inventory movement error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to create inventory movement';
    
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
    
    const itemId = searchParams.get('itemId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const inventoryRepository = new InventoryRepository();

    if (itemId) {
      const result = await inventoryRepository.findMovementsByItem(
        itemId,
        currentUser.tenantId,
        { page, limit }
      );
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: 'itemId parameter is required' },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error('Get inventory movements error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to fetch inventory movements';
    
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch inventory movements' },
      { status: 500 }
    );
  }
}