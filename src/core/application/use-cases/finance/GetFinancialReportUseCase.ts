import { IAccountRepository } from '@/core/domain/repositories/IAccountRepository';
import { ITransactionRepository } from '@/core/domain/repositories/ITransactionRepository';
import { FinancialReportParamsDto } from '@/core/application/dtos/finance.dto';
import { JwtPayload } from '@/core/infrastructure/auth/jwt';
import { connectDB } from '@/core/infrastructure/database/mongoose/connection';

interface AccountSummary {
  id: string;
  code: string;
  name: string;
  type: string;
  balance: number;
}

interface FinancialReport {
  incomeStatement: {
    revenue: AccountSummary[];
    expenses: AccountSummary[];
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
  };
  balanceSheet: {
    assets: AccountSummary[];
    liabilities: AccountSummary[];
    equity: AccountSummary[];
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
  };
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export class GetFinancialReportUseCase {
  constructor(
    private accountRepository: IAccountRepository,
    private transactionRepository: ITransactionRepository
  ) {}

  async execute(
    params: FinancialReportParamsDto,
    currentUser: JwtPayload
  ): Promise<FinancialReport> {
    await connectDB();

    // Get all accounts for the tenant
    const accounts = await this.accountRepository.findAll(
      currentUser.tenantId,
      { page: 1, limit: 1000 }
    );

    // Get transactions for the period (for future use)
    // const transactions = await this.transactionRepository.findByDateRange(
    //   currentUser.tenantId,
    //   params.startDate,
    //   params.endDate
    // );

    // Calculate period balances
    const accountBalances = new Map<string, number>();
    
    // Initialize with current balances
    accounts.data.forEach(account => {
      accountBalances.set(account.id, account.balance);
    });

    // Group accounts by type
    const revenue: AccountSummary[] = [];
    const expenses: AccountSummary[] = [];
    const assets: AccountSummary[] = [];
    const liabilities: AccountSummary[] = [];
    const equity: AccountSummary[] = [];

    accounts.data.forEach(account => {
      const summary: AccountSummary = {
        id: account.id,
        code: account.code,
        name: account.name,
        type: account.type,
        balance: accountBalances.get(account.id) || 0,
      };

      switch (account.type) {
        case 'revenue':
          revenue.push(summary);
          break;
        case 'expense':
          expenses.push(summary);
          break;
        case 'asset':
          assets.push(summary);
          break;
        case 'liability':
          liabilities.push(summary);
          break;
        case 'equity':
          equity.push(summary);
          break;
      }
    });

    // Calculate totals
    const totalRevenue = revenue.reduce((sum, acc) => sum + acc.balance, 0);
    const totalExpenses = expenses.reduce((sum, acc) => sum + acc.balance, 0);
    const netIncome = totalRevenue - totalExpenses;

    const totalAssets = assets.reduce((sum, acc) => sum + acc.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, acc) => sum + acc.balance, 0);
    const totalEquity = equity.reduce((sum, acc) => sum + acc.balance, 0) + netIncome;

    return {
      incomeStatement: {
        revenue,
        expenses,
        totalRevenue,
        totalExpenses,
        netIncome,
      },
      balanceSheet: {
        assets,
        liabilities,
        equity,
        totalAssets,
        totalLiabilities,
        totalEquity,
      },
      period: {
        startDate: params.startDate,
        endDate: params.endDate,
      },
    };
  }
}