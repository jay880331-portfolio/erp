import { ITransactionRepository } from '@/core/domain/repositories/ITransactionRepository';
import { IAccountRepository } from '@/core/domain/repositories/IAccountRepository';
import { CreateTransactionDto } from '@/core/application/dtos/finance.dto';
import { Transaction } from '@/core/domain/entities/Transaction';
import { AccountingService } from '@/core/domain/services/AccountingService';
import { JwtPayload } from '@/core/infrastructure/auth/jwt';
import { connectDB } from '@/core/infrastructure/database/mongoose/connection';
import mongoose from 'mongoose';

export class CreateTransactionUseCase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private accountRepository: IAccountRepository,
    private accountingService: AccountingService
  ) {}

  async execute(dto: CreateTransactionDto, currentUser: JwtPayload): Promise<Transaction> {
    await connectDB();

    // Validate transaction lines (double-entry accounting)
    this.accountingService.validateTransaction(dto.lines);

    // Start a MongoDB session for transaction
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();

      // Verify all accounts exist and belong to the tenant
      for (const line of dto.lines) {
        const account = await this.accountRepository.findById(
          line.accountId,
          currentUser.tenantId
        );
        
        if (!account) {
          throw new Error(`Account ${line.accountId} not found`);
        }
        
        if (!account.isActive) {
          throw new Error(`Account ${account.code} is not active`);
        }
      }

      // Get next reference number
      const referenceNumber = await this.transactionRepository.getNextReferenceNumber(
        currentUser.tenantId
      );

      // Create transaction
      const transaction = await this.transactionRepository.create({
        tenantId: currentUser.tenantId,
        referenceNumber,
        date: dto.date,
        description: dto.description,
        lines: dto.lines,
        status: 'draft',
        createdBy: currentUser.userId,
      });

      // If user is admin, auto-post the transaction
      if (currentUser.role === 'admin') {
        // Update account balances
        for (const line of dto.lines) {
          const account = await this.accountRepository.findById(
            line.accountId,
            currentUser.tenantId
          );
          
          if (account) {
            const balanceChange = this.accountingService.calculateAccountBalance(
              0,
              account.type,
              line.debit,
              line.credit
            );
            
            await this.accountRepository.updateBalance(
              line.accountId,
              currentUser.tenantId,
              balanceChange
            );
          }
        }

        // Update transaction status
        await this.transactionRepository.update(
          transaction.id,
          currentUser.tenantId,
          {
            status: 'posted',
            approvedBy: currentUser.userId,
            approvedAt: new Date(),
          }
        );

        transaction.status = 'posted';
        transaction.approvedBy = currentUser.userId;
        transaction.approvedAt = new Date();
      }

      await session.commitTransaction();
      return transaction;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}