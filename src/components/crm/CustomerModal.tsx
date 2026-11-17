'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customerData: CustomerFormData) => Promise<void>;
  customer?: Customer;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  status: 'active' | 'inactive';
  totalOrders: number;
  totalRevenue: number;
  createdAt: string;
}

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  status: 'active' | 'inactive';
}

export function CustomerModal({ isOpen, onClose, onSubmit, customer }: CustomerModalProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<CustomerFormData>({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    company: customer?.company || '',
    address: customer?.address || '',
    status: customer?.status || 'active',
  });

  const statusOptions = [
    { value: 'active', label: t('common.active') },
    { value: 'inactive', label: t('common.inactive') },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('crm.customers.validation.nameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('crm.customers.validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('crm.customers.validation.emailInvalid');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('crm.customers.validation.phoneRequired');
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
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        status: 'active',
      });
      setErrors({});
    } catch (error) {
      console.error('Error submitting customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? t('crm.customers.editCustomer') : t('crm.customers.createCustomer')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('crm.customers.customerName')}
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          required
        />

        <Input
          label={t('crm.customers.email')}
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          required
        />

        <Input
          label={t('crm.customers.phone')}
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={errors.phone}
          required
        />

        <Input
          label={t('crm.customers.company')}
          value={formData.company}
          onChange={(e) => handleChange('company', e.target.value)}
        />

        <Input
          label={t('crm.customers.address')}
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
        />

        <Select
          label={t('common.status')}
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
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
            {customer ? t('common.update') : t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}