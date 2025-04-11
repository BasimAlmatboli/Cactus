import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { ImportExportButtons } from '../ImportExportButtons';
import { useOrders } from '../../hooks/useOrders';

interface OrdersHeaderProps {
  onOrdersImported: () => Promise<void>;
}

export const OrdersHeader: React.FC<OrdersHeaderProps> = ({ onOrdersImported }) => {
  const { orders } = useOrders();

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Orders</h1>
      
      <div className="flex gap-4">
        <ImportExportButtons 
          orders={orders}
          onOrdersImported={onOrdersImported}
        />
        
        <Link
          to="/calculator"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>New Order</span>
        </Link>
      </div>
    </div>
  );
};