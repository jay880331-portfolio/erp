'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface Transaction {
  id?: string;
  reference: string;
  description: string;
  date: string;
  entries: TransactionEntry[];
}

interface TransactionEntry {
  accountId: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
}

interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: {
    date: string;
    description: string;
    lines: {
      accountId: string;
      debit: number;
      credit: number;
      description: string;
    }[];
  }) => Promise<void>;
  accounts: Account[];
}

export function TransactionModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  accounts 
}: TransactionModalProps) {
  const t = useTranslations();
  const [formData, setFormData] = useState<Transaction>({
    reference: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    entries: [
      { accountId: '', description: '', debitAmount: 0, creditAmount: 0 },
      { accountId: '', description: '', debitAmount: 0, creditAmount: 0 },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      // Generate reference number
      const now = new Date();
      const reference = `TXN-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      setFormData({
        reference,
        description: '',
        date: new Date().toISOString().split('T')[0],
        entries: [
          { accountId: '', description: '', debitAmount: 0, creditAmount: 0 },
          { accountId: '', description: '', debitAmount: 0, creditAmount: 0 },
        ],
      });
      setErrors({});
    }
  }, [isOpen]);

  const accountOptions = accounts.map(acc => ({
    value: acc.id,
    label: `${acc.code} - ${acc.name}`,
  }));

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.reference.trim()) {
      newErrors.reference = t('finance.transactions.reference') + '는 필수입니다';
    }

    if (!formData.description.trim()) {
      newErrors.description = t('finance.transactions.description') + '은 필수입니다';
    }

    if (!formData.date) {
      newErrors.date = t('finance.transactions.date') + '는 필수입니다';
    }

    // Validate entries
    const validEntries = formData.entries.filter(entry => 
      entry.accountId && (entry.debitAmount > 0 || entry.creditAmount > 0)
    );

    if (validEntries.length < 2) {
      newErrors.entries = '최소 2개의 유효한 분개가 필요합니다';
    }

    // Check if debits equal credits
    const totalDebits = formData.entries.reduce((sum, entry) => sum + entry.debitAmount, 0);
    const totalCredits = formData.entries.reduce((sum, entry) => sum + entry.creditAmount, 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      newErrors.balance = '차변 합계와 대변 합계가 일치해야 합니다';
    }

    // Validate individual entries
    formData.entries.forEach((entry, index) => {
      if (entry.accountId || entry.debitAmount > 0 || entry.creditAmount > 0) {
        if (!entry.accountId) {
          newErrors[`entry_${index}_account`] = t('finance.transactions.account') + '은 필수입니다';
        }
        if (entry.debitAmount > 0 && entry.creditAmount > 0) {
          newErrors[`entry_${index}_amount`] = '분개는 차변과 대변 모두 가질 수 없습니다';
        }
        if (entry.debitAmount === 0 && entry.creditAmount === 0) {
          newErrors[`entry_${index}_amount`] = '분개는 차변 또는 대변 금액이 필요합니다';
        }
      }
    });

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
      // Filter out empty entries
      const validEntries = formData.entries.filter(entry => 
        entry.accountId && (entry.debitAmount > 0 || entry.creditAmount > 0)
      );

      // API에서 기대하는 형식으로 데이터 변환
      const transactionData = {
        date: formData.date,
        description: formData.description,
        lines: validEntries.map(entry => ({
          accountId: entry.accountId,
          debit: entry.debitAmount,
          credit: entry.creditAmount,
          description: entry.description || '',
        })),
      };

      await onSubmit(transactionData);
      onClose();
    } catch (error) {
      console.error('Error submitting transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Transaction, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleEntryChange = (index: number, field: keyof TransactionEntry, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      entries: prev.entries.map((entry, i) => 
        i === index ? { ...entry, [field]: value } : entry
      ),
    }));

    // Clear related errors
    const errorKeys = [`entry_${index}_account`, `entry_${index}_amount`, 'entries', 'balance'];
    const clearedErrors = { ...errors };
    errorKeys.forEach(key => delete clearedErrors[key]);
    setErrors(clearedErrors);
  };

  const addEntry = () => {
    setFormData(prev => ({
      ...prev,
      entries: [
        ...prev.entries,
        { accountId: '', description: '', debitAmount: 0, creditAmount: 0 },
      ],
    }));
  };

  const removeEntry = (index: number) => {
    if (formData.entries.length > 2) {
      setFormData(prev => ({
        ...prev,
        entries: prev.entries.filter((_, i) => i !== index),
      }));
    }
  };

  const totalDebits = formData.entries.reduce((sum, entry) => sum + entry.debitAmount, 0);
  const totalCredits = formData.entries.reduce((sum, entry) => sum + entry.creditAmount, 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('finance.transactions.createTransaction')}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transaction Header */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label={t('finance.transactions.reference')}
            value={formData.reference}
            onChange={(e) => handleInputChange('reference', e.target.value)}
            error={errors.reference}
            required
          />
          
          <Input
            type="date"
            label={t('finance.transactions.date')}
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            error={errors.date}
            required
          />
          
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('common.status')}
            </label>
            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              <span className="text-sm text-gray-700">{t('common.draft')}</span>
            </div>
          </div>
        </div>

        <Input
          label={t('finance.transactions.description')}
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          error={errors.description}
          placeholder="거래에 대한 간단한 설명"
          required
        />

        {/* Transaction Entries */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">분개 항목</h3>
            <Button type="button" variant="outline" size="sm" onClick={addEntry}>
              분개 추가
            </Button>
          </div>

          {errors.entries && (
            <p className="text-sm text-red-600 mb-4">{errors.entries}</p>
          )}

          <div className="space-y-4">
            {formData.entries.map((entry, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-700">분개 {index + 1}</h4>
                  {formData.entries.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeEntry(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      제거
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="lg:col-span-2">
                    <Select
                      label={t('finance.transactions.account')}
                      value={entry.accountId}
                      onChange={(e) => handleEntryChange(index, 'accountId', e.target.value)}
                      options={accountOptions}
                      error={errors[`entry_${index}_account`]}
                      required
                    />
                  </div>

                  <Input
                    type="number"
                    label="차변 금액"
                    value={entry.debitAmount || ''}
                    onChange={(e) => handleEntryChange(index, 'debitAmount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />

                  <Input
                    type="number"
                    label="대변 금액"
                    value={entry.creditAmount || ''}
                    onChange={(e) => handleEntryChange(index, 'creditAmount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>

                {errors[`entry_${index}_amount`] && (
                  <p className="text-sm text-red-600 mt-2">{errors[`entry_${index}_amount`]}</p>
                )}

                <div className="mt-3">
                  <Input
                    label="분개 설명 (선택사항)"
                    value={entry.description}
                    onChange={(e) => handleEntryChange(index, 'description', e.target.value)}
                    placeholder="이 분개에 대한 구체적인 설명"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Balance Summary */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">{t('finance.transactions.totalDebits')}:</span>
                <div className="font-medium">₩{totalDebits.toLocaleString('ko-KR')}</div>
              </div>
              <div>
                <span className="text-gray-500">{t('finance.transactions.totalCredits')}:</span>
                <div className="font-medium">₩{totalCredits.toLocaleString('ko-KR')}</div>
              </div>
              <div>
                <span className="text-gray-500">차액:</span>
                <div className={`font-medium ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                  ₩{Math.abs(totalDebits - totalCredits).toLocaleString('ko-KR')}
                  {isBalanced && ' ✓'}
                </div>
              </div>
            </div>
            {errors.balance && (
              <p className="text-sm text-red-600 mt-2">{errors.balance}</p>
            )}
          </div>
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
            disabled={loading || !isBalanced}
          >
            {t('finance.transactions.createTransaction')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}