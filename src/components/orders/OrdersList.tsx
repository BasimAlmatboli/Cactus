import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, PenSquare, Loader2, User, CheckSquare, Square, Eye } from 'lucide-react';
import { Order } from '../../types';
import { OrdersEmptyState } from './OrdersEmptyState';
import { OrderDetailsModal } from './OrderDetailsModal';

interface OrdersListProps {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  onDelete: (orderId: string) => Promise<void>;
  onBatchDelete: (orderIds: string[]) => Promise<void>;
}

export const OrdersList: React.FC<OrdersListProps> = ({
  orders,
  isLoading,
  error,
  onDelete,
  onBatchDelete,
}) => {
  const navigate = useNavigate();
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const toggleOrderSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const toggleAllOrders = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map(order => order.id)));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedOrders.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedOrders.size} selected orders?`)) {
      await onBatchDelete(Array.from(selectedOrders));
      setSelectedOrders(new Set());
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (!orders.length) {
    return <OrdersEmptyState />;
  }

  return (
    <div className="space-y-4">
      {selectedOrders.size > 0 && (
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={handleBatchDelete}
            className="flex items-center px-4 py-2 text-sm text-red-600 hover:text-red-800 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                <button
                  onClick={toggleAllOrders}
                  className="flex items-center hover:text-gray-700 transition-colors"
                >
                  {selectedOrders.size === orders.length ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Net Profit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order, index) => (
              <tr 
                key={order.id}
                className={selectedOrders.has(order.id) ? 'bg-blue-50' : ''}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleOrderSelection(order.id)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {selectedOrders.has(order.id) ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {orders.length - index}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    {order.customerName ? (
                      <>
                        <User className="h-4 w-4 mr-1" />
                        {order.customerName}
                      </>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 space-y-1">
                    {order.items.map((item, index) => (
                      <div key={`${order.id}-${item.product.id}-${index}`}>
                        {item.product.name} x{item.quantity}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {order.total.toFixed(2)} SAR
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {order.netProfit.toFixed(2)} SAR
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-indigo-600 hover:text-indigo-900 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => navigate(`/calculator?edit=${order.id}`)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="Edit Order"
                    >
                      <PenSquare className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete(order.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Delete Order"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};