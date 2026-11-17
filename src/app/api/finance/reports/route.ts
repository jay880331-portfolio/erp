import { NextRequest, NextResponse } from 'next/server';
import { FinancialReportParamsSchema } from '@/core/application/dtos/finance.dto';
import { GetFinancialReportUseCase } from '@/core/application/use-cases/finance/GetFinancialReportUseCase';
import { AccountRepository } from '@/core/infrastructure/database/repositories/AccountRepository';
import { TransactionRepository } from '@/core/infrastructure/database/repositories/TransactionRepository';
import { requireAuth } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const params = {
      startDate: searchParams.get('startDate') || new Date(new Date().getFullYear(), 0, 1).toISOString(),
      endDate: searchParams.get('endDate') || new Date().toISOString(),
    };

    const validationResult = FinancialReportParamsSchema.safeParse(params);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const accountRepository = new AccountRepository();
    const transactionRepository = new TransactionRepository();
    
    const useCase = new GetFinancialReportUseCase(
      accountRepository,
      transactionRepository
    );
    
    const report = await useCase.execute(validationResult.data, currentUser);

    return NextResponse.json(report);
  } catch (error: unknown) {
    console.error('Get financial report error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to generate report';
    
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}