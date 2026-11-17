'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (adjustmentData: AdjustmentFormData) => Promise<void>;
  inventoryItem?: InventoryItem;
}

interface InventoryItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  category: string;
  unit: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  minimumStock: number;
  maximumStock: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastUpdated: string;
}

interface AdjustmentFormData {
  itemId: string;
  itemCode: string;
  itemName: string;
  currentStock: number;
  adjustmentType: 'increase' | 'decrease' | 'set';
  adjustmentQuantity: number;
  newStock: number;
  reason: string;
  reference: string;
  notes: string;
}

export function StockAdjustmentModal({ isOpen, onClose, onSubmit, inventoryItem }: StockAdjustmentModalProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<AdjustmentFormData>({
    itemId: inventoryItem?.itemId || '',
    itemCode: inventoryItem?.itemCode || '',
    itemName: inventoryItem?.itemName || '',
    currentStock: inventoryItem?.currentStock || 0,
    adjustmentType: 'increase',
    adjustmentQuantity: 0,
    newStock: inventoryItem?.currentStock || 0,
    reason: '',
    reference: `ADJ-${Date.now()}`,
    notes: '',
  });

  const adjustmentTypeOptions = [
    { value: 'increase', label: '재고 증가' },
    { value: 'decrease', label: '재고 감소' },
    { value: 'set', label: '재고 설정' },
  ];

  const reasonOptions = [
    { value: '손상품 폐기', label: '손상품 폐기' },
    { value: '분실', label: '분실' },
    { value: '도난', label: '도난' },
    { value: '재고 실사 조정', label: '재고 실사 조정' },
    { value: '반품 입고', label: '반품 입고' },
    { value: '기타', label: '기타' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemCode.trim()) {
      newErrors.itemCode = '품목 코드를 선택해주세요';
    }

    if (!formData.adjustmentQuantity || formData.adjustmentQuantity === 0) {
      newErrors.adjustmentQuantity = '조정 수량을 입력해주세요';
    }

    if (formData.adjustmentType === 'decrease' && formData.adjustmentQuantity > formData.currentStock) {
      newErrors.adjustmentQuantity = '감소 수량이 현재 재고보다 클 수 없습니다';
    }

    if (formData.adjustmentType === 'set' && formData.adjustmentQuantity < 0) {
      newErrors.adjustmentQuantity = '설정 재고는 0 이상이어야 합니다';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = '조정 사유를 선택해주세요';
    }

    if (!formData.reference.trim()) {
      newErrors.reference = '참조번호는 필수입니다';
    }

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
        itemId: '',
        itemCode: '',
        itemName: '',
        currentStock: 0,
        adjustmentType: 'increase',
        adjustmentQuantity: 0,
        newStock: 0,
        reason: '',
        reference: `ADJ-${Date.now()}`,
        notes: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Error submitting adjustment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof AdjustmentFormData, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Calculate new stock based on adjustment type and quantity
      if (field === 'adjustmentType' || field === 'adjustmentQuantity') {
        const currentStock = updated.currentStock;
        const adjustmentQty = updated.adjustmentQuantity;
        const adjustmentType = updated.adjustmentType;
        
        switch (adjustmentType) {
          case 'increase':
            updated.newStock = currentStock + adjustmentQty;
            break;
          case 'decrease':
            updated.newStock = Math.max(0, currentStock - adjustmentQty);
            break;
          case 'set':
            updated.newStock = adjustmentQty;
            break;
        }
      }
      
      return updated;
    });
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleItemSelect = (itemCode: string) => {
    // In a real app, you would fetch item details from an API
    // For now, we'll use the selected inventory item
    if (inventoryItem && inventoryItem.itemCode === itemCode) {
      setFormData(prev => ({
        ...prev,
        itemId: inventoryItem.itemId,
        itemCode: inventoryItem.itemCode,
        itemName: inventoryItem.itemName,
        currentStock: inventoryItem.currentStock,
        newStock: inventoryItem.currentStock,
      }));
    }
  };

  const stockDifference = formData.newStock - formData.currentStock;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="재고 조정"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Item Selection */}
        <div className="border-b pb-4">
          <h4 className="text-lg font-medium text-gray-900 mb-4">품목 정보</h4>
          
          {inventoryItem ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">품목 코드</label>
                  <div className="mt-1 text-sm text-gray-900 font-mono">{inventoryItem.itemCode}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">품목명</label>
                  <div className="mt-1 text-sm text-gray-900">{inventoryItem.itemName}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">현재 재고</label>
                  <div className="mt-1 text-sm text-gray-900 font-semibold">{inventoryItem.currentStock.toLocaleString()}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">단위</label>
                  <div className="mt-1 text-sm text-gray-900">{inventoryItem.unit}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="품목 코드"
                value={formData.itemCode}
                onChange={(e) => {
                  handleChange('itemCode', e.target.value);
                  handleItemSelect(e.target.value);
                }}
                error={errors.itemCode}
                required
              />

              <Input
                label="품목명"
                value={formData.itemName}
                onChange={(e) => handleChange('itemName', e.target.value)}
                disabled
              />
            </div>
          )}
        </div>

        {/* Adjustment Details */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">조정 내용</h4>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Select
              label="조정 유형"
              value={formData.adjustmentType}
              onChange={(e) => handleChange('adjustmentType', e.target.value)}
              options={adjustmentTypeOptions}
              required
            />

            <Input
              label={
                formData.adjustmentType === 'set' ? '새 재고 수량' :
                formData.adjustmentType === 'increase' ? '증가 수량' : '감소 수량'
              }
              type="number"
              min="0"
              value={formData.adjustmentQuantity}
              onChange={(e) => handleChange('adjustmentQuantity', Number(e.target.value))}
              error={errors.adjustmentQuantity}
              required
            />
          </div>

          {/* Stock Summary */}
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600">현재 재고</div>
                <div className="text-lg font-semibold text-gray-900">{formData.currentStock.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">변경량</div>
                <div className={`text-lg font-semibold ${
                  stockDifference > 0 ? 'text-green-600' : 
                  stockDifference < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stockDifference > 0 ? '+' : ''}{stockDifference.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">조정 후 재고</div>
                <div className="text-lg font-semibold text-indigo-600">{formData.newStock.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Select
              label="조정 사유"
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              options={reasonOptions}
              error={errors.reason}
              required
            />

            <Input
              label="참조번호"
              value={formData.reference}
              onChange={(e) => handleChange('reference', e.target.value)}
              error={errors.reference}
              required
            />

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                추가 메모
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="조정에 대한 추가 설명이나 특이사항을 입력하세요..."
              />
            </div>
          </div>
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
            재고 조정 실행
          </Button>
        </div>
      </form>
    </Modal>
  );
}