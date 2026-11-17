'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface InventoryMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (movementData: MovementFormData) => Promise<void>;
  movement?: InventoryMovement;
}

interface InventoryMovement {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  movementType: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  unitCost: number;
  totalCost: number;
  reason: string;
  reference: string;
  locationFrom?: string;
  locationTo?: string;
  performedBy: string;
  movementDate: string;
}

interface MovementFormData {
  itemId: string;
  itemCode: string;
  itemName: string;
  movementType: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  unitCost: number;
  reason: string;
  reference: string;
  locationFrom?: string;
  locationTo?: string;
  movementDate: string;
}

export function InventoryMovementModal({ isOpen, onClose, onSubmit, movement }: InventoryMovementModalProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<MovementFormData>({
    itemId: movement?.itemId || '',
    itemCode: movement?.itemCode || '',
    itemName: movement?.itemName || '',
    movementType: movement?.movementType || 'in',
    quantity: movement?.quantity || 0,
    unitCost: movement?.unitCost || 0,
    reason: movement?.reason || '',
    reference: movement?.reference || '',
    locationFrom: movement?.locationFrom || '',
    locationTo: movement?.locationTo || '',
    movementDate: movement?.movementDate ? movement.movementDate.split('T')[0] : new Date().toISOString().split('T')[0],
  });

  const movementTypeOptions = [
    { value: 'in', label: t('scm.movements.types.in') },
    { value: 'out', label: t('scm.movements.types.out') },
    { value: 'adjustment', label: t('scm.movements.types.adjustment') },
    { value: 'transfer', label: t('scm.movements.types.transfer') },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemCode.trim()) {
      newErrors.itemCode = t('scm.items.validation.codeRequired');
    }

    if (!formData.itemName.trim()) {
      newErrors.itemName = t('scm.items.validation.nameRequired');
    }

    if (!formData.quantity || formData.quantity === 0) {
      newErrors.quantity = '수량은 필수입니다';
    }

    if (!formData.unitCost || formData.unitCost < 0) {
      newErrors.unitCost = '단가는 0 이상이어야 합니다';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = '사유는 필수입니다';
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
      setFormData({
        itemId: '',
        itemCode: '',
        itemName: '',
        movementType: 'in',
        quantity: 0,
        unitCost: 0,
        reason: '',
        reference: '',
        locationFrom: '',
        locationTo: '',
        movementDate: new Date().toISOString().split('T')[0],
      });
      setErrors({});
    } catch (error) {
      console.error('Error submitting movement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof MovementFormData, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Calculate total cost when quantity or unit cost changes
      if (field === 'quantity' || field === 'unitCost') {
        // Auto-calculate total cost (not included in form data as it's calculated)
      }
      return updated;
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const totalCost = formData.quantity * formData.unitCost;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={movement ? '재고 이동 편집' : t('scm.movements.createMovement')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('scm.items.itemCode')}
            value={formData.itemCode}
            onChange={(e) => handleChange('itemCode', e.target.value)}
            error={errors.itemCode}
            required
          />

          <Input
            label={t('scm.items.itemName')}
            value={formData.itemName}
            onChange={(e) => handleChange('itemName', e.target.value)}
            error={errors.itemName}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label={t('scm.movements.type')}
            value={formData.movementType}
            onChange={(e) => handleChange('movementType', e.target.value)}
            options={movementTypeOptions}
            required
          />

          <Input
            label={t('scm.movements.date')}
            type="date"
            value={formData.movementDate}
            onChange={(e) => handleChange('movementDate', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label={t('scm.movements.quantity')}
            type="number"
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', Number(e.target.value))}
            error={errors.quantity}
            required
          />

          <Input
            label={t('scm.movements.unitCost')}
            type="number"
            step="0.01"
            value={formData.unitCost}
            onChange={(e) => handleChange('unitCost', Number(e.target.value))}
            error={errors.unitCost}
            required
          />

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('scm.movements.totalCost')}
            </label>
            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
              {totalCost.toLocaleString('ko-KR')}원
            </div>
          </div>
        </div>

        {(formData.movementType === 'transfer') && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="출고 위치"
              value={formData.locationFrom || ''}
              onChange={(e) => handleChange('locationFrom', e.target.value)}
            />

            <Input
              label="입고 위치"
              value={formData.locationTo || ''}
              onChange={(e) => handleChange('locationTo', e.target.value)}
            />
          </div>
        )}

        <Input
          label={t('scm.movements.reason')}
          value={formData.reason}
          onChange={(e) => handleChange('reason', e.target.value)}
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

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
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
            {movement ? t('common.update') : t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}