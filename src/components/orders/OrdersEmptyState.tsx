import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, ShoppingBag } from 'lucide-react';

export const OrdersEmptyState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
      <p className="mt-1 text-sm text-gray-500">
        Get started by creating a new order.
      </p>
      <div className="mt-6">
        <Link
          to="/calculator"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Order
        </Link>
      </div>
    </div>
  );
};