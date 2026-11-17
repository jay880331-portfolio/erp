export interface OrderLine {
  itemId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export interface Order {
  id: string;
  tenantId: string;
  orderNumber: string;
  type: 'sales' | 'purchase';
  customerId?: string;
  supplierId?: string;
  date: Date;
  dueDate?: Date;
  status: 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'canceled';
  lines: OrderLine[];
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  total: number;
  notes?: string;
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}