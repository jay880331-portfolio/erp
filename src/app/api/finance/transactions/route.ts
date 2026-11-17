import { NextRequest, NextResponse } from 'next/server';
import { CreateTransactionSchema } from '@/core/application/dtos/finance.dto';
import { CreateTransactionUseCase } from '@/core/application/use-cases/finance/CreateTransactionUseCase';
import { TransactionRepository } from '@/core/infrastructure/database/repositories/TransactionRepository';
import { AccountRepository } from '@/core/infrastructure/database/repositories/AccountRepository';
import { AccountingService } from '@/core/domain/services/AccountingService';
import { requireAuth } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    const body = await request.json();
    
    const validationResult = CreateTransactionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const transactionRepository = new TransactionRepository();
    const accountRepository = new AccountRepository();
    const accountingService = new AccountingService();
    
    const useCase = new CreateTransactionUseCase(
      transactionRepository,
      accountRepository,
      accountingService
    );
    
    const transaction = await useCase.execute(validationResult.data, currentUser);

    return NextResponse.json(transaction, { status: 201 });
  } catch (error: unknown) {
    console.error('Create transaction error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to create transaction';
    
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

    const transactionRepository = new TransactionRepository();

    if (status) {
      const transactions = await transactionRepository.findByStatus(status, currentUser.tenantId);
      return NextResponse.json(transactions);
    }

    const result = await transactionRepository.findAll(currentUser.tenantId, {
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Get transactions error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to fetch transactions';
    
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}