import { NextRequest, NextResponse } from 'next/server';
import { CreateAccountSchema } from '@/core/application/dtos/finance.dto';
import { CreateAccountUseCase } from '@/core/application/use-cases/finance/CreateAccountUseCase';
import { AccountRepository } from '@/core/infrastructure/database/repositories/AccountRepository';
import { requireAuth } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    const body = await request.json();
    
    const validationResult = CreateAccountSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const accountRepository = new AccountRepository();
    const useCase = new CreateAccountUseCase(accountRepository);
    
    const account = await useCase.execute(validationResult.data, currentUser);

    return NextResponse.json(account, { status: 201 });
  } catch (error: unknown) {
    console.error('Create account error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to create account';
    
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

    const accountRepository = new AccountRepository();

    if (type) {
      const accounts = await accountRepository.findByType(type, currentUser.tenantId);
      return NextResponse.json(accounts);
    }

    const result = await accountRepository.findAll(currentUser.tenantId, {
      page,
      limit,
      sortBy: 'code',
      sortOrder: 'asc',
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Get accounts error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to fetch accounts';
    
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}