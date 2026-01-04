import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, PenSquare, Loader2, User, CheckSquare, Square, Eye, Hash } from 'lucide-react';
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
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-900/50 rounded-xl p-4 text-red-200">
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
        <div className="bg-[#1C1F26] p-4 rounded-xl border border-gray-800 flex items-center justify-between shadow-lg">
          <span className="text-sm text-gray-300">
            {selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBatchDelete}
              className="flex items-center px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </button>
          </div>
        </div>
      )}



      <div className="bg-[#1C1F26] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-[#13151A]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400">
                  <button
                    onClick={toggleAllOrders}
                    className="flex items-center hover:text-white transition-colors"
                  >
                    {selectedOrders.size === orders.length ? (
                      <CheckSquare className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  No.
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Order Number
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Net Profit
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {orders.map((order, index) => (
                <tr
                  key={order.id}
                  className={`hover:bg-white/5 transition-colors ${selectedOrders.has(order.id) ? 'bg-blue-500/10' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleOrderSelection(order.id)}
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      {selectedOrders.has(order.id) ? (
                        <CheckSquare className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-300">
                      {orders.length - index}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-white">
                      {order.orderNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-300">
                      {order.customerName ? (
                        <>
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          {order.customerName}
                        </>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-400">
                      {new Date(order.date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300 space-y-1">
                      {order.items.map((item, index) => (
                        <div key={`${order.id}-${item.product.id}-${index}`} className="flex flex-col">
                          <span>{item.product.name} <span className="text-gray-500">x{item.quantity}</span></span>
                          {item.product.sku && (
                            <div className="flex items-center text-xs text-gray-600">
                              <Hash className="h-3 w-3 mr-1" />
                              <span>{item.product.sku}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-white">
                      {order.total.toFixed(2)} SAR
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${order.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {order.netProfit.toFixed(2)} SAR
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => navigate(`/calculator?edit=${order.id}`)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Edit Order"
                      >
                        <PenSquare className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onDelete(order.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
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
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};