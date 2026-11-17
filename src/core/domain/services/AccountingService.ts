import { TransactionLine } from '../entities/Transaction';

export class AccountingService {
  validateTransaction(lines: TransactionLine[]): boolean {
    if (!lines || lines.length === 0) {
      throw new Error('Transaction must have at least one line');
    }

    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of lines) {
      if (line.debit < 0 || line.credit < 0) {
        throw new Error('Debit and credit amounts must be positive');
      }

      if (line.debit > 0 && line.credit > 0) {
        throw new Error('A line cannot have both debit and credit amounts');
      }

      if (line.debit === 0 && line.credit === 0) {
        throw new Error('A line must have either a debit or credit amount');
      }

      totalDebit += line.debit;
      totalCredit += line.credit;
    }

    // Check if transaction is balanced (double-entry accounting)
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error(`Transaction is not balanced. Debit: ${totalDebit}, Credit: ${totalCredit}`);
    }

    return true;
  }

  calculateAccountBalance(
    previousBalance: number,
    accountType: string,
    debit: number,
    credit: number
  ): number {
    // Normal balance for each account type:
    // Assets and Expenses: Debit (increase with debit, decrease with credit)
    // Liabilities, Equity, Revenue: Credit (increase with credit, decrease with debit)
    
    const isDebitAccount = accountType === 'asset' || accountType === 'expense';
    
    if (isDebitAccount) {
      return previousBalance + debit - credit;
    } else {
      return previousBalance + credit - debit;
    }
  }
}