'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: OrderFormData) => Promise<void>;
  order?: Order;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  orderDate: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  items: number;
  createdAt: string;
}

interface OrderFormData {
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderDate: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  notes: string;
}

interface OrderItem {
  itemCode: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export function OrderModal({ isOpen, onClose, onSubmit, order }: OrderModalProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<OrderFormData>({
    orderNumber: order?.orderNumber || `ORD-${Date.now()}`,
    customerId: order?.customerId || '',
    customerName: order?.customerName || '',
    customerEmail: '',
    customerPhone: '',
    orderDate: order?.orderDate ? order.orderDate.split('T')[0] : new Date().toISOString().split('T')[0],
    status: order?.status || 'pending',
    items: [
      {
        itemCode: '',
        itemName: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
      }
    ],
    notes: '',
  });

  const statusOptions = [
    { value: 'pending', label: t('crm.orders.status.pending') },
    { value: 'confirmed', label: t('crm.orders.status.confirmed') },
    { value: 'shipped', label: t('crm.orders.status.shipped') },
    { value: 'delivered', label: t('crm.orders.status.delivered') },
    { value: 'cancelled', label: t('crm.orders.status.cancelled') },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = t('crm.customers.validation.nameRequired');
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = t('crm.customers.validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = t('crm.customers.validation.emailInvalid');
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = t('crm.customers.validation.phoneRequired');
    }

    // Validate at least one item
    if (formData.items.length === 0 || !formData.items[0].itemCode.trim()) {
      newErrors.items = '최소 1개의 품목이 필요합니다';
    }

    // Validate each item
    formData.items.forEach((item, index) => {
      if (item.itemCode.trim() && (!item.itemName.trim() || item.quantity <= 0 || item.unitPrice < 0)) {
        newErrors[`item_${index}`] = '품목 정보를 완전히 입력해주세요';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        orderNumber: `ORD-${Date.now()}`,
        customerId: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        orderDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        items: [
          {
            itemCode: '',
            itemName: '',
            quantity: 1,
            unitPrice: 0,
            totalPrice: 0,
          }
        ],
        notes: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Error submitting order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof OrderFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };
      
      // Calculate total price for the item
      if (field === 'quantity' || field === 'unitPrice') {
        newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
      }
      
      return { ...prev, items: newItems };
    });
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          itemCode: '',
          itemName: '',
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0,
        }
      ]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const totalAmount = formData.items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={order ? '주문 편집' : t('crm.orders.createOrder')}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Info */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('crm.orders.orderNumber')}
            value={formData.orderNumber}
            onChange={(e) => handleChange('orderNumber', e.target.value)}
            required
            disabled
          />

          <Input
            label={t('crm.orders.orderDate')}
            type="date"
            value={formData.orderDate}
            onChange={(e) => handleChange('orderDate', e.target.value)}
            required
          />
        </div>

        <Select
          label={t('common.status')}
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          options={statusOptions}
          required
        />

        {/* Customer Info */}
        <div className="border-t pt-4">
          <h4 className="text-lg font-medium text-gray-900 mb-4">고객 정보</h4>
          <div className="grid grid-cols-1 gap-4">
            <Input
              label={t('crm.customers.customerName')}
              value={formData.customerName}
              onChange={(e) => handleChange('customerName', e.target.value)}
              error={errors.customerName}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('crm.customers.email')}
                type="email"
                value={formData.customerEmail}
                onChange={(e) => handleChange('customerEmail', e.target.value)}
                error={errors.customerEmail}
                required
              />

              <Input
                label={t('crm.customers.phone')}
                value={formData.customerPhone}
                onChange={(e) => handleChange('customerPhone', e.target.value)}
                error={errors.customerPhone}
                required
              />
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">주문 품목</h4>
            <Button type="button" variant="outline" onClick={addItem}>
              품목 추가
            </Button>
          </div>

          {errors.items && (
            <div className="text-red-600 text-sm mb-2">{errors.items}</div>
          )}

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-medium text-gray-700">품목 {index + 1}</span>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      제거
                    </button>
                  )}
                </div>

                {errors[`item_${index}`] && (
                  <div className="text-red-600 text-sm mb-2">{errors[`item_${index}`]}</div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Input
                    label="품목 코드"
                    value={item.itemCode}
                    onChange={(e) => handleItemChange(index, 'itemCode', e.target.value)}
                    required
                  />

                  <Input
                    label="품목명"
                    value={item.itemName}
                    onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="수량"
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                    required
                  />

                  <Input
                    label="단가"
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                    required
                  />

                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      합계
                    </label>
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                      {item.totalPrice.toLocaleString('ko-KR')}원
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-right">
            <div className="text-lg font-semibold text-gray-900">
              총 주문 금액: {totalAmount.toLocaleString('ko-KR')}원
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="border-t pt-4">
          <Input
            label="주문 메모"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            helperText="주문에 대한 추가 정보나 특별 요청사항을 입력하세요"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {order ? t('common.update') : t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}