import { z } from 'zod';

export const RegisterTenantSchema = z.object({
  tenantName: z.string().min(2).max(100),
  domain: z.string().optional(),
  adminName: z.string().min(2).max(100),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8).max(100),
});

export type RegisterTenantDto = z.infer<typeof RegisterTenantSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const CreateUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(['admin', 'user']),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
  };
  tenant: {
    id: string;
    name: string;
  };
}