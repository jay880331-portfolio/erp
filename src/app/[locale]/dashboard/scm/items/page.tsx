'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { ItemModal } from '@/components/scm/ItemModal';
import { useTranslations } from 'next-intl';
import { api } from '@/utils/api';

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

export default function ItemsPage() {
  const t = useTranslations();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | undefined>();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/scm/items');
      // API가 pagination 객체를 반환하는지 확인
      const itemsArray = Array.isArray(data) ? data : (data.data || data.items || []);
      setItems(itemsArray);
    } catch (error) {
      console.error('Error fetching items:', error);
      setItems([]); // 에러 시 빈 배열로 설정
    } finally {
      setLoading(false);
    }
  };

  interface ItemFormData {
    code: string;
    name: string;
    description: string;
    category: string;
    unit: string;
    price: number;
    isActive: boolean;
  }

  const handleCreateItem = async (itemData: ItemFormData) => {
    try {
      await api.post('/api/scm/items', itemData);
      await fetchItems();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  };

  const handleEditItem = async (itemData: ItemFormData) => {
    if (!editingItem) return;

    try {
      await api.put(`/api/scm/items/${editingItem.id}`, itemData);
      await fetchItems();
      setEditingItem(undefined);
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  };

  const handleDeleteItem = async (item: Item) => {
    if (!confirm(t('scm.items.deleteConfirm') + ` "${item.name}"?`)) {
      return;
    }

    try {
      await api.delete(`/api/scm/items/${item.id}`);
      await fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert(t('scm.items.deleteFailed'));
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
      key: 'code',
      label: t('scm.items.itemCode'),
      className: 'font-mono text-gray-900 font-medium',
    },
    {
      key: 'name',
      label: t('scm.items.itemName'),
      className: 'text-gray-900 font-medium',
    },
    {
      key: 'category',
      label: t('scm.items.category'),
      className: 'text-gray-900',
    },
    {
      key: 'unit',
      label: t('scm.items.unit'),
      className: 'text-gray-900',
    },
    {
      key: 'price',
      label: t('scm.items.price'),
      render: (value: number) => (
        <span className="font-medium text-gray-900">
          {formatCurrency(value)}
        </span>
      ),
      className: 'text-right',
    },
    {
      key: 'isActive',
      label: t('common.status'),
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
      label: t('common.actions'),
      render: (_value: unknown, row: Item) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => setEditingItem(row)}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            {t('common.edit')}
          </button>
          <button 
            onClick={() => handleDeleteItem(row)}
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
          <h1 className="text-2xl font-bold text-gray-900">{t('scm.items.title')}</h1>
          <p className="text-gray-600">{t('scm.items.description')}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          {t('scm.items.createItem')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-blue-600 text-xl">📦</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('scm.items.totalItems')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {items.length}
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
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('scm.items.activeItems')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {items.filter(item => item.isActive).length}
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
                <div className="text-purple-600 text-xl">📁</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('scm.items.categories')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {new Set(items.map(item => item.category)).size}
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
                <div className="text-yellow-600 text-xl">💰</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('scm.items.avgPrice')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {items.length > 0 ? formatCurrency(items.reduce((sum, item) => sum + item.price, 0) / items.length) : formatCurrency(0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <DataTable
        data={items}
        columns={columns}
        loading={loading}
        emptyMessage={t('scm.items.noItemsFound')}
        onRowClick={(item) => console.log('Item clicked:', item)}
      />

      {/* Item Modal */}
      <ItemModal
        isOpen={showCreateModal || !!editingItem}
        onClose={() => {
          setShowCreateModal(false);
          setEditingItem(undefined);
        }}
        onSubmit={editingItem ? handleEditItem : handleCreateItem}
        item={editingItem}
      />
    </div>
  );
}