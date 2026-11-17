'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { AccountModal } from '@/components/finance/AccountModal';
import { useTranslations } from 'next-intl';
import { api } from '@/utils/api';

interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parentId?: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
}

export default function AccountsPage() {
  const t = useTranslations();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/finance/accounts');
      // API가 pagination 객체를 반환하는지 확인
      const accountsArray = Array.isArray(data) ? data : (data.data || data.accounts || []);
      setAccounts(accountsArray);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setAccounts([]); // 에러 시 빈 배열로 설정
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (accountData: Omit<Account, 'id' | 'balance' | 'createdAt'>) => {
    try {
      await api.post('/api/finance/accounts', accountData);
      await fetchAccounts();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  };

  const handleEditAccount = async (accountData: Omit<Account, 'id' | 'balance' | 'createdAt'>) => {
    if (!editingAccount) return;

    try {
      await api.put(`/api/finance/accounts/${editingAccount.id}`, accountData);
      await fetchAccounts();
      setEditingAccount(undefined);
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  };

  const handleDeleteAccount = async (account: Account) => {
    if (!confirm(t('finance.accounts.deleteConfirm') + ` "${account.name}"?`)) {
      return;
    }

    try {
      await api.delete(`/api/finance/accounts/${account.id}`);
      await fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert(t('finance.accounts.deleteFailed'));
    }
  };

  const getAccountTypeColor = (type: string) => {
    const colors = {
      asset: 'text-green-700 bg-green-50',
      liability: 'text-red-700 bg-red-50',
      equity: 'text-blue-700 bg-blue-50',
      revenue: 'text-purple-700 bg-purple-50',
      expense: 'text-orange-700 bg-orange-50',
    };
    return colors[type as keyof typeof colors] || 'text-gray-700 bg-gray-50';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const columns = [
    {
      key: 'code',
      label: t('finance.accounts.accountCode'),
      className: 'font-mono text-gray-900 font-medium',
    },
    {
      key: 'name',
      label: t('finance.accounts.accountName'),
      className: 'text-gray-900 font-medium',
    },
    {
      key: 'type',
      label: t('finance.accounts.type'),
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAccountTypeColor(value)}`}>
          {t(`finance.accounts.types.${value}`)}
        </span>
      ),
    },
    {
      key: 'balance',
      label: t('finance.accounts.balance'),
      render: (value: number) => (
        <span className={`font-medium ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(value)}
        </span>
      ),
      className: 'text-right',
    },
    {
      key: 'isActive',
      label: t('finance.accounts.status'),
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
        }`}>
          {value ? t('common.active') : t('common.inactive')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: t('finance.accounts.actions'),
      render: (_value: unknown, row: Account) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => setEditingAccount(row)}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            {t('common.edit')}
          </button>
          <button 
            onClick={() => handleDeleteAccount(row)}
            className="text-red-600 hover:text-red-900 text-sm font-medium"
          >
            {t('common.delete')}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('finance.accounts.title')}</h1>
          <p className="text-gray-600">{t('finance.accounts.description')}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          {t('finance.accounts.createAccount')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-green-600 text-xl">💰</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('finance.accounts.totalAssets')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(
                      (accounts || [])
                        .filter(acc => acc.type === 'asset')
                        .reduce((sum, acc) => sum + acc.balance, 0)
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-red-600 text-xl">📉</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('finance.accounts.totalLiabilities')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(
                      (accounts || [])
                        .filter(acc => acc.type === 'liability')
                        .reduce((sum, acc) => sum + acc.balance, 0)
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-blue-600 text-xl">⚖️</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('finance.accounts.equity')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(
                      (accounts || [])
                        .filter(acc => acc.type === 'equity')
                        .reduce((sum, acc) => sum + acc.balance, 0)
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-purple-600 text-xl">📊</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('finance.accounts.activeAccounts')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {(accounts || []).filter(acc => acc.isActive).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <DataTable
        data={accounts || []}
        columns={columns}
        loading={loading}
        emptyMessage={t('finance.accounts.noAccountsFound')}
        onRowClick={(account) => console.log('Account clicked:', account)}
      />

      {/* Account Modal */}
      <AccountModal
        isOpen={showCreateModal || !!editingAccount}
        onClose={() => {
          setShowCreateModal(false);
          setEditingAccount(undefined);
        }}
        onSubmit={editingAccount ? handleEditAccount : handleCreateAccount}
        account={editingAccount}
        parentAccounts={accounts}
      />
    </div>
  );
}