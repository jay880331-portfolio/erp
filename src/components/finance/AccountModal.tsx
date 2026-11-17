'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useTranslations } from 'next-intl';

interface Account {
  id?: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parentId?: string;
  isActive: boolean;
}

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (account: Omit<Account, 'id'>) => Promise<void>;
  account?: Account;
  parentAccounts: Account[];
}

export function AccountModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  account, 
  parentAccounts 
}: AccountModalProps) {
  const t = useTranslations();
  const [formData, setFormData] = useState<Omit<Account, 'id'>>({
    code: '',
    name: '',
    type: 'asset',
    parentId: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (account) {
      setFormData({
        code: account.code,
        name: account.name,
        type: account.type,
        parentId: account.parentId || '',
        isActive: account.isActive,
      });
    } else {
      setFormData({
        code: '',
        name: '',
        type: 'asset',
        parentId: '',
        isActive: true,
      });
    }
    setErrors({});
  }, [account, isOpen]);

  const accountTypes = [
    { value: 'asset', label: t('finance.accounts.types.asset') },
    { value: 'liability', label: t('finance.accounts.types.liability') },
    { value: 'equity', label: t('finance.accounts.types.equity') },
    { value: 'revenue', label: t('finance.accounts.types.revenue') },
    { value: 'expense', label: t('finance.accounts.types.expense') },
  ];

  const filteredParentAccounts = parentAccounts
    .filter(acc => acc.type === formData.type && acc.id !== account?.id)
    .map(acc => ({
      value: acc.id!,
      label: `${acc.code} - ${acc.name}`,
    }));

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = t('finance.accounts.validation.codeRequired');
    } else if (!/^[A-Z0-9-]+$/.test(formData.code)) {
      newErrors.code = t('finance.accounts.validation.codeFormat');
    }

    if (!formData.name.trim()) {
      newErrors.name = t('finance.accounts.validation.nameRequired');
    }

    if (!formData.type) {
      newErrors.type = t('finance.accounts.validation.typeRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        parentId: formData.parentId || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error submitting account:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={account ? t('finance.accounts.editAccount') : t('finance.accounts.createAccount')}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={t('finance.accounts.accountCode')}
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
            error={errors.code}
            placeholder="예시: CASH-001"
            required
          />
          
          <Select
            label={t('finance.accounts.type')}
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value as Account['type'])}
            options={accountTypes}
            error={errors.type}
            required
          />
        </div>

        <Input
          label={t('finance.accounts.accountName')}
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          error={errors.name}
          placeholder="예시: 현금 및 현금성자산"
          required
        />

        {filteredParentAccounts.length > 0 && (
          <Select
            label={t('finance.accounts.parentAccount')}
            value={formData.parentId}
            onChange={(e) => handleInputChange('parentId', e.target.value)}
            options={filteredParentAccounts}
            helperText={t('finance.accounts.parentAccountHelp')}
          />
        )}

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => handleInputChange('isActive', e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
            {t('finance.accounts.activeAccount')}
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
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
            disabled={loading}
          >
            {account ? t('common.update') : t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}