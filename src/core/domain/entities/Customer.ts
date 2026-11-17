export interface Contact {
  name: string;
  position?: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
}

export interface Customer {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  type: 'individual' | 'company';
  taxId?: string;
  email?: string;
  phone?: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  contacts: Contact[];
  creditLimit?: number;
  paymentTerms?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}