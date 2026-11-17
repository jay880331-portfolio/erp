"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { OrderModal } from "@/components/crm/OrderModal";
import { useTranslations } from "next-intl";

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  orderDate: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  totalAmount: number;
  items: number;
  createdAt: string;
}

export default function OrdersPage() {
  const t = useTranslations();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | undefined>();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/crm/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  interface OrderItem {
    itemCode: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }

  interface OrderFormData {
    orderNumber: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    orderDate: string;
    status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
    items: OrderItem[];
    notes: string;
  }

  const handleCreateOrder = async (orderData: OrderFormData) => {
    try {
      // Calculate total amount from items
      const totalAmount = orderData.items.reduce(
        (sum, item) => sum + item.totalPrice, 
        0
      );

      const orderPayload = {
        ...orderData,
        totalAmount,
        items: orderData.items.length, // Keep track of number of items
      };

      const response = await fetch('/api/crm/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      if (response.ok) {
        await fetchOrders();
        setShowCreateModal(false);
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "text-yellow-700 bg-yellow-50",
      confirmed: "text-blue-700 bg-blue-50",
      shipped: "text-purple-700 bg-purple-50",
      delivered: "text-green-700 bg-green-50",
      cancelled: "text-red-700 bg-red-50",
    };
    return colors[status as keyof typeof colors] || "text-gray-700 bg-gray-50";
  };

  const columns = [
    {
      key: "orderNumber",
      label: t("crm.orders.orderNumber"),
      className: "font-mono text-gray-900 font-medium",
    },
    {
      key: "customerName",
      label: t("crm.orders.customer"),
      className: "text-gray-900 font-medium",
    },
    {
      key: "orderDate",
      label: t("crm.orders.orderDate"),
      render: (value: string) => formatDate(value),
      className: "text-gray-900",
    },
    {
      key: "items",
      label: t("crm.orders.items"),
      className: "text-center",
    },
    {
      key: "totalAmount",
      label: t("crm.orders.totalAmount"),
      render: (value: number) => (
        <span className="font-medium text-gray-900">
          {formatCurrency(value)}
        </span>
      ),
      className: "text-right",
    },
    {
      key: "status",
      label: t("common.status"),
      render: (value: string) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
            value
          )}`}
        >
          {t(`crm.orders.status.${value}`)}
        </span>
      ),
    },
    {
      key: "actions",
      label: t("common.actions"),
      render: (value: unknown, order: Order) => (
        <div className="flex space-x-2">
          <button
            onClick={() => window.alert(`Viewing order ${order.orderNumber}`)}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            {t("common.view")}
          </button>
          <button
            onClick={() => setEditingOrder(order)}
            className="text-green-600 hover:text-green-900 text-sm font-medium"
          >
            {t("common.edit")}
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
          <h1 className="text-2xl font-bold text-gray-900">
            {t("crm.orders.title")}
          </h1>
          <p className="text-gray-600">{t("crm.orders.description")}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          {t("crm.orders.createOrder")}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-blue-600 text-xl">📋</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t("crm.orders.totalOrders")}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {orders.length}
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
                <div className="text-yellow-600 text-xl">⏳</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t("crm.orders.pendingOrders")}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {
                      orders.filter((order) => order.status === "pending")
                        .length
                    }
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
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t("crm.orders.deliveredOrders")}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {
                      orders.filter((order) => order.status === "delivered")
                        .length
                    }
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
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t("crm.orders.totalRevenue")}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(
                      orders.reduce((sum, order) => sum + order.totalAmount, 0)
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <DataTable
        data={orders}
        columns={columns}
        loading={loading}
        emptyMessage={t("crm.orders.noOrdersFound")}
        onRowClick={(order) => console.log("Order clicked:", order)}
      />

      {/* Order Modal */}
      <OrderModal
        isOpen={showCreateModal || !!editingOrder}
        onClose={() => {
          setShowCreateModal(false);
          setEditingOrder(undefined);
        }}
        onSubmit={handleCreateOrder}
        order={editingOrder}
      />
    </div>
  );
}
