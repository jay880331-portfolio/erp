'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { StockAdjustmentModal } from '@/components/scm/StockAdjustmentModal';
import { useTranslations } from 'next-intl';
import { api } from '@/utils/api';

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

export default function InventoryPage() {
  const t = useTranslations();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/scm/inventory/stock');
      // API가 pagination 객체를 반환하는지 확인
      const inventoryArray = Array.isArray(data) ? data : (data.data || data.inventory || []);
      setInventory(inventoryArray);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setInventory([]); // 에러 시 빈 배열로 설정
    } finally {
      setLoading(false);
    }
  };

  interface StockAdjustmentData {
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

  const handleStockAdjustment = async (adjustmentData: StockAdjustmentData) => {
    try {
      await api.post('/api/scm/inventory/adjustments', adjustmentData);
      await fetchInventory();
      setShowAdjustmentModal(false);
      setSelectedItem(undefined);
    } catch (error) {
      console.error('Error adjusting stock:', error);
      throw error;
    }
  };

  const handleAdjustClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowAdjustmentModal(true);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      in_stock: 'text-green-700 bg-green-50',
      low_stock: 'text-yellow-700 bg-yellow-50',
      out_of_stock: 'text-red-700 bg-red-50',
    };
    return colors[status as keyof typeof colors] || 'text-gray-700 bg-gray-50';
  };

  const columns = [
    {
      key: 'itemCode',
      label: t('scm.items.itemCode'),
      className: 'font-mono text-gray-900 font-medium',
    },
    {
      key: 'itemName',
      label: t('scm.items.itemName'),
      className: 'text-gray-900 font-medium',
    },
    {
      key: 'category',
      label: t('scm.items.category'),
      className: 'text-gray-900',
    },
    {
      key: 'currentStock',
      label: t('scm.inventory.currentStock'),
      className: 'text-center font-medium',
    },
    {
      key: 'availableStock',
      label: t('scm.inventory.availableStock'),
      className: 'text-center',
    },
    {
      key: 'minimumStock',
      label: t('scm.inventory.minimumStock'),
      className: 'text-center text-gray-600',
    },
    {
      key: 'status',
      label: t('common.status'),
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(value)}`}>
          {t(`scm.inventory.status.${value}`)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (_value: unknown, row: InventoryItem) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => handleAdjustClick(row)}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            {t('scm.inventory.adjust')}
          </button>
          <button className="text-green-600 hover:text-green-900 text-sm font-medium">
            {t('scm.inventory.reorder')}
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
          <h1 className="text-2xl font-bold text-gray-900">{t('scm.inventory.title')}</h1>
          <p className="text-gray-600">{t('scm.inventory.description')}</p>
        </div>
        <Button onClick={() => setShowAdjustmentModal(true)}>
          {t('scm.inventory.adjustStock')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-green-600 text-xl">📦</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('scm.inventory.totalItems')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {inventory.length}
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
                <div className="text-blue-600 text-xl">📊</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('scm.inventory.inStock')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {inventory.filter(item => item.status === 'in_stock').length}
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
                <div className="text-yellow-600 text-xl">⚠️</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('scm.lowStock')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {inventory.filter(item => item.status === 'low_stock').length}
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
                <div className="text-red-600 text-xl">❌</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('scm.inventory.outOfStock')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {inventory.filter(item => item.status === 'out_of_stock').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <DataTable
        data={inventory}
        columns={columns}
        loading={loading}
        emptyMessage={t('scm.inventory.noInventoryFound')}
        onRowClick={(item) => console.log('Inventory item clicked:', item)}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={showAdjustmentModal}
        onClose={() => {
          setShowAdjustmentModal(false);
          setSelectedItem(undefined);
        }}
        onSubmit={handleStockAdjustment}
        inventoryItem={selectedItem}
      />
    </div>
  );
}