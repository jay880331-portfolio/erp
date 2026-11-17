import { NextRequest, NextResponse } from 'next/server';
import { CreateAccountSchema } from '@/core/application/dtos/finance.dto';
import { AccountRepository } from '@/core/infrastructure/database/repositories/AccountRepository';
import { requireAuth } from '@/app/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth();
    const body = await request.json();
    const { id } = await params;
    
    const validationResult = CreateAccountSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const accountRepository = new AccountRepository();
    
    // Check if account exists and belongs to the tenant
    const existingAccount = await accountRepository.findById(id, currentUser.tenantId);
    if (!existingAccount) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    const updatedAccount = await accountRepository.update(id, currentUser.tenantId, validationResult.data);

    return NextResponse.json(updatedAccount);
  } catch (error: unknown) {
    console.error('Update account error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to update account';
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth();
    const { id } = await params;

    const accountRepository = new AccountRepository();
    
    // Check if account exists and belongs to the tenant
    const existingAccount = await accountRepository.findById(id, currentUser.tenantId);
    if (!existingAccount) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Check if account has transactions (prevent deletion if it has transactions)
    // This would require a transaction repository to check
    // For now, we'll allow deletion

    await accountRepository.delete(id, currentUser.tenantId);

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error: unknown) {
    console.error('Delete account error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to delete account';
    
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth();
    const { id } = await params;

    const accountRepository = new AccountRepository();
    const account = await accountRepository.findById(id, currentUser.tenantId);
    
    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(account);
  } catch (error: unknown) {
    console.error('Get account error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to fetch account';
    
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch account' },
      { status: 500 }
    );
  }
}