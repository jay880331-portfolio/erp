import { NextRequest, NextResponse } from 'next/server';
import { CreateCustomerSchema } from '@/core/application/dtos/crm.dto';
import { CreateCustomerUseCase } from '@/core/application/use-cases/crm/CreateCustomerUseCase';
import { CustomerRepository } from '@/core/infrastructure/database/repositories/CustomerRepository';
import { requireAuth } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    const body = await request.json();
    
    const validationResult = CreateCustomerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const customerRepository = new CustomerRepository();
    const useCase = new CreateCustomerUseCase(customerRepository);
    
    const customer = await useCase.execute(validationResult.data, currentUser);

    return NextResponse.json(customer, { status: 201 });
  } catch (error: unknown) {
    console.error('Create customer error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to create customer';
    
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

    const customerRepository = new CustomerRepository();

    if (search) {
      const customers = await customerRepository.searchByName(search, currentUser.tenantId);
      return NextResponse.json(customers);
    }

    if (type) {
      const customers = await customerRepository.findByType(type, currentUser.tenantId);
      return NextResponse.json(customers);
    }

    const result = await customerRepository.findAll(currentUser.tenantId, {
      page,
      limit,
      sortBy: 'code',
      sortOrder: 'asc',
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Get customers error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to fetch customers';
    
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}