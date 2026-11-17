'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { CustomerModal } from '@/components/crm/CustomerModal';
import { useTranslations } from 'next-intl';

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

export default function CustomersPage() {
  const t = useTranslations();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/crm/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  interface CustomerFormData {
    name: string;
    email: string;
    phone: string;
    company: string;
    address: string;
    status: 'active' | 'inactive';
  }

  const handleCreateCustomer = async (customerData: CustomerFormData) => {
    try {
      const response = await fetch('/api/crm/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      if (response.ok) {
        await fetchCustomers();
        setShowCreateModal(false);
      } else {
        throw new Error('Failed to create customer');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  };

  const handleEditCustomer = async (customerData: CustomerFormData) => {
    if (!editingCustomer) return;

    try {
      const response = await fetch(`/api/crm/customers/${editingCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      if (response.ok) {
        await fetchCustomers();
        setEditingCustomer(undefined);
      } else {
        throw new Error('Failed to update customer');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    if (!confirm(t('crm.customers.deleteConfirm') + ` "${customer.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/crm/customers/${customer.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCustomers();
      } else {
        throw new Error('Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert(t('crm.customers.deleteFailed'));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const columns = [
    {
      key: 'name',
      label: t('crm.customers.customerName'),
      className: 'text-gray-900 font-medium',
    },
    {
      key: 'email',
      label: t('crm.customers.email'),
      className: 'text-gray-900',
    },
    {
      key: 'phone',
      label: t('crm.customers.phone'),
      className: 'text-gray-900',
    },
    {
      key: 'company',
      label: t('crm.customers.company'),
      className: 'text-gray-900',
    },
    {
      key: 'totalOrders',
      label: t('crm.customers.totalOrders'),
      className: 'text-center',
    },
    {
      key: 'totalRevenue',
      label: t('crm.customers.totalRevenue'),
      render: (value: number) => (
        <span className="font-medium text-gray-900">
          {formatCurrency(value)}
        </span>
      ),
      className: 'text-right',
    },
    {
      key: 'status',
      label: t('common.status'),
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'active' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
        }`}>
          {t(`common.${value}`)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (_value: unknown, row: Customer) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => setEditingCustomer(row)}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            {t('common.edit')}
          </button>
          <button 
            onClick={() => handleDeleteCustomer(row)}
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
          <h1 className="text-2xl font-bold text-gray-900">{t('crm.customers.title')}</h1>
          <p className="text-gray-600">{t('crm.customers.description')}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          {t('crm.customers.createCustomer')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-blue-600 text-xl">👥</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('crm.customers.totalCustomers')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {customers.length}
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
                <div className="text-green-600 text-xl">✅</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('crm.customers.activeCustomers')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {customers.filter(customer => customer.status === 'active').length}
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
                <div className="text-purple-600 text-xl">💰</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('crm.customers.totalRevenue')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(customers.reduce((sum, customer) => sum + customer.totalRevenue, 0))}
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
                <div className="text-yellow-600 text-xl">📈</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('crm.customers.avgOrderValue')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {customers.length > 0 ? formatCurrency(
                      customers.reduce((sum, customer) => sum + customer.totalRevenue, 0) / 
                      customers.reduce((sum, customer) => sum + customer.totalOrders, 0) || 0
                    ) : formatCurrency(0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <DataTable
        data={customers}
        columns={columns}
        loading={loading}
        emptyMessage={t('crm.customers.noCustomersFound')}
        onRowClick={(customer) => console.log('Customer clicked:', customer)}
      />

      {/* Customer Modal */}
      <CustomerModal
        isOpen={showCreateModal || !!editingCustomer}
        onClose={() => {
          setShowCreateModal(false);
          setEditingCustomer(undefined);
        }}
        onSubmit={editingCustomer ? handleEditCustomer : handleCreateCustomer}
        customer={editingCustomer}
      />
    </div>
  );
}