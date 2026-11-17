import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { connectDB } from '@/core/infrastructure/config/database';

interface AdjustmentData {
  itemId: string;
  itemCode: string;
  itemName: string;
  currentStock: number;
  adjustmentType: 'increase' | 'decrease' | 'set';
  adjustmentQuantity: number;
  newStock: number;
  reason: string;
  reference: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    const body: AdjustmentData = await request.json();
    
    // Validate required fields
    if (!body.itemCode || !body.adjustmentQuantity || !body.reason || !body.reference) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Create adjustment record (simplified - in real app would use proper entities/repositories)
    const adjustment = {
      id: Date.now().toString(),
      tenantId: currentUser.tenantId,
      itemId: body.itemId,
      itemCode: body.itemCode,
      itemName: body.itemName,
      adjustmentType: body.adjustmentType,
      previousStock: body.currentStock,
      adjustmentQuantity: body.adjustmentQuantity,
      newStock: body.newStock,
      reason: body.reason,
      reference: body.reference,
      notes: body.notes || '',
      performedBy: currentUser.userId,
      performedByName: 'System User',
      adjustmentDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // In a real implementation, you would:
    // 1. Create an inventory adjustment record
    // 2. Update the actual inventory stock levels
    // 3. Create an inventory movement record
    // 4. Use proper transaction handling

    return NextResponse.json(adjustment, { status: 201 });
  } catch (error: unknown) {
    console.error('Create adjustment error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to create adjustment';
    
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
    const itemCode = searchParams.get('itemCode');

    await connectDB();

    // Mock data for adjustments (in real app would fetch from database)
    const mockAdjustments = [
      {
        id: '1',
        tenantId: currentUser.tenantId,
        itemCode: 'ITEM-001',
        itemName: '샘플 제품 A',
        adjustmentType: 'increase',
        previousStock: 100,
        adjustmentQuantity: 50,
        newStock: 150,
        reason: '재고 실사 조정',
        reference: 'ADJ-001',
        notes: '정기 재고조사 결과',
        performedBy: currentUser.userId,
        performedByName: 'System User',
        adjustmentDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        tenantId: currentUser.tenantId,
        itemCode: 'ITEM-002',
        itemName: '샘플 제품 B',
        adjustmentType: 'decrease',
        previousStock: 80,
        adjustmentQuantity: 10,
        newStock: 70,
        reason: '손상품 폐기',
        reference: 'ADJ-002',
        notes: '운송 중 손상 발견',
        performedBy: currentUser.userId,
        performedByName: 'System User',
        adjustmentDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    // Filter by itemCode if provided
    let filteredAdjustments = mockAdjustments;
    if (itemCode) {
      filteredAdjustments = mockAdjustments.filter(adj => 
        adj.itemCode.toLowerCase().includes(itemCode.toLowerCase())
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAdjustments = filteredAdjustments.slice(startIndex, endIndex);

    const result = {
      data: paginatedAdjustments,
      pagination: {
        page,
        limit,
        total: filteredAdjustments.length,
        totalPages: Math.ceil(filteredAdjustments.length / limit),
      },
    };

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Get adjustments error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to fetch adjustments';
    
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch adjustments' },
      { status: 500 }
    );
  }
}