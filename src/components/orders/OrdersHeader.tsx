import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { ImportExportButtons } from '../ImportExportButtons';
import { useOrders } from '../../hooks/useOrders';

export const OrdersHeader: React.FC = () => {
  const { orders } = useOrders();

  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
        <p className="text-gray-400">Manage and track all your customer orders</p>
      </div>

      <div className="flex gap-4">
        <ImportExportButtons orders={orders} />

        <Link
          to="/calculator"
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all font-medium shadow-lg shadow-blue-600/20"
        >
          <Plus className="h-5 w-5" />
          <span>New Order</span>
        </Link>
      </div>
    </div>
  );
};