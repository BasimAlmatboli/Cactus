import React, { useState, useEffect } from 'react';
import { getOrders, deleteOrder, saveOrder } from '../data/orders';
import { Trash2, Plus, PenSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Order } from '../types';
import { ImportExportButtons } from '../components/ImportExportButtons';

export const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedOrders = getOrders();
      setOrders(loadedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        deleteOrder(orderId);
        loadOrders(); // Reload orders after deletion
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order. Please try again.');
      }
    }
  };

  const handleEditOrder = (orderId: string) => {
    navigate(`/calculator?edit=${orderId}`);
  };

  const handleOrdersImported = (importedOrders: Order[]) => {
    try {
      importedOrders.forEach(order => {
        saveOrder(order);
      });
      loadOrders();
      alert('Orders imported successfully!');
    } catch (error) {
      console.error('Error saving imported orders:', error);
      alert('Error saving imported orders. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatCurrency = (value: number | null | undefined): string => {
    if (value == null) return '0.00 SAR';
    return `${value.toFixed(2)} SAR`;
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">Loading orders...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Orders</h1>
          <div className="flex gap-4">
            <ImportExportButtons 
              orders={orders}
              onOrdersImported={handleOrdersImported}
            />
            <Link
              to="/calculator"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Order</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Number
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
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <div key={item.product.id}>
                          {item.product.name} x{item.quantity}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(order.netProfit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEditOrder(order.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit order"
                      >
                        <PenSquare className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete order"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No orders found. Create your first order!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};