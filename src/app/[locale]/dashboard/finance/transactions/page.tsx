'use client';

import { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TransactionModal } from '@/components/finance/TransactionModal';
import { useTranslations } from 'next-intl';
import { api } from '@/utils/api';

interface Transaction {
  id: string;
  referenceNumber: string;
  description: string;
  date: string;
  lines: {
    accountId: string;
    debit: number;
    credit: number;
    description?: string;
  }[];
  status: 'draft' | 'posted' | 'void';
  createdAt: string;
  createdBy: string;
}

interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  isActive: boolean;
}


export default function TransactionsPage() {
  const t = useTranslations();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchTransactions(), fetchAccounts()]);
    };
    loadData();
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (selectedAccount) params.append('accountId', selectedAccount);
      if (selectedStatus) params.append('status', selectedStatus);
      if (searchTerm) params.append('search', searchTerm);

      const data = await api.get(`/api/finance/transactions?${params}`);
      // API가 pagination 객체를 반환하는지 확인
      const transactionsArray = Array.isArray(data) ? data : (data.data || data.transactions || []);
      setTransactions(transactionsArray);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, selectedAccount, selectedStatus, searchTerm]);

  const fetchAccounts = useCallback(async () => {
    try {
      const data = await api.get('/api/finance/accounts');
      // API가 pagination 객체를 반환하는지 확인
      const accountsArray = Array.isArray(data) ? data : (data.data || data.accounts || []);
      setAccounts(accountsArray.filter((acc: Account) => acc.isActive));
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setAccounts([]);
    }
  }, []);

  const handleCreateTransaction = async (transactionData: {
    date: string;
    description: string;
    lines: {
      accountId: string;
      debit: number;
      credit: number;
      description: string;
    }[];
  }) => {
    try {
      await api.post('/api/finance/transactions', transactionData);
      await fetchTransactions();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'text-yellow-700 bg-yellow-50',
      posted: 'text-green-700 bg-green-50',
      void: 'text-red-700 bg-red-50',
    };
    return colors[status as keyof typeof colors] || 'text-gray-700 bg-gray-50';
  };

  const accountOptions = accounts.map(acc => ({
    value: acc.id,
    label: `${acc.code} - ${acc.name}`,
  }));

  const statusOptions = [
    { value: 'draft', label: t('common.draft') },
    { value: 'posted', label: t('common.posted') },
    { value: 'cancelled', label: t('common.cancelled') },
  ];

  const columns = [
    {
      key: 'referenceNumber',
      label: t('finance.transactions.reference'),
      className: 'font-mono text-gray-900 font-medium',
    },
    {
      key: 'date',
      label: t('finance.transactions.date'),
      render: (value: string | Date) => formatDate(typeof value === 'string' ? value : value.toISOString()),
      className: 'text-gray-900',
    },
    {
      key: 'description',
      label: t('finance.transactions.description'),
      className: 'text-gray-900 max-w-xs truncate',
    },
    {
      key: 'lines',
      label: t('finance.transactions.amount'),
      render: (lines: Transaction['lines']) => {
        const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
        const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);
        const amount = Math.max(totalDebit, totalCredit);
        return (
          <span className="font-medium text-gray-900">
            {formatCurrency(amount)}
          </span>
        );
      },
      className: 'text-right',
    },
    {
      key: 'status',
      label: t('common.status'),
      render: (value: string) => {
        if (!value) return '-';
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(value)}`}>
            {t(`common.${value}`)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (_value: unknown, row: Transaction) => (
        <div className="flex space-x-2">
          <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
            {t('common.view')}
          </button>
          {row.status === 'draft' && (
            <>
              <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                {t('common.post')}
              </button>
              <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                {t('common.cancel')}
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Calculate totals
  const totalDebits = transactions
    .filter(t => t.status === 'posted')
    .reduce((sum, t) => {
      return sum + t.lines.reduce((lineSum, line) => lineSum + line.debit, 0);
    }, 0);
  
  const totalCredits = transactions
    .filter(t => t.status === 'posted')
    .reduce((sum, t) => {
      return sum + t.lines.reduce((lineSum, line) => lineSum + line.credit, 0);
    }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('finance.transactions.title')}</h1>
          <p className="text-gray-600">{t('finance.transactions.description')}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          {t('finance.transactions.createTransaction')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-red-600 text-xl">📤</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('finance.transactions.totalDebits')}</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(totalDebits)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-green-600 text-xl">📥</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('finance.transactions.totalCredits')}</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(totalCredits)}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('finance.transactions.totalTransactions')}</dt>
                  <dd className="text-lg font-medium text-gray-900">{transactions.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('common.filters')}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Input
            type="date"
            label={t('finance.transactions.dateFrom')}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <Input
            type="date"
            label={t('finance.transactions.dateTo')}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <Select
            label={t('finance.transactions.account')}
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            options={accountOptions}
          />
          <Select
            label={t('common.status')}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={statusOptions}
          />
          <Input
            label={t('common.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('finance.transactions.searchPlaceholder')}
          />
        </div>
        <div className="mt-4 flex space-x-3">
          <Button onClick={fetchTransactions} size="sm">
            {t('common.applyFilters')}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setDateFrom('');
              setDateTo('');
              setSelectedAccount('');
              setSelectedStatus('');
              setSearchTerm('');
              fetchTransactions();
            }}
          >
            {t('common.clearFilters')}
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <DataTable
        data={transactions}
        columns={columns}
        loading={loading}
        emptyMessage={t('finance.transactions.noTransactionsFound')}
        onRowClick={(transaction) => console.log('Transaction clicked:', transaction)}
      />

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTransaction}
        accounts={accounts}
      />
    </div>
  );
}