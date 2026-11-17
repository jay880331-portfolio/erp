export interface TransactionLine {
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface Transaction {
  id: string;
  tenantId: string;
  referenceNumber: string;
  date: Date;
  description: string;
  lines: TransactionLine[];
  status: 'draft' | 'posted' | 'void';
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}