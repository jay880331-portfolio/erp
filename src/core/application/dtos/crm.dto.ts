import { z } from 'zod';

const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  position: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

const AddressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

export const CreateCustomerSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(2).max(100),
  type: z.enum(['individual', 'company']),
  taxId: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: AddressSchema.optional(),
  contacts: z.array(ContactSchema).default([]),
  creditLimit: z.number().min(0).optional(),
  paymentTerms: z.string().optional(),
});

export type CreateCustomerDto = z.infer<typeof CreateCustomerSchema>;

export const UpdateCustomerSchema = CreateCustomerSchema.partial().omit({ code: true });
export type UpdateCustomerDto = z.infer<typeof UpdateCustomerSchema>;

const OrderLineSchema = z.object({
  itemId: z.string(),
  quantity: z.number().min(0.01),
  unitPrice: z.number().min(0),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  total: z.number().min(0),
});

export const CreateOrderSchema = z.object({
  type: z.enum(['sales', 'purchase']),
  customerId: z.string().optional(),
  supplierId: z.string().optional(),
  date: z.string().transform(str => new Date(str)),
  dueDate: z.string().transform(str => new Date(str)).optional(),
  lines: z.array(OrderLineSchema).min(1),
  subtotal: z.number().min(0),
  totalDiscount: z.number().min(0).default(0),
  totalTax: z.number().min(0).default(0),
  total: z.number().min(0),
  notes: z.string().optional(),
  shippingAddress: AddressSchema.optional(),
});

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;