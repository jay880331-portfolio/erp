'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { InventoryMovementModal } from '@/components/scm/InventoryMovementModal';
import { useTranslations } from 'next-intl';

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
  createdAt: string;
}

export default function InventoryMovementsPage() {
  const t = useTranslations();
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMovement, setEditingMovement] = useState<InventoryMovement | undefined>();

  useEffect(() => {
    fetchMovements();
  }, []);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/scm/inventory/movements');
      if (response.ok) {
        const data = await response.json();
        setMovements(data);
      }
    } catch (error) {
      console.error('Error fetching movements:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleCreateMovement = async (movementData: MovementFormData) => {
    try {
      const response = await fetch('/api/scm/inventory/movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movementData),
      });

      if (response.ok) {
        await fetchMovements();
        setShowCreateModal(false);
      } else {
        throw new Error('Failed to create movement');
      }
    } catch (error) {
      console.error('Error creating movement:', error);
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMovementTypeColor = (type: string) => {
    const colors = {
      in: 'text-green-700 bg-green-50',
      out: 'text-red-700 bg-red-50',
      adjustment: 'text-blue-700 bg-blue-50',
      transfer: 'text-purple-700 bg-purple-50',
    };
    return colors[type as keyof typeof colors] || 'text-gray-700 bg-gray-50';
  };

  const columns = [
    {
      key: 'movementDate',
      label: t('scm.movements.date'),
      render: (value: string) => formatDate(value),
      className: 'text-gray-900',
    },
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
      key: 'movementType',
      label: t('scm.movements.type'),
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMovementTypeColor(value)}`}>
          {t(`scm.movements.types.${value}`)}
        </span>
      ),
    },
    {
      key: 'quantity',
      label: t('scm.movements.quantity'),
      render: (value: number, row: InventoryMovement) => (
        <span className={`font-medium ${
          row.movementType === 'in' ? 'text-green-600' : 
          row.movementType === 'out' ? 'text-red-600' : 'text-blue-600'
        }`}>
          {row.movementType === 'in' ? '+' : row.movementType === 'out' ? '-' : '±'}{Math.abs(value)}
        </span>
      ),
      className: 'text-center',
    },
    {
      key: 'unitCost',
      label: t('scm.movements.unitCost'),
      render: (value: number) => formatCurrency(value),
      className: 'text-right',
    },
    {
      key: 'totalCost',
      label: t('scm.movements.totalCost'),
      render: (value: number) => (
        <span className="font-medium text-gray-900">
          {formatCurrency(value)}
        </span>
      ),
      className: 'text-right',
    },
    {
      key: 'reason',
      label: t('scm.movements.reason'),
      className: 'text-gray-900 max-w-xs truncate',
    },
    {
      key: 'performedBy',
      label: t('scm.movements.performedBy'),
      className: 'text-gray-900',
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (value: unknown, row: InventoryMovement) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => window.alert(`Viewing movement for ${row.itemName}`)}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            {t('common.view')}
          </button>
          <button 
            onClick={() => setEditingMovement(row)}
            className="text-green-600 hover:text-green-900 text-sm font-medium"
          >
            {t('common.edit')}
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
          <h1 className="text-2xl font-bold text-gray-900">{t('scm.movements.title')}</h1>
          <p className="text-gray-600">{t('scm.movements.description')}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          {t('scm.movements.createMovement')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-green-600 text-xl">📥</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('scm.movements.inbound')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {movements.filter(m => m.movementType === 'in').length}
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
                <div className="text-red-600 text-xl">📤</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('scm.movements.outbound')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {movements.filter(m => m.movementType === 'out').length}
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
                <div className="text-blue-600 text-xl">🔧</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('scm.movements.adjustments')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {movements.filter(m => m.movementType === 'adjustment').length}
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
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('scm.movements.totalMovements')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {movements.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <DataTable
        data={movements}
        columns={columns}
        loading={loading}
        emptyMessage={t('scm.movements.noMovementsFound')}
        onRowClick={(movement) => console.log('Movement clicked:', movement)}
      />

      {/* Movement Modal */}
      <InventoryMovementModal
        isOpen={showCreateModal || !!editingMovement}
        onClose={() => {
          setShowCreateModal(false);
          setEditingMovement(undefined);
        }}
        onSubmit={handleCreateMovement}
        movement={editingMovement}
      />
    </div>
  );
}