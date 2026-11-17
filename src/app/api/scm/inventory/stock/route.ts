import { NextRequest, NextResponse } from 'next/server';
import { InventoryRepository } from '@/core/infrastructure/database/repositories/InventoryRepository';
import { requireAuth } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const lowStock = searchParams.get('lowStock') === 'true';
    const threshold = parseInt(searchParams.get('threshold') || '10');

    const inventoryRepository = new InventoryRepository();

    if (lowStock) {
      const stocks = await inventoryRepository.findLowStock(
        currentUser.tenantId,
        threshold
      );
      return NextResponse.json(stocks);
    }

    const result = await inventoryRepository.findAllStock(currentUser.tenantId, {
      page,
      limit,
      sortBy: 'quantity',
      sortOrder: 'asc',
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Get inventory stock error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to fetch inventory stock';
    
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch inventory stock' },
      { status: 500 }
    );
  }
}