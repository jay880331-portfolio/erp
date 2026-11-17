'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itemData: ItemFormData) => Promise<void>;
  item?: Item;
}

interface Item {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  price: number;
  isActive: boolean;
  createdAt: string;
}

interface ItemFormData {
  code: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  price: number;
  isActive: boolean;
}

export function ItemModal({ isOpen, onClose, onSubmit, item }: ItemModalProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<ItemFormData>({
    code: item?.code || '',
    name: item?.name || '',
    description: item?.description || '',
    category: item?.category || '',
    unit: item?.unit || 'ea',
    price: item?.price || 0,
    isActive: item?.isActive ?? true,
  });

  const unitOptions = [
    { value: 'ea', label: '개' },
    { value: 'kg', label: 'kg' },
    { value: 'liter', label: '리터' },
    { value: 'meter', label: '미터' },
    { value: 'box', label: '박스' },
    { value: 'pack', label: '팩' },
  ];

  const statusOptions = [
    { value: 'true', label: t('common.active') },
    { value: 'false', label: t('common.inactive') },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = t('scm.items.validation.codeRequired');
    }

    if (!formData.name.trim()) {
      newErrors.name = t('scm.items.validation.nameRequired');
    }

    if (!formData.category.trim()) {
      newErrors.category = t('scm.items.validation.categoryRequired');
    }

    if (formData.price < 0) {
      newErrors.price = t('scm.items.validation.pricePositive');
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
        code: '',
        name: '',
        description: '',
        category: '',
        unit: 'ea',
        price: 0,
        isActive: true,
      });
      setErrors({});
    } catch (error) {
      console.error('Error submitting item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ItemFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? t('scm.items.editItem') : t('scm.items.createItem')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('scm.items.itemCode')}
          value={formData.code}
          onChange={(e) => handleChange('code', e.target.value)}
          error={errors.code}
          required
        />

        <Input
          label={t('scm.items.itemName')}
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          required
        />

        <Input
          label={t('scm.items.description')}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />

        <Input
          label={t('scm.items.category')}
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          error={errors.category}
          required
        />

        <Select
          label={t('scm.items.unit')}
          value={formData.unit}
          onChange={(e) => handleChange('unit', e.target.value)}
          options={unitOptions}
          required
        />

        <Input
          label={t('scm.items.price')}
          type="number"
          min="0"
          step="0.01"
          value={formData.price}
          onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
          error={errors.price}
          required
        />

        <Select
          label={t('common.status')}
          value={formData.isActive.toString()}
          onChange={(e) => handleChange('isActive', e.target.value === 'true')}
          options={statusOptions}
          required
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {item ? t('common.update') : t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}