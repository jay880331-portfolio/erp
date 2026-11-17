import { z } from 'zod';

export const CreateAccountSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(2).max(100),
  type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
  parentAccountId: z.string().optional(),
  currency: z.string().default('USD'),
});

export type CreateAccountDto = z.infer<typeof CreateAccountSchema>;

export const UpdateAccountSchema = CreateAccountSchema.partial().omit({ code: true });
export type UpdateAccountDto = z.infer<typeof UpdateAccountSchema>;

export const TransactionLineSchema = z.object({
  accountId: z.string(),
  debit: z.number().min(0),
  credit: z.number().min(0),
  description: z.string().optional(),
});

export const CreateTransactionSchema = z.object({
  date: z.string().transform(str => new Date(str)),
  description: z.string().min(1).max(500),
  lines: z.array(TransactionLineSchema).min(2),
});

export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>;

export const FinancialReportParamsSchema = z.object({
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
});

export type FinancialReportParamsDto = z.infer<typeof FinancialReportParamsSchema>;