import { IAccountRepository } from '@/core/domain/repositories/IAccountRepository';
import { CreateAccountDto } from '@/core/application/dtos/finance.dto';
import { Account } from '@/core/domain/entities/Account';
import { JwtPayload } from '@/core/infrastructure/auth/jwt';
import { connectDB } from '@/core/infrastructure/database/mongoose/connection';

export class CreateAccountUseCase {
  constructor(private accountRepository: IAccountRepository) {}

  async execute(dto: CreateAccountDto, currentUser: JwtPayload): Promise<Account> {
    await connectDB();

    // Check if current user is admin
    if (currentUser.role !== 'admin') {
      throw new Error('Only admins can create accounts');
    }

    // Check if account code already exists
    const existingAccount = await this.accountRepository.findByCode(
      dto.code,
      currentUser.tenantId
    );
    
    if (existingAccount) {
      throw new Error('Account code already exists');
    }

    // If parent account is specified, verify it exists
    if (dto.parentAccountId) {
      const parentExists = await this.accountRepository.exists(
        dto.parentAccountId,
        currentUser.tenantId
      );
      
      if (!parentExists) {
        throw new Error('Parent account not found');
      }
    }

    // Create account
    const account = await this.accountRepository.create({
      code: dto.code,
      name: dto.name,
      type: dto.type,
      parentAccountId: dto.parentAccountId,
      currency: dto.currency,
      tenantId: currentUser.tenantId,
      balance: 0,
      isActive: true,
    });

    return account;
  }
}