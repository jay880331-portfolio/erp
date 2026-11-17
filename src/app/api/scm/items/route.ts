import { NextRequest, NextResponse } from 'next/server';
import { CreateItemSchema } from '@/core/application/dtos/scm.dto';
import { CreateItemUseCase } from '@/core/application/use-cases/scm/CreateItemUseCase';
import { ItemRepository } from '@/core/infrastructure/database/repositories/ItemRepository';
import { requireAuth } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    const body = await request.json();
    
    const validationResult = CreateItemSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const itemRepository = new ItemRepository();
    const useCase = new CreateItemUseCase(itemRepository);
    
    const item = await useCase.execute(validationResult.data, currentUser);

    return NextResponse.json(item, { status: 201 });
  } catch (error: unknown) {
    console.error('Create item error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to create item';
    
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (message.includes('Only admins')) {
      return NextResponse.json({ error: message }, { status: 403 });
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
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const itemRepository = new ItemRepository();

    if (search) {
      const items = await itemRepository.searchByName(search, currentUser.tenantId);
      return NextResponse.json(items);
    }

    if (type) {
      const items = await itemRepository.findByType(type, currentUser.tenantId);
      return NextResponse.json(items);
    }

    const result = await itemRepository.findAll(currentUser.tenantId, {
      page,
      limit,
      sortBy: 'code',
      sortOrder: 'asc',
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Get items error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to fetch items';
    
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}